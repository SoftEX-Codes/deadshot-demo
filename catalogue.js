// Add the shop's confirmed inventory here when supplied.
// Each device: id, name, category (phone/tablet), brand, memory, condition,
// availability, price, description, and optional local image path.
const devices = [];
let currentCategory = null;
const grid = document.getElementById('device-grid');
function renderDevices(category) {
  if (category === currentCategory) return;
  const changing = currentCategory !== null;
  currentCategory = category;
  const fragment = document.createDocumentFragment();
  const matches = devices.filter(device => category === 'all' || device.category === category);
  grid.replaceChildren();
  matches.forEach(device => {
    const card = document.createElement('a');
    card.className = 'device-card';
    card.href = 'device.html?id=' + encodeURIComponent(device.id);
    if (device.image) {
      const img = document.createElement('img');
      img.src = device.image; img.alt = device.name; img.loading = "lazy"; img.decoding = "async"; img.width = 600; img.height = 600; card.append(img);
    }
    const name = document.createElement('h2'); name.textContent = device.name;
    const price = document.createElement('p'); price.textContent = device.price || 'Ask for price';
    const action = document.createElement('p'); action.textContent = 'View device ↗';
    card.append(name, price, action); fragment.append(card);
  });
  grid.replaceChildren(fragment);
  if (changing) window.deadshotMotion?.reveal(matches.length ? grid : document.getElementById('catalogue-empty'));
  document.getElementById('device-count').textContent = matches.length + (matches.length === 1 ? ' device' : ' devices');
  document.getElementById('catalogue-empty').hidden = matches.length > 0;
  document.getElementById('empty-title').textContent = category === 'all' ? 'Devices coming soon.' : category === 'phone' ? 'Phones coming soon.' : 'Tablets coming soon.';
  document.getElementById('empty-description').textContent = category === 'all' ? 'Our device collection will be added soon. Check back for available phones and tablets.' : 'No ' + (category === 'phone' ? 'phones' : 'tablets') + ' are listed yet. Check back for the collection.';
  document.querySelectorAll('[data-category]').forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
  });
}
if (grid) {
  renderDevices('all');
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => renderDevices(button.dataset.category)));
}
const enquiry = document.getElementById('enquiry-button');
if (enquiry) {
  const id = new URLSearchParams(location.search).get('id');
  const device = devices.find(item => item.id === id);
  if (device) {
    document.title = device.name + ' — Deadshot Gadgets';
    document.getElementById('detail-name').textContent = device.name;
    document.getElementById('detail-category').textContent = device.category === 'tablet' ? 'GAMING TABLET' : 'GAMING PHONE';
    document.getElementById('detail-description').textContent = device.description || '';
    document.getElementById('detail-price').textContent = device.price || 'Ask for price';
    document.querySelectorAll('#device-specs dd').forEach((el, i) => el.textContent = [device.brand, device.memory, device.condition, device.availability][i] || 'Ask for details');
    if (device.image) {
      const img = document.createElement('img'); img.src = device.image; img.alt = device.name;
      document.getElementById('device-visual').replaceChildren(img);
    }
    document.getElementById('device-whatsapp').href = 'https://wa.me/2348146758428?text=' + encodeURIComponent('Hi Deadshot Gadgets, I would like to enquire about ' + device.name + '.');
  } else if (id) {
    document.getElementById('detail-name').textContent = 'Device not found';
    document.getElementById('detail-description').textContent = 'This device is not listed. Browse the collection or ask us on WhatsApp.';
  }
  enquiry.addEventListener('click', () => {
    const panel = document.getElementById('enquiry-panel');
    panel.hidden = !panel.hidden;
    enquiry.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) window.deadshotMotion?.reveal(panel);
  });
}
