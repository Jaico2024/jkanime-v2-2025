import type { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q as string;
  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro q' });
  }

  try {
    // Lanzamos Puppeteer sin sandbox para Vercel
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const url = `https://jkanime.net/buscar/${encodeURIComponent(q)}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Extraemos los datos
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.anime__item');
      const data = [];
      items.forEach((el) => {
        const titleEl = el.querySelector('.anime__title a');
        const imgEl = el.querySelector('img');
        if (titleEl && imgEl) {
          const title = titleEl.textContent?.trim() || '';
          const href = titleEl.getAttribute('href') || '';
          const slug = href.split('/')[1];
          const poster = imgEl.getAttribute('src') || '';
          data.push({ title, slug, poster });
        }
      });
      return data;
    });

    await browser.close();

    return res.status(200).json(results);
  } catch (error: any) {
    console.error('Error en /api/search con Puppeteer:', error);
    return res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
}
