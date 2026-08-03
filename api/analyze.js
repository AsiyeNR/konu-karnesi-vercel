// Bu dosya SUNUCU tarafında çalışır (Vercel Serverless Function).
// Tarayıcıya hiçbir zaman gönderilmez, dolayısıyla API anahtarı asla
// istemci tarafında görünmez / "sayfa kaynağını görüntüle" ile çalınamaz.
//
// Anahtarı buraya YAZMA. Vercel Dashboard > Project > Settings >
// Environment Variables kısmından GEMINI_API_KEY adında bir değişken ekle.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Sunucuda GEMINI_API_KEY tanımlı değil. Vercel > Settings > Environment Variables kısmından ekleyip yeniden deploy et.'
    });
    return;
  }

  const { system, text, mime, base64 } = req.body || {};
  if (!base64 || !mime) {
    res.status(400).json({ error: 'Eksik görsel verisi gönderildi.' });
    return;
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system || '' }] },
          contents: [{
            role: 'user',
            parts: [
              { inline_data: { mime_type: mime, data: base64 } },
              { text: text || 'Analiz et.' }
            ]
          }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 2000 }
        })
      }
    );
    const data = await geminiRes.json();
    res.status(geminiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Sunucuda bilinmeyen bir hata oluştu.' });
  }
}
