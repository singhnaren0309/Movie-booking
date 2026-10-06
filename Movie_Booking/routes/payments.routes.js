const authMiddlewares = require("../middlewares/auth.middlewares");
const paymentMiddlewares = require("../middlewares/payment.middlewares");
const paymentController = require("../controllers/payment.controller");

const routes = (app) => {
    app.post(
        "/mba/api/v1/payments",
        authMiddlewares.isAuthenticated,
        paymentMiddlewares.verifyPaymentCreateReq,
        paymentController.createPayment
    );
    app.get(
        "/mba/api/v1/payments",
        authMiddlewares.isAuthenticated,
        paymentController.getAllPayments
    );
    app.get(
        "/mba/api/v1/payments/:id",
        authMiddlewares.isAuthenticated,
        paymentController.getPaymentDetailsById
    );
};

module.exports = routes;
