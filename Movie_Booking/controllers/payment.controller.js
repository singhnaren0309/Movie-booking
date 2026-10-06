const paymentsService = require("../services/payment.service");
const {successResponseBody,errorResponseBody}=require("../utils/responsebody");
const{STATUS_CODES, BOOKING_STATUS}=require("../utils/constants");
const sendEmail = require("../services/email.service");

const createPayment=async(req,res)=>{
    try{
        const response=await paymentsService.createPayment(req.body);
        sendEmail(
            "Payment Successful",
            req.user.email,
            `Hello ${req.user.name || 'Customer'},\nYour payment of Rs. ${response.amount} for booking ID ${response.bookingId} was processed successfully!\nBooking Status: SUCCESSFUL`
        );
        successResponseBody.data=response;
        successResponseBody.message="Payment created successfully";
        return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    }catch(error){
        console.error("Create payment error:", error);
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error.message || error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getPaymentDetailsById=async(req,res)=>{
    try{
        const response=await paymentsService.getPaymentDetailsById(req.params.id);
        successResponseBody.data=response;
        successResponseBody.message="Payment details fetched successfully";
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
const getAllPayments=async(req,res)=>{
    try{
        const response=await paymentsService.getAllPayments(req.user.id || req.user._id);
        successResponseBody.data=response;
        successResponseBody.message="Payment details fetched successfully";
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

module.exports={
    createPayment,
    getPaymentDetailsById,
    getAllPayments
}
