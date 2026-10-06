const theatreService=require("../services/theatre.service")
const {successResponseBody,errorResponseBody}=require("../utils/responsebody")


const create=async(req,res)=>{
    try{
        const response=await theatreService.createTheatre(req.body)
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody)
        }
        successResponseBody.data=response;
        successResponseBody.message="Theatre created successfully";
        return res.status(201).json(successResponseBody);
    }catch(err){
      
         errorResponseBody.err=err;
         errorResponseBody.message="Internal server error while creating theatre";
         return res.status(500).json(errorResponseBody);
    }
}
const destroy=async(req,res)=>{
    try{
        const response=await theatreService.deleteTheatre(req.params.id)
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        successResponseBody.message="Theatre deleted successfully";
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         errorResponseBody.message="Internal server error while deleting theatre";
         return res.status(500).json(errorResponseBody);
    }
}

const getTheatre=async(req,res)=>{
    try{
        const response=await theatreService.getTheatre(req.params.id)
        if(response.err){
            errorResponseBody.err=response.err;;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        successResponseBody.message="Theatre fetched successfully";
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         errorResponseBody.message="Internal server error while fetching theatre";
         return res.status(500).json(errorResponseBody);
    }
}

const getAllTheatres=async(req,res)=>{
    try{
        const response=await theatreService.getAllTheatres(req.query);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        successResponseBody.message="Theatres fetched successfully";
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         errorResponseBody.message="Internal server error while fetching theatres";
         return res.status(500).json(errorResponseBody);
    }
}

/**
 * 
 * @param theatreId -> unique id of the theatre for which we want to update movies
 * @param movieIds -> array of movies ids to be added/removed from the theatre movies list
 * @param insert -> boolean to decide whether to insert or remove movies
 * @returns -> object containing the updated theatre
 */

const updateMovies=async(req,res)=>{
    try{
        const response=await theatreService.updateMoviesInTheatre(req.params.id,req.body.movieIds,req.body.insert);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         return res.status(500).json(errorResponseBody);
    }
}
const update=async(req,res)=>{
    try{
        const response=await theatreService.updateTheatre(req.params.id,req.body);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         return res.status(500).json(errorResponseBody);
    }
}

const getMoviesInTheatre=async(req,res)=>{
    try{
        const response=await theatreService.getMoviesInTheatre(req.params.id);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         return res.status(500).json(errorResponseBody);
    }
}

const checkMovieInTheatre=async(req,res)=>{
    try{
        const response=await theatreService.checkMovieInTheatre(req.params.theatreId,req.params.movieId);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        return res.status(200).json(successResponseBody);
    }catch(err){
         errorResponseBody.err=err;
         return res.status(500).json(errorResponseBody);
    }
}

module.exports={
    create,
    destroy,
    getTheatre,
    getAllTheatres,
    updateMovies,
    update,
    getMoviesInTheatre,
    checkMovieInTheatre
}