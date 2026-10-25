# সফর (SAFAR) - গফরগাঁও স্মার্ট ট্রান্সপোর্ট ও ইমার্জেন্সি সার্ভিস

গফরগাঁও উপজেলার স্থানীয় যাত্রী ও চালকদের জন্য সম্পূর্ণ স্বয়ংক্রিয়, লাইভ এবং ফ্রি পরিবহন প্ল্যাটফর্ম।

## 🚀 Cloudflare Pages ডিপ্লয়মেন্ট নির্দেশিকা (100% সমস্যা সমাধান)

ক্লাউডফ্লেয়ারে `npm error Cannot read properties of null (reading 'edgesOut')` ত্রুটি সম্পূর্ণ সমাধানের জন্য নিচের সেটিংস ব্যবহার করুন:

### ১. Cloudflare Pages Settings:
* **Framework preset:** `React (Vite)`
* **Build command:** `npm run build`
* **Build output directory:** `dist`
* **Root directory:** `/` (ফাঁকা রাখুন)

### ২. Environment variables (পরিবেশ ভেরিয়েবল):
* `NODE_VERSION` = `20.18.0` (অথবা `22`)
* `NPM_FLAGS` = `--legacy-peer-deps`

> **নোট:** এই প্রজেক্টে ইতিমধ্যে `.npmrc` (`legacy-peer-deps=true`), `.node-version` (`20.18.0`) এবং একটি সম্পূর্ণ টেস্টেড `package-lock.json` ফাইল যুক্ত রয়েছে, যা ডিপ্লয়মেন্টে কোনো ডিপেন্ডেন্সি এরর হতে দেবে না।

---

## 🛠️ লোকাল ডেভেলপমেন্ট
```bash
npm install
npm run dev
```

## 📦 প্রডাকশন বিল্ড
```bash
npm run build
```
বিল্ড আউটপুট `dist/` ফোল্ডারে তৈরি হবে।
