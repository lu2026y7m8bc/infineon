/* ==========================================================================
   力通 · 英飞凌代理官网 — 交互脚本
   T1.1：顶部导航（滚动固定、移动抽屉、Esc/外点关闭）
   后续任务在此文件追加表格/选项卡/FAQ 等交互。
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
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
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

  /* T1.7 动态表格：搜索 / 排序 / 筛选 / 空态 */
  function initTable(root) {
    var table = root.querySelector('table');
    if (!table) return;
    var tbody = table.tBodies[0];
    if (!tbody) return;

    var search = root.querySelector('[data-table-search]');
    var empty = root.querySelector('[data-table-empty]');
    var count = root.querySelector('[data-table-count]');
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
      th.addEventListener('click', function () {
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
            av = parseFloat(av.replace(/[^0-9.\-]/g, '')) || 0;
            bv = parseFloat(bv.replace(/[^0-9.\-]/g, '')) || 0;
            return dir === 'ascending' ? av - bv : bv - av;
          }
          return dir === 'ascending' ? av.localeCompare(bv, 'zh-CN') : bv.localeCompare(av, 'zh-CN');
        });
        rows.forEach(function (row) { tbody.appendChild(row); });
        apply();
      });
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-filter-key]'), function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-filter-key');
        var value = chip.getAttribute('data-filter-value');
        if (filters[key] === value) {
          delete filters[key];
          chip.classList.remove('is-active');
          chip.remove();
        }
        apply();
      });
    });

    apply();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-table]'), initTable);

  /* T1.8 选项卡：点击 / 方向键切换 */
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
})();
