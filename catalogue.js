import {employee,devices,catalogueError} from './store.js?v=6';
import {money} from './devices-data.js?v=6';
import {imageFor,safeLink} from './device-utils.js?v=6';
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
function card(d){
 const article=el('article','device-card'),a=el('a','device-card-link');a.href='device.html?id='+encodeURIComponent(d.id);a.setAttribute('aria-label',d.name+' — '+money(d.price)+' demo price. View details.');
 const visual=el('div','card-visual'),img=el('img');img.src=imageFor(d);img.alt=d.name;img.width=500;img.height=500;img.loading='lazy';img.decoding='async';
 visual.append(el('span','card-type',d.category==='tablet'?'GAMING TABLET':'GAMING PHONE'),img,el('span','card-3d','VIEW DEVICE'));
 const body=el('div','card-content');body.append(el('p','card-brand',d.brand.toUpperCase()),el('h3','',d.name),el('p','card-spec',d.chip+' · '+d.refresh));
 const bottom=el('div','card-bottom'),price=el('div','card-price');price.append(el('small','','DEMO PRICE'),el('strong','',money(d.price)));bottom.append(price,el('span','card-action','↗'));body.append(bottom);a.append(visual,body);
 const button=el('button','quick-add','+ Add to cart');button.type='button';button.dataset.addCart=d.id;button.setAttribute('aria-label','Add '+d.name+' to cart');article.append(a,button);return article;
}
function fillGrid(target,list){if(target)target.replaceChildren(...list.map(card));}
fillGrid(document.querySelector('#featured-grid'),['redmagic-10-pro','iqoo-13','legion-tab-gen-3'].map(id=>devices.find(d=>d.id===id)).filter(Boolean));
for(const e of document.querySelectorAll('[data-total-devices]'))e.textContent=String(devices.length);
for(const e of document.querySelectorAll('[data-type-count]'))e.textContent=String(devices.filter(d=>d.category===e.dataset.typeCount).length).padStart(2,'0');
const grid=document.querySelector('#device-grid');
if(grid){
 const allowed=['all','phone','tablet','redmagic','iqoo','oneplus','ace','legion','redmi','infinix','other'];
 const params=new URLSearchParams(location.search);let category=allowed.includes(params.get('category'))?params.get('category'):'all';
 const search=document.querySelector('#device-search'),sort=document.querySelector('#device-sort');search.value=params.get('q')||'';if(['featured','price-asc','price-desc','name'].includes(params.get('sort')))sort.value=params.get('sort');
 function render(animate=false){
  const q=search.value.trim().toLowerCase(),list=devices.filter(d=>(category==='all'||d.category===category||d.family===category)&&[d.name,d.brand,d.family,d.chip].join(' ').toLowerCase().includes(q));
  if(sort.value==='price-asc')list.sort((a,b)=>a.price-b.price);if(sort.value==='price-desc')list.sort((a,b)=>b.price-a.price);if(sort.value==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  fillGrid(grid,list);document.querySelector('#catalogue-empty').hidden=!!list.length||!!catalogueError;
  document.querySelector('#device-count').textContent=String(list.length).padStart(2,'0')+' / '+devices.length+' devices';
  document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category));});
  const url=new URL(location.href);url.search='';if(category!=='all')url.searchParams.set('category',category);if(q)url.searchParams.set('q',search.value.trim());if(sort.value!=='featured')url.searchParams.set('sort',sort.value);history.replaceState(null,'',url);
  if(animate)window.deadshotMotion?.reveal(grid,0,850);
 }
 document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;render(true);}));search.addEventListener('input',()=>render());sort.addEventListener('change',()=>render(true));
 document.querySelector('#clear-filters').addEventListener('click',()=>{category='all';search.value='';sort.value='featured';render(true);search.focus();});render();
}
const title=document.querySelector('#detail-name');
if(title){
 const id=new URLSearchParams(location.search).get('id')||devices[0]?.id,d=devices.find(d=>d.id===id);
 if(!d){const main=document.querySelector('#main-content');main.replaceChildren();const error=el('section','error-state');error.append(el('p','eyebrow','DEVICE NOT FOUND'),el('h1','','Try the collection.'),el('p','','This device is not currently listed.'));const link=el('a','button button-primary','Explore gaming devices');link.href='devices.html';error.append(link);main.append(error);document.title='Device not found — Deadshot Gadgets';}
 else{
  document.title=d.name+' — Deadshot Gadgets';title.textContent=d.name;document.querySelector('#breadcrumb-name').textContent=d.name;
  document.querySelector('#detail-category').textContent=d.brand.toUpperCase()+' / '+(d.category==='tablet'?'GAMING TABLET':'GAMING PHONE');document.querySelector('#detail-tag').textContent=d.tag;document.querySelector('#detail-description').textContent=d.description;document.querySelector('#device-price').textContent=money(d.price);
  const specs=[['Processor',d.chip],['Display',d.display],['Refresh rate',d.refresh],['RAM / storage',d.memory],['Battery',d.battery],['Charging',d.charging],['Version',d.region],...(d.specs||[]).map(s=>[s.label,s.value]),['Availability','Demo listing — enquire for stock']];
  const dl=document.querySelector('#device-specs');specs.forEach(([k,v])=>{const row=el('div');row.append(el('dt','',k),el('dd','',v));dl.append(row);});
  const highlights=document.querySelector('#spec-highlights');[[d.refresh,'DISPLAY'],[d.memory.split(' / ')[0],'RAM'],[d.battery.replace('mAh',''),'mAh BATTERY']].forEach(([v,k])=>{const item=el('div');item.append(el('strong','',v),el('small','',k));highlights.append(item);});
  const source=document.querySelector('#spec-source');source.hidden=!safeLink(d.source);source.href=safeLink(d.source);const photo=document.querySelector('#device-photo');photo.src=imageFor(d);photo.alt=d.name+' product photograph';document.querySelector('#photo-brand').textContent=d.brand;
  const photoSource=document.querySelector('#photo-source');photoSource.hidden=!safeLink(d.photoSource||d.source);photoSource.href=safeLink(d.photoSource||d.source);
  document.querySelector('#detail-add-cart').dataset.addCart=d.id;document.querySelector('#device-whatsapp').href='https://wa.me/2348146758428?text='+encodeURIComponent('Hi Deadshot Gadgets, I am interested in the '+d.name+' ('+d.memory+'). Please confirm the current price and availability.');
  const button=document.querySelector('#enquiry-button'),panel=document.querySelector('#enquiry-panel');button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)window.deadshotMotion?.reveal(panel,0,900);});
  fillGrid(document.querySelector('#related-grid'),devices.filter(x=>x.id!==d.id&&x.category===d.category).slice(0,3));
 }
}

const staffLink=document.querySelector('[data-edit-device]');if(staffLink){const id=new URLSearchParams(location.search).get('id');employee().then(user=>{if(user&&devices.some(d=>d.id===id)){staffLink.href='admin.html?id='+encodeURIComponent(id);staffLink.hidden=false;}}).catch(()=>{});}
