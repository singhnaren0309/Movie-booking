const mongoose=require("mongoose")

const showSchema=new mongoose.Schema({
   movieId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Movie",
    required:true
   },
   theatreId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Theatre",
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
   occupiedSeats:{
    type:[String],
    default:[]
   },
   price:{
    type:Number,
    required:true
   },
   format:{
    type:String
   }
}, { timestamps: true });

// Compound unique index: ensures no duplicate shows and enables fast index scans
showSchema.index({ movieId: 1, theatreId: 1, timing: 1 }, { unique: true });
showSchema.index({ movieId: 1 });
showSchema.index({ theatreId: 1 });

const Show=mongoose.model("Show",showSchema)
module.exports=Show