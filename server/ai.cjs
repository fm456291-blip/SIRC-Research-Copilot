// =====================================================
// SIRC RESEARCH COPILOT
// AI ROUTER
// GROQ → GEMINI FALLBACK
// =====================================================

const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");


// =====================================================
// GROQ
// =====================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// =====================================================
// GEMINI
// =====================================================

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// =====================================================
// CHECK API KEYS
// =====================================================

console.log(
  "AI ROUTER - GROQ:",
  process.env.GROQ_API_KEY ? "READY" : "MISSING"
);

console.log(
  "AI ROUTER - GEMINI:",
  process.env.GEMINI_API_KEY ? "READY" : "MISSING"
);


// =====================================================
// COMMON SYSTEM PROMPT
// =====================================================

const SYSTEM_PROMPT = `
You are SIRC Research Copilot,
an academic research assistant.

Give natural, useful and detailed answers
in clear academic language.

For research-related questions:

- Be accurate
- Explain concepts clearly
- Do not invent references
- Do not invent statistics
- Do not invent findings
- Clearly indicate uncertainty when necessary
`;


// =====================================================
// GROQ AI
// =====================================================

async function callGroq(message) {

  console.log("CALLING GROQ AI");

  const response =
    await groq.chat.completions.create({

      model: "openai/gpt-oss-20b",

      messages: [

        {
          role: "system",

          content: SYSTEM_PROMPT
        },

        {
          role: "user",

          content: message
        }

      ],

      temperature: 0.7,

      max_tokens: 1500

    });


  const answer =
    response.choices?.[0]?.message?.content;


  if (!answer) {

    throw new Error(
      "Groq returned an empty response."
    );

  }


  console.log("GROQ ANSWER CREATED");

  return answer;
}


// =====================================================
// GEMINI AI
// =====================================================

async function callGemini(message) {

  console.log("CALLING GEMINI AI");

  const response =
    await gemini.models.generateContent({

      model: "gemini-3.6-flash",

      contents: `

${SYSTEM_PROMPT}

User question:

${message}

`

    });


  const answer =
    response.text;


  if (!answer) {

    throw new Error(
      "Gemini returned an empty response."
    );

  }


  console.log("GEMINI ANSWER CREATED");

  return answer;
}


// =====================================================
// MAIN AI FUNCTION
// GROQ → GEMINI FALLBACK
// =====================================================

async function askAI(message) {

  if (!message || !message.trim()) {

    throw new Error(
      "Message is required."
    );

  }


  // ===================================================
  // GROQ FIRST
  // ===================================================

  try {

    const answer =
      await callGroq(message);


    return {

      answer: answer,

      source: "groq"

    };

  }

  catch (groqError) {

    console.error(
      "GROQ FAILED:",
      groqError.message
    );

    console.log(
      "SWITCHING TO GEMINI"
    );

  }


  // ===================================================
  // GEMINI FALLBACK
  // ===================================================

  try {

    const answer =
      await callGemini(message);


    return {

      answer: answer,

      source: "gemini"

    };

  }

  catch (geminiError) {

    console.error(
      "GEMINI FAILED:",
      geminiError.message
    );


    throw new Error(
      "SIRC AI services are currently unavailable."
    );

  }

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  askAI,

  callGroq,

  callGemini

};