export default async function handler(req, res) {
  const GAS_URL = process.env.VITE_GAS_URL;
  const params = new URLSearchParams(req.query);
  const upstream = await fetch(`${GAS_URL}?${params}`, { redirect: 'follow' });
  const body = await upstream.text();
  res.setHeader('Content-Type', 'application/json');
  res.status(upstream.status).send(body);
}
