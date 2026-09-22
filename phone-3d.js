import { devices } from './devices-data.js?v=7';
const host=document.querySelector('#phone-viewer');

const device=devices.find(d=>d.id===host?.dataset.device);
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let started=false;
export async function startDeviceViewer({signal}={}){
  signal?.throwIfAborted();
  if(started||!host||!device)return;started=true;
  const status=document.querySelector('#phone-status'),controls=document.querySelector('#phone-controls');
  let renderer,scene,camera,model,canvas,software=false;
  let frame=0,previous=0,visible=true,paused=preference.matches||!!navigator.connection?.saveData,drag=null,disposed=false;
  const pause=document.querySelector('#phone-pause');
  const mode=document.querySelector('#viewer-mode');
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);renderer?.dispose();canvas?.remove();
    model?.traverse(m=>{m.geometry?.dispose();for(const material of (Array.isArray(m.material)?m.material:[m.material]).filter(Boolean)){material.map?.dispose();material.dispose();}});
  }
  function fallback(error){dispose();host.classList.remove('is-3d');controls.hidden=true;status.textContent='Product photograph shown. The 3D preview is unavailable.';host.dataset.state='fallback';host.removeAttribute('aria-busy');if(mode)mode.textContent='PRODUCT PHOTO';console.warn('Device viewer:',error?.message||error);}
  signal?.addEventListener('abort',()=>fallback(new Error('3D loading timed out')),{once:true});
  function label(){pause.textContent=paused?'Play rotation':'Pause rotation';pause.setAttribute('aria-pressed',String(paused));}
  function draw(){renderer.render(scene,camera);}
  function tick(now){frame=0;if(disposed||paused||!visible||document.hidden||drag)return;try{const elapsed=now-previous;if(elapsed>=(software?1000/24:1000/40)){model.rotation.y+=Math.min(elapsed/1000,.09)*.14;previous=now;draw();}frame=requestAnimationFrame(tick);}catch(error){fallback(error);}}
  function sync(){cancelAnimationFrame(frame);frame=0;if(!disposed&&!paused&&visible&&!document.hidden&&!drag){previous=performance.now();frame=requestAnimationFrame(tick);}}
  function resize(){if(disposed)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;const tan=Math.tan(35*Math.PI/360),{width,height}=model.userData;camera.position.z=Math.max(height/2/tan,width/2/tan/camera.aspect)*1.26+.45;camera.updateProjectionMatrix();draw();}
  function setAngle(back=false){paused=true;label();sync();model.rotation.set(.07,back?Math.PI+.28:-.22,device.category==='tablet'?.045:-.07);draw();}
  function bind(){
    canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',device.name+' interactive 3D illustration. Drag left or right, or use arrow keys to rotate.');
    host.append(canvas);
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;paused=true;label();drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);sync();});
    canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;model.rotation.y+=(e.clientX-drag.x)*.012;drag.x=e.clientX;draw();});
    const release=()=>{drag=null;sync();};['pointerup','pointercancel','lostpointercapture'].forEach(e=>canvas.addEventListener(e,release));
    canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home',' '].includes(e.key))return;e.preventDefault();if(e.key===' '){paused=!paused;label();sync();return;}paused=true;label();sync();if(e.key==='Home')model.rotation.set(.06,Math.PI+.34,-.055);else model.rotation.y+=e.key==='ArrowLeft'?-.22:.22;draw();});
    canvas.addEventListener('webglcontextlost',async e=>{
      e.preventDefault();if(software||disposed)return;cancelAnimationFrame(frame);const old=canvas;
      const recovery=setTimeout(()=>fallback(new Error('3D recovery timed out')),8000);
      try{const {PhoneSoftwareRenderer}=await import('./vendor/phone-software-renderer.js');if(disposed)return;renderer.dispose();renderer=new PhoneSoftwareRenderer();software=true;renderer.setPixelRatio(1.25);old.remove();bind();resize();host.dataset.renderer='software';sync();}catch(error){fallback(error);}finally{clearTimeout(recovery);}
    });
  }
  try {
    const [T,{buildDevice,loadDeviceTextures}]=await Promise.all([import('./vendor/three.module.min.js'),import('./device-model.js?v=7')]);
    signal?.throwIfAborted();
    scene=new T.Scene();camera=new T.PerspectiveCamera(35,1,.1,40);scene.add(new T.HemisphereLight(0xffffff,0x6b726a,3));
    for(const [color,intensity,x,y,z] of [[0xffffff,4,-4,5,6],[0xdaefcf,3,4,1,-4],[0xabc7ff,2,-3,-2,-4]]){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
    const textures=await loadDeviceTextures();
    if(signal?.aborted){Object.values(textures).forEach(texture=>texture.dispose());signal.throwIfAborted();}
    model=buildDevice(device,textures);model.rotation.set(.06,Math.PI+.34,-.055);scene.add(model);
    // Probe first. GPU-disabled browsers still get a real mesh rendered in 2D.
    const testCanvas=document.createElement('canvas');let context=null;
    try{context=testCanvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});}catch{}
    if(context){try{renderer=new T.WebGLRenderer({canvas:testCanvas,context,alpha:true,antialias:true});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;}catch{context.getExtension('WEBGL_lose_context')?.loseContext();}}
    if(!renderer){const {PhoneSoftwareRenderer}=await import('./vendor/phone-software-renderer.js');signal?.throwIfAborted();renderer=new PhoneSoftwareRenderer();software=true;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,software?1.25:1.5));bind();resize();
    host.classList.add('is-3d');host.dataset.renderer=software?'software':'webgl';host.dataset.state='ready';controls.hidden=false;status.textContent='Drag to rotate · 3D ready';if(mode)mode.textContent='INTERACTIVE';label();sync();
    document.querySelector('#model-label').textContent=device.name.toUpperCase();
    pause.addEventListener('click',()=>{paused=!paused;label();sync();});
    document.querySelector('#phone-reset').addEventListener('click',()=>{paused=true;label();sync();model.rotation.set(.06,Math.PI+.34,-.055);draw();});
    document.querySelector('#phone-front').addEventListener('click',()=>setAngle(false));document.querySelector('#phone-back').addEventListener('click',()=>setAngle(true));
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(host);else window.addEventListener('resize',resize);
    if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.01}).observe(host);
    document.addEventListener('visibilitychange',sync);preference.addEventListener('change',()=>{paused=preference.matches;label();sync();});
    window.addEventListener('pagehide',e=>{cancelAnimationFrame(frame);if(!e.persisted)dispose();});
    window.addEventListener('pageshow',e=>{if(e.persisted)sync();});
  }catch(error){fallback(error);throw error;}
}
