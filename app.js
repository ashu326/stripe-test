require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const adminController = require("./controllers/adminController")
  .adminController;
const paymentController = require("./controllers/paymentController")
  .paymentController;

const app = express();

const adminRouter = express.Router();
const paymentRouter = express.Router();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.use("/admin", adminRouter);
adminController(adminRouter);

app.use("/payment", paymentRouter);
paymentController(paymentRouter);

app.get("/stripe-key", (req, res) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.listen(3000, () => console.log(`Node server listening on port ${3000}!`));
