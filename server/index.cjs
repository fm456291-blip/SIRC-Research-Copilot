// =====================================================
// SIRC RESEARCH COPILOT
// MAIN SERVER
// GROQ → GEMINI FALLBACK
// PDF RESEARCH ANALYSIS
// CALIBRE INTEGRATION
// USER AUTHENTICATION
// USER SEARCH HISTORY
// SECURE LOGIN SESSIONS
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
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
// CORS
// =====================================================

app.use(
  cors({
    origin: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept"
    ]
  })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb"
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
// PERSISTENT DATA DIRECTORY
// =====================================================

const persistentDataDirectory =
  fs.existsSync("/data")
    ? "/data"
    : path.join(__dirname, "data");


if (
  !fs.existsSync(
    persistentDataDirectory
  )
) {

  fs.mkdirSync(
    persistentDataDirectory,
    {
      recursive: true
    }
  );

}


// =====================================================
// AUTH DATABASE
// =====================================================

const AUTH_DB_PATH =
  path.join(
    persistentDataDirectory,
    "sirc_users.db"
  );


console.log(
  "AUTH DATABASE:",
  AUTH_DB_PATH
);


// =====================================================
// SQLITE CONNECTION
// =====================================================

const authDB =
  new sqlite3.Database(
    AUTH_DB_PATH,
    (error) => {

      if (error) {

        console.error(
          "AUTH DATABASE CONNECTION ERROR:",
          error.message
        );

      } else {

        console.log(
          "AUTH DATABASE CONNECTED"
        );

      }

    }
  );


// =====================================================
// FOREIGN KEYS
// =====================================================

authDB.run(
  "PRAGMA foreign_keys = ON"
);


// =====================================================
// CREATE DATABASE TABLES
// =====================================================

authDB.serialize(() => {


  // ===================================================
  // USERS
  // ===================================================

  authDB.run(`
    CREATE TABLE IF NOT EXISTS users (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      username TEXT NOT NULL UNIQUE COLLATE NOCASE,

      password_hash TEXT NOT NULL,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      last_login TEXT

    )
  `);


  // ===================================================
  // SESSIONS
  // ===================================================

  authDB.run(`
    CREATE TABLE IF NOT EXISTS sessions (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER NOT NULL,

      token_hash TEXT NOT NULL UNIQUE,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      last_used TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      expires_at TEXT NOT NULL,

      FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

    )
  `);


  // ===================================================
  // SEARCH HISTORY
  // ===================================================

  authDB.run(`
    CREATE TABLE IF NOT EXISTS search_history (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER NOT NULL,

      query TEXT NOT NULL,

      response TEXT NOT NULL,

      type TEXT NOT NULL DEFAULT 'chat',

      source TEXT,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

    )
  `);


  // ===================================================
  // USERNAME INDEX
  // ===================================================

  authDB.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    idx_users_username
    ON users(username COLLATE NOCASE)
  `);


  // ===================================================
  // SESSION TOKEN INDEX
  // ===================================================

  authDB.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    idx_sessions_token
    ON sessions(token_hash)
  `);


  // ===================================================
  // HISTORY USER INDEX
  // ===================================================

  authDB.run(`
    CREATE INDEX IF NOT EXISTS
    idx_history_user
    ON search_history(user_id, created_at DESC)
  `);


  console.log(
    "DATABASE TABLES READY"
  );

});


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory =
  path.join(
    __dirname,
    "uploads"
  );


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
// SESSION HELPERS
// =====================================================

function createSessionToken() {

  return crypto.randomBytes(32).toString("hex");

}


function hashToken(token) {

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

}


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

function requireAuth(req, res, next) {

  try {

    const authHeader =
      req.headers.authorization || "";


    if (
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({

        success:
          false,

        error:
          "Authentication required."

      });

    }


    const token =
      authHeader
        .substring(7)
        .trim();


    if (!token) {

      return res.status(401).json({

        success:
          false,

        error:
          "Authentication token is missing."

      });

    }


    const tokenHash =
      hashToken(token);


    authDB.get(
      `
      SELECT

        sessions.user_id,

        users.username,

        sessions.expires_at

      FROM sessions

      INNER JOIN users
        ON users.id = sessions.user_id

      WHERE sessions.token_hash = ?

      `,
      [tokenHash],
      (error, session) => {

        if (error) {

          console.error(
            "SESSION CHECK ERROR:",
            error.message
          );

          return res.status(500).json({

            success:
              false,

            error:
              "Authentication database error."

          });

        }


        if (!session) {

          return res.status(401).json({

            success:
              false,

            error:
              "Invalid authentication session."

          });

        }


        const expiry =
          new Date(
            session.expires_at
          ).getTime();


        if (
          Date.now() >= expiry
        ) {

          authDB.run(
            `
            DELETE FROM sessions
            WHERE token_hash = ?
            `,
            [tokenHash]
          );


          return res.status(401).json({

            success:
              false,

            error:
              "Your session has expired. Please login again."

          });

        }


        // Update last used time

        authDB.run(
          `
          UPDATE sessions
          SET last_used = CURRENT_TIMESTAMP
          WHERE token_hash = ?
          `,
          [tokenHash]
        );


        req.user = {

          id:
            session.user_id,

          username:
            session.username

        };


        next();

      }
    );

  }

  catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );


    return res.status(401).json({

      success:
        false,

      error:
        "Authentication failed."

    });

  }

}


