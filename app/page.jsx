import dynamic from 'next/dynamic';
const PopupModal = dynamic(()=>import('./components/PopupModal'), { ssr:false });
import Link from 'next/link'
import { dbConnect } from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'
import ProductCard from '@/components/ProductCard'

export const revalidate = 0


export async function generateMetadata(){
  const { dbConnect } = await import('@/lib/db');
  const SiteSettings = (await import('@/models/SiteSettings')).default;
  const SeoMeta = (await import('@/models/SeoMeta')).default;
  await dbConnect();
  const s = await SiteSettings.findOne({}).lean();
  const e = await SeoMeta.findOne({ path: '/' }).lean();
  const title = (e?.title || s?.siteTitle || 'ToyRush Bangladesh');
  const description = (e?.description || s?.defaultDescription || '');
  const keywords = (e?.keywords || s?.defaultKeywords || '');
  const ogImage = e?.ogImage || s?.ogImage;
  const canonicalBase = s?.canonicalBase || '';
  return {
    title, description, keywords,
    openGraph: { title, description, images: ogImage ? [{ url: ogImage }] : undefined },
    twitter: { card:'summary_large_image', site: s?.twitterHandle || undefined, title, description, images: ogImage ? [ogImage] : undefined },
    alternates: { canonical: canonicalBase ? canonicalBase.replace(/\/$/, '') + '/' : undefined }
  }
}


export default async function Home(){
  await dbConnect();
  const recent = await Product.find({ isPreOrder: { $ne: true } }).sort({ createdAt: -1 }).limit(8).lean()
  const hot = await Product.find({ hot: true, isPreOrder: { $ne: true } }).sort({ updatedAt: -1 }).limit(8).lean()

  const preorder = await Product.find({ isPreOrder: true }).sort({ updatedAt: -1 }).limit(8).lean();
  const featuredCats = await Category.find({ featured: true }).sort({ name: 1 }).limit(8).lean()
  // Load 4 latest products from every category
  const allCats = await Category.find({}).sort({ name: 1 }).lean();
  const categoriesWithProducts = await Promise.all(
    allCats.map(async (c) => {
      const items = await Product.find({ category: c.slug , isPreOrder: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
      return { cat: c, items };
    })
  );


  return (
    <div className="py-8">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-neutral-100 to-white p-8 dark:border-white/10 dark:from-neutral-900 dark:to-neutral-950">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">ToyRush 🇧🇩 — Modern Toys, Minimal Clutter</h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">Dhaka-based. Nationwide delivery. Shop Lego-inspired builds, RC cars, bricks, and collectible sets.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="inline-flex items-center rounded-xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-black">Shop now</Link>
            <Link href="#featured" className="inline-flex items-center rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm dark:border-white/10 dark:bg-black/60">See featured</Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neutral-200/60 blur-3xl dark:bg-white/5" />
      
      
      

      <section id="featured" className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Featured categories</h2>
        {featuredCats.length === 0 && <p className="text-sm text-neutral-600 dark:text-neutral-400">No featured categories yet — mark some in Admin.</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredCats.map(c => (
            <Link key={c._id} href={`/shop?category=${encodeURIComponent(c.slug)}`} className="rounded-2xl border border-black/10 bg-white p-6 text-center transition hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
              <p className="text-sm">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>
</section>

      
      {/* On-page search (boxed, after HERO) */}
      <section className="mt-8">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white/80 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-black/60">
          <form action="/shop" className="flex items-center gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search products..."
              className="flex-1 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 dark:border-white/10 dark:bg-black/50" />
            <button
              type="submit"
              className="h-[42px] rounded-2xl border border-neutral-200 bg-white/90 px-4 text-sm font-medium hover:bg-white dark:border-white/10 dark:bg-black/60"
            >
              Search
            </button>
          </form>
        </div>
      </section>


      
{hot.length > 0 && (
  <section className="mt-10">
    <h2 className="mb-3 text-lg font-semibold">🔥 Hot right now</h2>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {hot.map(p => <ProductCard key={p._id} p={p} />)}
    </div>
  </section>
)}

{/* --- Per-category strips (4 products each) --- */}
{categoriesWithProducts.map(({ cat, items }) =>
  items && items.length > 0 ? (
    <section key={String(cat._id)} className="mt-12">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{cat.name}</h2>
        <Link
          href={`/shop?category=${cat.slug}`}
          className="rounded-xl border border-neutral-200 bg-white/70 px-3 py-1.5 text-sm hover:bg-white/90 dark:border-white/10 dark:bg-black/60"
        >
          View All ↗
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map(p => <ProductCard key={String(p._id)} p={p} />)}
      </div>
    </section>
  ) : null
)}
<section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">New arrivals</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {recent.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
        <div className="mt-4 flex justify-center">
          <Link href="/shop" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/60">View all</Link>
        </div>
      </section>
    
{preorder?.length ? (
  <section id="preorder" className="mt-10">
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-semibold">Preorder</h2>
      <div className="flex gap-2">
        <Link
          href="/preorder"
          className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-black/60"
        >
          View all preorders
        </Link>
        <Link
          href="/preorder-request-item"
          className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-black/60"
        >
          Request item
        </Link>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {preorder.map((p) => (
        <ProductCard key={p._id} p={p} />
      ))}
    </div>
  </section>
) : (
  <section id="preorder" className="mt-10">
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-semibold">Preorder</h2>
      <div className="flex gap-2">
        <Link
          href="/preorder"
          className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-black/60"
        >
          View all preorders
        </Link>
        <Link
          href="/preorder-request-item"
          className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-black/60"
        >
          Request item
        </Link>
      </div>
    </div>
    <p className="text-sm text-neutral-500 dark:text-neutral-400">
      No preorder items available right now.
    </p>
  </section>
)}

</div>
  )
}

{/* Popup */}
<PopupModal />
