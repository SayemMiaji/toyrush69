'use client'
import { useEffect, useState } from 'react'

export default function TrackForm({ kind='regular', onResult }){
  const [phone, setPhone] = useState('');
  const [captchaQ, setCaptchaQ] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadCaptcha(){
    setError('');
    const r = await fetch('/api/captcha');
    const d = await r.json();
    setCaptchaQ(d.question);
    setCaptchaToken(d.captchaToken);
    setCaptchaAnswer('');
  }

  useEffect(()=>{ loadCaptcha(); },[]);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    setError('');
    try{
      const url = kind==='preorder' ? '/api/track/preorder' : '/api/track/regular';
      const r = await fetch(url, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ phone, captchaAnswer, captchaToken })
      });
      const d = await r.json().catch(()=>({ok:false, error:'Invalid JSON'}));
      if(!r.ok || !d.ok){
        setError(d?.error || 'No orders found for this phone. Check digits.');
        onResult && onResult(null);
        await loadCaptcha();
        return;
      }
      onResult && onResult(d.data||[]);
    }catch(err){
      setError('No orders found for this phone. Check digits.');
      onResult && onResult(null);
    }finally{
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_auto_auto] items-end">
      <div className="grid gap-2">
        <label className="text-xs opacity-70">Phone number</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} required
          placeholder="e.g. 01700-123456" className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/60 px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-2">
        <label className="text-xs opacity-70">Captcha: <span className="font-mono">{captchaQ}</span></label>
        <input value={captchaAnswer} onChange={e=>setCaptchaAnswer(e.target.value)} required
          placeholder="Answer" className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/60 px-3 py-2 text-sm w-28" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={loadCaptcha} className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/60 px-3 py-2 text-sm">Refresh</button>
        <button disabled={loading} className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/60 px-4 py-2 text-sm">
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>
      {error ? <div className="md:col-span-3 text-sm text-red-500">{error}</div> : null}
    </form>
  );
}
