/* Olympus Forex Trading Academy — application form */
(function () {
  "use strict";

  const WHATSAPP_NUMBER = "2349041004544";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("applicationForm");
    if (!form) {
      console.error("Application form not found: expected id=applicationForm");
      return;
    }

    const status = document.getElementById("formStatus");

    function showStatus(message, isError) {
      if (status) {
        status.textContent = message;
        status.style.color = isError ? "#b42318" : "#16803c";
      } else {
        alert(message);
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      try {
        const data = new FormData(form);
        const get = function (name) {
          return String(data.get(name) || "").trim();
        };

        const name = get("name");
        const phone = get("phone");
        const packageName = get("package");
        const classType = get("classType");
        const experience = get("experience");
        const schedule = get("schedule");
        const goal = get("goal");
        const message = get("message");
        const terms = document.getElementById("termsAccepted");

        if (!name || !phone || !packageName || !classType ||
            !experience || !schedule || !goal) {
          showStatus("Please complete all required fields.", true);
          return;
        }

        if (!terms || !terms.checked) {
          showStatus("Please accept the Terms & Conditions and Privacy Policy.", true);
          return;
        }

        const whatsappMessage =
          "Hello Olympus Forex Trading Academy, I would like to apply for training.\n\n" +
          "Full name: " + name + "\n" +
          "Phone: " + phone + "\n" +
          "Package: " + packageName + "\n" +
          "Class type: " + classType + "\n" +
          "Experience: " + experience + "\n" +
          "Preferred schedule: " + schedule + "\n" +
          "Training goal: " + goal + "\n" +
          "Additional message: " + (message || "None");

        const whatsappUrl =
          "https://wa.me/" + WHATSAPP_NUMBER + "?text=" +
          encodeURIComponent(whatsappMessage);

        showStatus("Opening WhatsApp with your application details…", false);
        window.location.href = whatsappUrl;
      } catch (error) {
        console.error("Application form error:", error);
        showStatus("Something went wrong. Refresh the page and try again.", true);
      }
    });

    document.querySelectorAll(".package-link").forEach(function (link) {
      link.addEventListener("click", function () {
        const chosenPackage = link.getAttribute("data-package");
        const packageField = document.getElementById("package");
        if (chosenPackage && packageField) {
          const option = Array.from(packageField.options).find(function (item) {
            return item.text.trim() === chosenPackage.trim() ||
              item.value.trim() === chosenPackage.trim();
          });
          if (option) packageField.value = option.value;
        }
      });
    });

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  });
// Automatically update packages based on class type
  const classTypeField = document.getElementById("classType");
  const packageField = document.getElementById("package");

  if (classTypeField && packageField) {
    const packages = {
      Online: [
        { value: "Starter", label: "Starter - $35/month" },
        { value: "Premium", label: "Premium - $55/month" },
        { value: "Elite", label: "Elite - $125/month" }
      ],
      Physical: [
        { value: "Physical Starter", label: "Starter - $50/month" },
        { value: "Physical Premium", label: "Premium - $100/month" },
        { value: "Physical Elite", label: "Elite - $200/month" }
      ]
    };

    function updatePackages() {
      const selectedType = classTypeField.value;
      packageField.innerHTML = '<option value="">Select a package</option>';

      (packages[selectedType] || []).forEach(function (item) {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        packageField.appendChild(option);
      });
    }

    classTypeField.addEventListener("change", updatePackages);
    updatePackages();
  }
})();
