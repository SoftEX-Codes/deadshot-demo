import {devices as seed} from './devices-data.js?v=6';
import {config, cloudEnabled} from './site-config.js?v=6';
import {cleanDevice} from './device-utils.js?v=6';
export {cloudEnabled};
const localKey = 'deadshot-catalogue-preview-v1';
const initial = () => seed.map(d => ({...d,image:d.image||'assets/'+d.id+'.svg',status:'published',specs:d.specs||[],_version:null}));
let clientPromise;
export async function getClient() {
  if (!cloudEnabled) return null;
  if (!clientPromise) clientPromise = new Promise((resolve,reject)=>{
    if(window.supabase){resolve(window.supabase);return;}
    const script=document.createElement('script');script.src='vendor/supabase-2.116.0.js';script.async=true;script.onload=()=>window.supabase?resolve(window.supabase):reject(new Error('Account SDK unavailable'));script.onerror=()=>reject(new Error('Account SDK failed to load'));document.head.append(script);
  }).then(sdk=>sdk.createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})).catch(error=>{clientPromise=null;throw error;});
  return clientPromise;
}
function localRows() {
  try { const saved = JSON.parse(localStorage.getItem(localKey)); if (Array.isArray(saved)) return saved.map(d => ({...cleanDevice(d),_version:d._version})); } catch {}
  return initial();
}
export function inPreview() { try { return !cloudEnabled && sessionStorage.getItem('deadshot-admin-preview') === 'yes'; } catch { return false; } }
export function enterPreview() { if (cloudEnabled) throw new Error('Preview mode is unavailable with the shared store connected.'); sessionStorage.setItem('deadshot-admin-preview','yes'); }
export async function employee() {
  const client = await getClient();
  if (!client) return inPreview() ? {preview:true,role:'preview',email:'Local demo workspace'} : null;
  const {data:{user},error} = await client.auth.getUser();
  if (error || !user) return null;
  const {data,error:roleError} = await client.from('employees').select('role').eq('user_id',user.id).maybeSingle();
  if (roleError) throw roleError;
  return data ? {...user,role:data.role,preview:false} : null;
}
export async function readDevices(includeDrafts = false) {
  if (!cloudEnabled) return localRows().filter(d => includeDrafts || d.status === 'published');
  const client = await getClient();
  let query = client.from('devices').select('id,status,payload,updated_at').order('created_at');
  if (!includeDrafts) query = query.eq('status','published');
  const {data,error} = await query;
  if (error) throw error;
  return data.map(row => ({...cleanDevice({...row.payload,id:row.id,status:row.status}),_version:row.updated_at}));
}
export async function saveDevice(input, version, isNew) {
  const d = cleanDevice(input);
  if (!await employee()) throw new Error('Employee access is required.');
  if (!cloudEnabled) {
    const rows = localRows(),index = rows.findIndex(x=>x.id===d.id);
    if (isNew && index >= 0) throw new Error('That device ID is already in use.');
    if (!isNew && (index < 0 || rows[index]._version !== version)) throw new Error('This device changed in another tab. Reload it before saving.');
    const saved = {...d,_version:crypto.randomUUID()};
    if (index >= 0) rows[index] = saved; else rows.push(saved);
    localStorage.setItem(localKey,JSON.stringify(rows));
    return saved;
  }
  const client = await getClient(),row = {id:d.id,status:d.status,payload:d};
  let query = isNew ? client.from('devices').insert(row) : client.from('devices').update(row).eq('id',d.id).eq('updated_at',version);
  const {data,error} = await query.select('id,status,payload,updated_at').maybeSingle();
  if (error) throw new Error(error.code === '23505' ? 'That device ID is already in use.' : error.message);
  if (!data) throw new Error('This device changed elsewhere. Reload it before saving.');
  return {...d,_version:data.updated_at};
}
export async function uploadImage(blob) {
  if (!await employee()) throw new Error('Employee access is required.');
  if (!cloudEnabled) return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
  const client=await getClient(),path=crypto.randomUUID()+'.webp';
  const {error}=await client.storage.from('device-images').upload(path,blob,{contentType:'image/webp',cacheControl:'31536000',upsert:false});
  if (error) throw error;
  return client.storage.from('device-images').getPublicUrl(path).data.publicUrl;
}
export async function signOut() {
  if (cloudEnabled) { const client=await getClient(); const {error}=await client.auth.signOut(); if(error)throw error; }
  else sessionStorage.removeItem('deadshot-admin-preview');
}
export function resetPreview() { if(cloudEnabled || !inPreview())throw new Error('Unavailable');localStorage.removeItem(localKey); }
export let catalogueError = '';
export const devices = await readDevices().catch(error => {catalogueError='The catalogue is temporarily unavailable. Please refresh or contact us on WhatsApp.';console.error('Catalogue load failed',error.message);return [];});
