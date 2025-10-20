# 🛡️ Auth Session - Keep It Safe, Keep It Local

Ini folder `auth/`, tempat penyimpanan **session WhatsApp terenkripsi** buat sistem automasi komunikasi yang gue bangun.

⚙️ Folder ini dipake buat nyimpen:
- Session login WhatsApp (`session.data.json`)
- Sender & pre-keys (bagian dari sistem enkripsi)
- Credentials user yang udah authorized

> 🚨 **Sensitive Area!**  
> File-file di dalam sini **jangan pernah** di-commit ke repository publik.  
> Lo bakal ngasih akses penuh ke akun WhatsApp bot-nya kalau ini bocor.

---

## 🔁 Kalau Mau Regenerasi

1. Jalankan bot-nya kayak biasa.
2. Scan QR code dari WhatsApp.
3. Session file akan otomatis ke-generate dan tersimpan di folder ini.

Simple as that.

---

## 🙋‍♂️ Tentang Gue

Hi, I’m **Septian** 👋  
Seorang **freelance developer** yang lagi aktif di **departemen logistik pertambangan**.

Fokus gue:
- Ngebangun sistem otomasi pakai WhatsApp
- Integrasi data operasional (kayak distribusi BBM, ritasi, inventaris)
- Ngeoptimalin kerja lapangan pakai teknologi yang ringan tapi powerfull

Lo bisa anggap gue sebagai jembatan antara **logistic dan otomasi**.

---

## 🧾 Git Ignore Reminder

Pastikan folder `auth/` udah ada di `.gitignore` lo

Karena kalau enggak, yang lo backup malah akses login bot-nya, bukan kodenya 😅
```bash
# Auth sessions
auth/
/env


Stay safe & stay automated!
– Septian 🚀
