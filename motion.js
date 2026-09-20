(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const active=new Set();
  function reveal(element,delay=0,duration=1000){
    if(!element||reduced.matches||!element.animate||navigator.connection?.saveData)return;
    const a=element.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration,delay,easing:'cubic-bezier(.2,.7,.2,1)'});active.add(a);a.finished.catch(()=>{}).finally(()=>active.delete(a));
  }
  window.mcodMotion={reveal};
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){reveal(e.target);observer.unobserve(e.target);}});},{threshold:.06});document.querySelectorAll('.section-heading,.category-panel,.about-section>div,.contact-section,.spec-section,.page-intro').forEach(e=>observer.observe(e));}
  const text=document.querySelector('#rotating-copy'),button=document.querySelector('#headline-pause');
  let index=0,timer=0,paused=reduced.matches;
  const phrases=['FOR THE NEXT LEVEL','LEVEL UP YOUR GAMING EXPERIENCE','WITH MCOD GADGET STORE'];
  function label(){if(!button)return;button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Play changing headline':'Pause changing headline');}
  function schedule(){clearTimeout(timer);if(text&&!paused&&!document.hidden)timer=setTimeout(change,4800);}
  async function change(){if(paused||document.hidden)return;const out=text.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:650,easing:'ease-in',fill:'forwards'});active.add(out);await out.finished.catch(()=>{});if(paused||document.hidden){out.cancel();active.delete(out);return;}index=(index+1)%phrases.length;text.textContent=phrases[index];out.cancel();active.delete(out);const intro=text.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:900,easing:'ease-out'});active.add(intro);intro.finished.catch(()=>{}).finally(()=>active.delete(intro));schedule();}
  if(text&&button){label();schedule();button.addEventListener('click',()=>{paused=!paused;active.forEach(a=>a.cancel());label();schedule();});}
  reduced.addEventListener('change',()=>{if(reduced.matches)active.forEach(a=>a.cancel());paused=reduced.matches;label();schedule();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);active.forEach(a=>a.cancel());}else schedule();});
})();
