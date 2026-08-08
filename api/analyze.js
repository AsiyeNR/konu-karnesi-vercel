export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sunucuda GEMINI_API_KEY ortam değişkeni bulunamadı.' });
  }

  try {
    const { system, text, mime, base64 } = req.body || {};
    if (!base64 || !mime) {
      return res.status(400).json({ error: 'Görsel verisi eksik.' });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { 
            parts: [{ 
              text: (system || '') + " Lütfen cevabını markdown blokları (```json ... ```) kullanmadan, SADECE saf bir JSON dizisi olarak ver. Örnek format: [{\"no\":1,\"konu\":\"...\"}]" 
            }] 
          },
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
    
    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ 
        error: data.error?.message || 'Gemini API hata döndürdü.' 
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu içi hata: ' + (err.message || err) });
  }
}