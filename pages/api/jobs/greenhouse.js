export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token required' });
  try {
    const response = await fetch(
      `https://boards.greenhouse.io/${token}/jobs?content=true`,
      { headers: { 'User-Agent': 'MainQuest/1.0' } }
    );
    if (!response.ok) return res.status(response.status).json({ error: 'Greenhouse error' });
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}