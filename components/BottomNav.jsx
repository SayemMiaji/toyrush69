'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/CartContext'

const items = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/shop', label: 'Shop', icon: '🛍️' },
  { href: '/categories', label: 'Browse', icon: '🧩' },
  { href: '/checkout', label: 'Cart', icon: '🛒' }, // href kept for active logic but we won't navigate
]

export default function BottomNav(){
  const pathname = usePathname()
  const cart = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[95] border-t border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/60 md:hidden">
      <ul className="mx-auto flex max-w-lg items-center justify-between px-2">
        {items.map(it=>{
          const isCart = it.label === 'Cart'
          const active = !isCart && (pathname === it.href || (it.href !== '/' && pathname?.startsWith(it.href)))
          const common = `flex h-14 flex-col items-center justify-center rounded-2xl px-4 text-xs ${active? 'font-semibold' : 'opacity-80 hover:opacity-100'}`

          return (
            <li key={it.label}>
              {isCart ? (
                <button
                  type="button"
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); cart.setOpen(true) }}
                  aria-label="Open cart"
                  className={common}
                >
                  <span aria-hidden="true" className="text-base leading-none">{it.icon}</span>
                  <span className="mt-1">Cart{cart.count>0 ? ` (${cart.count})` : ''}</span>
                </button>
              ) : (
                <Link href={it.href} className={common} aria-current={active ? 'page' : undefined}>
                  <span aria-hidden="true" className="text-base leading-none">{it.icon}</span>
                  <span className="mt-1">{it.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
