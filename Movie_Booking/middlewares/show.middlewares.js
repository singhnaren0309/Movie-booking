const {STATUS_CODES}=require('../utils/constants');
const {successResponseBody,errorResponseBody}=require('../utils/responsebody');

const ObjectId=require('mongoose').Types.ObjectId;

const isValidObjectId=(id)=>{
    return ObjectId.isValid(id);
}

const validateCreateShowRequest=async(req,res,next)=>{
    try {
        if(!req.body.theatreId){
            errorResponseBody.err="theatreId is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!isValidObjectId(req.body.theatreId)){
            errorResponseBody.err="Invalid theatreId";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!req.body.movieId){
            errorResponseBody.err="movieId is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!isValidObjectId(req.body.movieId)){
            errorResponseBody.err="Invalid movieId";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!req.body.timing){
            errorResponseBody.err="timing is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!req.body.noOfSeats){
            errorResponseBody.err="no of seats are required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!req.body.price){
            errorResponseBody.err="price is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if(!req.body.format){
            errorResponseBody.err="format is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        next();
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({err:"Internal server error"});
    }
}
const validateUpdateShowRequest=async(req,res,next)=>{
    try {
        if(req.body.theatreId||req.body.movieId){
            errorResponseBody.err="theatreId and movieId cannot be updated";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        next();
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({err:"Internal server error"});
    }
}
module.exports={
    validateCreateShowRequest,
    validateUpdateShowRequest
}