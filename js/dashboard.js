// ── Admin dashboard shared logic ──────────────────────────────────────────
// This file is loaded by dashboard.html. The page also has an inline <script>
// that defines panel-specific render functions (renderOverviewExtended,
// filterProducts, renderProductsPage, renderCatGrid, renderOrdersTable,
// renderOffersGrid, renderCustomersTable, initShowroomForm, saveShowroom,
// saveOffer, showPanel, deleteOfferById). Those inline functions own the
// correct element IDs; this file provides the cross-cutting helpers (auth
// guard, modal open/edit/save for products & offers, delete, sanitize) and
// MUST use the same IDs as the HTML:
//   Product modal  -> #prod-modal, #prod-modal-title, #f-name, #f-cat,
//                     #f-price, #f-desc, #f-colors, #f-status, #f-discount,
//                     #f-img1 … #f-img7
//   Offer modal    -> #offer-modal, #o-title, #o-desc, #o-discount, #o-valid
//   Overview stats -> #s-products, #s-cats, #s-offers, #s-value, #s-orders,
//                     #recent-tbody

// NOTE: MANAGER_AUTH_KEY is already declared in data.js (loaded first).
// Do NOT redeclare it here — redeclaring a top-level const across scripts
// throws a SyntaxError that silently kills this entire file.
let editingProductId = null;
const SESSION_MAX_MS = 8 * 60 * 60 * 1000; // 8-hour session lifetime

// ── XSS sanitizer ─────────────────────────────────────────────────────────
// Escapes any user-entered text before inserting it into innerHTML.
function sanitize(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ── Manager session validation ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem(MANAGER_AUTH_KEY);

  // Token format: <64-char SHA-256 hex>-<unix timestamp ms>
  if (!token || !/^[0-9a-f]{64}-\d+$/.test(token)) {
    window.location.href = 'login.html';
    return;
  }

  // Reject expired tokens
  const timestamp = parseInt(token.split('-').pop(), 10);
  if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_MS) {
    localStorage.removeItem(MANAGER_AUTH_KEY);
    window.location.href = 'login.html';
    return;
  }

  loadState();
  // The inline script's renderOverviewExtended() owns the chart + correct IDs.
  // Fall back to a guarded renderDashboard() if it is ever absent.
  if (typeof renderOverviewExtended === 'function') {
    renderOverviewExtended();
  } else {
    renderDashboard();
  }
});

function logout() {
  localStorage.removeItem(MANAGER_AUTH_KEY);
  window.location.href = 'login.html';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
  editingProductId = null;
}

