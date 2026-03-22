require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new Database('hallucinet.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input TEXT,
    score INTEGER,
    verdict TEXT,
    summary TEXT,
    full_report TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const SYSTEM_PROMPT = `
# ════════════════════════════════════════════════════════════════════
# HALLUCINET — AI HALLUCINATION DETECTION SYSTEM
# Master Structured Prompt (Base Model)
# ════════════════════════════════════════════════════════════════════

SYSTEM ROLE
You are HalluciNet, an expert AI output auditing system. Your sole purpose is to receive a user-provided input prompt and the corresponding outputs from four LLMs — GPT-4o (OpenAI), Gemini (Google), Claude (Anthropic), and Llama (Meta) — and perform a deep, structured hallucination detection and factual consistency analysis across all four outputs.

INPUT CONTRACT
[USER PROMPT], [GPT-4o OUTPUT], [GEMINI OUTPUT], [CLAUDE OUTPUT], [LLAMA OUTPUT].

TASK INSTRUCTIONS
Perform the following analysis pipeline in strict sequence:
STEP 1 — INPUT UNDERSTANDING
STEP 2 — PER-MODEL HALLUCINATION AUDIT
STEP 3 — CROSS-MODEL CONSISTENCY MATRIX
STEP 4 — HALLUCINATION PATTERN CLASSIFICATION
STEP 5 — AGGREGATE SCORING DASHBOARD
STEP 6 — RISK ADVISORY
STEP 7 — CORRECTED SYNTHESIS
`;

app.post('/api/analyze-comparison', async (req, res) => {
  const { apiKey, userPrompt, gpt4o, gemini, claude, llama } = req.body;
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

  if (!effectiveKey || effectiveKey === 'your_key_here') {
    return res.status(400).json({ error: "No Google Gemini API Key provided. Please enter a key from Google AI Studio in the settings panel." });
  }

  const fullInput = `
${SYSTEM_PROMPT}

[USER PROMPT]: ${userPrompt}
[GPT-4o OUTPUT]: ${gpt4o || 'MISSING'}
[GEMINI OUTPUT]: ${gemini || 'MISSING'}
[CLAUDE OUTPUT]: ${claude || 'MISSING'}
[LLAMA OUTPUT]: ${llama || 'MISSING'}
`;

  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`, {
      contents: [{
        parts: [{ text: fullInput }]
      }],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.1
      }
    });

    if (!response.data.candidates || !response.data.candidates[0]) {
        throw new Error("Invalid response from Gemini API");
    }

    const report = response.data.candidates[0].content.parts[0].text;
    const scoreMatch = report.match(/(\d+)\/10/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) * 10 : 50;

    const insertScan = db.prepare('INSERT INTO scans (input, score, verdict, summary, full_report) VALUES (?, ?, ?, ?, ?)');
    insertScan.run(userPrompt || 'Deep Audit', score, score > 70 ? 'CLEAN' : 'MODERATE', 'Comparison Analysis', report);

    res.json({ report, score });
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(500).json({ error: "Gemini Engine Error: " + errMsg });
  }
});

app.get('/api/history', (req, res) => {
  const scans = db.prepare('SELECT * FROM scans ORDER BY created_at DESC LIMIT 50').all();
  res.json(scans);
});

app.listen(PORT, () => {
  console.log(`HalluciNet running on http://localhost:${PORT} [Gemini BYOK Mode Enabled]`);
});
