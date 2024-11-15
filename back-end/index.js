// index.js
const express = require("express");
const { getMagnetLinks } = require("./src/scraper.js");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to the Movie Magnet Link Scraper!");
});

app.get("/search/:name", async (req, res) => {
  
  const  movieName  = req.params.name;
  if (!movieName) return res.status(400).send("Please provide a movie name.");

  try {
    // Fetch the top 10 magnet links for the movie search
    const magnetLinks = await getMagnetLinks(movieName);
    if (!magnetLinks || magnetLinks.length === 0) {
      return res.status(404).send("No magnet links found.");
    }

    // Return the top 10 magnet links
    res.json({ results: magnetLinks });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
