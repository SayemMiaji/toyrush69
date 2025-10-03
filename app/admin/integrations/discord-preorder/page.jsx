'use client';
import { useEffect, useState } from 'react';

export default function DiscordPreorderIntegrationPage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/integrations/discord-preorder');
        const d = await r.json();
        if (d?.data?.webhookUrl) setUrl(d.data.webhookUrl);
      } catch(e) {
        setStatus('Failed to load current setting.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setStatus('');
    const r = await fetch('/api/admin/integrations/discord-preorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: url })
    });
    const d = await r.json();
    if (r.ok && d?.ok) setStatus('Saved ✅');
    else setStatus('Save failed ❌ ' + (d?.error || ''));
  };

  const test = async () => {
    setStatus('');
    // Send a sample ping via the public API path (no DB side-effects)
    const r = await fetch('/api/preorder/requests/test-discord', { method: 'POST' });
    const d = await r.json();
    if (r.ok && d?.ok) setStatus('Test sent ✅');
    else setStatus('Test failed ❌ ' + (d?.error || ''));
  };

  if (loading) return <main className="p-6">Loading...</main>;

  return (
    <main className="max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Discord Webhook (Preorder Requests)</h1>
      <label className="mb-1 block text-sm font-medium">Webhook URL</label>
      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="mb-3 w-full rounded-lg border border-black/10 bg-white/60 p-2 outline-none dark:border-white/10 dark:bg-black/40" />
      <div className="flex gap-2">
        <button onClick={save} className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-black/60">Save</button>
        <button onClick={test} className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-black/60">Send test</button>
      </div>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
    </main>
  );
}
