/* Olympus AI Assistant — context-aware, works offline + upgrades via Supabase AI backend */
(function () {
  "use strict";

  var KB = {
    brand: "Olympus Forex Trading Academy",
    whatsappDisplay: "09041004544",
    whatsappIntl: "2349041004544",
    telegram: "https://t.me/Olympus_FA",
    email: "Olympus4.2024@gmail.com",
    physical: [
      { name: "Starter", price: 100, desc: "Physical training, in-person foundations." },
      { name: "Premium", price: 199, desc: "Physical training, most popular, full technical analysis + practical chart work." },
      { name: "Elite", price: 325, desc: "Physical training, advanced concepts, strategy, psychology + personal trading plan." }
    ],
    online: [
      { name: "Starter", price: 35, desc: "Online: forex fundamentals, pairs, pips & lots, sessions, basic charts + risk." },
      { name: "Premium", price: 69, desc: "Online: everything in Starter + technical analysis, candlesticks, indicators & Fibonacci, trade setup." },
      { name: "Elite", price: 125, desc: "Online: everything in Premium + advanced concepts, strategy development, psychology + trading plan." }
    ],
    schedules: ["Weekday mornings", "Weekday afternoons", "Weekday evenings", "Weekend mornings", "Weekend afternoons", "Flexible"],
    courses: ["Forex Fundamentals", "Sessions & Liquidity", "Technical Analysis", "Risk Management", "Platforms & Tools (MT4/MT5)", "Advanced Trading"],
    guarantee: "No. Forex involves substantial risk. Olympus provides education, not guaranteed returns or financial advice."
  };

  var state = { lastTopic: null, lastPackage: null, lastClass: "Physical", history: [] };

  function norm(s) { return String(s || "").toLowerCase().trim(); }

  function detectPackage(text) {
    if (/elite/.test(text)) return "Elite";
    if (/premium/.test(text)) return "Premium";
    if (/starter/.test(text)) return "Starter";
    return null;
  }

  function detectClass(text) {
    if (/physical|in[\s-]?person|onsite|on[\s-]?site/.test(text)) return "Physical";
    if (/online|virtual|remote|zoom|whatsapp class/.test(text)) return "Online";
    return null;
  }

  function priceLine(list, per) {
    return list.map(function (p) { return p.name + " — $" + p.price + per; }).join("\n");
  }

  function packageDetail(pkg, cls) {
    var list = cls === "Online" ? KB.online : KB.physical;
    var found = null;
    for (var i = 0; i < list.length; i++) if (list[i].name === pkg) found = list[i];
    if (!found) return null;
    return found.name + " (" + cls + ") — $" + found.price + "/month\n" + found.desc +
      "\n\nTo apply: scroll to Apply, choose Class type = " + cls + ", Package = " + pkg + ", then submit — WhatsApp opens to " + KB.whatsappDisplay + ".";
  }

  function localReply(raw) {
    var text = norm(raw);
    var pkg = detectPackage(text);
    var cls = detectClass(text);
    if (cls) state.lastClass = cls;
    if (pkg) state.lastPackage = pkg;
    var useClass = cls || state.lastClass || "Physical";
    var usePkg = pkg || state.lastPackage || null;

    // Greeting
    if (/^(hi|hello|hey|good (morning|afternoon|evening)|yo)\b/.test(text) && text.length < 25) {
      state.lastTopic = "greeting";
      return "Hello! I'm the Olympus assistant. Ask me about prices, Starter vs Premium vs Elite, online vs physical, schedules, or how to apply — e.g. \"How much is Premium physical?\"";
    }

    // Follow-ups using context: "how much?", "what about elite?", "and online?"
    var isShortFollow = text.length < 30 && (/how much|price|cost|what about|and |compare|difference/.test(text));
    if (isShortFollow && (state.lastTopic === "price" || state.lastTopic === "package") && (usePkg || state.lastPackage)) {
      state.lastTopic = "price";
      if (/online|physical/.test(text) && !pkg) {
        return packageDetail(state.lastPackage, useClass);
      }
      if (usePkg) return packageDetail(usePkg, useClass);
    }

    // Prices
    if (/price|pricing|cost|how much|fee|charge|package.*\$|\$/.test(text)) {
      state.lastTopic = "price";
      if (usePkg) return packageDetail(usePkg, useClass);
      return "Here are the current prices:\n\nPHYSICAL (in-person):\n" + priceLine(KB.physical, "/month") +
        "\n\nONLINE:\n" + priceLine(KB.online, "/month") +
        "\n\nAll billed monthly. Which one — Starter, Premium or Elite? And Online or Physical?";
    }

    // Compare / which to choose
    if (/which|recommend|best|compare|difference|vs|versus|starter.*premium|premium.*elite/.test(text)) {
      state.lastTopic = "package";
      return "Quick guide:\n\n• Starter — foundations (pairs, pips, sessions, basic charts + risk). Best if you're brand new.\n• Premium — most popular. Adds technical analysis, candlesticks, indicators, trade setup + practical chart work.\n• Elite — advanced concepts, strategy development, psychology + personal trading plan.\n\nPhysical: $100 / $199 / $325 per month.\nOnline: $35 / $69 / $125 per month.\n\nTell me your level (beginner/intermediate) and I’ll point you to one — or say \"Premium physical details\".";
    }

    // Single package detail
    if (usePkg && (/detail|include|contain|cover|about|what.*(get|learn)|benefit/.test(text) || text === usePkg.toLowerCase())) {
      state.lastTopic = "package";
      return packageDetail(usePkg, useClass);
    }
    if (usePkg && state.lastTopic === "price") {
      state.lastTopic = "package";
      return packageDetail(usePkg, useClass);
    }

    // Online vs physical
    if (/online|physical|in person|difference.*class|class type/.test(text)) {
      state.lastTopic = "class";
      return "Two ways to learn:\n\n• Online — $35 / $69 / $125 per month. Select Class type = Online in the Apply form.\n• Physical — $100 / $199 / $325 per month. Select Class type = Physical.\n\nSame curriculum structure, physical is in-person. Final physical arrangements are confirmed with Olympus after you apply on WhatsApp (" + KB.whatsappDisplay + ").";
    }

    // Schedule
    if (/schedule|timetable|time|morning|afternoon|evening|weekend|weekday|when.*(class|start|hold)|duration|how long/.test(text)) {
      state.lastTopic = "schedule";
      return "You pick a preferred schedule in the Apply form:\n" + KB.schedules.join(", ") + ".\n\nOlympus then confirms the actual class timing with you on WhatsApp (" + KB.whatsappDisplay + "). Plans are monthly — pick a schedule and apply and they'll confirm the next start.";
    }

    // How to apply
    if (/apply|application|enroll|register|sign up|join|start|admission/.test(text)) {
      state.lastTopic = "apply";
      return "To apply (takes ~1 min):\n1. Scroll to \"Tell us how you want to learn\" (#apply)\n2. Fill name + WhatsApp number\n3. Choose Package (Starter/Premium/Elite) + Class type (Online/Physical)\n4. Pick experience, schedule + goal, accept Terms\n5. Submit — WhatsApp opens with your details addressed to " + KB.whatsappDisplay + ".\n\nNo payment is taken on the form — Olympus follows up. Want me to explain a package first?";
    }

    // WhatsApp / contact / human
    if (/whatsapp|contact|phone|number|human|agent|support|talk|call|email|telegram/.test(text)) {
      state.lastTopic = "contact";
      return "Reach Olympus directly:\n• WhatsApp: " + KB.whatsappDisplay + " (https://wa.me/" + KB.whatsappIntl + ")\n• Telegram: " + KB.telegram + "\n• Email: " + KB.email + "\n\nOr submit the Apply form and WhatsApp opens automatically with your details.";
    }

    // Curriculum
    if (/course|curriculum|learn|teach|syllabus|module|topic|mt4|mt5|technical|risk|fundamental|fibonacci|candlestick|strategy|psychology/.test(text)) {
      state.lastTopic = "course";
      return "The complete course covers:\n1. Forex Fundamentals\n2. Sessions & Liquidity\n3. Technical Analysis (candlesticks, support/resistance, MA/EMA, RSI/MACD, Fibonacci)\n4. Risk Management (risk-to-reward, position sizing, stop loss/take profit, discipline)\n5. Platforms & Tools (MT4/MT5, charts, indicators, economic calendar, journal)\n6. Advanced Trading (structure, psychology, performance review, trading plan).\n\nBeginner-friendly — starts from zero. Which area interests you most?";
    }

    // Beginners / experience
    if (/beginner|new|experience|never traded|no knowledge/.test(text)) {
      state.lastTopic = "course";
      return "Perfect for beginners — no previous forex experience needed. Start with Starter (Physical $100 or Online $35), learn fundamentals + risk first, then grow into Premium/Elite. Select \"Complete beginner\" in the Apply form.";
    }

    // Profit guarantee / risk
    if (/profit|guarantee|return|make money|rich|signal/.test(text)) {
      state.lastTopic = "risk";
      return KB.guarantee + " The focus is skill, process and risk management — not signals. Want the course outline?";
    }

    // Location / where
    if (/where|location|address|venue|lagos|abuja|nigeria/.test(text)) {
      state.lastTopic = "contact";
      return "Training is Online + Physical (Nigeria). Physical venue arrangements are confirmed with Olympus after you apply — message " + KB.whatsappDisplay + " on WhatsApp and they'll confirm availability and venue.";
    }

    // Thanks / bye
    if (/thank|thanks|ok|alright|bye/.test(text)) {
      return "You're welcome! If you want, say \"Premium physical details\" or \"how do I apply\" — I'm here. Good luck with your trading journey.";
    }

    // Fallback with context + suggestions
    var hint = "";
    if (state.lastPackage) hint = " (last: " + state.lastPackage + " " + (state.lastClass || "") + ")";
    return "I want to get you the right answer" + hint + ". I can help with:\n• Prices — \"How much is Elite physical?\"\n• Packages — \"Compare Starter vs Premium\"\n• Apply — \"How do I apply?\"\n• Schedules, online vs physical, courses, WhatsApp contact.\n\nTry one of those, or rephrase with a package name.";
  }

  function backendConfig() {
    try {
      if (typeof SUPABASE_URL !== "undefined" && typeof SUPABASE_PUBLISHABLE_KEY !== "undefined") {
        return { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY };
      }
    } catch (e) {}
    return null;
  }

  function tryBackend(userText, callback) {
    var cfg = backendConfig();
    if (!cfg) { callback(null); return; }
    try {
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 12000);
      var history = state.history.slice(-10).concat([{ role: "user", content: userText }]);
      fetch(cfg.url + "/functions/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": cfg.key, "Authorization": "Bearer " + cfg.key },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("backend " + res.status);
        return res.json();
      }).then(function (data) {
        if (data && data.reply) callback(String(data.reply));
        else callback(null);
      }).catch(function () { callback(null); });
    } catch (e) { callback(null); }
  }

  function init() {
    var fab = document.getElementById("olympus-chat-fab");
    var panel = document.getElementById("olympus-chat-panel");
    var bubble = document.getElementById("olympus-chat-bubble");
    var box = document.getElementById("olympus-chat-messages");
    var form = document.getElementById("olympus-chat-form");
    var input = document.getElementById("olympus-chat-text");
    if (!fab || !panel || !box || !form || !input) return;

    function showBubble() { if (bubble && !panel.classList.contains("open")) bubble.classList.add("show"); }
    function hideBubble() { if (bubble) bubble.classList.remove("show"); }
    setTimeout(showBubble, 1200);

    function addMsg(text, who) {
      var div = document.createElement("div");
      div.className = "olympus-msg " + who;
      // linkify bare URLs
      var safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
      safe = safe.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      // linkify #apply / #pricing
      safe = safe.replace(/#apply/g, '<a href="#apply">#apply</a>').replace(/#pricing/g, '<a href="#pricing">#pricing</a>');
      div.innerHTML = safe;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
      return div;
    }

    function greet() {
      if (box.children.length) return;
      addMsg("Hi, I'm the Olympus assistant. I know our packages, prices and how to apply.\n\nPhysical: $100 / $199 / $325 · Online: $35 / $69 / $125.\nAsk me anything — e.g. \"Compare Premium vs Elite\" or \"How do I apply?\"", "bot");
    }

    fab.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      fab.textContent = open ? "×" : "◈";
      if (open) { hideBubble(); greet(); setTimeout(function () { input.focus(); }, 50); }
      else { setTimeout(showBubble, 600); }
    });
    if (bubble) {
      bubble.addEventListener("click", function () {
        panel.classList.add("open"); fab.textContent = "×"; hideBubble();
        greet(); setTimeout(function () { input.focus(); }, 50);
      });
    }
    var closeBtn = document.getElementById("olympus-chat-close");
    if (closeBtn) closeBtn.addEventListener("click", function () {
      panel.classList.remove("open"); fab.textContent = "◈"; setTimeout(showBubble, 600);
    });

    document.querySelectorAll(".olympus-chips button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        input.value = btn.getAttribute("data-q") || btn.textContent;
        form.dispatchEvent(new Event("submit", { cancelable: true }));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = String(input.value || "").trim();
      if (!q) return;
      input.value = "";
      addMsg(q, "user");
      state.history.push({ role: "user", content: q });
      var typing = addMsg("Typing…", "bot");
      typing.classList.add("olympus-typing");
      tryBackend(q, function (aiReply) {
        var reply = aiReply || localReply(q);
        typing.remove();
        addMsg(reply, "bot");
        state.history.push({ role: "assistant", content: reply });
        if (state.history.length > 30) state.history = state.history.slice(-30);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
