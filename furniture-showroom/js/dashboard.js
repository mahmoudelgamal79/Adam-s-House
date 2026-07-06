const MANAGER_AUTH_KEY = 'adams-house-manager-auth';
let editingProductId = null;

// ── XSS sanitizer ─────────────────────────────────────────────────────────
// Escapes any user-entered text before inserting it into innerHTML.
function sanitize(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ── Manager session validation ─────────────────────────────────────────────
// isManagerLoggedIn() is defined in data.js (loaded before this file).
// It validates the token format: <64-char SHA-256 hex>-<unix timestamp ms>

const SESSION_MAX_MS = 8 * 60 * 60 * 1000; // 8-hour session lifetime

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem(MANAGER_AUTH_KEY);

  // Check token format
  if (!token || !/^[0-9a-f]{64}-\d+$/.test(token)) {
    window.location.href = 'login.html';
    return;
  }

  // Check token has not expired
  const timestamp = parseInt(token.split('-').pop(), 10);
  if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_MS) {
    localStorage.removeItem(MANAGER_AUTH_KEY);
    window.location.href = 'login.html';
    return;
  }

  loadState();
  renderDashboard();
});

function logout() {
  localStorage.removeItem(MANAGER_AUTH_KEY);
  window.location.href = 'login.html';
}

function switchPanel(name, btn) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-' + name).classList.remove('hidden');
  document.querySelectorAll('.dash-sidebar-link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const titles = { overview: 'Overview', products: 'Products', categories: 'Categories', offers: 'Special Offers', orders: 'Orders', showroom: 'Showroom Info' };
  document.getElementById('panel-title').textContent = titles[name] || name;
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  editingProductId = null;
}

function renderDashboard() {
  document.getElementById('stat-products').innerText = state.products.length;
  document.getElementById('stat-categories').innerText = state.categories.length;
  document.getElementById('stat-offers').innerText = state.offers.filter(o => o.status === 'active').length;
  const totalValue = state.products.reduce((sum, p) => sum + (p.price || 0), 0);
  document.getElementById('stat-value').innerText = formatPrice(totalValue);

  const orders = JSON.parse(localStorage.getItem('adams-house-orders') || '[]');
  const statOrders = document.getElementById('stat-orders');
  if (statOrders) statOrders.innerText = orders.length;

  const recent = [...state.products].slice(-5).reverse();
  document.getElementById('recent-products').innerHTML = recent.length
    ? recent.map(p => `
        <tr>
          <td>${sanitize(p.name)}</td>
          <td class="text-[var(--muted-light)]">${sanitize(state.categories.find(c => c.id === p.category)?.name || '—')}</td>
          <td>${sanitize(formatPrice(p.price))}</td>
          <td><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}">${sanitize(p.status)}</span></td>
        </tr>`).join('')
    : '<tr><td colspan="4" class="text-[var(--muted-light)]">No products yet</td></tr>';

  renderProductsTable();
  renderCategoriesManage();
  renderOffersManage();
  renderOrdersTable();
  renderShowroomForm();
}

function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = state.products.map(p => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <img src="${productImageUrl(p.images[0], 48, 48)}" class="w-10 h-10 object-cover rounded" alt="">
          <span>${sanitize(p.name)}</span>
        </div>
      </td>
      <td>${sanitize(state.categories.find(c => c.id === p.category)?.name || '—')}</td>
      <td>${sanitize(formatPrice(p.price))}</td>
      <td>${sanitize(p.colors?.length || 0)} colors</td>
      <td><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}">${sanitize(p.status)}</span></td>
      <td>
        <button type="button" onclick="editProduct('${sanitize(p.id)}')" class="text-[var(--accent-light)] hover:opacity-80"><i class="fa-solid fa-pen"></i></button>
        <button type="button" onclick="deleteProduct('${sanitize(p.id)}')" class="text-red-400 ml-2 hover:opacity-80"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function renderCategoriesManage() {
  document.getElementById('categories-manage-grid').innerHTML = state.categories.map(c => `
    <div class="bg-[var(--bg-dark-alt)] border border-[var(--border-dark)] rounded p-5">
      <div class="flex items-center gap-3 mb-2">
        <i class="fa-solid ${sanitize(c.icon)} text-[var(--accent-light)]"></i>
        <div class="font-display text-lg">${sanitize(c.name)}</div>
      </div>
      <p class="text-sm text-[var(--muted-light)] mb-3">${sanitize(c.desc)}</p>
      <div class="text-xs text-[var(--muted-light)]">${state.products.filter(p => p.category === c.id).length} products</div>
    </div>`).join('');
}

