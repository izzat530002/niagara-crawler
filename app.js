const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const SITEMAP_URL = "https://reflexcolor.us/traning/sitemap_NCCA2072025.xml";

// 1. جلب الروابط من خريطة الموقع
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

// 2. جلب محتوى كل صفحة نصيًا
async function fetchPageContent(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return { url, content: text };
  } catch (e) {
    console.error(`❌ Failed to fetch ${url}`);
    return { url, content: null };
  }
}

// 3. Route لإظهار البيانات
app.get("/", async (req, res) => {
  const links = await fetchLinksFromSitemap(SITEMAP_URL);
  const limited = links.slice(0, 100); // اجعلها أكثر أو أقل حسب الحاجة
  const results = await Promise.all(limited.map(fetchPageContent));

  // حفظ إلى ملف JSON (اختياري)
  fs.writeFileSync("niagara_content.json", JSON.stringify(results, null, 2));

  res.json({ count: results.length, pages: results });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
