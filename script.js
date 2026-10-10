<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Olympus Forex Academy — Application Form Script</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.5; margin: 0; background: #f4f5f7; color: #171717; }
    main { max-width: 960px; margin: 32px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 4px 22px #00000012; }
    h1 { font-size: 1.5rem; margin-top: 0; }
    p { color: #444; }
    .note { padding: 12px 14px; background: #fff7df; border-left: 4px solid #c89b25; border-radius: 4px; }
    button { border: 0; background: #161616; color: #fff; padding: 10px 14px; border-radius: 6px; cursor: pointer; margin: 8px 8px 8px 0; }
    button:hover { opacity: .88; }
    pre { white-space: pre; overflow: auto; padding: 16px; background: #111827; color: #e5e7eb; border-radius: 8px; font: 13px/1.5 Consolas, "Courier New", monospace; }
    .status { font-weight: bold; }
  </style>
</head>
<body>
<main>
  <h1>Olympus Forex Trading Academy — Corrected script.js</h1>
  <p>Open this HTML document in Microsoft Edge. Copy the JavaScript below into your GitHub <code>script.js</code> editor, replace the old contents, then commit the change.</p>
  <p class="note"><strong>Important:</strong> This is a code reference document, not the live website itself. Keep your Supabase publishable key in your existing <code>supabase-config.js</code>; never put a Supabase secret/service-role key in browser JavaScript.</p>
  <button id="copy">Copy JavaScript</button>
  <span id="status" class="status" aria-live="polite"></span>
  <pre><code id="source">/* Olympus Forex Trading Academy — application form */
(function () {
  "use strict";

  const WHATSAPP_NUMBER = "2349041004544";

  function setStatus(message, isError) {
    const status = document.getElementById("application-status");
    if (status) {
      status.textContent = message;
      status.style.color = isError ? "#b42318" : "#16803c";
    } else {
      alert(message);
    }
  }

  function getSupabaseClient() {
    if (window.supabaseClient) return window.supabaseClient;

    const config = window.SUPABASE_CONFIG || {};
    const url = config.url || window.SUPABASE_URL;
    const key = config.publishableKey || window.SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key || !window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase is not configured. Check supabase-config.js and the Supabase library.");
    }

    window.supabaseClient = window.supabase.createClient(url, key);
    return window.supabaseClient;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("application-form");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      try {
        const data = new FormData(form);
        const value = function (name) {
          return String(data.get(name) || "").trim();
        };

        const application = {
          full_name: value("name"),
          phone: value("phone"),
          package: value("package"),
          class_type: value("class_type"),
          experience: value("experience"),
          schedule: value("schedule"),
          goal: value("goal"),
          message: value("message"),
          terms_accepted: data.get("terms") === "on"
        };

        if (!application.full_name || !application.phone || !application.package) {
          throw new Error("Please complete your name, phone number, and training package.");
        }

        const client = getSupabaseClient();
        const result = await client
          .from("student_applications")
          .insert([application]);

        if (result.error) throw result.error;

        setStatus("Application submitted successfully. We will contact you soon.", false);

        const whatsappMessage =
          "Hello Olympus Forex Trading Academy, I have submitted an application.\n\n" +
          "Name: " + application.full_name + "\n" +
          "Phone: " + application.phone + "\n" +
          "Package: " + application.package + "\n" +
          "Class type: " + (application.class_type || "Not specified") + "\n" +
          "Experience: " + (application.experience || "Not specified") + "\n" +
          "Schedule: " + (application.schedule || "Not specified") + "\n" +
          "Goal: " + (application.goal || "Not specified");

        const whatsappUrl =
          "https://wa.me/" + WHATSAPP_NUMBER + "?text=" +
          encodeURIComponent(whatsappMessage);

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        form.reset();
      } catch (error) {
        console.error("Application submission failed:", error);
        setStatus(
          error && error.message
            ? "Submission failed: " + error.message
            : "Submission failed. Please try again or contact us on WhatsApp.",
          true
        );
      } finally {
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Application";
        }
      }
    });
  });
})();</code></pre>
  <p><strong>After pasting:</strong> click <em>Commit changes…</em>, use a message such as <code>Fix application form JavaScript</code>, and confirm the commit. Then test the application form on your live site.</p>
</main>
<script>
  document.getElementById("copy").addEventListener("click", async function () {
    const text = document.getElementById("source").textContent;
    const status = document.getElementById("status");
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied!";
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("source"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Select the highlighted code and copy it.";
    }
  });
</script>
</body>
</html>
