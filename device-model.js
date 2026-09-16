import * as T from './vendor/three.module.min.js';
// Original procedural illustrations, with each device's form factor, finish
// and camera arrangement. These are intentionally not precision product scans.
export function buildDevice(d) {
  const tablet=d.category==='tablet',w=tablet?4.25:1.94,h=tablet?2.76:4.12,depth=tablet?.14:.23;
  const group=new T.Group();
  const frame=new T.MeshStandardMaterial({color:0x8e9995,metalness:.7,roughness:.27});
  const dark=new T.MeshStandardMaterial({color:0x0c1113,metalness:.3,roughness:.3});
  const back=new T.MeshStandardMaterial({color:d.color,metalness:.33,roughness:.35});
  const edge=new T.MeshStandardMaterial({color:0xc3f550,emissive:0x567e13,emissiveIntensity:.4,roughness:.25});
  function shape(width,height,r){const s=new T.Shape();s.moveTo(-width/2+r,-height/2);s.lineTo(width/2-r,-height/2);s.quadraticCurveTo(width/2,-height/2,width/2,-height/2+r);s.lineTo(width/2,height/2-r);s.quadraticCurveTo(width/2,height/2,width/2-r,height/2);s.lineTo(-width/2+r,height/2);s.quadraticCurveTo(-width/2,height/2,-width/2,height/2-r);s.lineTo(-width/2,-height/2+r);s.quadraticCurveTo(-width/2,-height/2,-width/2+r,-height/2);return s;}
  function slab(width,height,thickness,r,material,x=0,y=0,z=0){const g=new T.ExtrudeGeometry(shape(width,height,r),{depth:thickness,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1,steps:1,curveSegments:5});g.translate(0,0,-thickness/2);const mesh=new T.Mesh(g,material);mesh.position.set(x,y,z);group.add(mesh);return mesh;}
  const radius=d.cameras==='redmagic'?.085:.19;
  slab(w,h,depth,radius,frame);
  slab(w-.065,h-.065,.014,radius,dark,0,0,depth/2+.016);
  slab(w-.06,h-.06,.022,radius,back,0,0,-depth/2-.016);
  const screen=document.createElement('canvas');screen.width=tablet?1024:512;screen.height=tablet?640:1024;
  const c=screen.getContext('2d'),sw=screen.width,sh=screen.height;
  const grad=c.createLinearGradient(0,0,sw,sh);grad.addColorStop(0,'#041310');grad.addColorStop(.55,d.family==='iqoo'?'#303650':'#184039');grad.addColorStop(1,'#071010');c.fillStyle=grad;c.fillRect(0,0,sw,sh);
  // Angular, layered wallpaper is part of the 3D screen texture.
  for(let i=0;i<7;i++){c.beginPath();c.moveTo(sw*.2+i*sw*.17,-sh*.1);c.lineTo(sw*.8+i*sw*.17,sh*.46);c.lineTo(-sw*.3+i*sw*.17,sh*1.1);c.strokeStyle=i%2?'#bfea50':'#386f56';c.lineWidth=i%2?4:22;c.stroke();}
  c.fillStyle='#eaf2e6';c.font='bold 18px sans-serif';c.fillText('09:41',28,38);c.textAlign='right';c.fillText('100%',sw-25,38);c.textAlign='left';
  c.fillStyle='#c3f550';c.font='bold 20px sans-serif';c.fillText('DEADSHOT / DEVICE STUDIO',32,tablet?108:175);
  c.fillStyle='#f0f5e7';c.font='900 '+(tablet?92:78)+'px sans-serif';c.fillText('PLAY.',27,tablet?221:276);c.fillText('BEYOND.',27,tablet?310:364);
  c.font='bold 23px sans-serif';c.fillText(d.name.toUpperCase(),32,sh-112,sw-64);c.font='16px monospace';c.fillStyle='#c3f550';c.fillText('YOUR NEXT LEVEL.',32,sh-76);c.fillStyle='#eaf2e6';c.fillRect(sw/2-57,sh-23,114,4);
  const texture=new T.CanvasTexture(screen);texture.colorSpace=T.SRGBColorSpace;
  const dw=w-(tablet?.18:.14),dh=h-(tablet?.18:.15);
  const dg=new T.ShapeGeometry(shape(dw,dh,radius*.8),8);const uv=dg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+dw/2)/dw,(uv.getY(i)+dh/2)/dh);
  const display=new T.Mesh(dg,new T.MeshBasicMaterial({map:texture}));display.position.z=depth/2+.065;group.add(display);
  function disc(x,y,z,r,mat,thickness=.035){const geo=new T.CylinderGeometry(r,r,thickness,24);const m=new T.Mesh(geo,mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);group.add(m);return m;}
  const glass=new T.MeshStandardMaterial({color:0x164965,roughness:.13,metalness:.6});
  const rim=new T.MeshStandardMaterial({color:0x737c82,metalness:.65,roughness:.22});
  const lens=(x,y,z,r=.17)=>{disc(x,y,z,r+.035,rim);disc(x,y,z-.026,r,dark);disc(x,y,z-.046,r*.63,glass);disc(x-.025,y+.027,z-.068,r*.2,new T.MeshBasicMaterial({color:0x7e9cab}),.008);};
  if(!tablet&&d.cameras!=='redmagic')disc(0,h/2-.20,depth/2+.045,.046,dark,.009);
  const rear=-depth/2-.065;
  if(d.cameras==='round'){
    disc(-.35,1.17,rear-.02,.57,rim,.08);disc(-.35,1.17,rear-.07,.53,dark,.045);
    lens(-.57,1.4,rear-.105,.15);lens(-.12,1.4,rear-.105,.15);lens(-.57,.97,rear-.105,.15);disc(-.11,.95,rear-.13,.075,new T.MeshBasicMaterial({color:0xd6dfc9}));
  } else if(d.cameras==='iqoo'){
    slab(1.08,1.12,.08,.23,rim,-.23,1.22,rear);slab(1.02,1.06,.023,.22,dark,-.23,1.22,rear-.052);
    lens(-.47,1.48,rear-.08,.16);lens(.03,1.48,rear-.08,.16);lens(-.47,.99,rear-.08,.16);disc(.03,.99,rear-.12,.072,new T.MeshBasicMaterial({color:0xe2e4cb}));
    if(d.id==='iqoo-13')slab(1.13,1.17,.01,.25,edge,-.23,1.22,rear+.04);
  } else if(d.cameras==='redmagic'){
    slab(.61,3.85,.02,.03,dark,-.48,0,rear+.021);
    lens(-.48,1.51,rear-.013,.17);lens(-.48,.97,rear-.013,.17);
    disc(-.48,.42,rear-.014,.18,rim);disc(-.48,.42,rear-.04,.145,dark);disc(-.48,.42,rear-.065,.07,edge);
    for(let j=0;j<7;j++){const blade=slab(.027,.23,.008,.01,rim,-.48,.42,rear-.062);blade.geometry.translate(0,.06,0);blade.rotation.z=j*Math.PI*2/7;}
    slab(.035,1.34,.008,.008,edge,.58,-.65,rear-.004);
    slab(.055,.6,.07,.012,edge,w/2+.013,1.38,0);slab(.055,.6,.07,.012,edge,w/2+.013,-1.35,0);
  } else {
    const x=-w/2+.35,y=h/2-.35;
    slab(d.cameras==='legion'?.46:1.5,d.cameras==='legion'?1.05:.5,.04,.07,dark,x+(d.cameras==='legion'?0:.5),y-(d.cameras==='legion'?.23:0),rear);
    lens(x,y,rear-.06,.17);
    if(d.cameras==='legion')lens(x,y-.5,rear-.06,.12);
    else {disc(x+.8,y,rear-.03,.18,rim);disc(x+.8,y,rear-.06,.12,edge);}
  }
  // Rear branding is a transparent texture plane facing out from the back.
  const label=document.createElement('canvas');label.width=512;label.height=256;const lc=label.getContext('2d');lc.fillStyle='#f2f5e9';lc.textAlign='center';lc.font='bold 47px sans-serif';lc.fillText(d.brand.toUpperCase(),256,115,470);lc.font='15px monospace';lc.fillText('GAMING / DEADSHOT',256,152);
  const lt=new T.CanvasTexture(label);lt.colorSpace=T.SRGBColorSpace;const lm=new T.Mesh(new T.PlaneGeometry(tablet?2.2:1.36,tablet?1.1:.68),new T.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false}));lm.rotation.y=Math.PI;lm.position.set(tablet?.2:.1,tablet?-.12:-1.19,-depth/2-.065);group.add(lm);
  slab(.045,.45,.09,.015,frame,w/2+.018,.58,0);slab(.045,.73,.09,.015,frame,-w/2-.018,.55,0);
  const port=new T.Mesh(new T.BoxGeometry(.27,.024,.068),dark);port.position.set(0,-h/2-.009,0);group.add(port);
  for(let i=0;i<5;i++){const hole=new T.Mesh(new T.BoxGeometry(.035,.018,.055),dark);hole.position.set(.3+i*.08,-h/2-.01,0);group.add(hole);}
  group.userData={width:w,height:h,device:d.id};return group;
}
