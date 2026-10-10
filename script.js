const toggle = document.querySelector(".menu-toggle"); const nav = document.querySelector(".nav"); const form = document.getElementById("applicationForm"); const status = document.getElementById("formStatus"); const packageSelect = document.getElementById("package"); const WHATSAPP_NUMBER = "2349041004544";
toggle?.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
document.querySelectorAll(".nav a").forEach((link) => { link.addEventListener("click", () => { nav?.classList.remove("open"); toggle?.setAttribute("aria-expanded", "false"); }); });
document.querySelectorAll(".package-link").forEach((link) => { link.addEventListener("click", () => { const selected = link.dataset.package; if (selected && packageSelect) { const option = Array.from(packageSelect.options).find( (item) => item.value === selected || item.text === selected ); if (option) packageSelect.value = option.value; } }); });
form?.addEventListener("submit", async (event) => { event.preventDefault();
const data = new FormData(form); const name = String(data.get("name")  "").trim(); const phone = String(data.get("phone")  "").trim(); const pkg = String(data.get("package")  "").trim(); const classType = String(data.get("classType")  "").trim(); const experience = String(data.get("experience")  "").trim(); const schedule = String(data.get("schedule")  "").trim(); const goal = String(data.get("goal")  "").trim(); const message = String(data.get("message")  "").trim(); const termsAccepted = data.get("termsAccepted") === "on";
if (!status) { alert("Please contact Olympus on WhatsApp to complete your application."); return; }
if (!termsAccepted) { status.textContent = "Please accept the Terms & Conditions."; status.classList.add("show"); return; }
if ( !window.supabase  typeof SUPABASE_URL === "undefined"  typeof SUPABASE_PUBLISHABLE_KEY === "undefined" ) { status.textContent = "Application service unavailable. Please contact Olympus on WhatsApp."; status.classList.add("show"); return; }
const whatsappText = [ "Hello Olympus Forex Trading Academy,", "", "I would like to apply for training.", "", Name: ${name}, WhatsApp number: ${phone}, Course / Package: ${pkg}, Class type: ${classType}, Experience level: ${experience}, Preferred schedule: ${schedule}, Training goal: ${goal}, message ? Additional note: ${message} : "", "Terms & Conditions: Accepted", "", "Please let me know the next steps." ].filter(Boolean).join("\n");
const whatsappUrl = https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}; const button = form.querySelector('button[type="submit"]');
if (button) button.disabled = true; status.textContent = "Saving your application…"; status.classList.add("show");
try { const client =!window.supabase.createClient( SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY );
const result = await client
  .from("student_applications")
  .insert({
    full_name: name,
    phone: phone,
    package: pkg,
    class_type: classType,
    experience: experience,
    schedule: schedule,
    goal: goal,
    message: message || null,
    terms_accepted: termsAccepted
  });

if (result.error) throw result.error;

status.textContent = "Application saved! Opening WhatsApp…";
form.reset();
window.location.href = whatsappUrl;
} catch (error) { console.error("Application save failed:", error); status.textContent = "Application could not be saved. Please try again or contact Olympus on WhatsApp."; status.classList.add("show"); } finally { if (button) button.disabled = false; } });
const year = document.getElementById("year"); if (year) year.textContent = new Date().getFullYear();
