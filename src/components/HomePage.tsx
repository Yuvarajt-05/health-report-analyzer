
import { MessageSquare, Activity } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: "home" | "chatbot" | "analyzer") => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-3">
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Medi-Bot</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            AI-powered health assistant where you can chat about symptoms and upload
            medical reports directly inside the chatbot.
          </p>
        </div>

        {/* Only Chatbot Option */}
        <div className="max-w-xl mx-auto">
          <div
            onClick={() => onNavigate("chatbot")}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-5 mx-auto">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">
              AI Health Chatbot
            </h2>
            <p className="text-sm text-gray-500 mb-3 text-center">
              Chat about your symptoms, upload medical reports, and ask questions
              about your medical report analysis 
            </p>
            <button className="w-full mt-3 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
