const showService=require("../services/show.service")
const {successResponseBody,errorResponseBody}=require("../utils/responsebody")
const {STATUS_CODES}=require("../utils/constants")

const createShow=async(req,res)=>{
    try {
       const response=await showService.createShow(req.body);
       successResponseBody.message="Show created successfully";
       successResponseBody.data=response;
       return res.status(STATUS_CODES.CREATED).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const getShows=async(req,res)=>{
    try {
        const response=await showService.getShows(req.query);
        successResponseBody.message="Shows fetched successfully";
        successResponseBody.data=response;
        return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

const deleteShow=async(req,res)=>{
    try {
        const response=await showService.deleteShow(req.params.id);
        successResponseBody.message="Show deleted successfully";
        successResponseBody.data=response;
        return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}
const updateShow=async(req,res)=>{
    try {
        const response=await showService.updateShow(req.params.id,req.body);
        successResponseBody.message="Show updated successfully";
        successResponseBody.data=response;
        return res.status(STATUS_CODES.SUCCESS).json(successResponseBody);
    } catch (error) {
        if(error.err){
            errorResponseBody.err=error.err;
            return res.status(error.code).json(errorResponseBody);
        }
        errorResponseBody.err=error;
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

module.exports={
    createShow,
    getShows,
    deleteShow,
    updateShow
}