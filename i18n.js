(function () {
  const DEFAULT_LANG = 'de';
  const SUPPORTED = ['de', 'en'];
  const KEY = 'portfolio-lang';

  let translations = {};
  let currentLang = localStorage.getItem(KEY) || DEFAULT_LANG;

  function resolve(obj, path) {
    return path.split('.').reduce((o, k) => o && o[k], obj);
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = resolve(translations, el.getAttribute('data-i18n'));
      if (val == null) return;
      if (val.includes('<')) el.innerHTML = val;
      else el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const val = resolve(translations, el.getAttribute('data-i18n-title'));
      if (val != null) el.setAttribute('data-title', val);
    });

    document.querySelectorAll('[data-i18n-desc]').forEach(el => {
      const val = resolve(translations, el.getAttribute('data-i18n-desc'));
      if (val != null) el.setAttribute('data-desc', val);
    });

    document.querySelectorAll('[data-i18n-list]').forEach(el => {
      const val = resolve(translations, el.getAttribute('data-i18n-list'));
      if (!Array.isArray(val)) return;
      var items = el.querySelectorAll('li');
      for (var i = 0; i < val.length && i < items.length; i++) {
        if (val[i].includes('<')) items[i].innerHTML = val[i];
        else items[i].textContent = val[i];
      }
    });

    var cvLink = document.getElementById('cv-link');
    if (cvLink) cvLink.href = cvLink.getAttribute('data-cv-' + currentLang) || cvLink.href;

    document.documentElement.lang = currentLang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
  }

  async function load(lang) {
    if (!SUPPORTED.includes(lang)) return;
    try {
      const resp = await fetch('translations/' + lang + '.json');
      translations = await resp.json();
      currentLang = lang;
      localStorage.setItem(KEY, lang);
      apply();
    } catch (e) {
      console.error('i18n load failed:', e);
    }
    document.body.classList.remove('i18n-loading');
  }

  function t(key) {
    return resolve(translations, key) || key;
  }

  function injectToggle() {
    const toggle = document.createElement('div');
    toggle.className = 'lang-toggle';
    toggle.innerHTML =
      '<button class="lang-btn" data-lang="de" aria-label="Deutsch">DE</button>' +
      '<span class="lang-sep">/</span>' +
      '<button class="lang-btn" data-lang="en" aria-label="English">EN</button>';

    var nav = document.querySelector('.project-nav');
    if (nav) {
      nav.appendChild(toggle);
    } else {
      document.body.appendChild(toggle);
    }

    toggle.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (lang !== currentLang) load(lang);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('i18n-loading');
    injectToggle();
    load(currentLang);
  });

  window.i18n = { t: t, lang: function () { return currentLang; } };
})();
