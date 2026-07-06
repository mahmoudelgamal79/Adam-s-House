const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATEGORIES = [
  { id: 'Master-bedrooms', name: 'Master Bedrooms', desc: 'Grand beds, wardrobes, and dressers for spacious master suites.', file: 'master-bedrooms.html' },
  { id: 'childrens-rooms', name: "Children's Rooms", desc: 'Bunk beds, study desks, and playful storage for growing families.', file: 'childrens-rooms.html' },
  { id: 'dining-rooms', name: 'Dining Rooms', desc: 'Dining tables, chairs, and sideboards for memorable gatherings.', file: 'dining-rooms.html' },
  { id: 'Salons', name: 'Salons', desc: 'Elegant formal living spaces for entertaining guests in style.', file: 'salons.html' },
  { id: 'corner-sofas', name: 'Corner Sofas', desc: 'L-shaped and modular corner sofas for comfortable living spaces.', file: 'corner-sofas.html' },
  { id: 'living-room', name: 'Living Room', desc: 'Complete salon suites with sofas, armchairs, and coffee tables.', file: 'living-room.html' },
  { id: 'Libraries', name: 'Libraries', desc: 'Vitrines, niches, and shelving to showcase your finest pieces.', file: 'libraries.html' }
];

const PRODUCTS = [
  { id: 'p1', slug: 'vienna-canopy-bed', name: 'Vienna Canopy Bed', category: 'Master-bedrooms', price: 42000, onOffer: true, discount: 20, desc: 'Hand-joined canopy in European walnut with brass fittings. A timeless centerpiece for the principal suite. Dimensions: 180×200 cm.', colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Espresso', hex: '#3b2f2f' }, { name: 'Ivory White', hex: '#f5f0e8' }], image: 'photos/1.jpeg' },
  { id: 'p2', slug: 'sofia-dresser', name: 'Sofia Dresser', category: 'Master-bedrooms', price: 18500, onOffer: true, discount: 15, desc: 'Six-drawer dresser with soft-close runners, crafted from solid oak with hand-rubbed finish.', colors: [{ name: 'Natural Oak', hex: '#c4a35a' }, { name: 'Walnut', hex: '#5c4033' }], image: 'photos/1.jpeg' },
  { id: 'p10', slug: 'imperial-wardrobe', name: 'Imperial Wardrobe', category: 'Master-bedrooms', price: 29500, desc: 'Double-door wardrobe with mirrored panels, hanging rail, and adjustable shelving. Solid walnut construction.', colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'White Oak', hex: '#e8dcc8' }], image: 'photos/1.jpeg' },
  { id: 'p3', slug: 'astro-bunk-bed', name: 'Astro Bunk Bed', category: 'childrens-rooms', price: 16500, desc: 'Stackable pine bunk with safety rails and integrated ladder. Non-toxic, child-safe finish.', colors: [{ name: 'Natural Pine', hex: '#deb887' }, { name: 'Sky Blue', hex: '#6b9bd1' }, { name: 'Soft Pink', hex: '#e8b4b8' }], image: 'photos/1.jpeg' },
  { id: 'p4', slug: 'explorer-study-set', name: 'Explorer Study Set', category: 'childrens-rooms', price: 12800, desc: 'Desk, bookshelf, and chair set designed for homework and creative play.', colors: [{ name: 'White', hex: '#f5f5f5' }, { name: 'Grey Oak', hex: '#8b8680' }], image: 'photos/Material_1.png' },
  { id: 'p11', slug: 'rainbow-toy-storage', name: 'Rainbow Toy Storage', category: 'childrens-rooms', price: 8900, onOffer: true, discount: 10, desc: 'Colorful cubby storage unit with bins for toys, books, and clothes. Rounded edges for safety.', colors: [{ name: 'Multi Pastel', hex: '#e8b4b8' }, { name: 'Natural Wood', hex: '#deb887' }], image: 'photos/Material_1.png' },
  { id: 'p5', slug: 'toscana-dining-table', name: 'Toscana Dining Table', category: 'dining-rooms', price: 32000, onOffer: true, discount: 20, desc: 'Extending solid oak table seating 8 to 12 comfortably. Includes protective felt pads.', colors: [{ name: 'Natural Oak', hex: '#c4a35a' }, { name: 'Walnut', hex: '#5c4033' }, { name: 'Ebony', hex: '#2c2416' }], image: 'photos/Timber.png' },
  { id: 'p12', slug: 'luna-dining-chairs', name: 'Luna Dining Chairs (Set of 6)', category: 'dining-rooms', price: 14400, desc: 'Upholstered dining chairs with curved backrests and solid beech legs. Sold as a set of six.', colors: [{ name: 'Beige Linen', hex: '#d4c5ad' }, { name: 'Charcoal', hex: '#36454f' }, { name: 'Olive', hex: '#6b7c4c' }], image: 'photos/Timber.png' },
  { id: 'p13', slug: 'roma-sideboard', name: 'Roma Sideboard', category: 'dining-rooms', price: 22800, desc: 'Wide sideboard with wine rack, drawers, and glass display top. Perfect for formal dining rooms.', colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Black', hex: '#1a1a1a' }], image: 'photos/Timber.png' },
  { id: 'p6', slug: 'sorrento-shoe-cabinet', name: 'Sorrento Shoe Cabinet', category: 'Salons', price: 7200, desc: 'Three-tier tilt-out cabinet hiding up to 18 pairs in elegant walnut veneer.', colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'White Gloss', hex: '#fafafa' }], image: 'photos/Workshop.png' },
  { id: 'p14', slug: 'entry-pro-hall-unit', name: 'Entry Pro Hall Unit', category: 'Salons', price: 11500, onOffer: true, discount: 15, desc: 'Combined shoe rack, coat hooks, and bench seat for your entryway. Space for 24 pairs.', colors: [{ name: 'Grey Oak', hex: '#8b8680' }, { name: 'White', hex: '#f5f5f5' }], image: 'photos/Workshop.png' },
  { id: 'p7', slug: 'milano-corner-sofa', name: 'Milano Corner Sofa', category: 'corner-sofas', price: 38500, onOffer: true, discount: 15, desc: 'L-shaped modular corner sofa with down-fill cushions and removable covers.', colors: [{ name: 'Charcoal', hex: '#36454f' }, { name: 'Sand', hex: '#c9b99a' }, { name: 'Forest Green', hex: '#2d4a3e' }, { name: 'Navy', hex: '#1e3a5f' }], image: 'photos/Material_2.png' },
  { id: 'p15', slug: 'urban-l-sectional', name: 'Urban L-Sectional', category: 'corner-sofas', price: 31200, desc: 'Compact corner sofa ideal for apartments. Chaise module and storage ottoman included.', colors: [{ name: 'Light Grey', hex: '#b0b0b0' }, { name: 'Terracotta', hex: '#c4725a' }], image: 'photos/Material_2.png' },
  { id: 'p8', slug: 'grand-salon-set', name: 'Grand Salon Set', category: 'living-room', price: 54000, onOffer: true, discount: 20, desc: 'Three-seat sofa, two armchairs, and coffee table with carved walnut frames.', colors: [{ name: 'Walnut & Burgundy', hex: '#722f37' }, { name: 'Oak & Cream', hex: '#f0e6d3' }], image: 'photos/Joinery.png' },
  { id: 'p16', slug: 'harmony-lounge-set', name: 'Harmony Lounge Set', category: 'living-room', price: 41800, desc: 'Two sofas, one armchair, and nested tables. Contemporary lines with premium fabric upholstery.', colors: [{ name: 'Stone', hex: '#9a9a8e' }, { name: 'Deep Blue', hex: '#2c3e6b' }], image: 'photos/Joinery.png' },
  { id: 'p9', slug: 'verona-display-cabinet', name: 'Verona Display Cabinet', category: 'Libraries', price: 24000, desc: 'Tall vitrine with glass shelves, internal LED lighting, and lockable doors.', colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Black Lacquer', hex: '#1a1a1a' }], image: 'photos/Finish.png' },
  { id: 'p17', slug: 'gallery-wall-niche', name: 'Gallery Wall Niche', category: 'Libraries', price: 15600, onOffer: true, discount: 12, desc: 'Wall-mounted display niche with adjustable glass shelves and integrated spotlight.', colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Brass & Glass', hex: '#a07c4a' }], image: 'photos/Finish.png' }
];

function formatPrice(n) {
  return `EGP ${Number(n).toLocaleString()}`;
}

function salePrice(p) {
  return p.onOffer && p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
}

function catById(id) {
  return CATEGORIES.find(c => c.id === id);
}

function head(title, depth) {
  const prefix = depth === 0 ? '' : '../';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Adam's House — ${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}css/style.css">
</head>`;
}

function nav(depth) {
  const p = depth === 0 ? '' : '../';
  return `
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--border)]/50">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
      <a href="${p}home.html" class="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M4 26 L16 6 L28 26 M9 26 L16 14 L23 26" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
        <span class="font-display text-2xl font-medium tracking-tight">Adam's House</span>
      </a>
      <div class="hidden lg:flex items-center gap-10 text-sm font-medium">
        <a href="${p}home.html#categories" class="nav-link">Collections</a>
        <a href="${p}home.html#offers" class="nav-link">Offers</a>
        <a href="${p}home.html#visit" class="nav-link">Contact</a>
      </div>
      <div class="flex items-center gap-4">
        <a href="${p}cart.html" class="relative text-xl hover:text-[var(--accent)] transition-colors nav-icon-btn" title="Cart">
          <i class="fa-solid fa-cart-shopping"></i>
          <span class="absolute -top-2 -right-2 bg-[var(--accent)] text-[var(--fg-light)] text-[10px] w-4 h-4 rounded-full flex items-center justify-center cart-count">0</span>
        </a>
        <a href="${p}customer-login.html" data-user-link class="nav-icon-btn text-xl hover:text-[var(--accent)] transition-colors" title="Sign in">
          <i class="fa-solid fa-circle-user"></i>
        </a>
        <a href="${p}customer-login.html" data-login-link class="hidden md:flex text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Sign In</a>
        <button id="mobile-menu-btn" class="lg:hidden text-xl"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
  </nav>`;
}

function productCard(p, depth) {
  let href, img;
  if (depth === 2) {
    href = `${p.slug}.html`;
    img = `../${p.image}`;
  } else if (depth === 1) {
    href = `../products/${p.slug}.html`;
    img = `../${p.image}`;
  } else {
    href = `products/${p.slug}.html`;
    img = p.image;
  }
  const cat = catById(p.category);
  const dots = p.colors.slice(0, 4).map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join('');
  const sp = salePrice(p);
  const priceHtml = p.onOffer
    ? `<div class="font-display text-lg text-[var(--accent)]">${formatPrice(sp)}</div><div class="text-sm text-[var(--muted)] line-through">${formatPrice(p.price)}</div>`
    : `<div class="font-display text-lg">${formatPrice(p.price)}</div>`;

  return `
    <a href="${href}" class="product-card">
      <div class="product-img-wrap">
        <img src="${img}" alt="${p.name}" class="product-img">
        ${p.onOffer ? `<span class="offer-badge">-${p.discount}%</span>` : ''}
        <div class="product-color-dots">${dots}</div>
      </div>
      <div class="p-5">
        <div class="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">${cat.name}</div>
        <h3 class="font-display text-xl mb-2">${p.name}</h3>
        <p class="text-sm text-[var(--muted)] line-clamp-2 mb-4">${p.desc}</p>
        <div class="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div>${priceHtml}</div>
          <span class="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">View</span>
        </div>
      </div>
    </a>`;
}

function categoryPage(cat) {
  const products = PRODUCTS.filter(p => p.category === cat.id);
  const cards = products.map(p => productCard(p, 1)).join('\n');

  return `${head(cat.name, 1)}
