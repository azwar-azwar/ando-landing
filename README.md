# Ando by Gamatek — Landing Page (static, untuk Vercel)

Landing page produk **Ando** (Aplikasi Nusantara Donasi Online), platform donasi white-label
yang dipasarkan Gamatek. Ando adalah white-label dari platform Ada Ide (lisensi reseller),
sehingga nama dan logo Ada Ide tidak ditampilkan. Konten mengikuti deck produk 2026 dengan harga
dinaikkan 50%; tema mengikuti homepage gamatek.co.id
(Figtree, biru `#4284FF`, teks `#1F2937`, navy `#142157`).
HTML, CSS, dan JS murni. Tidak ada build step atau dependensi.

```
public/                      ← root situs yang di-serve Vercel
  index.html                 ← seluruh konten halaman
  assets/css/ando.css        ← styling + animasi
  assets/js/ando.js          ← hero scroll, reveal, tabs, menu mobile, parallax
  assets/img/                ← screenshot produk, showcase, logo klien, og-ando.jpg
  assets/brand/              ← logo Ando (warna, putih, mark), favicon, logo Gamatek
  assets/fonts/              ← Figtree (self-host)
vercel.json                  ← output dir, header keamanan, cache
_reference/gamatek-home/     ← salinan homepage gamatek.co.id (referensi tema, tidak ikut deploy)
_reference/removed/          ← bagian yang dicabut dari halaman (mis. testimoni klien Ada Ide)
```

## Preview lokal
```bash
python3 -m http.server 8200 --directory public
```
Lalu buka http://127.0.0.1:8200. Jangan dibuka lewat `file://` karena path aset absolut (`/assets/...`).

## Deploy ke Vercel
1. Push folder ini ke repo GitHub/GitLab, lalu *Add New → Project → Import*.
2. Framework Preset: **Other**. Build/Install command dikosongkan; `vercel.json` sudah mengarahkan output ke `public/`.
3. Atau lewat CLI: `npx vercel --prod`.

Setelah domain final ditentukan, ubah `og:image` di `public/index.html` menjadi URL absolut
(mis. `https://ando.gamatek.co.id/assets/img/og-ando.jpg`) supaya preview link di WhatsApp/Facebook muncul.

## Logo Ando
`assets/brand/ando-logo-color.svg`, `ando-logo-white.svg`, `ando-mark.svg` (ikon saja),
`ando-mark-light.svg` (untuk latar biru). Bulan sabit dan gradasinya identik dengan logo Gamatek;
elemen dalamnya diganti hati sebagai simbol donasi. Wordmark memakai font Sora Bold (lisensi OFL)
yang sudah dikonversi menjadi path, jadi tidak bergantung pada font terpasang.

## Mengubah konten
- **Kontak**: cari `628112131550` (WhatsApp) dan `hi@gamatek.co.id` (email) di `index.html`.
  Setiap tombol WA punya pesan pembuka berbeda (demo, paket Starter/Pro/Growth, add-on, FAQ) di parameter `?text=`.
- **Harga & fitur**: section `#harga` (kartu paket + tabel perbandingan), `#layanan`, dan tab `#addon`.
  Section "Mengapa Ando" juga menyebut harga Starter dan biaya setup (jawaban "Hemat biaya, hemat waktu").
- **Animasi hero**: mockup dashboard & ponsel adalah HTML/CSS (bukan gambar). Tiga identitas lembaga contoh
  ada di blok `.m-brand` dan daftar `BRANDS` di `ando.js`. Titik pergantian (brand, donasi masuk, notifikasi)
  diatur di fungsi `renderHero()`.
- Semua animasi dimatikan otomatis bila pengunjung mengaktifkan *reduce motion* di perangkatnya.

## Lapisan sinematik
Murni estetika; dimatikan total oleh *reduce motion*, dan halaman tetap utuh tanpa JS.
- Intro (letterbox navy + judul hero muncul per kata) hanya tampil sekali per sesi tab
  (sessionStorage `ando-cine`), dan dilewati bila URL memakai `#anchor` atau mode hemat data aktif.
  Untuk melihatnya lagi saat review, buka tab baru.
- Judul setiap bab muncul per kata, screenshot "menyala" dari atas ke bawah, section Ekosistem
  terbuka seperti aperture (di desktop mengikuti scroll), harga naik dari slot, kartu Ando dan
  kotak CTA disapu cahaya sekali, footer tampil seperti end credits.
- Kode: blok "Sinematik" di akhir `assets/css/ando.css` dan di `assets/js/ando.js`.
