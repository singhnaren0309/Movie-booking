const mongoose=require("mongoose");
const {PAYMENT_STATUS}=require("../utils/constants");

const paymentSchema=new mongoose.Schema({
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:{
            values: [PAYMENT_STATUS.success,PAYMENT_STATUS.pending,PAYMENT_STATUS.failed],
            message:"Status can only be SUCCESS, PENDING or FAILED"
        },
        default:PAYMENT_STATUS.pending
    }  
},{timestamps:true});

// Indexes for fast payment lookups
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ status: 1 });

const Payment=mongoose.model("Payment",paymentSchema)
module.exports=Payment