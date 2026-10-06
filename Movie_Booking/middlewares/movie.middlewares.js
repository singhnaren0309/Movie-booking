
const validateMovieCreateReq=async(req,res,next)=>{
    // check if name is present 
    if(!req.body.name){
        return res.status(400).json({
            success:false,
            message:"Name is required",
            error:"Name is required"
        })
    }
    // check if description is present 
    if(!req.body.description){
        return res.status(400).json({
            success:false,
            message:"Description is required",
            error:"Description is required"
        })
    }
    // check if casts is present 
    if(!req.body.casts){
        return res.status(400).json({
            success:false,
            message:"Casts is required",
            error:"Casts is required"
        })
    }
    // check if trailerUrl is present 
    if(!req.body.trailerUrl){
        return res.status(400).json({
            success:false,
            message:"TrailerUrl is required",
            error:"TrailerUrl is required"
        })
    }
    // check if language is present 
    if(!req.body.language){
        return res.status(400).json({
            success:false,
            message:"Language is required",
            error:"Language is required"
        })
    }
    // check if release_date is present 
    if(!req.body.release_date){
        return res.status(400).json({
            success:false,
            message:"Release_date is required",
            error:"Release_date is required"
        })
    }
    // check if director is present 
    if(!req.body.director){
        return res.status(400).json({
            success:false,
            message:"Director is required",
            error:"Director is required"
        })
    }
    // check if release_status is present 
    if(!req.body.release_status){
        return res.status(400).json({
            success:false,
            message:"Release_status is required",
            error:"Release_status is required"
        })
    }
    next()
}

const validateMovieUpdateReq=async(req,res,next)=>{
    
}

module.exports={
    validateMovieCreateReq
}
