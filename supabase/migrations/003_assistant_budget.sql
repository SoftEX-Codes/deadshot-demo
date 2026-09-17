-- Optional authenticated AI endpoint: 30 requests/account/day, 500 total/day.
-- No chat text is stored. Only a daily counter exists; expires after two days.
begin;
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
grant usage on schema private to service_role;
create table private.assistant_budget (bucket text not null, day date not null, used integer not null, primary key(bucket,day));
alter table private.assistant_budget enable row level security;
grant select,insert,update,delete on private.assistant_budget to service_role;
create function public.consume_assistant_budget(account_id uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
declare user_count integer; global_count integer;
begin
 delete from private.assistant_budget where day<current_date-2;
 insert into private.assistant_budget(bucket,day,used) values(account_id::text,current_date,1)
 on conflict(bucket,day) do update set used=private.assistant_budget.used+1
 where private.assistant_budget.used<30 returning used into user_count;
 if user_count is null then return false; end if;
 insert into private.assistant_budget(bucket,day,used) values('global',current_date,1)
 on conflict(bucket,day) do update set used=private.assistant_budget.used+1
 where private.assistant_budget.used<500 returning used into global_count;
 return global_count is not null;
end;$$;
revoke all on function public.consume_assistant_budget(uuid) from public,anon,authenticated;
grant execute on function public.consume_assistant_budget(uuid) to service_role;
commit;
