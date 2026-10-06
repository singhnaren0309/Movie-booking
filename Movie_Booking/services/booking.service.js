const Booking=require('../models/booking.model')
const Show=require('../models/show.model')
const {STATUS_CODES,BOOKING_STATUS}=require('../utils/constants');
const redisClient = require('../utils/redisClient');

const createBooking=async(data)=>{
    const lockKey = `lock:show:${data.movieId}:${data.theatreId}:${data.timing}`;
    let acquiredLock = false;
    
    try{
        if (!data.noOfSeats && data.seats) {
            data.noOfSeats = data.seats;
        }

        acquiredLock = await redisClient.set(lockKey, data.userId.toString(), {
            NX: true,
            EX: 15 // lock for 15 seconds
        });

        if (!acquiredLock) {
            throw {
                err: "High traffic. Seat booking in progress by someone else. Please try again.",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        const show=await Show.findOne({movieId:data.movieId,theatreId:data.theatreId,timing:data.timing});
        if(!show){
            throw {err:"No show found for the given show id",code:STATUS_CODES.NOT_FOUND};
        }
        if (show.noOfSeats < data.noOfSeats) {
            throw {
                err: `Requested seats (${data.noOfSeats}) exceed available seats (${show.noOfSeats})`,
                code: STATUS_CODES.BAD_REQUEST
            };
        }
        data.totalCost = show.price * data.noOfSeats;
        const response = await Booking.create(data);
        return response;
    }catch(error){
        if(error.name=='ValidationError'){
            let err={}
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            })
            return {err:err,code:STATUS_CODES.UNPROCESSABLE_ENTITY}
        }
        throw error;
    } finally {
        if (acquiredLock) {
            const lockOwner = await redisClient.get(lockKey);
            if (lockOwner === data.userId.toString()) {
                await redisClient.del(lockKey);
            }
        }
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
