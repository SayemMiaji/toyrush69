
# Remote image hosting via Freeimage.host

This project is configured to upload Admin images to https://freeimage.host using their API v1.

## Setup

1. Create an account and obtain an API key from Freeimage.host.
2. Set the environment variable in Vercel:
   - `FREEIMAGE_API_KEY=...`
3. Deploy. The upload endpoint is `/api/admin/upload` and forwards files to Freeimage.host.

## Notes
- Response from the API includes `image.display_url` and `image.url`. We store these absolute URLs in MongoDB.
- Next.js `next.config.mjs` includes `images.remotePatterns` for `freeimage.host`, `iili.io`, and `i.ibb.co`.
- The Admin panel already sends `multipart/form-data` using the `<input type="file" multiple>` control.
