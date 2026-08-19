// =====================================================
// SIRC RESEARCH COPILOT
// MAIN SERVER
// GROQ → GEMINI FALLBACK
// PDF RESEARCH ANALYSIS
// =====================================================


// =====================================================
// ENVIRONMENT VARIABLES
// IMPORTANT:
// .env is in the ROOT project folder
// =====================================================

require("dotenv").config();


// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const { PDFParse } = require("pdf-parse");

const {
  askAI,
  callGroq,
  callGemini
} = require("./ai.cjs");


// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

app.use(cors());

app.use(express.json());


// =====================================================
// STARTUP LOGS
// =====================================================

console.log("==========================================");
console.log("SIRC RESEARCH COPILOT");
console.log("==========================================");

console.log(
  "GROQ KEY:",
  process.env.GROQ_API_KEY ? "LOADED" : "MISSING"
);

console.log(
  "GEMINI KEY:",
  process.env.GEMINI_API_KEY ? "LOADED" : "MISSING"
);

console.log("STEP 1: Server file started");


// =====================================================
// FILE UPLOAD
// =====================================================

const upload = multer({

  dest: "server/uploads/",

  limits: {

    fileSize:
      20 * 1024 * 1024

  }

});


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {

  res.json({

    message:
      "SIRC Research Copilot AI Server is running."

  });

});


// =====================================================
// NORMAL AI CHAT
// GROQ FIRST → GEMINI FALLBACK
// =====================================================

app.post(
  "/api/chat",
  async (req, res) => {

    try {

      const {
        message
      } = req.body;


      // =================================================
      // CHECK MESSAGE
      // =================================================

      if (
        !message ||
        !message.trim()
      ) {

        return res.status(400).json({

          error:
            "Message is required."

        });

      }


      console.log(
        "USER MESSAGE:",
        message
      );


      // =================================================
      // AI ROUTER
      // GROQ → GEMINI
      // =================================================

      const result =
        await askAI(message);


      // =================================================
      // RESPONSE
      // =================================================

      return res.json({

        answer:
          result.answer,

        source:
          result.source

      });

    }

    catch (error) {

      console.error(
        "========== AI FAILED =========="
      );

      console.error(
        error.message
      );

      console.error(
        "==============================="
      );


      return res.status(500).json({

        error:
          "AI service is currently unavailable.",

        details:
          error.message

      });

    }

  }
);


// =====================================================
// PDF ANALYSIS
// SMART CHUNKING
// GROQ FIRST
// GEMINI FALLBACK
// =====================================================

