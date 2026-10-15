import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bot, User, Send, Mic, Sparkles, AlertTriangle, ShieldCheck, 
  FileText, Plus, Trash2, BookOpen, 
  ChevronDown, ChevronUp, RefreshCw, Upload, Volume2, VolumeX,
  X, Check, CornerDownLeft, Bookmark
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { 
  chatService, 
  ChatMessageItem, 
  ConversationItem, 
  KnowledgeDocItem 
} from '../services/chatService';
import { useLanguage } from '../context/LanguageContext';
import { VoiceWidget } from '../components/advisor/VoiceWidget';
import { voiceFactory } from '../services/voice/VoiceFactory';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { FeedbackWidget } from '../components/common/FeedbackWidget';

export const AdvisorPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const isMarathi = language === 'mr';

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(conversationId);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Onion');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  // Admin Knowledge Base Modal State
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocOrg, setNewDocOrg] = useState('KVK Pune');
  const [newDocCrop, setNewDocCrop] = useState('Onion');
  const [newDocTopic, setNewDocTopic] = useState('Disease');
  const [newDocContent, setNewDocContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceProvider = voiceFactory.getProvider();

  const suggestedQuestions = [
    t('advisor.suggested1', isMarathi ? 'आज माझ्या गावात पाऊस पडेल का?' : 'Will it rain today in my village?'),
    t('advisor.suggested2', isMarathi ? 'माझ्या कांद्याच्या पानांवर जांभळे ठिपके आहेत, काय उपाय करावा?' : 'My onion leaves have purple spots and yellowing. What should I do?'),
    t('advisor.suggested3', isMarathi ? 'नाशिक APMC मध्ये आज कांद्याचा बाजार भाव काय आहे?' : "What is today's onion market price in APMC Nashik?"),
    t('advisor.suggested4', isMarathi ? 'ऊस पिकासाठी ठिबक सिंचन कसे करावे?' : 'How to manage drip irrigation for sugarcane?')
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Stop voice playback on unmount
  useEffect(() => {
    return () => {
      voiceProvider.stopSpeaking();
      voiceProvider.stopListening();
    };
  }, [voiceProvider]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Pre-fill query if passed via search param (?query=...)
  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setInputQuery(queryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setActiveConversationId(conversationId);
    if (conversationId) {
      loadConversationMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations([]);
    }
  };

  const loadConversationMessages = async (id: string) => {
    try {
      const data = await chatService.getConversationDetail(id);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    }
  };

  const loadKnowledgeDocs = async () => {
    try {
      const docs = await chatService.getKnowledgeDocs();
      setKnowledgeDocs(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error('Failed to load knowledge documents:', err);
      setKnowledgeDocs([]);
    }
  };

  const handleSend = async (queryText?: string, autoSpeakResponse: boolean = false) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    setInputQuery('');
    setShowVoiceModal(false);
    setIsLoading(true);

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessageItem = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConversationId || '',
      role: 'user',
      content: textToSend,
      language: language,
      intent: 'GENERAL_AGRICULTURE',
      sources: [],
      grounded: true,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatService.sendQuery(textToSend, activeConversationId, selectedCrop, language);
      
      if (!activeConversationId && res.conversation_id) {
        setActiveConversationId(res.conversation_id);
        navigate(`/advisor/${res.conversation_id}`, { replace: true });
        loadConversations();
      }

      const assistantMsg: ChatMessageItem = {
        id: res.message_id,
        conversation_id: res.conversation_id,
        role: 'assistant',
        content: res.answer,
        language: res.language,
        intent: res.intent,
        sources: res.sources,
        grounded: res.grounded,
        timestamp: res.timestamp
      };

      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);

      // Automatically speak answer if explicitly requested via voice flow
      if (autoSpeakResponse && res.answer) {
        speakMessage(res.message_id, res.answer, res.language);
      }
    } catch (err) {
      console.error('Error sending query:', err);
      const errorMsg: ChatMessageItem = {
        id: `err_${Date.now()}`,
        conversation_id: activeConversationId || '',
        role: 'assistant',
        content: isMarathi
          ? "क्षमस्व, सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा."
          : "Sorry, could not connect to server. Please try again in a moment.",
        language: language,
        intent: 'UNKNOWN',
        sources: [],
        grounded: false,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (msgId: string, content: string, msgLang?: 'mr' | 'en') => {
    if (playingMessageId === msgId) {
      voiceProvider.stopSpeaking();
      setPlayingMessageId(null);
      return;
    }

    voiceProvider.stopSpeaking();
    setPlayingMessageId(msgId);
    
    voiceProvider.speak(
      content,
      msgLang || language,
      () => setPlayingMessageId(null),
      () => setPlayingMessageId(null)
    );
  };

  const handleNewChat = () => {
    voiceProvider.stopSpeaking();
    setPlayingMessageId(null);
    setActiveConversationId(undefined);
    setMessages([]);
    navigate('/advisor');
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSaveToNotebook = (msg: ChatMessageItem) => {
    try {
      const existingStr = localStorage.getItem('agrisense_saved_notebook');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const newItem = {
        id: 'save-' + Date.now(),
        title: `${selectedCrop} ${isMarathi ? 'सल्ला' : 'Advisory'} (${new Date().toLocaleDateString()})`,
        content: msg.content,
        crop: selectedCrop,
        topic: msg.intent || (isMarathi ? 'सामान्य सल्ला' : 'General Advisory'),
        source: msg.grounded
          ? (isMarathi ? 'केव्हीके पडताळित कृषी सल्ला' : 'Verified KVK Advisory')
          : (isMarathi ? 'कृषी एआय सहाय्यक' : 'AI Agricultural Assistant'),
        date: new Date().toISOString().split('T')[0],
        farmerNote: ''
      };
      localStorage.setItem('agrisense_saved_notebook', JSON.stringify([newItem, ...existing]));
      showToast(
        isMarathi ? 'सल्ला वहीमध्ये जतन केला!' : 'Saved to Farmer Notebook!',
        'success'
      );
    } catch (e) {
      showToast(isMarathi ? 'जतन करताना अडचण आली' : 'Failed to save advice', 'error');
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', newDocTitle);
      formData.append('organization', newDocOrg);
      formData.append('crop', newDocCrop);
      formData.append('topic', newDocTopic);
      formData.append('language', language);
      formData.append('raw_content', newDocContent);

      await chatService.uploadKnowledgeDoc(formData);
      setNewDocTitle('');
      setNewDocContent('');
      await loadKnowledgeDocs();
    } catch (err) {
      console.error('Doc upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await chatService.deleteKnowledgeDoc(id);
      setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-7rem)] bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR - CONVERSATIONS */}
      <div className="w-72 bg-emerald-950 text-white flex flex-col justify-between hidden md:flex border-r border-emerald-900">
        <div className="p-4 border-b border-emerald-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-800 text-emerald-200 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block leading-tight text-white">
                {t('app.name', 'AgriSense')}
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">
                {t('nav.advisor', 'Advisor')}
              </span>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center shadow"
            title={t('advisor.newChat', 'New Chat')}
            aria-label={t('advisor.newChat', 'New Chat')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-3 py-1.5">
            {t('advisor.conversations', 'Past Conversations')}
          </div>
          {!Array.isArray(conversations) || conversations.length === 0 ? (
            <div className="text-xs text-emerald-300/70 px-3 py-4 text-center">
              {t('advisor.noConversations', 'No conversations yet. Ask a question!')}
            </div>
          ) : (
            (Array.isArray(conversations) ? conversations : []).map((c) => {
              const isActive = activeConversationId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/advisor/${c.id}`)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition ${
                    isActive
                      ? 'bg-emerald-800/90 text-white font-bold border border-emerald-600'
                      : 'text-emerald-100 hover:bg-emerald-900/80'
                  }`}
                >
                  <div className="truncate pr-4">{c.title}</div>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-emerald-300 hover:text-rose-300 transition"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Admin Knowledge Base Trigger Button */}
        <div className="p-3 border-t border-emerald-900/80">
          <button
            onClick={() => {
              setShowKnowledgeModal(true);
              loadKnowledgeDocs();
            }}
            className="w-full py-2 px-3 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 rounded-xl text-xs font-semibold text-emerald-200 flex items-center justify-center space-x-2 transition"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>{t('advisor.knowledgeBase', 'KVK Knowledge Base')}</span>
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        <OfflineBanner />
        
        {/* TOP BAR */}
        <div className="h-16 px-4 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{t('advisor.title', 'AgriSense Agricultural Advisor')}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                  KVK / ICAR
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t('advisor.subTitle', 'Grounded strictly in verified KVK & ICAR documents')}
              </p>
            </div>
          </div>

          {/* Active Crop Context Selector & New Chat on Mobile */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="md:hidden p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-1"
              title={t('advisor.newChat', 'New Chat')}
            >
              <Plus className="w-4 h-4" />
            </button>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-white text-slate-800 border-2 border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 shadow-sm"
              aria-label="Filter Crop"
            >
              <option value="Onion">🧅 {isMarathi ? 'कांदा (Onion)' : 'Onion'}</option>
              <option value="Tomato">🍅 {isMarathi ? 'टोमॅटो (Tomato)' : 'Tomato'}</option>
              <option value="Sugarcane">🎋 {isMarathi ? 'ऊस (Sugarcane)' : 'Sugarcane'}</option>
              <option value="Soybean">🌱 {isMarathi ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
              <option value="All">🌾 {t('common.allCrops', 'All Crops')}</option>
            </select>
          </div>
        </div>

        {/* VOICE ASSISTANT MODAL (Accessible Farmer Overlay) */}
        {showVoiceModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md">
              <VoiceWidget
                onSpeechResult={(transcribedText) => {
                  setInputQuery(transcribedText);
                }}
                onSendImmediate={(textToSend) => {
                  handleSend(textToSend, true);
                }}
                onClose={() => setShowVoiceModal(false)}
                isProcessingQuery={isLoading}
                latestAnswerText={messages.filter((m) => m.role === 'assistant').pop()?.content}
              />
            </div>
          </div>
        )}

        {/* MESSAGES CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="max-w-xl mx-auto my-auto text-center space-y-6 pt-4">
              
              {/* Welcoming Voice Card Banner */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center">
                  <Mic className="w-8 h-8 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black">
                    {isMarathi ? 'बोलून प्रश्न विचारा (Voice AI)' : 'Ask Your Farming Question by Voice'}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
                    {isMarathi
                      ? 'मायक दाबा आणि मराठीत प्रश्न विचारा. केव्हीके नियमावलीनुसार योग्य उपाय ऐका.'
                      : 'Tap the button below and speak in Marathi or English. Verified remedies from KVK experts.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(true)}
                  className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black text-sm transition-all shadow-lg inline-flex items-center gap-2 transform active:scale-95"
                >
                  <Mic className="w-5 h-5 text-emerald-700" />
                  <span>{isMarathi ? 'मायक सुरू करा' : 'Tap to Speak Now'}</span>
                </button>
              </div>

              {/* SUGGESTED QUESTIONS CHIPS */}
              <div className="pt-2 text-left">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
                  {t('advisor.suggestedTitle', isMarathi ? 'काही विचारलेले प्रश्न:' : 'Suggested Questions:')}
                </div>
                <div className="flex flex-col gap-2">
                  {(Array.isArray(suggestedQuestions) ? suggestedQuestions : []).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q, false)}
                      className="p-3.5 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-400 rounded-2xl text-slate-800 text-xs sm:text-sm font-medium transition text-left shadow-sm flex items-center gap-2.5 group"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition" />
                      <span className="flex-1">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            (Array.isArray(messages) ? messages : []).map((msg) => {
              const isUser = msg.role === 'user';
              const isPlayingThis = playingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 max-w-3xl ${
                    isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border-2 border-emerald-600 text-emerald-700'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`rounded-3xl p-4 sm:p-5 shadow-sm text-sm space-y-3 max-w-2xl ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] tracking-wide uppercase border border-emerald-200">
                            {msg.intent}
                          </span>
                          {msg.grounded ? (
                            <span className="flex items-center text-emerald-700 text-[11px] font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              {t('common.groundedSource', 'Verified KVK Source')}
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-700 text-[11px] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              {t('common.safetyFallback', 'KVK Safety Fallback')}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    )}

                    <div className="whitespace-pre-line leading-relaxed text-sm">
                      {msg.content}
                    </div>

                    {/* SOURCE TRANSPARENCY SECTION */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-xs">
                        <div className="text-slate-600 font-semibold mb-1.5 flex items-center justify-between">
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            {t('advisor.sourcesTitle', 'Verified KVK Documents')}
                          </span>
                          <button
                            onClick={() => toggleSources(msg.id)}
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-1 rounded-lg"
                          >
                            <span>{Array.isArray(msg.sources) ? msg.sources.length : 0} {isMarathi ? 'स्रोत' : 'Sources'}</span>
                            {expandedSources[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {expandedSources[msg.id] && (
                          <div className="mt-2 space-y-2">
                            {(Array.isArray(msg.sources) ? msg.sources : []).map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{src.title}</span>
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                    {src.organization}
                                  </span>
                                </div>
                                <div className="text-slate-500 text-[11px] flex flex-wrap gap-2">
                                  <span>पिक: {src.crop}</span>
                                  <span>• विषय: {src.topic}</span>
                                  <span>• वर्ष: {src.year}</span>
                                </div>
                                {src.excerpt && (
                                  <p className="text-slate-700 italic text-[11px] bg-white p-2 rounded-lg mt-1 border border-slate-200">
                                    "{src.excerpt}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FEEDBACK CONTROLS & TTS SPEAK BUTTON */}
                    {!isUser && (
                      <div className="space-y-2 pt-2.5 border-t border-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {/* Audio Play Button */}
                          <button
                            type="button"
                            onClick={() => speakMessage(msg.id, msg.content, msg.language)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${
                              isPlayingThis
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                            }`}
                            aria-label={isPlayingThis ? 'Stop speaking answer' : 'Listen to answer aloud'}
                          >
                            {isPlayingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
                            <span>{isPlayingThis ? (isMarathi ? 'आवाज थांबवा' : 'Stop Audio') : (isMarathi ? '🔊 उत्तर ऐका' : '🔊 Play Aloud')}</span>
                          </button>

                          {/* Save to Notebook Button */}
                          <button
                            type="button"
                            onClick={() => handleSaveToNotebook(msg)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300"
                            title={isMarathi ? 'सल्ला वहीत जतन करा' : 'Save to Notebook'}
                          >
                            <Bookmark className="w-4 h-4 text-emerald-700" />
                            <span>{isMarathi ? 'नोंदवहीत जतन करा' : 'Save Advice'}</span>
                          </button>
                        </div>
                        <FeedbackWidget feature="chat" referenceId={msg.id} className="pt-1" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center space-x-3 max-w-xl">
              <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm flex items-center space-x-2 shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="font-semibold">{t('voice.status.processing', 'Searching verified KVK advisory...')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR WITH LARGE ACCESSIBLE MIC BUTTON */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto flex items-center space-x-2 sm:space-x-3">
            
            {/* LARGE MICROPHONE BUTTON */}
            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="p-3.5 sm:p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl transition shadow-md flex items-center justify-center shrink-0 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              title={isMarathi ? 'बोलून प्रश्न विचारा (मायक्रोफोन)' : 'Ask with Voice (Microphone)'}
              aria-label="Open voice recording modal"
            >
              <Mic className="w-6 h-6 animate-pulse" />
            </button>

            {/* QUERY TEXT INPUT */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(undefined, false)}
                placeholder={t('advisor.inputPlaceholder', isMarathi ? 'प्रश्न टाइप करा किंवा डावीकडील मायक दाबा...' : 'Type agricultural question or tap microphone...')}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:bg-white rounded-2xl py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleSend(undefined, false)}
                disabled={!inputQuery.trim() || isLoading}
                className="absolute right-2 top-2 p-2 text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition disabled:opacity-40 disabled:hover:bg-emerald-700 shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ADMIN KNOWLEDGE BASE MODAL */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">KVK / ICAR Knowledge Base Admin</h3>
              </div>
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="text-slate-500 hover:text-slate-800 text-sm px-3 py-1.5 bg-slate-200 rounded-xl font-bold"
              >
                {t('common.close', 'Close')}
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* UPLOAD / ADD DOCUMENT FORM */}
              <form onSubmit={handleUploadDoc} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-4">
                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-700" /> Add KVK Document to Knowledge Base
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Document Title</label>
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g., KVK Sugarcane Pest Advisory"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Organization</label>
                    <input
                      type="text"
                      value={newDocOrg}
                      onChange={(e) => setNewDocOrg(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Crop</label>
                    <input
                      type="text"
                      value={newDocCrop}
                      onChange={(e) => setNewDocCrop(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Topic</label>
                    <input
                      type="text"
                      value={newDocTopic}
                      onChange={(e) => setNewDocTopic(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1 text-xs">Document Content Text</label>
                  <textarea
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    rows={3}
                    placeholder="Paste verified KVK document content here..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUploading ? 'Indexing...' : 'Add & Index Document'}</span>
                </button>
              </form>

              {/* EXISTING DOCUMENTS LIST */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Indexed KVK Documents</h4>
                {!Array.isArray(knowledgeDocs) || knowledgeDocs.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-4">No documents found.</div>
                ) : (
                  (Array.isArray(knowledgeDocs) ? knowledgeDocs : []).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{doc.title}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            {doc.organization}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex gap-3">
                          <span>Crop: {doc.crop}</span>
                          <span>Chroma Chunks: {doc.chunk_count}</span>
                          <span>Verified: {doc.verified ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdvisorPage;
