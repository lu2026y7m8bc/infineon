/* ==========================================================================
   力通 · 英飞凌代理官网 — 交互脚本
   包含：导航、下拉、移动抽屉、表格搜索/排序/筛选、Tabs、复制、TOC 高亮。
   ========================================================================== */
(function () {
  'use strict';

  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && mobileNav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      mobileNav.hidden = !open;
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) {
        var first = mobileNav.querySelector('a, button');
        if (first) first.focus();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (mobileNav.hidden) return;
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.focus();
        return;
      }
      if (event.key === 'Tab') {
        var focusables = mobileNav.querySelectorAll('a, button');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    document.addEventListener('click', function (event) {
      if (mobileNav.hidden) return;
      if (!mobileNav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    mobileNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 999) setOpen(false);
    });
  }

  /* 产品中心下拉：同步 aria-expanded（hover / 键盘焦点） */
  var dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');
  Array.prototype.forEach.call(dropdownToggles, function (link) {
    var item = link.closest('.has-dropdown');
    if (!item) return;
    var setExpanded = function (open) {
      link.setAttribute('aria-expanded', String(open));
    };
    item.addEventListener('mouseenter', function () { setExpanded(true); });
    item.addEventListener('mouseleave', function () { setExpanded(false); });
    item.addEventListener('focusin', function () { setExpanded(true); });
    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) setExpanded(false);
    });
  });

  /* 数值解析：支持 KB/MB/GB、MHz/GHz、V/mV、A/mA、Ω/mΩ、bit 等单位 */
  function parseMetric(text) {
    var m = String(text).replace(/±/g, '').match(/-?\d+(?:\.\d+)?/);
    if (!m) return 0;
    var n = parseFloat(m[0]);
    var unit = String(text).toLowerCase();
    if (/gb/.test(unit)) return n * 1024 * 1024 * 1024;
    if (/mb/.test(unit)) return n * 1024 * 1024;
    if (/kb/.test(unit)) return n * 1024;
    if (/ghz/.test(unit)) return n * 1e9;
    if (/mhz/.test(unit)) return n * 1e6;
    if (/khz/.test(unit)) return n * 1e3;
    if (/kv/.test(unit)) return n * 1e3;
    if (/mv/.test(unit)) return n * 1e-3;
    if (/ma/.test(unit)) return n * 1e-3;
    if (/mω|mohm/.test(unit)) return n * 1e-3;
    if (/ω|ohm/.test(unit)) return n;
    if (/ua/.test(unit)) return n * 1e-6;
    return n;
  }

  /* 动态表格：搜索 / 排序 / 筛选 / 空态 */
  function initTable(root) {
    var table = root.querySelector('table');
    if (!table) return;
    var tbody = table.tBodies[0];
    if (!tbody) return;

    var search = root.querySelector('[data-table-search]');
    var empty = root.querySelector('[data-table-empty]');
    var count = root.querySelector('[data-table-count]');
    var clear = root.querySelector('[data-table-clear]');
    var rows = Array.prototype.slice.call(tbody.rows);
    var filters = {};

    function rowText(row) {
      return row.textContent.toLowerCase();
    }

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;
      rows.forEach(function (row) {
        var ok = !q || rowText(row).indexOf(q) !== -1;
        Object.keys(filters).forEach(function (key) {
          if (!ok) return;
          var cell = row.querySelector('[data-col="' + key + '"]');
          if (!cell || cell.textContent.trim() !== filters[key]) ok = false;
        });
        row.hidden = !ok;
        if (ok) visible += 1;
      });
      if (count) count.textContent = '共 ' + visible + ' 个型号';
      if (empty) empty.hidden = visible !== 0;
    }

    if (search) search.addEventListener('input', apply);

    Array.prototype.forEach.call(table.querySelectorAll('th[data-sort]'), function (th) {
      var sort = function () {
        var type = th.getAttribute('data-sort') || 'text';
        var colIndex = Array.prototype.indexOf.call(th.parentNode.children, th);
        var dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';

        Array.prototype.forEach.call(table.querySelectorAll('th[aria-sort]'), function (other) {
          if (other !== th) other.removeAttribute('aria-sort');
        });
        th.setAttribute('aria-sort', dir);

        rows.sort(function (a, b) {
          var av = (a.cells[colIndex] ? a.cells[colIndex].textContent : '').trim();
          var bv = (b.cells[colIndex] ? b.cells[colIndex].textContent : '').trim();
          if (type === 'number') {
            av = parseMetric(av);
            bv = parseMetric(bv);
            return dir === 'ascending' ? av - bv : bv - av;
          }
          return dir === 'ascending' ? av.localeCompare(bv, 'zh-CN') : bv.localeCompare(av, 'zh-CN');
        });
        rows.forEach(function (row) { tbody.appendChild(row); });
        apply();
      };

      th.addEventListener('click', sort);
      th.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          sort();
        }
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-filter-key]'), function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-filter-key');
        var value = chip.getAttribute('data-filter-value');
        if (filters[key] === value) {
          delete filters[key];
          chip.classList.remove('is-active');
        } else {
          Array.prototype.forEach.call(root.querySelectorAll('[data-filter-key="' + key.replace(/"/g, '\\"') + '"]'), function (other) {
            other.classList.remove('is-active');
          });
          filters[key] = value;
          chip.classList.add('is-active');
        }
        apply();
      });
    });

    if (clear) {
      clear.addEventListener('click', function () {
        filters = {};
        if (search) search.value = '';
        Array.prototype.forEach.call(root.querySelectorAll('.filter-chip'), function (chip) {
          chip.classList.remove('is-active');
        });
        apply();
      });
    }

    apply();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-table]'), initTable);

  /* 选项卡：点击 / 方向键切换 */
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length) return;

    function activate(index, focus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (focus && selected) tab.focus();
      });
      panels.forEach(function (panel, i) {
        panel.hidden = i !== index;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          activate(next, true);
        }
      });
    });

    activate(0, false);
  });

  /* 复制链接 / 复制 QQ */
  function copyText(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = old; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        window.prompt('复制以下内容', text);
      });
    } else {
      window.prompt('复制以下内容', text);
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy-url], [data-copy-text]'), function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy-url') || btn.getAttribute('data-copy-text') || '', btn);
    });
  });

  /* TOC 滚动高亮 */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc-list a[href^="#"]'));
  if (tocLinks.length) {
    var linkMap = {};
    tocLinks.forEach(function (a) {
      linkMap[a.getAttribute('href').slice(1)] = a;
    });
    var updateToc = function () {
      var sections = Object.keys(linkMap)
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);
      if (!sections.length) return;
      var y = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function (section) {
        if (section.offsetTop <= y) current = section;
      });
      tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
      if (current && linkMap[current.id]) linkMap[current.id].classList.add('is-active');
    };
    window.addEventListener('scroll', updateToc, { passive: true });
    updateToc();
  }

  /* 产品缩略图：切换选中态 */
  Array.prototype.forEach.call(document.querySelectorAll('.model-thumb'), function (thumb) {
    thumb.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.model-thumb'), function (t) {
        t.classList.remove('is-active');
      });
      thumb.classList.add('is-active');
    });
  });
})();
