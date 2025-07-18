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
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);
    const results = [];

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
  } catch (error) {
    console.error('Error en /api/search:', error);
    return res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
}
