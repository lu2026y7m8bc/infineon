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
})();
