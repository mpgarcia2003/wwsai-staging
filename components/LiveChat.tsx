
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ChevronDown } from 'lucide-react';
import { saveMessage } from '../utils/storage';

const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<{ id: number; text: string; sender: 'agent' | 'user'; time: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Welcome Message
  useEffect(() => {
    const timer = setTimeout(() => {
        setHasUnread(true);
        // Play notification sound if allowed (omitted to avoid autoplay restrictions)
    }, 5000); // 5 seconds delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      if (isOpen) {
          setHasUnread(false);
          if (messages.length === 0) {
              setMessages([
                  { 
                      id: 1, 
                      text: "👋 Hi there! Welcome to World Wide Shades. How can we help you design your perfect window treatments today?", 
                      sender: 'agent', 
                      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  }
              ]);
          }
      }
  }, [isOpen]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const newUserMsg = {
          id: Date.now(),
          text: inputValue,
          sender: 'user' as const,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      setMessages(prev => [...prev, newUserMsg]);
      
      // Save message to Admin Inbox
      saveMessage({
          type: 'chat',
          name: 'Online Visitor',
          email: 'visitor@session',
          content: inputValue
      });

      setInputValue('');
      setIsTyping(true);

      // Simulated Response
      setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
              id: Date.now() + 1,
              text: "Thanks for reaching out! A design consultant will be with you shortly (typically < 2 mins).",
              sender: 'agent',
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }]);
      }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`bg-white w-[350px] sm:w-[380px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto transition-all duration-300 origin-bottom-right ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none h-0'
        }`}
      >
         {/* Header */}
         <div className="bg-slate-900 p-4 text-white flex justify-between items-start">
             <div className="flex gap-3 items-center">
                 <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white text-sm font-bold">
                        WS
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                 </div>
                 <div>
                     <h3 className="font-bold text-sm">WWS Design Team</h3>
                     <p className="text-xs text-slate-300">Typically replies in 2m</p>
                 </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                 <ChevronDown size={20} />
             </button>
         </div>

         {/* Messages Area */}
         <div className="h-[350px] bg-gray-50 overflow-y-auto p-4 space-y-4">
             <div className="text-center text-xs text-gray-400 my-4">Today</div>
             
             {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                     {msg.sender === 'agent' && (
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] mr-2 shrink-0">
                             <User size={12} />
                         </div>
                     )}
                     <div 
                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-700 rounded-bl-none border border-gray-100'
                        }`}
                     >
                         {msg.text}
                     </div>
                 </div>
             ))}

             {isTyping && (
                 <div className="flex justify-start">
                     <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 flex gap-1">
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                         <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                     </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
             <input 
                type="text" 
                placeholder="Send a message..." 
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
             />
             <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 hover:bg-indigo-700 transition-colors"
             >
                 <Send size={16} className="ml-0.5" />
             </button>
         </form>
         
         <div className="bg-white pb-2 text-center">
             <a href="#" className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors font-medium">Powered by LiveChat</a>
         </div>
      </div>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 pointer-events-auto ${
            isOpen ? 'bg-white text-slate-800 rotate-90' : 'bg-indigo-600 text-white hover:scale-110'
        }`}
      >
         {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
         
         {/* Unread Badge */}
         {!isOpen && hasUnread && (
             <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
         )}

         {/* Tooltip (Only if closed and has unread) */}
         {!isOpen && hasUnread && (
             <div className="absolute right-full mr-4 bg-white text-slate-800 px-4 py-2 rounded-lg shadow-lg text-sm font-bold whitespace-nowrap animate-in slide-in-from-right-4 fade-in">
                 👋 Hi there!
                 <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white transform -translate-y-1/2 rotate-45"></div>
             </div>
         )}
      </button>
    </div>
  );
};

export default LiveChat;
