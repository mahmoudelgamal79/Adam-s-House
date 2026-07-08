document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateCartCount();
  initNav();
  initScrollReveal();
  updateCustomerNav();

  if (document.body.classList.contains('home-page')) initHome();
  if (document.body.classList.contains('department-page')) initDepartment();
  if (document.body.classList.contains('product-page') && document.getElementById('product-container')) initProduct();
  if (document.body.classList.contains('cart-page')) initCart();
});

function initNav() {
  // Remove any existing hardcoded mobile menu (kept for graceful fallback)
  const oldMenu = document.getElementById('mobile-menu');
  if (oldMenu) oldMenu.remove();

  // Remove old backdrop if page was reloaded
  const oldBackdrop = document.getElementById('mobile-backdrop');
  if (oldBackdrop) oldBackdrop.remove();

  // Build the mobile menu dynamically — works on ALL pages
  buildMobileMenu();
  initNavTheme();
}

function buildMobileMenu() {
  const nav = document.querySelector('body > nav.fixed');
  if (!nav) return;
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (!menuBtn) return;

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'mobile-backdrop';
  backdrop.className = 'mobile-backdrop';
  document.body.appendChild(backdrop);

  // Create menu panel on body — must NOT live inside nav (nav has backdrop-blur)
  const menu = document.createElement('div');
  menu.id = 'mobile-menu';
  menu.className = 'mobile-menu lg:hidden';
  menu.innerHTML = getMobileMenuHTML();
  document.body.appendChild(menu);

  // Toggle logic
  function open() {
    menu.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });
  backdrop.addEventListener('click', close);
  menu.querySelector('#mobile-menu-close')?.addEventListener('click', close);

  // Close on any menu link click
  menu.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
}

function getMobileMenuHTML() {
  const p = sitePath('');
  const cartUrl = sitePath('cart.html');
  const loginUrl = sitePath('customer-login.html');
  const registerUrl = sitePath('register.html');
  const accountUrl = sitePath('account.html');
  const homeUrl = sitePath('home.html');
  const atelierUrl = sitePath('atelier.html');

  const customer = getCustomer();

  let authLinks = '';
  if (customer) {
    authLinks = `
      <a href="${accountUrl}" class="mobile-menu-nav-link">
        <span><i class="fa-solid fa-circle-user mobile-menu-icon" style="color:var(--accent)"></i>My Account</span>
        <i class="fa-solid fa-chevron-right"></i>
      </a>`;
  } else {
    authLinks = `
      <a href="${loginUrl}" class="mobile-menu-nav-link">
        <span><i class="fa-solid fa-right-to-bracket mobile-menu-icon" style="color:var(--muted)"></i>Sign In</span>
        <i class="fa-solid fa-chevron-right"></i>
      </a>
      <a href="${registerUrl}" class="mobile-menu-nav-link">
        <span><i class="fa-solid fa-user-plus mobile-menu-icon" style="color:var(--muted)"></i>Register</span>
        <i class="fa-solid fa-chevron-right"></i>
      </a>`;
  }

  return `
    <div class="mobile-menu-header">
      <span class="font-display text-lg notranslate" style="letter-spacing:-0.02em">Menu</span>
      <button id="mobile-menu-close" type="button" class="mobile-menu-close-btn notranslate" aria-label="Close menu">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="mobile-menu-section-label">Navigate</div>
    <a href="${homeUrl}#categories" class="mobile-menu-nav-link">
      <span>Collections</span><i class="fa-solid fa-chevron-right"></i>
    </a>
    <a href="${homeUrl}#offers" class="mobile-menu-nav-link">
      <span>Offers</span><i class="fa-solid fa-chevron-right"></i>
    </a>
    <a href="${atelierUrl}" class="mobile-menu-nav-link">
      <span>Atelier</span><i class="fa-solid fa-chevron-right"></i>
    </a>
    <a href="${homeUrl}#visit" class="mobile-menu-nav-link">
      <span>Contact</span><i class="fa-solid fa-chevron-right"></i>
    </a>

    <div class="mobile-menu-section-label" style="margin-top:24px">Account</div>
    ${authLinks}

    <div class="mobile-menu-actions">
      <a href="${cartUrl}" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:var(--fg);color:var(--fg-light);font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;text-decoration:none">
        <i class="fa-solid fa-cart-shopping"></i> View Cart
      </a>
    </div>
  `;
}

