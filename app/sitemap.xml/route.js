import { dbConnect } from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'
import SiteSettings from '@/models/SiteSettings'

function xmlEscape(s=''){
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace( />/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(req){
  // Determine base URL
  let base = ''
  try{
    await dbConnect()
    const s = await SiteSettings.findOne({}).lean()
    base = (s?.canonicalBase || req.nextUrl.origin || '').replace(/\/$/, '')
  }catch(_e){
    base = (req.nextUrl.origin || '').replace(/\/$/, '')
  }

  // Gather data
  let products = []
  let categories = []
  try{
    products = await Product.find({}, { slug: 1, updatedAt: 1 }).lean()
  }catch{}
  try{
    categories = await Category.find({}, { slug: 1, updatedAt: 1 }).lean()
  }catch{}

  const now = new Date().toISOString()

  // Static pages to include
  const staticPaths = [
    '/', '/shop', '/checkout', '/track',
    '/policies/privacy', '/policies/terms', '/policies/shipping-returns'
  ]

  const urls = []

  // Static pages
  for(const p of staticPaths){
    urls.push({
      loc: `${base}${p}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.7'
    })
  }

  // Categories (use /shop?category=slug if no dedicated route)
  for(const c of categories){
    const path = `/shop?category=${encodeURIComponent(c.slug)}`
    urls.push({
      loc: `${base}${path}`,
      lastmod: (c.updatedAt ? new Date(c.updatedAt).toISOString() : now),
      changefreq: 'weekly',
      priority: '0.6'
    })
  }

  // Products
  for(const pr of products){
    const path = `/product/${pr.slug}`
    urls.push({
      loc: `${base}${path}`,
      lastmod: (pr.updatedAt ? new Date(pr.updatedAt).toISOString() : now),
      changefreq: 'daily',
      priority: '0.8'
    })
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