// =====================================================
// SAVE SEARCH HISTORY
// =====================================================

function saveHistory(
  userId,
  query,
  response,
  type = "chat",
  source = null
) {

  return new Promise(
    (resolve, reject) => {

      authDB.run(
        `
        INSERT INTO search_history
        (
          user_id,
          query,
          response,
          type,
          source
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          userId,
          query,
          response,
          type,
          source
        ],
        function (error) {

          if (error) {

            console.error(
              "HISTORY SAVE ERROR:",
              error.message
            );

            reject(error);

            return;

          }


          console.log(
            "HISTORY SAVED:",
            {
              userId,
              historyId: this.lastID,
              type
            }
          );


          resolve(
            this.lastID
          );

        }
      );

    }
  );

}


// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get(
  "/",
  (req, res) => {

    res.json({

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

      },

      authentication:
        "enabled",

      history:
        "enabled"

    });

  }
);


// =====================================================
// SERVER HEALTH
// =====================================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      status:
        "ok",

      message:
        "SIRC Research Copilot backend is healthy.",

      authentication:
        "enabled",

      history:
        "enabled",

      timestamp:
        new Date().toISOString()

    });

  }
);


// =====================================================
// AUTH DATABASE HEALTH
// =====================================================

app.get(
  "/api/auth/status",
  (req, res) => {

    authDB.get(
      `
      SELECT COUNT(*) AS total
      FROM users
      `,
      [],
      (error, row) => {

        if (error) {

          console.error(
            "AUTH STATUS ERROR:",
            error.message
          );

          return res.status(500).json({

            success:
              false,

            error:
              "Authentication database is unavailable."

          });

        }


        return res.json({

          success:
            true,

          authentication:
            "ready",

          totalUsers:
            row.total

        });

      }
    );

  }
);


// =====================================================
// SIGN UP
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


      if (!/^[a-zA-Z0-9._-]+$/.test(username)) {

        return res.status(400).json({

          success:
            false,

          error:
            "Username can contain only letters, numbers, dot, underscore and hyphen."

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


      authDB.get(
        `
        SELECT id
        FROM users
        WHERE username = ?
        `,
        [username],
        async (checkError, existingUser) => {

          if (checkError) {

            console.error(
              "SIGNUP CHECK ERROR:",
              checkError.message
            );

            return res.status(500).json({

              success:
                false,

              error:
                "Unable to check username."

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


          const passwordHash =
            await bcrypt.hash(
              password,
              12
            );


          authDB.run(
            `
            INSERT INTO users
            (
              username,
              password_hash
            )
            VALUES
            (
              ?,
              ?
            )
            `,
            [
              username,
              passwordHash
            ],
            function (insertError) {

              if (insertError) {

                console.error(
                  "SIGNUP INSERT ERROR:",
                  insertError.message
                );


                if (
                  insertError.message.includes(
                    "UNIQUE"
                  )
                ) {

                  return res.status(409).json({

                    success:
                      false,

                    error:
                      "Username already exists."

                  });

                }


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
          "Unable to create account.",

        details:
          error.message

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


      if (!username || !password) {

        return res.status(400).json({

          success:
            false,

          error:
            "Username and password are required."

        });

      }


      console.log(
        "LOGIN ATTEMPT:",
        username
      );


      authDB.get(
        `
        SELECT
          id,
          username,
          password_hash
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
                "Authentication database error."

            });

          }


          if (!user) {

            return res.status(401).json({

              success:
                false,

              error:
                "Invalid username or password."

            });

          }


          const passwordCorrect =
            await bcrypt.compare(
              password,
              user.password_hash
            );


          if (!passwordCorrect) {

            return res.status(401).json({

              success:
                false,

              error:
                "Invalid username or password."

            });

          }


          // =================================================
          // CREATE SECURE SESSION
          // =================================================

          const sessionToken =
            createSessionToken();


          const tokenHash =
            hashToken(
              sessionToken
            );


          // Session valid for 30 days

          const expiresAt =
            new Date(
              Date.now() +
              30 * 24 * 60 * 60 * 1000
            ).toISOString();


          authDB.run(
            `
            INSERT INTO sessions
            (
              user_id,
              token_hash,
              expires_at
            )
            VALUES
            (
              ?,
              ?,
              ?
            )
            `,
            [
              user.id,
              tokenHash,
              expiresAt
            ],
            (sessionError) => {

              if (sessionError) {

                console.error(
                  "SESSION CREATION ERROR:",
                  sessionError.message
                );

                return res.status(500).json({

                  success:
                    false,

                  error:
                    "Unable to create login session."

                });

              }


              // =================================================
              // UPDATE LAST LOGIN
              // =================================================

              authDB.run(
                `
                UPDATE users
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
                `,
                [user.id]
              );


              console.log(
                "LOGIN SUCCESS:",
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
                  user.username,

                token:
                  sessionToken

              });

            }
          );

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
          "Unable to login.",

        details:
          error.message

      });

    }

  }
);


