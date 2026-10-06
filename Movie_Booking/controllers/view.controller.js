const Movie = require("../models/movie.model");
const Show = require("../models/show.model");
const Theatre = require("../models/theatre.model");
const Booking = require("../models/booking.model");

const getHome = async (req, res) => {
    try {
        const movies = await Movie.find({});
        const nowShowing = movies.filter(m => 
            !m.release_status || 
            m.release_status.toLowerCase() === "released" || 
            m.release_status.toLowerCase() === "now showing"
        );
        const upcoming = movies.filter(m => 
            m.release_status && 
            (m.release_status.toLowerCase() === "unreleased" || 
             m.release_status.toLowerCase() === "coming soon")
        );
        return res.render("index", {
            title: "Movie Booking - Book Tickets Online",
            movies,
            nowShowing: nowShowing.length ? nowShowing : movies,
            upcoming
        });
    } catch (error) {
        console.error("View controller error:", error);
        return res.status(500).render("index", {
            title: "Movie Booking",
            movies: [],
            nowShowing: [],
            upcoming: []
        });
    }
};

const getMovieDetails = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        const shows = await Show.find({ movieId: movie._id }).populate("theatreId");
        
        // Group shows by theatre
        const showsByTheatre = {};
        shows.forEach(show => {
            if (!show.theatreId) return;
            const theatreId = show.theatreId._id.toString();
            if (!showsByTheatre[theatreId]) {
                showsByTheatre[theatreId] = {
                    theatre: show.theatreId,
                    shows: []
                };
            }
            showsByTheatre[theatreId].shows.push(show);
        });

        return res.render("movie", {
            title: `${movie.name} - Movie Details`,
            movie,
            theatresList: Object.values(showsByTheatre)
        });
    } catch (error) {
        console.error("Movie detail view error:", error);
        return res.status(500).send("Error loading movie details");
    }
};

const getBookingPage = async (req, res) => {
    try {
        const show = await Show.findById(req.params.showId).populate("movieId").populate("theatreId");
        if (!show) {
            return res.status(404).send("Show not found");
        }

        return res.render("booking", {
            title: `Book Tickets - ${show.movieId.name}`,
            show
        });
    } catch (error) {
        console.error("Booking view error:", error);
        return res.status(500).send("Error loading booking page");
    }
};

const getPaymentPage = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate("movieId")
            .populate("theatreId");

        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        return res.render("payment", {
            title: "Checkout & Payment",
            booking
        });
    } catch (error) {
        console.error("Payment view error:", error);
        return res.status(500).send("Error loading checkout");
    }
};

const getSignIn = (req, res) => {
    res.render("signin", { title: "Sign In - Movie Booking" });
};

const getSignUp = (req, res) => {
    res.render("signup", { title: "Create Account - Movie Booking" });
};

const getMyBookings = (req, res) => {
    res.render("my-bookings", { title: "My Bookings & Tickets" });
};

module.exports = {
    getHome,
    getMovieDetails,
    getBookingPage,
    getPaymentPage,
    getSignIn,
    getSignUp,
    getMyBookings
};
