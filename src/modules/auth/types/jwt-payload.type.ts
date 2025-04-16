export type JwtAccessPayload = {
   sub: string;
   session: string;
   iat: number;
   exp: number;
};

export type JwtRefreshPayload = JwtAccessPayload & {
   token: string;
};

export type JwtResetPasswordPayload = {
   sub: string;
   jti: string;
};
