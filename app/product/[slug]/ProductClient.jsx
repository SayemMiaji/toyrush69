'use client'

import { useMemo, useState, useEffect } from 'react'
import { useCart } from '@/components/cart/CartContext'
import { useToast } from '@/components/toast/ToastContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import TrustBadges from '@/components/TrustBadges'
import { BLUR_DATA_URL } from '@/lib/blurData'

function toEmbedUrl(url){
  if(!url) return '';
  try{
    const u = new URL(url);
    const host = u.hostname.replace('www.','');
    if(host==='youtube.com' || host==='m.youtube.com'){
      const v = u.searchParams.get('v');
      if(v) return `https://www.youtube.com/embed/${v}`;
    }
    if(host==='youtu.be'){
      const id = u.pathname.slice(1);
      if(id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  }catch(_e){ return url }
}

export default function ProductClient({ product, suggested }) {
  const [idx, setIdx] = useState(0)
  const [imgLoading, setImgLoading] = useState(false)
  const router = useRouter()
  const cart = useCart()
  const toast = useToast()

  const images = useMemo(() => {
    return (product?.images?.length ? product.images : ['https://i.ibb.co.com/Z1Wqp1m7/85483964-mario1.jpg'])
  }, [product])

  const isSold = product.soldOut || (product.quantity ?? 0) <= 0
  const unitPrice = product.salePrice && product.salePrice>0 ? product.salePrice : (product.price || product.regularPrice)

  function add() {
    const image = images[idx] || images[0]
    cart.add({ slug: product.slug, name: product.name, price: unitPrice, image }, 1)
    toast.show('Added to cart')
    cart.setOpen(true)
  }
  function buyNow(e){ try{ if(e){ e.preventDefault?.(); e.stopPropagation?.(); }
    const image = images[idx] || images[0]
    localStorage.setItem('tr:cart', JSON.stringify([{ slug: product.slug, name: product.name, price: unitPrice, image, qty: 1 }]))
    router.push('/checkout') } catch(err){ try{ window.location.href='/checkout' }catch(_e){} }
  }

  return (
    <div className="py-8 space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {(() => {
          const s = images[idx] || images[0] || null;
          return s ? (
            <div className="relative aspect-square w-full">
              {imgLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/40">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                </div>
              )}
              <Image src={s} alt={product.name} fill sizes="(min-width:768px) 50vw, 100vw" className="rounded-2xl object-cover" priority placeholder="blur" blurDataURL={BLUR_DATA_URL} onLoadingComplete={() => setImgLoading(false)} />
            </div>
          ) : (
            <div className="relative aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          );
        })()}
          {images.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => { setImgLoading(true); setIdx(i); }}
                  className={`relative aspect-square w-full overflow-hidden rounded-lg border ${i === idx ? 'border-black dark:border-white' : 'border-black/10 dark:border-white/10'}`}
                >
                  <Image src={src} alt="" fill sizes="25vw" className="object-cover"  placeholder="blur" blurDataURL={BLUR_DATA_URL} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          {(product.ratingCount>0) && (
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <Stars value={product.ratingAvg} size='lg' />
              <span>({product.ratingAvg} / 5 · {product.ratingCount} {product.ratingCount===1?'review':'reviews'})</span>
            </div>
          )}
          <p className="mt-3 text-xl font-medium">{product.salePrice && product.salePrice>0 ? (<><span className='mr-2'>৳{product.salePrice}</span><span className='text-sm text-neutral-500 line-through'>৳{product.regularPrice || product.price}</span></>) : (<>৳{product.price || product.regularPrice}</>)}</p>
          <div className="mt-4 flex gap-2">{!product?.isPreOrder && (
            <button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); add(); }} disabled={isSold} className="rounded-xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-white/10 dark:bg-white dark:text-black">
              Add to cart
            </button>
            )}{!product?.isPreOrder && (<button type="button" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); buyNow(); }} disabled={isSold} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-black/60">
              Buy now
            </button>
            )}{isSold && <span className="text-sm text-red-600">Sold out</span>}
          </div>
          <PreorderCTA product={product} />
          <TrustBadges />
          <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: String(product.description ?? 'Carefully curated for builders and collectors.').replace(/\r\n/g,'\n').replace(/<\s*br\s*\/?\s*>/gi,'\n').replace(/\n/g,'<br />') }} />
          
        {/* Product video dropdown */}
      {product?.videoUrl && (
        <div className="mt-4 rounded-xl border border-black/10 p-3 dark:border-white/10">
          <details className="group">
            <summary className="cursor-pointer select-none text-sm font-medium">▶ Watch product video</summary>
            <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg">
              <iframe src={toEmbedUrl(product.videoUrl)} title="Product video" className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen />
            </div>
          </details>
        </div>
      )}
