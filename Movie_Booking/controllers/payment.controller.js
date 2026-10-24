const paymentsService = require("../services/payment.service");
const Booking = require("../models/booking.model");
const {successResponseBody,errorResponseBody}=require("../utils/responsebody");
const{STATUS_CODES}=require("../utils/constants");
const publishBookingEvent = require("../services/email.service");
const { generateBookingEmailHtml } = require("../../NotificationService/utils/emailTemplates");

const createPayment=async(req,res)=>{
    try{
        const response=await paymentsService.createPayment(req.body);
        
        // Fetch booking with populated movie and theatre details for the email
        const booking = await Booking.findById(response.bookingId)
            .populate('movieId', 'name')
            .populate('theatreId', 'name');

        const movieName = booking?.movieId?.name || "Movie";
        const theatreName = booking?.theatreId?.name || "Cinema";
        const customerName = req.user?.name || "Customer";

        // Generate HTML content for the email
        const htmlContent = generateBookingEmailHtml({
            customerName,
            movieName,
            theatreName,
            timing: booking?.timing || "14:00",
            seats: booking?.seats || [],
            amount: response.amount,
            bookingId: response.bookingId
        });

        await publishBookingEvent(
    "BOOKING_PAYMENT_SUCCESS",
    {
        bookingId: response.bookingId.toString(),
        userId: req.user._id.toString(),
        movieName,
        theatreName,
        timing: booking.timing,
        seats: booking.seats,
        amount: response.amount,
        email: req.user.email,
        customerName,
        htmlContent
    }
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
