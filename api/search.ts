import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) return res.status(400).json({ error: "No query provided" });

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");

    await page.goto(`https://jkanime.net/buscar/${q}`, {
      waitUntil: "domcontentloaded",
    });

    // ejemplo básico de extracción
    const results = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll(".anime__title")).map((el) => el.textContent.trim());
      return titles;
    });

    await browser.close();

    return res.status(200).json({ results });

  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor",
      message: error.message
    });
  }
}