function initNavTheme() {
  const nav = document.querySelector('body > nav.fixed');
  if (!nav) return;
  const darkZones = document.querySelectorAll('[data-nav-dark]');
  if (!darkZones.length) return;

  const check = () => {
    const navBottom = nav.getBoundingClientRect().bottom;
    let overDark = false;
    darkZones.forEach(zone => {
      const r = zone.getBoundingClientRect();
      if (r.top < navBottom && r.bottom > 0) overDark = true;
    });
    nav.classList.toggle('nav-over-dark', overDark);
  };

  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
}

function sitePath(file) {
  const path = window.location.pathname.replace(/\\/g, '/');
  const inSubfolder = /\/(categories|products)\//.test(path);
  return (inSubfolder ? '../' : '') + file;
}

function updateCustomerNav() {
  const customer = getCustomer();
  const loginUrl = sitePath('customer-login.html');
  const registerUrl = sitePath('register.html');
  const accountUrl = sitePath('account.html');

  document.querySelectorAll('[data-customer-name]').forEach(el => {
    el.textContent = customer ? customer.name.split(' ')[0] : '';
    el.classList.toggle('hidden', !customer);
  });
  document.querySelectorAll('[data-login-link]').forEach(el => {
    const href = el.getAttribute('href') || '';
    if (href.includes('register')) el.setAttribute('href', registerUrl);
    else if (href.includes('customer-login')) el.setAttribute('href', loginUrl);
    el.classList.toggle('hidden', !!customer);
  });
  document.querySelectorAll('[data-account-link]').forEach(el => {
    el.setAttribute('href', accountUrl);
    el.classList.toggle('hidden', !customer);
  });
  document.querySelectorAll('[data-user-link]').forEach(el => {
    el.setAttribute('href', customer ? accountUrl : loginUrl);
    el.setAttribute('title', customer ? 'My account' : 'Sign in');
  });
}

function initScrollReveal() {
  if (!window._revealObserver) {
    window._revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.1 });
  }
  document.querySelectorAll('.reveal:not(.in-view)').forEach(el => window._revealObserver.observe(el));
}

function initHome() {
  initHeroCanvas();
  initScrollReveal();
}

function renderProductCard(p, options = {}) {
  const { theme = 'light', showOffer = false, reveal = false, delay = 0, compact = false } = options;
  const onOffer = showOffer && p.onOffer && p.discount;
  const salePrice = getSalePrice(p);
  const cat = state.categories.find(c => c.id === p.category);
  const cardClass = theme === 'dark' ? 'product-card product-card-dark' : 'product-card';
  const revealAttr = reveal ? `reveal style="transition-delay: ${delay}s"` : '';
  const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return `
    <a href="products/${slug}.html" class="${cardClass} ${compact ? 'product-card-compact' : ''}" ${revealAttr}>
      <div class="product-img-wrap">
        <img src="${productImageUrl(p.images[0], 600, 450)}" alt="${p.name}" class="product-img">
        ${onOffer ? `<span class="offer-badge">-${p.discount}%</span>` : ''}
        ${p.colors?.length ? `<div class="product-color-dots">${p.colors.slice(0, 4).map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join('')}</div>` : ''}
      </div>
      <div class="p-5">
        ${cat ? `<div class="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">${cat.name}</div>` : ''}
        <h3 class="font-display text-xl mb-2">${p.name}</h3>
        ${!compact ? `<p class="text-sm text-[var(--muted)] line-clamp-2 mb-4">${p.desc}</p>` : ''}
        <div class="flex items-center justify-between pt-4 border-t ${theme === 'dark' ? 'border-[var(--border-dark)]' : 'border-[var(--border)]'}">
          <div>
            ${onOffer
              ? `<div class="font-display text-lg text-[var(--accent-light)]">${formatPrice(salePrice)}</div>
                 <div class="text-sm text-[var(--muted-light)] line-through">${formatPrice(p.price)}</div>`
              : `<div class="font-display text-lg">${formatPrice(p.price)}</div>`
            }
          </div>
          <span class="text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[var(--accent-light)]' : 'text-[var(--accent)]'} font-semibold">View</span>
        </div>
      </div>
    </a>`;
}

