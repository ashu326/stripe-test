const db = require("../model/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class PaymentController {
  constructor(paymentRouter) {
    this.paymentRouter = paymentRouter;
    this.registerRoutes();
  }

  registerRoutes() {
    this.paymentRouter.get("/link", this.getPaymentLink);
    this.paymentRouter.post("/pay", this.capturePayment);
  }

  async getPaymentLink(req, res, next) {
    const id = req.query.id;

    if (!id) {
      return res.send("invalid link");
    }

    await db.query(`SELECT * FROM orders WHERE id = '${id}'`, (err, rows) => {
      if (err) throw err;
      if (rows.length === 0) {
        return res.send("invalid link");
      }
      let paymentUser = rows[0];
      res.render("index", { amount: paymentUser.amount });
    });
  }

  async capturePayment(req, res, next) {
    const { paymentMethodId, currency } = req.body;
    const orderAmount = 250;

    try {
      // Create new PaymentIntent
      let intent = await stripe.paymentIntents.create({
        amount: orderAmount,
        currency: currency,
        payment_method: paymentMethodId,
        confirmation_method: "manual",
        capture_method: "manual",
        confirm: true,
      });

      const intentId = intent.id;
      if (intent.status === "requires_capture") {
        console.log("❗ Charging the card for: " + intent.amount_capturable);
        // Because capture_method was set to manual we need to manually capture in order to move the funds
        // You have 7 days to capture a confirmed PaymentIntent
        // To cancel a payment before capturing use .cancel() (https://stripe.com/docs/api/payment_intents/cancel)
        intent = await stripe.paymentIntents.capture(intentId);
      }
      const response = this.generateResponse(intent);
      res.send(response);
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, etc
      // See https://stripe.com/docs/declines/codes for more
      res.send({ error: e.message });
    }
  }

  generateResponse(intent) {
    // Generate a response based on the intent's status
    switch (intent.status) {
      case "requires_action":
      case "requires_source_action":
        // Card requires authentication
        return {
          requiresAction: true,
          paymentIntentId: intent.id,
          clientSecret: intent.client_secret,
        };
      case "requires_payment_method":
      case "requires_source":
        // Card was not properly authenticated, suggest a new payment method
        return {
          error: "Your card was denied, please provide a new payment method",
        };
      case "succeeded":
        // Payment is complete, authentication not required
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log("💰 Payment received!");
        return { clientSecret: intent.client_secret };
    }
  }
}

const paymentController = (paymentRouter) =>
  new PaymentController(paymentRouter);

module.exports = {
  paymentController,
  PaymentController,
};
