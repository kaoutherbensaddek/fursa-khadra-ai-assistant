# Fursa Khadra AI Assistant 🌱المساعد الذكي لمنصة فرص خضراء

AI chatbot that answers questions about scholarships, training programs, and hackathons on the Fursa Khadra platform. Users ask in natural language and get answers grounded in real data — no fake opportunities.

## How it works

1. **Retrieval**: keyword matching finds the top 5 relevant opportunities from `data/opportunities.json`
2. **Generation**: those opportunities get sent to Hugging Face Inference API (default: `zephyr-7b-beta`) as context
3. **Response**: the model answers based only on that context, with source links for verification

This is a lightweight RAG pipeline. Can be extended later with semantic embeddings.

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| AI | Hugging Face Inference API |
| Frontend | HTML / CSS / JS |
| Data | JSON mock data |


## Project structure

```

fursa-chatbot/
├── data/                  # for future database files
├── public/                # Frontend files (index.html, style.css, script.js)
├── .env                   # Hugging Face token (not committed)
├── .env.example           # Template for environment variables
├── opportunities.json     # Sample opportunities dataset
├── package.json
├── package-lock.json
├── server.js              # Express server + retrieval logic + AI calls
└── README.md
```


## Setup

Requirements: Node.js 18+, Hugging Face account with a [read token](https://huggingface.co/settings/tokens)

```bash
git clone https://github.com/kaoutherbensaddek/fursa-khadra-ai-assistant.git
cd fursa-chatbot
npm install
cp .env.example .env
# add your HF_TOKEN to .env
npm start
```

# التوثيق باللغة العربية

شات بوت يجيب على أسئلة المستخدمين حول الفرص والمنح المتاحة على منصة "فرص خضراء"، باستخدام نموذج لغوي (LLM) مجاني عبر Hugging Face، مدمج بواجهة ويب بسيطة وخلفية Node.js.

---

## الفكرة

بدل أن يتصفح المستخدم مئات الفرص يدوياً، يسأل المساعد بلغته الطبيعية (مثلاً: *"أريد منحة لدراسة الطاقة المتجددة في أوروبا"*) فيرد عليه بأقرب الفرص المطابقة مع تفاصيلها ورابط التقديم — دون أن يختلق (hallucinate) فرصاً غير موجودة.

## كيف يعمل النظام (AI Integration)

هذا ليس مجرد "استدعاء API"، بل خط أنابيب بسيط من نوع **RAG-lite**:

1. **قاعدة بيانات تجريبية** (`data/opportunities.json`): 10 فرص وهمية (منح، تدريبات، هاكاثونات) بحقول: العنوان، الدولة، المجال، آخر أجل، التمويل، الوصف، الوسوم.
2. **الاسترجاع الذكي (Retrieval)**: عند وصول سؤال، يقوم `findRelevantOpportunities()` في `server.js` بتسجيل نقاط تطابق (keyword scoring) بين كلمات السؤال وحقول كل فرصة، ويختار أفضل 5 نتائج فقط. هذا يمنع إرسال كل البيانات في كل مرة، ويُبقي إجابات النموذج **مرتكزة على بيانات حقيقية** بدل الاختلاق.
3. **توليد الرد (Generation)**: تُبنى رسالة `system prompt` تحتوي فقط على الفرص المُسترجَعة، وتُرسل مع سجل المحادثة إلى نموذج لغوي مستضاف على **Hugging Face Inference API** (افتراضياً `HuggingFaceH4/zephyr-7b-beta`، وهو نموذج مجاني ومفتوح المصدر).
4. **الرد للمستخدم**: يعرض الواجهة رد النموذج + قائمة "المصادر" (الفرص التي استُخدمت)، بروابطها وآخر أجل تقديم، ليتحقق المستخدم بنفسه.

هذا التصميم قابل للتوسّع لاحقاً: يمكن استبدال الاسترجاع بالكلمات المفتاحية بمقارنة تشابه دلالي (embeddings) لتحويله لبحث دلالي كامل (فكرة رقم 1 في المهمة) دون تغيير بنية المشروع.

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| Backend | Node.js + Express |
| AI / LLM | Hugging Face Inference API (`@huggingface/inference`) — نموذج `zephyr-7b-beta` (مجاني ومفتوح المصدر) |
| Frontend | HTML / CSS / JavaScript خالص (بدون إطار عمل) |
| البيانات | JSON تجريبي (Mock Data) |

##  هيكل المشروع

```
fursa-chatbot/
├── server.js              # الخادم + منطق الاسترجاع + استدعاء الـ AI
├── data/
│   └── opportunities.json # قاعدة بيانات الفرص التجريبية
├── public/
│   ├── index.html          # واجهة الشات
│   ├── style.css
│   └── script.js
├── package.json
├── .env.example
└── README.md
```

## كيفية التشغيل

### 1. المتطلبات
- Node.js نسخة 18 أو أحدث.
- حساب مجاني على [Hugging Face](https://huggingface.co/join) وتوكن وصول (Access Token) من [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (صلاحية Read كافية).

### 2. التثبيت
```bash
git clone https://github.com/kaoutherbensaddek/fursa-khadra-ai-assistant.git
cd fursa-chatbot
npm install
```

### 3. الإعداد
انسخ ملف البيئة وضع التوكن الخاص بك:
```bash
cp .env.example .env
```
ثم افتح `.env` وضع قيمة `HF_TOKEN`.

### 4. التشغيل
```bash
npm start
```
ثم افتح المتصفح على: **http://localhost:3000**

> ملاحظة: في المرة الأولى قد يستغرق النموذج بضع ثوانٍ "ليستيقظ" على خوادم Hugging Face المجانية (cold start) - هذا طبيعي.

## أمثلة أسئلة للتجربة

- "أريد منحة لدراسة الطاقة المتجددة في أوروبا"
- "ما هي الفرص المتاحة للطلاب في مصر؟"
- "هل يوجد تدريب مجاني عن بعد في الذكاء الاصطناعي؟"
- "أبحث عن هاكاثون في مجال البيئة"


---

**تم إنشاؤه كجزء من مهمة الالتحاق بفريق الذكاء الاصطناعي في منصة "فرص خضراء".**


https://github.com/user-attachments/assets/d9077fd8-922b-4c76-9e54-22e93dcbdaba

