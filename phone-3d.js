// A purpose-built 3D concept phone. No product availability/specification claims.
const host = document.querySelector('#phone-viewer');
const status = document.querySelector('#phone-status');
const controls = document.querySelector('#phone-controls');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let started = false;
async function start() {
  if (started) return;
  started = true;
  let renderer;
  try {
    const T = await import('./vendor/three.module.min.js');
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, .1, 50);
    camera.position.set(0, 0, 9.5);
    scene.add(new T.HemisphereLight(0xe5ffe0, 0x242b32, 3));
    for (const [color, intensity, x, y, z] of [[0xffffff, 5, -4, 5, 6], [0xc3f550, 4, 4, 1, -4], [0x94baff, 3, -3, -2, -4]]) {
      const light = new T.DirectionalLight(color, intensity); light.position.set(x, y, z); scene.add(light);
    }
    const phone = new T.Group(); scene.add(phone);
    const metal = new T.MeshStandardMaterial({color:0x66716b, metalness:.72, roughness:.28});
    const black = new T.MeshStandardMaterial({color:0x080c0b, metalness:.3, roughness:.25});
    const back = new T.MeshStandardMaterial({color:0x25332a, metalness:.45, roughness:.36});
    const lime = new T.MeshStandardMaterial({color:0xc3f550, emissive:0x759522, emissiveIntensity:.65, metalness:.25, roughness:.35});
    function slab(w,h,d,r,material,x=0,y=0,z=0) {
      const s = new T.Shape();
      s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2); s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      s.lineTo(w/2,h/2-r); s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
      s.lineTo(-w/2+r,h/2); s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
      s.lineTo(-w/2,-h/2+r); s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      const g = new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.015,bevelThickness:.015,curveSegments:8});
      g.translate(0,0,-d/2);
      const m = new T.Mesh(g,material); m.position.set(x,y,z); phone.add(m); return m;
    }
    slab(1.92,4,.25,.2,metal);
    slab(1.84,3.92,.018,.18,black,0,0,.14);
    slab(1.84,3.92,.025,.18,back,0,0,-.14);
    // The screen texture is generated locally: no image download or model loader.
    const screen = document.createElement('canvas'); screen.width=512; screen.height=1024;
    const ctx=screen.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,512,1024); grad.addColorStop(0,'#060e14');grad.addColorStop(.5,'#19392f');grad.addColorStop(1,'#050908');ctx.fillStyle=grad;ctx.fillRect(0,0,512,1024);
    for(let i=0;i<8;i++){ctx.strokeStyle=i%2?'#c3f550':'#386548';ctx.lineWidth=i%2?3:16;ctx.beginPath();ctx.moveTo(-150+i*75,1024);ctx.lineTo(360+i*75,330);ctx.lineTo(180+i*75,-100);ctx.stroke();}
    ctx.fillStyle='#efffe4';ctx.font='bold 22px sans-serif';ctx.fillText('9:41',35,58);ctx.fillText('5G  ▰',390,58);
    ctx.font='bold 25px sans-serif';ctx.fillText('DEADSHOT',38,205);ctx.font='bold 70px sans-serif';ctx.fillText('PLAY',36,287);ctx.fillText('BEYOND.',36,367);
    ctx.font='18px sans-serif';ctx.fillStyle='#c3f550';ctx.fillText('BUILT FOR YOUR GAME',39,408);
    ctx.fillStyle='#d7f8ba';ctx.fillRect(187,976,138,6);
    const texture=new T.CanvasTexture(screen);texture.colorSpace=T.SRGBColorSpace;
    // UVs from the extruded face use model coordinates; map to the screen bounds.
    const display=slab(1.72,3.77,.006,.14,new T.MeshBasicMaterial({map:texture}),0,0,.161);
    const uv=display.geometry.attributes.uv;
    for(let i=0;i<uv.count;i++) uv.setXY(i,(uv.getX(i)+.86)/1.72,(uv.getY(i)+1.885)/3.77);
    uv.needsUpdate=true;
    function lens(x,y,z,r,mat){const m=new T.Mesh(new T.CylinderGeometry(r,r,.07,32),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);phone.add(m);return m;}
    lens(0,1.7,.2,.052,black);
    slab(1.55,1.12,.09,.16,black,0,1.2,-.22);
    const glass=new T.MeshStandardMaterial({color:0x163c54,metalness:.75,roughness:.12});
    for(const [x,y] of [[-.43,1.43],[.22,1.43],[-.43,.92]]){
      lens(x,y,-.30,.235,metal); lens(x,y,-.35,.185,black);lens(x,y,-.39,.12,glass);lens(x-.035,y+.04,-.43,.035,new T.MeshBasicMaterial({color:0x648bba}));
    }
    lens(.36,.9,-.3,.07,new T.MeshBasicMaterial({color:0xf1e8c5}));
    slab(.035,1.8,.012,.01,lime,.53,-.53,-.17);
    slab(.035,1.25,.012,.01,lime,.42,-.8,-.17);
    const badge=slab(.46,.46,.018,.06,metal,0,-.4,-.18);badge.rotation.z=Math.PI/4;
    slab(.045,.52,.1,.02,metal,.98,.65,0);
    slab(.045,.28,.1,.02,lime,.98,-.1,0);
    slab(.045,.7,.1,.02,metal,-.98,.6,0);
    // Speaker holes, charging port and antenna breaks are modeled geometry.
    for(let i=0;i<5;i++){const m=new T.Mesh(new T.BoxGeometry(.035,.018,.065),black);m.position.set(.35+i*.09,-2.016,0);phone.add(m);}
    const port=new T.Mesh(new T.BoxGeometry(.29,.025,.085),black);port.position.set(-.08,-2.014,0);phone.add(port);
    for(const y of [-1.6,1.6])for(const x of [-.966,.966])slab(.018,.035,.24,.005,black,x,y,0);
    phone.rotation.set(.1,-.5,-.09);
    const canvas=renderer.domElement;
    canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive 3D concept gaming phone. Drag horizontally or use left and right arrow keys to rotate.');
    host.append(canvas);
    let visible=true, paused=motion.matches || !!navigator.connection?.saveData, frame=0, previous=0, down=null, dead=false;
    const pause=document.querySelector('#phone-pause');
    function label(){pause.textContent=paused?'Play rotation':'Pause rotation';pause.setAttribute('aria-pressed',String(paused));}
    function render(){renderer.render(scene,camera);}
    function tick(now){frame=0;if(dead||!visible||document.hidden||paused||down)return;const dt=Math.min((now-previous)/1000,.05);previous=now;phone.rotation.y+=dt*.24;render();frame=requestAnimationFrame(tick);}
    function sync(){cancelAnimationFrame(frame);frame=0;if(!dead&&visible&&!document.hidden&&!paused&&!down){previous=performance.now();frame=requestAnimationFrame(tick);}}
    function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<.75?11:9.5;camera.updateProjectionMatrix();render();}
    new ResizeObserver(resize).observe(host);resize();
    controls.hidden=false;host.classList.add('is-3d');status.textContent='Drag to rotate · Concept phone';label();sync();
    pause.onclick=()=>{paused=!paused;label();sync();};
    document.querySelector('#phone-reset').onclick=()=>{phone.rotation.set(.1,-.5,-.09);render();};
    canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);sync();});
    canvas.addEventListener('pointermove',e=>{if(!down||down.id!==e.pointerId)return;phone.rotation.y+=(e.clientX-down.x)*.012;down.x=e.clientX;render();});
    const release=()=>{down=null;sync();};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();paused=true;phone.rotation.y+=e.key==='ArrowLeft'?-.2:.2;label();sync();render();});
    motion.addEventListener('change',()=>{paused=motion.matches;label();sync();});
    document.addEventListener('visibilitychange',sync);
    new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();},{threshold:.01}).observe(host);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dead=true;sync();host.classList.remove('is-3d');controls.hidden=true;canvas.remove();status.textContent='Gaming phone concept';renderer.dispose();});
  } catch(error) {
    renderer?.dispose();host.querySelector('canvas')?.remove();host.classList.remove('is-3d');controls.hidden=true;status.textContent='Gaming phone concept';console.warn('3D preview unavailable; showing image.',error);
  }
}
if(host){if('IntersectionObserver' in window){const observer=new IntersectionObserver(([e])=>{if(e.isIntersecting){observer.disconnect();start();}},{rootMargin:'150px'});observer.observe(host);}else start();}
