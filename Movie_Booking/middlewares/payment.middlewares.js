const { STATUS_CODES } = require('../utils/constants');
const { isValidObjectId } = require('mongoose');
const { errorResponseBody } = require('../utils/responsebody');

const verifyPaymentCreateReq = async (req, res, next) => {
    try {
        if (!req.body.bookingId) {
            errorResponseBody.err = "bookingId is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if (!isValidObjectId(req.body.bookingId)) {
            errorResponseBody.err = "Invalid bookingId";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if (req.body.amount === undefined || req.body.amount === null) {
            errorResponseBody.err = "amount is required";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        if (typeof req.body.amount !== 'number' || req.body.amount <= 0) {
            errorResponseBody.err = "amount must be a positive number";
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorResponseBody);
        }
        next();
    } catch (error) {
        errorResponseBody.err = error.message || "Internal server error";
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

module.exports = {
    verifyPaymentCreateReq,
}