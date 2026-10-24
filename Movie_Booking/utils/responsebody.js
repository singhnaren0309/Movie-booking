const responseContextMiddleware = (req, res, next) => {
    next();
};

const successResponseBody = (data = {}, message = "Request processed successfully") => ({
    success: true,
    message,
    data,
    err: {}
});

// Fallback so `res.json(successResponseBody)` does not serialize to empty `{}` in existing controllers
successResponseBody.data = {};
successResponseBody.message = "Request processed successfully";
successResponseBody.toJSON = function () {
    return {
        success: true,
        message: this.message || "Request processed successfully",
        data: this.data || {},
        err: {}
    };
};

const errorResponseBody = (err = {}, message = "Something went wrong, cannot process the request") => ({
    success: false,
    message,
    data: {},
    err
});

// Fallback so `res.json(errorResponseBody)` does not serialize to empty `{}` in existing controllers
errorResponseBody.err = {};
errorResponseBody.message = "Something went wrong, cannot process the request";
errorResponseBody.toJSON = function () {
    return {
        success: false,
        message: this.message || "Something went wrong, cannot process the request",
        data: {},
        err: this.err || {}
    };
};

module.exports = {
    errorResponseBody,
    successResponseBody,
    responseContextMiddleware
};

