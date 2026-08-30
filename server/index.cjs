// =====================================================
// SIRC RESEARCH COPILOT
// MAIN SERVER
// GROQ → GEMINI FALLBACK
// PDF RESEARCH ANALYSIS
// CALIBRE INTEGRATION
// USER AUTHENTICATION
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
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

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
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: false
  })
);

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

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
// AUTH DATABASE
// =====================================================

const authDatabasePath =
  path.join(__dirname, "auth.db");

const authDB =
  new sqlite3.Database(
    authDatabasePath,
    (error) => {

      if (error) {

        console.error(
          "AUTH DATABASE CONNECTION ERROR:",
          error.message
        );

      } else {

        console.log(
          "AUTH DATABASE CONNECTED:",
          authDatabasePath
        );

      }

    }
  );

// =====================================================
// CREATE USERS TABLE
// =====================================================

authDB.serialize(() => {

  authDB.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
    `,
    (error) => {

      if (error) {

        console.error(
          "USERS TABLE ERROR:",
          error.message
        );

      } else {

        console.log(
          "USERS TABLE READY"
        );

      }

    }
  );

});

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory =
  path.join(__dirname, "uploads");

if (
  !fs.existsSync(
    uploadDirectory
  )
) {

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

const upload =
  multer({

    dest:
      uploadDirectory,

    limits: {

      fileSize:
        20 * 1024 * 1024

    }

  });

// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get(
  "/",
  (req, res) => {

    return res.json({

      status:
        "online",

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

  }
);

// =====================================================
// SERVER HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {

    return res.json({

      status:
        "ok",

      message:
        "SIRC Research Copilot backend is healthy.",

      timestamp:
        new Date().toISOString()

    });

  }
);

// =====================================================
// AUTH HEALTH CHECK
// =====================================================

app.get(
  "/api/auth/health",
  (req, res) => {

    return res.json({

      success:
        true,

      message:
        "Authentication service is working."

    });

  }
);

// =====================================================
// SIGNUP
// =====================================================

app.post(
  "/api/signup",
  async (req, res) => {

    try {

      const username =
        typeof req.body.username === "string"
          ? req.body.username.trim()
          : "";

      const password =
        typeof req.body.password === "string"
          ? req.body.password
          : "";

      // -------------------------------------------------
      // VALIDATION
      // -------------------------------------------------

      if (!username) {

        return res.status(400).json({

          success:
            false,

          error:
            "Username is required."

        });

      }

      if (username.length < 3) {

        return res.status(400).json({

          success:
            false,

          error:
            "Username must be at least 3 characters."

        });

      }

      if (username.length > 50) {

        return res.status(400).json({

          success:
            false,

          error:
            "Username must not exceed 50 characters."

        });

      }

      if (!password) {

        return res.status(400).json({

          success:
            false,

          error:
            "Password is required."

        });

      }

      if (password.length < 6) {

        return res.status(400).json({

          success:
            false,

          error:
            "Password must be at least 6 characters."

        });

      }

      // -------------------------------------------------
      // CHECK EXISTING USER
      // -------------------------------------------------

      authDB.get(
        `
        SELECT id, username
        FROM users
        WHERE username = ?
        `,
        [username],
        async (findError, existingUser) => {

          if (findError) {

            console.error(
              "SIGNUP USER CHECK ERROR:",
              findError.message
            );

            return res.status(500).json({

              success:
                false,

              error:
                "Unable to check user account."

            });

          }

          if (existingUser) {

            return res.status(409).json({

              success:
                false,

              error:
                "Username already exists. Please choose another username."

            });

          }

          // -------------------------------------------------
          // HASH PASSWORD
          // -------------------------------------------------

          try {

            const hashedPassword =
              await bcrypt.hash(
                password,
                10
              );

            const createdAt =
              new Date().toISOString();

            // -------------------------------------------------
            // CREATE USER
            // -------------------------------------------------

            authDB.run(
              `
              INSERT INTO users
              (
                username,
                password,
                created_at
              )
              VALUES (?, ?, ?)
              `,
              [
                username,
                hashedPassword,
                createdAt
              ],
              function (insertError) {

                if (insertError) {

                  console.error(
                    "SIGNUP INSERT ERROR:",
                    insertError.message
                  );

                  return res.status(500).json({

                    success:
                      false,

                    error:
                      "Unable to create account."

                  });

                }

                console.log(
                  "NEW USER CREATED:",
                  username
                );

                return res.status(201).json({

                  success:
                    true,

                  message:
                    "Account created successfully.",

                  userId:
                    this.lastID,

                  username:
                    username

                });

              }
            );

          }

          catch (hashError) {

            console.error(
              "PASSWORD HASH ERROR:",
              hashError.message
            );

            return res.status(500).json({

              success:
                false,

              error:
                "Unable to secure account password."

            });

          }

        }
      );

    }

    catch (error) {

      console.error(
        "SIGNUP ERROR:",
        error
      );

      return res.status(500).json({

        success:
          false,

        error:
          "Signup service is currently unavailable."

      });

    }

  }
);

// =====================================================
// LOGIN
// =====================================================

app.post(
  "/api/login",
  async (req, res) => {

    try {

      const username =
        typeof req.body.username === "string"
          ? req.body.username.trim()
          : "";

      const password =
        typeof req.body.password === "string"
          ? req.body.password
          : "";

      // -------------------------------------------------
      // VALIDATION
      // -------------------------------------------------

      if (!username) {

        return res.status(400).json({

          success:
            false,

          error:
            "Username is required."

        });

      }

      if (!password) {

        return res.status(400).json({

          success:
            false,

          error:
            "Password is required."

        });

      }

      // -------------------------------------------------
      // FIND USER
      // -------------------------------------------------

      authDB.get(
        `
        SELECT
          id,
          username,
          password
        FROM users
        WHERE username = ?
        `,
        [username],
        async (error, user) => {

          if (error) {

            console.error(
              "LOGIN DATABASE ERROR:",
              error.message
            );

            return res.status(500).json({

              success:
                false,

              error:
                "Unable to access authentication database."

            });

          }

          // -------------------------------------------------
          // USER NOT FOUND
          // -------------------------------------------------

          if (!user) {

            return res.status(401).json({

              success:
                false,

              error:
                "Invalid username or password."

            });

          }

          // -------------------------------------------------
          // COMPARE PASSWORD
          // -------------------------------------------------

          try {

            const passwordMatches =
              await bcrypt.compare(
                password,
                user.password
              );

            if (!passwordMatches) {

              return res.status(401).json({

                success:
                  false,

                error:
                  "Invalid username or password."

              });

            }

            // -------------------------------------------------
            // LOGIN SUCCESS
            // -------------------------------------------------

            console.log(
              "USER LOGIN SUCCESS:",
              user.username
            );

            return res.json({

              success:
                true,

              message:
                "Login successful.",

              userId:
                user.id,

              username:
                user.username

            });

          }

          catch (compareError) {

            console.error(
              "PASSWORD CHECK ERROR:",
              compareError.message
            );

            return res.status(500).json({

              success:
                false,

              error:
                "Unable to verify password."

            });

          }

        }
      );

    }

    catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      return res.status(500).json({

        success:
          false,

        error:
          "Login service is currently unavailable."

      });

    }

  }
);

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
// =====================================================

app.get(
  "/api/research-recommendations",
  async (req, res) => {

    try {

      const topic =
        req.query.topic;

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

      const books =
        await searchCalibreBooks(
          cleanTopic
        );

      console.log(
        "CALIBRE RESOURCES FOUND:",
        books.length
      );

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
// =====================================================

app.post(
  "/api/chat",
  async (req, res) => {

    try {

      const {
        message
      } = req.body;

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

      const result =
        await askAI(
          message.trim()
        );

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

      if (
        !extractedText.trim()
      ) {

        return res.status(400).json({

          error:
            "Could not extract readable text from this PDF. The PDF may be scanned or image-based."

        });

      }

      const action =
        req.body.action ||
        "general";

      const question =
        req.body.question ||
        "";

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

      const cleanText =
        extractedText
          .replace(/\s+/g, " ")
          .trim();

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

      console.log(
        "ALL PDF CHUNKS PROCESSED"
      );

      const combinedAnalysis =
        chunkAnswers.join(
          "\n\n---\n\n"
        );

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

    finally {

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
// MUST BE LAST
// =====================================================

app.use(
  (req, res) => {

    return res.status(404).json({

      success:
        false,

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

    return res.status(500).json({

      success:
        false,

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
      `AUTH HEALTH: http://localhost:${PORT}/api/auth/health`
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