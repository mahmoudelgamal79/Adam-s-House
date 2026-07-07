/* ============================================
   Language Switcher — Automatic AR / EN
   Uses Google Translate for on-the-fly
   translation of all page content including
   products added in the future.
   ============================================ */

   (function () {
    'use strict';
  
    var STORAGE_KEY = 'adams-house-lang';
    var currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
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
      // Avoid duplicates
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
  
      // Insert before the cart icon
      var cart = actions.querySelector('a[title="Cart"]');
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

    function doSwitch() {
      if (busy) return;

      var select = document.querySelector('.goog-te-combo');
      if (!select) return;

      busy = true;
      closeMobileMenu();
      var next = currentLang === 'en' ? 'ar' : 'en';
  
      select.value = next;
      select.dispatchEvent(new Event('change'));
  
      currentLang = next;
      localStorage.setItem(STORAGE_KEY, next);
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
      if (currentLang !== 'ar') return;
  
      // Pre-apply RTL so there's no flash
      applyDirection('ar');
  
      var tries = 0;
      var id = setInterval(function () {
        if (document.querySelector('.goog-te-combo') || ++tries > 60) {
          clearInterval(id);
          if (document.querySelector('.goog-te-combo')) {
            setTimeout(doSwitch, 400);
          }
        }
      }, 200);
    }
  
    /* ---------- 8. Boot ---------- */
    function init() {
      createButton();
      restore();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
