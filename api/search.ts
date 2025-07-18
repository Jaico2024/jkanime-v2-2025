import axios from 'axios';
import cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: 'Falta el parámetro q' });
    }

    const url = `https://jkanime.net/buscar/${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://jkanime.net/',
        'Origin': 'https://jkanime.net'
      }
    });

    const $ = cheerio.load(data);
    const results: Array<{ title: string; slug: string; poster: string }> = [];

    $('.anime__item').each((i, el) => {
      const title = $(el).find('.anime__title a').text().trim();
      const href = $(el).find('.anime__title a').attr('href');
      const slug = href ? href.split('/')[1] : null;
      const poster = $(el).find('img').attr('src');

      if (title && slug && poster) {
        results.push({ title, slug, poster });
      }
    });

    return res.status(200).json(results);
  } catch (error: any) {
    console.error('Error en /api/search:', error);
    return res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
}
