import fs from 'node:fs';
import {devices,money} from '../devices-data.js';
import {cloudEnabled} from '../site-config.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(d){
 const id=escape(d.id),name=escape(d.name),price=escape(money(d.price));
 return `<article class="device-card"><a class="device-card-link" href="device.html?id=${encodeURIComponent(d.id)}" aria-label="${name} — ${price} demo price. View details."><div class="card-visual"><span class="card-type">GAMING ${d.category==='tablet'?'TABLET':'PHONE'}</span><img src="${escape(d.image)}" alt="${name}" width="500" height="500" loading="lazy" decoding="async"><span class="card-3d">VIEW DEVICE</span></div><div class="card-content"><p class="card-brand">${escape(d.brand.toUpperCase())}</p><h3>${name}</h3><p class="card-spec">${escape(d.chip)} · ${escape(d.refresh)}</p><div class="card-bottom"><div class="card-price"><small>DEMO PRICE</small><strong>${price}</strong></div><span class="card-action">↗</span></div></div></a><button class="quick-add" type="button" data-add-cart="${id}" aria-label="Add ${name} to cart" hidden>+ Add to cart</button></article>`;
}
const data=cloudEnabled?[]:devices;
for(const [file,id,list] of [
 ['index.html','featured-grid',['redmagic-10-pro','iqoo-13','legion-tab-gen-3'].map(id=>data.find(d=>d.id===id)).filter(Boolean)],
 ['devices.html','device-grid',data]
]){
 const path=new URL('../'+file,import.meta.url);let html=fs.readFileSync(path,'utf8');
 const start=`<!-- static:${id} -->`,end=`<!-- /static:${id} -->`;
 if(!html.includes(start))html=html.replace(new RegExp(`(<div id="${id}"[^>]*>)(</div>)`),`$1${start}${end}$2`);
 if(!html.includes(start))throw new Error('Missing static catalogue marker: '+id);
 html=html.replace(new RegExp(`${start}[\\s\\S]*?${end}`),()=>start+list.map(card).join('')+end);
 for(const category of ['phone','tablet']){
  const values=data.filter(d=>d.category===category).map(d=>d.price);
  const from=values.length?money(Math.min(...values)):'enquire for details';
  const range=values.length?money(Math.min(...values))+'–'+money(Math.max(...values)):'enquire for details';
  html=html.replace(new RegExp(`(data-price-from="${category}">)[^<]*`,'g'),(_,tag)=>tag+escape(from));
  html=html.replace(new RegExp(`(data-price-range="${category}">)[^<]*`,'g'),(_,tag)=>tag+escape(range));
 }
 if(file==='devices.html')html=html.replace(/(<p id="device-count"[^>]*>)[^<]*/,(_,tag)=>tag+(data.length?`${data.length} / ${data.length} devices`:'Loading devices…'));
 fs.writeFileSync(path,html);
}
console.log(cloudEnabled?'Removed static demo cards for the shared catalogue.':`Rendered ${devices.length} priced catalogue cards and 3 homepage cards.`);
