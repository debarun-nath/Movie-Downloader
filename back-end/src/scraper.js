const axios = require("axios");
const cheerio = require("cheerio");

async function getMagnetLinks(movieName) {
  const searchURL = `https://1337x.to/search/${movieName.replace(/ /g, "+")}/1/`;

  try {
    // Fetch the search results page
    const { data } = await axios.get(searchURL);
    const $ = cheerio.load(data);

    // Find the top 10 result links and movie names
    const resultLinks = [];
    $('a[href*="/torrent/"]').each((index, element) => {
      if (index < 10) {
        const link = $(element).attr("href"); // Get the relative link to the torrent details page
        const movieName = $(element).text().trim(); // Get the movie name (text content of the link)
        
        const detailsURL = `https://1337x.to${link}`;

        // Push an object with movie name and torrent details URL to resultLinks array
        resultLinks.push({ name: movieName, detailsURL });
      }
    });

    // Fetch magnet links for each result
    const magnetLinks = await Promise.all(resultLinks.map(async (movie) => {
      const magnetLink = await getMagnetLink(movie.detailsURL);
      return { name: movie.name, magnetLink };
    }));

    return magnetLinks;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching magnet links.");
  }
}

async function getMagnetLink(detailsURL) {
  try {
    // Fetch the details page of the torrent
    const { data } = await axios.get(detailsURL);
    const $ = cheerio.load(data);

    // Extract the magnet link from the details page
    const magnetLink = $('a[href^="magnet:?"]').attr("href");
    return magnetLink;
  } catch (error) {
    console.error(`Error fetching magnet link for ${detailsURL}:`, error);
    return null; // In case no magnet link is found for this torrent
  }
}

module.exports = { getMagnetLinks };
