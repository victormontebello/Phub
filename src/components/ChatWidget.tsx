import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { faqs } from '../data/chatAssistant';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: "Olá! Sou seu assistente virtual. Como posso te ajudar hoje?",
          sender: 'bot'
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuestionClick = (question: string, answer: string) => {
    const userMessage: Message = { id: Date.now(), text: question, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = { id: Date.now() + 1, text: answer, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 dark:bg-primary-600-dark text-white p-4 rounded-full shadow-lg hover:bg-primary-700 dark:hover:bg-primary-700-dark transition-all transform hover:scale-110 focus:outline-none"
        aria-label="Abrir chat"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col font-sans border border-gray-200 dark:border-gray-700 transition-colors">
      <header className="bg-primary-600 dark:bg-primary-600-dark text-white p-4 flex justify-between items-center rounded-t-lg">
        <h3 className="font-bold text-lg">Assistente Virtual</h3>
        <button onClick={() => setIsOpen(false)} className="hover:opacity-75" aria-label="Fechar chat">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-xs ${
              msg.sender === 'user' 
                ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg px-3 py-2">
              Digitando...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Ou escolha uma das opções abaixo:</p>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, index) => (
            <button
              key={faq.question}
              onClick={() => handleQuestionClick(faq.question, faq.answer)}
              className="text-left w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              {`${index + 1}. ${faq.question}`}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default ChatWidget; 