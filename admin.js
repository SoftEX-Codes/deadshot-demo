import {cloudEnabled,employee,readDevices,saveDevice,uploadImage,signOut,resetPreview} from './store.js?v=5';
import {money} from './devices-data.js?v=5';
import {imageFor,safeImage} from './device-utils.js?v=5';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const root=document.querySelector('#admin-workspace'),form=document.querySelector('#device-editor'),notice=document.querySelector('#admin-status');
let rows=[],current=null,dirty=false,busy=false,upload=null;
function say(text,error=false){notice.textContent=text;notice.classList.toggle('error',error);}
function field(name){return form.elements.namedItem(name);}
function pending(value){dirty=value;document.querySelector('#unsaved-status').textContent=value?'Unsaved changes':'All changes saved';}
function list(){
  const query=document.querySelector('#admin-search').value.trim().toLowerCase(),filter=document.querySelector('#admin-filter').value,host=document.querySelector('#admin-list');host.replaceChildren();
  const visible=rows.filter(d=>(filter==='all'||d.status===filter)&&(d.name+' '+d.brand).toLowerCase().includes(query));
  document.querySelector('#admin-count').textContent=rows.length+' devices · '+rows.filter(d=>d.status==='published').length+' published';
  document.querySelector('#admin-list-empty').hidden=visible.length>0;
  for(const d of visible){
    const b=make('button','admin-row');b.type='button';b.setAttribute('aria-label','Edit '+d.name);
    const img=make('img');img.src=imageFor(d);img.alt='';img.width=54;img.height=60;img.loading='lazy';
    const text=make('span');text.append(make('strong','',d.name),make('small','',money(d.price)+' · '+d.status));b.append(img,text,make('span','','Edit ↗'));
    b.addEventListener('click',()=>{if(dirty&&!confirm('Discard unsaved changes and open this device?'))return;edit(d);});host.append(b);
  }
}
function specRow(label='',value=''){
  const row=make('div','extra-spec-row'),a=make('input'),b=make('input'),remove=make('button','','Remove');
  a.placeholder='Specification name';a.setAttribute('aria-label','Extra specification name');a.maxLength=80;a.value=label;
  b.placeholder='Value';b.setAttribute('aria-label','Extra specification value');b.maxLength=400;b.value=value;
  remove.type='button';remove.addEventListener('click',()=>{row.remove();pending(true);});row.append(a,b,remove);document.querySelector('#extra-specs').append(row);
}
function previewImage(){const src=safeImage(field('image').value,true);const img=document.querySelector('#editor-photo');img.hidden=!src;img.src=src||'assets/redmagic-10-pro.svg';}
function edit(d=null){
  form.reset();delete field('id').dataset.manual;current=d;upload=null;document.querySelector('#extra-specs').replaceChildren();
  const values=d||{category:'phone',family:'redmagic',status:'draft',color:'#707b71',cameras:'round',region:'Confirm version'};
  for(const [key,value]of Object.entries(values)){const e=field(key);if(e&&typeof value!=='object')e.value=value;}
  field('id').readOnly=!!d;document.querySelector('#editor-title').textContent=d?'EDIT DEVICE.':'NEW DEVICE.';
  (d?.specs||[]).forEach(s=>specRow(s.label,s.value));pending(false);previewImage();
  const link=document.querySelector('#preview-device');link.hidden=!d||d.status!=='published';if(d)link.href='device.html?id='+encodeURIComponent(d.id);
  document.querySelector('#image-help').textContent='JPG, PNG or WebP, up to 5 MB. Images are resized for fast loading.';
  document.querySelector('#save-device').textContent=field('status').value==='published'?'Publish changes':'Save draft';
}
try{
  const user=await employee();
  if(!user){document.querySelector('#admin-gate').hidden=false;}
  else{
    root.hidden=false;document.querySelector('#admin-user').textContent=user.email;
    document.querySelector('#admin-mode').textContent=user.preview?'LOCAL PREVIEW':'SHARED CATALOGUE';
    document.querySelector('#admin-preview-notice').hidden=!user.preview;
    document.querySelector('#reset-preview').hidden=!user.preview;
    rows=await readDevices(true);list();edit(rows.find(d=>d.id===new URLSearchParams(location.search).get('id'))||rows[0]||null);
  }
}catch(error){document.querySelector('#admin-gate').hidden=false;document.querySelector('#gate-message').textContent='Unable to load employee access. Please sign in again.';}
document.querySelector('#admin-search').addEventListener('input',list);document.querySelector('#admin-filter').addEventListener('change',list);
document.querySelector('#new-device').addEventListener('click',()=>{if(dirty&&!confirm('Discard the unsaved changes?'))return;edit();form.scrollIntoView({behavior:'smooth',block:'start'});field('name').focus();});
form.addEventListener('input',()=>pending(true));
field('name').addEventListener('input',()=>{if(!current&&!field('id').dataset.manual)field('id').value=field('name').value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);});
field('id').addEventListener('input',()=>field('id').dataset.manual='yes');
field('status').addEventListener('change',()=>{document.querySelector('#save-device').textContent=field('status').value==='published'?'Publish changes':'Save draft';pending(true);});
field('image').addEventListener('change',()=>{upload=null;previewImage();});
document.querySelector('#add-spec').addEventListener('click',()=>{if(document.querySelector('#extra-specs').children.length<20){specRow();pending(true);}});
document.querySelector('#image-upload').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Choose a JPG, PNG or WebP image smaller than 5 MB.');
    const bitmap=await createImageBitmap(file),ratio=Math.min(1,1000/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    upload=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.86));if(!upload)throw new Error('This image could not be read.');
    const reader=new FileReader();reader.onload=()=>{field('image').value=reader.result;previewImage();pending(true);document.querySelector('#image-help').textContent='Image ready. Save the device to upload it.';};reader.readAsDataURL(upload);
  }catch(error){say(error.message,true);e.target.value='';}
});
form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;busy=true;document.querySelector('#save-device').disabled=true;say('Saving…');
  try{
    if(current?.status==='published'&&field('status').value==='draft'&&!confirm('Save as a draft and remove this device from the public catalogue?')){say('Save cancelled.');return;}
    const input=Object.fromEntries(new FormData(form));
    input.photoSource=current?.photoSource||'';
    input.specs=[...document.querySelectorAll('.extra-spec-row')].map(row=>({label:row.querySelectorAll('input')[0].value,value:row.querySelectorAll('input')[1].value}));
    if(upload)input.image=await uploadImage(upload);
    const saved=await saveDevice(input,current?current._version:null,!current);
    rows=await readDevices(true);list();edit(saved);
    say(cloudEnabled?(saved.status==='published'?'Published. Customers can now see this device.':'Draft saved. It is hidden from the public catalogue.'):(saved.status==='published'?'Saved to your local demo catalogue. This does not publish for other visitors.':'Draft saved in this browser only.'));
  }catch(error){say(error.name==='QuotaExceededError'?'Browser storage is full. Use an image URL or connect the shared store.':error.message,true);}
  finally{busy=false;document.querySelector('#save-device').disabled=false;}
});
document.querySelector('#admin-signout').addEventListener('click',async()=>{if(dirty&&!confirm('Discard unsaved changes and sign out?'))return;try{await signOut();dirty=false;location.href='login.html?role=employee';}catch(error){say(error.message,true);}});
document.querySelector('#reset-preview').addEventListener('click',async()=>{if(confirm('Reset only this browser’s demo edits to the original catalogue?')){resetPreview();rows=await readDevices(true);list();edit();say('Local preview reset.');}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
