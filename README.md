# Fursa Khadra AI Assistant / المساعد الذكي لمنصة فرص خضراء

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

## Setup

Requirements: Node.js 18+, Hugging Face account with a [read token](https://huggingface.co/settings/tokens)

```bash
git clone <repo-url>
cd fursa-chatbot
npm install
cp .env.example .env
# add your HF_TOKEN to .env
npm start
```
