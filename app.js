const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;
const SITEMAP_URL = "https://reflexcolor.us/traning/sitemap_NCCA2072025.xml";

async function fetchLinksFromSitemap(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data, { xmlMode: true });
    const links = [];
    $("url > loc").each((_, el) => {
      const link = $(el).text();
      if (
        !link.includes("facebook.com") &&
        !link.includes("linkedin.com") &&
        !link.includes("instagram.com") &&
        !link.includes("login") &&
        !link.includes("event")
      ) {
        links.push(link);
      }
    });
    return links;
  } catch (error) {
    console.error("Error loading sitemap:", error.message);
    return [];
  }
}

app.get("/", async (req, res) => {
  const links = await fetchLinksFromSitemap(SITEMAP_URL);
  res.json({ links });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