// =====================================================
// LOGOUT
// =====================================================

app.post(
  "/api/logout",
  requireAuth,
  (req, res) => {

    const authHeader =
      req.headers.authorization || "";

    const token =
      authHeader
        .substring(7)
        .trim();

    const tokenHash =
      hashToken(token);


    authDB.run(
      `
      DELETE FROM sessions
      WHERE token_hash = ?
      `,
      [tokenHash],
      (error) => {

        if (error) {

          return res.status(500).json({

            success:
              false,

            error:
              "Unable to logout."

          });

        }


        return res.json({

          success:
            true,

          message:
            "Logged out successfully."

        });

      }
    );

  }
);


// =====================================================
// CURRENT USER
// =====================================================

app.get(
  "/api/me",
  requireAuth,
  (req, res) => {

    return res.json({

      success:
        true,

      user: {

        id:
          req.user.id,

        username:
          req.user.username

      }

    });

  }
);


// =====================================================
// GET USER SEARCH HISTORY
// =====================================================

app.get(
  "/api/history",
  requireAuth,
  (req, res) => {

    const limit =
      Math.min(
        parseInt(req.query.limit) || 50,
        200
      );


    authDB.all(
      `
      SELECT

        id,

        query,

        response,

        type,

        source,

        created_at

      FROM search_history

      WHERE user_id = ?

      ORDER BY created_at DESC

      LIMIT ?

      `,
      [
        req.user.id,
        limit
      ],
      (error, rows) => {

        if (error) {

          console.error(
            "HISTORY FETCH ERROR:",
            error.message
          );

          return res.status(500).json({

            success:
              false,

            error:
              "Unable to load search history."

          });

        }


        return res.json({

          success:
            true,

          history:
            rows

        });

      }
    );

  }
);


// =====================================================
// GET ONE HISTORY ITEM
// =====================================================

app.get(
  "/api/history/:id",
  requireAuth,
  (req, res) => {

    const historyId =
      parseInt(req.params.id);


    if (
      !Number.isInteger(historyId)
    ) {

      return res.status(400).json({

        success:
          false,

        error:
          "Invalid history ID."

      });

    }


    authDB.get(
      `
      SELECT

        id,

        query,

        response,

        type,

        source,

        created_at

      FROM search_history

      WHERE id = ?

      AND user_id = ?

      `,
      [
        historyId,
        req.user.id
      ],
      (error, row) => {

        if (error) {

          return res.status(500).json({

            success:
              false,

            error:
              "Unable to load history item."

          });

        }


        if (!row) {

          return res.status(404).json({

            success:
              false,

            error:
              "History item not found."

          });

        }


        return res.json({

          success:
            true,

          history:
            row

        });

      }
    );

  }
);


// =====================================================
// DELETE ONE HISTORY ITEM
// =====================================================

app.delete(
  "/api/history/:id",
  requireAuth,
  (req, res) => {

    const historyId =
      parseInt(req.params.id);


    if (
      !Number.isInteger(historyId)
    ) {

      return res.status(400).json({

        success:
          false,

        error:
          "Invalid history ID."

      });

    }


    authDB.run(
      `
      DELETE FROM search_history

      WHERE id = ?

      AND user_id = ?

      `,
      [
        historyId,
        req.user.id
      ],
      function (error) {

        if (error) {

          return res.status(500).json({

            success:
              false,

            error:
              "Unable to delete history."

          });

        }


        if (
          this.changes === 0
        ) {

          return res.status(404).json({

            success:
              false,

            error:
              "History item not found."

          });

        }


        return res.json({

          success:
            true,

          message:
            "History item deleted."

        });

      }
    );

  }
);


