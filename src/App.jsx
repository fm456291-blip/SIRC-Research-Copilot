import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";
import Auth from './Auth'; // <--- Yeh login file import ki hai

function App() {
  // 1. Safe tareeqay se check karo ke user logged in hai ya nahi
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sirc_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // 2. AGAR USER LOGIN NAHI HAI: Toh sirf Login/Signup screen dikhao
  if (!user) {
    return <Auth setUser={setUser} />;
  }

  // 3. AGAR USER LOGIN HAI: Toh yeh saara dashboard render hoga
  return <DashboardApp setUser={setUser} />;

  const messagesEndRef = useRef(null);

  const API_BASE_URL =
    "https://sirc-research-copilot-api.onrender.com";


  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    loading,
    repositoryLoading,
    repositoryResources,
  ]);


  // =====================================================
  // SIRC STAFF
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


    // ---------------------------------------------------
    // SIRC
    // ---------------------------------------------------

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
- 📖 Academic information resources
- 👥 User engagement and outreach
- 🚀 Modern and innovative library services
`;
    }


    // ---------------------------------------------------
    // HEAD
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // STAFF
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // MARKETING
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // TECHNICAL
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // KOHA
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // AI
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // RESEARCH SUPPORT
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // INDIVIDUAL STAFF
    // ---------------------------------------------------

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


    return null;
  };


  // =====================================================
  // RESEARCH REPOSITORY SEARCH
  // =====================================================

  const searchResearchRepository = async (topic) => {

    if (!topic || !topic.trim()) {
      return [];
    }

    setRepositoryLoading(true);
    setRepositoryError("");

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/research-recommendations?topic=${encodeURIComponent(
          topic.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to search SIRC Research Repository."
        );
      }

      const resources = Array.isArray(data.resources)
        ? data.resources
        : [];

      setRepositoryTopic(
        data.topic || topic.trim()
      );

      setRepositoryResources(resources);

      return resources;

    } catch (error) {

      console.error(
        "Repository Search Error:",
        error
      );

      setRepositoryResources([]);

      setRepositoryTopic(
        topic.trim()
      );

      setRepositoryError(
        error.message ||
        "Unable to search SIRC Research Repository."
      );

      return [];

    } finally {

      setRepositoryLoading(false);

    }
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

      alert(
        "Please upload a PDF document."
      );

      event.target.value = "";

      return;
    }


    if (file.size > 20 * 1024 * 1024) {

      alert(
        "The PDF must be smaller than 20 MB."
      );

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
  // COPY
  // =====================================================

  const handleCopy = async (
    text,
    index
  ) => {

    try {

      await navigator.clipboard.writeText(
        text
      );

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);

    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }
  };


  // =====================================================
  // NORMAL AI CHAT
  // =====================================================

  const sendNormalMessage = async (question) => {
  // =====================================================
  // STEP 1: CHECK BUILT-IN SIRC KNOWLEDGE
  // =====================================================

  const builtInAnswer = getBuiltInAnswer(question);

  if (builtInAnswer) {
    return builtInAnswer;
  }

  // =====================================================
  // STEP 2: GET NORMAL AI RESPONSE
  // =====================================================

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

  let answer =
    data.answer ||
    "I could not generate a response.";

  // =====================================================
  // STEP 3: SEARCH SIRC RESEARCH REPOSITORY
  // =====================================================

  try {
    /*
      Send the user's question to the recommendation
      endpoint.

      The backend will determine the research topic
      and search the Calibre/SIRC Research Repository.
    */

    const recommendationResponse = await fetch(
      `https://sirc-research-copilot-api.onrender.com/api/research-recommendations?topic=${encodeURIComponent(
        question
      )}`
    );

    if (recommendationResponse.ok) {
      const recommendationData =
        await recommendationResponse.json();

      console.log(
        "SIRC Repository Recommendations:",
        recommendationData
      );

      // =================================================
      // STEP 4: CHECK IF RESOURCES WERE FOUND
      // =================================================

      if (
        recommendationData.success &&
        recommendationData.count > 0 &&
        Array.isArray(recommendationData.resources)
      ) {
        let repositorySection = `

