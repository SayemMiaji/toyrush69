'use client'
import { useRouter, useSearchParams } from 'next/navigation';
export default function Pagination({ page, pages }){
  const router = useRouter();
  const params = useSearchParams();
  const go = (n)=>{
    const q = new URLSearchParams(params.toString());
    q.set('page', String(n));
    router.push(`/shop?${q.toString()}`)
  }
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button disabled={page<=1} onClick={()=>go(page-1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">Prev</button>
      {Array.from({length: pages}).map((_,i)=>{
        const n=i+1; return (
          <button key={n} onClick={()=>go(n)} className={`rounded-lg border px-3 py-1 text-sm ${n===page? 'bg-black text-white dark:bg-white dark:text-black':''}`}>{n}</button>
        )
      })}
      <button disabled={page>=pages} onClick={()=>go(page+1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">Next</button>
    </div>
  )
}
