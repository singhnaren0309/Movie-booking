const authController = require("../controllers/auth.controller")
const authMiddlewares = require("../middlewares/auth.middlewares")

const routes = (app) => {
    //signup route
    app.post("/mba/api/v1/auth/signup", authMiddlewares.validateSignUpRequest, authController.signup);

    //signin route
    app.post("/mba/api/v1/auth/signin", authMiddlewares.validateSignInRequest, authController.signin);

    //reset password route
    app.patch("/mba/api/v1/auth/resetPassword",authMiddlewares.isAuthenticated, authMiddlewares.validateResetPasswordRequest, authController.resetPassword);

}


module.exports = routes