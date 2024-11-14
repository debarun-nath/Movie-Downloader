// scraper.js
const axios = require("axios");
const cheerio = require("cheerio");

async function getMagnetLinks(movieName) {
  const searchURL = `https://1337x.to/search/${movieName.replace(
    / /g,
    "+"
  )}/1/`;

  try {
    // Fetch the search results page
    const { data } = await axios.get(searchURL);
    const $ = cheerio.load(data);

    // Find the top 10 result links
    const resultLinks = [];
    $('a[href*="/torrent/"]').each((index, element) => {
      if (index < 10) {
        const link = $(element).attr("href");
        const detailsURL = `https://1337x.to${link}`;

        // Fetch the torrent details page to get the magnet link
        resultLinks.push(getMagnetLink(detailsURL));
      }
    });

    // Wait for all magnet links to be fetched
    const magnetLinks = await Promise.all(resultLinks);
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
