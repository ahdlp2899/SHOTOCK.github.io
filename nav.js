/* ===== CRUSHLY bottom navigation — ONE shared copy, same icons on every page ===== */
(function () {
  if (new URLSearchParams(location.search).has("m")) return; // hidden inside an open chat
  const ICON = {
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>' };
  // icon, label, page (null = coming soon). Edit here to change the menu everywhere.
  const ITEMS = [["home", "Home", "dashboard.html"], ["chat", "Chat", "chat.html"], ["cal", "Date", null], ["user", "Profile", "profile.html"]];
  const page = location.pathname.split("/").pop() || "index.html";
  const st = document.createElement("style");
  st.textContent = `.bnav{position:fixed;z-index:5;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom,0px));width:min(440px,calc(100% - 24px));display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:8px;border-radius:999px;background:rgba(15,6,30,.78);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1.5px solid rgba(255,45,141,.5);box-shadow:0 0 26px rgba(255,45,141,.25)}
.bnav>*{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:999px;border:0;background:none;color:#b9a6dd;font:500 12px "Poppins",system-ui,sans-serif;text-decoration:none;cursor:pointer;transition:.3s}
.bnav svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bnav .on{color:#fff;background:linear-gradient(135deg,rgba(255,45,141,.55),rgba(138,46,255,.55));box-shadow:0 0 18px rgba(255,45,141,.7)}
.nvt{position:fixed;z-index:50;left:50%;top:18px;transform:translate(-50%,-90px);padding:12px 20px;border-radius:999px;background:rgba(15,6,30,.94);border:1.5px solid #FF4FB3;box-shadow:0 0 22px rgba(255,45,141,.5);color:#fff;transition:transform .4s}
.nvt.show{transform:translate(-50%,0)}`;
  document.head.append(st);
  const toast = document.createElement("div"); toast.className = "nvt"; toast.setAttribute("role", "status"); document.body.append(toast);
  let tt; const say = t => { toast.textContent = t; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2200); };
  const nav = document.createElement("nav"); nav.className = "bnav"; nav.setAttribute("aria-label", "Main");
  ITEMS.forEach(([i, label, href]) => {
    const on = href === page, e = document.createElement(href ? "a" : "button");
    if (href) { e.href = href; if (!on) e.className = "nav"; } else e.type = "button";
    if (on) { e.classList.add("on"); e.setAttribute("aria-current", "page"); }
    e.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[i]}</svg>${label}`;
    if (!href) e.addEventListener("click", () => say("Coming soon \u2665"));
    nav.append(e);
  });
  document.body.append(nav);
})();
