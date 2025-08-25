/* quote-typing.js — robust typewriter that won't affect header/bubbles
   Triggers when user hovers the quote area OR when the quote scrolls into view.
   Plays once and then stays rendered. Keeps <br> line breaks if present.
*/
(() => {
  const ready = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  ready(() => {
    const root = document.querySelector(".about-me");
    if (!root) return;

    const quote = root.querySelector(".p"); // your quote text element
    if (!quote || quote.dataset.initTyping === "1") return;
    quote.dataset.initTyping = "1";

    // A parent that covers the quote area (safe fallbacks)
    const frame =
      quote.closest(".overlap-group-2") ||
      root.querySelector(".overlap-group-wrapper") ||
      root.querySelector(".overlap-4") ||
      root.querySelector(".overlap-3") ||
      root;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Preserve original content (including <br>)
    const fullHTML = quote.innerHTML.trim();
    const fullText = quote.textContent;
    quote.setAttribute("aria-label", fullText);

    let played = false;

    const injectCaretCSS = () => {
      if (document.getElementById("typing-caret-css")) return;
      const st = document.createElement("style");
      st.id = "typing-caret-css";
      st.textContent = `
        .typing-caret{
          display:inline-block;width:.08em;height:.85em;margin-left:.06em;
          background:currentColor;vertical-align:-.05em;
          animation:typingBlink 1s steps(1) infinite
        }
        @keyframes typingBlink{50%{opacity:0}}
      `;
      document.head.appendChild(st);
    };

    const typeOnce = () => {
      if (played) return;
      played = true;

      if (prefersReduced) {
        // Show instantly for users who prefer less motion
        quote.innerHTML = fullHTML;
        return;
      }

      injectCaretCSS();

      // Tokenize the original HTML into characters + <br> markers
      const tmp = document.createElement("div");
      tmp.innerHTML = fullHTML;
      const tokens = [];
      const walk = (node) => {
        if (node.nodeType === 3) {
          for (const ch of node.nodeValue) tokens.push(ch);
        } else if (node.nodeName === "BR") {
          tokens.push("<br>");
        } else {
          node.childNodes && [...node.childNodes].forEach(walk);
        }
      };
      [...tmp.childNodes].forEach(walk);

      // Clear and type into the same element to preserve layout/typography
      quote.innerHTML = "";
      const caret = document.createElement("span");
      caret.className = "typing-caret";
      quote.appendChild(caret);

      let i = 0;
      const base = 28; // ms per char
      const jitter = 18;

      const step = () => {
        const token = tokens[i++];
        if (token === "<br>") {
          caret.insertAdjacentHTML("beforebegin", "<br>");
        } else {
          caret.insertAdjacentText("beforebegin", token);
        }
        if (i < tokens.length) {
          setTimeout(step, base + Math.random() * jitter);
        } else {
          // Finished: remove caret, leaving the typed text in place
          setTimeout(() => caret.remove(), 250);
        }
      };

      setTimeout(step, 160);
    };

    // Trigger: pointer enters the quote area (frame)
    frame.addEventListener("pointerenter", typeOnce, { passive: true });

    // Trigger: directly entering the quote (extra safety)
    quote.addEventListener("pointerenter", typeOnce, { passive: true });

    // Trigger: scrolled into view (plays even without hover)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            typeOnce();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(quote);
  });
})();