---

## 📚 Available in SIRC Research Repository

We found **${recommendationData.count} resources related to this topic in the SIRC Research Repository**.

These resources are available in the **SIRC Research Repository** and may be useful for your research.

`;

        // Show maximum 10 resources
        // so the answer does not become unnecessarily long.

        const resourcesToShow =
          recommendationData.resources.slice(0, 10);

        resourcesToShow.forEach((resource, index) => {
          const title =
            resource.title ||
            "Untitled Resource";

          const authors =
            resource.authors ||
            "Author information not available";

          repositorySection += `
${index + 1}. **${title}**

   **Author(s):** ${authors}

`;
        });

        // If more than 10 resources exist
        if (recommendationData.count > 10) {
          repositorySection += `
> **${recommendationData.count - 10} additional related resources** are also available in the SIRC Research Repository.
`;
        }

        repositorySection += `

**📖 Repository Note:**  
The resources listed above are available in the **SIRC Research Repository**. You can use them as part of your further reading and research on this topic.
`;

        answer += repositorySection;
      }
    }
  } catch (repositoryError) {
    /*
      Repository failure should NOT break the normal AI
      response.

      The user will still receive the AI-generated answer.
    */

    console.warn(
      "SIRC Research Repository search failed:",
      repositoryError
    );
  }

  // =====================================================
  // STEP 5: RETURN FINAL COMBINED RESPONSE
  // =====================================================

  return answer;
};

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async () => {

    if (
      loading ||
      (!message.trim() &&
        !selectedFile)
    ) {
      return;
    }


    const currentMessage =
      message.trim();

    const currentFile =
      selectedFile;


    setRepositoryResources([]);
    setRepositoryTopic("");
    setRepositoryError("");


    setMessages((previous) => [

      ...previous,

      {
        type: "user",

        text:
          currentMessage ||
          "Please analyze this research paper.",

        file:
          currentFile
            ? currentFile.name
            : null,
      },

    ]);


    setMessage("");

    setLoading(true);


    try {


      // =================================================
      // PDF
      // =================================================

      if (currentFile) {

        const answer =
          await analyzePDF(
            currentFile,
            "general",
            currentMessage
          );


        setMessages((previous) => [

          ...previous,

          {
            type: "assistant",

            text:
              answer ||
              "I could not generate a response.",
          },

        ]);


        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        return;
      }


      // =================================================
      // AI RESPONSE
      // =================================================

      const result =
        await sendNormalMessage(
          currentMessage
        );


      setMessages((previous) => [

        ...previous,

        {
          type: "assistant",

          text:
            result.answer ||
            "I could not generate a response.",
        },

      ]);


      // =================================================
      // REPOSITORY SEARCH
      // =================================================

      if (
        result.shouldSearchRepository
      ) {

        await searchResearchRepository(
          currentMessage
        );

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
  // NEW CHAT
  // =====================================================

  const handleNewChat = () => {

    setMessages([]);

    setMessage("");

    setSelectedFile(null);

    setLoading(false);

    setCopiedIndex(null);

    setRepositoryResources([]);

    setRepositoryTopic("");

    setRepositoryError("");

    setRepositoryLoading(false);


    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "sirc_user"
    );

    setUser(null);
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


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "en-US";

    recognition.continuous =
      false;

    recognition.interimResults =
      false;


    recognition.onstart = () => {

      setIsListening(true);

    };


    recognition.onresult = (
      event
    ) => {

      const transcript =
        event.results[0][0]
          .transcript;


      setMessage((previous) => {

        const existing =
          previous.trim();


        if (!existing) {
          return transcript;
        }


        return `${existing} ${transcript}`;

      });
    };


    recognition.onerror = (
      event
    ) => {

      console.error(
        "Voice recognition error:",
        event.error
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        alert(
          "Microphone permission was denied. Please allow microphone access."
        );

      } else if (
        event.error ===
        "no-speech"
      ) {

        alert(
          "No speech detected. Please try again."
        );

      } else {

        alert(
          "Voice input could not be started. Please try again."
        );

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

  const handleSidebarTool = async (
    tool
  ) => {

    if (loading) return;


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


    const selectedPrompt =
      prompts[tool];


    if (!selectedPrompt)
      return;


    setLoading(true);


    try {

      const result =
        await sendNormalMessage(
          selectedPrompt
        );


      setMessages((previous) => [

        ...previous,

        {
          type: "assistant",
          text:
            result.answer ||
            "I could not generate a response.",
        },

      ]);


    } catch (error) {

      setMessages((previous) => [

        ...previous,

        {
          type: "assistant",

          text:
            error.message ||
            "I could not process this research tool request.",
        },

      ]);

    } finally {

      setLoading(false);

    }
  };
  {/* =====================================================
    SIRC RESEARCH REPOSITORY RECOMMENDATIONS
===================================================== */}

{repositoryLoading && (
  <section className="repository-section">
    <div className="repository-loading">
      <span className="repository-spinner"></span>
      <div>
        <strong>Checking SIRC Research Repository...</strong>
        <p>Finding relevant books and research resources.</p>
      </div>
    </div>
  </section>
)}

{!repositoryLoading && repositoryResources.length > 0 && (
  <section className="repository-section">

    <div className="repository-header">

      <div>
        <span className="repository-label">
          SIRC RESEARCH REPOSITORY
        </span>

        <h2>
          Recommended Resources
        </h2>

        <p>
          Relevant books and research resources available
          in the SIRC Library for:
          <strong> {repositoryTopic}</strong>
        </p>
      </div>

    </div>

    <div className="repository-notice">

      <div className="repository-notice-icon">
        📚
      </div>

      <div>
        <strong>
          Resources available in SIRC Library
        </strong>

        <p>
          The following resources were found in the
          SIRC Research Repository. For access or
          availability details, please contact:
        </p>

        <a href="mailto:library@superior.edu.pk">
          library@superior.edu.pk
        </a>
      </div>

    </div>

    <div className="repository-grid">

      {repositoryResources.map((resource, index) => (

        <div
          className="repository-card"
          key={resource.id || resource.title || index}
        >

          <div className="repository-card-icon">
            📘
          </div>

          <div className="repository-card-content">

            <span className="repository-resource-type">
              {resource.type || "BOOK"}
            </span>

            <h3>
              {resource.title || "Untitled Resource"}
            </h3>

            {resource.author && (
              <p className="repository-author">
                <strong>Author:</strong>{" "}
                {resource.author}
              </p>
            )}

            {resource.year && (
              <p className="repository-year">
                <strong>Year:</strong>{" "}
                {resource.year}
              </p>
            )}

            {resource.subject && (
              <p className="repository-subject">
                <strong>Subject:</strong>{" "}
                {resource.subject}
              </p>
            )}

            <div className="repository-availability">
              ✓ Available in SIRC Library
            </div>

          </div>

        </div>

      ))}

    </div>

    <div className="repository-footer">

      <span>
        Need access to these resources?
      </span>

      <a href="mailto:library@superior.edu.pk">
        Email SIRC Library — library@superior.edu.pk
      </a>

    </div>

  </section>
)}

{!repositoryLoading &&
 repositoryResources.length === 0 &&
 repositoryTopic &&
 repositoryError && (

  <section className="repository-section repository-error">

    <div className="repository-error-icon">
      !
    </div>

    <div>
      <strong>
        SIRC Research Repository
      </strong>

      <p>
        We could not check the SIRC repository at
        the moment. Please try again later or contact
        the library.
      </p>

      <a href="mailto:library@superior.edu.pk">
        library@superior.edu.pk
      </a>
    </div>

  </section>
)}


  // =====================================================
  // DOCUMENT ACTIONS
  // =====================================================

  const handleDocumentAction = async (
    action
  ) => {

    if (
      !selectedFile ||
      loading
    ) {
      return;
    }


    const actionNames = {

      summarize:
        "Summarize Paper",

      gap:
        "Find Research Gap",

      objectives:
        "Extract Objectives",

      methodology:
        "Explain Methodology",

      findings:
        "Key Findings",

      questions:
        "Generate Research Questions",

    };


    const actionName =
      actionNames[action] ||
      "Analyze Document";


    const currentFile =
      selectedFile;


    setMessages((previous) => [

      ...previous,

      {
        type: "user",

        text: actionName,

        file:
          currentFile.name,
      },

    ]);


    setLoading(true);


    try {

      const answer =
        await analyzePDF(
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

      setMessages((previous) => [

        ...previous,

        {
          type: "assistant",

          text:
            error.message ||
            "I could not analyze this PDF.",
        },

      ]);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // ENTER
  // =====================================================

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="app">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        <div className="brand">

          <div className="brand-icon">
            S
          </div>

          <div>

            <h2>
              SIRC
            </h2>

            <span>
              Research Copilot
            </span>

          </div>

        </div>


        <button
          className="new-chat"
          onClick={handleNewChat}
        >
          + New Research Chat
        </button>


        <div className="sidebar-section">

          <p>
            Research Tools
          </p>


          <button
            onClick={() =>
              handleSidebarTool(
                "topic"
              )
            }
          >
            🔎 Research Topic
          </button>


          <button
            onClick={() =>
              handleSidebarTool(
                "questions"
              )
            }
          >
            🧠 Research Questions
          </button>


          <button
            onClick={() =>
              handleSidebarTool(
                "keywords"
              )
            }
          >
            🔤 Keywords & Synonyms
          </button>


          <button
            onClick={() =>
              handleSidebarTool(
                "boolean"
              )
            }
          >
            🔗 Boolean Search
          </button>


          <button
            onClick={() =>
              handleSidebarTool(
                "database"
              )
            }
          >
            📚 Database Guide
          </button>


          <button
            onClick={() =>
              handleSidebarTool(
                "citation"
              )
            }
          >
            📑 Citation Help
          </button>

        </div>


        <div className="sidebar-bottom">

          <button
            onClick={() =>
              alert(
                "Settings will be available in the next stage."
              )
            }
          >
            ⚙ Settings
          </button>


          <button
            onClick={() =>
              setShowAbout(true)
            }
          >
            💡 About SIRC
          </button>


          <button
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">


        {/* TOPBAR */}

        <header className="topbar">

          <div className="topbar-title">

            <span className="status-dot"></span>

            <span>
              SIRC Research Copilot
            </span>

          </div>


          <div className="topbar-right">

            <div className="developer-credit">

              <span>
                Developed by
              </span>

              <strong>
                Fizza Malik
              </strong>

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


        {/* =================================================
            WELCOME
        ================================================= */}

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
                className="tool-card"
                onClick={() =>
                  handleSidebarTool(
                    "topic"
                  )
                }
              >

                <span>
                  🔎
                </span>

                <h3>
                  Research Topics
                </h3>

                <p>
                  Develop and refine research ideas.
                </p>

              </button>


              <button
                className="tool-card"
                onClick={() =>
                  handleSidebarTool(
                    "keywords"
                  )
                }
              >

                <span>
                  🔤
                </span>

                <h3>
                  Keywords
                </h3>

                <p>
                  Find keywords and useful synonyms.
                </p>

              </button>


              <button
                className="tool-card"
                onClick={() =>
                  handleSidebarTool(
                    "boolean"
                  )
                }
              >

                <span>
                  🔗
                </span>

                <h3>
                  Boolean Search
                </h3>

                <p>
                  Create powerful database searches.
                </p>

              </button>


              <button
                className="tool-card"
                onClick={() =>
                  handleSidebarTool(
                    "database"
                  )
                }
              >

                <span>
                  📚
                </span>

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


        {/* =================================================
            CHAT MESSAGES
        ================================================= */}

        {messages.length > 0 && (

          <section className="messages">


            {messages.map(
              (item, index) => (

                <div
                  key={index}
                  className={`message-row ${item.type}`}
                >

                  <div className="message">


                    {item.text && (

                      <div className="markdown-content">

                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                          ]}
                        >
                          {item.text}
                        </ReactMarkdown>

                      </div>

                    )}


                    {item.file && (

                      <div className="uploaded-file">

                        📄{" "}
                        {item.file}

                      </div>

                    )}


                    {item.type ===
                      "assistant" &&
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

                            {copiedIndex ===
                            index
                              ? "✓ Copied"
                              : "Copy"}

                          </button>

                        </div>

                      )}

                  </div>

                </div>

              )
            )}


            {/* =================================================
                REPOSITORY RESULTS
            ================================================= */}

            {repositoryLoading && (

              <div className="repository-section">

                <div className="repository-header">

                  <div>

                    <span className="repository-label">
                      SIRC RESEARCH REPOSITORY
                    </span>

                    <h3>
                      Searching SIRC Library Resources...
                    </h3>

                    <p>
                      Checking the SIRC Research Repository
                      for resources related to{" "}
                      <strong>
                        {repositoryTopic}
                      </strong>
                    </p>

                  </div>

                </div>

                <div className="repository-loading">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            )}


            {!repositoryLoading &&
              repositoryResources.length >
                0 && (

                <div className="repository-section">


                  <div className="repository-header">

                    <div>

                      <span className="repository-label">
                        SIRC RESEARCH REPOSITORY
                      </span>

                      <h3>
                        Related Resources Available
                      </h3>

                      <p>

                        We found{" "}
                        <strong>
                          {repositoryResources.length}
                        </strong>{" "}
                        resource
                        {repositoryResources.length !==
                        1
                          ? "s"
                          : ""}{" "}
                        related to{" "}

                        <strong>
                          {repositoryTopic}
                        </strong>{" "}
                        in the SIRC Research Repository.

                      </p>

                    </div>

                  </div>


                  <div className="repository-notice">

                    <div className="repository-notice-icon">
                      📚
                    </div>

                    <div>

                      <strong>
                        These resources are available in the SIRC Library.
                      </strong>

                      <p>
                        If you would like to access these
                        resources, please contact SIRC Library
                        at{" "}

                        <a
                          href="mailto:library@superior.edu.pk"
                        >
                          library@superior.edu.pk
                        </a>

                      </p>

                    </div>

                  </div>


                  <div className="repository-resource-list">


                    {repositoryResources.map(
                      (resource, resourceIndex) => (

                        <div
                          className="repository-resource"
                          key={
                            resource.id ||
                            resourceIndex
                          }
                        >

                          <div className="resource-number">
                            {resourceIndex + 1}
                          </div>


                          <div className="resource-content">

                            <h4>

                              {resource.title ||
                                "Untitled Resource"}

                            </h4>


                            {resource.authors && (

                              <p className="resource-authors">

                                <strong>
                                  Author:
                                </strong>{" "}

                                {Array.isArray(
                                  resource.authors
                                )
                                  ? resource.authors.join(
                                      ", "
                                    )
                                  : resource.authors}

                              </p>

                            )}


                            {resource.publisher && (

                              <p className="resource-meta">

                                <strong>
                                  Publisher:
                                </strong>{" "}

                                {resource.publisher}

                              </p>

                            )}


                            {resource.year && (

                              <p className="resource-meta">

                                <strong>
                                  Year:
                                </strong>{" "}

                                {resource.year}

                              </p>

                            )}

                          </div>


                          <div className="resource-badge">

                            SIRC Library

                          </div>

                        </div>

                      )
                    )}

                  </div>


                  <div className="repository-footer">

                    <span>
                      📖 SIRC Research Repository
                    </span>

                    <span>
                      Need access?{" "}
                      <a
                        href="mailto:library@superior.edu.pk"
                      >
                        library@superior.edu.pk
                      </a>
                    </span>

                  </div>

                </div>

              )}


            {!repositoryLoading &&
              repositoryError && (

                <div className="repository-error">

                  <strong>
                    SIRC Research Repository
                  </strong>

                  <p>
                    Repository search could not be
                    completed at the moment.
                  </p>

                </div>

              )}


            <div ref={messagesEndRef} />

          </section>

        )}


        {/* =================================================
            DOCUMENT ACTIONS
        ================================================= */}

        {selectedFile &&
          !loading && (

            <div className="document-actions">


              <div className="document-actions-header">

                <div className="document-info">

                  <strong>
                    📄{" "}
                    {selectedFile.name}
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
                >
                  ×
                </button>

              </div>


              <div className="document-action-grid">


                <button
                  onClick={() =>
                    handleDocumentAction(
                      "summarize"
                    )
                  }
                >

                  <span>
                    📝
                  </span>

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
                  onClick={() =>
                    handleDocumentAction(
                      "gap"
                    )
                  }
                >

                  <span>
                    🔎
                  </span>

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
                  onClick={() =>
                    handleDocumentAction(
                      "objectives"
                    )
                  }
                >

                  <span>
                    🎯
                  </span>

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
                  onClick={() =>
                    handleDocumentAction(
                      "methodology"
                    )
                  }
                >

                  <span>
                    🧪
                  </span>

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
                  onClick={() =>
                    handleDocumentAction(
                      "findings"
                    )
                  }
                >

                  <span>
                    📊
                  </span>

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
                  onClick={() =>
                    handleDocumentAction(
                      "questions"
                    )
                  }
                >

                  <span>
                    💡
                  </span>

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


        {/* =================================================
            CHAT INPUT
        ================================================= */}

        <section className="chat-area">


          <div className="input-wrapper">


            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
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
                  onClick={
                    handleFileClick
                  }
                  disabled={loading}
                >
                  📎
                </button>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    handleFileChange
                  }
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
                  onClick={
                    handleVoiceInput
                  }
                  disabled={
                    loading ||
                    isListening
                  }
                  className={
                    isListening
                      ? "voice-listening"
                      : ""
                  }
                >

                  {isListening
                    ? "🔴"
                    : "🎤"}

                </button>


              </div>


              <button
                type="button"
                className="send-button"
                onClick={
                  handleSend
                }
                disabled={
                  loading ||
                  (!message.trim() &&
                    !selectedFile)
                }
              >

                {loading
                  ? "..."
                  : "➤"}

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


      {/* =================================================
          ABOUT MODAL
      ================================================= */}

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
              className="about-close"
              onClick={() =>
                setShowAbout(false)
              }
            >
              ×
            </button>


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


            <div className="about-stats">

              <div className="about-stat">
                <strong>
                  12
                </strong>
                <span>
                  Team Members
                </span>
              </div>

              <div className="about-stat">
                <strong>
                  1
                </strong>
                <span>
                  Central Library
                </span>
              </div>

              <div className="about-stat">
                <strong>
                  24/7
                </strong>
                <span>
                  Research Support
                </span>
              </div>

              <div className="about-stat">
                <strong>
                  AI
                </strong>
                <span>
                  Research Innovation
                </span>
              </div>

            </div>


            <section className="about-section">

              <div className="section-heading">

                <span>
                  01
                </span>

                <div>

                  <h2>
                    Who We Are
                  </h2>

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
                  throughout their academic research journey.

                </p>


                <div className="copilot-features">

                  <span>
                    Research Topics
                  </span>

                  <span>
                    Research Questions
                  </span>

                  <span>
                    Keywords & Synonyms
                  </span>

                  <span>
                    Boolean Search
                  </span>

                  <span>
                    Database Guidance
                  </span>

                  <span>
                    Citation Help
                  </span>

                  <span>
                    PDF Analysis
                  </span>

                  <span>
                    Research Gap
                  </span>

                  <span>
                    Methodology
                  </span>

                  <span>
                    Key Findings
                  </span>

                </div>

              </div>

            </section>


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