const db = require("../model/db");
const uuid = require("uuid");
const { baseUrlConfig } = require("../config/config");

class AdminController {
  constructor(adminRouter) {
    this.adminRouter = adminRouter;
    this.registerRoutes();
  }

  registerRoutes() {
    this.adminRouter.get("/", this.getAdminPage);
    this.adminRouter.post("/payment/link", this.sendPaymentLink);
  }
  getAdminPage(req, res, next) {
    db.query(
      "SELECT payment_info, status FROM orders LIMIT 10",
      (err, rows) => {
        if (err) throw err;
        let payments = [];
        rows.forEach((row) => {
          payments.push({ id: row.payment_info, status: row.status });
        });
        res.render("admin", { link: null, payments });
      }
    );
  }

  sendPaymentLink(req, res, next) {
    const { user, amount } = req.body;
    if (!user || !amount) {
      return res.send("Parameters missing");
    }
    const id = uuid.v1();
    const payment_link = baseUrlConfig.baseUrl + "/payment/link?id=" + id;
    console.log(payment_link);
    let query = `INSERT INTO orders (id, user, amount, payment_link, status)
      VALUES ('${id}', '${user}', ${amount}, '${payment_link}', 'PENDING')`;
    console.log(query);
    db.query(query, (err) => {
      if (err) throw err;
      res.send(`Payment link ${payment_link} sent`);
    });
  }
}

const adminController = (adminRouter) => new AdminController(adminRouter);

module.exports = {
  adminController,
  AdminController,
};
