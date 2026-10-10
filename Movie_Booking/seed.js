require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Movie = require('./models/movie.model');
const Theatre = require('./models/theatre.model');
const Show = require('./models/show.model');
const { pipeline } = require('@huggingface/transformers');

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.DB_URI, { dbName: process.env.DB_NAME || 'mba_db' });
        console.log("Connected to MongoDB.");

        // 1. Create Admin User
        console.log("Creating admin user...");
        let adminUser = await User.findOne({ email: 'admin@admin.com' });
        if (!adminUser) {
            adminUser = new User({
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'admin@123',
                userRole: 'ADMIN',
                userStatus: 'APPROVED'
            });
            await adminUser.save(); // pre-save hook will hash password
            console.log("Admin user created.");
        } else {
            console.log("Admin user already exists.");
        }

        // 2. Create 20 Movies
        console.log("Creating 20 movies (this may take a few seconds due to embeddings)...");
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const movies = [];
        for (let i = 1; i <= 20; i++) {
            const movieData = {
                name: `Awesome Movie ${i}`,
                description: `This is the epic description for Awesome Movie ${i}. It is full of action, drama, and breathtaking visuals.`,
                casts: [`Actor ${i}A`, `Actor ${i}B`],
                trailerUrl: `http://youtube.com/trailer${i}`,
                language: i % 2 === 0 ? 'English' : 'Spanish',
                release_date: `2024-0${(i%9)+1}-01`,
                director: `Director ${i}`
            };
            
            // Create embedding for Semantic Search
            const textToEmbed = `${movieData.name}. ${movieData.description}`;
            const embedding = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
            movieData.vector_embedding = Array.from(embedding.data);
            
            movies.push(movieData);
        }
        const createdMovies = await Movie.insertMany(movies);
        console.log("20 movies created.");

        // 3. Create 3 Theatres
        console.log("Creating 3 theatres...");
        const theatresData = [
            { name: "PVR Cinemas", city: "Mumbai", state: "MH", pincode: 400001, address: "Mumbai Central", movies: createdMovies.slice(0, 7).map(m => m._id) },
            { name: "INOX Movies", city: "Delhi", state: "DL", pincode: 110001, address: "Connaught Place", movies: createdMovies.slice(7, 14).map(m => m._id) },
            { name: "Cinepolis", city: "Bangalore", state: "KA", pincode: 560001, address: "MG Road", movies: createdMovies.slice(14, 20).map(m => m._id) }
        ];
        const createdTheatres = await Theatre.insertMany(theatresData);
        console.log("3 theatres created.");

        // 4. Create Shows for these movies in these theatres
        console.log("Creating shows...");
        const shows = [];
        for (let t of createdTheatres) {
            for (let movieId of t.movies) {
                // Afternoon Show
                shows.push({
                    movieId: movieId,
                    theatreId: t._id,
                    timing: "14:00",
                    noOfSeats: 100,
                    price: 250,
                    format: "2D"
                });
                // Evening Show
                shows.push({
                    movieId: movieId,
                    theatreId: t._id,
                    timing: "19:00",
                    noOfSeats: 150,
                    price: 350,
                    format: "3D"
                });
            }
        }
        await Show.insertMany(shows);
        console.log(`Created ${shows.length} shows.`);

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error during seeding:", err);
        process.exit(1);
    }
}

seed();
