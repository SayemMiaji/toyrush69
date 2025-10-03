'use client'
import { useEffect, useMemo, useState } from 'react'

function BdFlag(props){
  return (
    <svg viewBox="0 0 160 96" width="24" height="16" aria-hidden="true" {...props}>
      <rect width="160" height="96" fill="#006A4E" />
      <circle cx="70" cy="48" r="28" fill="#F42A41" />
    </svg>
  )
}

export default function Checkout(){
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [giftWrap, setGiftWrap] = useState(false)
  const [cart, setCart] = useState([])
  const [coupon, setCoupon] = useState('')
  const [couponInfo, setCouponInfo] = useState(null)
  const [couponErr, setCouponErr] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [delivery, setDelivery] = useState('inside') // inside/outside
  const [payment, setPayment] = useState('cod') // only cash on delivery
  const [note, setNote] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMsg, setModalMsg] = useState('')

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('tr:cart') || '[]'
      setCart(JSON.parse(raw))
    } catch {}
  }, [])

  const subtotal = useMemo(()=>cart.reduce((s,i)=>s + i.price * i.qty, 0), [cart])
  const deliveryFee = delivery === 'inside' ? 60 : 100
  const discount = couponInfo ? (couponInfo.type==='percent' ? Math.floor(subtotal * (couponInfo.amount/100)) : Math.min(subtotal, couponInfo.amount)) : 0
  const total = Math.max(0, subtotal - discount) + (cart.length ? deliveryFee : 0) + (giftWrap ? 50 : 0)

  async function onSubmit(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        phone: (()=>{ const ph=(form.get('phone')||'').toString().trim(); return ph.startsWith('+88')? ph : `+88${ph}`; })(),
        address: form.get('address'),
        city: form.get('city') || 'Dhaka',
        note: form.get('note') || '',
        items: cart,
        coupon: couponInfo,
        delivery,
        payment,
        giftWrap,
        giftWrapFee: giftWrap ? 50 : 0
      })
    })
    const data = await res.json()
    setLoading(false)
    if(res.ok){
  localStorage.removeItem('tr:cart')
  setCart([])
  setModalMsg(`✅ Order placed successfully!
Order ID: ${data.id}`)
  setShowModal(true)
  // Redirect after 3 seconds
  setTimeout(()=>{ window.location.href = '/' }, 3000)
} else {
      setMessage(data.error || 'Failed to place order')
    }
  }
  return (
    <div className="py-8 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <form onSubmit={onSubmit} className="mt-4 grid max-w-xl gap-3">
          <input name="name" required placeholder="Full name" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <div className="flex rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/60 overflow-hidden"><div className="flex items-center gap-2 px-3 py-2 border-r border-black/10 dark:border-white/10"><span className="text-xl">{/* BD flag */}<BdFlag className="h-4 w-6 rounded-sm" /></span><span className="text-sm font-medium">+88</span></div><input name="phone" required inputMode="numeric" pattern="\d*" maxLength={11} placeholder="01XXXXXXXXX" className="w-full bg-transparent px-3 py-2 text-sm outline-none" onInput={(e)=>{ e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g,'') }} /></div>
          <input name="address" required placeholder="Delivery address" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input name="city" placeholder="City (Dhaka)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <textarea
            name="note"
            placeholder="Special note (optional) — e.g., 'Please call before delivery'"
            className="mt-2 h-24 w-full resize-y rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60"
            onChange={(e)=>setNote(e.target.value)} />

          <div className="mt-2 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
            <p className="font-medium">Delivery</p>
            <label className="mt-2 flex items-center gap-2"><input type="radio" name="delivery" value="inside" checked={delivery==='inside'} onChange={()=>setDelivery('inside')} /> Inside Dhaka (৳60)</label>
            <label className="mt-1 flex items-center gap-2"><input type="radio" name="delivery" value="outside" checked={delivery==='outside'} onChange={()=>setDelivery('outside')} /> Outside Dhaka (৳100)</label>
          </div>

          

          <div className="mt-2 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={giftWrap} onChange={(e)=>setGiftWrap(e.target.checked)} />
              <span>Want gift wrap — ৳50</span>
            </label>
            <p className="mt-1 text-xs text-neutral-500">We’ll wrap your order as a gift.</p>
          </div>