<body class="bg-[var(--bg)]">
${nav(1)}

  <!-- EDIT THIS PAGE: category title, description, and product cards below -->
  <section class="pt-40 pb-16 bg-[var(--bg-alt)] relative grain">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
      <div class="flex items-center gap-3 mb-6 text-sm">
        <a href="../home.html" class="text-[var(--muted)] hover:text-[var(--accent)]">Home</a>
        <i class="fa-solid fa-chevron-right text-[10px] text-[var(--muted)]"></i>
        <span class="text-[var(--fg)] font-medium">${cat.name}</span>
      </div>
      <h1 class="font-display text-5xl lg:text-7xl font-light leading-tight mb-4">${cat.name}</h1>
      <p class="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">${cat.desc}</p>
    </div>
  </section>

  <section class="py-16 lg:py-24">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
${cards}
      </div>
    </div>
  </section>

  <footer class="bg-[var(--bg-dark)] text-[var(--fg-light)] py-12 relative grain">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 text-center text-sm text-[var(--muted-light)]">
      © 2026 Adam's House · Alexandria · 01123415353
    </div>
  </footer>

  <script src="../js/data.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>`;
}

function productPage(p) {
  const cat = catById(p.category);
  const imgBase = `../${p.image}`;
  const thumbs = [1, 2, 3, 4, 5, 6, 7].map(i => `
            <div class="aspect-square overflow-hidden bg-[var(--bg-alt)] thumb ${i === 1 ? 'active' : ''}" onclick="setMainImage(this, '${imgBase}')">
              <img src="${imgBase}" alt="View ${i}" class="w-full h-full object-cover">
            </div>`).join('');

  const colors = p.colors.map((c, i) => `
              <button type="button" class="color-swatch ${i === 0 ? 'selected' : ''}" onclick="toggleColor(this, '${c.name.replace(/'/g, "\\'")}')" title="${c.name}">
                <span class="color-swatch-inner" style="background:${c.hex}"></span>
                <span class="color-swatch-label">${c.name}</span>
              </button>`).join('');

  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id);
  const relatedHtml = related.length ? `
      <section class="mt-24 pt-16 border-t border-[var(--border)]">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div class="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">Same Collection</div>
            <h2 class="font-display text-3xl lg:text-4xl font-light">More from ${cat.name}</h2>
          </div>
          <a href="../categories/${cat.file}" class="text-sm uppercase tracking-wider text-[var(--accent)] font-semibold hover:underline">View all <i class="fa-solid fa-arrow-right ml-1"></i></a>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${related.map(r => productCard(r, 2)).join('\n')}
        </div>
      </section>` : '';

  const sp = salePrice(p);
  const priceBlock = p.onOffer ? `
            <span class="inline-block bg-[var(--accent)] text-[var(--fg-light)] text-xs font-bold uppercase tracking-wider px-3 py-1 mb-3">-${p.discount}% Off</span>
            <div class="font-display text-3xl text-[var(--accent)]">${formatPrice(sp)}</div>
            <div class="text-lg text-[var(--muted)] line-through">${formatPrice(p.price)}</div>`
    : `<div class="font-display text-3xl text-[var(--accent)]">${formatPrice(p.price)}</div>`;

  return `${head(p.name, 1)}
<body class="product-page bg-[var(--bg)]" data-product-id="${p.id}">
${nav(1)}

  <!-- EDIT THIS PAGE: images, title, price, description, colors -->
  <section class="pt-32 pb-24">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-12 mt-8">
      <nav class="flex items-center gap-3 mb-8 text-sm text-[var(--muted)]">
        <a href="../home.html" class="hover:text-[var(--accent)]">Home</a>
        <i class="fa-solid fa-chevron-right text-[10px]"></i>
        <a href="../categories/${cat.file}" class="hover:text-[var(--accent)]">${cat.name}</a>
        <i class="fa-solid fa-chevron-right text-[10px]"></i>
        <span class="text-[var(--fg)]">${p.name}</span>
      </nav>

      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <div class="flex flex-col gap-4">
          <div class="aspect-square overflow-hidden bg-[var(--bg-alt)]">
            <img id="main-image" src="${imgBase}" alt="${p.name}" class="w-full h-full object-cover">
          </div>
          <div class="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
${thumbs}
          </div>
        </div>

        <div class="flex flex-col justify-center">
          <div class="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">${cat.name}</div>
          <h1 class="font-display text-4xl lg:text-5xl font-light mb-4">${p.name}</h1>
          <div class="mb-6">${priceBlock}</div>

          <div class="border-t border-b border-[var(--border)] py-6 mb-6">
            <h3 class="text-xs uppercase tracking-wider font-bold text-[var(--muted)] mb-3">Description</h3>
            <p class="text-[var(--muted)] leading-relaxed">${p.desc}</p>
          </div>

          <div class="mb-8">
            <h3 class="text-xs uppercase tracking-wider font-bold text-[var(--muted)] mb-3">Available Colors (select one or more)</h3>
            <div class="flex flex-wrap gap-3" id="color-picker">${colors}</div>
            <p class="text-sm text-[var(--muted)] mt-3" id="selected-colors-text">Selected: ${p.colors[0].name}</p>
          </div>

          <div class="flex items-center gap-4 mb-4">
            <div class="flex items-center border border-[var(--border)]">
              <button type="button" onclick="updateQty(-1)" class="px-4 py-3 text-lg hover:bg-[var(--bg-alt)]">−</button>
              <input id="qty-input" type="text" value="1" class="w-12 text-center bg-transparent border-none focus:outline-none" readonly>
              <button type="button" onclick="updateQty(1)" class="px-4 py-3 text-lg hover:bg-[var(--bg-alt)]">+</button>
            </div>
            <button type="button" onclick="addToCartFromPage()" class="btn-primary flex-1 justify-center">
              <span>Add to Cart</span>
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
          <p class="text-sm text-[var(--muted)] flex items-center gap-2"><i class="fa-solid fa-lock text-xs"></i> Sign in required to complete your order</p>
        </div>
      </div>
${relatedHtml}
    </div>
  </section>

  <div id="toast-container" class="fixed top-6 right-6 z-[2000]"></div>
  <script src="../js/data.js"></script>
  <script src="../js/static-product.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>`;
}

// Generate files
const catDir = path.join(ROOT, 'categories');
const prodDir = path.join(ROOT, 'products');
fs.mkdirSync(catDir, { recursive: true });
fs.mkdirSync(prodDir, { recursive: true });

CATEGORIES.forEach(cat => {
  fs.writeFileSync(path.join(catDir, cat.file), categoryPage(cat), 'utf8');
});

PRODUCTS.forEach(p => {
  fs.writeFileSync(path.join(prodDir, `${p.slug}.html`), productPage(p), 'utf8');
});

console.log(`Generated ${CATEGORIES.length} category pages and ${PRODUCTS.length} product pages.`);
