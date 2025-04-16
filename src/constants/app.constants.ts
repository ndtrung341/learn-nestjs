export enum Environment {
   DEVELOPMENT = 'development',
   PRODUCTION = 'production',
   TEST = 'test',
}

export enum CACHE_KEY {
   SESSION_BLACKLIST = 'session-blacklist:$sid',
   PASSWORD_RESET = 'password-reset:%s:%s',
}
