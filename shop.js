import {devices,catalogueError,cloudEnabled,getClient} from './store.js?v=6';
import {money} from './devices-data.js?v=6';
import {getCart,addToCart,setQuantity,cartSummary} from './cart-state.js?v=6';
import {imageFor} from './device-utils.js?v=6';
import {config} from './site-config.js?v=6';
import {answerQuestion} from './assistant-core.js?v=6';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const toast=make('div','shop-toast');toast.setAttribute('role','status');document.body.append(toast);let toastTimer;
export function notify(text){toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);}
function count(){document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=String(getCart().reduce((n,r)=>n+r.quantity,0)));}
count();window.addEventListener('cartchange',count);window.addEventListener('storage',e=>{if(e.key==='deadshot-cart-v1'){count();renderCart();}});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function cartFeedback(button){
  if(reducedMotion.matches)return;
  button.animate([{transform:'scale(1)'},{transform:'scale(.96)',background:'#c3f550',color:'#171916'},{transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
  document.querySelectorAll('[data-cart-count]').forEach(b=>b.animate([{transform:'scale(1)'},{transform:'scale(1.5) rotate(-8deg)'},{transform:'scale(1)'}],{duration:750,easing:'cubic-bezier(.2,.8,.2,1)'}));
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-add-cart]');if(!b)return;const d=devices.find(d=>d.id===b.dataset.addCart);if(!d)return;try{addToCart(d.id);cartFeedback(b);notify(d.name+' added to your cart.');}catch{notify('Your browser could not save the cart. Check storage settings.');}});
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
  link.href='https://wa.me/2349038237257?text='+encodeURIComponent('Hi MCOD GADGET STORE, please confirm actual prices and availability for my enquiry:\n'+available.map(r=>r.quantity+' × '+r.device.name+' ('+r.device.memory+') — demo '+money(r.device.price*r.quantity)).join('\n')+'\nIllustrative total: '+money(total)+'. I understand these are demo prices, not a confirmed order.');
}
renderCart();
// Basic answers work offline. The configured backend supplies OpenAI answers.
const launch=make('button','assistant-launch');launch.type='button';launch.setAttribute('aria-label','Chat about phones');launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','device-assistant');
const bubble=document.createElementNS('http://www.w3.org/2000/svg','svg');bubble.setAttribute('viewBox','0 0 32 32');bubble.setAttribute('aria-hidden','true');bubble.setAttribute('fill','none');
const outline=document.createElementNS(bubble.namespaceURI,'path');outline.setAttribute('d','M7 5h18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-9l-8 5v-5H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z');outline.setAttribute('stroke','currentColor');outline.setAttribute('stroke-width','2');outline.setAttribute('stroke-linejoin','round');bubble.append(outline);
for(const x of [10,16,22]){const dot=document.createElementNS(bubble.namespaceURI,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy','14');dot.setAttribute('r','1.5');dot.setAttribute('fill','currentColor');bubble.append(dot);}
launch.append(bubble,make('span','chat-tooltip','Let’s talk phones'));
const dialog=make('dialog','assistant-panel');dialog.id='device-assistant';dialog.setAttribute('aria-labelledby','assistant-title');
const head=make('div','assistant-head'),heading=make('div');const title=make('h2','','MCOD GADGET STORE CHAT');title.id='assistant-title';heading.append(title,make('p','','Phone questions. Straight answers.'));
const close=make('button','icon-button','×');close.type='button';close.setAttribute('aria-label','Close chat');head.append(heading,close);
const log=make('div','assistant-log');log.setAttribute('role','log');log.setAttribute('aria-label','Device assistant conversation');log.setAttribute('aria-live','polite');
const quick=make('div','assistant-quick');for(const q of ['RAM vs storage?','What is refresh rate?','Phones under ₦900k']){const b=make('button','',q);b.type='button';b.addEventListener('click',()=>ask(q));quick.append(b);}
const form=make('form','assistant-form'),input=make('input');input.type='text';input.maxLength=500;input.placeholder='Ask anything about phones…';input.setAttribute('aria-label','Your device question');input.required=true;
const send=make('button','','Send');send.type='submit';form.append(input,send);
const note=make('p','assistant-footnote','Basic phone guide · ChatGPT connection pending. Prices are demos. More help is available on WhatsApp.');
if(cloudEnabled&&config.assistantFunction)note.textContent='OpenAI answers for signed-in customers; basic guide for guests. AI questions go to OpenAI. Prices are demos.';
dialog.append(head,log,quick,form,note);document.body.append(launch,dialog);
let lastId=new URLSearchParams(location.search).get('id')||'';
function message(text,who='assistant'){const p=make('div','chat-message '+who,text);log.append(p);while(log.children.length>40)log.firstElementChild.remove();return p;}
message('Hey. Ask about phones, tablets, RAM, displays or charging. You can also compare listed devices or tell me your budget.');
let asking=false;
async function ask(question){
  if(asking)return;
  const q=String(question).trim().slice(0,500);if(!q)return;message(q,'customer');input.value='';
  let answer=answerQuestion(q,devices,lastId);
  if(cloudEnabled&&config.assistantFunction){
    asking=true;send.disabled=true;const pending=message('Thinking…');pending.classList.add('thinking');log.scrollTop=log.scrollHeight;
    try{const client=await getClient();const {data:{session}}=await client.auth.getSession();if(session){const {data,error}=await client.functions.invoke(config.assistantFunction,{body:{question:q,deviceId:lastId},signal:AbortSignal.timeout(22000)});if(!error&&data&&typeof data.text==='string'&&Array.isArray(data.ids)){answer={...data,ids:data.ids.filter(id=>devices.some(d=>d.id===id)),lastId:data.lastId||lastId};}}}catch{}finally{pending.remove();asking=false;send.disabled=false;}
  }
  lastId=answer.lastId;const reply=message(answer.text);reply.append(make('small','ai-label',answer.ai?'OpenAI answer · verify key details with the team.':'Basic phone guide'));
  for(const id of answer.ids.slice(0,4)){const d=devices.find(d=>d.id===id),a=make('a','chat-device-link','View '+d.name);a.href='device.html?id='+encodeURIComponent(id);reply.append(a);}
  if(answer.refer){const a=make('a','chat-whatsapp','Ask on WhatsApp · +2349038237257');a.href='https://wa.me/2349038237257?text='+encodeURIComponent('Hi MCOD GADGET STORE, I need help with: '+q);a.target='_blank';a.rel='noopener noreferrer';reply.append(a);}
  log.scrollTop=log.scrollHeight;
}
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
let closing=false;
function closeChat(){if(closing||!dialog.open)return;closing=true;dialog.classList.add('is-closing');setTimeout(()=>{dialog.close();dialog.classList.remove('is-closing');closing=false;launch.setAttribute('aria-expanded','false');launch.focus();},reducedMotion.matches?0:260);}
launch.addEventListener('click',()=>{if(dialog.open)closeChat();else{dialog.show();input.focus();launch.setAttribute('aria-expanded','true');}});
close.addEventListener('click',closeChat);
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeChat();}});