<div className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
            <p className="font-medium">Payment</p>
            <label className="mt-2 flex items-center gap-2"><input type="radio" name="payment" value="cod" checked={payment==='cod'} onChange={()=>setPayment('cod')} /> Cash on delivery</label>
          </div>

          <button disabled={loading || cart.length===0} className="mt-2 rounded-xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-white/10 dark:bg-white dark:text-black">{loading? 'Placing…' : 'Place order'}</button>
          {message && <p className="text-sm">{message}</p>}
        </form>
      </div>

      <aside className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-3 space-y-3">
          {cart.length === 0 && <p className="text-sm text-neutral-600 dark:text-neutral-400">Your cart is empty.</p>}
          {cart.map(it => (
            <div key={it.slug} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <img src={it.image} alt="" className="h-10 w-10 rounded object-cover" />
                <div>
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Qty {it.qty}</p>
                </div>
              </div>
              <span>৳{it.price * it.qty}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
<button
          type="button"
          onClick={()=>setShowCoupon(v=>!v)}
          className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60"
          aria-expanded={showCoupon}
          aria-controls="coupon-panel"
        >
          <span className="font-medium">Have a coupon?</span>
          <span className={`transition-transform ${showCoupon ? 'rotate-180' : ''}`}>⌄</span>
        </button>
        <div
          id="coupon-panel"
          className={`mt-2 overflow-hidden transition-all duration-300 ${showCoupon ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
        >
    <div className="mt-2 flex gap-2">
            <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Enter code" className="flex-1 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            <button onClick={async ()=>{
              setCouponErr(''); setCouponInfo(null);
              const r = await fetch(`/api/coupons/validate?code=${encodeURIComponent(coupon)}`)
              const j = await r.json()
              if(!r.ok || !j.valid){ setCouponErr(j.reason || 'Invalid code'); return; }
              setCouponInfo({ type:j.type, amount:j.amount, code:j.code })
            }} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60">Apply</button>
          </div>
          {couponErr && <p className="mt-1 text-xs text-red-600">{couponErr}</p>}
          {couponInfo && <p className="mt-1 text-xs">Applied: <span className="font-medium">{couponInfo.code}</span> ({couponInfo.type==='percent'? `${couponInfo.amount}% off` : `৳${couponInfo.amount} off`})</p>}
        </div>
        </div>


        <div className="mt-4 space-y-1 border-t border-black/10 pt-3 text-sm dark:border-white/10">
          <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium">৳{subtotal}</span></div>
          {discount>0 && <div className="flex items-center justify-between text-red-600"><span>Discount</span><span className="font-medium">-৳{discount}</span></div>}
          <div className="flex items-center justify-between"><span>Delivery</span><span className="font-medium">৳{cart.length ? deliveryFee : 0}</span></div>
          <div className="flex items-center justify-between border-t border-black/10 pt-2 dark:border-white/10"><span>Total</span><span className="text-base font-semibold">৳{total}</span></div>
        </div>
      </aside>

      {showModal && (
        <div id="order-modal" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setShowModal(false)} aria-hidden="true"></div>
          <div role="dialog" aria-modal="true" className="relative w-[92%] max-w-sm rounded-2xl border border-black/10 bg-white p-5 text-center shadow-2xl dark:border-white/10 dark:bg-neutral-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-green-600/30 bg-green-600/10">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-lg font-semibold">Order Placed</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{modalMsg || 'Thank you for shopping with us.'}</p>
            <p className="mt-3 text-xs text-neutral-500">You will be redirected to the homepage shortly…</p>
            <button
              className="mt-4 w-full rounded-xl border border-black/10 bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:border-white/10 dark:bg-white dark:text-black"
              onClick={()=>{ setShowModal(false); window.location.href='/' }}
            >
              Go to homepage now
            </button>
          </div>
        </div>
      )}
    
    </div>
  )
}
