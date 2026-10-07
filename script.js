const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const form = document.getElementById("applicationForm");
const status = document.getElementById("formStatus");
const packageSelect = document.getElementById("package");
const WHATSAPP_NUMBER = "2349041004544";

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".package-link").forEach(link => {
  link.addEventListener("click", () => {
    const selected = link.dataset.package;
    if (selected && packageSelect) packageSelect.value = selected;
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const pkg = String(data.get("package") || "").trim();
  const classType = String(data.get("classType") || "").trim();
  const experience = String(data.get("experience") || "").trim();
  const schedule = String(data.get("schedule") || "").trim();
  const goal = String(data.get("goal") || "").trim();
  const termsAccepted = data.get("termsAccepted") === "on";
  const message = String(data.get("message") || "").trim();

  if (!termsAccepted) {
    status.textContent = "Please accept the Terms & Conditions before submitting.";
    status.classList.add("show");
    return;
  }

  const text = [
    "Hello Olympus Forex Trading Academy,",
    "",
    "I would like to apply for training.",
    "",
    `Name: ${name}`,
    `WhatsApp number: ${phone}`,
    `Course / Package: ${pkg}`,
    `Class type: ${classType}`,
    `Experience level: ${experience}`,
    `Preferred schedule: ${schedule}`,
    `Training goal: ${goal}`,
    message ? `Additional note: ${message}` : "",
    "Terms & Conditions: Accepted",
    "",
    "Please let me know the next steps."
  ].filter(Boolean).join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  status.textContent = "Opening WhatsApp with your completed application…";
  status.classList.add("show");
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("year").textContent = new Date().getFullYear();
