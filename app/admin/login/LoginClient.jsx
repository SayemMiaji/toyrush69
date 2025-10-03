
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginClient({ next = '/admin/preorder' }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaQ, setCaptchaQ] = useState('')
  const [captchaT, setCaptchaT] = useState('')
  const [captchaA, setCaptchaA] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function loadCaptcha(){
    try{
      const r = await fetch('/api/admin/auth/captcha', { cache: 'no-store' })
      const d = await r.json()
      setCaptchaQ(d.question || '')
      setCaptchaT(d.captchaToken || '')
      setCaptchaA('')
    }catch{}
  }

  useEffect(()=>{ loadCaptcha() }, [])

  async function onSubmit(e){
    e.preventDefault()
    setLoading(true); setMsg('')
    try{
      const r = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, captchaAnswer: captchaA, captchaToken: captchaT })
      })
      const d = await r.json().catch(()=>({}))
      if(!r.ok){ setMsg(d.error || 'Login failed'); await loadCaptcha(); return }
      router.push(next || '/admin/preorder')
    }catch{
      setMsg('Login error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <div className="rounded-2xl border border-black/10 p-6 shadow-sm dark:border-white/10">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Sign in to access the admin panel.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1">
            <label className="text-xs">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} required className="rounded-xl border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="rounded-xl border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
          </div>

          <div className="grid gap-1">
            <label className="text-xs">Captcha</label>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">{captchaQ || 'Loading…'}</span>
              <button type="button" onClick={loadCaptcha} className="rounded-lg border border-black/10 px-2 py-1 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">Refresh</button>
            </div>
            <input value={captchaA} onChange={e=>setCaptchaA(e.target.value)} required placeholder="Answer" className="mt-1 rounded-xl border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
          </div>

          {msg && <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{msg}</div>}

          <button disabled={loading} className="rounded-xl border border-black/10 bg-black px-4 py-2 font-medium text-white disabled:opacity-60 dark:border-white/10 dark:bg-white dark:text-black">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <p className="mt-4 text-xs text-neutral-500">Default creds (dev): admin / admin123 — set <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD</code> and <code>AUTH_SECRET</code> in your env.</p>
      </div>
    </div>
  )
}
