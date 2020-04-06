const db = require("../../model/db");

db.query(
  `CREATE TABLE orders(
    id VARCHAR(36) NOT NULL,
    user VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    payment_link VARCHAR(200) NOT NULL,
    payment_info VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    `,
  (err) => {
    if (err) throw err;
  }
);
