// Depth-buffered software rendering of the SAME Three.js scene when WebGL is
// unavailable. Perspective-correct UVs keep the display readable while turning.
import * as T from './three.module.min.js';
export class PhoneSoftwareRenderer {
  constructor({canvas=document.createElement('canvas')}={}) {
    this.domElement=canvas;this.context=canvas.getContext('2d',{alpha:true});if(!this.context)throw Error('Canvas unavailable');
    this.pixelRatio=1;this.cache=new WeakMap();this.textures=new WeakMap();this.mvp=new T.Matrix4();this.normalMatrix=new T.Matrix3();this.normal=new T.Vector3();this.color=new T.Color();this.key=new T.Vector3(-3,5,7).normalize();this.fill=new T.Vector3(4,1,-5).normalize();this.info={render:{triangles:0,calls:0}};
  }
  setPixelRatio(r){this.pixelRatio=Math.max(1,Math.min(r||1,1.25));}
  setSize(w,h){this.width=Math.max(1,Math.round(w*this.pixelRatio));this.height=Math.max(1,Math.round(h*this.pixelRatio));this.domElement.width=this.width;this.domElement.height=this.height;this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';this.image=this.context.createImageData(this.width,this.height);this.depth=new Float32Array(this.width*this.height);}
  geometryData(g){let data=this.cache.get(g);if(data)return data;const a=g.attributes.position,n=g.attributes.normal,idx=g.index,count=idx?idx.count:a.count;const faces=[];for(let i=0;i<count;i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);const normal=new T.Vector3();for(const j of ids)normal.add(new T.Vector3().fromBufferAttribute(n,j));normal.normalize();const group=g.groups.find(x=>i>=x.start&&i<x.start+x.count);faces.push({ids,normal,materialIndex:group?.materialIndex||0});}data={faces,projected:new Float64Array(a.count*4)};this.cache.set(g,data);return data;}
  textureData(texture){const source=texture?.image;if(!source?.width)return null;let data=this.textures.get(source);if(data)return data;const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const x=c.getContext('2d');x.drawImage(source,0,0);data={pixels:x.getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height,flipY:texture.flipY};this.textures.set(source,data);return data;}
  render(scene,camera){
    if(!this.image)return;const pixels=this.image.data;pixels.fill(0);this.depth.fill(Infinity);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);let triangles=0;
    scene.traverseVisible(mesh=>{
      if(!mesh.isMesh)return;const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,{faces,projected:q}=this.geometryData(g);this.mvp.multiplyMatrices(vp,mesh.matrixWorld);this.normalMatrix.getNormalMatrix(mesh.matrixWorld);const m=this.mvp.elements;
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),iw=1/(m[3]*x+m[7]*y+m[11]*z+m[15]),o=i*4;q[o]=((m[0]*x+m[4]*y+m[8]*z+m[12])*iw+1)*this.width/2;q[o+1]=(1-(m[1]*x+m[5]*y+m[9]*z+m[13])*iw)*this.height/2;q[o+2]=(m[2]*x+m[6]*y+m[10]*z+m[14])*iw;q[o+3]=iw;}
      for(const face of faces){const material=Array.isArray(mesh.material)?mesh.material[face.materialIndex]:mesh.material;if(!material?.visible||material.opacity<=0)continue;const [a,b,c]=face.ids,ia=a*4,ib=b*4,ic=c*4;const ax=q[ia],ay=q[ia+1],bx=q[ib],by=q[ib+1],cx=q[ic],cy=q[ic+1],area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);if(Math.abs(area)<.03||(material.side===T.FrontSide&&area>=0)||(material.side===T.BackSide&&area<=0))continue;
        const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(this.width-1,Math.ceil(Math.max(ax,bx,cx))),y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(this.height-1,Math.ceil(Math.max(ay,by,cy)));if(x1<x0||y1<y0)continue;
        this.normal.copy(face.normal).applyMatrix3(this.normalMatrix).normalize();if(material.side===T.DoubleSide&&area>0)this.normal.negate();const light=material.isMeshBasicMaterial?1:.5+.65*Math.max(0,this.normal.dot(this.key))+.3*Math.max(0,this.normal.dot(this.fill));this.color.copy(material.color).multiplyScalar(light);if(material.emissive){this.color.r+=material.emissive.r*material.emissiveIntensity;this.color.g+=material.emissive.g*material.emissiveIntensity;this.color.b+=material.emissive.b*material.emissiveIntensity;}this.color.convertLinearToSRGB();const red=Math.min(255,this.color.r*255),green=Math.min(255,this.color.g*255),blue=Math.min(255,this.color.b*255);const tex=this.textureData(material.map),iaw=q[ia+3],ibw=q[ib+3],icw=q[ic+3];let au=0,av=0,bu=0,bv=0,cu=0,cv=0;if(tex&&uv){au=uv.getX(a)*iaw;av=uv.getY(a)*iaw;bu=uv.getX(b)*ibw;bv=uv.getY(b)*ibw;cu=uv.getX(c)*icw;cv=uv.getY(c)*icw;}
        const inverse=1/area;
        for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
          const px=x+.5,py=y+.5,u=((bx-px)*(cy-py)-(by-py)*(cx-px))*inverse,v=((cx-px)*(ay-py)-(cy-py)*(ax-px))*inverse,t=1-u-v;if(u<-.00001||v<-.00001||t<-.00001)continue;const z=u*q[ia+2]+v*q[ib+2]+t*q[ic+2],i=y*this.width+x;if(z>=this.depth[i]||z<-1||z>1)continue;let r=red,gr=green,bl=blue,alpha=material.opacity;
          if(tex&&uv){const reciprocal=1/(u*iaw+v*ibw+t*icw),tu=(u*au+v*bu+t*cu)*reciprocal,tv=(u*av+v*bv+t*cv)*reciprocal;const sx=Math.max(0,Math.min(tex.width-1,Math.floor(tu*tex.width))),sy=Math.max(0,Math.min(tex.height-1,Math.floor((tex.flipY?1-tv:tv)*tex.height))),s=(sy*tex.width+sx)*4;alpha*=tex.pixels[s+3]/255;if(alpha<.05)continue;r=tex.pixels[s];gr=tex.pixels[s+1];bl=tex.pixels[s+2];}
          const k=i*4;pixels[k]=r*alpha+pixels[k]*(1-alpha);pixels[k+1]=gr*alpha+pixels[k+1]*(1-alpha);pixels[k+2]=bl*alpha+pixels[k+2]*(1-alpha);pixels[k+3]=255;if(material.depthWrite!==false||alpha>.5)this.depth[i]=z;
        }triangles++;
      }
    });this.context.putImageData(this.image,0,0);this.info.render.triangles=triangles;this.info.render.calls=1;
  }
  dispose(){this.cache=new WeakMap();this.textures=new WeakMap();this.context.clearRect(0,0,this.width,this.height);}
}