function initDepartment() {
  const params = new URLSearchParams(window.location.search);
  const catId = params.get('cat');
  const cat = state.categories.find(c => c.id === catId);

  if (!cat) {
    document.getElementById('dept-title').innerText = 'Collection Not Found';
    return;
  }

  document.title = `Adam's House — ${cat.name}`;
  document.getElementById('breadcrumb-cat').innerText = cat.name;
  document.getElementById('dept-title').innerText = cat.name;
  document.getElementById('dept-desc').innerText = cat.desc;

  const products = state.products.filter(p => p.category === catId && p.status === 'active');
  const grid = document.getElementById('dept-products-grid');

  if (products.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-20 text-[var(--muted)]">No pieces in this collection yet. Check back soon.</div>`;
    return;
  }

  grid.innerHTML = products.map(p => renderProductCard(p)).join('');
}


let currentQty = 1;
let currentProductId = null;

function initProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = state.products.find(p => p.id === id);

  if (!product) {
    document.getElementById('product-container').innerHTML = `<div class="text-center py-20">Product not found.</div>`;
    return;
  }

  currentProductId = product.id;
  currentQty = 1;
 

  const cat = state.categories.find(c => c.id === product.category);
  document.title = `Adam's House — ${product.name}`;
  const onOffer = product.onOffer && product.discount;
  const salePrice = getSalePrice(product);

  const container = document.getElementById('product-container');
  container.innerHTML = `
    <nav class="flex items-center gap-3 mb-8 text-sm text-[var(--muted)]">
      <a href="home.html" class="hover:text-[var(--accent)]">Home</a>
      <i class="fa-solid fa-chevron-right text-[10px]"></i>
      <a href="department.html?cat=${product.category}" class="hover:text-[var(--accent)]">${cat ? cat.name : 'Collection'}</a>
      <i class="fa-solid fa-chevron-right text-[10px]"></i>
      <span class="text-[var(--fg)]">${product.name}</span>
    </nav>

    <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
      <div class="flex flex-col gap-4">
        <div class="aspect-square overflow-hidden bg-[var(--bg-alt)]">
          <img id="main-image" src="${productImageUrl(product.images[0], 800, 800)}" alt="${product.name}" class="w-full h-full object-cover">
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
          ${product.images.map((img, i) => `
            <div class="aspect-square overflow-hidden bg-[var(--bg-alt)] thumb ${i === 0 ? 'active' : ''}" data-seed="${img}" onclick="changeMainImage('${img}', this)">
              <img src="${productImageUrl(img, 200, 200)}" alt="View ${i + 1}" class="w-full h-full object-cover">
            </div>
          `).join('')}
        </div>
        <p class="text-xs text-[var(--muted)] text-center">${product.images.length} gallery views</p>
      </div>

      <div class="flex flex-col justify-center">
        <div class="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">${cat ? cat.name : ''}</div>
        <h1 class="font-display text-4xl lg:text-5xl font-light mb-4">${product.name}</h1>
        <div class="mb-6">
          ${onOffer ? `
            <span class="inline-block bg-[var(--accent)] text-[var(--fg-light)] text-xs font-bold uppercase tracking-wider px-3 py-1 mb-3">-${product.discount}% Off</span>
            <div class="font-display text-3xl text-[var(--accent)]">${formatPrice(salePrice)}</div>
            <div class="text-lg text-[var(--muted)] line-through">${formatPrice(product.price)}</div>
          ` : `<div class="font-display text-3xl text-[var(--accent)]">${formatPrice(product.price)}</div>`}
        </div>

        <div class="border-t border-b border-[var(--border)] py-6 mb-6">
          <h3 class="text-xs uppercase tracking-wider font-bold text-[var(--muted)] mb-3">Description</h3>
          <p class="text-[var(--muted)] leading-relaxed">${product.desc}</p>
        </div>

        ${product.colors?.length ? `
        <div class="mb-8">
          <h3 class="text-xs uppercase tracking-wider font-bold text-[var(--muted)] mb-3">Available Colors <span class="font-normal normal-case">(select one or more)</span></h3>
          <div class="flex flex-wrap gap-3" id="color-picker">
            ${product.colors.map((c, i) => `
              <button type="button" class="color-swatch ${i === 0 ? 'selected' : ''}" data-color="${c.name}" onclick="toggleColor(this, '${c.name}')" title="${c.name}">
                <span class="color-swatch-inner" style="background:${c.hex}"></span>
                <span class="color-swatch-label">${c.name}</span>
              </button>
            `).join('')}
          </div>
          <p class="text-sm text-[var(--muted)] mt-3" id="selected-colors-text">Selected: ${product.colors[0].name}</p>
        </div>
        ` : ''}

        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center border border-[var(--border)]">
            <button type="button" onclick="updateQty(-1)" class="px-4 py-3 text-lg hover:bg-[var(--bg-alt)]">−</button>
            <input id="qty-input" type="text" value="1" class="w-12 text-center bg-transparent border-none focus:outline-none" readonly>
            <button type="button" onclick="updateQty(1)" class="px-4 py-3 text-lg hover:bg-[var(--bg-alt)]">+</button>
          </div>
          <button type="button" onclick="addToCart('${product.id}')" class="btn-primary flex-1 justify-center">
            <span>Add to Cart</span>
            <i class="fa-solid fa-cart-plus"></i>
          </button>
        </div>

        <p class="text-sm text-[var(--muted)] flex items-center gap-2 mb-4">
          <i class="fa-solid fa-lock text-xs"></i> Sign in required to complete your order
        </p>
        <div class="text-sm text-[var(--muted)] flex items-center gap-2">
          <i class="fa-solid fa-truck"></i> Free delivery in Alexandria · 12-week build
        </div>
      </div>
    </div>
  `;

  selectedColors = product.colors?.[0] ? [product.colors[0].name] : [];

  const related = state.products.filter(p =>
    p.category === product.category && p.id !== product.id && p.status === 'active'
  );

  if (related.length > 0) {
    container.innerHTML += `
      <section class="mt-24 pt-16 border-t border-[var(--border)]">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div class="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">Same Collection</div>
            <h2 class="font-display text-3xl lg:text-4xl font-light">More from ${cat ? cat.name : 'this category'}</h2>
          </div>
          <a href="department.html?cat=${product.category}" class="text-sm uppercase tracking-wider text-[var(--accent)] font-semibold hover:underline">
            View all <i class="fa-solid fa-arrow-right ml-1"></i>
          </a>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${related.map(p => renderProductCard(p, { compact: true })).join('')}
        </div>
      </section>
    `;
    initScrollReveal();
  }
}

