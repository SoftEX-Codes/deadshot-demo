import {devices,catalogueError,cloudEnabled,getClient} from './store.js?v=5';
import {money} from './devices-data.js?v=5';
import {getCart,addToCart,setQuantity,cartSummary} from './cart-state.js?v=5';
import {imageFor} from './device-utils.js?v=5';
import {config} from './site-config.js?v=5';
import {answerQuestion} from './assistant-core.js?v=5';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const toast=make('div','shop-toast');toast.setAttribute('role','status');document.body.append(toast);let toastTimer;
export function notify(text){toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);}
function count(){document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=String(getCart().reduce((n,r)=>n+r.quantity,0)));}
count();window.addEventListener('cartchange',count);window.addEventListener('storage',e=>{if(e.key==='deadshot-cart-v1'){count();renderCart();}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-add-cart]');if(!b)return;const d=devices.find(d=>d.id===b.dataset.addCart);if(!d)return;try{addToCart(d.id);notify(d.name+' added to your cart.');}catch{notify('Your browser could not save the cart. Check storage settings.');}});
if(catalogueError){const notice=make('p','connection-note',catalogueError);notice.setAttribute('role','alert');document.querySelector('main')?.prepend(notice);}
if(!cloudEnabled){try{if(localStorage.getItem('deadshot-catalogue-preview-v1')){const n=make('p','preview-strip','Local catalogue preview: your edits appear only in this browser.');document.querySelector('main')?.prepend(n);}}catch{}}
function renderCart(){
  const host=document.querySelector('#cart-items');if(!host)return;
  host.replaceChildren();const lines=cartSummary(getCart(),devices);
  document.querySelector('#cart-empty').hidden=lines.length>0;document.querySelector('#cart-layout').hidden=!lines.length;
  let total=0;const available=[];
  for(const row of lines){
    const d=row.device,item=make('article','cart-item'),details=make('div','cart-item-info');
    const image=make('img');image.src=d?imageFor(d):'assets/redmagic-10-pro.svg';image.alt=d?d.name:'Unlisted device';image.width=110;image.height=110;
    const name=make('a','cart-name',d?d.name:'Device no longer listed');if(d)name.href='device.html?id='+encodeURIComponent(d.id);
    details.append(name,make('p','',d?d.memory:'Remove this item or contact the team.'),make('strong','',d?money(d.price)+' each':'Unavailable'));
    const controls=make('div','cart-quantity'),minus=make('button','','−'),plus=make('button','','+'),qty=make('span','',String(row.quantity));
    minus.type=plus.type='button';minus.setAttribute('aria-label','Decrease quantity of '+(d?.name||row.id));plus.setAttribute('aria-label','Increase quantity of '+(d?.name||row.id));
    minus.disabled=row.quantity<=1;plus.disabled=row.quantity>=99||!d;
    const change=n=>{try{setQuantity(row.id,n);renderCart();}catch{notify('The cart could not be saved.');}};
    minus.addEventListener('click',()=>change(row.quantity-1));plus.addEventListener('click',()=>change(row.quantity+1));
    controls.append(minus,qty,plus);
    const remove=make('button','remove-item','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+(d?.name||row.id));remove.addEventListener('click',()=>change(0));
    const side=make('div','cart-item-side');side.append(make('strong','',d?money(d.price*row.quantity):'—'),controls,remove);item.append(image,details,side);host.append(item);
    if(d){total+=d.price*row.quantity;available.push(row);}
  }
  document.querySelector('#cart-total').textContent=money(total);document.querySelector('#cart-item-count').textContent=String(lines.reduce((n,r)=>n+r.quantity,0));
  const link=document.querySelector('#cart-enquire');link.hidden=!available.length||available.length!==lines.length;
  link.href='https://wa.me/2348146758428?text='+encodeURIComponent('Hi Deadshot Gadgets, please confirm actual prices and availability for my enquiry:\n'+available.map(r=>r.quantity+' × '+r.device.name+' ('+r.device.memory+') — demo '+money(r.device.price*r.quantity)).join('\n')+'\nIllustrative total: '+money(total)+'. I understand these are demo prices, not a confirmed order.');
}
renderCart();
// Instant catalogue answers run locally; unknown questions are handed to the shop.
const launch=make('button','assistant-launch','Ask about a device');launch.type='button';launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','device-assistant');
const dialog=make('dialog','assistant-panel');dialog.id='device-assistant';dialog.setAttribute('aria-labelledby','assistant-title');
const head=make('div','assistant-head'),heading=make('div');const title=make('h2','','DEVICE ASSISTANT');title.id='assistant-title';heading.append(title,make('p','','Catalogue answers. Human help when needed.'));
const close=make('button','icon-button','×');close.type='button';close.setAttribute('aria-label','Close device assistant');head.append(heading,close);
const log=make('div','assistant-log');log.setAttribute('role','log');log.setAttribute('aria-label','Device assistant conversation');log.setAttribute('aria-live','polite');
const quick=make('div','assistant-quick');for(const q of ['Phones under ₦900k','Compare iQOO 13 vs OnePlus 13','Contact the team']){const b=make('button','',q);b.type='button';b.addEventListener('click',()=>ask(q));quick.append(b);}
const form=make('form','assistant-form'),input=make('input');input.type='text';input.maxLength=500;input.placeholder='Ask about specs, prices or your budget';input.setAttribute('aria-label','Your device question');input.required=true;
const send=make('button','','Send');send.type='submit';form.append(input,send);
const note=make('p','assistant-footnote','Answers use the listed specs and demo prices. Exact FPS, stock and delivery need confirmation.');
if(cloudEnabled&&config.assistantFunction)note.textContent='AI answers for signed-in customers; catalogue guide for guests. Questions sent to the AI service. Prices are demo values.';
dialog.append(head,log,quick,form,note);document.body.append(launch,dialog);
let lastId=new URLSearchParams(location.search).get('id')||'';
function message(text,who='assistant'){const p=make('div','chat-message '+who,text);log.append(p);while(log.children.length>40)log.firstElementChild.remove();return p;}
message('Tell me a model or a budget. I can help with listed specifications and demo prices.');
let asking=false;
async function ask(question){
  if(asking)return;
  const q=String(question).trim().slice(0,500);if(!q)return;message(q,'customer');input.value='';
  let answer=answerQuestion(q,devices,lastId);
  if(cloudEnabled&&config.assistantFunction){
    asking=true;send.disabled=true;const pending=message('Checking the catalogue…');
    try{const client=await getClient();const {data:{session}}=await client.auth.getSession();if(session){const {data,error}=await client.functions.invoke(config.assistantFunction,{body:{question:q,deviceId:lastId},signal:AbortSignal.timeout(22000)});if(!error&&data&&typeof data.text==='string'&&Array.isArray(data.ids)){answer={...data,ids:data.ids.filter(id=>devices.some(d=>d.id===id)),lastId:data.lastId||lastId};}}}catch{}finally{pending.remove();asking=false;send.disabled=false;}
  }
  lastId=answer.lastId;const reply=message(answer.text);if(answer.ai)reply.append(make('small','ai-label','AI answer · verify key details with the team.'));
  for(const id of answer.ids.slice(0,4)){const d=devices.find(d=>d.id===id),a=make('a','chat-device-link','View '+d.name);a.href='device.html?id='+encodeURIComponent(id);reply.append(a);}
  if(answer.refer){const a=make('a','chat-whatsapp','Ask on WhatsApp · +234 814 675 8428');a.href='https://wa.me/2348146758428?text='+encodeURIComponent('Hi Deadshot Gadgets, I need help with: '+q);a.target='_blank';a.rel='noopener noreferrer';reply.append(a);}
  log.scrollTop=log.scrollHeight;
}
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
launch.addEventListener('click',()=>{if(dialog.open)dialog.close();else{dialog.show();input.focus();}launch.setAttribute('aria-expanded',String(dialog.open));});
close.addEventListener('click',()=>{dialog.close();launch.setAttribute('aria-expanded','false');launch.focus();});
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){dialog.close();launch.setAttribute('aria-expanded','false');launch.focus();}});
