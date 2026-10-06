const Theatre=require("../models/theatre.model")
const Movie=require("../models/movie.model")
const {STATUS_CODES}=require('../utils/constants')
/**
 * 
 * @param {*} data -> object containing details of the theatre to be created
 * @returns -> object containing the theatre created
 */


 const createTheatre= async(data)=>{
   try{ const response =await Theatre.create(data);
    return response}
    catch(error){
        if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            })
            return {err:err,code:STATUS_CODES.UNPROCESSABLE_ENTITY}
        }
        throw error;
    }
 }

/**
 * 
 * @param {*} id -> id of the theatre to be deleted
 * @returns -> object containing the theatre deleted
 */


const deleteTheatre=async(id)=>{
    try{
        const response=await Theatre.findByIdAndDelete(id);
        if(!response){
            throw {err:"No theatre found for the corresponding id provided",code:404}
        }
        return response;
    }catch(error){
        if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            })
            return {err:err,code:STATUS_CODES.UNPROCESSABLE_ENTITY}
        }
        throw error;
    }
}

/**
 * 
 * @param {*} id -> id of the theatre to be fetched
 * @returns -> object containing the theatre fetched
 */

const getTheatre=async(id)=>{
    try{
        const response=await Theatre.findById(id);
        if(!response){
            throw {err:"No theatre found for the corresponding id provided",code:404}
        }
        return response;
    }catch(error){
        if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            })
            return {err:err,code:STATUS_CODES.UNPROCESSABLE_ENTITY}
        }
        throw error;
    }
}

/**
 * 
 * @returns -> object all containing the theatres fetched
 */


const getAllTheatres=async(data)=>{
    try{
        let query={};
        let pagination={};
        if(data && data.city){
            //this checks whether city is present in query params or not
            query.city=data.city;
        }
        if (data && data.pincode){
            // this checks whther pincode is present in query params or not
            query.pincode=data.pincode;
        }
        if(data && data.name){
            // this checks whther name is present in query params or not
            query.name=data.name;
        } 
        if(data && data.movieId){
            query.movies={$in:[data.movieId]}
        }
        if(data && data.limit){
            //how many record we are sending
            pagination.limit=data.limit;
        }
        
        if(data && data.skip){
            // for first page we send skip as 0
            // for secons page we send skip as 1
            // for third page we send skip as 2
            // and so on
            let perPage=(data.perPage)?data.perPage:5;
            pagination.skip=data.skip*perPage; }
        
        const response=await Theatre.find(query,{},pagination);
        if(!response){
            return {err:"No theatres found for the given query",code:404}
        }
        return response;
    }catch(error){
        if(error.name=='ValidationError'){
            let err={};
            Object.keys(error.errors).forEach((key)=>{
                err[key]=error.errors[key].message;
            })
            return {err:err,code:422}
        }
        throw error;
    }
}

const updateMoviesInTheatre=async(theatreId, movieIds,insert)=>{
    try{
    const theatre= await Theatre.findById(theatreId);
    if(!theatre){
        return {err:"No theatre found for the corresponding id provided",code:404}
    }
    
   if(insert){

        await Theatre.updateOne({_id:theatreId},{$addToSet:{movies:{$each:movieIds}}});

   }else{
           await Theatre.updateOne({_id:theatreId},{$pull:{movies:{$in:movieIds}}})
   }
   const response=await Theatre.findById(theatreId);
   return await response.populate("movies");
}catch(error){
    if(error.name=='TypeError'){
        return{
            err:"Theater not found",
            code:404
        }
    }
}
}

const updateTheatre=async(id,data)=>{
     try{
        const theatre= await Theatre.findById(id);
        if(!theatre){
            throw {err:"No theatre found for the corresponding id provided",code:STATUS_CODES.NOT_FOUND}
        }
        const response=await Theatre.findByIdAndUpdate(id,data,{returnDocument: 'after',runValidators:true});
        return response;
     }catch(error){
         if(error.name=='ValidationError'){
             let err={};
             Object.keys(error.errors).forEach((key)=>{
                 err[key]=error.errors[key].message;
             })
             return {err:err,code:STATUS_CODES.UNPROCESSABLE_ENTITY}
         }
     }
}

const getMoviesInTheatre=async(id)=>{
    try{
        const theatre= await Theatre.findById(id,{name:1,movies:1},).populate("movies");
        if(!theatre){
            throw {err:"No theatre found for the corresponding id provided",code:STATUS_CODES.NOT_FOUND}
        }
        return theatre;
    }catch(error){
       console.log(error);
       throw error;
    }
}
const checkMovieInTheatre=async(theatreId,movieId)=>{
    try{
       const response =await Theatre.findById(theatreId);
       if (!response){
        throw {err:"No theatre found for the corresponding id provided",code:STATUS_CODES.NOT_FOUND}
       }
       return response.movies.includes(movieId);
    }catch(error){
       if(error.name=='TypeError'){
        return{
            err:"No theatre found for the corresponding id provided",
            code:STATUS_CODES.NOT_FOUND
        }
       }
       throw error;
    }
}

module.exports={
    createTheatre,
    deleteTheatre,
    getTheatre,
    getAllTheatres,
    updateMoviesInTheatre,
    updateTheatre,
    getMoviesInTheatre,
    checkMovieInTheatre
}