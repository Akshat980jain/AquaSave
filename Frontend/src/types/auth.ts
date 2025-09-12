export interface User {
  id: string;
  username: string;
  role: 'higher_official' | 'lower_official';
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}