const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;

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

async function scrapeTextFromPages(links) {
  const results = [];

  for (const link of links) {
    try {
      const { data } = await axios.get(link);
      const $ = cheerio.load(data);
      const text = $("body").text().replace(/\s+/g, " ").trim();
      results.push({ url: link, content: text });
      console.log(`✅ Scraped: ${link}`);
    } catch (err) {
      console.warn(`⚠️ Failed to scrape ${link}: ${err.message}`);
    }
  }

  return results;
}

app.get("/", async (req, res) => {
  const links = await fetchLinksFromSitemap(SITEMAP_URL);
  const results = await scrapeTextFromPages(links.slice(0, 50)); // لتجربة 50 فقط أولًا
  await fs.writeFile("niagara_data.json", JSON.stringify(results, null, 2));
  res.json({ message: "Scraping completed", count: results.length });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
