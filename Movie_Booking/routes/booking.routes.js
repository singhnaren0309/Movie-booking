const bookingController=require("../controllers/booking.controllers")

const authMiddlewares=require("../middlewares/auth.middlewares")

const bookingMiddlewares=require("../middlewares/booking.middlwares")


const routes=(app)=>{
    app.post("/mba/api/v1/bookings",authMiddlewares.isAuthenticated,bookingMiddlewares.validateCreateBookingRequest,bookingController.create)
    app.patch("/mba/api/v1/bookings/:id",authMiddlewares.isAuthenticated,bookingMiddlewares.canChangeStatus,bookingController.update) 
    app.get("/mba/api/v1/bookings",authMiddlewares.isAuthenticated,bookingController.getBooking)
    app.get("/mba/api/v1/bookings/all",authMiddlewares.isAuthenticated,authMiddlewares.isAdmin,bookingController.getAllBooking)
    app.get("/mba/api/v1/bookings/:id",authMiddlewares.isAuthenticated,bookingController.getBookingById)
    
}


module.exports=routes
