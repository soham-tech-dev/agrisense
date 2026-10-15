import {
  User,
  Farm,
  Crop,
  UserCrop,
  WeatherData,
  WeatherForecastResponse,
  WeatherAdvisoryResponse,
  MandiPrice,
  MarketComparisonResponse,
  MandiHistoryResponse,
  DiseaseCatalog,
  DiseasePredictResponse,
  DiseaseScan,
  DiseaseFeedbackResponse
} from '../types';

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api/v1` : '/api/v1';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('agrisense_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getAuthOnlyHeaders(): HeadersInit {
    const token = localStorage.getItem('agrisense_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }


  async checkHealth() {
    const response = await fetch('/health');
    return response.json();
  }

  async requestOtp(phone: string) {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'OTP send failed');
    }
    return response.json();
  }

  async verifyOtp(phone: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'OTP verification failed');
    }
    return response.json();
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }

  async getFarms(): Promise<Farm[]> {
    const response = await fetch(`${API_BASE_URL}/farms/me`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch farms');
    return response.json();
  }

  async createFarm(farmData: Partial<Farm>): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/farms/me`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(farmData),
    });
    if (!response.ok) throw new Error('Failed to create farm');
    return response.json();
  }

  async updateFarm(farmId: string, farmData: Partial<Farm>): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/farms/me/${farmId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(farmData),
    });
    if (!response.ok) throw new Error('Failed to update farm');
    return response.json();
  }

  async getMasterCrops(): Promise<Crop[]> {
    const response = await fetch(`${API_BASE_URL}/crops`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch master crops');
    return response.json();
  }

  async getFarmerCrops(): Promise<UserCrop[]> {
    const response = await fetch(`${API_BASE_URL}/crops/me`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch farmer crops');
    return response.json();
  }

  async addFarmerCrop(cropId: string, season: string = 'Kharif', acres: number = 1.0): Promise<UserCrop> {
    const response = await fetch(`${API_BASE_URL}/crops/me`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ crop_id: cropId, season, acres_allocated: acres }),
    });
    if (!response.ok) throw new Error('Failed to add crop');
    return response.json();
  }

  async removeFarmerCrop(userCropId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/crops/me/${userCropId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove crop');
  }

  // Weather Methods
  async getWeatherCurrent(district: string = 'Nashik'): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather/current?district=${encodeURIComponent(district)}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  }

  async getWeatherForecast(district: string = 'Nashik'): Promise<WeatherForecastResponse> {
    const response = await fetch(`${API_BASE_URL}/weather/forecast?district=${encodeURIComponent(district)}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch weather forecast');
    return response.json();
  }

  async getWeatherAdvisory(district: string = 'Nashik'): Promise<WeatherAdvisoryResponse> {
    const response = await fetch(`${API_BASE_URL}/weather/advisory?district=${encodeURIComponent(district)}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch weather advisory');
    return response.json();
  }

  // Mandi Methods
  async getMandiPrices(crop?: string, market?: string, district?: string): Promise<MandiPrice[]> {
    const params = new URLSearchParams();
    if (crop) params.append('crop', crop);
    if (market) params.append('market', market);
    if (district) params.append('district', district);
    
    const response = await fetch(`${API_BASE_URL}/mandi/prices?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mandi prices');
    return response.json();
  }

  async getMandiMarkets(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mandi/markets`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mandi markets');
    return response.json();
  }

  async getMandiCrops(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/mandi/crops`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mandi crops');
    return response.json();
  }

  async getMandiHistory(crop: string = 'Onion', market: string = 'Lasalgaon', days: number = 7): Promise<MandiHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/mandi/history?crop=${encodeURIComponent(crop)}&market=${encodeURIComponent(market)}&days=${days}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mandi history');
    return response.json();
  }

  async getMarketComparison(crop: string = 'Onion'): Promise<MarketComparisonResponse> {
    const response = await fetch(`${API_BASE_URL}/mandi/compare?crop=${encodeURIComponent(crop)}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch market comparison');
    return response.json();
  }

  // Disease Module Methods
  async getDiseaseCatalog(): Promise<DiseaseCatalog[]> {
    const response = await fetch(`${API_BASE_URL}/disease/catalog`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch disease catalog');
    return response.json();
  }

  async predictDisease(file: File, cropId?: string): Promise<DiseasePredictResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (cropId) {
      formData.append('crop_id', cropId);
    }

    const response = await fetch(`${API_BASE_URL}/disease/predict`, {
      method: 'POST',
      headers: this.getAuthOnlyHeaders(),
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Please take a clear photo of the affected leaf.');
    }
    return data;
  }

  async getDiseaseHistory(): Promise<DiseaseScan[]> {
    const response = await fetch(`${API_BASE_URL}/disease/history`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch scan history');
    return response.json();
  }

  async getDiseaseScan(id: string): Promise<DiseaseScan> {
    const response = await fetch(`${API_BASE_URL}/disease/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch scan details');
    return response.json();
  }

  async submitDiseaseFeedback(scanId: string, isAccurate: boolean, feedbackText?: string): Promise<DiseaseFeedbackResponse> {
    const response = await fetch(`${API_BASE_URL}/disease/${scanId}/feedback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_accurate: isAccurate, feedback_text: feedbackText }),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }
}

export const api = new ApiClient();


