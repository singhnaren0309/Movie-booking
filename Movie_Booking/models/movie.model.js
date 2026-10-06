const mongoose=require("mongoose");

/**Define the schema of the movie resource to be srored in th db */

const movieSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
        minLength:5
    },
    casts:{
        type:Array,
        required:true
    },
    trailerUrl:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:true,
        default: "English",
    },
    release_date:{
        type:String,
        required:true
    },
    director:{
        type:String,
        required:true
    },
    release_status:{
        type:String,
        default: "Released",
    },
    
},{
timestamps:true
})

const Movie=mongoose.model("Movie",movieSchema);
module.exports=Movie;