



const errorResponseBody={
    err:{},
    message:"Something went wrong, cannot process the request",
    data:{},
    success:false
}
const successResponseBody={
    message:"Request processed successfully",
    data:{},
    success:true,
}

module.exports={
    errorResponseBody,
    successResponseBody
}
