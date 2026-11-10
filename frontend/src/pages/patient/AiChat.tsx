import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Send, Sparkles, Clock, Trash2, Paperclip, ChevronRight, Mic, Loader2 } from 'lucide-react';
import { cn } from '../../components/ui/Button';
import { TypingEffect } from '../../components/ui/TypingEffect';
import api from '../../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: React.ReactNode;
  timestamp: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load history
    api.get('/patient/chat/history').then(res => {
      const historyItems = res.data.data || [];
      const loadedMessages: Message[] = [];
      historyItems.forEach((item: any) => {
        const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        loadedMessages.push({ id: item.id + '-user', sender: 'user', text: item.userMessage, timestamp: timeStr });
        loadedMessages.push({ id: item.id + '-ai', sender: 'ai', text: item.aiResponse, timestamp: timeStr });
      });
      setMessages(loadedMessages);
    }).catch(err => {
      console.error("Failed to load history", err);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/patient/chat', { message: text });
      const aiResponse = res.data.data.aiResponse;
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting to the medical AI agent right now. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Voice input: record, transcribe with Whisper, drop the text into the box ──
  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const sendForTranscription = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');
      const res = await api.post('/patient/chat/voice', form);
      const text = res.data.data?.text || '';
      if (text) setInput(prev => (prev ? `${prev} ${text}` : text));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Could not transcribe that recording. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Your browser does not support microphone recording.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stopStream();
        if (blob.size > 0) sendForTranscription(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert('Microphone access was blocked. Please allow it in your browser settings.');
      stopStream();
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const toggleRecording = () => (recording ? stopRecording() : startRecording());

  const suggestions = [
    "What is my latest glucose level?",
    "Do I have any flagged anomalies?",
    "Summarise my health from the last 3 months",
    "Is my hemoglobin improving over time?"
  ];

  return (
    <div className="w-full flex h-[calc(100vh-68px)] max-h-[900px] border-t border-border">
      
      {/* LEFT: History */}
      <div className="hidden md:flex w-[280px] bg-background border-r border-border flex-col">
        <div className="p-6 flex items-center justify-between border-b border-border">
           <h3 className="text-[18px] font-semibold text-text-black tracking-tight">Conversations</h3>
           <button onClick={() => setMessages([])} className="w-8 h-8 rounded-full bg-white border border-border text-text-black flex items-center justify-center hover:bg-black/5 transition-colors">+</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           <div className="p-3 bg-white rounded-card shadow-sm border border-primary/20 cursor-pointer">
             <span className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1 block">Current Session</span>
             <p className="text-[13px] text-text-black font-medium truncate">Medical Q&A</p>
           </div>
        </div>
        
        <div className="p-4 border-t border-border bg-white">
           <p className="text-[12px] text-text-muted text-center flex items-center justify-center gap-2 font-medium"><Sparkles className="w-4 h-4 text-primary"/> Powered by Medical AI</p>
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
        
        {/* Topbar */}
        <div className="h-[72px] bg-white border-b border-border px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Leaf className="w-5 h-5 text-primary"/></div>
             <div>
               <h2 className="font-semibold text-[16px] text-text-black flex items-center gap-2">MediSage AI Clinical Agent <span className="w-2 h-2 rounded-full bg-primary" /></h2>
               <p className="text-[13px] text-text-muted">Analyzing your uploaded records securely</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-text-mid transition-colors"><Clock className="w-5 h-5"/></button>
             <button onClick={() => setMessages([])} className="w-10 h-10 rounded-full hover:bg-danger/10 text-danger flex items-center justify-center transition-colors"><Trash2 className="w-5 h-5"/></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center">
           {messages.length === 0 ? (
             <div className="m-auto max-w-[560px] w-full flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Leaf className="w-8 h-8 text-primary"/>
                </div>
                <h2 className="text-[28px] font-semibold mb-2 text-text-black tracking-tight">What would you like to know?</h2>
                <p className="text-text-mid text-[15px] mb-12">I have secure access to all your connected medical records.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                   {suggestions.map((s, i) => (
                     <motion.button 
                       key={i}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 * i }}
                       onClick={() => handleSend(s)}
                       className="p-4 bg-white border border-border rounded-xl text-left hover:border-primary hover:shadow-sm transition-all group"
                     >
                       <p className="text-[14px] font-medium text-text-mid group-hover:text-primary transition-colors pr-6 relative">
                         {s}
                         <ChevronRight className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"/>
                       </p>
                     </motion.button>
                   ))}
                </div>
             </div>
           ) : (
             <div className="w-full max-w-[760px] flex flex-col gap-6">
               {messages.map((msg, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   className={cn("flex max-w-[85%]", msg.sender === 'user' ? "self-end flex-row-reverse" : "self-start")}
                 >
                   {msg.sender === 'ai' && (
                     <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 flex items-center justify-center mr-3 font-semibold text-primary text-[14px] border border-primary/20 mt-1">AI</div>
                   )}
                   <div className="flex flex-col gap-1">
                     <div className={cn(
                       "p-4 rounded-xl shadow-sm text-[14px] leading-relaxed",
                       msg.sender === 'user' ? "bg-primary text-white" : "bg-background border border-border text-text-black"
                     )}>
                       {msg.sender === 'ai' && typeof msg.text === 'string' ? (
                         <TypingEffect text={msg.text} speed={10} />
                       ) : (
                         msg.text
                       )}
                     </div>
                     <span className={cn("text-[11px] font-mono text-text-muted", msg.sender === 'user' ? "text-right" : "text-left")}>{msg.timestamp}</span>
                   </div>
                 </motion.div>
               ))}
               
               {isTyping && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex self-start max-w-[85%] mt-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 flex items-center justify-center mr-3 font-semibold text-primary text-[14px] border border-primary/20 mt-1">AI</div>
                    <div className="p-4 rounded-xl bg-background border border-border shadow-sm flex items-center gap-1.5 h-12">
                       {[0, 1, 2].map(i => (
                         <motion.div key={i} animate={{ translateY: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className="w-2 h-2 rounded-full bg-primary/50" />
                       ))}
                    </div>
                 </motion.div>
               )}
               <div ref={bottomRef} className="h-4" />
             </div>
           )}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-6 bg-white border-t border-border shrink-0">
          {(recording || transcribing) && (
            <div className="max-w-[760px] mx-auto mb-3 flex items-center justify-center gap-2 text-[13px] font-medium">
              {recording ? (
                <span className="flex items-center gap-2 text-danger">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> Recording… tap the mic again to stop
                </span>
              ) : (
                <span className="flex items-center gap-2 text-text-mid">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Transcribing your voice…
                </span>
              )}
            </div>
          )}
          <div className="max-w-[760px] mx-auto relative flex items-end bg-background border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 rounded-xl p-2 transition-all">
             <button className="p-3 text-text-muted hover:text-text-black transition-colors rounded-full hover:bg-black/5 shrink-0"><Paperclip className="w-5 h-5"/></button>
             <button
               onClick={toggleRecording}
               disabled={transcribing || isTyping}
               title={recording ? 'Stop recording' : 'Ask by voice'}
               className={cn(
                 'p-3 rounded-full transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
                 recording ? 'bg-danger text-white hover:bg-danger/90' : 'text-text-muted hover:text-primary hover:bg-primary/10'
               )}
             >
               {transcribing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
             </button>
             <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend(input);
                 }
               }}
               placeholder="Ask anything about your health..."
               rows={1}
               className="flex-1 max-h-[120px] min-h-[44px] bg-transparent resize-none outline-none py-3 px-2 text-[14px]"
             />
             <button 
               onClick={() => handleSend(input)}
               disabled={!input.trim()}
               className="p-3 bg-primary text-white rounded-md hover:bg-primary-mid transition-colors disabled:opacity-50 disabled:bg-border disabled:text-text-muted shrink-0 ml-2"
             >
               <Send className="w-5 h-5 ml-0.5 mt-0.5" />
             </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
