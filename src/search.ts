import puppeteer from 'puppeteer';

export default async function handler(req: any, res: any) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Parámetro "q" requerido' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new', // Usa 'new' o true, según el entorno
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(`https://jkanime.net/buscar/${encodeURIComponent(q)}`, {
      waitUntil: 'domcontentloaded',
    });

    // Esperamos que aparezcan los resultados
    await page.waitForSelector('.anime__item', { timeout: 10000 });

    // Extraer datos
    const results = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.anime__item'));
      return items.map(item => {
        const title = item.querySelector('.anime__title')?.textContent?.trim() || '';
        const url = item.querySelector('a')?.getAttribute('href') || '';
        const image = item.querySelector('img')?.getAttribute('src') || '';
        return { title, url: `https://jkanime.net${url}`, image };
      });
    });

    await browser.close();
    return res.status(200).json({ results });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return res.status(500).json({
      error: 'Scraping fallido',
      message: error.message,
    });
  }
}
