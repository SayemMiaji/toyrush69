'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const description = `
Once you send us a product photo or a product link, our team hunts down the most reliable seller and the best price available. 
We’ll reach out to you on WhatsApp with the quote and delivery estimate. If you approve the order and complete payment, 
we’ll source the item and ship it to our China/Malaysia hub. From there, it will be forwarded to Bangladesh and delivered right to your doorstep. 
Typical delivery time is 14–20 business days (depending on supplier and customs). We’ll keep you updated at every step via WhatsApp.
`;

function classNames(...xs){ return xs.filter(Boolean).join(' '); }

export default function PreorderRequestPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [images, setImages] = useState([null, null, null, null]); // four slots
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handlePick = (i) => {
    inputRefs[i]?.current?.click();
  };

  const handleFile = (i, file) => {
    if (!file) return;
    setImages((prev) => {
      const next = [...prev];
      next[i] = Object.assign(file, { preview: URL.createObjectURL(file) });
      return next;
    });
  };

  const removeImage = (i) => {
    setImages((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !productName || !whatsapp) {
      setError('Please fill in all required fields.');
      return;
    }
    const chosen = images.filter(Boolean);
    if (chosen.length < 1) {
      setError('Please upload at least one product image.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('fullName', fullName);
      fd.set('productName', productName);
      fd.set('productUrl', productUrl);
      fd.set('whatsapp', whatsapp);
      images.forEach((f, idx) => { if (f) fd.set('image'+idx, f); });
      const res = await fetch('/api/preorder/requests', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to submit request');
      router.push('/preorder-request-success');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Preorder Request</h1>
      <p className="mb-6 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">{description}</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name<span className="text-red-500">*</span></label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white/60 p-2 outline-none dark:border-white/10 dark:bg-black/40" placeholder="Your full name" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Product name<span className="text-red-500">*</span></label>
          <input value={productName} onChange={e=>setProductName(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white/60 p-2 outline-none dark:border-white/10 dark:bg-black/40" placeholder="e.g., LEGO City Police Car" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Product URL (optional)</label>
          <input value={productUrl} onChange={e=>setProductUrl(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white/60 p-2 outline-none dark:border-white/10 dark:bg-black/40" placeholder="https://example.com/product" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Product images (up to 4)<span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {images.map((img, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-dashed border-black/20 p-2 text-center dark:border-white/20">
                <input
                  ref={inputRefs[i]}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(i, e.target.files?.[0])}
                />
                {img ? (
                  <div className="group relative">
                    <img src={img.preview} alt={`preview ${i+1}`} className="mx-auto aspect-square h-32 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-90 hover:opacity-100"
                      aria-label="Remove image"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePick(i)}
                    className="flex h-32 w-full flex-col items-center justify-center gap-1 rounded-lg bg-black/5 text-xs text-neutral-600 hover:bg-black/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
                  >
                    <span className="text-2xl leading-none">＋</span>
                    <span>Add image {i+1}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">Upload at least one image. Click a box to add or replace.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">WhatsApp number<span className="text-red-500">*</span></label>
          <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white/60 p-2 outline-none dark:border-white/10 dark:bg-black/40" placeholder="+8801XXXXXXXXX" required />
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          By clicking <strong>Submit</strong>, I give ToyRushBD permission to contact me via WhatsApp.
        </p>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={loading} className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:bg-black/60">
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      <div className="mt-8 text-sm text-neutral-500">
        <Link href="/preorder">Back to preorders</Link>
      </div>
    </main>
  );
}
