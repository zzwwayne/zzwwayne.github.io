/**
 * script.js — Alex Chen Portfolio
 * Smooth scroll, mobile nav, scroll animations, active nav
 */

(function () {
  'use strict';

  // ============================================
  // DOM References
  // ============================================

  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkItems = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('.section, .hero');

  // ============================================
  // Smooth Scrolling
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href');
      var target = document.querySelector(targetId);

      if (target) {
        var offset = nav.offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top: top, behavior: 'smooth' });

        // Close mobile nav if open
        closeMobileNav();
      }
    });
  });

  // ============================================
  // Mobile Navigation Toggle
  // ============================================

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.contains('nav__links--open');

    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  function openMobileNav() {
    navLinks.classList.add('nav__links--open');
    navToggle.classList.add('nav__toggle--active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    navLinks.classList.remove('nav__links--open');
    navToggle.classList.remove('nav__toggle--active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Close mobile nav on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      closeMobileNav();
    }
  });

  // ============================================
  // Nav Shadow on Scroll
  // ============================================

  var scrollTimeout;

  window.addEventListener('scroll', function () {
    if (scrollTimeout) return;

    scrollTimeout = requestAnimationFrame(function () {
      if (window.scrollY > 10) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
      scrollTimeout = null;
    });
  });

  // ============================================
  // Active Nav Link Highlighting
  // ============================================

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');

          navLinkItems.forEach(function (link) {
            link.classList.remove('nav__link--active');

            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('nav__link--active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ============================================
  // Scroll-based Fade-in Animations
  // ============================================

  function initFadeAnimations() {
    // Add fade-in class to elements we want to animate
    var animateTargets = document.querySelectorAll(
      '.work__card, .about__content, .skills__group, .contact__text, .contact__email, .contact__socials'
    );

    animateTargets.forEach(function (el) {
      el.classList.add('fade-in');
    });

    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in--visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1,
      }
    );

    document.querySelectorAll('.fade-in').forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  // Stagger work cards for a cascading effect
  function staggerWorkCards() {
    var cards = document.querySelectorAll('.work__card.fade-in');
    cards.forEach(function (card, index) {
      card.style.transitionDelay = index * 0.1 + 's';
    });
  }

  initFadeAnimations();
  staggerWorkCards();

})();
