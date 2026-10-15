import axios from 'axios';

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export interface SourceDocument {
  id: string;
  title: string;
  organization: string;
  crop: string;
  topic: string;
  language: string;
  source: string;
  year: number;
  verified: boolean;
  excerpt?: string;
}

export interface ChatMessageItem {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  language: 'mr' | 'en';
  intent: string;
  sources: SourceDocument[];
  grounded: boolean;
  feedback?: string;
  timestamp: string;
}

export interface ConversationItem {
  id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatQueryResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  language: 'mr' | 'en';
  intent: string;
  sources: SourceDocument[];
  grounded: boolean;
  timestamp: string;
}

export interface KnowledgeDocItem {
  id: string;
  title: string;
  organization: string;
  crop: string;
  topic: string;
  language: string;
  source: string;
  year: number;
  version: string;
  verified: boolean;
  chunk_count: number;
  content_summary?: string;
  uploaded_at: string;
}

export const chatService = {
  // Send query to real AI Advisor RAG backend
  sendQuery: async (
    query: string,
    conversationId?: string,
    cropContext?: string,
    language?: 'mr' | 'en'
  ): Promise<ChatQueryResponse> => {
    const res = await axios.post(`${API_BASE_URL}/chat`, {
      query,
      conversation_id: conversationId,
      crop_context: cropContext,
      language
    });
    return res.data;
  },

  // Get user's conversation threads from real DB
  getConversations: async (): Promise<ConversationItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/chat/conversations`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // Get conversation history by ID from real DB
  getConversationDetail: async (
    id: string
  ): Promise<ConversationItem & { messages: ChatMessageItem[] }> => {
    const res = await axios.get(`${API_BASE_URL}/chat/conversations/${id}`);
    return res.data;
  },

  // Delete conversation from real DB
  deleteConversation: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/chat/conversations/${id}`);
  },

  // Submit feedback on message to real DB
  submitFeedback: async (messageId: string, feedback: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/chat/messages/${messageId}/feedback`, {
      feedback
    });
  },

  // Admin Knowledge APIs (connected to ChromaDB / backend)
  getKnowledgeDocs: async (): Promise<KnowledgeDocItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/admin/knowledge`);
    return Array.isArray(res.data) ? res.data : [];
  },

  uploadKnowledgeDoc: async (formData: FormData): Promise<KnowledgeDocItem> => {
    const res = await axios.post(`${API_BASE_URL}/admin/knowledge`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  deleteKnowledgeDoc: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/knowledge/${id}`);
  },

  reindexKnowledgeDoc: async (id: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/admin/knowledge/${id}/index`);
  }
};
