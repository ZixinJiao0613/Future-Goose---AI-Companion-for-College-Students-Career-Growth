export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages array' });
  }

  const apiKey = process.env.TENCENT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TENCENT_API_KEY not set in Vercel Environment Variables' });
  }

  fetch('https://api.hunyuan.cloud.tencent.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'hunyuan-lite',
      messages,
      temperature: 0.7,
      max_tokens: 800
    })
  })
  .then(r => r.text())
  .then(text => {
    try {
      const data = JSON.parse(text);
      if (data.error) return res.status(500).json({ error: data.error.message || 'Tencent API error' });
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid response from Tencent API' });
    }
  })
  .catch(err => {
    return res.status(500).json({ error: err.message });
  });
}
