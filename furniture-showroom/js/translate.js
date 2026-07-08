/* ============================================
   Language Switcher — Automatic AR / EN
   Uses Google Translate for on-the-fly
   translation of all page content including
   products added in the future.
   ============================================ */

   (function () {
    'use strict';
  
    var STORAGE_KEY = 'adams-house-lang';
    var currentLang = sessionStorage.getItem(STORAGE_KEY) || 'en';
    var busy = false;
  
    /* ---------- 1. Hidden Google Translate anchor ---------- */
    var anchor = document.createElement('div');
    anchor.id = 'google_translate_element';
    anchor.setAttribute('aria-hidden', 'true');
    anchor.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;height:0;overflow:hidden;';
    document.body.appendChild(anchor);
  
    /* ---------- 2. Google Translate callback ---------- */
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,ar', autoDisplay: false },
        'google_translate_element'
      );
    };
  
    /* ---------- 3. Load Google Translate script ---------- */
    var gtScript = document.createElement('script');
    gtScript.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    gtScript.async = true;
    document.head.appendChild(gtScript);
  
    /* ---------- 4. Create the toggle button ---------- */
    function createButton() {
      if (document.getElementById('lang-toggle')) return;
  
      var actions = document.querySelector('nav .flex.items-center.gap-4');
      if (!actions) return;
  
      var btn = document.createElement('button');
      btn.id = 'lang-toggle';
      btn.className = 'lang-toggle-btn notranslate';
      btn.setAttribute('aria-label', 'Switch language');
      setLabel(btn);
  
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        doSwitch();
      });
  
      var cart = actions.querySelector('a[title="Cart"], a[href*="cart.html"]');
      if (cart) {
        actions.insertBefore(btn, cart);
      } else {
        actions.prepend(btn);
      }
    }
  
    function setLabel(btn) {
      if (!btn) btn = document.getElementById('lang-toggle');
      if (!btn) return;
  
      if (currentLang === 'en') {
        btn.innerHTML =
          '<i class="fa-solid fa-globe"></i><span>\u0639\u0631\u0628\u064A</span>';
        btn.title = '\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0628\u064A\u0629';
      } else {
        btn.innerHTML =
          '<i class="fa-solid fa-globe"></i><span>English</span>';
        btn.title = 'Switch to English';
      }
    }
  
    /* ---------- 5. Perform the switch ---------- */
    function closeMobileMenu() {
      var menu = document.getElementById('mobile-menu');
      var backdrop = document.getElementById('mobile-backdrop');
      if (menu) menu.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    function clearTranslateCookies() {
      var host = window.location.hostname;
      var expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'googtrans=;' + expires + ';path=/';
      document.cookie = 'googtrans=;' + expires + ';path=/;domain=' + host;
      document.cookie = 'googtrans=;' + expires + ';path=/;domain=.' + host;
    }

    function waitForCombo(callback, maxTries) {
      var tries = 0;
      var limit = maxTries || 60;
      var id = setInterval(function () {
        var select = document.querySelector('.goog-te-combo');
        if (select || ++tries >= limit) {
          clearInterval(id);
          if (select) callback(select);
        }
      }, 200);
    }

    function setTranslateLang(lang) {
      waitForCombo(function (select) {
        select.value = lang === 'en' ? '' : lang;
        select.dispatchEvent(new Event('change'));
      });
    }

    function ensureEnglish() {
      currentLang = 'en';
      applyDirection('en');
      clearTranslateCookies();
      setTranslateLang('en');
      setLabel();
    }

    function doSwitch() {
      if (busy) return;

      var select = document.querySelector('.goog-te-combo');
      if (!select) return;

      busy = true;
      closeMobileMenu();
      var next = currentLang === 'en' ? 'ar' : 'en';
  
      select.value = next === 'en' ? '' : next;
      select.dispatchEvent(new Event('change'));
  
      currentLang = next;
      sessionStorage.setItem(STORAGE_KEY, next);
      setLabel();
      applyDirection(next);
  
      setTimeout(function () {
        busy = false;
      }, 2000);
    }
  
    /* ---------- 6. RTL / LTR direction ---------- */
    function applyDirection(lang) {
      var html = document.documentElement;
      if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
      } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
      }
    }
  
    /* ---------- 7. Restore saved language on load ---------- */
    function restore() {
      if (currentLang === 'ar') {
        applyDirection('ar');
        setTranslateLang('ar');
        return;
      }

      ensureEnglish();
    }
  
    /* ---------- 8. Boot — always start from English unless Arabic was saved ---------- */
    function init() {
      applyDirection(currentLang === 'ar' ? 'ar' : 'en');
      createButton();
      restore();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();

/* ============================================= */
/* LANGUAGE TOGGLE — working dropdown logic       */
/* Append to the BOTTOM of js/main.js             */
/* (or paste into js/translate.js if you prefer)  */
/* ============================================= */

(function () {
  const STORAGE_KEY = 'adams-house-lang';
  const SUPPORTED = ['en', 'ar'];

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  function setCurrentLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    // Update the label in the nav button
    document.querySelectorAll('.lang-current').forEach(el => {
      el.textContent = lang.toUpperCase();
    });

    // Highlight the active option in the dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Set <html lang> and direction (Arabic = RTL)
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Dispatch an event so your existing translate.js can react if it listens
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

    // BASIC BUILT-IN TRANSLATION FALLBACK
    // If your translate.js doesn't catch the event above, this will at least
    // translate any element that has data-en / data-ar attributes.
    // Example: <button data-en="Sign In" data-ar="تسجيل الدخول">Sign In</button>
    document.querySelectorAll('[data-en], [data-ar]').forEach(el => {
      const txt = el.getAttribute('data-' + lang);
      if (txt) el.textContent = txt;
    });
  }

  function initLangToggle() {
    const toggle = document.getElementById('lang-toggle');
    const dropdown = document.getElementById('lang-dropdown');
    if (!toggle || !dropdown) return;

    // Open / close dropdown
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-switcher')) {
        dropdown.classList.remove('show');
      }
    });

    // Option clicks
    dropdown.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        setCurrentLang(opt.dataset.lang);
        dropdown.classList.remove('show');
      });
    });

    // Apply saved language on load
    applyLang(getCurrentLang());
  }

  // Init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangToggle);
  } else {
    initLangToggle();
  }
})();
