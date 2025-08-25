/* about/animation.js — v14 (adds bubble-11 & bubble-12)
   ENTER hero: heart → -23.54°, bubbles → exact Figma coords, title neon
   LEAVE hero: heart → 0°, bubbles back to start, title revert
*/
(() => {
  const onReady = (fn) => {
    if (document.readyState === "complete") return fn();
    window.addEventListener("load", fn, { once: true });
  };

  onReady(() => {
    const page = document.querySelector(".about-me");
    if (!page) return;

    const frame =
      page.querySelector(".overlap-group-2") ||
      page.querySelector(".overlap-group-wrapper") ||
      page.querySelector(".overlap-4") ||
      page.querySelector(".overlap-3") ||
      page;

    if (!frame) return;
    if (getComputedStyle(frame).position === "static") frame.style.position = "relative";

    const bigHeart = frame.querySelector(".img-2");
    const title =
      frame.querySelector(".text-wrapper-11") ||
      frame.querySelector(".text-wrapper");

    // Figma destinations (frame-relative)
    const DEST = {
      ".bubble":     { left: 860, top: 816 },  // 1
      ".bubble-2":   { left: 323, top: 243 },  // 2
      ".bubble-3":   { left:  73, top: 169 },  // 3
      ".bubble-4":   { left: 952, top: 451 },  // 4
      ".bubble-5":   { left:  61, top: 816 },  // 5
      ".bubble-6":   { left: 1164, top: 169 }, // 6
      ".bubble-7":   { left: 1098, top: 533 }, // 7
      ".bubble-8":   { left: 1206, top: 787 }, // 8
      ".bubble-9":   { left:  289, top: 454 }, // 9
      ".bubble-10":  { left:  997, top: 205 }, // 10
      ".bubble-11":  { left:   58, top: 583 }, // 11 ← from your screenshot
      ".bubble-12":  { left:  485, top: 674 }, // 12 ← from your screenshot
    };

    const relToFrame = (el) => {
      const r = el.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();
      return { left: r.left - fr.left, top: r.top - fr.top };
    };

    const entries = Object.entries(DEST).map(([sel, dest]) => {
      const el = frame.querySelector(sel);
      if (!el) return null;

      el.style.transform = "translate(0,0)"; // reset before measuring
      const cur = relToFrame(el);
      const dx = dest.left - cur.left;
      const dy = dest.top  - cur.top;

      el.style.willChange = "transform";
      el.style.transition = "transform 720ms cubic-bezier(.2,1,.35,1)";
      return { el, dx, dy };
    }).filter(Boolean);

    // Heart rotation
    if (bigHeart) {
      bigHeart.style.transformOrigin = "50% 50%";
      bigHeart.style.transition = "transform .28s cubic-bezier(.2,.7,.2,1)";
      bigHeart.style.transform = "rotate(0deg)";
    }
    const heartOn  = () => { if (bigHeart) bigHeart.style.transform = "rotate(-23.54deg)"; };
    const heartOff = () => { if (bigHeart) bigHeart.style.transform = "rotate(0deg)"; };

    // Title tint
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NEON = "#ffffffff";
    const baseColor = title ? getComputedStyle(title).color : null;
    const titleOn  = () => {
      if (!title) return;
      if (prefersReduced) { title.style.color = NEON; return; }
      title.animate([{ color: getComputedStyle(title).color }, { color: NEON }],
                    { duration: 220, easing: "linear", fill: "forwards" });
    };
    const titleOff = () => {
      if (!title || !baseColor) return;
      if (prefersReduced) { title.style.color = baseColor; return; }
      title.animate([{ color: getComputedStyle(title).color }, { color: baseColor }],
                    { duration: 200, easing: "linear", fill: "forwards" });
    };

    const bubblesToDest = () => {
      entries.forEach(({ el, dx, dy }, i) => {
        el.style.transitionDelay = `${i * 0.02}s`;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };
    const bubblesToStart = () => {
      entries.forEach(({ el }) => {
        el.style.transitionDelay = "0s";
        el.style.transform = "translate(0,0)";
      });
    };

    function onEnter() { heartOn();  titleOn();  bubblesToDest(); }
    function onLeave() { heartOff(); titleOff(); bubblesToStart(); }

    frame.addEventListener("pointerenter", onEnter);
    frame.addEventListener("pointerleave", onLeave);
    frame.addEventListener("mouseenter", onEnter);
    frame.addEventListener("mouseleave", onLeave);
  });
})();
// About page – heart dropdown (same logic as Home)
(() => {
  const wrap = document.querySelector('.about-me .header-icon');
  if (!wrap) return;

  const btn  = wrap.querySelector('.nav-toggle');
  // class selector works with your current markup on About
  const menu = wrap.querySelector('.quick-nav');

  const close = () => { wrap.classList.remove('is-open'); btn?.setAttribute('aria-expanded','false'); };
  const open  = () => { wrap.classList.add('is-open');    btn?.setAttribute('aria-expanded','true');  };

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.contains('is-open') ? close() : open();
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
})();
/* ABOUT page – heart dropdown (scoped, no layout changes) */
(() => {
  const wrap = document.querySelector('.about-me .header-icon');
  if (!wrap) return;

  const btn  = wrap.querySelector('.nav-toggle');
  const menu = wrap.querySelector('#quickNav') || wrap.querySelector('.quick-nav');
  if (!btn || !menu) return;

  // keep it closed on load (honors a11y + fixes "stuck hidden")
  menu.hidden = true;
  btn.setAttribute('aria-expanded', 'false');

  const open  = () => {
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.hidden = false;                 // <-- critical: unhide
  };
  const close = () => {
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.hidden = true;                  // <-- critical: hide again
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    wrap.classList.contains('is-open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // close after picking a link
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });
  // ABOUT title hover color toggle
(function () {
  const title = document.getElementById('aboutTitle');
  if (!title) return;

  // choose a sensible hover area; first the hero wrapper if present
  const hoverArea =
    title.closest('.overlap-group-2') ||
    document.querySelector('.about-me .overlap-3') ||
    document.querySelector('.about-me') ||
    title;

  const onEnter = () => title.classList.add('is-hot');
  const onLeave = () => title.classList.remove('is-hot');

  hoverArea.addEventListener('mouseenter', onEnter);
  hoverArea.addEventListener('mouseleave', onLeave);
})();

})();