</div>
      </div>

      {Array.isArray(suggested) && suggested.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {suggested.map((s) => { const effectivePrice = Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0)); const originalPrice = Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0)); const onSale = originalPrice > 0 && effectivePrice > 0 && effectivePrice < originalPrice; const discountPct = onSale ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0; return (
              <Link key={s._id} href={`/product/${s.slug}`} className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:shadow-lg dark:border-white/10 dark:bg-neutral-900">
                <div className="relative block aspect-square w-full overflow-hidden">
                  <Image src={(s.images?.[0]) || "https://i.ibb.co.com/Z1Wqp1m7/85483964-mario1.jpg"} alt={s.name} fill sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" className="object-cover transition group-hover:scale-105"  placeholder="blur" blurDataURL={BLUR_DATA_URL} />
                  {(Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0)) > 0 && Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0)) > 0 && Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0)) < Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0))) && (<span className="absolute right-2 top-2 rounded-full bg-green-600 text-white text-xs px-2 py-0.5">-{Math.round(((Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0)) - Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0))) / Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0))) * 100)}%</span>)}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-medium"><span className="hover:underline">{s.name}</span></h3>
                  <div className="mt-1 text-sm flex items-baseline gap-2">{(Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0)) > 0 && Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0)) > 0 && Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0)) < Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0))) ? (<> <span className="font-semibold text-red-600 dark:text-red-400">৳{Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0))}</span> <span className="text-neutral-500 line-through">৳{Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0))}</span> </>) : (<span className="text-neutral-700 dark:text-neutral-300">৳{Number((s.salePrice && s.salePrice>0) ? s.salePrice : (s.price ?? 0)) || Number((s.regularPrice && s.regularPrice>0) ? s.regularPrice : (s.price ?? 0))}</span>)}</div>
                </div>
              </Link>
            )})}
          </div>
        </section>
      )}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Customer reviews</h2>
        <ReviewBlock pid={product._id} productName={product.name} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Questions & Answers</h2>
        <QABlock pid={product._id} />
      </section>

    </div>
  )
}
function ReviewBlock({ pid, productName }){
  const toast = useToast()
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  async function load(){ try{
    const r = await fetch(`/api/reviews?product=${pid}`, { cache:'no-store' });
    const j = await r.json(); setList(j.reviews || [])
  }catch{} }
  useEffect(()=>{ load() }, [])

  async function submit(e){
    e.preventDefault();
    setMsg('')
    const r = await fetch('/api/reviews', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ productId: pid, name, rating, text })
    });
    if(r.ok){
      setName(''); setRating(5); setText('');
      toast.show('Thanks! Your review is awaiting approval.'); setMsg('Thanks! Your review is awaiting approval.');
    } else {
      toast.show('Failed to submit. Please try again.'); setMsg('Failed to submit. Please try again.');
    }
  }

  return (
    <div className="mt-3 grid gap-4">
      {list.length === 0 && <div className="text-sm text-neutral-500">No reviews yet.</div>}
      {list.slice(0,6).map((rv,i)=>(
        <div key={i} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="font-medium">{rv.name || 'Anonymous'}</div>
            <Stars value={rv.rating || 0} />
          </div>
          {rv.text && <p className="mt-1 whitespace-pre-wrap">{rv.text}</p>}
        </div>
      ))}

      <form onSubmit={submit} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
        <div className="font-medium">Write a review</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
          <select value={rating} onChange={e=>setRating(Number(e.target.value))} className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60">
            {[5,4,3,2,1].map(n=>(<option key={n} value={n}>{n} star{n>1?'s':''}</option>))}
          </select>
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`What did you think about ${productName}?`} className="mt-2 h-24 w-full resize-y rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
        <div className="mt-2 flex items-center justify-end gap-2">
          <button className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-black/60">Submit</button>
        </div>
        {msg && <div className="mt-2 text-xs text-neutral-600">{msg}</div>}
      </form>
    </div>
  )
}

