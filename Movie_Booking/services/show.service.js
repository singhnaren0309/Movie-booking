const Show=require("../models/show.model")
const {STATUS_CODES}=require("../utils/constants")
const Theatre=require("../models/theatre.model")
const Movie=require("../models/movie.model")

const createShow=async(data)=>{
    try{

        //check theatre exist
        const theatre =await Theatre.findById(data.theatreId);
        if(!theatre){
            throw {
                err:"Theatre not found",
                code:STATUS_CODES.NOT_FOUND
            }
        }

        //check movie exists
        const movie = await Movie.findById(data.movieId);
        if(!movie){
            throw {
                err:"Movie not found",
                code:STATUS_CODES.NOT_FOUND
            }
        }

        //check movie exists in that theatre
        if(!theatre.movies || !theatre.movies.includes(data.movieId)){
            throw {
                err:"Movie not found in theatre",
                code:STATUS_CODES.NOT_FOUND
            }
        }

        const response=await Show.create(data);
        return response;
    }catch(error){
         if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            });

            throw{
                err:err,
                code:STATUS_CODES.UNPROCESSABLE_ENTITY
            }
        }
        throw error;
    }
}

const getShows=async(data)=>{
    try{
        let filter={}
        if(data.movieId){
            filter.movieId=data.movieId;
        }
        if(data.theatreId){
            filter.theatreId=data.theatreId;
        }
        const response=await Show.find(filter).populate('theatreId', 'name');
        if(!response){
            throw{
                err:"Shows not found",
                code:STATUS_CODES.NOT_FOUND
            }
        }
        return response;
    }catch(error){
        throw error;
    }
}

const deleteShow=async(id)=>{
    try{
        const response=await Show.findByIdAndDelete(id);
        if(!response){
            throw{
                err:"Show not found",
                code:STATUS_CODES.NOT_FOUND
            }
        }
        return response;
    }catch(error){
        throw error;
    }
}

const updateShow=async(id,data)=>{
    try{
        const response=await Show.findByIdAndUpdate(id,data,{new:true,runValidators:true});
        if(!response){
            throw{
                err:"Show not found",
                code:STATUS_CODES.NOT_FOUND
            }
        }
        return response;
    }catch(error){
        if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            });

            throw{
                err:err,
                code:STATUS_CODES.UNPROCESSABLE_ENTITY
            }
        }
        throw error;
    }
}

module.exports={
    createShow,
    getShows,
    deleteShow,
    updateShow
}