const User= require('../models/user.model')

const createUser=async(data)=>{
    try{
        const response=await User.create(data);
        return response;
    }catch(error){
        console.log(error);
       if(error.name=='ValidationError'){
        let err={};
        Object.keys(error.errors).forEach(key=>{
            err[key]=error.errors[key].message;
        })
        throw{err:err,code:422}
       }
    }
}

const getUserByemail=async(email)=>{
    try{
        console.log(email);
        const response=await User.findOne({email:email});
        if(!response){
            throw{err:"User not found",code:404}
        }
        return response;
    }catch(error){
        console.log(error);
        if(error.err){
            throw error; // re-throw known errors (e.g. 404 not found)
        }
        throw { err: error.message || "Internal server error", code: 500 };
    }
}

const getUserById=async(id)=>{
    try{
        const response=await User.findById(id);
        if(!response){
           return {err:"User not found",code:404}
        }
        return response;
    }catch(error){
        console.log(error);
        return {err:error,code:500}
    }
}

const updateUserRoleOrStatus=async(data,userId)=>{
    try{
        let updateQuery={};
        if(data.userRole){
            updateQuery.userRole=data.userRole;
        }
        if(data.userStatus){
            updateQuery.userStatus=data.userStatus;
        }
        let response=await User.findOneAndUpdate({_id:userId},updateQuery,{new:true,runValidators:true});
        if(!response){
            throw{err:"User not found",code:404}
        }
        return response;

    }
    catch(error){
       console.log(error)
       if(error.name=='ValidationError')
       {
        let err={};
        Object.keys(error.errors).forEach(key=>{
            err[key]=error.errors[key].message;
        })
        throw{err:err,code:422}
       }
    }
}

module.exports={
    createUser,
    getUserByemail,
    getUserById,
    updateUserRoleOrStatus
}
