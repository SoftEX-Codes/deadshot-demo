-- Shared catalogue and staff-only publishing. Run in a NEW Supabase project.
-- No customer or user metadata can grant employee access.
begin;
create table public.employees (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'editor' check (role in ('editor','admin')),
 created_at timestamptz not null default now()
);
alter table public.employees enable row level security;
revoke all on public.employees from anon, authenticated;
grant select on public.employees to authenticated;
create policy employee_reads_own_role on public.employees for select to authenticated
 using (user_id = (select auth.uid()));

create table public.devices (
 id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id)<=80),
 status text not null default 'draft' check (status in ('draft','published')),
 payload jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint device_payload_valid check (
  jsonb_typeof(payload)='object' and payload ?& array['id','name','brand','category','family','price','chip','display','refresh','memory','battery','charging','description','image']
  and payload->>'id'=id and length(payload->>'name') between 1 and 150
  and payload->>'category' in ('phone','tablet')
  and payload->>'family' in ('redmagic','iqoo','oneplus','ace','legion','redmi','infinix','other')
  and jsonb_typeof(payload->'price')='number'
  and (payload->>'price')::numeric between 1 and 100000000
  and (payload->>'price')::numeric=trunc((payload->>'price')::numeric)
  and octet_length(payload::text)<30000
  and ((status='draft' and payload->>'image'='') or payload->>'image' ~ '^https://' or payload->>'image' ~ '^assets/[a-z0-9-]+\.(webp|png|jpg|svg)$')
 )
);
create index devices_status_created_idx on public.devices(status,created_at);
alter table public.devices enable row level security;
revoke all on public.devices from anon, authenticated;
grant select on public.devices to anon, authenticated;
grant insert,update on public.devices to authenticated;
create policy public_reads_published on public.devices for select to anon using(status='published');
create policy customer_or_staff_reads on public.devices for select to authenticated
 using(status='published' or exists(select 1 from public.employees where user_id=(select auth.uid())));
create policy staff_inserts on public.devices for insert to authenticated
 with check(exists(select 1 from public.employees where user_id=(select auth.uid())));
create policy staff_updates on public.devices for update to authenticated
 using(exists(select 1 from public.employees where user_id=(select auth.uid())))
 with check(exists(select 1 from public.employees where user_id=(select auth.uid())));
-- Security invoker; no elevated privileges.
create function public.touch_device() returns trigger language plpgsql set search_path='' as $$
begin
 if new.id<>old.id then raise exception 'Device IDs are immutable'; end if;
 new.created_at=old.created_at;
 new.updated_at=clock_timestamp();
 return new;
end;
$$;
revoke execute on function public.touch_device() from public, anon, authenticated;
create trigger devices_updated before update on public.devices for each row execute function public.touch_device();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('device-images','device-images',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy staff_uploads_device_photos on storage.objects for insert to authenticated
 with check(bucket_id='device-images' and exists(select 1 from public.employees where user_id=(select auth.uid())));
-- Immutable random filenames avoid overwrite races; public bucket supports read URLs.
create policy staff_reads_device_photos on storage.objects for select to authenticated
 using(bucket_id='device-images' and exists(select 1 from public.employees where user_id=(select auth.uid())));
commit;
