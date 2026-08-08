# Konu Karnesi — Vercel Kurulumu

## 1) Önce yaptığın anahtarı iptal et
`AQ....TQWQ` ile biten anahtarı Google AI Studio'da (API Keys sayfasında) sildiğinden emin ol,
sonra yeni bir tane oluştur ("Create API key"). Eski anahtarı asla kullanma — o artık
"ifşa olmuş" sayılır (bir sohbette paylaşıldığı için).

## 2) Bu klasörü deploy et
- Vercel CLI ile: bu klasörde `vercel` komutunu çalıştır (ilk seferinde hesabına bağlanmanı ister)
- veya: bu klasörü bir GitHub reposuna push edip Vercel dashboard'dan "Import Project" ile bağla

## 3) API anahtarını Vercel'e ekle (koda YAZMA)
Vercel Dashboard → projen → **Settings → Environment Variables**
- Key: `GEMINI_API_KEY`
- Value: (yeni oluşturduğun Gemini anahtarı)
- Save, sonra projeyi yeniden deploy et (Deployments → ⋯ → Redeploy)

Bu sayede anahtar sadece sunucu tarafında (`api/analyze.js`) çalışır, tarayıcıya hiç gönderilmez.
Siteye giren kimse anahtarını göremez.

## Klasör yapısı
```
index.html        → uygulamanın kendisi (statik dosya)
api/analyze.js     → Gemini'ye güvenli şekilde istek atan sunucu fonksiyonu
```

## Nasıl çalışıyor
`index.html` içindeki fotoğraf analizi önce `/api/analyze` rotasını dener.
- Vercel'de env değişkeni tanımlıysa → anahtar hiç görünmeden çalışır.
- Rota yoksa (örn. dosyayı yerelde tek başına açtıysan) → uygulama sana kendi
  Gemini anahtarını girmen için bir kutu gösterir (o zaman anahtar sadece o
  tarayıcıda saklanır).

## 4) Cihazlar arası senkronizasyon (Hesap sekmesi)
Uygulamada artık bir "Hesap" sekmesi var: kullanıcı adı + şifre ile bağlanınca,
hangi cihazdan/linkten girersen gir aynı verileri görürsün.

Bunun çalışması için Vercel'de bir Upstash (Redis) deposu eklemen gerekiyor:

1. Vercel Dashboard → projen → **Storage** sekmesi → "Create Database" / "Browse Marketplace" → **Upstash** seç → Redis oluştur
2. Oluşturduktan sonra projene bağla ("Connect to Project") — bu adım `KV_REST_API_URL` ve
   `KV_REST_API_TOKEN` ortam değişkenlerini otomatik olarak ekler (elle bir şey yazmana gerek yok)
3. Projeyi yeniden deploy et (Deployments → ⋯ → Redeploy)

Bundan sonra "Hesap" sekmesinden bir kullanıcı adı + şifre belirleyip "Bağlan" dediğinde
veriler Upstash'e yazılır/okunur. Şifreyi unutursan o veriye tekrar erişilemez — basit,
"şifremi unuttum" mekanizması olmayan bir sistemdir; kritik veriler için önerilmez ama
kişisel deneme takibi için yeterlidir.
