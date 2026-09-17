export const families = ['redmagic','iqoo','oneplus','ace','legion','redmi','infinix','other'];
export function safeImage(value, allowData = false) {
  const s = String(value || '').trim();
  if (/^assets\/[a-z0-9-]+\.(svg|webp|png|jpg)$/i.test(s)) return s;
  if (allowData && /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(s) && s.length < 1500000) return s;
  try { const u = new URL(s); if (u.protocol === 'https:' && !u.username && !u.password) return u.href; } catch {}
  return '';
}
export function safeLink(value) {
  try { const u = new URL(String(value)); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function cleanDevice(input) {
  const d = {};
  for (const field of ['id','name','brand','family','category','chip','display','refresh','battery','charging','memory','region','tag','description','source','photoSource','color','cameras','image','status']) {
    const max = field === 'description' ? 2000 : field === 'image' ? 1500000 : 500;
    d[field] = String(input[field] ?? '').trim().slice(0,max);
  }
  d.price = Number(input.price);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.id) || d.id.length > 80) throw new Error('Use a device ID with lowercase letters, numbers and hyphens.');
  for (const field of ['name','brand','chip','display','refresh','battery','charging','memory','description']) if (!d[field]) throw new Error('Complete the ' + field + ' field.');
  if (!Number.isSafeInteger(d.price) || d.price < 1 || d.price > 100000000) throw new Error('Enter a whole-number price between ₦1 and ₦100,000,000.');
  if (!['phone','tablet'].includes(d.category) || !families.includes(d.family)) throw new Error('Choose a valid category and brand group.');
  d.status = d.status === 'published' ? 'published' : 'draft';
  if(d.status==='published'&&!d.image)throw new Error('Add a product photo before publishing this device.');
  d.color = /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#707b71';
  d.cameras = ['redmagic','iqoo','round','legion','astra','nova'].includes(d.cameras) ? d.cameras : d.category === 'tablet' ? 'legion' : 'round';
  if (d.image && !safeImage(d.image,true)) throw new Error('Use an HTTPS image URL or upload a JPG, PNG or WebP image.');
  if (d.source && !safeLink(d.source)) throw new Error('The specifications source must be an HTTPS link.');
  d.specs = Array.isArray(input.specs) ? input.specs.slice(0,20).map(s=>({label:String(s.label||'').trim().slice(0,80),value:String(s.value||'').trim().slice(0,400)})).filter(s=>s.label&&s.value) : [];
  return d;
}
export function imageFor(d) { return safeImage(d.image,true) || 'assets/' + (d.category === 'tablet' ? 'legion-tab-gen-3' : 'redmagic-10-pro') + '.svg'; }
