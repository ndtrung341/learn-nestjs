export interface JwtAccessPayload {
   sub: string;
   session: string;
   iat: number;
   exp: number;
}

export interface JwtRefreshPayload extends JwtAccessPayload {
   token: string;
}

export interface JwtResetPasswordPayload {
   sub: string;
   hash: string;
}
