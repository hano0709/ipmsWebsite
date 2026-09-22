export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
}
