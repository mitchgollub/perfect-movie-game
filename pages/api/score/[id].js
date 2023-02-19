import axios from 'axios';
import { Movie } from '../../../models/movie';
import mongodb from '../../../lib/mongodb';

export default async (req, res) => {
    try {
        const title = req.query.id;
        console.log(title);

        if (!title)
            return res.status(400).json({ error: "'movie' parameter required" });

        // Check DB cache to reduce # of API calls
        try {
            const foundMovie = await mongodb.findMovieDocument(title);

            if (foundMovie) {
                console.log(`Movie found in database: ${foundMovie.title}`);
                return res.status(200).json(foundMovie);
            }
        }
        catch (e) {
            console.error(`Error finding movie: ${e}`);
        }

        // Call omdb api w/ movie title
        const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURI(title)}&apikey=${process.env.OMDB_API_KEY}`);
        console.log(response.data);

        // Can't find movie
        if (response.data.Error) {
            console.warn(response.data.Error);
            return res.status(404).json({ error: `Could not find Movie '${title}'` });
        }

        // Set return object if found
        const movie = new Movie({
            title: response.data.Title,
            request: title,
            score: getRating(response.data.Ratings),
            poster: response.data.Poster
        });

        // Insert value into DB
        try {
            await mongodb.insertMovieDocument(movie);
        }
        catch (e) {
            console.error(`Error storing movie: ${e}`);
        }

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
