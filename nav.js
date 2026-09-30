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
.rp2 .pk{background:linear-gradient(135deg,#FF2D8D,#8A2EFF);border:0}
.ring{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:24px;text-align:center;color:#fff;font-family:"Poppins",system-ui,sans-serif;background:radial-gradient(60% 40% at 50% 0%,rgba(138,46,255,.45),rgba(7,4,15,.97) 70%);animation:rpin .4s both}
@keyframes rpin{from{opacity:0;transform:scale(.97)}}
.ring h2{margin:14px 0 2px;font-size:28px}.ring p{margin:0;color:#b9a6dd}.ring small{color:#b9a6dd}
.rav{width:170px;height:170px;margin:0 auto;border-radius:50%;padding:4px;background:linear-gradient(135deg,#FF2D8D,#8A2EFF);box-shadow:0 0 0 10px rgba(255,45,141,.15),0 0 50px rgba(255,45,141,.6);animation:rpul 1.6s ease-in-out infinite}
@keyframes rpul{50%{box-shadow:0 0 0 22px rgba(255,45,141,.06),0 0 70px rgba(255,45,141,.8)}}
.rav img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;border:3px solid #07040F}
.rk{margin-top:26px;font-weight:600;font-size:18px}
.rbs{display:flex;justify-content:center;gap:56px;margin-top:22px}
.rbs div{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:13px}
.rbs button{width:74px;height:74px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer}
.rbs .ok{background:linear-gradient(135deg,#FF2D8D,#8A2EFF);box-shadow:0 0 30px rgba(255,45,141,.8)}.rbs .no{background:#ff2d55;box-shadow:0 0 24px rgba(255,45,85,.6)}
.rbs svg{width:32px;height:32px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.rbar{width:min(300px,80%);height:5px;margin:22px auto 8px;border-radius:9px;background:rgba(138,46,255,.3);overflow:hidden}
.rbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#FF2D8D,#8A2EFF);transition:width 15s linear}
.mcard{position:fixed;z-index:85;left:50%;top:14px;transform:translateX(-50%);width:min(440px,calc(100% - 24px));padding:14px 16px;border-radius:20px;background:rgba(20,10,45,.97);border:1.5px solid #FF4FB3;box-shadow:0 0 26px rgba(255,45,141,.45);color:#fff;font:14px "Poppins",system-ui,sans-serif;cursor:pointer;animation:rpdn .4s both}
@keyframes rpdn{from{transform:translate(-50%,-120%)}}
.mcard small{display:block;color:#b9a6dd}`;
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
    if (localStorage.getItem("crushly_keep") === "0" && sessionStorage.getItem("crushly_live") !== "1") { await db.auth.signOut(); location.href = "index.html"; return; }
    // suspended accounts are signed out
    const { data: pr } = await db.from("profiles").select("is_banned").eq("id", me).maybeSingle();
    if (pr && pr.is_banned) { await db.auth.signOut(); alert("Your account has been suspended."); location.href = "index.html"; return; }
    // messages sent to me count as "delivered" (double grey tick for the sender) as soon as my app is open
    const delivered = () => db.rpc("mark_delivered").then(() => {}, () => {});
    delivered();
    db.channel("msgs-delivered").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, pl => { if (pl.new.sender !== me) delivered(); }).subscribe();
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

    // ---- incoming calls (no ringtone) and missed-call banner ----
    const PHONE = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>', CAM = '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>', HANG = '<path d="M3 14c5-5 13-5 18 0l-2.4 3.2-3.6-1.7V12.8c-2-.7-4-.7-6 0v2.7L5.4 17.2z"/>';
    let ringEl = null, ringIv = null, ringId = null;
    const closeRing = () => { if (ringEl) ringEl.remove(); ringEl = null; clearInterval(ringIv); ringId = null; };
    const who = async id => (await db.from("profiles").select("display_name,birthdate,avatar_url").eq("id", id).maybeSingle()).data || { display_name: "Someone" };
    async function ring(c) {
      if (ringId) return; ringId = c.id; const p = await who(c.caller); if (ringId !== c.id) return;
      const video = c.kind === "video", age = p.birthdate ? (() => { const b = new Date(p.birthdate), t = new Date(); let a = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--; return a; })() : "";
      ringEl = document.createElement("div"); ringEl.className = "ring"; ringEl.setAttribute("role", "alertdialog");
      ringEl.innerHTML = `<div><small>Crushly</small><div class="rav"><img alt="" src="${esc(p.avatar_url || "")}"></div><h2>${esc(p.display_name)}</h2>${age ? `<p>Age ${age}</p>` : ""}
        <div class="rk">Incoming ${video ? "Video" : "Audio"} Call</div><small>Would you like to answer?</small>
        <div class="rbs"><div><button class="ok" type="button" aria-label="Accept"><svg viewBox="0 0 24 24">${video ? CAM : PHONE}</svg></button>Accept</div><div><button class="no" type="button" aria-label="Decline"><svg viewBox="0 0 24 24">${HANG}</svg></button>Decline</div></div>
        <div class="rbar"><i></i></div><small class="rcap">Call will end in 15s</small></div>`;
      document.body.append(ringEl);
      ringEl.querySelector(".ok").onclick = () => { location.href = "call.html?c=" + c.id; };
      ringEl.querySelector(".no").onclick = async () => { closeRing(); await db.rpc("set_call", { cid: c.id, act: "decline" }); };
      requestAnimationFrame(() => requestAnimationFrame(() => { const i = ringEl && ringEl.querySelector(".rbar i"); if (i) i.style.width = "0%"; }));
      let left = 15; ringIv = setInterval(() => { left--; const t = ringEl && ringEl.querySelector(".rcap"); if (t) t.textContent = "Call will end in " + left + "s"; if (left <= 0) closeRing(); }, 1000);
    }
    async function missed(c) {
      if (localStorage.getItem("crushly_dnd") === "1") return; const p = await who(c.caller), d = document.createElement("div"); d.className = "mcard";
      d.innerHTML = `<b>Crushly</b><small>now</small><div style="margin-top:6px;font-weight:600">Missed Call</div><small>${esc(p.display_name)} tried to call you (${c.kind === "video" ? "Video" : "Audio"})</small>`;
      d.onclick = () => { location.href = "chat.html?m=" + c.match_id; }; document.body.append(d); setTimeout(() => d.remove(), 7000);
    }
    db.channel("calls-in").on("postgres_changes", { event: "*", schema: "public", table: "calls", filter: "callee=eq." + me }, pl => {
      const c = pl.new, o = pl.old || {};
      if (pl.eventType === "INSERT" && c.status === "ringing" && Date.now() - new Date(c.created_at) < 30000) ring(c);
      else if (pl.eventType === "UPDATE") { if (ringId === c.id && c.status !== "ringing") closeRing(); if (c.status === "missed" && o.status === "ringing") missed(c); }
    }).subscribe();
  })();
})();
