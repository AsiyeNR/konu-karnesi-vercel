// Bu dosya SUNUCU tarafında çalışır (Vercel Serverless Function).
// Vercel Dashboard > Storage > Upstash (Redis) entegrasyonunu projene eklediğinde
// KV_REST_API_URL ve KV_REST_API_TOKEN ortam değişkenleri otomatik olarak eklenir.
// Buraya hiçbir anahtar YAZMA.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    return;
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOKEN) {
    res.status(500).json({
      error: 'Sunucuda depolama bağlantısı yok. Vercel > Storage kısmından bir Upstash (Redis) entegrasyonu ekleyip projeye bağla, sonra yeniden deploy et.'
    });
    return;
  }

  const { action, key, value } = req.body || {};
  if (!key || typeof key !== 'string' || key.length > 128) {
    res.status(400).json({ error: 'Geçersiz anahtar.' });
    return;
  }
  const redisKey = `konu-karnesi:${key}`;

  try {
    if (action === 'get') {
      const r = await fetch(`${KV_URL}/get/${encodeURIComponent(redisKey)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await r.json();
      res.status(200).json({ value: data.result || null });
    } else if (action === 'set') {
      if (typeof value !== 'string' || value.length > 900000) {
        res.status(400).json({ error: 'Geçersiz veya çok büyük veri.' });
        return;
      }
      const r = await fetch(`${KV_URL}/set/${encodeURIComponent(redisKey)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'text/plain' },
        body: value
      });
      const data = await r.json();
      res.status(200).json({ ok: data.result === 'OK' });
    } else {
      res.status(400).json({ error: 'Geçersiz işlem.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Sunucuda bilinmeyen bir hata oluştu.' });
  }
}
