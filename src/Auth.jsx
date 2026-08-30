// =====================================================
// SIRC RESEARCH COPILOT
// AUTH ROUTES (SIGNUP / LOGIN)
// LOCAL JSON FILE STORAGE (users.json)
// =====================================================
const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// =====================================================
// USERS FILE PATH (LOCAL STORAGE)
// server/users.json ke andar save hoga
// =====================================================
const USERS_FILE = path.join(__dirname, "users.json");

// =====================================================
// LOAD USERS FROM FILE
// =====================================================
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, "[]", "utf-8");
    }
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (error) {
    console.error("USERS FILE READ ERROR:", error.message);
    return [];
  }
}

// =====================================================
// SAVE USERS TO FILE
// =====================================================
function saveUsers(users) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(users, null, 2),
    "utf-8"
  );
}

// =====================================================
// SIGNUP
// POST /api/signup
// =====================================================
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      !username ||
      !username.trim() ||
      !password ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Username aur kam az kam 6 character ka password required hai.",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = loadUsers();

    const existingUser = users.find(
      (u) => u.username === cleanUsername
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Ye username pehle se registered hai.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username: cleanUsername,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    console.log("NEW USER SIGNED UP:", cleanUsername);

    return res.json({
      success: true,
      userId: newUser.id,
      username: newUser.username,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: "Signup fail ho gaya. Dobara try karein.",
    });
  }
});

// =====================================================
// LOGIN
// POST /api/login
// =====================================================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !username.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: "Username aur password required hain.",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = loadUsers();

    const user = users.find(
      (u) => u.username === cleanUsername
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Username ya password ghalat hai.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: "Username ya password ghalat hai.",
      });
    }

    console.log("USER LOGGED IN:", cleanUsername);

    return res.json({
      success: true,
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: "Login fail ho gaya. Dobara try karein.",
    });
  }
});

module.exports = router;
