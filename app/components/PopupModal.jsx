'use client';

import { useEffect, useState } from 'react';

export default function PopupModal(){
  const [popup, setPopup] = useState(null);
  const [dontShow, setDontShow] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load(){
      try{
        const r = await fetch('/api/popups/active', { cache: 'no-store' });
        const j = await r.json();
        const p = j?.data || null;
        if (!p?._id) return;
        if (typeof window !== 'undefined'){
          const key = `popup_dontshow_${p._id}`;
          const suppressed = window.localStorage.getItem(key);
          if (suppressed === '1') return;
        }
        setPopup(p);
        setOpen(true);
      }catch{}
    }
    load();
  }, []);

  if (!open || !popup) return null;

  const key = `popup_dontshow_${popup._id}`;

  function close(){
    try{
      if (dontShow && typeof window !== 'undefined'){
        window.localStorage.setItem(key, '1');
      }
    }catch{}
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900">
        <button
          onClick={close}
          className="absolute right-2 top-2 rounded-full border px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="space-y-3">
          {popup.title ? <h3 className="text-lg font-semibold">{popup.title}</h3> : null}
          <a href={popup.linkUrl || '#'} target={popup.linkUrl ? '_blank' : undefined} rel="noreferrer">
            <img
              src={popup.imageUrl}
              alt={popup.title || 'Popup'}
              className="w-full rounded-xl border border-black/10 object-cover dark:border-white/10"
            />
          </a>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={dontShow}
              onChange={(e)=>setDontShow(e.target.checked)}
            />
            <span>Don’t show this again</span>
          </label>
          <div className="flex justify-end">
            <button
              onClick={close}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
