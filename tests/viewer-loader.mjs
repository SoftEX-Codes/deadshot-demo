import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../viewer-loader.js',import.meta.url),'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function harness(mode){
 const timers=new Map(),attributes=new Map();let serial=0,starts=0,resolveImport;
 const host={dataset:{state:'photo'},classList:{remove(){}},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),querySelectorAll:()=>[]};
 const status={textContent:'Product photograph'},controls={hidden:true},label={textContent:'PRODUCT PHOTO'};
 const nodes={'#phone-viewer':host,'#phone-status':status,'#phone-controls':controls,'#viewer-mode':label};
 const context=vm.createContext({document:{querySelector:s=>nodes[s]},window:{},AbortController,console:{warn(){}},setTimeout:(fn,ms)=>{assert.equal(ms,12000);timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id)});
 const module=new vm.SyntheticModule(['startDeviceViewer'],function(){this.setExport('startDeviceViewer',async({signal})=>{starts++;signal.throwIfAborted();if(mode==='slow-init')return new Promise(()=>{});host.dataset.state='ready';controls.hidden=false;label.textContent='INTERACTIVE';});},{context});
 await module.link(()=>{});await module.evaluate();
 new vm.Script(source,{importModuleDynamically:async()=>{
  if(mode==='missing')throw new Error('Module download failed');
  if(mode==='slow-import')return new Promise(resolve=>{resolveImport=()=>resolve(module);});
  return module;
 }}).runInContext(context);
 await flush();await flush();
 return {host,status,controls,label,attributes,timers,get starts(){return starts;},expire:()=>{for(const fn of [...timers.values()])fn();},resolveImport:()=>resolveImport?.()};
}
const ok=await harness('ready');assert.equal(ok.host.dataset.state,'ready');assert.equal(ok.controls.hidden,false);assert.equal(ok.timers.size,0);assert.equal(ok.attributes.has('aria-busy'),false);
const missing=await harness('missing');assert.equal(missing.host.dataset.state,'fallback');assert.equal(missing.controls.hidden,true);assert.match(missing.status.textContent,/photograph/);
for(const scenario of ['slow-import','slow-init']){
 const slow=await harness(scenario);assert.equal(slow.host.dataset.state,'loading');slow.expire();assert.equal(slow.host.dataset.state,'fallback');assert.equal(slow.controls.hidden,true);assert.equal(slow.label.textContent,'PRODUCT PHOTO');assert.equal(slow.attributes.has('aria-busy'),false);
 if(scenario==='slow-import'){slow.resolveImport();await flush();await flush();assert.equal(slow.starts,0);assert.equal(slow.host.dataset.state,'fallback');}
}
console.log('PASS: ready viewer, failed import, stalled import/initialization, timeout photo fallback and no late restart.');
