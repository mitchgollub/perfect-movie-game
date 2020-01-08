import axios from 'axios';
import SQL from 'sql-template-strings';
import db from '../../../lib/db';
import { Movie } from '../../../models/movie';

export default async (req, res) => {
    try {
        const movieTitle = req.query.id;
        console.log(movieTitle);

        if (!movieTitle)
            return res.status(400).json({ error: "'movie' parameter required" });

        let movie = new Movie(movieTitle);

        // Check DB cache to reduce # of API calls
        const dbResp = await db.query(SQL`SELECT score, poster, title FROM movies WHERE request = ${movieTitle}`);
        console.log(dbResp);
        if (dbResp[0]) {
            movie = new Movie(
                dbResp[0].title,
                dbResp[0].score,
                dbResp[0].poster
            );

            return res.status(200).json(movie);
        }

        // Call omdb api w/ movie title
        const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURI(movieTitle)}&apikey=${process.env.OMDB_API_KEY}`);
        console.log(response.data);

        // Can't find movie
        if (response.data.Error) {
            console.warn(response.data.Error);
            return res.status(404).json({ error: `Could not find Movie '${movieTitle}'` });
        }

        // Set return object if found
        movie = new Movie(
            response.data.Title,
            getRating(response.data.Ratings),
            response.data.Poster
        );

        // Insert value into DB
        const dbUpdate = await db.query(SQL`INSERT INTO movies (request, score, poster, title) VALUES (${movieTitle}, ${movie.score}, ${movie.poster}, ${movie.title})`);
        console.log(dbUpdate);

        return res.status(200).json(movie);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error finding Movie' });
    }
}

function getRating(ratings) {
    // Try to get Rotten Tomatoes Rating first
    // If not present, get IMDB
    if (ratings) {
        const rottenTomatoesRating = ratings.find((rating) => rating.Source === "Rotten Tomatoes");

        if (rottenTomatoesRating) {
            return rottenTomatoesRating.Value.replace(/\D/g, '');
        }
        else {
            const imdbRating = ratings.find((rating) => rating.Source === "Internet Movie Database");

            if (imdbRating) {
                return imdbRating.Value.replace(/\/10|\./g, '');
            }
        }
    }

    return null;
}
