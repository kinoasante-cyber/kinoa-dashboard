export default async function handler(req, res) {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzNk_8hCbTpOqDTXTHSFMEsvyPvQKZxuHVO0BazoISllCtaNvqbjh40vTFMKXV41rDQ/exec';

  try {
    if (req.method === 'POST') {
      const upstream = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        body: JSON.stringify(req.body),
      });
      const data = await upstream.json();
      res.status(200).json(data);
    } else {
      const search = new URL(req.url, 'http://localhost').search;
      const upstream = await fetch(GAS_URL + search, { redirect: 'follow' });
      const data = await upstream.json();
      res.status(200).json(data);
    }
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}