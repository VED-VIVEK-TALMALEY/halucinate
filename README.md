# HalluciNet — AI Hallucination Detection System

HalluciNet is a deep, 7-step hallucination auditing system that compares outputs from four different LLMs (GPT-4o, Gemini, Claude, and Llama) to detect factual inconsistencies and potential hallucinations.

## Key Features
- **Deep 7-Step Audit:** Powered by Google's Gemini 1.5 Flash for high-quality semantic analysis.
- **Multi-Model Comparison:** Paste responses from four different LLMs to see where they conflict.
- **BYOK (Bring Your Own Key):** Users can enter their own free Gemini API key in the UI for private, cost-free auditing.
- **History Dashboard:** Tracks all previous audits in a local database.

## How to Run
1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Open `http://localhost:3000` in your browser.
5. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and paste it into the UI.

## Local Mode (No Key)
If no API key is provided, the system defaults to mock analysis mode for demonstration.

## License
MIT
