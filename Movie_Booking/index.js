const express = require("express");
const mongoose= require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

const movieRoutes=require("./routes/movie.routes")
const theatreRoutes=require("./routes/theatre.routes")
const authRoutes=require("./routes/auth.routes")
const userRoutes=require("./routes/user.routes")
const bookingRoutes=require("./routes/booking.routes")
const showRoutes=require("./routes/show.routes")
const paymentRoutes=require("./routes/payments.routes")
const viewRoutes=require("./routes/view.routes")

dotenv.config();
const app = express();//express app object

// View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//configuring body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewRoutes(app);
movieRoutes(app);
authRoutes(app);
theatreRoutes(app)
userRoutes(app)
bookingRoutes(app);
showRoutes(app);
paymentRoutes(app);



// Server listen
if(process.env.NODE_ENV==="production"){
    app.listen(3000, async () => {
        console.log("Server is running on port 3000");

       try{ await mongoose.connect(process.env.PROD_DB_URL);
       console.log("Connected to MongoDBAtlas");

       }
       catch(error){
        console.log(error);
       } 
    }); 
}else{
    app.listen(3000, async () => {
        console.log("Server is running on port 3000");

       try{ await mongoose.connect(process.env.DB_URI);
       console.log("Connected to MongoDB");

       }
       catch(error){
        console.log(error);
       } 
    }); 
}

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
