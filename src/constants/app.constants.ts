export enum Environment {
   DEVELOPMENT = 'development',
   PRODUCTION = 'production',
   TEST = 'test',
}

export enum Role {
   ADMIN = 'ADMIN', // Administrator with full permissions
   MEMBER = 'MEMBER', // Member who can edit cards
   OBSERVER = 'OBSERVER', // Observer with view-only access
}

export enum CACHE_KEY {
   SESSION_BLACKLIST = 'session-blacklist:$sid',
}
