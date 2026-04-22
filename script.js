/* NAV — solid on scroll */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', window.scrollY > 50);
}, { passive: true });

/* BURGER MENU */
const burger   = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');

burger.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  const [a, b] = burger.querySelectorAll('span');
  if (open) {
    a.style.cssText = 'transform: translateY(8px) rotate(45deg)';
    b.style.cssText = 'transform: translateY(-8px) rotate(-45deg)';
  } else {
    a.style.cssText = '';
    b.style.cssText = '';
  }
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => s.style.cssText = '');
  });
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

/* SCROLL REVEAL — hero */
const heroEls = ['.hero-tag', '.hero-title', '.hero-sub', '.hero-actions', '.hero-nums'];
heroEls.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
  });
});

window.addEventListener('load', () => {
  heroEls.forEach((sel, i) => {
    document.querySelectorAll(sel).forEach(el => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 80 + i * 110);
    });
  });
});

/* SCROLL REVEAL — ostatní sekce */
const revealTargets = [
  '.bento-card', '.pricing-card', '.how-card', '.how-example',
  '.review', '.about-list li', '.c-info-item',
  '.section-label', '.section-h', '.team-card',
];

revealTargets.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('reveal'));
    const delay = siblings.indexOf(entry.target) * 60;
    setTimeout(() => entry.target.classList.add('in'), delay);
    io.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* CONTACT FORM */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.btn-submit');
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ Odesláno – ozveme se do 24 hodin!';
  btn.style.background = '#16a34a';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.disabled = false;
    this.reset();
  }, 5000);
});

/* ACTIVE NAV HIGHLIGHT */
const sections = document.querySelectorAll('section[id], header[id]');
const navAs    = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) cur = s.id;
  });
  navAs.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--ink)' : '';
  });
}, { passive: true });