// =====================================================
// DELETE ALL USER HISTORY
// =====================================================

app.delete(
  "/api/history",
  requireAuth,
  (req, res) => {

    authDB.run(
      `
      DELETE FROM search_history

      WHERE user_id = ?

      `,
      [req.user.id],
      function (error) {

        if (error) {

          return res.status(500).json({

            success:
              false,

            error:
              "Unable to clear search history."

          });

        }


        return res.json({

          success:
            true,

          message:
            "Search history cleared.",

          deleted:
            this.changes

        });

      }
    );

  }
);


// =====================================================
// CALIBRE DATABASE STATUS
// =====================================================

app.get(
  "/api/calibre/status",
  async (req, res) => {

    try {

      const books =
        await getAllCalibreBooks();


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


      const books =
        await searchCalibreBooks(
          cleanTopic
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
// GROQ FIRST → GEMINI FALLBACK
// =====================================================

app.post(
  "/api/chat",
  requireAuth,
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


      const cleanMessage =
        message.trim();


      console.log(
        "NEW AI QUESTION:",
        cleanMessage
      );


      const result =
        await askAI(
          cleanMessage
        );


      console.log(
        "AI RESPONSE SOURCE:",
        result.source
      );


      // =================================================
      // SAVE QUESTION + RESPONSE
      // =================================================

      try {

        await saveHistory(

          req.user.id,

          cleanMessage,

          result.answer,

          "chat",

          result.source

        );

      }

      catch (historyError) {

        // History failure should NOT
        // break the AI response.

        console.error(
          "WARNING: HISTORY WAS NOT SAVED:",
          historyError.message
        );

      }


      return res.json({

        answer:
          result.answer,

        source:
          result.source

      });

    }

    catch (error) {

      console.error(
        "AI FAILED:",
        error
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
  requireAuth,
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
        "PDF RECEIVED:",
        req.file.originalname
      );


      const fileBuffer =
        fs.readFileSync(
          filePath
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

          const chunkAnswer =
            await callGroq(
              chunkPrompt
            );


          chunkAnswers.push(
            chunkAnswer
          );

        }

        catch (groqError) {

          console.error(
            `GROQ CHUNK ${i + 1} FAILED:`,
            groqError.message
          );


          const geminiAnswer =
            await callGemini(
              chunkPrompt
            );


          chunkAnswers.push(
            geminiAnswer
          );

        }

      }


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


      let finalAnswer;
      let finalSource;


      try {

        finalAnswer =
          await callGroq(
            finalPrompt
          );

        finalSource =
          "groq";

      }

      catch (finalGroqError) {

        console.error(
          "FINAL GROQ SYNTHESIS FAILED:",
          finalGroqError.message
        );


        finalAnswer =
          await callGemini(
            finalPrompt
          );

        finalSource =
          "gemini";

      }


      // =================================================
      // SAVE PDF QUERY + ANSWER ONLY
      // =================================================

      const historyQuery =
        question.trim()
          ? question.trim()
          : `PDF Analysis: ${action}`;


      try {

        await saveHistory(

          req.user.id,

          historyQuery,

          finalAnswer,

          "pdf",

          finalSource

        );

      }

      catch (historyError) {

        console.error(
          "WARNING: PDF HISTORY WAS NOT SAVED:",
          historyError.message
        );

      }


      return res.json({

        answer:
          finalAnswer,

        filename:
          req.file.originalname,

        source:
          finalSource

      });

    }

    catch (error) {

      console.error(
        "PDF ANALYSIS ERROR:",
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

            console.log(
              "TEMPORARY PDF DELETED"
            );

          }

        }

        catch (cleanupError) {

          console.error(
            "FILE CLEANUP ERROR:",
            cleanupError.message
          );

        }

      }

    }

  }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {

    res.status(404).json({

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


    res.status(500).json({

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
      `AUTH STATUS: http://localhost:${PORT}/api/auth/status`
    );

    console.log(
      `HISTORY: http://localhost:${PORT}/api/history`
    );

    console.log(
      `CALIBRE: http://localhost:${PORT}/api/calibre/status`
    );

    console.log(
      "=========================================="
    );

  }
);