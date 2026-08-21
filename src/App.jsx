import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef(null);

  // =====================================================
  // SIRC BUILT-IN KNOWLEDGE
  // =====================================================

  const sircStaff = [
    {
      name: "Ms. Maryam Tahir",
      role: "Head of Superior Information Resource Center",
      keywords: [
        "maryam",
        "maryam tahir",
        "head",
        "hod",
        "head of sirc",
        "head of department",
        "leader",
        "leadership",
      ],
      description:
        "Ms. Maryam Tahir is the Head of the Superior Information Resource Center (SIRC). She provides leadership for SIRC and supports modern library services, innovation, research support, employee growth, marketing and outreach initiatives.",
    },

    {
      name: "Ms. Muntaha Ali",
      role: "Assistant Manager — Marketing & Events",
      keywords: [
        "muntaha",
        "muntaha ali",
        "marketing",
        "events",
        "event",
        "promotion",
        "promotional",
      ],
      description:
        "Ms. Muntaha Ali is an Assistant Manager at SIRC and supports library marketing initiatives, event planning, promotional activities and user engagement.",
    },

    {
      name: "Ms. Fizza Malik",
      role: "Executive — Technical & Research Support",
      keywords: [
        "fizza",
        "fizza malik",
        "technical",
        "research support",
        "koha",
        "digital library",
        "ai research",
        "research technology",
      ],
      description:
        "Ms. Fizza Malik is an Executive — Technical & Research Support at SIRC. She is involved in technology-focused library services, digital library management and research technology initiatives. Her areas include Koha Library Management System, Calibre, library software support, research technology and AI-based research tools.",
    },

    {
      name: "Ms. Bushra Salah-Ud-Din",
      role: "Deputy Manager",
      keywords: [
        "bushra",
        "bushra salah",
        "bushra salah-ud-din",
        "deputy manager",
      ],
      description:
        "Ms. Bushra Salah-Ud-Din is a Deputy Manager at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Waseem Alauddin",
      role: "Deputy Manager",
      keywords: [
        "waseem",
        "waseem alauddin",
        "deputy manager",
      ],
      description:
        "Mr. Waseem Alauddin is a Deputy Manager at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Muhammad Tayyab",
      role: "Assistant Manager",
      keywords: [
        "tayyab",
        "muhammad tayyab",
        "assistant manager",
      ],
      description:
        "Mr. Muhammad Tayyab is an Assistant Manager at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Muhammad Usman",
      role: "Assistant Manager — Technical & AI",
      keywords: [
        "usman",
        "muhammad usman",
        "technical ai",
        "technical and ai",
      ],
      description:
        "Mr. Muhammad Usman is an Assistant Manager — Technical & AI at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Muhammad Imran",
      role: "Assistant Manager",
      keywords: [
        "imran",
        "muhammad imran",
        "assistant manager",
      ],
      description:
        "Mr. Muhammad Imran is an Assistant Manager at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Hassan Khalil",
      role: "Executive — Library Services",
      keywords: [
        "hassan",
        "hassan khalil",
        "library services",
        "executive library",
      ],
      description:
        "Mr. Hassan Khalil is an Executive — Library Services at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Turaj Iqbal",
      role: "Officer",
      keywords: [
        "turaj",
        "turaj iqbal",
        "officer",
      ],
      description:
        "Mr. Turaj Iqbal is an Officer at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Abdul Hameed",
      role: "Officer",
      keywords: [
        "abdul",
        "abdul hameed",
        "hameed",
        "officer",
      ],
      description:
        "Mr. Abdul Hameed is an Officer at the Superior Information Resource Center.",
    },

    {
      name: "Mr. Umer Farooq",
      role: "Officer",
      keywords: [
        "umer",
        "umer farooq",
        "umar",
        "officer",
      ],
      description:
        "Mr. Umer Farooq is an Officer at the Superior Information Resource Center.",
    },
  ];

  // =====================================================
  // BUILT-IN SIRC ANSWER ENGINE
  // =====================================================

  const getBuiltInAnswer = (question) => {
    const q = question.toLowerCase().trim();

    // -----------------------------------------------------
    // GENERAL SIRC QUESTIONS
    // -----------------------------------------------------

    if (
      q.includes("what is sirc") ||
      q.includes("what's sirc") ||
      q.includes("tell me about sirc") ||
      q.includes("about sirc") ||
      q.includes("sirc kya hai") ||
      q.includes("sirc ke bare") ||
      q.includes("sirc k bare")
    ) {
      return `
## Superior Information Resource Center (SIRC)

**SIRC** stands for **Superior Information Resource Center**.

SIRC provides students, faculty and researchers with quality information resources, modern library services and technology-driven research support.

SIRC focuses on:

- 📚 Library and information services
- 🔬 Research support
- 💻 Digital library services
- 🤖 Research technology and AI initiatives
- 📖 Access to academic information resources
- 👥 User engagement and outreach
- 🚀 Modern and innovative library services

SIRC is continuously working to move beyond the traditional concept of a library by introducing technology-driven services and research support.
`;
    }

    // -----------------------------------------------------
    // WHO IS HEAD / HOD
    // -----------------------------------------------------

    if (
      q.includes("who is the head") ||
      q.includes("who is head") ||
      q.includes("head of sirc") ||
      q.includes("hod of sirc") ||
      q.includes("sirc ka head") ||
      q.includes("sirc ki head") ||
      q.includes("head kon hai") ||
      q.includes("hod kon hai") ||
      q.includes("head ka naam")
    ) {
      return `
## Head of SIRC

**Ms. Maryam Tahir** is the **Head of the Superior Information Resource Center (SIRC)**.

She provides leadership for SIRC and supports:

- Modern library services
- Research support
- Innovation
- Employee growth
- Marketing and outreach
- Technology-driven library initiatives
`;
    }

    // -----------------------------------------------------
    // STAFF LIST
    // -----------------------------------------------------

    if (
      q.includes("staff") ||
      q.includes("team members") ||
      q.includes("team of sirc") ||
      q.includes("sirc team") ||
      q.includes("who works in sirc") ||
      q.includes("who work in sirc") ||
      q.includes("sirc employees") ||
      q.includes("sirc ke staff") ||
      q.includes("sirc ki team")
    ) {
      return `
## SIRC Staff Directory

The Superior Information Resource Center has the following team members:

### Leadership
- **Ms. Maryam Tahir** — Head of SIRC

### Management & Support
- **Ms. Bushra Salah-Ud-Din** — Deputy Manager
- **Mr. Waseem Alauddin** — Deputy Manager
- **Mr. Muhammad Tayyab** — Assistant Manager
- **Mr. Muhammad Usman** — Assistant Manager — Technical & AI
- **Mr. Muhammad Imran** — Assistant Manager

### Specialized Roles
- **Ms. Muntaha Ali** — Assistant Manager — Marketing & Events
- **Ms. Fizza Malik** — Executive — Technical & Research Support
- **Mr. Hassan Khalil** — Executive — Library Services

### Officers
- **Mr. Turaj Iqbal** — Officer
- **Mr. Abdul Hameed** — Officer
- **Mr. Umer Farooq** — Officer
`;
    }

    // -----------------------------------------------------
    // MARKETING
    // -----------------------------------------------------

    if (
      q.includes("who handles marketing") ||
      q.includes("who does marketing") ||
      q.includes("marketing person") ||
      q.includes("marketing staff") ||
      q.includes("marketing kon") ||
      q.includes("marketing kaun") ||
      q.includes("events") ||
      q.includes("event planning")
    ) {
      return `
## Marketing & Events

**Ms. Muntaha Ali** is an **Assistant Manager — Marketing & Events** at SIRC.

She supports:

- Library marketing initiatives
- Event planning
- Promotional activities
- User engagement
`;
    }

    // -----------------------------------------------------
    // TECHNICAL SUPPORT
    // -----------------------------------------------------

    if (
      q.includes("who handles technical") ||
      q.includes("technical support") ||
      q.includes("technical person") ||
      q.includes("technical staff") ||
      q.includes("technical kon") ||
      q.includes("technology support") ||
      q.includes("library software")
    ) {
      return `
## Technical & Research Support

**Ms. Fizza Malik** is an **Executive — Technical & Research Support** at SIRC.

Her responsibilities include:

- Koha Library Management System
- Digital library management
- Calibre
- Library software and technical support
- Research technology initiatives
- AI-based research tools
`;
    }

    // -----------------------------------------------------
    // KOHA
    // -----------------------------------------------------

    if (
      q.includes("who handles koha") ||
      q.includes("who manages koha") ||
      q.includes("koha kon") ||
      q.includes("koha kis ke") ||
      q.includes("koha responsible")
    ) {
      return `
## Koha Support

**Ms. Fizza Malik** is involved in **Koha Library Management System** and technology-focused library services at SIRC.

She works on library software, digital library management and research technology initiatives.
`;
    }

    // -----------------------------------------------------
    // AI
    // -----------------------------------------------------

    if (
      q.includes("who handles ai") ||
      q.includes("ai staff") ||
      q.includes("ai person") ||
      q.includes("ai kon") ||
      q.includes("artificial intelligence")
    ) {
      return `
## AI & Technology

SIRC has technology-focused roles including:

- **Mr. Muhammad Usman** — Assistant Manager — Technical & AI
- **Ms. Fizza Malik** — Executive — Technical & Research Support

SIRC also has the **SIRC Research Copilot**, an AI-powered research assistance initiative designed to support students and researchers.
`;
    }

    // -----------------------------------------------------
    // RESEARCH SUPPORT
    // -----------------------------------------------------

    if (
      q.includes("who handles research support") ||
      q.includes("research support staff") ||
      q.includes("research technology") ||
      q.includes("research support kon")
    ) {
      return `
## Research & Technical Support

**Ms. Fizza Malik** works in **Technical & Research Support** at SIRC.

Her work includes research technology initiatives, digital library management, Koha, library software support and AI-based research tools.
`;
    }

    // -----------------------------------------------------
    // INDIVIDUAL STAFF QUESTIONS
    // -----------------------------------------------------

    for (const staff of sircStaff) {
      const found = staff.keywords.some((keyword) =>
        q.includes(keyword)
      );

      if (found) {
        return `
## ${staff.name}

**Role:** ${staff.role}

${staff.description}
`;
      }
    }

    // -----------------------------------------------------
    // DEPUTY MANAGERS
    // -----------------------------------------------------

    if (
      q.includes("deputy manager") ||
      q.includes("deputy managers")
    ) {
      return `
## Deputy Managers at SIRC

The Deputy Managers listed in the SIRC staff directory are:

- **Ms. Bushra Salah-Ud-Din**
- **Mr. Waseem Alauddin**
`;
    }

    // -----------------------------------------------------
    // ASSISTANT MANAGERS
    // -----------------------------------------------------

    if (
      q.includes("assistant managers") ||
      q.includes("assistant manager kon")
    ) {
      return `
## Assistant Managers at SIRC

The Assistant Managers listed in the SIRC staff directory are:

- **Ms. Muntaha Ali** — Marketing & Events
- **Mr. Muhammad Tayyab**
- **Mr. Muhammad Usman** — Technical & AI
- **Mr. Muhammad Imran**
`;
    }

    return null;
  };

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF document.");
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("The PDF must be smaller than 20 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // COPY RESPONSE
  // =====================================================

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // =====================================================
  // NORMAL AI CHAT
  // =====================================================

  const sendNormalMessage = async (question) => {
    // First check built-in SIRC knowledge
    const builtInAnswer = getBuiltInAnswer(question);

    if (builtInAnswer) {
      return builtInAnswer;
    }

    const response = await fetch(
  "https://sirc-research-copilot-api.onrender.com/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
        }),
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid response from server.");
    }

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to generate response."
      );
    }

    return data.answer;
  };

  // =====================================================
  // PDF ANALYSIS
  // =====================================================

  const analyzePDF = async (
    file,
    action = "general",
    question = ""
  ) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("action", action);

    if (question.trim()) {
      formData.append("question", question.trim());
    }

    const response = await fetch(
  "https://sirc-research-copilot-api.onrender.com/api/analyze-pdf",
      {
        method: "POST",
        body: formData,
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Invalid response from PDF server."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to analyze PDF."
      );
    }

    return data.answer;
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async () => {
    if (
      loading ||
      (!message.trim() && !selectedFile)
    ) {
      return;
    }

    const currentMessage = message.trim();
    const currentFile = selectedFile;

    setMessages((previous) => [
      ...previous,
      {
        type: "user",
        text:
          currentMessage ||
          "Please analyze this research paper.",
        file: currentFile
          ? currentFile.name
          : null,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      let answer;

      if (currentFile) {
        answer = await analyzePDF(
          currentFile,
          "general",
          currentMessage
        );
      } else {
        answer = await sendNormalMessage(
          currentMessage
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          type: "assistant",
          text:
            answer ||
            "I could not generate a response.",
        },
      ]);

      if (currentFile) {
        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error(
        "SIRC Copilot Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          type: "assistant",
          text:
            error.message ||
            "I could not process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOCUMENT ACTIONS
  // =====================================================

  const handleDocumentAction = async (action) => {
    if (!selectedFile || loading) {
      return;
    }

    const actionNames = {
      summarize: "Summarize Paper",
      gap: "Find Research Gap",
      objectives: "Extract Objectives",
      methodology: "Explain Methodology",
      findings: "Key Findings",
      questions: "Generate Research Questions",
    };

    const actionName =
      actionNames[action] ||
      "Analyze Document";

    const currentFile = selectedFile;

    setMessages((previous) => [
      ...previous,
      {
        type: "user",
        text: actionName,
        file: currentFile.name,
      },
    ]);

    setLoading(true);

    try {
      const answer = await analyzePDF(
        currentFile,
        action
      );

      setMessages((previous) => [
        ...previous,
        {
          type: "assistant",
          text:
            answer ||
            "No response was generated.",
        },
      ]);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "PDF Analysis Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          type: "assistant",
          text:
            error.message ||
            "I could not analyze this PDF. Please make sure it contains readable text and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const handleNewChat = () => {
    setMessages([]);
    setMessage("");
    setSelectedFile(null);
    setLoading(false);
    setCopiedIndex(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // =====================================================
// VOICE INPUT
// =====================================================

const handleVoiceInput = () => {
  if (loading) return;

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
    );
    return;
  }

  if (isListening) {
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const transcript =
      event.results[0][0].transcript;

    setMessage((previous) => {
      const existing = previous.trim();

      if (!existing) {
        return transcript;
      }

      return `${existing} ${transcript}`;
    });
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event.error);

    if (event.error === "not-allowed") {
      alert(
        "Microphone permission was denied. Please allow microphone access."
      );
    } else if (event.error === "no-speech") {
      alert("No speech detected. Please try again.");
    } else {
      alert("Voice input could not be started. Please try again.");
    }

    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};

  // =====================================================
  // SIDEBAR RESEARCH TOOLS
  // =====================================================

  const handleSidebarTool = (tool) => {
    const prompts = {
      topic:
        "Help me develop a strong academic research topic. Suggest several research topics, explain why each topic is important, and identify possible research variables.",

      questions:
        "Help me develop academically meaningful research questions for my research topic. Provide clear and researchable questions.",

      keywords:
        "Generate important academic keywords, synonyms, related terms, and alternative search terms for my research topic.",

      boolean:
        "Create effective Boolean search strings using AND, OR, and NOT for my research topic. Make them suitable for academic databases.",

      database:
        "Recommend suitable academic research databases for my research topic and explain what type of information I can find in each database.",

      citation:
        "Help me with academic citation. Explain the appropriate citation style and provide examples of in-text citations and reference entries.",
    };

    const selectedPrompt = prompts[tool];

    if (!selectedPrompt) return;

    setMessage(selectedPrompt);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            S
          </div>

          <div>
            <h2>SIRC</h2>
            <span>Research Copilot</span>
          </div>

        </div>

        <button
          className="new-chat"
          onClick={handleNewChat}
        >
          + New Research Chat
        </button>

        <div className="sidebar-section">

          <p>Research Tools</p>

          <button
            onClick={() =>
              handleSidebarTool("topic")
            }
          >
            🔎 Research Topic
          </button>

          <button
            onClick={() =>
              handleSidebarTool("questions")
            }
          >
            🧠 Research Questions
          </button>

          <button
            onClick={() =>
              handleSidebarTool("keywords")
            }
          >
            🔤 Keywords & Synonyms
          </button>

          <button
            onClick={() =>
              handleSidebarTool("boolean")
            }
          >
            🔗 Boolean Search
          </button>

          <button
            onClick={() =>
              handleSidebarTool("database")
            }
          >
            📚 Database Guide
          </button>

          <button
            onClick={() =>
              handleSidebarTool("citation")
            }
          >
            📑 Citation Help
          </button>

        </div>

        <div className="sidebar-bottom">

          <button
            type="button"
            onClick={() =>
              alert(
                "Settings will be available in the next stage."
              )
            }
          >
            ⚙ Settings
          </button>

          <button
            type="button"
            onClick={() =>
              setShowAbout(true)
            }
          >
            💡 About SIRC
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main">

       <header className="topbar">

  <div className="topbar-title">
    <span className="status-dot"></span>
    <span>SIRC Research Copilot</span>
  </div>

  <div className="topbar-right">

    <div className="developer-credit">
      <span>Developed by</span>
      <strong>Fizza Malik</strong>
    </div>

    <button
      className="about-button"
      onClick={() =>
        setShowAbout(true)
      }
    >
      About SIRC
    </button>

  </div>

</header>

        {/* =====================================================
            WELCOME
        ===================================================== */}

        {messages.length === 0 && (

          <section className="welcome">

            <div className="welcome-icon">
              ✦
            </div>

            <h1>
              Your AI Research Assistant
            </h1>

            <p>
              Research smarter, discover better,
              and get academic assistance whenever
              you need it.
            </p>

            <div className="quick-tools">

              <button
                type="button"
                className="tool-card"
                onClick={() =>
                  handleSidebarTool("topic")
                }
              >
                <span>🔎</span>

                <h3>
                  Research Topics
                </h3>

                <p>
                  Develop and refine research ideas.
                </p>
              </button>

              <button
                type="button"
                className="tool-card"
                onClick={() =>
                  handleSidebarTool("keywords")
                }
              >
                <span>🔤</span>

                <h3>
                  Keywords
                </h3>

                <p>
                  Find keywords and useful synonyms.
                </p>
              </button>

              <button
                type="button"
                className="tool-card"
                onClick={() =>
                  handleSidebarTool("boolean")
                }
              >
                <span>🔗</span>

                <h3>
                  Boolean Search
                </h3>

                <p>
                  Create powerful database searches.
                </p>
              </button>

              <button
                type="button"
                className="tool-card"
                onClick={() =>
                  handleSidebarTool("database")
                }
              >
                <span>📚</span>

                <h3>
                  Database Guide
                </h3>

                <p>
                  Find the right database for your topic.
                </p>
              </button>

            </div>

          </section>

        )}

        {/* =====================================================
            CHAT
        ===================================================== */}

        {messages.length > 0 && (

          <section className="messages">

            {messages.map((item, index) => (

              <div
                key={index}
                className={`message-row ${item.type}`}
              >

                <div className="message">

                  {item.text && (

                    <div className="markdown-content">

                      <ReactMarkdown>
                        {item.text}
                      </ReactMarkdown>

                    </div>

                  )}

                  {item.file && (

                    <div className="uploaded-file">
                      📄 {item.file}
                    </div>

                  )}

                  {item.type === "assistant" &&
                    item.text && (

                    <div className="message-actions">

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            item.text,
                            index
                          )
                        }
                      >
                        {copiedIndex === index
                          ? "✓ Copied"
                          : "Copy"}
                      </button>

                    </div>

                  )}

                </div>

              </div>

            ))}

            {loading && (

              <div className="message-row assistant">

                <div className="message thinking-message">

                  <div className="thinking-label">
                    SIRC Copilot is thinking
                  </div>

                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                </div>

              </div>

            )}

          </section>

        )}

        {/* =====================================================
            DOCUMENT ACTIONS
        ===================================================== */}

        {selectedFile && !loading && (

          <div className="document-actions">

            <div className="document-actions-header">

              <div className="document-info">

                <strong>
                  📄 {selectedFile.name}
                </strong>

                <span>
                  Ask anything about this document
                  or choose an action.
                </span>

              </div>

              <button
                type="button"
                onClick={removeFile}
                className="remove-document"
                title="Remove PDF"
              >
                ×
              </button>

            </div>

            <div className="document-action-grid">

              <button
                type="button"
                onClick={() =>
                  handleDocumentAction("summarize")
                }
              >
                <span>📝</span>

                <div>
                  <strong>
                    Summarize Paper
                  </strong>

                  <small>
                    Get the main points
                  </small>
                </div>

              </button>

              <button
                type="button"
                onClick={() =>
                  handleDocumentAction("gap")
                }
              >
                <span>🔎</span>

                <div>
                  <strong>
                    Find Research Gap
                  </strong>

                  <small>
                    Identify possible gaps
                  </small>
                </div>

              </button>

              <button
                type="button"
                onClick={() =>
                  handleDocumentAction("objectives")
                }
              >
                <span>🎯</span>

                <div>
                  <strong>
                    Extract Objectives
                  </strong>

                  <small>
                    Find research objectives
                  </small>
                </div>

              </button>

              <button
                type="button"
                onClick={() =>
                  handleDocumentAction("methodology")
                }
              >
                <span>🧪</span>

                <div>
                  <strong>
                    Explain Methodology
                  </strong>

                  <small>
                    Understand the methods
                  </small>
                </div>

              </button>

              <button
                type="button"
                onClick={() =>
                  handleDocumentAction("findings")
                }
              >
                <span>📊</span>

                <div>
                  <strong>
                    Key Findings
                  </strong>

                  <small>
                    Extract important findings
                  </small>
                </div>

              </button>

              <button
                type="button"
                onClick={() =>
                  handleDocumentAction("questions")
                }
              >
                <span>💡</span>

                <div>
                  <strong>
                    Generate Questions
                  </strong>

                  <small>
                    Create research questions
                  </small>
                </div>

              </button>

            </div>

          </div>

        )}

        {/* =====================================================
            INPUT
        ===================================================== */}

        <section className="chat-area">

          <div className="input-wrapper">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                selectedFile
                  ? "Ask anything about this document..."
                  : "Ask anything about your research..."
              }
              rows={1}
              disabled={loading}
            />

            <div className="input-actions">

              <div className="left-actions">

                <button
                  type="button"
                  title="Upload PDF"
                  onClick={handleFileClick}
                  disabled={loading}
                >
                  📎
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  style={{
                    display: "none",
                  }}
                />

                <button
  type="button"
  title={
    isListening
      ? "Listening..."
      : "Voice input"
  }
  onClick={handleVoiceInput}
  disabled={loading || isListening}
  className={isListening ? "voice-listening" : ""}
>
  {isListening ? "🔴" : "🎤"}
</button>

              </div>

              <button
                type="button"
                className="send-button"
                onClick={handleSend}
                disabled={
                  loading ||
                  (!message.trim() &&
                    !selectedFile)
                }
              >
                {loading ? "..." : "➤"}
              </button>

            </div>

          </div>

          <p className="disclaimer">
            SIRC Research Copilot is designed to support
            research and information discovery. Always verify
            important academic information.
          </p>

        </section>

      </main>

      {/* =====================================================
          ABOUT SIRC MODAL
      ===================================================== */}

      {showAbout && (

        <div
          className="about-overlay"
          onClick={() =>
            setShowAbout(false)
          }
        >

          <div
            className="about-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="about-close"
              onClick={() =>
                setShowAbout(false)
              }
            >
              ×
            </button>

            {/* ABOUT HERO */}

            <div className="about-hero">

              <div className="about-brand-icon">
                S
              </div>

              <div>

                <span className="about-label">
                  SUPERIOR INFORMATION RESOURCE CENTER
                </span>

                <h1>
                  About <span>SIRC</span>
                </h1>

                <p>
                  Empowering learning, supporting research,
                  and building a culture of knowledge through
                  modern library services and technology.
                </p>

              </div>

            </div>

            {/* STATS */}

            <div className="about-stats">

              <div className="about-stat">
                <strong>12</strong>
                <span>Team Members</span>
              </div>

              <div className="about-stat">
                <strong>1</strong>
                <span>Central Library</span>
              </div>

              <div className="about-stat">
                <strong>24/7</strong>
                <span>Research Support</span>
              </div>

              <div className="about-stat">
                <strong>AI</strong>
                <span>Research Innovation</span>
              </div>

            </div>

            {/* WHO WE ARE */}

            <section className="about-section">

              <div className="section-heading">

                <span>01</span>

                <div>
                  <h2>Who We Are</h2>

                  <p>
                    About Superior Information Resource Center
                  </p>
                </div>

              </div>

              <div className="about-description">

                <p>
                  The{" "}
                  <strong>
                    Superior Information Resource Center
                    (SIRC)
                  </strong>{" "}
                  is dedicated to providing students,
                  faculty and researchers with quality
                  information resources, modern library
                  services and technology-driven research
                  support.
                </p>

                <p>
                  SIRC is continuously moving beyond the
                  traditional concept of a library by
                  introducing digital services, research
                  support, technology solutions, user
                  engagement activities and innovative
                  information services.
                </p>

              </div>

            </section>

            {/* LEADERSHIP */}

            <section className="about-section">

              <div className="section-heading">

                <span>02</span>

                <div>
                  <h2>Leadership</h2>

                  <p>
                    Vision, innovation and people-focused
                    management
                  </p>
                </div>

              </div>

              <div className="leader-card">

                <div className="leader-image-wrap">

                  <img
                    src="/team/maryam.jpg"
                    alt="Ms. Maryam Tahir"
                    className="leader-image"
                  />

                </div>

                <div className="leader-content">

                  <span className="profile-tag">
                    HEAD OF DEPARTMENT
                  </span>

                  <h3>
                    Ms. Maryam Tahir
                  </h3>

                  <p className="leader-role">
                    Head of Superior Information Resource
                    Center
                  </p>

                  <p>
                    Ms. Maryam Tahir is a supportive and
                    forward-thinking leader who has given
                    SIRC a modern and progressive
                    perspective.
                  </p>

                  <p>
                    Her leadership encourages new
                    initiatives, innovation and
                    professional growth while maintaining
                    a positive and comfortable working
                    environment for employees.
                  </p>

                  <div className="leader-points">

                    <span>
                      ✓ Encourages new initiatives
                    </span>

                    <span>
                      ✓ Supports employee growth
                    </span>

                    <span>
                      ✓ Promotes modern library services
                    </span>

                    <span>
                      ✓ Focuses on marketing and outreach
                    </span>

                  </div>

                </div>

              </div>

            </section>

            {/* FEATURED TEAM */}

            <section className="about-section">

              <div className="section-heading">

                <span>03</span>

                <div>
                  <h2>Our Team</h2>

                  <p>
                    The people behind SIRC's services
                    and innovation
                  </p>
                </div>

              </div>

              <div className="featured-team">

                {/* MUNTAHA */}

                <div className="featured-card">

                  <div className="featured-image">

                    <img
                      src="/team/muntaha.jpg"
                      alt="Ms. Muntaha Ali"
                    />

                  </div>

                  <div className="featured-info">

                    <span className="team-tag marketing">
                      MARKETING & EVENTS
                    </span>

                    <h3>
                      Ms. Muntaha Ali
                    </h3>

                    <strong>
                      Assistant Manager
                    </strong>

                    <p>
                      Supports library marketing
                      initiatives, event planning,
                      promotional activities and user
                      engagement.
                    </p>

                    <div className="team-skills">
                      <span>Marketing</span>
                      <span>Events</span>
                      <span>Planning</span>
                    </div>

                  </div>

                </div>

                {/* FIZZA */}

                <div className="featured-card featured-tech">

                  <div className="featured-image">

                    <img
                      src="/team/fizza.jpg"
                      alt="Ms. Fizza Malik"
                    />

                    <div className="tech-badge">
                      ✦
                    </div>

                  </div>

                  <div className="featured-info">

                    <span className="team-tag technology">
                      TECHNICAL & RESEARCH SUPPORT
                    </span>

                    <h3>
                      Ms. Fizza Malik
                    </h3>

                    <strong>
                      Executive — Technical & Research
                      Support
                    </strong>

                    <p>
                      Responsible for technology-focused
                      library services, digital library
                      management and research technology
                      initiatives.
                    </p>

                    <div className="expertise-list">

                      <span>
                        ✓ Koha Library Management System
                      </span>

                      <span>
                        ✓ Calibre & Digital Library Management
                      </span>

                      <span>
                        ✓ Library Software & Technical Support
                      </span>

                      <span>
                        ✓ Research Technology Initiatives
                      </span>

                      <span>
                        ✓ AI-based Research Tools
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* STAFF DIRECTORY */}

            <section className="about-section">

              <div className="section-heading">

                <span>04</span>

                <div>
                  <h2>Staff Directory</h2>

                  <p>
                    Our dedicated SIRC team
                  </p>
                </div>

              </div>

              <div className="staff-grid">

                <div className="staff-card">
                  <div className="staff-avatar">
                    BS
                  </div>

                  <div>
                    <h4>
                      Ms. Bushra Salah-Ud-Din
                    </h4>

                    <p>
                      Deputy Manager
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    WA
                  </div>

                  <div>
                    <h4>
                      Mr. Waseem Alauddin
                    </h4>

                    <p>
                      Deputy Manager
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    MT
                  </div>

                  <div>
                    <h4>
                      Mr. Muhammad Tayyab
                    </h4>

                    <p>
                      Assistant Manager
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    MU
                  </div>

                  <div>
                    <h4>
                      Mr. Muhammad Usman
                    </h4>

                    <p>
                      Assistant Manager —
                      Technical & AI
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    MI
                  </div>

                  <div>
                    <h4>
                      Mr. Muhammad Imran
                    </h4>

                    <p>
                      Assistant Manager
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    HK
                  </div>

                  <div>
                    <h4>
                      Mr. Hassan Khalil
                    </h4>

                    <p>
                      Executive — Library Services
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    TI
                  </div>

                  <div>
                    <h4>
                      Mr. Turaj Iqbal
                    </h4>

                    <p>
                      Officer
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    AH
                  </div>

                  <div>
                    <h4>
                      Mr. Abdul Hameed
                    </h4>

                    <p>
                      Officer
                    </p>
                  </div>
                </div>

                <div className="staff-card">
                  <div className="staff-avatar">
                    UF
                  </div>

                  <div>
                    <h4>
                      Mr. Umer Farooq
                    </h4>

                    <p>
                      Officer
                    </p>
                  </div>
                </div>

              </div>

            </section>

            {/* AI RESEARCH COPILOT */}

            <section className="copilot-about">

              <div className="copilot-icon">
                ✦
              </div>

              <div className="copilot-content">

                <span>
                  SIRC TECHNOLOGY INITIATIVE
                </span>

                <h2>
                  SIRC Research Copilot
                </h2>

                <p>
                  An AI-powered research assistance tool
                  developed as a technology initiative of
                  SIRC to support students and researchers
                  throughout their academic research
                  journey.
                </p>

                <div className="copilot-features">

                  <span>Research Topics</span>
                  <span>Research Questions</span>
                  <span>Keywords & Synonyms</span>
                  <span>Boolean Search</span>
                  <span>Database Guidance</span>
                  <span>Citation Help</span>
                  <span>PDF Analysis</span>
                  <span>Research Gap</span>
                  <span>Methodology</span>
                  <span>Key Findings</span>

                </div>

              </div>

            </section>

            {/* FOOTER */}

            <div className="about-footer">

              <strong>
                SIRC — Superior Information Resource Center
              </strong>

              <span>
                Empowering learning • Supporting research •
                Inspiring innovation
              </span>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;