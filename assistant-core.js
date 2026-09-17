import {money} from './devices-data.js?v=5';
const normal = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const handoff = 'I can’t confirm that from the catalogue. Ask Deadshot Gadgets on WhatsApp for a reliable answer.';
export function answerQuestion(question, devices, lastId = '') {
  const q=normal(question).replace(/red magic/g,'redmagic').replace(/neo 9/g,'neo9').replace(/neo 10/g,'neo10');
  const result=(text,selected=[],refer=false)=>({text,ids:selected.map(d=>d.id),refer,lastId:selected.length===1?selected[0].id:lastId});
  if (!q) return result('Ask me about a device, specifications, demo prices or your budget.');
  if (/^(hi|hello|hey|yo)( there)?$/.test(q)) return result('Hi. Which device are you looking at? I can check the listed specs, compare devices or find options within a budget.');
  // Stock, delivery, warranties, payment and game FPS are not facts in this catalogue.
  if (/\b(stock|available|availability|delivery|shipping|warranty|refund|return|authentic|original|genuine|installment|pay|payment|location|address|discount|fps|frame rate|codm|pubg|fortnite|waterproof|camera|benchmark|antutu|best|better|faster)\b/.test(q)) return result(handoff,[],true);
  let selected=devices.filter(d=>q.includes(normal(d.name))).sort((a,b)=>b.name.length-a.name.length);
  selected=selected.filter(d=>!selected.some(x=>x.id!==d.id&&normal(x.name).startsWith(normal(d.name)+' ')&&q.includes(normal(x.name))));
  if (!selected.length && lastId && /\b(it|its|this|that|the phone|the tablet)\b/.test(q)) selected=devices.filter(d=>d.id===lastId);
  const budgetMatch=String(question).toLowerCase().replace(/,/g,'').match(/(?:under|below|budget|less than|up to|within|afford)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(k|m|million|thousand)?\b/);
  if (budgetMatch) {
    const multiplier=/^(m|million)$/.test(budgetMatch[2]||'')?1000000:/^(k|thousand)$/.test(budgetMatch[2]||'')?1000:1;
    const budget=Number(budgetMatch[1])*multiplier;
    const list=devices.filter(d=>d.price<=budget&&(!/tablet/.test(q)||d.category==='tablet')&&(!/phone/.test(q)||d.category==='phone')).sort((a,b)=>b.price-a.price).slice(0,4);
    return list.length?result('Demo options within '+money(budget)+':\n'+list.map(d=>d.name+' — '+money(d.price)).join('\n')+'\nThese are placeholder prices. Ask us for actual pricing.',list):result('No listed demo devices fit that budget. The team can help you check other options on WhatsApp.',[],true);
  }
  if (selected.length>1 || (/\b(compare|vs|versus)\b/.test(q)&&selected.length===1)) {
    if(selected.length<2)return result('Name both devices to compare, for example: “iQOO 13 vs OnePlus 13”.',selected);
    const list=selected.slice(0,3);
    return result(list.map(d=>d.name+'\n'+money(d.price)+' demo · '+d.chip+'\n'+d.refresh+' · '+d.memory+' · '+d.battery).join('\n\n')+'\n\nThese are listed specifications, not a game-performance ranking.',list);
  }
  if (selected.length===1) {
    const d=selected[0];
    const fields=[[/\b(price|cost|how much)\b/,'Demo price',money(d.price)+' (placeholder; confirm actual pricing on WhatsApp)'],[/\b(battery|mah)\b/,'Battery',d.battery],[/\b(charge|charging|charger)\b/,'Charging',d.charging],[/\b(ram|storage|memory)\b/,'RAM / storage',d.memory],[/\b(processor|chip|snapdragon|cpu)\b/,'Processor',d.chip],[/\b(refresh|hz)\b/,'Refresh rate',d.refresh+' (not a guarantee of in-game FPS)'],[/\b(screen|display|size|oled|amoled)\b/,'Display',d.display],[/\b(region|version)\b/,'Version',d.region]];
    const field=fields.find(([pattern])=>pattern.test(q));
    if(field)return result(d.name+'\n'+field[1]+': '+field[2],selected);
    if(/\b(spec|specs|specification|specifications|tell|about|details)\b/.test(q)||q===normal(d.name))return result(d.name+'\n'+d.chip+'\n'+d.display+' · '+d.refresh+'\n'+d.memory+' · '+d.battery+'\n'+d.charging+'\nDemo price: '+money(d.price),selected);
    return result(handoff,selected,true);
  }
  if (/\b(phone|phones|tablet|tablets|devices|brands|sell|list|options)\b/.test(q) && !/\b(which|why|how)\b/.test(q)) {
    let list=devices;
    if(/tablet/.test(q))list=list.filter(d=>d.category==='tablet');
    else if(/phone/.test(q))list=list.filter(d=>d.category==='phone');
    const brand=/xiaomi/.test(q)?'redmi':['redmagic','iqoo','oneplus','ace','legion','redmi','infinix'].find(b=>q.includes(b));
    if(brand)list=list.filter(d=>d.family===brand);
    list=list.slice(0,6);
    return list.length?result('Here are some devices in the demo catalogue:\n'+list.map(d=>d.name+' — '+money(d.price)).join('\n')+'\nActual stock and pricing must be confirmed.',list):result(handoff,[],true);
  }
  if(/\b(contact|whatsapp|human|employee|person|help)\b/.test(q))return result('Speak with Deadshot Gadgets on WhatsApp: +234 814 675 8428.',[],true);
  return result(handoff,[],true);
}
