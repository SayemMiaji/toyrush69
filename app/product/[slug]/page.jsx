import { dbConnect } from '@/lib/db'
import Product from '@/models/Product'
import ProductClient from './ProductClient'

export async function generateMetadata({ params }){
  const { dbConnect } = await import('@/lib/db');
  const SiteSettings = (await import('@/models/SiteSettings')).default;
  const SeoMeta = (await import('@/models/SeoMeta')).default;
  const Product = (await import('@/models/Product')).default;
  const { slug } = await params;
  await dbConnect();
  const s = await SiteSettings.findOne({}).lean();
  const p = await Product.findOne({ slug }).lean();
  const path = `/product/${slug}`;
  const e = await SeoMeta.findOne({ path }).lean();
  const fallbackTitle = p?.name ? `${p.name} — ${s?.siteTitle || 'ToyRush'}` : (s?.siteTitle || 'ToyRush');
  const title = e?.title || fallbackTitle;
  const descFromProduct = (p?.description || '').toString().slice(0, 160);
  const description = e?.description || descFromProduct || s?.defaultDescription || '';
  const keywords = e?.keywords || s?.defaultKeywords || '';
  const ogImage = e?.ogImage || p?.image || s?.ogImage;
  const canonicalBase = s?.canonicalBase || '';
  return {
    title, description, keywords,
    openGraph: { title, description, images: ogImage ? [{ url: ogImage }] : undefined },
    twitter: { card:'summary_large_image', site: s?.twitterHandle || undefined, title, description, images: ogImage ? [ogImage] : undefined },
    alternates: { canonical: canonicalBase ? (canonicalBase.replace(/\/$/, '') + path) : undefined }
  }
}


export const revalidate = 0

export default async function Page({ params }) {
  const { slug } = await params;
  await dbConnect();

  const p = await Product.findOne({ slug }).lean();
  if (!p) {
    return <div className="py-12">Product not found.</div>;
  }

  const where = p.category ? { category: p.category, slug: { $ne: slug } } : { slug: { $ne: slug } };
  const suggested = await Product.find(where).sort({ createdAt: -1 }).limit(8).lean();

  const product = JSON.parse(JSON.stringify(p));
  const suggestions = JSON.parse(JSON.stringify(suggested));

  return <ProductClient product={product} suggested={suggestions} />;
}