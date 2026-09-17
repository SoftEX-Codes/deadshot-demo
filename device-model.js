import * as T from './vendor/three.module.min.js';
// Homepage-only REDMAGIC 10 Pro Shadow. Physical proportions follow REDMAGIC's
// 163.42 x 76.14 x 8.9 mm specification. Official photographs supply the actual
// front and rear finish; edge geometry is an original approximation, not CAD.
export async function loadDeviceTextures(){
  const loader=new T.TextureLoader();
  const images=await Promise.all(['back','front'].map(side=>loader.loadAsync('assets/redmagic-10-'+side+'-texture.webp')));
  for(const t of images){t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;}
  return {back:images[0],front:images[1]};
}
export function buildDevice(d,textures){
  const w=76.14/40,h=163.42/40,depth=8.9/40,r=.085,group=new T.Group();
  const metal=new T.MeshStandardMaterial({color:0x454849,metalness:.78,roughness:.32});
  const black=new T.MeshStandardMaterial({color:0x07090a,metalness:.3,roughness:.4});
  const red=new T.MeshStandardMaterial({color:0xb5161b,metalness:.35,roughness:.25});
  function shape(width,height,radius){const s=new T.Shape();s.moveTo(-width/2+radius,-height/2);s.lineTo(width/2-radius,-height/2);s.quadraticCurveTo(width/2,-height/2,width/2,-height/2+radius);s.lineTo(width/2,height/2-radius);s.quadraticCurveTo(width/2,height/2,width/2-radius,height/2);s.lineTo(-width/2+radius,height/2);s.quadraticCurveTo(-width/2,height/2,-width/2,height/2-radius);s.lineTo(-width/2,-height/2+radius);s.quadraticCurveTo(-width/2,-height/2,-width/2+radius,-height/2);return s;}
  const bodyGeo=new T.ExtrudeGeometry(shape(w,h,r),{depth,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:2,steps:1,curveSegments:7});bodyGeo.translate(0,0,-depth/2);group.add(new T.Mesh(bodyGeo,metal));
  function surface(texture,rear){
    const width=w-.025,height=h-.025,geo=new T.ShapeGeometry(shape(width,height,r*.95),10),uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++){
      const x=(uv.getX(i)+width/2)/width,y=(uv.getY(i)+height/2)/height;
      // UV windows reference the unmodified official gallery images. The front
      // window removes the perspective of the product photograph on the mesh.
      const u=rear?.207+x*.343:.371+x*.238;
      const top=.191*(1-x)+.119*x;
      const imageY=rear?.869-y*.739:.878*(1-y)+top*y;
      uv.setXY(i,u,1-imageY);
    }
    const mesh=new T.Mesh(geo,new T.MeshBasicMaterial({map:texture}));
    mesh.position.z=(rear?-1:1)*(depth/2+.012);if(rear)mesh.rotation.y=Math.PI;group.add(mesh);
  }
  surface(textures.back,true);surface(textures.front,false);
  function box(x,y,z,sx,sy,sz,mat){const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);group.add(m);return m;}
  // Flush capacitive triggers, cooling vent, volume/power controls and red slider.
  for(const y of [1.62,-1.62])box(w/2+.011,y,0,.021,.35,.125,black);
  box(w/2+.014,.79,0,.024,.38,.135,black);
  for(let i=0;i<6;i++)box(w/2+.027,.64+i*.055,0,.006,.012,.097,metal);
  box(-w/2-.013,1.1,0,.025,.48,.095,metal);
  box(w/2+.02,.09,0,.029,.36,.087,metal);
  box(w/2+.022,-.76,0,.03,.23,.09,red);
  for(let i=0;i<4;i++)box(w/2+.039,-.84+i*.053,0,.006,.012,.068,black);
  box(-w/2-.012,.4,0,.022,.35,.10,black);
  for(const x of [-.68,.69]){box(x,h/2+.01,0,.02,.009,depth,black);box(x,-h/2-.01,0,.02,.009,depth,black);}
  box(0,-h/2-.012,0,.24,.012,.073,black);
  for(let i=0;i<5;i++)box(.30+i*.07,-h/2-.012,0,.027,.012,.06,black);
  const jack=new T.Mesh(new T.CylinderGeometry(.048,.048,.014,20),black);jack.position.set(.61,h/2+.013,0);group.add(jack);
  group.userData={width:w,height:h,device:d.id};return group;
}
