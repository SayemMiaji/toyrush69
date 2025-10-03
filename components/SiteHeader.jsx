'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartContext'
import MobileNav from '@/components/MobileNav'

export default function SiteHeader() {
          const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useCart()
  useEffect(() => {
    const saved = localStorage.getItem('theme:dark');
    const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const d = saved ? saved === '1' : prefer;
    setDark(d);
    document.documentElement.classList.toggle('dark', d);
  }, []);
  function toggle(){
    setDark(d => { const next=!d; localStorage.setItem('theme:dark', next?'1':'0'); document.documentElement.classList.toggle('dark', next); return next; })
  }
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-black/30">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            {/* Hamburger on small screens */}
            <button onClick={()=>setMobileOpen(true)} className="mr-1 inline-flex items-center justify-center rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10 md:hidden text-[25px]"  aria-label="Open menu">
              ☰
            </button>
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg6_Di2CkClEsck5DnQB193covSCqXthxocVX_mor8GKBI5NDu9R6U8vUqB-SJ_qnflGNMZ0a-lUFtukl7YAhIkUTgJ7mZobt9bnQWeK2Pa7QpP5n4JpHPCpfy1DBHBksmYX4YOjzf-79j6_hh3grOdSg4nzYlByifR18KnEtq04fAL5uSBUD5eHHkiAuo/s1600/toyrushbd%20tp-min.png" width="80" height="80"/>
</Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden gap-6 md:flex text-sm">
            <Link href="/shop" className="hover:underline">Shop</Link>
                                <Link href="/preorder" className="hover:underline">On Preorder</Link>
            <Link href="/track" className="hover:underline">Track</Link>
            <a href="/categories" className="text-sm hover:underline">Categories</a>
                                <Link href="/preorder-request-item" className="hover:underline">Request Product</Link>

          
</nav>

          <div className="flex items-center gap-2"><button onClick={()=>cart.setOpen(true)} className="relative rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-black/60" aria-label="Open cart">
              Cart
              {cart.count>0 && <span className="ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full bg-black px-2 text-xs text-white dark:bg-white dark:text-black">{cart.count}</span>}
            </button>
            <button onClick={toggle} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Toggle theme" aria-pressed={dark}>
              {dark ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={()=>setMobileOpen(false)} />
      </header>
  )
}
