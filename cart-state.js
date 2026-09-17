const key = 'deadshot-cart-v1';
export function normalizeCart(raw) {
  const result=[];
  if (!Array.isArray(raw)) return result;
  for (const row of raw.slice(0,100)) {
    if (!row || typeof row.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(row.id)) continue;
    const quantity=Math.max(0,Math.min(99,Math.floor(Number(row.quantity)||0)));
    const existing=result.find(x=>x.id===row.id);
    if(quantity){if(existing)existing.quantity=Math.min(99,existing.quantity+quantity);else result.push({id:row.id,quantity});}
  }
  return result;
}
export function getCart(){try{return normalizeCart(JSON.parse(localStorage.getItem(key)));}catch{return [];}}
export function setCart(rows){localStorage.setItem(key,JSON.stringify(normalizeCart(rows)));window.dispatchEvent(new Event('cartchange'));}
export function addToCart(id){const rows=getCart(),found=rows.find(x=>x.id===id);if(found)found.quantity=Math.min(99,found.quantity+1);else rows.push({id,quantity:1});setCart(rows);}
export function setQuantity(id,quantity){setCart(getCart().map(x=>x.id===id?{id,quantity}:x));}
export function cartSummary(rows,devices){return rows.map(r=>({device:devices.find(d=>d.id===r.id),...r}));}
