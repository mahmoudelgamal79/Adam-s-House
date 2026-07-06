// ── Manager credentials ────────────────────────────────────────────────────
// MANAGER_PASSWORD_HASH is the SHA-256 hash of the manager password.
// Current password: admin123
// To change: open browser console and run:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your_new_password'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))
// Then paste the result here.
const MANAGER_USERNAME      = 'admin';
const MANAGER_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

const DATA_VERSION = 3;

const CATEGORIES_SEED = [
  { id: 'Master-bedrooms', name: 'Master Bedrooms', icon: 'fa-bed', desc: 'Grand beds, wardrobes, and dressers for spacious master suites.', image: 'cat-large-bed' },
  { id: 'childrens-rooms', name: "Children's Rooms", icon: 'fa-child', desc: 'Bunk beds, study desks, and playful storage for growing families.', image: 'cat-kids' },
  { id: 'dining-rooms', name: 'Dining Rooms', icon: 'fa-utensils', desc: 'Dining tables, chairs, and sideboards for memorable gatherings.', image: 'cat-dining' },
  { id: 'Salons', name: 'Salons', icon: 'fa-shoe-prints', desc: 'Elegant entryway storage that keeps footwear organized and hidden.', image: 'cat-shoe' },
  { id: 'Chalet-furnishings', name: 'Chalet furnishings', icon: 'fa-couch', desc: 'Stylish and durable chalet furniture for comfortable and relaxing vacation spaces', image: 'cat-corner' },
  { id: 'living-room', name: 'Living Room', icon: 'fa-chair', desc: 'Complete salon suites with sofas, armchairs, and coffee tables.', image: 'cat-living' },
  { id: 'Libraries-accessories', name: 'Libraries & Accessories', icon: 'fa-table-cells', desc: 'Vitrines, niches, and shelving to showcase your finest pieces.', image: 'cat-display' }
];

// Added category for restaurants and cafes
CATEGORIES_SEED.push({ id: 'restaurants-cafes', name: 'Restaurants & Cafes', icon: 'fa-mug-saucer', desc: 'Durable tables, chairs, and counters tailored for cafes and restaurants.', image: 'cat-restaurants' });

const DEFAULT_COLORS = [
  { name: 'Walnut', hex: '#5c4033' },
  { name: 'Natural Oak', hex: '#c4a35a' },
  { name: 'Charcoal', hex: '#36454f' }
];

function imgSet(prefix) {
  return Array.from({ length: 7 }, (_, i) => `${prefix}-${i + 1}`);
}

