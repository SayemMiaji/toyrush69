# ToyRush Bangladesh — Next.js 15 + MongoDB + Tailwind

A minimal e-commerce for ToyRush 🇧🇩 with:
- Shop (pagination), Product page (+ Add to cart & Buy now)
- Checkout -> creates orders
- Tracking by mobile number
- Admin panel (Basic Auth) to manage **categories** (feature/unfeature, edit, delete) and **products** (multi-image, qty, sold-out, edit, delete), and **orders** (update status)
- Policy pages (Terms, Privacy, Shipping & Returns)
- Cart drawer with quantity controls and subtotal

## Quick start
```bash
npm i
cp .env.example .env.local
# edit .env.local -> set MONGODB_URI, ADMIN_USER, ADMIN_PASS
npm run dev
```

Open http://localhost:3000  
Admin: visit `/admin` (browser prompts for the username/password from `.env.local`).

## MongoDB URI examples

### Local MongoDB
```
MONGODB_URI=mongodb://127.0.0.1:27017/toyrush
```

### MongoDB Atlas (SRV)
```
MONGODB_URI=mongodb+srv://toyrush_user:Strong%21Pass%4024@cluster0.abcd123.mongodb.net/toyrush?retryWrites=true&w=majority&appName=ToyRush
```
> URL-encode special characters in the password: `@` → `%40`, `!` → `%21`, etc.

## Path alias
We use `@/` imports. Included `jsconfig.json`:
```json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["*"] } } }
```

## Production notes
- Use S3/R2 for image uploads instead of local `/public/uploads`.
- Replace Basic Auth with proper auth (NextAuth or custom).
- On Vercel, add environment variables in Project Settings.
