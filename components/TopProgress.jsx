'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function TopProgress() {
  const pathname = usePathname()
  const search = useSearchParams()

  const [active, setActive] = useState(false)
  const [width, setWidth] = useState(0)
  const timers = useRef([])

  function start() {
    if (active) return
    setActive(true)
    setWidth(10)
    timers.current.push(setTimeout(() => setWidth(30), 120))
    timers.current.push(setTimeout(() => setWidth(60), 400))
    timers.current.push(setTimeout(() => setWidth(80), 1200))
  }

  function done() {
    if (!active) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    setWidth(100)
    setTimeout(() => { setActive(false); setWidth(0) }, 250)
  }

  // Finish when the URL actually changed (path or query)
  useEffect(() => { done() }, [pathname, search])

  // Start when user clicks an internal link (capture phase)
  useEffect(() => {
    function onClick(e) {
      const a = e.target.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href')
      const target = a.getAttribute('target')
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      if (!href || href.startsWith('#') || isModified || (target && target !== '_self')) return
      try {
        const url = new URL(href, window.location.origin)
        if (url.origin !== window.location.origin) return
      } catch { /* relative ok */ }
      start()
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [active])

  // Optional: allow manual control for programmatic navigations
  useEffect(() => {
    const s = () => start()
    const d = () => done()
    window.addEventListener('topprogress:start', s)
    window.addEventListener('topprogress:done', d)
    return () => {
      window.removeEventListener('topprogress:start', s)
      window.removeEventListener('topprogress:done', d)
    }
  }, [active])

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-0.5">
      <div
        aria-hidden="true"
        className="h-full bg-red-600 transition-[width,opacity] duration-200 ease-out dark:bg-red-500"
        style={{ width: active ? `${width}%` : 0, opacity: active ? 1 : 0 }} />
    </div>
  )
}