const PRODUCTS_SEED = [
  {
    id: 'p1', name: 'Vienna Canopy Bed', category: 'Master-bedrooms', price: 42000, status: 'active', onOffer: true, discount: 20,
    images: imgSet('vienna-bed'), desc: 'Hand-joined canopy in European walnut with brass fittings. A timeless centerpiece for the principal suite. Dimensions: 180×200 cm.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Espresso', hex: '#3b2f2f' }, { name: 'Ivory White', hex: '#f5f0e8' }]
  },
  {
    id: 'p2', name: 'Sofia Dresser', category: 'Master-bedrooms', price: 18500, status: 'active', onOffer: true, discount: 15,
    images: imgSet('sofia-dresser'), desc: 'Six-drawer dresser with soft-close runners, crafted from solid oak with hand-rubbed finish.',
    colors: [{ name: 'Natural Oak', hex: '#c4a35a' }, { name: 'Walnut', hex: '#5c4033' }]
  },
  {
    id: 'p10', name: 'Imperial Wardrobe', category: 'Master-bedrooms', price: 29500, status: 'active',
    images: imgSet('imperial-wardrobe'), desc: 'Double-door wardrobe with mirrored panels, hanging rail, and adjustable shelving. Solid walnut construction.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'White Oak', hex: '#e8dcc8' }]
  },
  {
    id: 'p3', name: 'Astro Bunk Bed', category: 'childrens-rooms', price: 16500, status: 'active',
    images: imgSet('astro-bunk'), desc: 'Stackable pine bunk with safety rails and integrated ladder. Non-toxic, child-safe finish.',
    colors: [{ name: 'Natural Pine', hex: '#deb887' }, { name: 'Sky Blue', hex: '#6b9bd1' }, { name: 'Soft Pink', hex: '#e8b4b8' }]
  },
  {
    id: 'p4', name: 'Explorer Study Set', category: 'childrens-rooms', price: 12800, status: 'active',
    images: imgSet('explorer-study'), desc: 'Desk, bookshelf, and chair set designed for homework and creative play.',
    colors: [{ name: 'White', hex: '#f5f5f5' }, { name: 'Grey Oak', hex: '#8b8680' }]
  },
  {
    id: 'p11', name: 'Rainbow Toy Storage', category: 'childrens-rooms', price: 8900, status: 'active', onOffer: true, discount: 10,
    images: imgSet('rainbow-storage'), desc: 'Colorful cubby storage unit with bins for toys, books, and clothes. Rounded edges for safety.',
    colors: [{ name: 'Multi Pastel', hex: '#e8b4b8' }, { name: 'Natural Wood', hex: '#deb887' }]
  },
  {
    id: 'p5', name: 'Toscana Dining Table', category: 'dining-rooms', price: 32000, status: 'active', onOffer: true, discount: 20,
    images: imgSet('toscana-table'), desc: 'Extending solid oak table seating 8 to 12 comfortably. Includes protective felt pads.',
    colors: [{ name: 'Natural Oak', hex: '#c4a35a' }, { name: 'Walnut', hex: '#5c4033' }, { name: 'Ebony', hex: '#2c2416' }]
  },
  {
    id: 'p12', name: 'Luna Dining Chairs (Set of 6)', category: 'dining-rooms', price: 14400, status: 'active',
    images: imgSet('luna-chairs'), desc: 'Upholstered dining chairs with curved backrests and solid beech legs. Sold as a set of six.',
    colors: [{ name: 'Beige Linen', hex: '#d4c5ad' }, { name: 'Charcoal', hex: '#36454f' }, { name: 'Olive', hex: '#6b7c4c' }]
  },
  {
    id: 'p13', name: 'Roma Sideboard', category: 'dining-rooms', price: 22800, status: 'active',
    images: imgSet('roma-sideboard'), desc: 'Wide sideboard with wine rack, drawers, and glass display top. Perfect for formal dining rooms.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Black', hex: '#1a1a1a' }]
  },
  {
    id: 'p6', name: 'Sorrento Shoe Cabinet', category: 'Salons', price: 7200, status: 'active',
    images: imgSet('sorrento-shoe'), desc: 'Three-tier tilt-out cabinet hiding up to 18 pairs in elegant walnut veneer.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'White Gloss', hex: '#fafafa' }]
  },
  {
    id: 'p14', name: 'Entry Pro Hall Unit', category: 'Salons', price: 11500, status: 'active', onOffer: true, discount: 15,
    images: imgSet('entry-pro'), desc: 'Combined shoe rack, coat hooks, and bench seat for your entryway. Space for 24 pairs.',
    colors: [{ name: 'Grey Oak', hex: '#8b8680' }, { name: 'White', hex: '#f5f5f5' }]
  },
  {
    id: 'p7', name: 'Milano Corner Sofa', category: 'Chalet-furnishings', price: 38500, status: 'active', onOffer: true, discount: 15,
    images: imgSet('milano-corner'), desc: 'L-shaped modular corner sofa with down-fill cushions and removable covers.',
    colors: [{ name: 'Charcoal', hex: '#36454f' }, { name: 'Sand', hex: '#c9b99a' }, { name: 'Forest Green', hex: '#2d4a3e' }, { name: 'Navy', hex: '#1e3a5f' }]
  },
  {
    id: 'p15', name: 'Urban L-Sectional', category: 'Chalet-furnishings', price: 31200, status: 'active',
    images: imgSet('urban-sectional'), desc: 'Compact corner sofa ideal for apartments. Chaise module and storage ottoman included.',
    colors: [{ name: 'Light Grey', hex: '#b0b0b0' }, { name: 'Terracotta', hex: '#c4725a' }]
  },
  {
    id: 'p8', name: 'Grand Salon Set', category: 'living-room', price: 54000, status: 'active', onOffer: true, discount: 20,
    images: imgSet('grand-salon'), desc: 'Three-seat sofa, two armchairs, and coffee table with carved walnut frames.',
    colors: [{ name: 'Walnut & Burgundy', hex: '#722f37' }, { name: 'Oak & Cream', hex: '#f0e6d3' }]
  },
  {
    id: 'p16', name: 'Harmony Lounge Set', category: 'living-room', price: 41800, status: 'active',
    images: imgSet('harmony-lounge'), desc: 'Two sofas, one armchair, and nested tables. Contemporary lines with premium fabric upholstery.',
    colors: [{ name: 'Stone', hex: '#9a9a8e' }, { name: 'Deep Blue', hex: '#2c3e6b' }]
  },
  {
    id: 'p9', name: 'Verona Display Cabinet', category: 'Libraries-accessories', price: 24000, status: 'active',
    images: imgSet('verona-vitrine'), desc: 'Tall vitrine with glass shelves, internal LED lighting, and lockable doors.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Black Lacquer', hex: '#1a1a1a' }]
  },
  {
    id: 'p17', name: 'Gallery Wall Niche', category: 'Libraries-accessories', price: 15600, status: 'active', onOffer: true, discount: 12,
    images: imgSet('gallery-niche'), desc: 'Wall-mounted display niche with adjustable glass shelves and integrated spotlight.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Brass & Glass', hex: '#a07c4a' }]
  }
];

