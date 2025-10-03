'use client'
import { useEffect, useState } from 'react'

export default function Preloader(){
  const [show, setShow] = useState(true)
  useEffect(()=>{
    // hide after hydration + small delay for smoothness
    const t = setTimeout(()=>setShow(false), 300)
    return ()=>clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div aria-hidden="true" className="fixed inset-0 z-[200] grid place-items-center bg-white dark:bg-black">
      <div className="animate-pulse text-center">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-neutral-300 border-t-transparent dark:border-neutral-700" style={{ animation: 'spin 1s linear infinite' }} />
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Loading…</p>
      </div>
    </div>
  )
}
