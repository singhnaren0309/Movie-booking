const jwt=require("jsonwebtoken");

const userService= require("../services/user.service")
const{successResponseBody,errorResponseBody}=require("../utils/responsebody")



const signup=async(req,res)=>{
    try{
        const response=await userService.createUser(req.body)
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        successResponseBody.message="User created successfully";
        return res.status(201).json(successResponseBody);
    }catch(error){
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody)
        }
        errorResponseBody.err=error;
        return res.status(500).json(errorResponseBody);
    }
}

const signin=async(req,res)=>{
    try{
        const user =await userService.getUserByemail(req.body.email);
        const isValidPassword = await user.isValidPassword(req.body.password);
        if(!isValidPassword){
            errorResponseBody.err="Invalid password";
            return res.status(401).json(errorResponseBody);
        }

        const token=jwt.sign(
            {id:user._id,email:user.email},
            process.env.AUTH_KEY,
            {expiresIn:"1h"}
        );

        successResponseBody.data={
           email:user.email,
           userRole:user.userRole,
           token:token
        }
        successResponseBody.message="User signed in successfully";
        return res.status(200).json(successResponseBody);
}
catch(error){
    if(error.err){
        errorResponseBody.err=error.err;
        return res.status(error.code).json(errorResponseBody);
    }
    errorResponseBody.err=error;
    return res.status(500).json(errorResponseBody);
    
}
}

const resetPassword=async(req,res)=>{
    try{
        const user=req.user;
        const isOldPasswordIsCorrect=await user.isValidPassword(req.body.oldPassword);
        if(!isOldPasswordIsCorrect){
            errorResponseBody.err="Invalid old password";
            return res.status(403).json(errorResponseBody);
        }
       user.password=req.body.newPassword;
       await user.save();
       successResponseBody.message="Password reset successfully";
       return res.status(200).json(successResponseBody);
    }catch(error){
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody)
        }
        errorResponseBody.err=error;
        return res.status(500).json(errorResponseBody);
    }
}

module.exports={
    signup,
    signin,
    resetPassword
}