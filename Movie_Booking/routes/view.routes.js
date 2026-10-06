const viewController = require("../controllers/view.controller");

const routes = (app) => {
    app.get("/", viewController.getHome);
    app.get("/movies/:id", viewController.getMovieDetails);
    app.get("/booking/:showId", viewController.getBookingPage);
    app.get("/payment/:bookingId", viewController.getPaymentPage);
    app.get("/signin", viewController.getSignIn);
    app.get("/signup", viewController.getSignUp);
    app.get("/my-bookings", viewController.getMyBookings);
};

module.exports = routes;
