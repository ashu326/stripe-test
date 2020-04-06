const mysql = require("mysql");
const { dbConfig } = require("../config/config");

const db = mysql.createConnection({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.databse,
});

db.connect((err) => {
  if (err) {
    console.log("db error...", err);
    throw err;
  }
  console.log("db connected...");
});

module.exports = db;
