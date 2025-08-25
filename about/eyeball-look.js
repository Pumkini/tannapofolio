// /about/eyeball-look.js
// Rotate the eyeball toward the mouse. No moving/scaling.
// Keeps looking at the last mouse point while scrolling.
(() => {
  const onReady = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  onReady(() => {
    const eye = document.querySelector(".about-me .eyeball");
    if (!eye) return;

    // last mouse position so scroll still points correctly
    let last = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function pointEye() {
      const r = eye.getBoundingClientRect();

      // pivot (matches CSS transform-origin below)
      const cx = r.left + r.width * 0.42;
      const cy = r.top + r.height * 0.58;

      const dx = last.x - cx;
      const dy = last.y - cy;

      // +90 aligns your artwork's "up" with facing forward
      const deg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      eye.style.setProperty("--eye-rot", `${clamp(deg, -90, 90)}deg`);
    }

    window.addEventListener("pointermove", (e) => {
      last.x = e.clientX;
      last.y = e.clientY;
      pointEye();
    });

    window.addEventListener("scroll", pointEye, { passive: true });
    window.addEventListener("resize", pointEye);

    pointEye();
  });
})();
