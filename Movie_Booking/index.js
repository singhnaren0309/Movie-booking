const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const movieRoutes = require("./routes/movie.routes");
const theatreRoutes = require("./routes/theatre.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const bookingRoutes = require("./routes/booking.routes");
const showRoutes = require("./routes/show.routes");
const paymentRoutes = require("./routes/payments.routes");
const { responseContextMiddleware } = require("./utils/responsebody");

// kafka client
const { connectProducer } = require('./utils/kafkaClient');

const app = express(); // express app object

// Enable CORS for direct microservice access
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Per-request isolated response context
app.use(responseContextMiddleware);


// Configuring body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Register routes
movieRoutes(app);
authRoutes(app);
theatreRoutes(app);
userRoutes(app);
bookingRoutes(app);
showRoutes(app);
paymentRoutes(app);



const PORT = process.env.PORT || 3000;
const DB_URI = process.env.NODE_ENV === "production" ? process.env.PROD_DB_URL : process.env.DB_URI;

const startServer = async () => {
    try {
        await mongoose.connect(DB_URI, { dbName: process.env.DB_NAME || 'mba_db' });
        console.log(`Connected to MongoDB (${process.env.NODE_ENV === "production" ? "Atlas" : "Local"})`);

        await connectProducer();
        console.log("Connected to Kafka Producer");

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

/*
MVC=> Models view controllers
It is a design pattern to help us build apps

views=>The part that the user sees ,The UIs,client side code
constrollers=> The Logic of the App,where we write the core logic of the app req recived from views
req sent to models respose sent to views the controllers are a go between views and models they relay data from view to models they also validate and saniize the data.
Models=> The data structure or the schema of the data ,where we define the data to be stored in the db req recived from controllers and res sent to controllers to apply business logic to manipulate the models

-> Route ->  /mba/api/v1/movies
->Type-> Post
movie details will be sent in req body
req body={
    name:"",
    description:""
    casts:[],
    trailerUrl:"",
    language:"",
    release_date:"",
    director:"",
    release_status:""
}
    response structure==>
    { 
        success:true,
        error:{}
        message:"",
        date:{}
    }

*/
