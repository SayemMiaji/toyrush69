'use client';
import { useEffect, useState } from 'react';

export default function AdminPreorderRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/preorder/requests');
        const d = await r.json();
        if (!r.ok || !d?.ok) throw new Error(d?.error || 'Failed to load');
        setItems(d.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Preorder Requests</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Date</th>
                <th className="p-2">Name</th>
                <th className="p-2">Product</th>
                <th className="p-2">WhatsApp</th>
                <th className="p-2">URL</th>
                <th className="p-2">Images</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-t border-black/10 dark:border-white/10">
                  <td className="p-2">{new Date(it.createdAt).toLocaleString()}</td>
                  <td className="p-2">{it.fullName}</td>
                  <td className="p-2">{it.productName}</td>
                  <td className="p-2">{it.whatsapp}</td>
                  <td className="p-2">{it.productUrl ? <a className="underline" href={it.productUrl} target="_blank">Link</a> : '-'}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      {(it.images || []).slice(0,4).map((src, idx) => (
                        <img key={idx} src={src} alt="" className="h-10 w-10 rounded object-cover" />
                      ))}
                    </div>
                  </td>
                  <td className="p-2">{it.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
