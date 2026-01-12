export interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
}

export interface RegisterRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
