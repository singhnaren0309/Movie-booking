const mongoose=require("mongoose");

/**
 * Defines the schema of thetre resource to be stored in thd db
 */

const theatreSchema=new mongoose.Schema({
    name: {
        type:String,
        required:true,
        minLength:5
    },
    description:{
        type:String
    },
    address:{
        type:String
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    movies:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Movie"
    }
},{timestamps:true});

const Theatre=mongoose.model("Theatre",theatreSchema);
module.exports=Theatre;