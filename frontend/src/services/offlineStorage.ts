// Offline storage service for AgriSense PWA

const STORAGE_KEYS = {
  WEATHER: 'agrisense_cached_weather',
  MANDI: 'agrisense_cached_mandi',
  DISEASE_SCANS: 'agrisense_cached_scans',
  CONVERSATIONS: 'agrisense_cached_conversations',
  PROFILE: 'agrisense_cached_profile',
  ADVISORY: 'agrisense_cached_advisories',
  TIMESTAMPS: 'agrisense_cache_timestamps'
};

interface CacheMeta {
  updatedAt: string;
}

export const offlineStorage = {
  saveWeather(data: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(data));
      this.setTimestamp('weather');
    } catch (e) {
      console.warn('Failed to cache weather data', e);
    }
  },

  getWeather(): { data: any; updatedAt: string | null } {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.WEATHER);
      const timestamp = this.getTimestamp('weather');
      return {
        data: dataStr ? JSON.parse(dataStr) : null,
        updatedAt: timestamp
      };
    } catch (e) {
      return { data: null, updatedAt: null };
    }
  },

  saveMandi(data: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MANDI, JSON.stringify(data));
      this.setTimestamp('mandi');
    } catch (e) {
      console.warn('Failed to cache mandi data', e);
    }
  },

  getMandi(): { data: any; updatedAt: string | null } {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.MANDI);
      const timestamp = this.getTimestamp('mandi');
      return {
        data: dataStr ? JSON.parse(dataStr) : null,
        updatedAt: timestamp
      };
    } catch (e) {
      return { data: null, updatedAt: null };
    }
  },

  saveDiseaseScans(scans: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISEASE_SCANS, JSON.stringify(scans));
      this.setTimestamp('disease_scans');
    } catch (e) {
      console.warn('Failed to cache disease scans', e);
    }
  },

  getDiseaseScans(): { data: any[]; updatedAt: string | null } {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.DISEASE_SCANS);
      const timestamp = this.getTimestamp('disease_scans');
      return {
        data: dataStr ? JSON.parse(dataStr) : [],
        updatedAt: timestamp
      };
    } catch (e) {
      return { data: [], updatedAt: null };
    }
  },

  saveConversations(conversations: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
      this.setTimestamp('conversations');
    } catch (e) {
      console.warn('Failed to cache conversations', e);
    }
  },

  getConversations(): { data: any[]; updatedAt: string | null } {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const timestamp = this.getTimestamp('conversations');
      return {
        data: dataStr ? JSON.parse(dataStr) : [],
        updatedAt: timestamp
      };
    } catch (e) {
      return { data: [], updatedAt: null };
    }
  },

  saveConversationDetail(conversationId: string, detail: any): void {
    try {
      const key = `agrisense_cached_conv_${conversationId}`;
      localStorage.setItem(key, JSON.stringify(detail));
    } catch (e) {
      console.warn(`Failed to cache conversation ${conversationId}`, e);
    }
  },

  getConversationDetail(conversationId: string): any | null {
    try {
      const key = `agrisense_cached_conv_${conversationId}`;
      const dataStr = localStorage.getItem(key);
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (e) {
      return null;
    }
  },

  saveProfile(profile: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      this.setTimestamp('profile');
    } catch (e) {
      console.warn('Failed to cache profile', e);
    }
  },

  getProfile(): { data: any; updatedAt: string | null } {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const timestamp = this.getTimestamp('profile');
      return {
        data: dataStr ? JSON.parse(dataStr) : null,
        updatedAt: timestamp
      };
    } catch (e) {
      return { data: null, updatedAt: null };
    }
  },

  setTimestamp(featureKey: string): void {
    try {
      const timestampsStr = localStorage.getItem(STORAGE_KEYS.TIMESTAMPS);
      const timestamps = timestampsStr ? JSON.parse(timestampsStr) : {};
      timestamps[featureKey] = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.TIMESTAMPS, JSON.stringify(timestamps));
    } catch (e) {}
  },

  getTimestamp(featureKey: string): string | null {
    try {
      const timestampsStr = localStorage.getItem(STORAGE_KEYS.TIMESTAMPS);
      if (!timestampsStr) return null;
      const timestamps = JSON.parse(timestampsStr);
      return timestamps[featureKey] || null;
    } catch (e) {
      return null;
    }
  }
};
