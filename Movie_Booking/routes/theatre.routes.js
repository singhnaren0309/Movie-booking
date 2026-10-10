const theatreController=require("../controllers/theatre.controller")
const theatreMiddleware=require("../middlewares/theatre.middleware")
const authMiddlewares=require("../middlewares/auth.middlewares")
/**
 * 
 * @param {*} app -> express app object
 */
const routes=(app)=>{
    //create theatre route
    app.post("/mba/api/v1/theatres",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,theatreMiddleware.validateTheatreCreateReq,theatreController.create);

    //delete theatre route
    app.delete("/mba/api/v1/theatres/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,theatreController.destroy);

    //get theatre route
    app.get("/mba/api/v1/theatres/:id",theatreController.getTheatre);

    //get all theatres route
    app.get("/mba/api/v1/theatres",theatreController.getAllTheatres);

    //update movies in theatre route
    app.patch("/mba/api/v1/theatres/:id/movies",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,theatreMiddleware.validateUpdateMoviesReq,theatreController.updateMovies);

    //update theatre route
    app.patch("/mba/api/v1/theatres/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,theatreController.update);
    
    //update theatre route
    app.put("/mba/api/v1/theatres/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,theatreController.update);
    
    //get movies in theatre route
    app.get("/mba/api/v1/theatres/:id/movies",theatreController.getMoviesInTheatre);
    
    //check movie in theatre route
    app.get("/mba/api/v1/theatres/:theatreId/movies/:movieId",theatreController.checkMovieInTheatre);
}

module.exports=routes