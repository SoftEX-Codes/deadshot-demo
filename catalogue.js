import { devices, money } from './devices-data.js';
const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="2"/></svg>';
function el(tag, className, text) { const e = document.createElement(tag); if(className)e.className=className;if(text!==undefined)e.textContent=text;return e; }
function card(device) {
  const a=el('a','device-card');a.href='device.html?id='+encodeURIComponent(device.id);a.setAttribute('aria-label',device.name+' — '+money(device.price)+' demo price. View 3D and specifications.');
  const visual=el('div','card-visual');
  const img=el('img');img.src='assets/'+device.id+'.svg';img.alt=device.name+' design illustration';img.width=360;img.height=350;img.loading='lazy';img.decoding='async';
  visual.append(el('span','card-type',device.category==='tablet'?'GAMING TABLET':'GAMING PHONE'),img,el('span','card-3d','EXPLORE IN 3D'));
  const content=el('div','card-content');content.append(el('p','card-brand',device.family==='ace'?'ONEPLUS / ACE SERIES':device.brand.toUpperCase()),el('h3','',device.name),el('p','card-spec',device.chip+' · '+device.refresh+' display'));
  const bottom=el('div','card-bottom'),price=el('div','card-price'),action=el('span','card-action');price.append(el('small','','DEMO PRICE'),el('strong','',money(device.price)));action.innerHTML=arrow;bottom.append(price,action);content.append(bottom);a.append(visual,content);return a;
}
function fillGrid(target,list){if(!target)return;const f=document.createDocumentFragment();list.forEach(d=>f.append(card(d)));target.replaceChildren(f);}
fillGrid(document.querySelector('#featured-grid'),[devices[0],devices[4],devices[10]]);
const grid=document.querySelector('#device-grid');
if(grid){
  const allowed=['all','phone','tablet','redmagic','iqoo','oneplus','ace','legion'];
  const params=new URLSearchParams(location.search);
  let category=allowed.includes(params.get('category'))?params.get('category'):'all';
  const search=document.querySelector('#device-search'),sort=document.querySelector('#device-sort');
  search.value=params.get('q')||'';
  if(['featured','price-asc','price-desc','name'].includes(params.get('sort')))sort.value=params.get('sort');
  function render(animate=false){
    const query=search.value.trim().toLowerCase();
    const list=devices.filter(d=>(category==='all'||d.category===category||d.family===category)&&[d.name,d.brand,d.family,d.chip].join(' ').toLowerCase().includes(query));
    if(sort.value==='price-asc')list.sort((a,b)=>a.price-b.price);
    if(sort.value==='price-desc')list.sort((a,b)=>b.price-a.price);
    if(sort.value==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
    fillGrid(grid,list);
    document.querySelector('#catalogue-empty').hidden=!!list.length;
    document.querySelector('#device-count').textContent=String(list.length).padStart(2,'0')+' / '+devices.length+' devices';
    document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category));});
    const url=new URL(location.href);url.search='';if(category!=='all')url.searchParams.set('category',category);if(query)url.searchParams.set('q',search.value.trim());if(sort.value!=='featured')url.searchParams.set('sort',sort.value);history.replaceState(null,'',url);
    if(animate)window.deadshotMotion?.reveal(grid,0,850);
  }
  document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;render(true);}));
  search.addEventListener('input',()=>render());sort.addEventListener('change',()=>render(true));
  document.querySelector('#clear-filters').addEventListener('click',()=>{category='all';search.value='';sort.value='featured';render(true);search.focus();});render();
}
const title=document.querySelector('#detail-name');
if(title){
  const id=new URLSearchParams(location.search).get('id')||devices[0].id;
  const d=devices.find(d=>d.id===id);
  if(!d){
    const main=document.querySelector('#main-content');main.replaceChildren();const error=el('section','error-state');error.append(el('p','eyebrow','DEVICE NOT FOUND'),el('h1','','Try the collection.'),el('p','','That device is not part of this demo lineup.'));const link=el('a','button button-primary','Explore gaming devices');link.href='devices.html';error.append(link);main.append(error);document.title='Device not found — Deadshot Gadgets';
  } else {
    document.title=d.name+' — Deadshot Gadgets';title.textContent=d.name;
    document.querySelector('#breadcrumb-name').textContent=d.name;
    document.querySelector('#detail-category').textContent=d.brand.toUpperCase()+' / '+(d.category==='tablet'?'GAMING TABLET':'GAMING PHONE');
    document.querySelector('#detail-tag').textContent=d.tag;document.querySelector('#detail-description').textContent=d.description;
    document.querySelector('#device-price').textContent=money(d.price);
    const specs=[['Processor',d.chip],['Display',d.display],['Refresh rate',d.refresh],['RAM / storage',d.memory],['Battery',d.battery],['Charging',d.charging],['Version',d.region],['Availability','Demo listing — enquire for stock']];
    const dl=document.querySelector('#device-specs');specs.forEach(([name,value])=>{const row=el('div');row.append(el('dt','',name),el('dd','',value));dl.append(row);});
    const highlights=document.querySelector('#spec-highlights');[[d.refresh,'DISPLAY'],[d.memory.split(' / ')[0],'RAM'],[d.battery.replace('mAh',''),'mAh BATTERY']].forEach(([v,k])=>{const item=el('div');item.append(el('strong','',v),el('small','',k));highlights.append(item);});
    document.querySelector('#spec-source').href=d.source;
    document.querySelector('#model-label').textContent=d.name.toUpperCase();document.querySelector('.model-index').textContent='[ '+String(devices.indexOf(d)+1).padStart(2,'0')+' / 12 ]';
    const fallback=document.querySelector('#model-fallback');fallback.src='assets/'+d.id+'.svg';fallback.alt=d.name+' design illustration';document.querySelector('#phone-viewer').dataset.device=d.id;
    document.querySelector('#device-whatsapp').href='https://wa.me/2348146758428?text='+encodeURIComponent('Hi Deadshot Gadgets, I am interested in the '+d.name+' ('+d.memory+'). Please confirm the current price and availability.');
    const button=document.querySelector('#enquiry-button'),panel=document.querySelector('#enquiry-panel');button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)window.deadshotMotion?.reveal(panel,0,900);});
    fillGrid(document.querySelector('#related-grid'),devices.filter(x=>x.id!==d.id&&x.category===d.category).slice(0,3));
  }
}
