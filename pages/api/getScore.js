import axios from 'axios';
import SQL from 'sql-template-strings';
import db from '../../lib/db';
import { Movie } from '../../models/movie';

export default async (req, res) => {
    try {
        const movieName = req.body.movie;
        console.log(movieName);

        if (!movieName)
            return res.status(400).json({ error: "'movie' parameter required" });

        let movie = new Movie(movieName);

        // Check DB cache to reduce # of API calls
        const dbResp = await db.query(SQL`SELECT score, poster FROM movies WHERE request = ${movieName}`);
        console.log(dbResp);
        if (dbResp[0]) {
            movie.score = dbResp[0].score;
            movie.poster = dbResp[0].poster;
        }
        else {
            // Call omdb api w/ movie name
            const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURI(movieName)}&apikey=${process.env.OMDB_API_KEY}`);
            console.log(response.data);

            // retrieve rotten tomatoes rating
            movie.score = response.data.Ratings.find((rating) => rating.Source === "Rotten Tomatoes").Value.replace(/\D/g, '');
            movie.poster = response.data.Poster;

            // Insert value into DB
            const dbUpdate = await db.query(SQL`INSERT INTO movies (request, score, poster) VALUES (${movieName}, ${movie.score}, ${movie.poster})`);
            console.log(dbUpdate);
        }
        console.log(movie);

        return res.status(200).json(movie);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error finding Movie' });
    }
}