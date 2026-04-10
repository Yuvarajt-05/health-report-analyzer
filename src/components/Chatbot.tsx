// src/components/Chatbot.tsx
import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Bot, User, FileText, Upload } from "lucide-react";
import { ChatMessage, ReportContext } from "../types/health";
import { getChatbotResponse, getReportAnswer } from "../utils/chatbot";
import {
  generateSessionId,
  getOrCreateChatSession,
  saveChatMessage,
} from "../utils/api";
import {
  uploadAndAnalyzeReport,
  loadReportContext,
} from "../utils/reportUpload";

interface ChatbotProps {
  onNavigate: (page: "home" | "chatbot" | "analyzer") => void;
}

export const Chatbot = ({ onNavigate }: ChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      message:
        "Hi, I’m your AI Health Assistant. Tell me your symptoms for simple guidance. You can also upload a medical report here and then ask questions about your report.",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [reportContext, setReportContext] = useState<ReportContext | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const ctx = loadReportContext();
    if (ctx) setReportContext(ctx);
  }, []);

  const pushMessage = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const currentInput = inputMessage;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: currentInput,
      timestamp: new Date(),
    };

    pushMessage(userMsg);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(async () => {
      let reply = getChatbotResponse(currentInput);
      const reportReply = getReportAnswer(currentInput, reportContext);
      if (reportReply) reply = reportReply;

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        message: reply,
        timestamp: new Date(),
      };

      pushMessage(botMsg);
      setIsTyping(false);

      try {
        const sessionId = generateSessionId();
        const session = await getOrCreateChatSession(sessionId);
        const chatSessionId = session?.id;

        if (chatSessionId) {
          await saveChatMessage({
            chat_session_id: chatSessionId,
            session_id: sessionId,
            message: currentInput,
            response: reply,
            message_type: "user",
          });
        }
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsUploading(true);
    pushMessage({
      id: Date.now().toString(),
      type: "bot",
      message: `Uploading and analyzing your report: ${file.name}...`,
      timestamp: new Date(),
    });

    try {
      const ctx = await uploadAndAnalyzeReport(file);
      setReportContext(ctx);
      pushMessage({
        id: (Date.now() + 1).toString(),
        type: "bot",
        message: `Report uploaded successfully. Overall status: ${ctx.analysis.overallStatus}. You can now ask things like "What is my report result?" or "Is my sugar level high?".`,
        timestamp: new Date(),
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      pushMessage({
        id: (Date.now() + 2).toString(),
        type: "bot",
        message:
          "Sorry, there was a problem analyzing your report. Please try another file or try again later.",
        timestamp: new Date(),
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 flex items-center space-x-3">
            <button
              onClick={() => onNavigate("home")}
              className="hover:bg-white/20 p-1.5 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Bot className="w-7 h-7" />
            <div className="leading-tight">
              <h2 className="text-xl font-bold">AI Health Assistant</h2>
              <p className="text-xs text-blue-100">
                Chat about your symptoms, upload a medical report, and ask questions
                about your report. For detailed cards view, use the button below.
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    msg.type === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                      msg.type === "user" ? "bg-blue-600 ml-2" : "bg-gray-200 mr-2"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p className="text-[10px] mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 mr-2">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="rounded-2xl px-3 py-2 bg-gray-100">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Upload + detailed view buttons */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 rounded-full hover:bg-cyan-100 disabled:bg-gray-200 disabled:text-gray-500 transition"
              >
                <Upload className="w-4 h-4 mr-1" />
                {isUploading ? "Analyzing..." : "Upload Medical Report"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </div>

            <button
              onClick={() => onNavigate("analyzer")}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition"
            >
              <FileText className="w-4 h-4 mr-1" />
              View detailed report analysis
            </button>
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  reportContext
                    ? 'Ask about symptoms or your report (e.g., "What is my report result?")...'
                    : "Type your symptoms (e.g., 'fever and cough')..."
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              Press Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
