const Payment = require("../models/payment.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Show=require('../models/show.model');
const { STATUS_CODES, BOOKING_STATUS, PAYMENT_STATUS, USER_ROLE } = require("../utils/constants");

const createPayment = async (data) => {
    try {
        const booking = await Booking.findById(data.bookingId);
        if (!booking) {
            throw {
                err: "No booking found for the corresponding id provided",
                code: STATUS_CODES.NOT_FOUND
            };
        }
        const show = await Show.findOne({movieId:booking.movieId,timing:booking.timing,theatreId:booking.theatreId});

        if (booking.status === BOOKING_STATUS.successfull) {
            throw {
                err: "Booking is already paid and completed",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        if (booking.status === BOOKING_STATUS.cancelled) {
            throw {
                err: "Booking has been cancelled, cannot process payment",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        let bookingTime = booking.createdAt.getTime();
        let currentTime = Date.now();

        let minutes = Math.floor(((currentTime - bookingTime) / 1000) / 60);
        if (minutes > 5) {
            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();
            throw {
                err: "Booking has expired, please create a new booking",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        const payment = await Payment.create({
            bookingId: data.bookingId,
            amount: data.amount
        });

        if (payment.amount !== booking.totalCost) {
            payment.status = PAYMENT_STATUS.failed;
            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();
            await payment.save();
            throw {
                err: `Payment amount (${payment.amount}) does not match booking total cost (${booking.totalCost})`,
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        // Atomic conditional update to prevent race conditions and overbooking
        const updatedShow = await Show.findOneAndUpdate(
            {
                movieId: booking.movieId,
                theatreId: booking.theatreId,
                timing: booking.timing,
                noOfSeats: { $gte: booking.noOfSeats }
            },
            {
                $inc: { noOfSeats: -booking.noOfSeats }
            },
            { new: true }
        );

        if (!updatedShow) {
            payment.status = PAYMENT_STATUS.failed;
            booking.status = BOOKING_STATUS.cancelled;
            await payment.save();
            await booking.save();
            throw {
                err: "Not enough seats available. The remaining seats were just booked by another user.",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        payment.status = PAYMENT_STATUS.success;
        booking.status = BOOKING_STATUS.successfull;
        await payment.save();
        await booking.save();
        return payment;
    } catch (error) {
        throw error;
    }
};

const getPaymentDetailsById = async (id) => {
    try {
        const response = await Payment.findById(id);
        if (!response) {
            throw {
                err: "No payment found for the corresponding id provided",
                code: STATUS_CODES.NOT_FOUND
            };
        }
        return response;
    } catch (error) {
        throw error;
    }
};

const getAllPayments = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw {
                err: "No user found for the given user id",
                code: STATUS_CODES.NOT_FOUND
            };
        }

        let payments;
        if (user.userRole === USER_ROLE.ADMIN) {
            payments = await Payment.find({});
        } else {
            const bookings = await Booking.find({ userId: user._id }).select('_id');
            const bookingIds = bookings.map((b) => b._id);
            payments = await Payment.find({ bookingId: { $in: bookingIds } });
        }
        return payments;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPayment,
    getPaymentDetailsById,
    getAllPayments
};