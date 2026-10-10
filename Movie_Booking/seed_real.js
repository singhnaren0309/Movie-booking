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

        console.log("Clearing old data...");
        await Movie.deleteMany({});
        await Theatre.deleteMany({});
        await Show.deleteMany({});
        
        let adminUser = await User.findOne({ email: 'admin@admin.com' });
        if (!adminUser) {
            adminUser = new User({
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'admin@123',
                userRole: 'ADMIN',
                userStatus: 'APPROVED'
            });
            await adminUser.save();
        }

        const realMoviesList = [
            { name: "Inception", desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"], dir: "Christopher Nolan" },
            { name: "The Dark Knight", desc: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", cast: ["Christian Bale", "Heath Ledger"], dir: "Christopher Nolan" },
            { name: "Interstellar", desc: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth's resources are rapidly depleting.", cast: ["Matthew McConaughey", "Anne Hathaway"], dir: "Christopher Nolan" },
            { name: "Titanic", desc: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.", cast: ["Leonardo DiCaprio", "Kate Winslet"], dir: "James Cameron" },
            { name: "Avatar", desc: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.", cast: ["Sam Worthington", "Zoe Saldana"], dir: "James Cameron" },
            { name: "The Matrix", desc: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.", cast: ["Keanu Reeves", "Laurence Fishburne"], dir: "Lana Wachowski, Lilly Wachowski" },
            { name: "The Avengers", desc: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.", cast: ["Robert Downey Jr.", "Chris Evans"], dir: "Joss Whedon" },
            { name: "Jurassic Park", desc: "A pragmatic paleontologist touring an almost complete theme park on an island in Central America is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose.", cast: ["Sam Neill", "Laura Dern"], dir: "Steven Spielberg" },
            { name: "The Lion King", desc: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself. Simba is forced into exile and must return as an adult to take back his homeland.", cast: ["Matthew Broderick", "Jeremy Irons"], dir: "Roger Allers, Rob Minkoff" },
            { name: "Gladiator", desc: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.", cast: ["Russell Crowe", "Joaquin Phoenix"], dir: "Ridley Scott" },
            { name: "Forrest Gump", desc: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.", cast: ["Tom Hanks", "Robin Wright"], dir: "Robert Zemeckis" },
            { name: "Finding Nemo", desc: "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.", cast: ["Albert Brooks", "Ellen DeGeneres"], dir: "Andrew Stanton, Lee Unkrich" },
            { name: "The Godfather", desc: "The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.", cast: ["Marlon Brando", "Al Pacino"], dir: "Francis Ford Coppola" },
            { name: "Pulp Fiction", desc: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", cast: ["John Travolta", "Uma Thurman"], dir: "Quentin Tarantino" },
            { name: "The Shawshank Redemption", desc: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.", cast: ["Tim Robbins", "Morgan Freeman"], dir: "Frank Darabont" },
            { name: "Toy Story", desc: "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.", cast: ["Tom Hanks", "Tim Allen"], dir: "John Lasseter" },
            { name: "E.T. the Extra-Terrestrial", desc: "A troubled child summons the courage to help a friendly alien escape Earth and return to his home world.", cast: ["Henry Thomas", "Drew Barrymore"], dir: "Steven Spielberg" },
            { name: "Spider-Man: No Way Home", desc: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.", cast: ["Tom Holland", "Zendaya"], dir: "Jon Watts" },
            { name: "Dune", desc: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.", cast: ["Timothée Chalamet", "Rebecca Ferguson"], dir: "Denis Villeneuve" },
            { name: "Parasite", desc: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", cast: ["Song Kang-ho", "Lee Sun-kyun"], dir: "Bong Joon Ho" }
        ];

        console.log("Creating 20 REAL movies and generating embeddings...");
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const movies = [];
        
        for (let i = 0; i < realMoviesList.length; i++) {
            const m = realMoviesList[i];
            const movieData = {
                name: m.name,
                description: m.desc,
                casts: m.cast,
                trailerUrl: `http://youtube.com/trailer${i}`,
                language: i % 3 === 0 ? 'Spanish' : 'English',
                release_date: `2024-0${(i%9)+1}-01`,
                director: m.dir
            };
            
            const textToEmbed = `${movieData.name}. ${movieData.description}`;
            const embedding = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
            movieData.vector_embedding = Array.from(embedding.data);
            
            movies.push(movieData);
        }
        const createdMovies = await Movie.insertMany(movies);
        console.log("20 real movies created.");

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
                shows.push({
                    movieId: movieId,
                    theatreId: t._id,
                    timing: "14:00",
                    noOfSeats: 100,
                    price: 250,
                    format: "2D"
                });
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

        console.log("Real movies seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error during seeding:", err);
        process.exit(1);
    }
}

seed();
