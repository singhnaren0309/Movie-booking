const movieController=require("../controllers/movie.controllers");
const movieMiddlewares=require("../middlewares/movie.middlewares");
const authMiddlewares=require("../middlewares/auth.middlewares");
const { cacheMovies } = require('../middlewares/cache');

const routes=(app)=>{
    //create movie route
    app.post('/mba/api/v1/movies',authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,movieMiddlewares.validateMovieCreateReq,movieController.createMovie)
    //delete movie route
    app.delete("/mba/api/v1/movies/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,movieController.deleteMovie)
    //get movie route
    app.get("/mba/api/v1/movies/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,movieController.getMovie)
    //update movie route
    app.put("/mba/api/v1/movies/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,movieController.updateMovie)
    
    //patch update movie route
    app.patch("/mba/api/v1/movies/:id",authMiddlewares.isAuthenticated,authMiddlewares.isAdminOrClient,movieController.updateMovie);
    
    //get all movies route admin customer or client can access

    app.get("/mba/api/v1/movies", cacheMovies, movieController.getMovies)
}
module.exports=routes