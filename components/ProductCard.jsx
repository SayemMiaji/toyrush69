import Link from 'next/link';
import Image from 'next/image'
import { BLUR_DATA_URL } from '@/lib/blurData'

function StarsSmall({ value=0 }){
  const pct = Math.max(0, Math.min(100, (Number(value)||0)/5*100));
  const dim = 16;
  const Star = (key) => (
    <svg key={key} viewBox="0 0 24 24" width={dim} height={dim} aria-hidden="true" className="shrink-0">
      <path fill="currentColor" d="M12 2.2l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.8 6.6 19l1-6.1-4.4-4.3 6.1-.9L12 2.2z" />
    </svg>
  );
  return (
    <span className="relative inline-flex" aria-label={`${value} out of 5`}>
      <span className="flex text-neutral-500 dark:text-neutral-600">
        {[0,1,2,3,4].map(i => Star(i))}
      </span>
      <span className="absolute inset-0 overflow-hidden" style={{ width: pct + '%' }}>
        <span className="flex text-yellow-500">
          {[0,1,2,3,4].map(i => Star(i))}
        </span>
      </span>
    </span>
  );
}



export default function ProductCard({ p }){
  const isSold = p.soldOut || (p.quantity ?? 0) <= 0;
  const effectivePrice = Number((p.salePrice && p.salePrice>0) ? p.salePrice : (p.price ?? 0));
  const originalPrice = Number((p.regularPrice && p.regularPrice>0) ? p.regularPrice : (p.price ?? 0));
  const onSale = originalPrice > 0 && effectivePrice > 0 && effectivePrice < originalPrice;
  const discountPct = onSale ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;
  return (
    <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:shadow-lg dark:border-white/10 dark:bg-neutral-900">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square w-full overflow-hidden">
        {p.isPreOrder && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-pink-600 px-2 py-0.5 text-xs font-semibold text-white">Pre‑order</span>
        )}
        {(() => {
          const s = p.images?.[0] || null;
          return s ? (
            <Image src={s} alt={p.name} fill sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition group-hover:scale-105  transition group-hover:scale-105"  placeholder="blur" blurDataURL={BLUR_DATA_URL} />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800" />
          );
        })()}
        {isSold && <span className="absolute left-2 top-2 rounded-full bg-red-600 text-white text-xs px-2 py-0.5">Sold out</span>}
{onSale && (
  <span className="absolute right-2 top-2 rounded-full bg-green-600 text-white text-xs px-2 py-0.5">-{discountPct}%</span>
)}{p.salePrice && (p.price || p.regularPrice) && (p.salePrice>0) && ((p.price||p.regularPrice) > p.salePrice) && (
          <span className="absolute right-2 top-2 rounded-full bg-green-600 text-white text-xs px-2 py-0.5">-{Math.round((( (p.price||p.regularPrice) - p.salePrice ) / (p.price||p.regularPrice)) * 100)}%</span>
        )}
      </Link>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-medium"><Link href={`/product/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 min-h-[20px]">
          {p.ratingCount>0 ? (
            <>
              <StarsSmall value={p.ratingAvg} />
              <span>({p.ratingAvg})</span>
            </>
          ) : (
            <span className="opacity-70" title="No reviews yet"><StarsSmall value={0} /></span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-sm flex items-baseline gap-2">
  {onSale ? (
    <>
      <span className="font-semibold text-red-600 dark:text-red-400">৳{effectivePrice}</span>
      <span className="text-neutral-500 line-through">৳{originalPrice}</span>
    </>
  ) : (
    <span className="text-neutral-700 dark:text-neutral-300">৳{effectivePrice || originalPrice}</span>
  )}
</div>
          <Link href={`/product/${p.slug}`} className="px-3 py-1 text-xs rounded-xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-black/60">View</Link>
        </div>
      </div>
    </article>
  )
}