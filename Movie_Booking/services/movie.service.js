const Movie=require("../models/movie.model")
const {pipeline}=require("@huggingface/transformers");

/**
 * 
 * @param {*} data -> object containig details of the movie to be created
 * @returns 
 */





const createMovie=async (data)=>{
    try{
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        const textToEmbed = `${data.name}. ${data.description}`;
        const embedding = await extractor(textToEmbed, {
            pooling: 'mean',    // "mean" or "cls" (or true for default)
            normalize: true
        });
        
        data.vector_embedding = Array.from(embedding.data);
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
const semanticSearchMovies=async(query)=>{
    try {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        const embedding = await extractor(query, {
            pooling: 'mean',
            normalize: true
        });
        const queryVector = Array.from(embedding.data);
        const results = await Movie.aggregate([
            {
                $vectorSearch: {
                    index: "vector",
                    queryVector: queryVector,
                    path: "vector_embedding",
                    numCandidates: 50, 
                    limit: 2, 
                    similarity: "cosine" 
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    release_date: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);
        return results;
    } catch (error) {
        console.error("Error in semantic search:", error);
        throw error;
    }
}
module.exports={
    getMovie,
    createMovie,
    deleteMovie,
    updateMovie,
    fetchMovies,
    semanticSearchMovies
}