// Products for Restaurants & Cafes collection
PRODUCTS_SEED.push(
  {
    id: 'p18', name: 'Bistro Table (Round)', category: 'restaurants-cafes', price: 4200, status: 'active',
    images: imgSet('bistro-table'), desc: 'Solid oak round bistro table with steel base — ideal for cafés and bistros.',
    colors: [{ name: 'Natural Oak', hex: '#c4a35a' }, { name: 'Walnut', hex: '#5c4033' }]
  },
  {
    id: 'p19', name: 'Cafe Chairs (Set of 4)', category: 'restaurants-cafes', price: 6800, status: 'active',
    images: imgSet('cafe-chairs'), desc: 'Stackable bentwood chairs with upholstered seat — practical and elegant for busy venues.',
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'Natural Beech', hex: '#d9b88f' }]
  },
  {
    id: 'p20', name: 'Bar Counter (2m)', category: 'restaurants-cafes', price: 15200, status: 'active',
    images: imgSet('bar-counter'), desc: 'Solid bar counter with integrated shelving and optional brass footrail.',
    colors: [{ name: 'Walnut', hex: '#5c4033' }, { name: 'Ebony', hex: '#2c2416' }]
  }
);

const OFFERS_SEED = [
  { id: 'o1', title: 'Summer Collection Sale', desc: 'Selected pieces from our spring collection at reduced prices.', discount: 20, validUntil: '2026-12-31', status: 'active' },
  { id: 'o2', title: 'Bedroom Suite Bundle', desc: 'Complete large bedroom set with 15% saving when ordered together.', discount: 15, validUntil: '2026-12-31', status: 'active' }
];

const SHOWROOM_SEED = {
  name: 'Eng. Mahmoud El-Gamal',
  phone: '01123415353',
  address: 'Alexandria, Sidi Bishr Qebli, 181 Gamal Abd El-Nasir'
};

const MANAGER_AUTH_KEY = 'adams-house-manager-auth';
const CUSTOMER_KEY = 'adams-house-customer';

let state = { categories: [], products: [], offers: [], showroom: null };
let cart = JSON.parse(localStorage.getItem('adams-house-cart')) || [];

function loadState() {
  const version = localStorage.getItem('adams-house-data-version');
  const saved = localStorage.getItem('adams-house-state');

  if (saved && version === String(DATA_VERSION)) {
    try {
      state = JSON.parse(saved);
      if (!state.categories?.length) state.categories = [...CATEGORIES_SEED];
      if (!state.products?.length) state.products = [...PRODUCTS_SEED];
      if (!state.offers?.length) state.offers = [...OFFERS_SEED];
      if (!state.showroom) state.showroom = { ...SHOWROOM_SEED };
      normalizeProducts();
    } catch {
      resetState();
    }
  } else {
    resetState();
  }
}

function resetState() {
  state = {
    categories: [...CATEGORIES_SEED],
    products: [...PRODUCTS_SEED],
    offers: [...OFFERS_SEED],
    showroom: { ...SHOWROOM_SEED }
  };
  saveState();
  localStorage.setItem('adams-house-data-version', DATA_VERSION);
}

function normalizeProducts() {
  state.products = state.products.map(p => ({
    ...p,
    images: p.images?.length >= 7 ? p.images.slice(0, 7) : [...(p.images || []), ...imgSet(p.id || 'product')].slice(0, 7),
    colors: p.colors?.length ? p.colors : [...DEFAULT_COLORS],
    desc: p.desc || ''
  }));
}

function saveState() {
  localStorage.setItem('adams-house-state', JSON.stringify(state));
}

function saveCart() {
  localStorage.setItem('adams-house-cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count; });
}

function formatPrice(amount) {
  return `EGP ${Number(amount).toLocaleString()}`;
}

function getSalePrice(product) {
  if (product.onOffer && product.discount) {
    return Math.round(product.price * (1 - product.discount / 100));
  }
  return product.price;
}

function getCategoryImage(cat) {
  const first = state.products?.find(p => p.category === cat.id && p.status === 'active');
  return first ? first.images[0] : cat.image;
}

function getCustomer() {
  try {
    const data = JSON.parse(localStorage.getItem(CUSTOMER_KEY));
    return data?.loggedIn ? data : null;
  } catch {
    return null;
  }
}

function isManagerLoggedIn() {
  const token = localStorage.getItem(MANAGER_AUTH_KEY);
  return token !== null && /^[0-9a-f]{64}-\d+$/.test(token);
}

function productImageUrl(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}.jpg`;
}

function uid() {
  return 'id' + Date.now() + Math.random().toString(36).slice(2, 7);
}

function showToast(message) {
  const container = document.getElementById('toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-check-circle text-[var(--accent-light)]"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}