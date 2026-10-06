const {successResponseBody,errorResponseBody}=require("../utils/responsebody");
const bookingService=require("../services/booking.service")
const {STATUS_CODES}=require("../utils/constants")

const create=async(req,res)=>{
    try{
        let userId=req.user._id;
        const response=await bookingService.createBooking({...req.body,userId: userId})
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.message= "Booking created successfully";
        successResponseBody.data=response;
        return res.status(STATUS_CODES.CREATED).json(successResponseBody);
    }catch(error){
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const update=async(req,res)=>{
    try{
        const response=await bookingService.updateBooking(req.params.id,req.body);
        successResponseBody.message= "Booking updated successfully";
        successResponseBody.data=response;
        return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    }catch(error){
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getBooking=async(req,res)=>{
    try {
       const response=await bookingService.getBooking({userId:req.user._id})
       successResponseBody.message="Booking fetched successfully"
       successResponseBody.data=response;
       return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getAllBooking=async(req,res)=>{
    try {
       const response=await bookingService.getAllBooking()
       successResponseBody.message="Booking fetched successfully"
       successResponseBody.data=response;
       return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getBookingById=async(req,res)=>{
    try {
       const response=await bookingService.getBookingById(req.params.id,req.user._id)
       successResponseBody.message="Booking fetched successfully"
       successResponseBody.data=response;
       return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}



module.exports={
    create,
    update,
    getBooking,
    getAllBooking,
    getBookingById
}