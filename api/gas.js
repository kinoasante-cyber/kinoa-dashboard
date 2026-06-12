export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzNk_8hCbTpOqDTXTHSFMEsvyPvQKZxuHVO0BazoISllCtaNvqbjh40vTFMKXV41rDQ/exec';

  try {
    if (req.method === 'POST') {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          // pas du JSON valide, on transmet la chaîne telle quelle
        }
      }
      const bodyStr = JSON.stringify(payload);
      console.log('[api/gas] req.body:', bodyStr);

      const upstream = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        body: bodyStr,
      });

      const raw = await upstream.text();
      console.log('[api/gas] GAS raw response:', raw);

      try {
        const data = JSON.parse(raw);
        res.status(200).json(data);
      } catch {
        res.status(502).json({ error: 'Réponse non-JSON du serveur GAS', raw });
      }
    } else {
      const search = new URL(req.url, 'http://localhost').search;
      const upstream = await fetch(GAS_URL + search, { redirect: 'follow' });

      const raw = await upstream.text();
      console.log('[api/gas] GAS raw response:', raw);

      try {
        const data = JSON.parse(raw);
        res.status(200).json(data);
      } catch {
        res.status(502).json({ error: 'Réponse non-JSON du serveur GAS', raw });
      }
    }
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
