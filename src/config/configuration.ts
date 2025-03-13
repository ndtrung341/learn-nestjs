export default () => ({
   appUrl: process.env.APP_URL,
   port: parseInt(process.env.APP_PORT!, 10) || 3000,
   jwt: {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expires: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
      refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
      refreshExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
   },
   db: {
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
   },
   mail: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
      from: process.env.MAIL_FROM,
      fromName: process.env.MAIL_FROM_NAME,
   },
});
