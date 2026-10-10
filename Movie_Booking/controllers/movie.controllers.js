const Movie=require("../models/movie.model");
const Services=require("../services/movie.service");
const {successResponseBody,errorResponseBody}=require("../utils/responsebody");
const redisClient = require('../utils/redisClient');

/**
 * 
 * controllers function to create anew movie
 * @param {Request} req {name, description....}
 * @param {Response} res 
 */


const createMovie=async (req,res)=>{
    try{
        const data=req.body;
        const response=await Services.createMovie(data);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody)
        }
        successResponseBody.data=response;
        successResponseBody.message="Movie created successfully";
        
        // Invalidate cache
        await redisClient.del('movies_catalog');
        
        return res.status(201).json(successResponseBody);
    }catch(err){
        errorResponseBody.err=err;
        errorResponseBody.message="Internal server error while creating movie";
        return res.status(500).json(errorResponseBody);
    }
}

const deleteMovie=async(req,res)=>{
    try{
        const response=await Services.deleteMovie(req.params.id);
        if(response.err){
            errorResponseBody.err=response.err;
            return res.status(response.code).json(errorResponseBody);
        }
        successResponseBody.data=response;
        successResponseBody.message="Successfully deleted the movie";
        
        // Invalidate cache
        await redisClient.del('movies_catalog');

        return res.status(200).json(successResponseBody);
        
    }catch(err){
       errorResponseBody.err=err;
        return res.status(500).json(errorResponseBody);
    }
}

const getMovie=async(req,res)=>{
    try{
        const response=await Services.getMovie(req.params.id)
        if(response.err){
           errorResponseBody.err=response.err;
           return res.status(response.code).json(errorResponseBody); 
        }
        
        successResponseBody.data=response;
        successResponseBody.message="Movie fetched successfully";
        return res.status(200).json(successResponseBody);
    }catch(err){
        errorResponseBody.err=err;
        return res.status(500).json(errorResponseBody);
    }
}

const updateMovie=async(req,res)=>{
    try{
        const movie=await Services.updateMovie(req.params.id,req.body);
        if(movie.err){
            errorResponseBody.err=movie.err;
            return res.status(movie.code).json(errorResponseBody);
        }
        successResponseBody.data=movie;
        successResponseBody.message="Movie updated successfully";
        
        // Invalidate cache
        await redisClient.del('movies_catalog');

        return res.status(200).json(successResponseBody);
    }catch(err){
        errorResponseBody.err=err;
        return res.status(500).json(errorResponseBody);
    }
}
const getMovies=async(req,res)=>{
    try{
        const response=await Services.fetchMovies(req.query);
        if(response.err){
           errorResponseBody.err=response.err;
           return res.status(response.code).json(errorResponseBody); 
        }
        successResponseBody.data=response;
        successResponseBody.message="Movies fetched successfully";
        
        // Save to cache for 1 hour
        await redisClient.setEx('movies_catalog', 3600, JSON.stringify(response));

        return res.status(200).json(successResponseBody);
    }catch(err){
        errorResponseBody.err=err;
        return res.status(500).json(errorResponseBody);
    }
}
const searchMovies=async(req,res)=>{
    try{
        const searchString = req.body.name;
        const response=await Services.semanticSearchMovies(searchString);
        if(response.err){
           errorResponseBody.err=response.err;
           return res.status(response.code).json(errorResponseBody); 
        }
        successResponseBody.data=response;
        successResponseBody.message="Movies fetched successfully";
        
        // Save to cache for 1 hour
        await redisClient.setEx('movies_catalog', 3600, JSON.stringify(response));

        return res.status(200).json(successResponseBody);
    }catch(err){
        errorResponseBody.err=err;
        return res.status(500).json(errorResponseBody);
    }

}

module.exports={
    createMovie,
    deleteMovie,
    getMovie,
    updateMovie,
    getMovies,
    searchMovies
}