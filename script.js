"use strict";

// 渐进增强：关闭 JavaScript 后，完整新闻和普通导航链接仍可使用。
(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#navigation-links");
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const mobile = window.matchMedia("(max-width: 640px)");
  let framePending = false;

  function measureHeader() {
    if (header) {
      document.documentElement.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    }
  }

  // 以吸顶导航下方的阅读位置确定当前板块，避免短板块与长板块争夺高亮。
  function updateActiveLink() {
    framePending = false;
    if (!sections.length) return;
    const readingLine = (header ? header.getBoundingClientRect().height : 0) + 32;
    let active = sections[0].dataset.section;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) active = section.dataset.section;
    }
    // 页面末尾的 Contact 较短，无法总是滚动到顶部，故到达页底时显式选中。
    if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1].dataset.section;
    }
    for (const link of navLinks) {
      if (link.dataset.nav === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateActiveLink);
  }

  function setMenu(open) {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", String(open));
    navigation.hidden = mobile.matches && !open;
    measureHeader();
    scheduleUpdate();
  }

  if (header && menuButton && navigation) {
    header.dataset.menuReady = "true";
    const syncMenu = () => {
      const focused = document.activeElement;
      menuButton.hidden = !mobile.matches;
      setMenu(false);
      // 改变窗口宽度时，避免焦点停留在被隐藏的菜单项或按钮上。
      if (mobile.matches && navigation.contains(focused)) menuButton.focus();
      else if (!mobile.matches && focused === menuButton) navLinks[0]?.focus();
    };
    syncMenu();
    mobile.addEventListener("change", syncMenu);
    menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
    header.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link || !mobile.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      setMenu(false);
      // 保留原生锚点、URL 与浏览器历史；CSS 提供平滑滚动及 reduced-motion 支持。
      const target = document.getElementById(link.getAttribute("href").slice(1));
      target?.focus({ preventScroll: true });
    });
    header.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuButton.focus();
      }
    });
  }

  const newsList = document.querySelector("#news-list");
  const extraNews = document.querySelector("#news-extra");
  const newsButton = document.querySelector(".news-toggle");
  if (newsList && extraNews && newsButton) {
    const olderItems = [...newsList.children].slice(3);
    if (olderItems.length) {
      extraNews.append(...olderItems);
      newsButton.hidden = false;
      newsButton.addEventListener("click", () => {
        const expanded = newsButton.getAttribute("aria-expanded") === "true";
        extraNews.hidden = expanded;
        newsButton.setAttribute("aria-expanded", String(!expanded));
        newsButton.textContent = expanded ? "Show more" : "Show less";
        scheduleUpdate();
      });
    }
  }

  if (header && "ResizeObserver" in window) {
    new ResizeObserver(() => { measureHeader(); scheduleUpdate(); }).observe(header);
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", () => { measureHeader(); scheduleUpdate(); });
  window.addEventListener("load", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  measureHeader();
  updateActiveLink();
})();
