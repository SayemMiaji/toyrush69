'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function MobileNav({ open, onClose }){
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{ setMounted(true) },[])

  // Lock body scroll when menu is open
  useEffect(()=>{
    if(!mounted) return
    if(open){
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open, mounted])

  if(!mounted) return null

  return createPortal(
    <div className={`fixed inset-0 ${open? 'pointer-events-auto' : 'pointer-events-none'}`} style={{ zIndex: 88 }}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${open? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 80 }} />
      {/* Drawer */}
      <aside
        className={`absolute left-0 top-0 h-full w-full max-w-xs bg-white p-4 shadow-xl transition-transform duration-300 dark:bg-neutral-900 ${open? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform', zIndex: 90 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Close">✕</button>
        </div>
        <nav className="mt-4 flex flex-col gap-2 text-sm">
          <Link href="/shop" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">Shop</Link>
                    <Link href="/preorder" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">On Preorder</Link>
                    <Link href="/categories" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">Categories</Link>
          <Link href="/track" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">Track</Link>
                              <Link href="/preorder-request-item" onClick={onClose} className="rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">Request Product</Link>

                </nav>
      </aside>
    </div>,
    document.body
  )
}
