const Booking=require('../models/booking.model')
const Show=require('../models/show.model')
const {STATUS_CODES,BOOKING_STATUS}=require('../utils/constants');
const redisClient = require('../utils/redisClient');

const HOLD_TTL_SECONDS=600;

const createBooking=async(data)=>{

    const requestedSeats=data.seats||[];
    if(!requestedSeats.length){
        throw {err:"No seats selected",code:STATUS_CODES.BAD_REQUEST};
    }
    const show=await Show.findOne({
        movieId:data.movieId,
        theatreId:data.theatreId,
        timing:data.timing
    });
    if(!show){
        throw {err:"No show found for the given show id",code:STATUS_CODES.NOT_FOUND};
    }
    const alreadyBooked=requestedSeats.filter(seat=>show.occupiedSeats?.includes(seat));

    if(alreadyBooked.length){
        throw {err:`Seats already booked: ${alreadyBooked.join(", ")}`,code:STATUS_CODES.BAD_REQUEST};
    }
    
    const showIdentifier=`${data.movieId}_${data.theatreId}_${data.timing}`;
    const acquiredSeatLockes=[];
    
    
    try{
      for(const seat of requestedSeats){
        const lockKey=`seat:${showIdentifier}:${seat}`;
        const acquiredLock = await redisClient.set(lockKey, data.userId.toString(), {
            NX: true,
            EX: HOLD_TTL_SECONDS
        });
        if (!acquiredLock) {
            throw {
                err: "High traffic. Seat booking in progress by someone else. Please try again.",
                code: STATUS_CODES.BAD_REQUEST
            };
        }
        acquiredSeatLockes.push(lockKey);
    }
      data.noOfSeats=requestedSeats.length; 
     data.totalCost=show.price*requestedSeats.length; 
     data.status=BOOKING_STATUS.processing; 
     data.expiresAt=new Date(Date.now() + HOLD_TTL_SECONDS * 1000); 
    
     const booking=await Booking.create(data);
     return booking;

    } catch (error) {
        for(const key of acquiredSeatLockes){
            await redisClient.del(key)
        }
        if(error.code && error.err){
            throw error;
        }
        throw {
            err:error.message||"failed to create booking",
            code:STATUS_CODES.INTERNAL_SERVER_ERROR
        };
        
    }
}

const updateBooking=async(id,data)=>{
    try{
        const response = await Booking.findById(id);
        if(!response){
            throw {err:"No booking found for the corresponding id provided",code:STATUS_CODES.NOT_FOUND}
        }
        let query = {}
        
        if(response.status==BOOKING_STATUS.successfull){
            throw {err:"Booking already booked",code:STATUS_CODES.BAD_REQUEST}
        }
        
        if(data.status){
            query.status=data.status;
        }

        const response2 = await Booking.updateOne({_id:id},query);
        return response2;

    }catch(error){
        if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            })
            return {err:err,code:STATUS_CODES.UNPROCESSABLE_ENTITY}
        }
        throw error;
    }
}

const getBooking=async(data)=>{
    try{
        const response = await Booking.find({userId:data.userId});
        return response;
    }catch(error){
        throw error;
    }
}

const getAllBooking=async()=>{
    try{
        const response=await Booking.find()
        return response
    }catch(error){
        throw error
    }
}

const getBookingById=async(id,userId)=>{
    try{
        const response=await Booking.findById(id);
        
        if(!response){
            throw {err:"No booking found for the given id",code:STATUS_CODES.NOT_FOUND}
        }
        if(response.userId.toString()!==userId.toString()){
            throw {err:"You are not authorized to access this booking",code:STATUS_CODES.UNAUTHORIZED}
        }
        return response;
    }catch(error){
        throw error;
    }
}

module.exports={
    createBooking,
    updateBooking,
    getBooking,
    getAllBooking,
    getBookingById
}
