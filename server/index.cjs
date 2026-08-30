// =====================================================
// SIRC RESEARCH COPILOT
// MAIN SERVER
// GROQ → GEMINI FALLBACK
// PDF RESEARCH ANALYSIS
// CALIBRE INTEGRATION
// =====================================================
require("dotenv").config();
// =====================================================
// IMPORTS
// =====================================================
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const {
  askAI,
  callGroq,
  callGemini
} = require("./ai.cjs");
const {
  searchCalibreBooks,
  getAllCalibreBooks,
  DB_PATH
} = require("./calibre.cjs");
// =====================================================
// NEW: AUTH ROUTES (LOGIN / SIGNUP)
// =====================================================
const authRoutes = require("./auth.cjs");
// =====================================================
// EXPRESS APP
// =====================================================
const app = express();
// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors());
app.use(express.json());
// =====================================================
// STARTUP INFORMATION
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
console.log(
  "CALIBRE DATABASE:",
  DB_PATH
);
console.log("STEP 1: Server file started");
// =====================================================
// UPLOAD DIRECTORY
// =====================================================
const uploadDirectory =
  path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true
    }
  );
}
// =====================================================
// FILE UPLOAD
// =====================================================
const upload = multer({
  dest: uploadDirectory,
  limits: {
    fileSize:
      20 * 1024 * 1024
  }
});
// =====================================================
// AUTH ROUTES
// MOUNTS: POST /api/login, POST /api/signup
// MUST COME BEFORE THE 404 HANDLER
// =====================================================
app.use("/api", authRoutes);
// =====================================================
// HOME / HEALTH CHECK
// =====================================================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message:
      "SIRC Research Copilot AI Server is running.",
    service:
      "SIRC Research Copilot",
    ai: {
      groq:
        process.env.GROQ_API_KEY
          ? "configured"
          : "missing",
      gemini:
        process.env.GEMINI_API_KEY
          ? "configured"
          : "missing"
    }
  });
});
// =====================================================
// SERVER HEALTH CHECK
// =====================================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message:
      "SIRC Research Copilot backend is healthy.",
    timestamp:
      new Date().toISOString()
  });
});
// =====================================================
// CALIBRE DATABASE STATUS
// =====================================================
app.get(
  "/api/calibre/status",
  async (req, res) => {
    try {
      console.log(
        "CHECKING CALIBRE DATABASE..."
      );
      const books =
        await getAllCalibreBooks();
      console.log(
        `CALIBRE DATABASE CONNECTED - ${books.length} BOOKS`
      );
      return res.json({
        status:
          "connected",
        database:
          DB_PATH,
        totalBooks:
          books.length
      });
    }
    catch (error) {
      console.error(
        "CALIBRE STATUS ERROR:",
        error.message
      );
      return res.status(500).json({
        status:
          "error",
        message:
          "Unable to connect to Calibre database.",
        details:
          error.message
      });
    }
  }
);
// =====================================================
// SEARCH CALIBRE BOOKS
// =====================================================
app.get(
  "/api/calibre/search",
  async (req, res) => {
    try {
      const query =
        req.query.q;
      if (
        !query ||
        !query.trim()
      ) {
        return res.status(400).json({
          error:
            "Search query is required."
        });
      }
      console.log(
        "=========================================="
      );
      console.log(
        "CALIBRE SEARCH:"
      );
      console.log(
        query
      );
      console.log(
        "=========================================="
      );
      const results =
        await searchCalibreBooks(
          query.trim()
        );
      return res.json({
        query:
          query.trim(),
        count:
          results.length,
        results
      });
    }
    catch (error) {
      console.error(
        "CALIBRE SEARCH FAILED:",
        error.message
      );
      return res.status(500).json({
        error:
          "Calibre search failed.",
        details:
          error.message
      });
    }
  }
);
// =====================================================
// RESEARCH RESOURCE RECOMMENDATIONS
// CALIBRE → RESEARCH TOPIC
//
// IMPORTANT:
// THIS ROUTE MUST COME BEFORE THE 404 HANDLER.
// =====================================================
app.get(
  "/api/research-recommendations",
  async (req, res) => {
    try {
      const topic =
        req.query.topic;
      // -------------------------------------------------
      // CHECK TOPIC
      // -------------------------------------------------
      if (
        !topic ||
        !topic.trim()
      ) {
        return res.status(400).json({
          success:
            false,
          error:
            "Research topic is required."
        });
      }
      const cleanTopic =
        topic.trim();
      console.log(
        "=========================================="
      );
      console.log(
        "RESEARCH RESOURCE SEARCH:",
        cleanTopic
      );
      console.log(
        "=========================================="
      );
      // -------------------------------------------------
      // SEARCH CALIBRE
      // -------------------------------------------------
      const books =
        await searchCalibreBooks(
          cleanTopic
        );
      console.log(
        "CALIBRE RESOURCES FOUND:",
        books.length
      );
      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------
      return res.json({
        success:
          true,
        topic:
          cleanTopic,
        count:
          books.length,
        resources:
          books
      });
    }
    catch (error) {
      console.error(
        "RESEARCH RESOURCE ERROR:",
        error.message
      );
      return res.status(500).json({
        success:
          false,
        error:
          "Unable to find research resources.",
        details:
          error.message
      });
    }
  }
);
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
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          error:
            "Message is required."
        });
      }
      console.log(
        "=========================================="
      );
      console.log(
        "NEW AI QUESTION:"
      );
      console.log(
        message
      );
      console.log(
        "=========================================="
      );
      // =================================================
      // AI ROUTER
      // GROQ → GEMINI FALLBACK
      // =================================================
      const result =
        await askAI(
          message.trim()
        );
      // =================================================
      // LOG WHICH AI ANSWERED
      // =================================================
      console.log(
        "=========================================="
      );
      console.log(
        "AI RESPONSE SOURCE:",
        result.source
      );
      console.log(
        "=========================================="
      );
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
        error
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
// =====================================================
app.post(
  "/api/analyze-pdf",
  upload.single("file"),
  async (req, res) => {
    let filePath = null;
    let parser = null;
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
        "=========================================="
      );
      console.log(
        "PDF RECEIVED:",
        req.file.originalname
      );
      console.log(
        "=========================================="
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
      // CLEAN PDF TEXT
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
      const chunks = [];
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
      // PROCESS CHUNKS
      // =================================================
      const chunkAnswers = [];
      for (
        let i = 0;
        i < chunks.length;
        i++
      ) {
        console.log(
          `PROCESSING PDF CHUNK ${i + 1}/${chunks.length}`
        );
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
            `GROQ CHUNK ${i + 1} FAILED:`,
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
              `GEMINI CHUNK ${i + 1} FAILED:`,
              geminiError.message
            );
            throw new Error(
              `Both AI services failed while processing PDF chunk ${i + 1}.`
            );
          }
        }
      }
      // =================================================
      // COMBINE CHUNKS
      // =================================================
      console.log(
        "ALL PDF CHUNKS PROCESSED"
      );
      const combinedAnalysis =
        chunkAnswers.join(
          "\n\n---\n\n"
        );
      // =================================================
      // FINAL SYNTHESIS
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
      // FINAL GROQ
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
          "FINAL GROQ SYNTHESIS FAILED:",
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
            "FINAL GEMINI SYNTHESIS FAILED:",
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
    // =================================================
    // CLEANUP
    // =================================================
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
// 404 HANDLER
// IMPORTANT: THIS MUST BE LAST
// =====================================================
app.use(
  (req, res) => {
    res.status(404).json({
      error:
        "API endpoint not found.",
      path:
        req.originalUrl
    });
  }
);
// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
app.use(
  (error, req, res, next) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      error
    );
    res.status(500).json({
      error:
        "Internal server error.",
      details:
        error.message
    });
  }
);
// =====================================================
// START SERVER
// =====================================================
const PORT =
  process.env.PORT || 5000;
console.log(
  "STEP 2: About to start server"
);
app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "=========================================="
    );
    console.log(
      "SIRC AI SERVER RUNNING"
    );
    console.log(
      `PORT: ${PORT}`
    );
    console.log(
      `LOCAL: http://localhost:${PORT}`
    );
    console.log(
      `HEALTH: http://localhost:${PORT}/api/health`
    );
    console.log(
      `CALIBRE: http://localhost:${PORT}/api/calibre/status`
    );
    console.log(
      `RECOMMENDATIONS: http://localhost:${PORT}/api/research-recommendations?topic=anatomy`
    );
    console.log(
      "=========================================="
    );
  }
);
