# Vercel Deploy — Ata Tarifi

Frontend: **https://atatarifi.com** (Vercel)  
API: **https://api.atatarifi.com** (ASP.NET — ayrı host, Vercel dışı)

## Vercel proje ayarları

| Ayar | Değer |
|---|---|
| Root Directory | `TarifDefterim.Web` |
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | _(boş bırakın — `vercel.json` yönetir)_ |
| Install Command | `npm install` |

## Environment Variables (Vercel Dashboard)

Production ortamına ekleyin:

| Değişken | Değer |
|---|---|
| `NODE_ENV` | `production` |
| `SITE_URL` | `https://atatarifi.com` |
| `API_BASE_URL` | `https://api.atatarifi.com` |
| `VITE_API_BASE_URL` | `https://api.atatarifi.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

> `VITE_*` değişkenleri **build sırasında** gerekir. Deploy öncesi tanımlı olmalıdır.

## Domain (Vercel)

1. Vercel → Project → Settings → Domains
2. `atatarifi.com` ekleyin
3. `www.atatarifi.com` → `atatarifi.com` yönlendirmesi önerilir (Vercel redirect rule)

## Backend (API) — Vercel dışı

ASP.NET API ayrı sunucuda çalışmalı (Azure, Railway, VPS vb.).

`appsettings.Production.json` örneği: `TarifDefterim.Api/appsettings.Production.example.json`

- `Cors:AllowedOrigins`: `https://atatarifi.com`, `https://www.atatarifi.com`
- `Frontend:BaseUrl`: `https://atatarifi.com`
- DNS: `api.atatarifi.com` → API sunucusu

## Google OAuth

Authorized JavaScript origins:

- `https://atatarifi.com`
- `https://www.atatarifi.com`

## Deploy sonrası kontrol

- https://atatarifi.com/
- https://atatarifi.com/globalrecipes
- https://atatarifi.com/robots.txt
- https://atatarifi.com/sitemap.xml
