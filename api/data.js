// Basit bellek tabanlı geçici depo (Veritabanı kurulumu gerektirmez)
const memoryStore = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
  }

  const { action, key, value } = req.body || {};
  if (!key) {
    return res.status(400).json({ error: 'Geçersiz anahtar.' });
  }

  try {
    if (action === 'get') {
      const val = memoryStore.get(key) || null;
      return res.status(200).json({ value: val });
    } else if (action === 'set') {
      memoryStore.set(key, value);
      return res.status(200).json({ ok: true });
    } else {
      return res.status(400).json({ error: 'Geçersiz işlem.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
}