
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function FilterBar({ categories=[] }){
  const router = useRouter()
  const sp = useSearchParams()

  const [q, setQ] = useState(sp.get('q') || '')
  const [category, setCategory] = useState(sp.get('category') || '')
  const [minPrice, setMinPrice] = useState(sp.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(sp.get('maxPrice') || '')
  const [inStock, setInStock] = useState(sp.get('inStock') === '1')
  const [onSale, setOnSale] = useState(sp.get('onSale') === '1')
  const [sort, setSort] = useState(sp.get('sort') || 'newest')

  // keep state in sync when URL changes
  useEffect(()=>{
    setQ(sp.get('q') || '')
    setCategory(sp.get('category') || '')
    setMinPrice(sp.get('minPrice') || '')
    setMaxPrice(sp.get('maxPrice') || '')
    setInStock(sp.get('inStock') === '1')
    setOnSale(sp.get('onSale') === '1')
    setSort(sp.get('sort') || 'newest')
  }, [sp])

  function buildParams(next={}){
    const params = new URLSearchParams(Array.from(sp.entries()))
    function setOrDel(key, val){
      if (!val) params.delete(key)
      else params.set(key, String(val))
    }
    setOrDel('q', 'q' in next ? next.q : q?.trim())
    setOrDel('category', 'category' in next ? next.category : category || '')
    setOrDel('minPrice', 'minPrice' in next ? next.minPrice : minPrice)
    setOrDel('maxPrice', 'maxPrice' in next ? next.maxPrice : maxPrice)
    setOrDel('inStock', 'inStock' in next ? (next.inStock ? '1' : '') : (inStock ? '1' : ''))
    setOrDel('onSale', 'onSale' in next ? (next.onSale ? '1' : '') : (onSale ? '1' : ''))
    setOrDel('sort', 'sort' in next ? next.sort : (sort || 'newest'))
    params.delete('page')
    return params
  }

  // Debounce text + price inputs, immediate apply for selects/toggles
  useEffect(()=>{
    const t = setTimeout(()=>{
      const params = buildParams()
      router.push(`/shop?${params.toString()}`)
    }, 350)
    return ()=>clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, minPrice, maxPrice])

  function updateAndApply(upd){
    const params = buildParams(upd)
    router.push(`/shop?${params.toString()}`)
  }

  function clearAll(){
    router.push('/shop')
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-black/60">
      <div className="grid grid-cols-2 items-center gap-2 md:grid-cols-7">
        <input
          placeholder="Search products"
          value={q}
          onChange={e=>setQ(e.target.value)}
          className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900" />
        <select
          value={category}
          onChange={e=>updateAndApply({ category: e.target.value })}
          className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <input
          type="number" min="0" step="1" placeholder="Min price"
          value={minPrice}
          onChange={e=>setMinPrice(e.target.value)}
          className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900" />
        <input
          type="number" min="0" step="1" placeholder="Max price"
          value={maxPrice}
          onChange={e=>setMaxPrice(e.target.value)}
          className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900" />
        <select
          value={sort}
          onChange={e=>updateAndApply({ sort: e.target.value })}
          className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="stock-desc">In stock first</option>
        </select>
        <div className="flex items-center justify-start gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={inStock} onChange={e=>updateAndApply({ inStock: e.target.checked })} /> In stock
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={onSale} onChange={e=>updateAndApply({ onSale: e.target.checked })} /> On sale
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={clearAll} className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-white/90 dark:border-white/10 dark:bg-neutral-800">Clear</button>
        </div>
      </div>
    </div>
  )
}
