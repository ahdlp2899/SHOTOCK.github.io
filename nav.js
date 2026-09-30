/* ===== CRUSHLY shared: bottom navigation, notifications, ban check, Report + Block ===== */
(function () {
  const ICON = {
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>' };
  // icon, label, page. Edit here to change the menu on every page.
  const ITEMS = [["home", "Home", "dashboard.html"], ["chat", "Chat", "chat.html"], ["cal", "Date", "date.html"], ["user", "Profile", "me.html"]];
  const raw = location.pathname.split("/").pop() || "index.html", page = raw === "profile.html" ? "me.html" : raw; // edit form keeps the Profile tab lit
  const inChat = new URLSearchParams(location.search).has("m"); // nav hidden inside an open chat
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const st = document.createElement("style");
  st.textContent = `.bnav{position:fixed;z-index:5;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom,0px));width:min(440px,calc(100% - 24px));display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:8px;border-radius:999px;background:rgba(15,6,30,.78);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1.5px solid rgba(255,45,141,.5);box-shadow:0 0 26px rgba(255,45,141,.25)}
.bnav>*{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:999px;border:0;background:none;color:#b9a6dd;font:500 12px "Poppins",system-ui,sans-serif;text-decoration:none;cursor:pointer;transition:.3s}
.bnav svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bnav .on{color:#fff;background:linear-gradient(135deg,rgba(255,45,141,.55),rgba(138,46,255,.55));box-shadow:0 0 18px rgba(255,45,141,.7)}
.nvt{position:fixed;z-index:70;left:50%;top:18px;transform:translate(-50%,-90px);padding:12px 20px;border-radius:999px;background:rgba(15,6,30,.94);border:1.5px solid #FF4FB3;box-shadow:0 0 22px rgba(255,45,141,.5);color:#fff;transition:transform .4s;max-width:90%;text-align:center}
.nvt.show{transform:translate(-50%,0)}
.rpbg{position:fixed;inset:0;z-index:60;background:rgba(7,4,15,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center}
.rpsheet{width:min(480px,100%);padding:18px 16px calc(20px + env(safe-area-inset-bottom,0px));border-radius:26px 26px 0 0;background:rgba(20,10,45,.97);border:1.5px solid rgba(255,45,141,.5);color:#fff;font:15px "Poppins",system-ui,sans-serif;animation:rpup .35s both}
@keyframes rpup{from{transform:translateY(100%)}}
.rpsheet select,.rpsheet textarea{width:100%;margin-top:10px;padding:13px;border-radius:14px;border:1.5px solid rgba(138,46,255,.55);background:rgba(20,10,45,.8);color:#fff;font:16px "Poppins",system-ui,sans-serif;color-scheme:dark}
.rpsheet textarea{min-height:80px;resize:vertical}
.rp2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.rp2 button{padding:14px;border-radius:16px;border:1.5px solid rgba(138,46,255,.55);background:rgba(20,10,45,.6);color:#fff;font:500 15px "Poppins",system-ui,sans-serif;cursor:pointer}
.rp2 .pk{background:linear-gradient(135deg,#FF2D8D,#8A2EFF);border:0}`;
  document.head.append(st);
  const toast = document.createElement("div"); toast.className = "nvt"; toast.setAttribute("role", "status"); document.body.append(toast);
  let tt; const say = t => { toast.textContent = t; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2600); };
  window.crushlyToast = say;
  if (!inChat) {
    const nav = document.createElement("nav"); nav.className = "bnav"; nav.setAttribute("aria-label", "Main");
    ITEMS.forEach(([i, label, href]) => {
      const on = href === page, e = document.createElement("a");
      e.href = href; if (!on) e.className = "nav"; if (on) { e.classList.add("on"); e.setAttribute("aria-current", "page"); }
      e.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[i]}</svg>${label}`; nav.append(e);
    });
    document.body.append(nav);
  }

  // ---- Report a user (used by the dashboard and chat) ----
  window.crushlyReport = (id, name) => {
    const bg = document.createElement("div"); bg.className = "rpbg";
    bg.innerHTML = `<div class="rpsheet"><b style="font-size:18px">Report ${esc(name)}</b>
      <select id="rp-r" aria-label="Reason"><option>Fake profile</option><option>Inappropriate photos</option><option>Harassment or abuse</option><option>Spam or scam</option><option>Underage user</option><option>Other</option></select>
      <textarea id="rp-d" maxlength="300" placeholder="Details (optional)"></textarea>
      <div class="rp2"><button type="button" id="rp-x">Cancel</button><button type="button" class="pk" id="rp-s">Send report</button></div></div>`;
    document.body.append(bg);
    const close = () => bg.remove();
    bg.addEventListener("click", e => { if (e.target === bg) close(); });
    bg.querySelector("#rp-x").onclick = close;
    bg.querySelector("#rp-s").onclick = async () => {
      const b = bg.querySelector("#rp-s"); b.disabled = true;
      const { data: { session } } = await db.auth.getSession();
      const { error } = await db.from("reports").insert({ reporter: session.user.id, reported: id, reason: bg.querySelector("#rp-r").value, details: bg.querySelector("#rp-d").value.trim() || null });
      close(); say(error ? (/details|relation|schema/i.test(error.message) ? "Run the admin SQL in Supabase first" : error.message) : "Report sent. Thank you \u2665");
    };
  };
  // ---- Block a user ----
  window.crushlyBlock = async (id, name, done) => {
    if (!confirm("Block " + name + "? You will no longer see each other, and your chat with them will be deleted.")) return;
    const { error } = await db.rpc("block_user", { target: id });
    if (error) return say(/function|schema/i.test(error.message) ? "Run the admin SQL in Supabase first" : error.message);
    say("User blocked"); if (done) done();
  };

  (async () => {
    if (typeof db === "undefined") return;
    const { data: { session } } = await db.auth.getSession(); if (!session) return;
    const me = session.user.id;
    // suspended accounts are signed out
    const { data: pr } = await db.from("profiles").select("is_banned").eq("id", me).maybeSingle();
    if (pr && pr.is_banned) { await db.auth.signOut(); alert("Your account has been suspended."); location.href = "index.html"; return; }
    // in-app notifications for every date action (shown while the app is open)
    db.channel("dates-notify").on("postgres_changes", { event: "*", schema: "public", table: "dates" }, pl => {
      if (localStorage.getItem("crushly_dnd") === "1" || localStorage.getItem("crushly_alert_dates") === "0") return;
      const n = pl.new, o = pl.old || {};
      if (pl.eventType === "INSERT" && n.receiver === me) say("\uD83D\uDC8C New date request received");
      else if (pl.eventType === "UPDATE" && n.status !== o.status) {
        if (n.status === "confirmed" && n.sender === me) say("\uD83C\uDF89 Your date was confirmed!");
        else if (n.status === "rejected" && n.sender === me) say("Date request rejected");
        else if (n.status === "cancelled" && !(window.__quiet && Date.now() - window.__quiet < 4000)) say("A date was cancelled");
      }
    }).subscribe();
  })();
})();
