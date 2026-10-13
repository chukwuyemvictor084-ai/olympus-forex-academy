// Supabase Edge Function: chat — upgrades Olympus assistant to real AI when a key is set.
// Deploy: supabase functions deploy chat --project-ref siutqbljrcacxqgxfsqu
// Secrets (pick one): supabase secrets set GEMINI_API_KEY=...  OR  OPENAI_API_KEY=...
// Frontend (chatbot.js) calls POST /functions/v1/chat { messages: [{role, content}] }
// and falls back to local answers if this function is missing or no key is set.

const SITE_CONTEXT = `You are the Olympus Forex Trading Academy assistant.
Brand: Olympus Forex Trading Academy — Learn, Practice, Trade, Grow. Beginner friendly, practical, risk-focused.
PHYSICAL prices: Starter $100/month, Premium $199/month, Elite $325/month.
ONLINE prices: Starter $35/month, Premium $69/month, Elite $125/month. Monthly billing.
Courses: Forex Fundamentals; Sessions & Liquidity; Technical Analysis; Risk Management; Platforms & Tools (MT4/MT5); Advanced Trading.
Apply: fill the #apply form (name, WhatsApp number, package, class type Online/Physical, experience, schedule, goal, accept Terms) then Submit opens WhatsApp to 09041004544 (+2349041004544). No payment on the form.
Schedules: Weekday mornings/afternoons/evenings, Weekend mornings/afternoons, Flexible — confirmed on WhatsApp after applying.
Contact: WhatsApp 09041004544 https://wa.me/2349041004544, Telegram https://t.me/Olympus_FA, Email Olympus4.2024@gmail.com.
Risk: no profit guarantees; education only, not financial advice. Keep answers short, friendly, Nigerian-English neutral. Always ground prices in the numbers above. If asked for venue, say physical venue is confirmed on WhatsApp after applying.`;

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

async function callGemini(key: string, messages: Array<{ role: string; content: string }>) {
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(key),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_instruction: { parts: [{ text: SITE_CONTEXT }] }, contents }),
    },
  );
  if (!res.ok) throw new Error("Gemini " + res.status + ": " + (await res.text()).slice(0, 300));
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  return text.trim();
}

async function callOpenAI(key: string, model: string, messages: Array<{ role: string; content: string }>) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [{ role: "system", content: SITE_CONTEXT }, ...messages],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error("OpenAI " + res.status + ": " + (await res.text()).slice(0, 300));
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST { messages } expected" }), { status: 405, headers: cors() });
  }
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    if (!messages.length) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: cors() });
    }
    const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";
    const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
    let reply = "";
    if (geminiKey) reply = await callGemini(geminiKey, messages);
    else if (openaiKey) reply = await callOpenAI(openaiKey, Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini", messages);
    else {
      return new Response(
        JSON.stringify({ error: "no AI key configured", hint: "Set GEMINI_API_KEY or OPENAI_API_KEY via supabase secrets set" }),
        { status: 501, headers: cors() },
      );
    }
    if (!reply) throw new Error("empty AI reply");
    return new Response(JSON.stringify({ reply }), { headers: cors() });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), { status: 500, headers: cors() });
  }
});
