// Helpers for static HTML product pages (edit HTML directly; this handles cart/gallery only)

let selectedColors = [];

function setMainImage(el, src) {
  document.getElementById('main-image').src = src;
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function toggleColor(btn, name) {
  btn.classList.toggle('selected');
  if (btn.classList.contains('selected')) {
    if (!selectedColors.includes(name)) selectedColors.push(name);
  } else {
    selectedColors = selectedColors.filter(c => c !== name);
  }
  const text = document.getElementById('selected-colors-text');
  if (text) {
    text.textContent = selectedColors.length
      ? `Selected: ${selectedColors.join(', ')}`
      : 'Please select at least one color';
  }
}

let currentQty = 1;

function updateQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  const input = document.getElementById('qty-input');
  if (input) input.value = currentQty;
}

function addToCartFromPage() {
  const id = document.body.dataset.productId;
  if (!id) return;
  addToCart(id);
}

document.addEventListener('DOMContentLoaded', () => {
  const first = document.querySelector('.color-swatch.selected');
  if (first) selectedColors = [first.getAttribute('title')];
  if (typeof loadState === 'function') loadState();
  if (typeof updateCartCount === 'function') updateCartCount();
  if (typeof initNav === 'function') initNav();
  if (typeof updateCustomerNav === 'function') updateCustomerNav();
});