// ── Safe overview renderer (fallback only — inline renderOverviewExtended
//    is preferred because it also draws the Chart.js bar chart). ───────────
function renderDashboard() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('s-products', state.products.length);
  set('s-cats', state.categories.length);
  set('s-offers', state.offers.filter(o => o.status === 'active').length);

  const totalValue = state.products.reduce((sum, p) => sum + (p.price || 0), 0);
  set('s-value', formatPrice(totalValue));

  const orders = JSON.parse(localStorage.getItem('adams-house-orders') || '[]');
  set('s-orders', orders.length);

  const recentBody = document.getElementById('recent-tbody');
  if (recentBody) {
    const recent = [...state.products].slice(-5).reverse();
    recentBody.innerHTML = recent.length
      ? recent.map(p => `
        <tr>
          <td>${sanitize(p.name)}</td>
          <td class="text-[var(--muted-light)]">${sanitize(state.categories.find(c => c.id === p.category)?.name || '—')}</td>
          <td>${sanitize(formatPrice(p.price))}</td>
          <td><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}">${sanitize(p.status)}</span></td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="text-[var(--muted-light)] text-center p-6">No products yet</td></tr>';
  }
}

// ── Helpers shared by the product modal ────────────────────────────────────
function populateCategorySelect(selectedId) {
  const sel = document.getElementById('f-cat');
  if (!sel) return;
  sel.innerHTML = state.categories.map(c =>
    `<option value="${sanitize(c.id)}" ${c.id === selectedId ? 'selected' : ''}>${sanitize(c.name)}</option>`
  ).join('');
}

function clearImageInputs() {
  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById('f-img' + i);
    if (el) el.value = '';
  }
}

function parseColors(input) {
  if (!input || !input.trim()) return [...DEFAULT_COLORS];
  return input.split(',').map(s => {
    const [name, hex] = s.trim().split(':');
    return { name: (name || '').trim(), hex: (hex || '#888888').trim() };
  }).filter(c => c.name);
}

// ── Product modal: open / edit / save ──────────────────────────────────────
function openProductModal() {
  editingProductId = null;
  populateCategorySelect();
  // Reset all form fields
  ['f-name', 'f-price', 'f-desc', 'f-colors'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const status = document.getElementById('f-status');
  if (status) status.value = 'active';
  const discount = document.getElementById('f-discount');
  if (discount) discount.value = '';
  clearImageInputs();

  const title = document.getElementById('prod-modal-title');
  if (title) title.textContent = 'Add Product';
  const modal = document.getElementById('prod-modal');
  if (modal) modal.classList.add('active');
}

function editProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  populateCategorySelect(p.category);
  setVal('f-name', p.name);
  setVal('f-price', p.price);
  setVal('f-desc', p.desc || '');
  setVal('f-colors', (p.colors || []).map(c => `${c.name}:${c.hex}`).join(', '));
  setVal('f-status', p.status || 'active');
  setVal('f-discount', p.discount || 0);

  clearImageInputs();
  (p.images || []).forEach((img, i) => {
    const el = document.getElementById('f-img' + (i + 1));
    if (el) el.value = img;
  });

  const title = document.getElementById('prod-modal-title');
  if (title) title.textContent = 'Edit Product';
  const modal = document.getElementById('prod-modal');
  if (modal) modal.classList.add('active');
}

function saveProduct() {
  const name  = (document.getElementById('f-name').value || '').trim();
  const price = parseFloat(document.getElementById('f-price').value);

  if (!name)                  { showToast('Product name is required.');     return; }
  if (isNaN(price) || price <= 0) { showToast('Enter a valid price.'); return; }

  const images = [];
  for (let i = 1; i <= 7; i++) {
    const el = document.getElementById('f-img' + i);
    const val = el ? el.value.trim() : '';
    images.push(val || `img-${uid()}-${i}`);
  }

  const discountRaw = parseInt(document.getElementById('f-discount').value, 10);
  const discount = (!isNaN(discountRaw) && discountRaw > 0) ? discountRaw : 0;

  const data = {
    name,
    category: document.getElementById('f-cat').value,
    price,
    desc:   (document.getElementById('f-desc').value || '').trim(),
    colors: parseColors(document.getElementById('f-colors').value),
    images,
    status: document.getElementById('f-status').value,
    onOffer: discount > 0,
    discount
  };

  if (editingProductId) {
    const idx = state.products.findIndex(p => p.id === editingProductId);
    if (idx >= 0) state.products[idx] = { ...state.products[idx], ...data };
  } else {
    state.products.push({ id: uid(), ...data });
  }

  saveState();
  closeModal('prod-modal');

  // Refresh whatever panel is active. The inline script owns these; guard
  // them so saveProduct never throws even if loaded standalone.
  if (typeof filterProducts === 'function') filterProducts();
  if (typeof renderOverviewExtended === 'function') renderOverviewExtended();
  else renderDashboard();

  showToast(editingProductId ? 'Product updated.' : 'Product added.');
  editingProductId = null;
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  state.products = state.products.filter(p => p.id !== id);
  saveState();
  if (typeof filterProducts === 'function') filterProducts();
  if (typeof renderOverviewExtended === 'function') renderOverviewExtended();
  else renderDashboard();
  showToast('Product deleted.');
}

// ── Offer modal: open ──────────────────────────────────────────────────────
// (saveOffer is defined in the inline script with the correct o-* IDs, so it
//  takes precedence. This openOfferModal uses the same o-* IDs to reset.)
function openOfferModal() {
  ['o-title', 'o-desc', 'o-discount', 'o-valid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const modal = document.getElementById('offer-modal');
  if (modal) modal.classList.add('active');
}
