"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  Copy,
  RefreshCw,
  Clock,
  Download,
  User,
  Sparkles,
  Mic,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  RotateCcw,
  Settings,
} from "lucide-react";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: number;
  attachments?: string[];
  isRead: boolean;
}

interface AIAnalysis {
  summary: string[];
  phishingRisk: "Low" | "Medium" | "High";
  suggestions: string[];
}

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [inbox, setInbox] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [ttl, setTtl] = useState<"10m" | "1h" | "24h">("1h");
  const [showHelp, setShowHelp] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [previousInbox, setPreviousInbox] = useState<Email[]>([]);
  const [avatar, setAvatar] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    generateEmail();
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleVoiceCommand(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          toast.error(language === "hi" ? "आवाज़ समझ नहीं आई" : "Voice not understood");
        };
      }
    }

    // Simulate receiving emails
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && email) {
        receiveNewEmail();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [email, language]);

  const generateEmail = () => {
    const randomString = Math.random().toString(36).substring(2, 12);
    const domains = ["tempmail.com", "quickmail.net", "instant.email"];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const newEmail = `${randomString}@${domain}`;
    setEmail(newEmail);
    setUsername(randomString);
    toast.success(language === "hi" ? "नया ईमेल बना!" : "New email generated!");
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success(language === "hi" ? "ईमेल कॉपी हो गया!" : "Email copied!");
  };

  const rotateEmail = () => {
    setPreviousInbox([...inbox]);
    setInbox([]);
    setShowUndo(true);
    generateEmail();
    setTimeout(() => setShowUndo(false), 5000);
  };

  const undoRotate = () => {
    setInbox(previousInbox);
    setShowUndo(false);
    toast.success(language === "hi" ? "पुराने ईमेल वापस आ गए!" : "Emails restored!");
  };

  const receiveNewEmail = () => {
    const senders = ["amazon@shop.com", "netflix@stream.com", "github@dev.com", "support@service.com"];
    const subjects = [
      "Your order has been shipped",
      "Password reset request",
      "Weekly newsletter",
      "Important security update",
      "New message from team",
    ];

    const newEmail: Email = {
      id: Math.random().toString(36).substring(2, 15),
      from: senders[Math.floor(Math.random() * senders.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      body: `This is a demo email body. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      timestamp: Date.now(),
      attachments: Math.random() > 0.7 ? ["document.pdf", "image.png"] : undefined,
      isRead: false,
    };

    setInbox((prev) => [newEmail, ...prev]);
    toast.success(language === "hi" ? "नया ईमेल आया!" : "New email received!", {
      icon: "📧",
    });
  };

  const analyzeEmail = (email: Email): AIAnalysis => {
    const suspiciousWords = ["urgent", "click now", "verify account", "suspended", "password reset"];
    const bodySuspicious = suspiciousWords.some(word =>
      email.body.toLowerCase().includes(word) || email.subject.toLowerCase().includes(word)
    );

    const phishingRisk = bodySuspicious ? "High" : email.from.includes("@") ? "Low" : "Medium";

    return {
      summary: [
        language === "hi" ? `भेजने वाला: ${email.from}` : `From: ${email.from}`,
        language === "hi" ? `विषय: ${email.subject}` : `Subject: ${email.subject}`,
        language === "hi"
          ? `${email.attachments ? email.attachments.length + " अटैचमेंट हैं" : "कोई अटैचमेंट नहीं"}`
          : `${email.attachments ? email.attachments.length + " attachments" : "No attachments"}`,
      ],
      phishingRisk,
      suggestions: [
        language === "hi" ? "ईमेल को ध्यान से पढ़ें" : "Read email carefully",
        language === "hi" ? "लिंक पर क्लिक करने से पहले सोचें" : "Think before clicking links",
        phishingRisk === "High"
          ? (language === "hi" ? "यह ईमेल खतरनाक हो सकता है!" : "This email might be dangerous!")
          : (language === "hi" ? "ईमेल सुरक्षित लगता है" : "Email looks safe"),
      ],
    };
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setInbox(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e));
    const analysis = analyzeEmail(email);
    setAiAnalysis(analysis);
  };

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast.error(language === "hi" ? "आवाज़ का सपोर्ट नहीं है" : "Voice not supported");
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes("new email") || lowerCommand.includes("नया ईमेल")) {
      generateEmail();
      speak(language === "hi" ? "नया ईमेल बन गया" : "New email generated");
    } else if (lowerCommand.includes("copy") || lowerCommand.includes("कॉपी")) {
      copyEmail();
      speak(language === "hi" ? "ईमेल कॉपी हो गया" : "Email copied");
    } else if (lowerCommand.includes("rotate") || lowerCommand.includes("रोटेट")) {
      rotateEmail();
      speak(language === "hi" ? "ईमेल बदल दिया" : "Email rotated");
    } else {
      speak(language === "hi" ? "समझ नहीं आया" : "Command not understood");
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const getTTLMs = () => {
    switch (ttl) {
      case "10m": return 10 * 60 * 1000;
      case "1h": return 60 * 60 * 1000;
      case "24h": return 24 * 60 * 60 * 1000;
    }
  };

  const getTimeRemaining = () => {
    const ttlMs = getTTLMs();
    const elapsed = Date.now() - (inbox[0]?.timestamp || Date.now());
    const remaining = Math.max(0, ttlMs - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const texts = {
    en: {
      title: "InstantTempMail",
      subtitle: "Generate temporary email instantly",
      currentEmail: "Current Email",
      inbox: "Inbox",
      noEmails: "No emails yet",
      ttl: "Expires in",
      rotate: "Rotate Email",
      undo: "Undo",
      aiHelper: "AI Helper",
      summary: "Summary",
      risk: "Phishing Risk",
      suggestions: "Suggestions",
      helpTitle: "How to Use",
      help1: "Click 'New Email' to generate",
      help2: "Copy email and use anywhere",
      help3: "Check inbox for new messages",
      help4: "Use AI helper for analysis",
      help5: "Voice commands available",
    },
    hi: {
      title: "InstantTempMail",
      subtitle: "तुरंत टेम्पररी ईमेल बनाएं",
      currentEmail: "मौजूदा ईमेल",
      inbox: "इनबॉक्स",
      noEmails: "अभी कोई ईमेल नहीं",
      ttl: "समाप्ति",
      rotate: "ईमेल बदलें",
      undo: "वापस लाएं",
      aiHelper: "AI सहायक",
      summary: "सारांश",
      risk: "खतरा",
      suggestions: "सुझाव",
      helpTitle: "कैसे यूज़ करें",
      help1: "'नया ईमेल' पर क्लिक करें",
      help2: "ईमेल कॉपी करें और कहीं भी यूज़ करें",
      help3: "नए मैसेज के लिए इनबॉक्स चेक करें",
      help4: "AI हेल्पर से एनालिसिस करें",
      help5: "वॉयस कमांड उपलब्ध हैं",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Mail className="w-12 h-12" />
          {t.title}
        </h1>
        <p className="text-white/80 text-lg">{t.subtitle}</p>
      </motion.header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Email Generator & Settings */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Email Display Card */}
          <div className="glass-card rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold gradient-text">{t.currentEmail}</h2>
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="px-3 py-1 bg-primary/20 rounded-full text-sm font-medium text-primary"
              >
                {language === "en" ? "हिंदी" : "English"}
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{username}</p>
                <p className="text-xs text-gray-400">{email.split("@")[1]}</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <code className="text-sm font-mono text-gray-700 break-all">{email}</code>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyEmail}
                className="btn-primary text-white px-4 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={generateEmail}
                className="btn-accent text-white px-4 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                New
              </button>
            </div>

            {/* TTL Settings */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{t.ttl}</span>
                <span className="text-sm font-bold text-primary">{getTimeRemaining()}</span>
              </div>
              <div className="flex gap-2">
                {(["10m", "1h", "24h"] as const).map((time) => (
                  <button
                    key={time}
                    onClick={() => setTtl(time)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      ttl === time
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotate Email */}
            <button
              onClick={rotateEmail}
              className="w-full mt-4 bg-red-500 text-white px-4 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-600 transition shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
              {t.rotate}
            </button>

            {/* Undo Button */}
            <AnimatePresence>
              {showUndo && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={undoRotate}
                  className="w-full mt-2 bg-gray-600 text-white px-4 py-2 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.undo}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Voice Controls */}
          <div className="glass-card rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold gradient-text mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Voice Assistant
            </h3>
            <div className="flex gap-3">
              <button
                onClick={startVoiceInput}
                disabled={isListening}
                className={`flex-1 px-4 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 ${
                  isListening
                    ? "bg-red-500 text-white pulse-animation"
                    : "bg-primary text-white hover:bg-primary/90"
                } transition shadow-lg`}
              >
                <Mic className="w-4 h-4" />
                {isListening ? "Listening..." : "Speak"}
              </button>
              <button
                onClick={() => speak(language === "hi" ? "नमस्ते! मैं आपकी मदद के लिए यहां हूं" : "Hello! I'm here to help you")}
                disabled={isSpeaking}
                className="flex-1 px-4 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent/90 transition shadow-lg"
              >
                <Volume2 className="w-4 h-4" />
                {isSpeaking ? "Speaking..." : "Help"}
              </button>
            </div>
          </div>

          {/* Help Bubble */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="glass-card rounded-3xl p-6 shadow-2xl relative"
              >
                <button
                  onClick={() => setShowHelp(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <h3 className="text-lg font-bold gradient-text mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  {t.helpTitle}
                </h3>
                <ul className="space-y-3">
                  {[t.help1, t.help2, t.help3, t.help4, t.help5].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Middle: Inbox */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-2"
        >
          <div className="glass-card rounded-3xl p-6 shadow-2xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
                <Mail className="w-6 h-6" />
                {t.inbox} ({inbox.length})
              </h2>
              <button
                onClick={receiveNewEmail}
                className="px-4 py-2 bg-primary/20 text-primary rounded-xl font-medium hover:bg-primary/30 transition"
              >
                + Test Email
              </button>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Mail className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t.noEmails}</p>
                  <p className="text-sm">Waiting for new messages...</p>
                </div>
              ) : (
                inbox.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`email-card bg-white rounded-2xl p-4 border-2 ${
                      selectedEmail?.id === email.id
                        ? "border-primary"
                        : email.isRead
                        ? "border-gray-200"
                        : "border-accent"
                    }`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                        {email.from.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 truncate">{email.from}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(email.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p
                          className={`text-sm mb-1 truncate ${
                            email.isRead ? "text-gray-600" : "text-gray-800 font-medium"
                          }`}
                        >
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{email.body.substring(0, 50)}...</p>
                        {email.attachments && (
                          <div className="flex items-center gap-1 mt-2">
                            <Download className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {email.attachments.length} attachments
                            </span>
                          </div>
                        )}
                      </div>
                      {!email.isRead && (
                        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Detail Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedEmail.subject}</h3>
                    <p className="text-sm text-gray-600">From: {selectedEmail.from}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">{selectedEmail.body}</p>
              </div>

              {selectedEmail.attachments && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Attachments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {att}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {aiAnalysis && (
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6">
                  <h4 className="text-lg font-bold gradient-text mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t.aiHelper}
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">{t.summary}</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {aiAnalysis.summary.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        {t.risk}
                        {aiAnalysis.phishingRisk === "High" && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {aiAnalysis.phishingRisk === "Medium" && (
                          <Info className="w-4 h-4 text-yellow-500" />
                        )}
                        {aiAnalysis.phishingRisk === "Low" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </h5>
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                          aiAnalysis.phishingRisk === "High"
                            ? "bg-red-100 text-red-700"
                            : aiAnalysis.phishingRisk === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {aiAnalysis.phishingRisk}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">{t.suggestions}</h5>
                      <ul className="space-y-2">
                        {aiAnalysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => speak(aiAnalysis.summary.join(". "))}
                      className="w-full mt-4 btn-accent text-white px-4 py-3 rounded-2xl font-medium flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Read Summary Aloud
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
