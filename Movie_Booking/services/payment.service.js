const Payment = require("../models/payment.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Show=require('../models/show.model');
const { STATUS_CODES, BOOKING_STATUS, PAYMENT_STATUS, USER_ROLE } = require("../utils/constants");
const redisClient = require("../utils/redisClient");

const createPayment = async (data) => {
    try {
        // 1. Fetch booking details
        const booking = await Booking.findById(data.bookingId);
        if (!booking) {
            throw {
                err: "No booking found for the corresponding id provided",
                code: STATUS_CODES.NOT_FOUND
            };
        }

        // 2. Guard against duplicate payments
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

        const showIdentifier = `${booking.movieId}_${booking.theatreId}_${booking.timing}`;

        // 3. Check if the 10-minute hold window has expired
        if (Date.now() > new Date(booking.expiresAt).getTime()) {
            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();

            // Release any remaining Redis holds
            for (const seat of (booking.seats || [])) {
                await redisClient.del(`seat:${showIdentifier}:${seat}`);
            }

            throw {
                err: "Booking hold expired (10-minute limit exceeded). Please select seats again.",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        // 4. Validate payment amount against booking total cost
        if (data.amount !== booking.totalCost) {
            await Payment.create({
                bookingId: data.bookingId,
                amount: data.amount,
                status: PAYMENT_STATUS.failed
            });

            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();

            // Release Redis holds
            for (const seat of (booking.seats || [])) {
                await redisClient.del(`seat:${showIdentifier}:${seat}`);
            }

            throw {
                err: `Payment amount (${data.amount}) does not match booking total cost (${booking.totalCost})`,
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        // 5. Create payment record with PENDING status
        const payment = await Payment.create({
            bookingId: data.bookingId,
            amount: data.amount,
            status: PAYMENT_STATUS.pending
        });

        // 6. Atomic check & commit: add seats to occupiedSeats if none are already occupied
        const updatedShow = await Show.findOneAndUpdate(
            {
                movieId: booking.movieId,
                theatreId: booking.theatreId,
                timing: booking.timing,
                occupiedSeats: { $nin: booking.seats } // Guard: none of these seats can be occupied
            },
            {
                $push: {
                    occupiedSeats: { $each: booking.seats }
                },
                $inc: {
                    noOfSeats: -booking.noOfSeats
                }
            },
            { new: true }
        );

        // 7. If show was not updated, another user already booked one of the seats
        if (!updatedShow) {
            payment.status = PAYMENT_STATUS.failed;
            booking.status = BOOKING_STATUS.cancelled;
            await booking.save();
            await payment.save();

            for (const seat of (booking.seats || [])) {
                await redisClient.del(`seat:${showIdentifier}:${seat}`);
            }

            throw {
                err: "Booking failed: One or more selected seats were already booked by another user.",
                code: STATUS_CODES.BAD_REQUEST
            };
        }

        // 8. Success: Update statuses to completed
        payment.status = PAYMENT_STATUS.success;
        booking.status = BOOKING_STATUS.successfull;
        await booking.save();
        await payment.save();

        // 9. Remove temporary Redis holds now that seats are permanently stored in MongoDB
        for (const seat of (booking.seats || [])) {
            await redisClient.del(`seat:${showIdentifier}:${seat}`);
        }

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