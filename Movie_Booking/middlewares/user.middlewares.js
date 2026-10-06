const { errorResponseBody } = require("../utils/responsebody")

const validateUpdateUserRequest=async(req,res,next)=>{
    if(!req.body.userRole && !req.body.userStatus){
        errorResponseBody.err="User role or user status not present in the request";
        return res.status(400).json(errorResponseBody)
    }
    next();
}

module.exports={
    validateUpdateUserRequest
}