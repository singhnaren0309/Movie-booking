const userController = require("../controllers/user.controller")
const authMiddleware=require("../middlewares/auth.middlewares")
const userMiddleware = require("../middlewares/user.middlewares")

const routes=(app)=>{
    app.patch("/mba/api/v1/users/:id",authMiddleware.isAuthenticated,authMiddleware.isAdmin,userMiddleware.validateUpdateUserRequest,userController.updateRoleOrStatus);
}
module.exports=routes;