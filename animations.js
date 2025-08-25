/* animations.js — pure JS + WAAPI. Header left as-is. */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- helpers ---------- */
  const animate = (el, keyframes, options) => {
    if (!el) return null;
    try {
      const a = el.animate(keyframes, options);
      a.addEventListener?.('finish', () => a.commitStyles?.());
      return a;
    } catch { return null; }
  };
  const onceInView = (el, cb, opts = { threshold: 0.25, rootMargin: '0px' }) => {
    if (!el) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { cb(el); obs.unobserve(el); } });
    }, opts);
    io.observe(el);
  };
  const splitLetters = (el) => {
    if (!el) return [];
    const text = el.textContent;
    el.textContent = '';
    const spans = [];
    for (const ch of text) {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.display = 'inline-block';
      span.style.transformOrigin = '50% 70%';
      el.appendChild(span);
      spans.push(span);
    }
    return spans;
  };
  const gentleFloat = (el, { px = 6, ms = 2600 } = {}) => {
    if (!el || prefersReduced) return;
    animate(el, [
      { transform: 'translateY(0px)' },
      { transform: `translateY(${px}px)` },
      { transform: 'translateY(0px)' }
    ], { duration: ms, iterations: Infinity, easing: 'ease-in-out' });
  };
  const spin = (el, { ms = 8000 } = {}) => {
    if (!el || prefersReduced) return;
    animate(el, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      { duration: ms, iterations: Infinity, easing: 'linear' });
  };
  const parallax = (el, speed = 0.2) => {
    if (!el || prefersReduced) return;
    const base = el.getBoundingClientRect().top + window.scrollY;
    const tick = () => {
      const y = (window.scrollY - base) * speed;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  };

  

  /* ---------- right-heart navigator (links to pages) ---------- */
function initRightLogoNavigator() {
  const rightLogo = document.querySelector('.header-icon');
  const heartImg  = document.querySelector('.header-icon .heart-2') || rightLogo;
  if (!rightLogo) return;

  // webfont once
  if (!document.querySelector('link[data-space-mono]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap';
    l.setAttribute('data-space-mono', 'true');
    document.head.appendChild(l);
  }

  const LINKS = {
    About:   'about/about.html',
    Explore: 'gallery/gallery.html',
    Contact: 'contact/contact.html',
    Home:    'index.html'
  };

  const CLOSED_DEG = 180, OPEN_DEG = 0;
  heartImg.style.transformOrigin = '50% 50%';
  heartImg.style.transform = `rotate(${CLOSED_DEG}deg)`;

  // floating panel next to the heart
  const navWrap = document.createElement('div');
  navWrap.setAttribute('data-right-logo-nav','');
  Object.assign(navWrap.style, { position: 'fixed', zIndex: '99999', pointerEvents: 'none' });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    display: 'flex', flexDirection: 'column', gap: '28px',
    pointerEvents: 'auto', opacity: '0', transform: 'translateY(6px)'
  });

  const mkButton = (label, href) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    Object.assign(b.style, {
      background: 'transparent', border: 'none', padding: 0, margin: 0,
      cursor: 'pointer', textAlign: 'left', color: '#ffffff',
      fontFamily: '"Space Mono", monospace', fontWeight: '400',
      fontSize: '48px', lineHeight: '1.1', letterSpacing: '0.02em',
      outline: 'none', transition: 'color .18s ease'
    });
    b.addEventListener('mouseenter', () => (b.style.color = '#87DF2B'));
    b.addEventListener('mouseleave', () => (b.style.color = '#ffffff'));
    b.addEventListener('click', () => { hide(); window.location.href = href; });
    return b;
  };

  panel.append(
    mkButton('About',   LINKS.About),
    mkButton('Explore', LINKS.Explore),
    mkButton('Contact', LINKS.Contact),
    mkButton('Home',    LINKS.Home)
  );
  navWrap.appendChild(panel);
  document.body.appendChild(navWrap);

  const V_GAP = 10;
  const positionNav = () => {
    const r = rightLogo.getBoundingClientRect();
    navWrap.style.left = Math.round(Math.max(8, r.left)) + 'px';
    navWrap.style.top  = Math.round(Math.max(8, r.bottom + V_GAP)) + 'px';
    const vh = innerHeight, ph = panel.offsetHeight || 0;
    if (r.bottom + V_GAP + ph > vh - 8) navWrap.style.top = Math.round(vh - ph - 8) + 'px';
  };

  const animate = (el, kfs, opts) => {
    const a = el.animate(kfs, opts); a.addEventListener?.('finish', () => a.commitStyles?.()); return a;
  };
  const rotateTo = (deg) => animate(heartImg, [
      { transform: heartImg.style.transform || `rotate(${deg}deg)` },
      { transform: `rotate(${deg}deg)` }
    ], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });

  let open = false;
  const show = () => {
    positionNav();
    rotateTo(OPEN_DEG);
    panel.animate(
      [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 180, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
    );
    open = true;
    addEventListener('resize', positionNav);
    addEventListener('scroll', positionNav, { passive: true });
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey);
  };
  const hide = () => {
    rotateTo(CLOSED_DEG);
    panel.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(6px)' }],
      { duration: 140, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    );
    open = false;
    removeEventListener('resize', positionNav);
    removeEventListener('scroll', positionNav);
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKey);
  };
  const toggle = () => (open ? hide() : show());

  rightLogo.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggle(); });
  const onDocClick = (e) => { if (navWrap.contains(e.target) || rightLogo.contains(e.target)) return; hide(); };
  const onKey = (e) => { if (e.key === 'Escape') hide(); };
}

  /* ---------- physics for the pills (gravity + drag) ---------- */
  function initPillPhysics() {
    const pills = $$('.UI-UX, .element-DESIGNER, .TANNA, .element-DESIGN, .star');
    if (!pills.length) return;

    const cluster = pills[0].parentElement;
    const clusterRect = cluster?.getBoundingClientRect();
    if (cluster && clusterRect) {
      cluster.style.minHeight = `${Math.round(clusterRect.height)}px`;
      cluster.style.position = cluster.style.position || 'relative';
    }

    const hasTransformedAncestor = (node) => {
      for (let n = node.parentElement; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.transform !== 'none' || cs.willChange.includes('transform') || cs.filter !== 'none') return true;
      }
      return false;
    };
    const portalizeToBody = (el) => {
      const ghost = document.createElement('div');
      const cs = getComputedStyle(el);
      ghost.style.width  = el.offsetWidth + 'px';
      ghost.style.height = el.offsetHeight + 'px';
      ghost.style.display = (cs.display === 'inline') ? 'inline-block' : cs.display;
      ghost.style.margin  = cs.margin;
      ghost.style.flex    = cs.flex;
      ghost.style.alignSelf = cs.alignSelf;
      ghost.style.verticalAlign = cs.verticalAlign || 'middle';
      el.after(ghost);
      document.body.appendChild(el);
      return ghost;
    };

    let NO_SELECT_TAG = null;
    const toggleGlobalSelect = (off) => {
      if (off) {
        if (!NO_SELECT_TAG) {
          NO_SELECT_TAG = document.createElement('style');
          NO_SELECT_TAG.id = 'pill-no-select-style';
          NO_SELECT_TAG.textContent =
            `*{user-select:none !important;-webkit-user-select:none !important;-ms-user-select:none !important}
             img,svg{pointer-events:none}`;
          document.head.appendChild(NO_SELECT_TAG);
        }
      } else if (NO_SELECT_TAG) {
        NO_SELECT_TAG.remove();
        NO_SELECT_TAG = null;
      }
    };

    const bodies = [];
    const groundEl = $('.text-wrapper-2'); // top edge is “ground”

    const G = 2000, REST = 0.35, WALL_REST = 0.4, FRICTION = 0.86, STOP_V = 12, PAD = 8;

    pills.forEach((el, i) => {
      if (hasTransformedAncestor(el)) portalizeToBody(el);

      const r = el.getBoundingClientRect();

      Object.assign(el.style, {
        position: 'fixed',
        left: `${r.left}px`,
        top:  `${r.top}px`,
        margin: '0',
        zIndex: String(100 + i),         // keep below the big name
        willChange: 'transform,left,top',
        cursor: 'grab',
        touchAction: 'none'
      });

      el.style.userSelect = 'none';
      el.querySelectorAll('*').forEach(n => (n.style.userSelect = 'none'));
      el.addEventListener('dragstart', (e) => e.preventDefault());

      bodies.push({
        el, w: r.width || 120, h: r.height || 48,
        x: r.left, y: r.top, vx: 0, vy: 0,
        dragging: false, dragId: null, dragDX: 0, dragDY: 0,
        lastPX: 0, lastPY: 0, lastPT: 0
      });

      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const b = bodies[i];
        el.setPointerCapture(e.pointerId);
        toggleGlobalSelect(true);
        b.dragging = true; b.dragId = e.pointerId;
        b.dragDX = e.clientX - b.x; b.dragDY = e.clientY - b.y;
        b.vx = b.vy = 0;
        b.lastPX = e.clientX; b.lastPY = e.clientY; b.lastPT = performance.now();
        el.style.cursor = 'grabbing';
        animate(el, [{ transform:'scale(1)' }, { transform:'scale(1.05)' }],
          { duration:120, fill:'forwards', easing:'cubic-bezier(.2,.7,.2,1)' });
      });

      el.addEventListener('pointermove', (e) => {
        const b = bodies[i]; if (!b.dragging || b.dragId !== e.pointerId) return;
        b.x = e.clientX - b.dragDX; b.y = e.clientY - b.dragDY;
        const now = performance.now(), dt = Math.max(1, now - b.lastPT) / 1000;
        b.vx = (e.clientX - b.lastPX) / dt; b.vy = (e.clientY - b.lastPY) / dt;
        b.lastPX = e.clientX; b.lastPY = e.clientY; b.lastPT = now;
      });

      const endDrag = (e) => {
        const b = bodies[i]; if (!b.dragging || (e && b.dragId !== e.pointerId)) return;
        b.dragging = false; b.dragId = null; el.style.cursor = 'grab';
        toggleGlobalSelect(false);
        animate(el, [{ transform:'scale(1.05)' }, { transform:'scale(1)' }],
          { duration:140, fill:'forwards', easing:'cubic-bezier(.2,.7,.2,1)' });
      };
      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);
      el.addEventListener('lostpointercapture', endDrag);
    });

    const groundY = () => {
      const r = groundEl?.getBoundingClientRect();
      return r ? (r.top - 10) : Math.round(innerHeight * 0.6);
    };

    const clampX = (b) => {
      const min = PAD, max = innerWidth - b.w - PAD;
      if (b.x < min) { b.x = min; b.vx = -b.vx * WALL_REST; }
      if (b.x > max) { b.x = max; b.vx = -b.vx * WALL_REST; }
    };

    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      const gy = groundY();

      bodies.forEach((b) => {
        if (!b.dragging) {
          b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;

          if (b.y + b.h >= gy) {
            b.y = gy - b.h;
            b.vy = -b.vy * REST;
            b.vx *= FRICTION;
            if (Math.abs(b.vy) < STOP_V) b.vy = 0;
            if (Math.abs(b.vx) < STOP_V) b.vx = 0;
          }
          clampX(b);
        } else {
          clampX(b);
          const minY = PAD, maxY = innerHeight - b.h - PAD;
          if (b.y < minY) b.y = minY;
          if (b.y > maxY) b.y = maxY;
        }

        b.el.style.left = `${Math.round(b.x)}px`;
        b.el.style.top  = `${Math.round(b.y)}px`;
      });

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    onceInView(pills[0], () => { bodies.forEach((b,i)=>{ b.vy += 50 + i*20; }); });
  }

  /* ---------- page boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const email   = $('.text-wrapper');
    const arrow   = $('.arrow');
    const tagline = $('.creative-mind-based');

    if (prefersReduced) {
      [email, tagline].forEach(el => el && (el.style.opacity = '1'));
      $$('.text-wrapper-2, .overlap-3, .text-wrapper-8, .welcome-to-my, .ear, .heart, .brain')
        .forEach(el => el && (el.style.opacity = '1'));
      initRightLogoNavigator();
      initPillPhysics();
      return;
    }

    /* header fades (no layout change) */
    animate(email,   [{ opacity:0 }, { opacity:1 }], { duration:600, easing:'ease-out', delay:100 });
    animate(tagline, [{ opacity:0 }, { opacity:1 }], { duration:600, easing:'ease-out', delay:200 });
    animate(arrow,   [{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(0)'}],
      { duration:900, iterations:Infinity, easing:'ease-in-out' });

    /* name intro */
    const nameEl = $('.text-wrapper-2');
    if (nameEl) {
      // allow hover color only on the name
      nameEl.setAttribute('data-hoverable', '1');
      const letters = splitLetters(nameEl);
      letters.forEach((span, i) => {
        span.style.opacity = '0';
        animate(span, [
          { opacity:0, transform:'translateY(24px) scale(.98)' },
          { opacity:1, transform:'translateY(0) scale(1)' }
        ], { duration:520, delay:40*i+200, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
      });
    }

    /* cluster reveal */
    const clusterBits = $$('.element-DESIGN, .element-DESIGNER, .TANNA, .UI-UX, .star');
    clusterBits.forEach((el, i) => {
      el.style.opacity = el.style.opacity || '0';
      animate(el, [
        { opacity:0, transform:'translateY(18px) scale(.96)' },
        { opacity:1, transform:'translateY(0) scale(1)' }
      ], { duration:500, delay:120*i+600, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
    });

    /* welcome line */
    const hi = $('.text-wrapper-8');
    animate(hi, [{ opacity:0, transform:'translateY(16px)' }, { opacity:1, transform:'translateY(0)' }],
      { duration:600, delay:400, easing:'cubic-bezier(.2,.7,.2,1)' });

    onceInView($('.welcome-to-my'), (w) => {
      const punch = $('.welcome-to-my .text-wrapper-7');
      animate(w, [{ opacity:0 }, { opacity:1 }], { duration:500, easing:'ease-out' });
      animate(punch, [
        { transform:'scale(1)',   filter:'drop-shadow(0 0 0px #87df2b)' },
        { transform:'scale(1.06)',filter:'drop-shadow(0 0 12px #87df2b)' },
        { transform:'scale(1)',   filter:'drop-shadow(0 0 0px #87df2b)' }
      ], { duration:1400, iterations:2, easing:'ease-in-out', delay:200 });
    });

    /* parallax column */
    /* parallax column */
// (Embryo is controlled by scroll-icon logic below)
// parallax($('.scroll .embryo'), 0.12);
/* parallax column — embryo transform is owned by script.js */
const embryoEl = $('.scroll .embryo');
embryoEl?.getAnimations?.().forEach(a => a.cancel());  // ensure no transform animations on embryo

parallax($('.scroll .hand'), 0.18);     // single call (duplicate removed)
// gentleFloat(embryoEl, { px: 5, ms: 3000 }); // disabled: would fight scroll-follow
gentleFloat($('.scroll .hand'), { px: 7, ms: 3400 }); // optional


    /* trio micro-interactions */
    const heartImg = $('.heart .img-2');
    const heartTxt = $('.heart .text-wrapper-10');
    const brainImg = $('.brain .overlap-6');
    const brainTxt = $('.brain .text-wrapper-11');
    const earImg   = $('.ear .overlap-4');
    const earTxt   = $('.ear .text-wrapper-9');

    const revealPair = (img, txt, d = 0) => {
      if (img) {
        img.style.opacity = '0';
        onceInView(img, () => {
          animate(img, [
            { opacity:0, transform:'translateY(24px) scale(.96)' },
            { opacity:1, transform:'translateY(0) scale(1)' }
          ], { duration:600, easing:'cubic-bezier(.2,.7,.2,1)', delay:d });
        });
      }
      if (txt) {
        txt.style.opacity = '0';
        onceInView(txt, () => {
          animate(txt, [{ opacity:0, transform:'translateY(12px)' }, { opacity:1, transform:'translateY(0)' }],
            { duration:450, easing:'cubic-bezier(.2,.7,.2,1)', delay:d+120 });
        });
      }
    };
    revealPair(heartImg, heartTxt, 0);
    revealPair(brainImg, brainTxt, 80);
    revealPair(earImg,   earTxt,   140);

    gentleFloat(heartImg, { px: 5, ms: 2600 });
    gentleFloat(brainImg, { px: 4, ms: 2800 });
    gentleFloat(earImg,   { px: 6, ms: 3000 });

    initRightLogoNavigator();
  });
})();
