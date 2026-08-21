// =====================================================
// SIRC RESEARCH COPILOT
// AI ROUTER
// GROQ → GEMINI FALLBACK
// PRODUCTION READY
// =====================================================

const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// =====================================================
// AI CLIENTS
// =====================================================

const groq = GROQ_API_KEY
  ? new Groq({
      apiKey: GROQ_API_KEY,
    })
  : null;

const gemini = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null;

// =====================================================
// STARTUP STATUS
// =====================================================

console.log("==========================================");
console.log("SIRC AI ROUTER");
console.log("==========================================");

console.log(
  "GROQ API KEY:",
  GROQ_API_KEY ? "LOADED" : "MISSING"
);

console.log(
  "GEMINI API KEY:",
  GEMINI_API_KEY ? "LOADED" : "MISSING"
);

console.log("==========================================");

// =====================================================
// COMMON SYSTEM PROMPT
// =====================================================

const SYSTEM_PROMPT = `
You are SIRC Research Copilot,
an academic research assistant.

Give natural, useful and well-structured answers
in clear academic language.

IMPORTANT RESPONSE FORMATTING:

- Always use clean Markdown formatting.
- Use headings when the answer has multiple sections.
- Use bullet points for lists.
- Use numbered lists for steps or sequences.
- Keep paragraphs short and readable.
- Use bold text only where it improves clarity.
- When presenting comparisons or structured information,
  use a proper Markdown table.
- NEVER put an entire Markdown table on one line.
- Every table row must be on a separate line.
- Always include a Markdown separator row after the table header.
- Do not use unnecessary tables when bullet points are clearer.
- Do not return raw Markdown syntax unnecessarily.

For research-related questions:

- Be accurate.
- Explain concepts clearly.
- Do not invent references.
- Do not invent statistics.
- Do not invent findings.
- Clearly indicate uncertainty when necessary.
- Distinguish facts from reasonable inference.
`;

// =====================================================
// TIMEOUT HELPER
// =====================================================

function withTimeout(promise, timeout = 60000) {
  return Promise.race([
    promise,

    new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `AI request timed out after ${timeout / 1000} seconds.`
          )
        );
      }, timeout);
    }),
  ]);
}

// =====================================================
// GROQ AI
// =====================================================

async function callGroq(message) {
  console.log("==========================================");
  console.log("CALLING GROQ AI");
  console.log("==========================================");

  if (!groq) {
    throw new Error(
      "GROQ_API_KEY is not configured on the server."
    );
  }

  if (!message || !message.trim()) {
    throw new Error("Message is required.");
  }

  try {
    const response = await withTimeout(
      groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },

          {
            role: "user",
            content: message.trim(),
          },
        ],

        temperature: 0.7,
        max_tokens: 1500,
      })
    );

    const answer =
      response?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error(
        "Groq returned an empty response."
      );
    }

    console.log("GROQ ANSWER CREATED");

    return answer;
  } catch (error) {
    console.error("GROQ ERROR:");
    console.error(error?.message || error);

    throw error;
  }
}

// =====================================================
// GEMINI AI
// =====================================================

async function callGemini(message) {
  console.log("==========================================");
  console.log("CALLING GEMINI AI");
  console.log("==========================================");

  if (!gemini) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server."
    );
  }

  if (!message || !message.trim()) {
    throw new Error("Message is required.");
  }

  try {
    const response = await withTimeout(
      gemini.models.generateContent({
        model: "gemini-2.5-flash",

        contents: [
          {
            role: "user",

            parts: [
              {
                text: `${SYSTEM_PROMPT}

User question:

${message.trim()}`,
              },
            ],
          },
        ],
      })
    );

    const answer =
      response?.text?.trim();

    if (!answer) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log("GEMINI ANSWER CREATED");

    return answer;
  } catch (error) {
    console.error("GEMINI ERROR:");
    console.error(error?.message || error);

    throw error;
  }
}

// =====================================================
// MAIN AI FUNCTION
// GROQ → GEMINI FALLBACK
// =====================================================

async function askAI(message) {
  if (!message || !message.trim()) {
    throw new Error("Message is required.");
  }

  const question = message.trim();

  let groqError = null;
  let geminiError = null;

  // ===================================================
  // GROQ FIRST
  // ===================================================

  if (groq) {
    try {
      const answer = await callGroq(question);

      return {
        answer,
        source: "groq",
      };
    } catch (error) {
      groqError = error;

      console.error(
        "GROQ FAILED — SWITCHING TO GEMINI"
      );
    }
  } else {
    groqError = new Error(
      "GROQ_API_KEY is missing."
    );

    console.error(
      "GROQ unavailable because GROQ_API_KEY is missing."
    );
  }

  // ===================================================
  // GEMINI FALLBACK
  // ===================================================

  if (gemini) {
    try {
      const answer = await callGemini(question);

      return {
        answer,
        source: "gemini",
      };
    } catch (error) {
      geminiError = error;

      console.error(
        "GEMINI FAILED."
      );
    }
  } else {
    geminiError = new Error(
      "GEMINI_API_KEY is missing."
    );

    console.error(
      "GEMINI unavailable because GEMINI_API_KEY is missing."
    );
  }

  // ===================================================
  // BOTH FAILED
  // ===================================================

  console.error("==========================================");
  console.error("ALL AI SERVICES FAILED");
  console.error("GROQ:", groqError?.message);
  console.error("GEMINI:", geminiError?.message);
  console.error("==========================================");

  throw new Error(
    `AI services unavailable. Groq: ${
      groqError?.message || "unavailable"
    } | Gemini: ${
      geminiError?.message || "unavailable"
    }`
  );
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  askAI,
  callGroq,
  callGemini,
};