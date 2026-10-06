const {errorResponseBody}=require("../utils/responsebody")

const validateTheatreCreateReq=async(req,res,next)=>{
    if(!req.body.name){
       errorResponseBody.message="Name is required";
       errorResponseBody.err="Name is required";
       return res.status(400).json(errorResponseBody);
    }
    if(!req.body.city){
        errorResponseBody.message="City is required";
        errorResponseBody.err="City is required";
        return res.status(400).json(errorResponseBody);
    }
    if(!req.body.state){
        errorResponseBody.message="State is required";
        errorResponseBody.err="State is required";
        return res.status(400).json(errorResponseBody);
    }
    if(!req.body.pincode){
        errorResponseBody.message="Pincode is required";
        errorResponseBody.err="Pincode is required";
        return res.status(400).json(errorResponseBody);
    }
    if(!req.body.description){
        errorResponseBody.message="Description is required";
        errorResponseBody.err="Description is required";
        return res.status(400).json(errorResponseBody);
    }
    if(!req.body.address){
        errorResponseBody.message="Address is required";
        errorResponseBody.err="Address is required";
        return res.status(400).json(errorResponseBody);
    }   
    next();//everything is fine pass the request to the controller
}

const validateUpdateMoviesReq=async(req,res,next)=>{
    if(!req.body.movieIds){
        errorResponseBody.message="movieIds is required";
        errorResponseBody.err="movieIds is required";
        return res.status(400).json(errorResponseBody);
    }
    if(req.body.insert== undefined){
        errorResponseBody.message="insert is required";
        errorResponseBody.err="insert is required";
        return res.status(400).json(errorResponseBody);
    }
    if(!Array.isArray(req.body.movieIds)){
        errorResponseBody.message="movieIds must be an array";
        errorResponseBody.err="movieIds must be an array";
        return res.status(400).json(errorResponseBody);
    }
    if(req.body.movieIds.length<=0){
        errorResponseBody.message="movieIds must not be empty";
        errorResponseBody.err="movieIds must not be empty";
        return res.status(400).json(errorResponseBody);
    }
    if(req.body.insert!=true&&req.body.insert!=false){
        errorResponseBody.message="insert must be true or false";
        errorResponseBody.err="insert must be true or false";
        return res.status(400).json(errorResponseBody);
    }
    next();//everything is fine pass the request to the controller
}

module.exports={
    validateTheatreCreateReq,
    validateUpdateMoviesReq
}