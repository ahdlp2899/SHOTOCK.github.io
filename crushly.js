/* ===== CRUSHLY shared script ===== */
// Page users land on after login (returning users with a saved profile)
const HOME_PAGE = "dashboard.html";

(function () {
  const $ = s => document.querySelector(s);
  const HP = "M50 90C18 66 4 46 4 28 4 14 15 5 28 5c9 0 17 5 22 13C55 10 63 5 72 5c13 0 24 9 24 23 0 18-14 38-46 62Z";

  // --- logo + tagline + animated hero (edit tagline text here) ---
  const heart = (cls, a, b) => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="g${cls}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path d="${HP}" fill="url(#g${cls})" fill-opacity=".55" stroke="#ffd6ec" stroke-opacity=".85" stroke-width="3" stroke-linejoin="round"/><path d="M50 82C26 63 14 47 14 30" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/><path d="M50 18V90M50 18 28 5M50 18 72 5" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/></svg>`;
  const top = $("#top");
  const brandHTML = `
    <div class="brand">
      <svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF2D8D"/><stop offset="1" stop-color="#8A2EFF"/></linearGradient></defs><path d="${HP}" fill="none" stroke="url(#lg)" stroke-width="9" stroke-linejoin="round" transform="translate(-6 -4) scale(.9)"/><path d="${HP}" fill="none" stroke="#8A2EFF" stroke-opacity=".8" stroke-width="7" stroke-linejoin="round" transform="translate(14 8) scale(.8)"/></svg>
      <div><h1>Crushly</h1><p>Real People &bull; Real Connections</p></div>
    </div>
    `;
  const heroHTML = `<div class="hero" aria-hidden="true"><div class="ring"></div><div class="ring r2"></div>
      <div class="hearts">${heart("h1", "#FF2D8D", "#FF8CC6")}${heart("h2", "#8A2EFF", "#C58BFF")}</div></div>`;
  if (top) top.innerHTML = brandHTML + (top.dataset.hero === "0" ? "" : heroHTML);

  // --- animated page transition between login and signup ---
  document.addEventListener("click", e => {
    const a = e.target.closest("a.nav");
    if (!a) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = a.href), 600);
  });

  // --- show / hide password ---
  document.querySelectorAll(".eye").forEach(b => b.addEventListener("click", () => {
    const i = b.parentElement.querySelector("input");
    i.type = i.type === "password" ? "text" : "password";
    b.setAttribute("aria-label", i.type === "password" ? "Show password" : "Hide password");
  }));

  // --- mouse parallax on the hero ---
  const hero = $(".hero");
  if (hero) addEventListener("pointermove", e => {
    const x = (e.clientX / innerWidth - .5) * 2, y = (e.clientY / innerHeight - .5) * 2;
    hero.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  });

  // --- floating hearts + sparkles background (60 FPS canvas) ---
  const c = $("#fx"), g = c.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shape = new Path2D("M0 6C-10 -2 -10 -10 -4 -10C-1 -10 0 -8 0 -6C0 -8 1 -10 4 -10C10 -10 10 -2 0 6Z");
  const colors = ["#FF2D8D", "#FF4FB3", "#8A2EFF", "#C58BFF"];
  let W, H, P = [];
  const COUNT = 30; // number of floating particles
  function size() { W = c.width = innerWidth; H = c.height = innerHeight; }
  function spawn(fromBottom) {
    return { x: Math.random() * W, y: fromBottom ? H + 20 : Math.random() * H, s: .4 + Math.random() * .9,
      v: .2 + Math.random() * .6, ph: Math.random() * 6.28, dot: Math.random() < .4,
      col: colors[Math.random() * colors.length | 0] };
  }
  function frame(t) {
    g.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y -= p.v; p.x += Math.sin(t / 1500 + p.ph) * .3;
      if (p.y < -20) Object.assign(p, spawn(true));
      g.globalAlpha = .25 + .5 * Math.abs(Math.sin(t / 1200 + p.ph));
      g.fillStyle = g.shadowColor = p.col; g.shadowBlur = 12;
      g.save(); g.translate(p.x, p.y); g.scale(p.s, p.s);
      if (p.dot) { g.beginPath(); g.arc(0, 0, 2, 0, 6.28); g.fill(); } else g.fill(shape);
      g.restore();
    }
    if (!reduce && !document.hidden) requestAnimationFrame(frame);
  }
  size(); addEventListener("resize", size);
  for (let i = 0; i < COUNT; i++) P.push(spawn(false));
  requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => !document.hidden && !reduce && requestAnimationFrame(frame));

  // page restored by the Back button must not stay faded out
  addEventListener("pageshow", () => document.body.classList.remove("leaving"));

  // --- helpers used by the pages ---
  window.crushly = {
    heroHTML,
    msg(text, ok) { const m = document.getElementById("msg"); m.textContent = text; m.className = "msg" + (ok ? " ok" : ""); },
    async goHome() {
      const { data: { session } } = await db.auth.getSession();
      if (!session) return false;
      const { data: p } = await db.from("profiles").select("id").eq("id", session.user.id).maybeSingle();
      location.href = p ? HOME_PAGE : "profile.html";
      return true;
    }
  };
})();
