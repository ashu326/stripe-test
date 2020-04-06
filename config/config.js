module.exports = {
  dbConfig: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    databse: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  },

  baseUrlConfig: {
    baseUrl: process.env.BASE_URL,
  },
};