function QABlock({ pid }){
  const toast = useToast()
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  async function load(){ try{
    const r = await fetch(`/api/questions?product=${pid}`, { cache:'no-store' });
    const j = await r.json(); setList(j.questions || [])
  }catch{} }
  useEffect(()=>{ load() }, [])

  async function submit(e){
    e.preventDefault();
    setMsg('')
    const r = await fetch('/api/questions', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ productId: pid, name, text })
    });
    if(r.ok){
      setName(''); setText(''); toast.show('Thanks! Your question is awaiting approval.'); setMsg('Thanks! Your question is awaiting approval.');
    } else { setMsg('Failed to submit. Please try again.') }
  }

  return (
    <div className="mt-3 grid gap-4">
      {list.length === 0 && <div className="text-sm text-neutral-500">No questions yet.</div>}
      {list.slice(0,6).map((qa,i)=>(
        <div key={i} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
          <div className="font-medium">{qa.name || 'Anonymous'} asked:</div>
          <p className="mt-1 whitespace-pre-wrap">{qa.text}</p>
          {qa.answer && (
            <div className="mt-2 rounded-lg bg-neutral-50 p-2 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
              <div className="text-xs font-medium">Answer</div>
              <div className="text-sm whitespace-pre-wrap">{qa.answer}</div>
            </div>
          )}
        </div>
      ))}

      <form onSubmit={submit} className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
        <div className="font-medium">Ask a question</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Ask about size, compatibility, shipping…" className="mt-2 h-24 w-full resize-y rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
        <div className="mt-2 flex items-center justify-end gap-2">
          <button className="rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-black/60">Submit</button>
        </div>
        {msg && <div className="mt-2 text-xs text-neutral-600">{msg}</div>}
      </form>
    </div>
  )
}

function Stars({ value=0, size='sm' }){
  const pct = Math.max(0, Math.min(100, (Number(value)||0)/5*100));
  const dim = size==='sm' ? 16 : 22;
  const Star = (key) => (
    <svg key={key} viewBox="0 0 24 24" width={dim} height={dim} aria-hidden="true" className="shrink-0">
      <path fill="currentColor" d="M12 2.2l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.8 6.6 19l1-6.1-4.4-4.3 6.1-.9L12 2.2z" />
    </svg>
  );
  return (
    <span className="relative inline-flex" aria-label={`${value} out of 5`}>
      <span className="flex text-neutral-400 dark:text-neutral-500">
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



/** Pre‑order CTA block (renders only when product.isPreOrder) */
const PreorderCTA = ({ product }) => {
  if (!product?.isPreOrder) return null
  const note = product.preOrderLeadTimeText || 'It will take up to 14–20 working days to arrive at your door step after pre‑ordering.'
  const advance = product.preOrderAdvancePercent ?? 50
  return (
    <div className="mt-3 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
      <div className="text-xs text-neutral-700 dark:text-neutral-300">{note}</div>
      <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Advance payable now: <span className="font-medium">{advance}%</span> via our payment gateway. Balance due as COD.</div>
      <div className="mt-2 flex gap-3">
  <Link href={`/preorder-checkout/${product.slug}`} className="mt-2 inline-block rounded-xl border border-black/10 bg-black px-4 py-2 text-white hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-black">Pre‑order now</Link>
  <a href="https://youtu.be/bNWhvUvMrRM" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"><svg className="inline" fill="#ff0000" width="20px" height="20px" viewBox="0 0 32.00 32.00" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ff0000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.512"></g><g id="SVGRepo_iconCarrier"> <title>youtube</title> <path d="M12.932 20.459v-8.917l7.839 4.459zM30.368 8.735c-0.354-1.301-1.354-2.307-2.625-2.663l-0.027-0.006c-3.193-0.406-6.886-0.638-10.634-0.638-0.381 0-0.761 0.002-1.14 0.007l0.058-0.001c-0.322-0.004-0.701-0.007-1.082-0.007-3.748 0-7.443 0.232-11.070 0.681l0.434-0.044c-1.297 0.363-2.297 1.368-2.644 2.643l-0.006 0.026c-0.4 2.109-0.628 4.536-0.628 7.016 0 0.088 0 0.176 0.001 0.263l-0-0.014c-0 0.074-0.001 0.162-0.001 0.25 0 2.48 0.229 4.906 0.666 7.259l-0.038-0.244c0.354 1.301 1.354 2.307 2.625 2.663l0.027 0.006c3.193 0.406 6.886 0.638 10.634 0.638 0.38 0 0.76-0.002 1.14-0.007l-0.058 0.001c0.322 0.004 0.702 0.007 1.082 0.007 3.749 0 7.443-0.232 11.070-0.681l-0.434 0.044c1.298-0.362 2.298-1.368 2.646-2.643l0.006-0.026c0.399-2.109 0.627-4.536 0.627-7.015 0-0.088-0-0.176-0.001-0.263l0 0.013c0-0.074 0.001-0.162 0.001-0.25 0-2.48-0.229-4.906-0.666-7.259l0.038 0.244z"></path> </g></svg> Learn more</a>
</div>
    </div>
  )
}