const mongoose=require("mongoose")

const {BOOKING_STATUS}=require("../utils/constants")

const bookingSchema=new mongoose.Schema({
   theatreId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Theatre",
    required:true
   },
   movieId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Movie",
    required:true
   },
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
   timing:{
    type:String,
    required:true
   },
   noOfSeats:{
    type:Number,
    required:true
   },
   totalCost:{
    type:Number,
    required:true
   },
   status:{
    type:String,
    enum:{
        values: [BOOKING_STATUS.cancelled,BOOKING_STATUS.successfull,BOOKING_STATUS.processing],
        message:"Status can only be CANCELLED, SUCCESSFULL or PROCESSING"
    },
    default:BOOKING_STATUS.processing
   }
},{     
    timestamps:true
})

const Booking=mongoose.model("Booking",bookingSchema);
module.exports=Booking
