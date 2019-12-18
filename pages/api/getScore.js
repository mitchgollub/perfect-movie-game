import axios from 'axios';

export default async (req, res) => {
    try {
        const movieName = req.body.movie;
        console.log(movieName);

        if (!movieName)
            return res.status(400).json({ error: "'movie' parameter required" });

        // TO-DO: Implement DB cache for input -> score
        // Call API if response not in cache

        // Call omdb api w/ movie name
        const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURI(movieName)}&apikey=${process.env.OMDB_API_KEY}`);
        console.log(response.data);

        // retrieve rotten tomatoes rating
        const score = response.data.Ratings.find((rating) => rating.Source === "Rotten Tomatoes").Value.replace(/\D/g, '');
        console.log(score);

        return res.status(200).json({ score: score });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error finding Movie' });
    }
}