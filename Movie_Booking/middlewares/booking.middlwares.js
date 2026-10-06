const {STATUS_CODES,BOOKING_STATUS}=require('../utils/constants');
const theatreService=require('../services/theatre.service');
const {isValidObjectId}=require('mongoose');
const userService=require('../services/user.service');
const {successResponseBody,errorResponseBody}=require('../utils/responsebody');

const validateCreateBookingRequest=async(req,res,next)=>{
    try {
        if(!req.body.theatreId){
            return res.status(STATUS_CODES.BAD_REQUEST).json({err:"TheatreId is required"});
        }
        if(!isValidObjectId(req.body.theatreId)){
            return res.status(STATUS_CODES.BAD_REQUEST).json({err:"Invalid TheatreId"});
        }
        const theatre=await theatreService.getTheatre(req.body.theatreId);
        if(theatre.err){
            return res.status(theatre.code).json({err:theatre.err});
        }
        req.theatre=theatre;
        if(!req.body.movieId){
            return res.status(STATUS_CODES.BAD_REQUEST).json({err:"MovieId is required"});
        }
        if(!isValidObjectId(req.body.movieId)){
            return res.status(STATUS_CODES.BAD_REQUEST).json({err:"Invalid MovieId"});
        }
      if(!theatre.movies.includes(req.body.movieId)){
        return res.status(STATUS_CODES.BAD_REQUEST).json({err:"Movie not found in theatre"});
      }
      if(!req.body.timing){
        return res.status(STATUS_CODES.BAD_REQUEST).json({err:"Timing is required"});
      }
      if(!req.body.seats && !req.body.noOfSeats){
        return res.status(STATUS_CODES.BAD_REQUEST).json({err:"No of seats are required"});
      }
      req.body.noOfSeats = req.body.noOfSeats || req.body.seats;
      req.body.seats = req.body.seats || req.body.noOfSeats;
        next();
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({err:"Internal server error"});
    }
}

const canChangeStatus=async(req,res,next)=>{
    try {
        const user = await userService.getUserById(req.user._id);
        if(!user){
            return res.status(STATUS_CODES.NOT_FOUND).json({err:"User not found"});
        }
        console.log(req.body.status)
        if(user.userRole=="CUSTOMER"&& req.body.status!=BOOKING_STATUS.cancelled){
         
           errorResponseBody.err="you are not allowed to change the status of the booking";
           return res.status(STATUS_CODES.UNAUTHORIZED).json(errorResponseBody);
        }
        next();
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({err:"Internal server error"});
    }
}

module.exports={
    validateCreateBookingRequest,
    canChangeStatus
}