function changeMainImage(seed, el) {
  document.getElementById('main-image').src = productImageUrl(seed, 800, 800);
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

function updateQty(delta) {
  const input = document.getElementById('qty-input');
  currentQty = Math.max(1, currentQty + delta);
  input.value = currentQty;
}

function requireCustomerLogin(returnUrl) {
  if (getCustomer()) return true;
  window.location.href = `customer-login.html?return=${encodeURIComponent(returnUrl || window.location.pathname + window.location.search)}`;
  return false;
}

function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  const colors = selectedColors.length ? [...selectedColors] : (product?.colors?.[0] ? [product.colors[0].name] : ['Default']);
  if (product?.colors?.length && colors.length === 0) {
    showToast('Please select at least one color.');
    return;
  }
  const colorKey = colors.sort().join('|');

  const existing = cart.find(item => item.id === id && item.colorKey === colorKey);
  if (existing) {
    existing.qty += currentQty;
  } else {
    cart.push({ id, qty: currentQty, colors, colorKey });
  }
  saveCart();
  showToast('Added to cart!');
}

function initCart() {
  const container = document.getElementById('cart-container');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <i class="fa-solid fa-cart-shopping text-5xl text-[var(--muted)] mb-6"></i>
        <h2 class="font-display text-3xl mb-4">Your cart is empty</h2>
        <p class="text-[var(--muted)] mb-8">Browse our collections and add pieces you love.</p>
        <a href="home.html#categories" class="btn-primary mt-4"><span>Browse Collections</span></a>
      </div>`;
    return;
  }

  let html = `<div class="grid lg:grid-cols-3 gap-8"><div class="lg:col-span-2 space-y-4">`;
  let subtotal = 0;

  cart.forEach((item, index) => {
    const product = state.products.find(p => p.id === item.id);
    if (!product) return;
    const unitPrice = getSalePrice(product);
    subtotal += unitPrice * item.qty;
    const colorLabel = item.colors?.join(', ') || '—';
    html += `
      <div class="flex gap-4 border border-[var(--border)] p-4 bg-[var(--bg)]">
        <img src="${productImageUrl(product.images[0], 200, 200)}" class="w-24 h-24 object-cover shrink-0" alt="">
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 class="font-display text-lg">${product.name}</h3>
            <div class="text-sm text-[var(--muted)]">${formatPrice(unitPrice)} each</div>
            <div class="text-xs text-[var(--accent)] mt-1">Colors: ${colorLabel}</div>
          </div>
        </div>
        <div class="flex flex-col items-end justify-between shrink-0">
          <button type="button" onclick="removeFromCartByIndex(${index})" class="text-[var(--muted)] hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
          <div class="flex items-center border border-[var(--border)]">
            <button type="button" onclick="changeCartQtyByIndex(${index}, -1)" class="px-2 py-1">−</button>
            <span class="px-3">${item.qty}</span>
            <button type="button" onclick="changeCartQtyByIndex(${index}, 1)" class="px-2 py-1">+</button>
          </div>
          <div class="font-display text-lg">${formatPrice(unitPrice * item.qty)}</div>
        </div>
      </div>
    `;
  });

  const customer = getCustomer();
  html += `</div>
    <div class="lg:col-span-1">
      <div class="bg-[var(--bg-alt)] p-6 sticky top-24">
        <h3 class="font-display text-2xl mb-2">Order Summary</h3>
        ${customer
          ? `<p class="text-sm text-[var(--muted)] mb-6">Ordering as <strong>${customer.name}</strong></p>`
          : `<p class="text-sm text-[var(--muted)] mb-6"><a href="customer-login.html?return=cart.html" class="text-[var(--accent)] font-semibold hover:underline">Sign in</a> or <a href="register.html?return=cart.html" class="text-[var(--accent)] font-semibold hover:underline">register</a> to place your order.</p>`
        }
        <div class="flex justify-between mb-2 text-sm"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="flex justify-between mb-2 text-sm text-[var(--muted)]"><span>Delivery</span><span>Free in Alexandria</span></div>
        <div class="border-t border-[var(--border)] my-4 pt-4 flex justify-between font-display text-xl">
          <span>Total</span><span>${formatPrice(subtotal)}</span>
        </div>
        <button type="button" onclick="checkout()" class="btn-primary w-full mt-4 justify-center">
          <span>${customer ? 'Place Order' : 'Sign In to Order'}</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
        ${customer ? `<button type="button" onclick="customerLogout()" class="w-full mt-3 text-sm text-[var(--muted)] hover:text-[var(--accent)]">Sign out</button>` : ''}
      </div>
    </div>
  </div>`;

  container.innerHTML = html;
}

function changeCartQtyByIndex(index, delta) {
  const item = cart[index];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(index, 1);
  saveCart();
  initCart();
}

function removeFromCartByIndex(index) {
  cart.splice(index, 1);
  saveCart();
  initCart();
  showToast('Item removed from cart.');
}

function changeCartQty(id, colorKey, delta) {
  const item = cart.find(i => i.id === id && i.colorKey === colorKey);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => !(i.id === id && i.colorKey === colorKey));
    saveCart();
    initCart();
  }
}

function removeFromCart(id, colorKey) {
  cart = cart.filter(i => !(i.id === id && i.colorKey === colorKey));
  saveCart();
  initCart();
  showToast('Item removed from cart.');
}

function checkout() {
  if (!requireCustomerLogin('cart.html')) return;
  const orders = JSON.parse(localStorage.getItem('adams-house-orders') || '[]');
  const customer = getCustomer();
  const orderItems = cart.map(item => {
    const product = state.products.find(p => p.id === item.id);
    return { ...item, name: product?.name, price: product ? getSalePrice(product) : 0 };
  });
  const total = orderItems.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);
  orders.push({
    id: uid(),
    date: new Date().toISOString(),
    customer: { name: customer.name, email: customer.email, phone: customer.phone },
    items: orderItems,
    total,
    status: 'pending'
  });
  localStorage.setItem('adams-house-orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  showToast('Order placed successfully! We will contact you shortly.');
  setTimeout(() => { window.location.href = 'home.html'; }, 2000);
}

function customerLogout() {
  localStorage.removeItem(CUSTOMER_KEY);
  window.location.href = 'home.html';
}

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.3,
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(189, 93, 52, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

(function () {
  const original = window.updateCustomerNav;
  if (typeof original !== 'function') return;
  window.updateCustomerNav = function () {
    original.apply(this, arguments);
    const customer = getCustomer();
    document.querySelectorAll('[data-account-link]').forEach(el => {
      if (customer) { el.style.display = ''; el.classList.remove('hidden'); }
      else { el.style.display = 'none'; el.classList.add('hidden'); }
    });
  };
})();
