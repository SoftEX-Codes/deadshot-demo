(() => {
  const host=document.querySelector('#phone-viewer');
  if(!host)return;
  const status=document.querySelector('#phone-status');
  const controls=document.querySelector('#phone-controls');
  const mode=document.querySelector('#viewer-mode');
  let started=false;
  function photo(){
    host.classList.remove('is-3d');
    host.dataset.state='fallback';
    host.removeAttribute('aria-busy');
    host.querySelectorAll('canvas').forEach(canvas=>canvas.remove());
    controls.hidden=true;
    mode.textContent='PRODUCT PHOTO';
    status.textContent='Product photograph shown. The 3D preview is unavailable.';
  }
  async function start(){
    if(started)return;started=true;
    const controller=new AbortController();
    host.dataset.state='loading';host.setAttribute('aria-busy','true');
    mode.textContent='LOADING 3D';
    status.textContent='Loading 3D preview · product photograph shown';
    const deadline=setTimeout(()=>{controller.abort();photo();},12000);
    try{
      const {startDeviceViewer}=await import('./phone-3d.js?v=7');
      if(controller.signal.aborted)return;
      await startDeviceViewer({signal:controller.signal});
      if(!controller.signal.aborted&&host.dataset.state!=='ready')photo();
    }catch(error){photo();console.warn('3D preview unavailable:',error.message);}
    finally{clearTimeout(deadline);host.removeAttribute('aria-busy');}
  }
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();start();}},{rootMargin:'180px'});
    observer.observe(host);
  }else start();
})();
