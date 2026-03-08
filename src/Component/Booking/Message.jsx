import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Home/Navbar/Navbar";
import { FaArrowLeft, FaPaperPlane, FaUserCircle, FaHeadset } from "react-icons/fa";
import { useLanguage } from "../../LanguageContext";

const Message = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [messages, setMessages] = useState([
        { id: 1, text: t('msg_hello'), sender: "admin", time: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: newMessage.trim(),
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage("");
        setIsTyping(true);

        setTimeout(() => {
            const adminMsg = {
                id: Date.now() + 1,
                text: t('msg_auto_reply'),
                sender: "admin",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, adminMsg]);
            setIsTyping(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col pt-60 w-full h-[calc(100vh-80px)]">
                <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 sticky z-10 shadow-sm">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <FaArrowLeft />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 relative pb-24 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 items-end ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className="shrink-0 mb-1">
                                    {msg.sender === 'user' ? (
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200">
                                            <FaUserCircle />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                                            <FaHeadset className="text-xs" />
                                        </div>
                                    )}
                                </div>
                                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed max-w-full break-words ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 px-1 opacity-80 select-none">{msg.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex w-full justify-start">
                            <div className="flex max-w-[80%] gap-2">
                                <div className="shrink-0 mt-auto">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <FaHeadset className="text-xs" />
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <form onSubmit={handleSend} className="relative w-full flex items-end gap-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder={t('msg_type_placeholder')}
                            className="w-full bg-slate-50 !p-4 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none max-h-32 min-h-[52px] scrollbar-hide text-sm leading-relaxed"
                            style={{ height: '52px' }}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 shrink-0 mb-[1px]"
                        >
                            <FaPaperPlane className="text-sm" />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400 font-medium">
                            {t('msg_support_reply')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