function renderOffersManage() {
  document.getElementById('offers-manage-grid').innerHTML = state.offers.map(o => `
    <div class="bg-[var(--bg-dark-alt)] border border-[var(--border-dark)] rounded p-6">
      <div class="flex justify-between mb-2">
        <span class="font-display text-2xl text-[var(--accent-light)]">-${sanitize(o.discount)}%</span>
        <span class="badge ${o.status === 'active' ? 'badge-success' : 'badge-warning'}">${sanitize(o.status)}</span>
      </div>
      <h3 class="font-display text-xl">${sanitize(o.title)}</h3>
      <p class="text-sm text-[var(--muted-light)] mt-2">${sanitize(o.desc)}</p>
    </div>`).join('');
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;
  const orders = JSON.parse(localStorage.getItem('adams-house-orders') || '[]').reverse();
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-[var(--muted-light)]">No orders yet</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${sanitize(new Date(o.date).toLocaleDateString())}</td>
      <td>${sanitize(o.customer?.name || '—')}</td>
      <td>${sanitize(o.customer?.phone || '—')}</td>
      <td>${sanitize(o.items?.length || 0)} items</td>
      <td>${sanitize(formatPrice(o.total))}</td>
      <td><span class="badge badge-warning">${sanitize(o.status)}</span></td>
    </tr>`).join('');
}

function renderShowroomForm() {
  document.getElementById('sr-name').value    = state.showroom.name;
  document.getElementById('sr-phone').value   = state.showroom.phone;
  document.getElementById('sr-address').value = state.showroom.address;
}

function saveShowroomInfo() {
  state.showroom.name    = document.getElementById('sr-name').value.trim();
  state.showroom.phone   = document.getElementById('sr-phone').value.trim();
  state.showroom.address = document.getElementById('sr-address').value.trim();
  saveState();
  showToast('Showroom info saved.');
}

function openProductModal() {
  editingProductId = null;
  document.getElementById('product-form').reset();
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('product-category').innerHTML = state.categories.map(c =>
    `<option value="${sanitize(c.id)}">${sanitize(c.name)}</option>`
  ).join('');
  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById(`product-img-${i}`);
    if (el) el.value = '';
  }
  document.getElementById('product-modal').classList.add('active');
}

function editProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-name').value     = p.name;
  document.getElementById('product-category').innerHTML = state.categories.map(c =>
    `<option value="${sanitize(c.id)}" ${c.id === p.category ? 'selected' : ''}>${sanitize(c.name)}</option>`
  ).join('');
  document.getElementById('product-price').value  = p.price;
  document.getElementById('product-desc').value   = p.desc || '';
  document.getElementById('product-colors').value = (p.colors || []).map(c => `${c.name}:${c.hex}`).join(', ');
  document.getElementById('product-status').value = p.status;
  p.images.forEach((img, i) => {
    const el = document.getElementById(`product-img-${i + 1}`);
    if (el) el.value = img;
  });
  document.getElementById('product-modal').classList.add('active');
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  state.products = state.products.filter(p => p.id !== id);
  saveState();
  renderDashboard();
  showToast('Product deleted.');
}

function parseColors(input) {
  if (!input.trim()) return [...DEFAULT_COLORS];
  return input.split(',').map(s => {
    const [name, hex] = s.trim().split(':');
    return { name: name.trim(), hex: (hex || '#888888').trim() };
  }).filter(c => c.name);
}

function saveProduct() {
  const name  = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);

  if (!name)          { showToast('Product name is required.');     return; }
  if (isNaN(price) || price <= 0) { showToast('Enter a valid price.'); return; }

  const images = [];
  for (let i = 1; i <= 7; i++) {
    const val = document.getElementById(`product-img-${i}`).value.trim();
    images.push(val || `img-${uid()}-${i}`);
  }

  const data = {
    name,
    category: document.getElementById('product-category').value,
    price,
    desc:   document.getElementById('product-desc').value.trim(),
    colors: parseColors(document.getElementById('product-colors').value),
    images,
    status: document.getElementById('product-status').value
  };

  if (editingProductId) {
    const idx = state.products.findIndex(p => p.id === editingProductId);
    if (idx >= 0) state.products[idx] = { ...state.products[idx], ...data };
  } else {
    state.products.push({ id: uid(), ...data });
  }

  saveState();
  closeModal('product-modal');
  renderDashboard();
  showToast(editingProductId ? 'Product updated.' : 'Product added.');
}

function openOfferModal() {
  document.getElementById('offer-form').reset();
  document.getElementById('offer-modal').classList.add('active');
}

function saveOffer() {
  const title    = document.getElementById('offer-title').value.trim();
  const discount = parseInt(document.getElementById('offer-discount').value, 10);

  if (!title)                         { showToast('Offer title is required.');         return; }
  if (isNaN(discount) || discount < 1 || discount > 99) {
    showToast('Discount must be between 1 and 99.');
    return;
  }

  const offer = {
    id:         uid(),
    title,
    desc:       document.getElementById('offer-desc').value.trim(),
    discount,
    validUntil: document.getElementById('offer-valid').value,
    status:     'active'
  };
  state.offers.push(offer);
  saveState();
  closeModal('offer-modal');
  renderDashboard();
  showToast('Offer created.');
}