app.post(

  "/api/analyze-pdf",

  upload.single("file"),

  async (req, res) => {


    let filePath =
      null;


    let parser =
      null;


    try {


      // =================================================
      // CHECK FILE
      // =================================================

      if (!req.file) {

        return res.status(400).json({

          error:
            "No PDF file was uploaded."

        });

      }


      filePath =
        req.file.path;


      console.log(
        `PDF received: ${req.file.originalname}`
      );


      // =================================================
      // READ PDF
      // =================================================

      const fileBuffer =
        fs.readFileSync(
          filePath
        );


      console.log(
        "Starting PDF text extraction..."
      );


      parser =
        new PDFParse({

          data:
            fileBuffer

        });


      const pdfData =
        await parser.getText();


      const extractedText =
        pdfData.text || "";


      console.log(
        `Extracted ${extractedText.length} characters.`
      );


      // =================================================
      // CHECK EXTRACTED TEXT
      // =================================================

      if (
        !extractedText.trim()
      ) {

        return res.status(400).json({

          error:
            "Could not extract readable text from this PDF. The PDF may be scanned or image-based."

        });

      }


      // =================================================
      // ACTION
      // =================================================

      const action =
        req.body.action ||
        "general";


      const question =
        req.body.question ||
        "";


      // =================================================
      // ACTION INSTRUCTIONS
      // =================================================

      const actionInstructions = {


        summarize: `

Summarize this research paper.

Include:

- Main purpose
- Research problem
- Methodology
- Key findings
- Conclusion
- Important implications

Keep it concise and academic.

`,


        gap: `

Analyze this research paper and identify possible research gaps.

Clearly separate:

1. Research gaps explicitly mentioned by the authors.
2. Research gaps reasonably inferred from the paper.

Never present an inference as an author-stated fact.

`,


        objectives: `

Identify the main research objectives.

Clearly distinguish:

- Objectives explicitly stated by the authors.
- Objectives reasonably inferred from the paper.

`,


        methodology: `

Explain the research methodology.

Identify, where available:

- Research design
- Research approach
- Population/sample
- Data collection
- Instruments
- Data analysis

`,


        findings: `

Identify and summarize the key findings of the research paper.

Focus ONLY on actual findings reported in the paper.

Do not invent results.

Use short headings and bullet points.

`,


        questions: `

Generate useful research questions for future research.

Base them on:

- The topic
- Findings
- Limitations
- Research gaps
- Areas suggested for future research

Make the questions academically meaningful.

`,


        general: `

Provide a concise academic overview of the research paper.

Include:

- Main purpose
- Research problem
- Methodology
- Key findings
- Conclusion
- Research implications

`

      };


      const instruction =
        actionInstructions[action] ||
        actionInstructions.general;


      // =================================================
      // SMART PDF CLEANING
      // =================================================

      const cleanText =
        extractedText
          .replace(/\s+/g, " ")
          .trim();


      // =================================================
      // SMART CHUNKING
      // =================================================

      const MAX_CHARS =
        24000;


      const chunks =
        [];


      for (
        let i = 0;
        i < cleanText.length;
        i += MAX_CHARS
      ) {

        chunks.push(

          cleanText.substring(
            i,
            i + MAX_CHARS
          )

        );

      }


      console.log(
        `PDF divided into ${chunks.length} chunks`
      );


      // =================================================
      // PROCESS EACH CHUNK
      // =================================================

      const chunkAnswers =
        [];


      for (
        let i = 0;
        i < chunks.length;
        i++
      ) {


        console.log(
          `PROCESSING PDF CHUNK ${i + 1}/${chunks.length}`
        );


        // =================================================
        // CHUNK PROMPT
        // =================================================

        const chunkPrompt = `

You are SIRC Research Copilot.

You are analyzing PART ${i + 1}
of a research paper.

Requested task:

${instruction}


IMPORTANT RULES:

1. Analyze ONLY the supplied text.
2. Do not invent information.
3. Do not invent findings.
4. Do not invent statistics.
5. Do not invent references.
6. If information is not present, do not assume it.
7. Focus on useful academic information.
8. Keep the response concise.
9. This is one part of a larger research paper.


RESEARCH PAPER PART ${i + 1}:

${chunks[i]}

`;


        // =================================================
        // GROQ FIRST
        // =================================================

        try {


          console.log(
            `CALLING GROQ FOR PDF CHUNK ${i + 1}`
          );


          const chunkAnswer =
            await callGroq(
              chunkPrompt
            );


          chunkAnswers.push(
            chunkAnswer
          );


          console.log(
            `GROQ CHUNK ${i + 1} COMPLETED`
          );

        }


        // =================================================
        // GEMINI FALLBACK
        // =================================================

        catch (groqError) {


          console.error(
            `GROQ CHUNK ${i + 1} FAILED:`
          );


          console.error(
            groqError.message
          );


          console.log(
            `SWITCHING CHUNK ${i + 1} TO GEMINI`
          );


          try {


            const geminiAnswer =
              await callGemini(
                chunkPrompt
              );


            chunkAnswers.push(
              geminiAnswer
            );


            console.log(
              `GEMINI CHUNK ${i + 1} COMPLETED`
            );

          }


          catch (geminiError) {


            console.error(
              `GEMINI CHUNK ${i + 1} FAILED:`
            );


            console.error(
              geminiError.message
            );


            throw new Error(
              `Both AI services failed while processing PDF chunk ${i + 1}.`
            );

          }

        }

      }


      // =================================================
      // ALL CHUNKS COMPLETED
      // =================================================

      console.log(
        "ALL PDF CHUNKS PROCESSED"
      );


      const combinedAnalysis =
        chunkAnswers.join(
          "\n\n---\n\n"
        );


      // =================================================
      // FINAL SYNTHESIS PROMPT
      // =================================================

      const finalPrompt = `

You are SIRC Research Copilot.

The following are analyses of different
parts of the SAME research paper.

Create ONE final coherent academic answer.


REQUESTED TASK:

${instruction}


IMPORTANT RULES:

1. Use ONLY information contained in the supplied analyses.
2. Do not invent information.
3. Do not invent findings.
4. Do not invent statistics.
5. Do not invent references.
6. Remove duplicate information.
7. Combine related points.
8. Keep the answer concise but useful.
9. Use clear academic headings and bullet points.
10. Clearly distinguish author-stated information from reasonable inference where relevant.


PART-WISE ANALYSIS:

${combinedAnalysis}


${
  question
    ? `

USER'S SPECIFIC QUESTION:

${question}

`
    : ""
}


Provide the final academic answer now.

`;


      // =================================================
      // FINAL GROQ SYNTHESIS
      // =================================================

      try {


        console.log(
          "CALLING GROQ FOR FINAL PDF SYNTHESIS"
        );


        const finalAnswer =
          await callGroq(
            finalPrompt
          );


        console.log(
          "GROQ FINAL PDF ANSWER CREATED"
        );


        return res.json({

          answer:
            finalAnswer,

          filename:
            req.file.originalname,

          source:
            "groq"

        });

      }


      // =================================================
      // FINAL GEMINI FALLBACK
      // =================================================

      catch (finalGroqError) {


        console.error(
          "FINAL GROQ SYNTHESIS FAILED:"
        );


        console.error(
          finalGroqError.message
        );


        console.log(
          "SWITCHING FINAL SYNTHESIS TO GEMINI"
        );


        try {


          const finalAnswer =
            await callGemini(
              finalPrompt
            );


          console.log(
            "GEMINI FINAL PDF ANSWER CREATED"
          );


          return res.json({

            answer:
              finalAnswer,

            filename:
              req.file.originalname,

            source:
              "gemini"

          });

        }


        catch (finalGeminiError) {


          console.error(
            "FINAL GEMINI SYNTHESIS FAILED:"
          );


          console.error(
            finalGeminiError.message
          );


          throw new Error(
            "Both AI services failed during final PDF synthesis."
          );

        }

      }

    }


    // ===================================================
    // PDF ERROR
    // ===================================================

    catch (error) {


      console.error(
        "PDF ANALYSIS ERROR:"
      );


      console.error(
        error
      );


      return res.status(500).json({

        error:
          "Unable to analyze the PDF.",

        details:
          error.message

      });

    }


    // ===================================================
    // CLEANUP
    // ===================================================

    finally {


      // =================================================
      // DESTROY PDF PARSER
      // =================================================

      if (parser) {

        try {

          await parser.destroy();

        }

        catch (error) {

          console.error(
            "Parser cleanup error:",
            error.message
          );

        }

      }


      // =================================================
      // DELETE TEMPORARY PDF
      // =================================================

      if (filePath) {

        try {


          if (
            fs.existsSync(
              filePath
            )
          ) {

            fs.unlinkSync(
              filePath
            );

          }

        }

        catch (cleanupError) {

          console.error(
            "File cleanup error:",
            cleanupError.message
          );

        }

      }

    }

  }

);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  5000;


console.log(
  "STEP 2: About to start server"
);


app.listen(

  PORT,

  () => {

    console.log(
      `SIRC AI server running on http://localhost:${PORT}`
    );

    console.log(
      "=========================================="
    );

  }

);