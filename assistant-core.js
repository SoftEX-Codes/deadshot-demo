import {money} from './devices-data.js?v=6';
const normal = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const handoff = 'I can’t confirm that from the catalogue. Ask Thrift Gadgets on WhatsApp for a reliable answer.';
export function answerQuestion(question, devices, lastId = '') {
  const q=normal(question).replace(/red magic/g,'redmagic').replace(/neo 9/g,'neo9').replace(/neo 10/g,'neo10');
  const result=(text,selected=[],refer=false)=>({text,ids:selected.map(d=>d.id),refer,lastId:selected.length===1?selected[0].id:lastId});
  if (!q) return result('Ask about phones, displays, RAM, charging, specifications or your budget.');
  if (/^(hi|hello|hey|yo)( there)?$/.test(q)) return result('Hi. Ask me a phone question, name a device to compare, or tell me your budget.');
  let selected=devices.filter(d=>q.includes(normal(d.name))).sort((a,b)=>b.name.length-a.name.length);
  const general=!selected.length&&!/\b(it|its|this phone|that phone|this tablet|that tablet)\b/.test(q)&&/\b(what|explain|difference|mean|how|why|vs|versus|tips)\b/.test(q);
  if(general){
    const guide=[
      [/\b(ram|storage|memory)\b/,'RAM is the fast working space for apps that are running. Storage keeps your apps, photos and downloads when the phone is off. More RAM can help multitasking; more storage gives you room for files. Virtual RAM uses storage and does not replace physical RAM.'],
      [/\b(refresh|fps|frame rate|hz)\b/,'Refresh rate (Hz) is how often a screen can update each second. FPS is how many frames a game produces. A 144 Hz screen does not guarantee 144 FPS: the game, settings, processor and temperature also matter. Higher refresh rates can make supported scrolling and games look smoother.'],
      [/\b(oled|amoled|lcd)\b/,'OLED screens light each pixel individually, so black pixels can turn off. LCD screens use a backlight. AMOLED is a type of OLED. Brightness, colour accuracy, refresh rate and dimming vary by model, so the display name alone does not tell the whole story.'],
      [/\b(cpu|gpu|processor|chipset|chip)\b/,'The CPU handles general instructions and app logic. The GPU draws graphics, including games. A phone chipset combines these with other components. Cooling, software and power limits also affect sustained performance, so a chip name alone cannot guarantee game FPS.'],
      [/\b(cooling|cooler|heat|hot|overheat)\b/,'Phones produce heat during gaming and charging. A vapor chamber spreads heat; an active fan moves air. If the phone gets too hot, it may reduce performance to control temperature. Lower graphics settings, take breaks and keep vents clear. Avoid ice or moisture on the device.'],
      [/\b(fast charge|fast charging|charger|charging|watt|watts)\b/,'Charging speed depends on the phone, charger, cable and supported charging protocol. A higher-watt charger does not force that power into the phone. Speed often slows near a full battery or when the phone is warm. Use a compatible, reputable charger and cable.'],
      [/\b(battery|mah)\b/,'Battery capacity (mAh) is one part of battery life. Screen brightness, refresh rate, signal strength, games and processor efficiency also affect runtime. Avoid prolonged heat and use the phone’s battery-care settings when available. A larger capacity alone does not guarantee longer use.'],
      [/\b(5g|4g|network|bands)\b/,'5G and 4G are mobile network technologies. Speed depends on coverage, congestion, your plan and the phone’s supported bands. Imported variants may support different bands, so confirm the exact model and your carrier before buying.'],
      [/\b(android|ios|updates|update)\b/,'Android and iOS are mobile operating systems. App compatibility, features and update support depend on the exact device and software version. Security updates fix vulnerabilities; major system updates may add features. Check the manufacturer’s policy for the specific model.'],
      [/\b(trigger|triggers)\b/,'Gaming shoulder triggers are extra controls on the edge of some phones. They can map to on-screen actions where supported. Physical buttons and touch-sensitive triggers feel different. Support depends on the phone software and the game’s rules.']
    ];
    const match=guide.find(([pattern])=>pattern.test(q));if(match)return result(match[1]);
  }
  // Stock, delivery, warranties, payment and game FPS are not facts in this catalogue.
  if (/\b(stock|available|availability|delivery|shipping|warranty|refund|return|authentic|original|genuine|installment|pay|payment|location|address|discount|fps|frame rate|codm|pubg|fortnite|waterproof|camera|benchmark|antutu|best|better|faster)\b/.test(q)) return result(handoff,[],true);
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
  if(/\b(contact|whatsapp|human|employee|person|help)\b/.test(q))return result('Speak with Thrift Gadgets on WhatsApp: 2347070724905.',[],true);
  return result(handoff,[],true);
}
