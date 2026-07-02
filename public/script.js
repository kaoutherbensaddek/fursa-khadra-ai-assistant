const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

// keep a short rolling history so the model has conversational context
let history = [];

function addMessage(role, contentHtml) {
  const wrap = document.createElement("div");
  wrap.className = `msg msg--${role === "user" ? "user" : "bot"}`;
  const bubble = document.createElement("div");
  bubble.className = "msg__bubble";
  bubble.innerHTML = contentHtml;
  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderSources(sources) {
  if (!sources || sources.length === 0) return "";
  const items = sources
    .map(
      (s) =>
        `<div class="sources__item">🔗 <a href="${s.link}" target="_blank" rel="noopener">${escapeHtml(
          s.title
        )}</a> — آخر أجل: ${escapeHtml(s.deadline)}</div>`
    )
    .join("");
  return `<div class="sources">${items}</div>`;
}

async function sendMessage(message) {
  addMessage("user", escapeHtml(message));
  history.push({ role: "user", content: message });

  const typingBubble = addMessage(
    "bot",
    `<span class="typing"><span></span><span></span><span></span></span>`
  );

  sendBtn.disabled = true;
  statusEl.textContent = "● يفكّر...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(0, -1) }),
    });

    const data = await res.json();

    if (!res.ok) {
      typingBubble.innerHTML = `⚠️ ${escapeHtml(data.error || "حدث خطأ غير متوقع.")}`;
    } else {
      typingBubble.innerHTML = escapeHtml(data.reply) + renderSources(data.sources);
      history.push({ role: "assistant", content: data.reply });
    }
  } catch (err) {
    typingBubble.innerHTML = "⚠️ تعذّر الاتصال بالخادم. تأكد من أن الخادم يعمل.";
  } finally {
    sendBtn.disabled = false;
    statusEl.textContent = "● جاهز للمساعدة";
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = inputEl.value.trim();
  if (!message) return;
  inputEl.value = "";
  sendMessage(message);
});
