/* script.js — Fall on enter (5s) and stop on the hand (palm), robust to parallax */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const parseY = el => {
    const m = (el.style.transform || '').match(/translate3d\(0,\s*([-\d.]+)px/i);
    return m ? parseFloat(m[1]) : 0;
  };
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function init() {
    const track  = $('.scroll');
    const embryo = $('.scroll .embryo');
    const hand   = $('.scroll .hand');
    if (!track || !embryo || !hand) return;

    embryo.style.willChange = 'transform';

    const GAP         = 6;        // small breathing space above the contact point
    const DURATION    = 5000;     // ← 5 seconds total
    const STOP_ANCHOR = 0.58;     // 0 = hand top, 1 = hand bottom (palm ≈ 0.55–0.65)

    let animId = 0, startTime = 0, startY = 0, targetY = 0;

    const computeStop = () => {
      const tr = track.getBoundingClientRect();
      const hr = hand.getBoundingClientRect();
      const er = embryo.getBoundingClientRect();

      const embryoH = er.height || embryo.offsetHeight || 0;
      const handTopInTrack = hr.top - tr.top;     // hand top relative to the track (parallax-safe)
      const handH = hr.height || hand.offsetHeight || 0;
      const trackH = tr.height;

      // Aim to rest on the palm: some % down the hand
      const desired = handTopInTrack + handH * STOP_ANCHOR - embryoH - GAP;

      // Clamp inside the track
      return Math.max(0, Math.min(desired, trackH - embryoH));
    };

    const step = now => {
      const t = Math.min(1, (now - startTime) / DURATION);
      const y = startY + (targetY - startY) * easeOutCubic(t);
      embryo.style.transform = `translate3d(0, ${Math.round(y)}px, 0)`;
      if (t < 1) animId = requestAnimationFrame(step);
      else animId = 0;
    };

    const startFall = () => {
      if (animId) cancelAnimationFrame(animId);
      startY = parseY(embryo) || 0;
      targetY = computeStop();
      startTime = performance.now();
      animId = requestAnimationFrame(step);
    };

    // Start when the pointer enters the left column (mouse or touch), or via keyboard focus
    track.addEventListener('pointerenter', startFall, { passive: true });
    track.addEventListener('focus', startFall);

    // If layout changes during the fall (resize/parallax), re-aim the end position
    addEventListener('resize', () => { if (animId) targetY = computeStop(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
// Header heart dropdown (home page)
(() => {
  const wrap = document.querySelector('.main .header-icon');
  const btn  = wrap?.querySelector('.nav-toggle');
  const menu = wrap?.querySelector('#quickNav');
  if (!wrap || !btn || !menu) return;

  const close = () => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); };
  const open  = () => { wrap.classList.add('is-open');    btn.setAttribute('aria-expanded','true');  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.contains('is-open') ? close() : open();
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
})();
