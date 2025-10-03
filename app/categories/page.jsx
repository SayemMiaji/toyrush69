import Image from 'next/image'
import { BLUR_DATA_URL } from '@/lib/blurData'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getCategories(){
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const url = `${proto}://${host}/api/categories`
  const r = await fetch(url, { cache: 'no-store' })
  if(!r.ok){
    console.error('Failed to load categories', await r.text())
    return []
  }
  const data = await r.json()
  return data.categories || []
}

export const metadata = {
  title: 'Shop by Category',
  description: 'Browse all categories and discover your next build.'
}

export default async function CategoriesPage(){
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Shop by Category</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(c => (
          <a key={c._id} href={`/shop?category=${encodeURIComponent(c.slug)}`} className="group overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900">
            <div className="relative aspect-[4/3] w-full">
              {c.image ? (
                <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(min-width:1024px) 25vw, 50vw" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-sm text-neutral-500">No image yet</div>
              )}
            </div>
            <div className="p-3">
              <div className="line-clamp-1 text-base font-semibold">{c.name}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
