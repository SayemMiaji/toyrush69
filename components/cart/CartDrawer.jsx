'use client'
import { useCart } from './CartContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function CartDrawer(){
  const router = useRouter()
  const cart = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{ setMounted(true) },[])

  // Lock scroll when open
  useEffect(()=>{
    if (!mounted) return
    if (cart.open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [cart.open, mounted])

  if(!mounted) return null
  return createPortal(
    <div className={`fixed inset-0 ${cart.open? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ zIndex: 220 }}>
      {/* Overlay */}
      <div
        onClick={()=>cart.setOpen(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity ${cart.open? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 210 }} />
      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 shadow-xl transition-transform duration-300 dark:bg-neutral-900 ${cart.open? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform', zIndex: 220 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your cart</h3>
          <button type="button" onClick={()=>cart.setOpen(false)} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close">✕</button>
        </div>
        <div className="mt-4 h-[calc(100vh-10rem)] overflow-y-auto pr-2 space-y-3">
          {cart.items.length===0 && <p className="text-sm text-neutral-600 dark:text-neutral-300">Your cart is empty.</p>}
          {cart.items.map(it=>(
            <div key={it.slug} className="flex gap-3 rounded-xl border border-black/10 p-2 dark:border-white/10">
              <img src={it.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">{it.name}</p>
                  <button type="button" onClick={()=>cart.remove(it.slug)} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Remove">✕</button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 p-1 dark:border-white/10">
                    <button type="button" onClick={()=>cart.setQty(it.slug, Math.max(0, it.qty-1))} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Decrease">−</button>
                    <span className="min-w-[2ch] text-center text-sm">{it.qty}</span>
                    <button type="button" onClick={()=>cart.setQty(it.slug, it.qty+1)} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Increase">+</button>
                  </div>
                  <span className="text-sm">৳{it.price*it.qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 mt-4 space-y-2 border-t border-black/10 pt-3 dark:border-white/10 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">৳{Number(cart.total||0).toFixed(2)}</span>
          </div>
          <button type="button" onClick={()=>{ router.push("/checkout"); setTimeout(()=>cart.setOpen(false), 0); }} className="w-full rounded-xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white dark:border-white/10 dark:bg-white dark:text-black">Checkout</button>
          <button type="button" onClick={()=>cart.setOpen(false)} className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/60">Continue shopping</button>
        </div>
      </aside>
    </div>,
    document.body
  )
}
