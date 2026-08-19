// =====================================================
// SIRC AI CACHE
// =====================================================

const fs = require("fs");
const path = require("path");

const cacheFile = path.join(__dirname, "ai-cache.json");

// Cache file na ho to automatically create ho jayegi
if (!fs.existsSync(cacheFile)) {
  fs.writeFileSync(cacheFile, JSON.stringify({}, null, 2));
}


// =====================================================
// NORMALIZE QUESTION
// =====================================================

function normalizeQuestion(question) {
  return question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[?!.]+$/g, "");
}


// =====================================================
// GET CACHE
// =====================================================

function getCachedAnswer(question) {

  const normalized = normalizeQuestion(question);

  const cache = JSON.parse(
    fs.readFileSync(cacheFile, "utf8")
  );

  return cache[normalized] || null;
}


// =====================================================
// SAVE CACHE
// =====================================================

function saveCachedAnswer(question, answer) {

  const normalized = normalizeQuestion(question);

  const cache = JSON.parse(
    fs.readFileSync(cacheFile, "utf8")
  );

  cache[normalized] = {
    answer: answer,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(
    cacheFile,
    JSON.stringify(cache, null, 2)
  );

  console.log("ANSWER SAVED TO CACHE");
}


module.exports = {
  getCachedAnswer,
  saveCachedAnswer
};