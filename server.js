// server.js
// Fursa Khadra AI Assistant — backend
// Serves the frontend + a /api/chat endpoint that talks to a free
// Hugging Face LLM, grounded in our mock opportunities dataset.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { InferenceClient } = require("@huggingface/inference");
const opportunities = require("./data/opportunities.json");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = process.env.HF_MODEL || "HuggingFaceH4/zephyr-7b-beta";

if (!HF_TOKEN) {
  console.warn(
    "⚠️  No HF_TOKEN found in .env — the chatbot will not be able to call the AI model."
  );
}

const hf = new InferenceClient(HF_TOKEN);

/**
 * Very small "smart retrieval" step (RAG-lite).
 * Instead of sending the model ALL opportunities every time (wasteful and
 * eventually won't scale), we score each opportunity against the user's
 * question using simple keyword overlap on title/field/country/tags, and
 * only send the top matches. This is what keeps the bot's answers grounded
 * in real data instead of the model inventing opportunities.
 */
function findRelevantOpportunities(question, topN = 5) {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 1);

  const scored = opportunities.map((op) => {
    const haystack = [
      op.title,
      op.country,
      op.field,
      op.level,
      op.description,
      ...(op.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const w of words) {
      if (haystack.includes(w)) score += 1;
    }
    return { op, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // If nothing matched at all, fall back to returning a general sample
  // so the bot can still say "here's what we do have" instead of nothing.
  const matched = scored.filter((s) => s.score > 0);
  const pool = matched.length > 0 ? matched : scored;

  return pool.slice(0, topN).map((s) => s.op);
}

function buildSystemPrompt(relevantOpportunities) {
  const context = relevantOpportunities
    .map(
      (op, i) => `${i + 1}. ${op.title}
   - الدولة: ${op.country}
   - المجال: ${op.field}
   - المستوى: ${op.level}
   - آخر أجل للتقديم: ${op.deadline}
   - التمويل: ${op.funding}
   - الوصف: ${op.description}
   - رابط: ${op.link}`
    )
    .join("\n\n");

  return `أنت مساعد ذكي داخل منصة "فرص خضراء"، وهي منصة تنشر فرصاً ومنحاً دراسية وتدريبية للشباب.
مهمتك هي الإجابة على أسئلة المستخدمين بالاعتماد فقط على الفرص المذكورة أدناه.
- إذا وجدت فرصة مناسبة، اذكر اسمها، الدولة، آخر أجل للتقديم، والرابط.
- إذا لم تجد فرصة مناسبة ضمن القائمة، قل ذلك بصراحة واقترح على المستخدم تعديل بحثه، ولا تخترع فرصاً غير موجودة.
- أجب بإيجاز ووضوح، وبنفس لغة سؤال المستخدم (عربي أو إنجليزي).

الفرص المتاحة حالياً:
${context}`;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const relevant = findRelevantOpportunities(message, 5);
    const systemPrompt = buildSystemPrompt(relevant);

    const messages = [
      { role: "system", content: systemPrompt },
      // keep only the last few turns so the prompt stays small
      ...history.slice(-6),
      { role: "user", content: message },
    ];

    if (!HF_TOKEN) {
      return res.status(500).json({
        error:
          "Missing HF_TOKEN on the server. Add a free Hugging Face token to your .env file (see README).",
      });
    }

    const completion = await hf.chatCompletion({
      model: MODEL,
      provider: "auto", // let HF route to whichever Inference Provider actually hosts this model
      messages,
      max_tokens: 500,
      temperature: 0.4,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() ||
      "عذراً، لم أتمكن من توليد رد. حاول مجدداً.";

    res.json({
      reply,
      sources: relevant.map((op) => ({
        title: op.title,
        link: op.link,
        deadline: op.deadline,
      })),
    });
  } catch (err) {
    // Log the REAL underlying error server-side (the chat UI only ever
    // shows a generic Arabic message, so without this line you're
    // debugging blind). Check your terminal output when this fires.
    console.error("Chat error:", err?.message || err);
    if (err?.cause) console.error("Cause:", err.cause);

    res.status(500).json({
      error:
        "حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي. تأكد من صحة HF_TOKEN ومن أن النموذج متاح حالياً.",
      // surfaced only for local debugging — remove/hide before deploying publicly
      debug: err?.message || String(err),
    });
  }
});

// simple health check, handy for the live demo / grading
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model: MODEL, opportunities: opportunities.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌱 Fursa Khadra AI assistant running at http://localhost:${PORT}`);
});
