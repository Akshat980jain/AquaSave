export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'higher_official' | 'lower_official';
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface WaterSample {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  sample_date: string;
  collected_by: string;
  cu_concentration: number;
  pb_concentration: number;
  cd_concentration: number;
  zn_concentration: number;
  hmpi_value: number;
  status: 'safe' | 'marginal' | 'high';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SampleFilters {
  status?: 'safe' | 'marginal' | 'high';
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  hmpiMin?: number;
  hmpiMax?: number;
}