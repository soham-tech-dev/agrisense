export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  village?: string;
  taluka?: string;
  district?: string;
  language: 'mr' | 'en';
  role?: string;
  voice_enabled: boolean;
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  land_size: number;
  ownership_type: 'owned' | 'leased' | 'sharecropped';
  location?: string;
  created_at: string;
}

export interface Crop {
  id: string;
  name_en: string;
  name_mr: string;
  category?: string;
  is_active: boolean;
}

export interface UserCrop {
  id: string;
  user_id: string;
  crop_id: string;
  season?: string;
  acres_allocated?: number;
  crop: Crop;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  condition: string;
  condition_code?: string;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
  district: string;
  location_name?: string;
  last_updated: string;
  cached: boolean;
}

export interface ForecastItem {
  day: string;
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  rain_probability: number;
  icon?: string;
}

export interface WeatherForecastResponse {
  district: string;
  forecast: ForecastItem[];
  last_updated: string;
  cached: boolean;
}

export interface WeatherAdvisoryResponse {
  district: string;
  advisory_en: string;
  advisory_mr: string;
  category: string;
  rain_expected: boolean;
  disclaimer_en: string;
  disclaimer_mr: string;
  last_updated: string;
  cached: boolean;
}

export interface MandiPrice {
  crop: string;
  crop_mr?: string;
  market: string;
  market_mr?: string;
  district: string;
  date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  source: string;
  last_updated: string;
  cached: boolean;
}

export interface MarketComparisonItem {
  market: string;
  market_mr?: string;
  district: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  variance_from_highest: number;
  is_highest: boolean;
}

export interface MarketComparisonResponse {
  crop: string;
  crop_mr?: string;
  date: string;
  comparison: MarketComparisonItem[];
  disclaimer_en: string;
  disclaimer_mr: string;
  last_updated: string;
  cached: boolean;
}

export interface MandiHistoryPoint {
  date: string;
  modal_price: number;
}

export interface MandiHistoryResponse {
  crop: string;
  market: string;
  history: MandiHistoryPoint[];
  last_updated: string;
  cached: boolean;
}
export interface DiseaseCatalog {
  id: string;
  crop: string;
  name_en: string;
  name_mr: string;
  symptoms_en: string;
  symptoms_mr: string;
  advisory_en: string;
  advisory_mr: string;
  prevention_en?: string;
  prevention_mr?: string;
  source?: string;
  active: boolean;
}

export interface DiseasePredictResponse {
  scan_id: string;
  user_id: string;
  crop_id?: string;
  image_url: string;
  prediction: string;
  confidence: number;
  model_version: string;
  is_low_confidence: boolean;
  warning?: string;
  disease_info?: DiseaseCatalog;
  created_at: string;
}

export interface DiseaseScan {
  id: string;
  user_id: string;
  crop_id?: string;
  image_url: string;
  prediction: string;
  confidence: number;
  model_version: string;
  created_at: string;
  feedback_accurate?: boolean;
  feedback_text?: string;
  disease_info?: DiseaseCatalog;
}

export interface DiseaseFeedbackResponse {
  id: string;
  feedback_accurate: boolean;
  feedback_text?: string;
  message: string;
}
