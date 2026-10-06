const jwt=require("jsonwebtoken")
const {STATUS_CODES}=require("../utils/constants")

const{successResponseBody,errorResponseBody}=require("../utils/responsebody")
const UserService=require("../services/user.service")

const validateSignUpRequest=async(req,res,next)=>{
    if(!req.body.name){
        errorResponseBody.err="Name of the user not present in the request";
        return res.status(400).json(errorResponseBody)
    }
    if(!req.body.email){
        errorResponseBody.err="Email of the user not present in the request";
        return res.status(400).json(errorResponseBody)
    }
    if(!req.body.password){
        errorResponseBody.err="Password of the user not present in the request";
        return res.status(400).json(errorResponseBody)
    }
   next();
     

}

const validateSignInRequest=async(req,res,next)=>{
    if(!req.body.email){
        errorResponseBody.err="Email of the user not present in the request";
        return res.status(400).json(errorResponseBody)
    }
    if(!req.body.password){
        errorResponseBody.err="Password of the user not present in the request";
        return res.status(400).json(errorResponseBody)
    }
   next();
}

const isAuthenticated=async(req,res,next)=>{
    try{
        const token=req.headers['x-access-token'];
        if(!token){
            errorResponseBody.err="Token not present";
            return res.status(STATUS_CODES.FORBIDDEN).json(errorResponseBody);
        }
        const response=jwt.verify(token,process.env.AUTH_KEY);
        if(!response){
            errorResponseBody.err="NO user found for the given token";
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponseBody);
        }
        const user=await UserService.getUserById(response.id);
        req.user=user
        next();
    
}
catch(error){
    if(error.name=="JsonWebTokenError"){
        errorResponseBody.err="Invalid token";
        return res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponseBody);
    }
    if(error.code==404){
        errorResponseBody.err="User does not exist";
       
        return res.status(STATUS_CODES.NOT_FOUND).json(errorResponseBody);
    }
    errorResponseBody.err=error;  return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
}
}

const validateResetPasswordRequest=async(req,res,next)=>{
    if(!req.body.oldPassword){
        errorResponseBody.err="Old password not present in the request";
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody)
    }
    if(!req.body.newPassword){
        errorResponseBody.err="New password not present in the request";
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody)
    }
    next();
   
}

const isAdmin=async(req,res,next)=>{
    
       const user=req.user
       if(user.userRole!="ADMIN"){
           errorResponseBody.err="User is not authorized to perform this action";
           return res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponseBody);
       }
       next();
    
}

const isClient=async(req,res,next)=>{
    const user= req.user;
    if(user.userRole!="CLIENT"){
        errorResponseBody.err="User is not authorized to perform this action";
        return res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponseBody);
    }
    next();
}

const isAdminOrClient=async(req,res,next)=>{
   
    const user=req.user
     console.log(user)
    if(user.userRole=="ADMIN"||user.userRole=="CLIENT"){
        return next();
    }
   
    else{
        errorResponseBody.err="User is not authorized to perform this action";
        return res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponseBody);
    }

}


module.exports={
    validateSignUpRequest,
    validateSignInRequest,
    isAuthenticated,
    validateResetPasswordRequest,
    isAdmin,
    isClient,
    isAdminOrClient
}