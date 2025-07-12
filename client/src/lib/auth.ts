import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'peserta' | 'pemateri' | 'panitia';
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export class AuthService {
  private static TOKEN_KEY = 'makesta_token';
  private static USER_KEY = 'makesta_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  static async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', {
      username,
      password,
    });

    const data = await response.json();
    
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  static async register(registrationData: any): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', registrationData);

    const data = await response.json();
    
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  static async logout(): Promise<void> {
    this.removeToken();
    window.location.href = '/';
  }

  static async getCurrentUser(): Promise<User> {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
