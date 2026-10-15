import axios from 'axios';
import { offlineStorage } from './offlineStorage';

const API_BASE_URL = '/api';

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
  // Send query to AI Advisor RAG
  sendQuery: async (
    query: string,
    conversationId?: string,
    cropContext?: string,
    language?: 'mr' | 'en'
  ): Promise<ChatQueryResponse> => {
    if (!navigator.onLine) {
      throw new Error("Internet connection is required for a new request. (नवीन प्रश्नासाठी इंटरनेट कनेक्शन आवश्यक आहे.)");
    }
    const res = await axios.post(`${API_BASE_URL}/chat`, {
      query,
      conversation_id: conversationId,
      crop_context: cropContext,
      language
    });
    return res.data;
  },

  // Get user's conversation threads
  getConversations: async (): Promise<ConversationItem[]> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/conversations`);
      offlineStorage.saveConversations(res.data);
      return res.data;
    } catch (err) {
      console.warn("Loading conversations from offline cache due to network error:", err);
      const cached = offlineStorage.getConversations();
      return cached.data || [];
    }
  },

  // Get conversation history by ID
  getConversationDetail: async (
    id: string
  ): Promise<ConversationItem & { messages: ChatMessageItem[] }> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/conversations/${id}`);
      offlineStorage.saveConversationDetail(id, res.data);
      return res.data;
    } catch (err) {
      console.warn(`Loading conversation ${id} from offline cache:`, err);
      const cached = offlineStorage.getConversationDetail(id);
      if (cached) return cached;
      throw err;
    }
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/chat/conversations/${id}`);
  },

  // Submit feedback on message
  submitFeedback: async (messageId: string, feedback: string): Promise<void> => {
    await axios.post(`${API_BASE_URL}/chat/messages/${messageId}/feedback`, {
      feedback
    });
  },

  // Admin Knowledge APIs
  getKnowledgeDocs: async (): Promise<KnowledgeDocItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/admin/knowledge`);
    return res.data;
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
