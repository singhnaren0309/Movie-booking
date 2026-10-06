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
   price:{
    type:Number,
    required:true
   },
   format:{
    type:String
   }
}, {timestamps:true})

const Show=mongoose.model("Show",showSchema)
module.exports=Show