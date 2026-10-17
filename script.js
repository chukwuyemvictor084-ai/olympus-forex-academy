/* Olympus Forex Trading Academy — application form, nav + package logic */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "2349041004544";

  // Canonical prices (single source of truth — must match cards + chatbot):
  // Online: $35 / $69 / $125 · Physical: $100 / $199 / $325
  var PACKAGES = {
    Online: [
      { value: "Starter", label: "Starter - $35/month" },
      { value: "Premium", label: "Premium - $69/month" },
      { value: "Elite", label: "Elite - $125/month" }
    ],
    Physical: [
      { value: "Physical Starter", label: "Starter - $100/month" },
      { value: "Physical Premium", label: "Premium - $199/month" },
      { value: "Physical Elite", label: "Elite - $325/month" }
    ]
  };

  // Paystack payment page per package (keys must match PACKAGES values).
  var PAYSTACK_LINKS = {
    "Starter": "https://paystack.shop/pay/Olympus-Online-starter",
    "Premium": "https://paystack.shop/pay/Olympus-Online-Premium",
    "Elite": "https://paystack.shop/pay/olympus-online-elite",
    "Physical Starter": "https://paystack.shop/pay/olympus-physical-starter",
    "Physical Premium": "https://paystack.shop/pay/Olympus-Physical-Premium",
    "Physical Elite": "https://paystack.shop/pay/olympus-physical-elite"
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Mobile nav (was missing on homepage)
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    var form = document.getElementById("applicationForm");
    var status = document.getElementById("formStatus");
    var classTypeField = document.getElementById("classType");
    var packageField = document.getElementById("package");

    function showStatus(message, isError) {
      if (status) {
        status.textContent = message;
        status.classList.add("show");
        status.style.color = isError ? "#b42318" : "#16803c";
      } else if (isError) {
        alert(message);
      }
    }

    function showStatusHTML(html) {
      if (!status) return;
      status.innerHTML = html;
      status.classList.add("show");
      status.style.color = "#f6f2e8";
      var copyBtn = status.querySelector("[data-copy]");
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          var text = copyBtn.getAttribute("data-copy") || "";
          function done() { copyBtn.textContent = "Copied ✓"; }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
          } else { fallbackCopy(text); done(); }
        });
      }
    }

    function fallbackCopy(text) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { /* ignore */ }
    }

    function updatePackages(preserve) {
      if (!classTypeField || !packageField) return;
      var selectedType = classTypeField.value;
      var prev = preserve ? packageField.value : "";
      packageField.innerHTML = "";
      if (!selectedType || !PACKAGES[selectedType]) {
        var ph = document.createElement("option");
        ph.value = "";
        ph.textContent = "Choose class type first";
        packageField.appendChild(ph);
        packageField.disabled = true;
        return;
      }
      packageField.disabled = false;
      var def = document.createElement("option");
      def.value = "";
      def.textContent = "Select a package";
      packageField.appendChild(def);
      PACKAGES[selectedType].forEach(function (item) {
        var option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        packageField.appendChild(option);
      });
      if (prev) {
        var stillThere = Array.from(packageField.options).some(function (o) { return o.value === prev; });
        if (stillThere) packageField.value = prev;
      }
    }

    if (classTypeField && packageField) {
      classTypeField.addEventListener("change", function () { updatePackages(false); });
      updatePackages(false);
    }

    // Package buttons: data-class + data-package (value-based, robust to label changes)
    document.querySelectorAll(".package-link").forEach(function (link) {
      link.addEventListener("click", function () {
        var wantClass = link.getAttribute("data-class");
        var wantValue = link.getAttribute("data-package");
        if (wantClass && classTypeField && PACKAGES[wantClass]) {
          classTypeField.value = wantClass;
          updatePackages(false);
        }
        if (wantValue && packageField) {
          var match = Array.from(packageField.options).find(function (item) {
            return item.value.trim() === wantValue.trim() ||
              item.text.trim() === wantValue.trim();
          });
          // Fallback: match by bare package name (Starter/Premium/Elite) in current list
          if (!match && /starter|premium|elite/i.test(wantValue)) {
            var bare = (wantValue.match(/starter|premium|elite/i) || [""])[0].toLowerCase();
            match = Array.from(packageField.options).find(function (item) {
              return item.value.toLowerCase().indexOf(bare) !== -1;
            });
          }
          if (match) packageField.value = match.value;
        }

        // If a Paystack payment page is configured for this package, send them to pay.
        var payUrl = PAYSTACK_LINKS[wantValue];
        if (payUrl) {
          window.open(payUrl, "_blank", "noopener");
          showStatus("Opening secure Paystack checkout — complete payment, then send your receipt on WhatsApp to activate your portal.", false);
          return;
        }

        // Otherwise: carry the selection into the application form and scroll to it.
        var applySection = document.getElementById("apply");
        if (applySection) applySection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    if (!form) {
      console.error("Application form not found: expected id=applicationForm");
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      try {
        var data = new FormData(form);
        var get = function (name) { return String(data.get(name) || "").trim(); };
        var name = get("name");
        var phone = get("phone");
        var packageName = get("package");
        var classType = get("classType");
        var experience = get("experience");
        var schedule = get("schedule");
        var goal = get("goal");
        var message = get("message");
        var terms = document.getElementById("termsAccepted");

        if (!name || !phone || !packageName || !classType || !experience || !schedule || !goal) {
          showStatus("Please complete all required fields.", true);
          return;
        }
        if (!terms || !terms.checked) {
          showStatus("Please accept the Terms & Conditions and Privacy Policy.", true);
          return;
        }

        var packageLabel = packageName;
        if (packageField) {
          var sel = Array.from(packageField.options).find(function (o) { return o.value === packageName; });
          if (sel) packageLabel = sel.text;
        }

        var whatsappMessage =
          "Hello Olympus Forex Trading Academy, I would like to apply for training.\n\n" +
          "Full name: " + name + "\n" +
          "Phone: " + phone + "\n" +
          "Package: " + packageLabel + "\n" +
          "Class type: " + classType + "\n" +
          "Experience: " + experience + "\n" +
          "Preferred schedule: " + schedule + "\n" +
          "Training goal: " + goal + "\n" +
          "Additional message: " + (message || "None");

        var whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(whatsappMessage);
        showStatus("Opening WhatsApp with your application details…", false);

        var opened = window.open(whatsappUrl, "_blank", "noopener");
        if (!opened) window.location.href = whatsappUrl;

        // Fallback: WhatsApp may not be installed — offer open link + copy
        setTimeout(function () {
          showStatusHTML(
            "If WhatsApp did not open, <a href=\"" + whatsappUrl + "\" target=\"_blank\" rel=\"noopener\" style=\"color:#f1cf73\">tap here to open it</a> " +
            "or copy your application:<br><button type=\"button\" data-copy=\"" +
            whatsappMessage.replace(/&/g, "&amp;").replace(/\"/g, "&quot;") +
            "\" style=\"margin-top:8px;padding:8px 12px;cursor:pointer\">Copy application text</button>"
          );
        }, 1200);
      } catch (error) {
        console.error("Application form error:", error);
        showStatus("Something went wrong. Refresh the page and try again.", true);
      }
    });
  });
})();
