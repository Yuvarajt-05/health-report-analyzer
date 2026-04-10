import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { Chatbot } from './components/Chatbot';
import { ReportAnalyzer } from './components/ReportAnalyzer';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'chatbot' | 'analyzer'>('home');

  useEffect(() => {
    const titles = {
      home: 'Smart Health Analyzer - AI Health Assistant',
      chatbot: 'AI Health Chatbot - Smart Health Analyzer',
      analyzer: 'Medical Report Analyzer - Smart Health Analyzer',
    };
    document.title = titles[currentPage];
  }, [currentPage]);

  return (
    <>
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'chatbot' && <Chatbot onNavigate={setCurrentPage} />}
      {currentPage === 'analyzer' && <ReportAnalyzer onNavigate={setCurrentPage} />}
    </>
  );
}

export default App;
