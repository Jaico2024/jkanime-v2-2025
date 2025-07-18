const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ error: 'Falta el parámetro de búsqueda: q' });

  try {
    const response = await axios.get(`https://jkanime.net/buscar/${encodeURIComponent(q)}`);
    const $ = cheerio.load(response.data);
    const results = [];

    $('.anime__item').each((i, el) => {
      const title = $(el).find('.anime__title a').text().trim();
      const slug = $(el).find('.anime__title a').attr('href').split('/')[1];
      const poster = $(el).find('img').attr('src');

      results.push({ title, slug, poster });
    });

    return res.status(200).json(results);
  } catch (err) {
    console.error('Scraper error:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};
