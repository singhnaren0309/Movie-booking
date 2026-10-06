const Movie=require("../models/movie.model")

/**
 * 
 * @param {*} data -> object containig details of the movie to be created
 * @returns 
 */





const createMovie=async (data)=>{
    try{
        const movie=await Movie.create(data);
        return movie;
}
catch(error){
    if(error.name=='ValidationError'){
        let err={};
        Object.keys(error.errors).forEach((key)=>{
            err[key]=error.errors[key].message;
        });
        console.log(err);
        return {err:err,code:422};
    }
    else {
        throw error;
    }
    
}
}
/**
 * 
 * @param {*} id -> id of the movie to be deleted
 * @returns -> object containing the movie deleted
 */


const deleteMovie=async(id)=>{
    const response=await Movie.findByIdAndDelete(id);
    if(!response){
        return {err:"No movie found for the corresponding id provided",
             code: 404
        }
    }
    return response;
}
/**
 * 
 * @param {*} id -> id of the movie to be fetched
 * @returns -> object containing the movie fetched
 */
const getMovie=async(id)=>{
        const movie=await Movie.findById(id)
        if(!movie){
            return{err:"No movie found for the corresponding id provided",
             code: 404
        }
    };
    return movie; 
}


/**
 * 
 * @param {*} id -> id of the movie to be updated
 * @param {*} data -> object containing the details of the movie to be updated
 * @returns -> object containing the movie updated
 */
const updateMovie=async(id,data)=>{
   
    const movie= await Movie.findById(id);
    if(!movie){
        return{err:"No movie found for the corresponding id provided",
            code: 404
        }
    }
    const response=await Movie.findByIdAndUpdate(id,data,{new:true});
    return response; 
}


/**
 * 
 * @param {*} filter -> object containing the filter criteria
 * @returns -> object containing the movies fetched
 */
const fetchMovies=async(filter)=>{
    let query={};
    if(filter.name){
        query.name=filter.name;
    }
    let movies=await Movie.find(query);
    if(!movies){
        return{err:"No movies found",
        code:404
    }
    }
    return movies;
}

module.exports={
    getMovie,
    createMovie,
    deleteMovie,
    updateMovie,
    fetchMovies
}