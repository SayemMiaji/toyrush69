'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/toast/ToastContext'

function Section({ title, children }){
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}
function CouponAdmin(){
  const toast = useToast();
  const [list, setList] = useState([]);

  async function refresh(){
    try {
      const r = await fetch('/api/admin/coupons');
      const j = await r.json();
      setList(j.coupons || []);
    } catch (e) {
      toast.show('Failed to load coupons');
    }
  }
  useEffect(()=>{ refresh() }, []);

  async function create(e){
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      code: f.get('code'),
      type: f.get('type') || 'percent',
      amount: Number(f.get('amount') || 0),
      active: f.get('active') === 'on',
      expiresAt: f.get('expiresAt') || null
    };
    toast.show('Creating coupon…',{duration:900});
    const r = await fetch('/api/admin/coupons', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if(r.ok){ toast.show('Coupon created'); e.currentTarget.reset(); refresh(); }
    else { toast.show('Create failed'); }
  }

  async function toggle(id, active){
    const r = await fetch('/api/admin/coupons/'+id, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ active })
    });
    if(r.ok){ refresh(); }
    else { toast.show('Update failed'); }
  }

  async function removeCoupon(id){
    if(!confirm('Delete coupon?')) return;
    const r = await fetch('/api/admin/coupons/'+id, { method:'DELETE' });
    if(r.ok){ toast.show('Deleted'); refresh(); }
    else { toast.show('Delete failed'); }
  }

  return (
    <div className="admin admin-container">
      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={create} className="grid gap-2 rounded-2xl border p-4 dark:border-white/10">
          <h3 className="font-medium">Create coupon</h3>
          <input name="code" required placeholder="CODE (e.g. RUSH50)"
                 className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <div className="grid grid-cols-2 gap-2">
            <select name="type" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60">
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
            <input name="amount" type="number" step="0.01" min="0" placeholder="Amount"
                   className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" /> Active
            </label>
            <input name="expiresAt" type="date"
                   className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          </div>
          <button type="submit" className="mt-1 rounded-xl border px-3 py-2 text-sm dark:border-white/10">Save</button>
        </form>

        <div className="rounded-2xl border p-4 dark:border-white/10">
          <h3 className="font-medium">Coupons</h3>
          <div className="mt-2 space-y-3">
            {list.map(c => (
              <div key={c._id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm dark:border-white/10">
                <div>
                  <div className="font-medium">{c.code}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {c.type} · {c.amount} {c.expiresAt ? ('· exp ' + new Date(c.expiresAt).toLocaleDateString()) : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button"
                          onClick={()=>toggle(c._id, !c.active)}
                          className="rounded-lg border px-3 py-1 text-xs">
                    {c.active ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button"
                          onClick={()=>removeCoupon(c._id)}
                          className="rounded-lg border px-3 py-1 text-xs">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {list.length===0 && <p className="text-sm text-neutral-600 dark:text-neutral-400">No coupons yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- Products -----------------
function ProductEdit({ p, cats, onClose, onSaved }){
  const toast = useToast()
  const [name, setName] = useState(p.name)
  const [slug, setSlug] = useState(p.slug)
  const [regular, setRegular] = useState(p.regularPrice||0)
  const [sale, setSale] = useState(p.salePrice||0)
  const [category, setCategory] = useState(p.category||'')
  const [quantity, setQuantity] = useState(p.quantity||0)
  const [soldOut, setSoldOut] = useState(!!p.soldOut)
  const [hot, setHot] = useState(!!p.hot)
  const [desc, setDesc] = useState(p.description||'')
  const [videoUrl, setVideoUrl] = useState(p.videoUrl||'')
  const [images, setImages] = useState(p.images||[])

  function removeImage(i){
    setImages(prev => prev.filter((_,idx)=> idx !== i));
  }
  function moveImageUp(i){
    if(i<=0) return;
    setImages(prev => {
      const a = [...prev];
      [a[i-1], a[i]] = [a[i], a[i-1]];
      return a;
    });
  }
  function moveImageDown(i){
    setImages(prev => {
      if(i>=prev.length-1) return prev;
      const a = [...prev];
      [a[i], a[i+1]] = [a[i+1], a[i]];
      return a;
    });
  }
async function save(e){
    e.preventDefault()
    const formEl = e.currentTarget
    // Upload any newly selected images
    const fileInputs = formEl.querySelectorAll('input[name="images"]');
    const files = [];
    fileInputs.forEach(inp => { if (inp && inp.files && inp.files.length) Array.from(inp.files).forEach(f=>files.push(f)); });
    let newImages = [...images]
    if (files && files.length){
      toast.show('Uploading images…', { duration: 1200 });
      const up = new FormData()
      Array.from(files).forEach(f=>up.append('files', f))
      const ur = await fetch('/api/admin/upload', { method:'POST', body:up })
      const data = await ur.json()
      if(!ur.ok || !data.paths){ toast.show('Image upload failed'); console.error('upload error', data); return; }
      newImages = newImages.concat(data.paths||[])
      toast.show('Images uploaded')
    }

    toast.show('Saving product…', { duration: 1000 })
    const body = {
      name, slug,
      price: Number(sale || regular || p.price || 0),
      regularPrice: Number(regular||0),
      salePrice: Number(sale||0),
      category,
      quantity: Number(quantity||0),
      soldOut, hot,
      description: desc,
      images: newImages,
      videoUrl
    }
    const res = await fetch(`/api/admin/products/${p._id}`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    if(res.ok){ toast.show('Product saved'); onSaved?.(); onClose?.(); }
    else { toast.show('Failed to save'); }
  }

  async function del(){
    if (!confirm('Delete this product?')) return;
    toast.show('Deleting product…', { duration: 900 })
    const r = await fetch(`/api/admin/products/${p._id}`, { method:'DELETE' })
    if(r.ok){ toast.show('Product deleted'); onSaved?.(); onClose?.(); }
    else { toast.show('Failed to delete') }
  }

  return (
    <div className="fixed inset-0 z-[95]">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white p-4 dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Edit product</h3>
        <form onSubmit={save} className="mt-3 grid gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <div className="grid grid-cols-2 gap-2">
            <input value={regular} onChange={e=>setRegular(e.target.value)} type="number" placeholder="Regular Price" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            <input value={sale} onChange={e=>setSale(e.target.value)} type="number" placeholder="Sale Price" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          </div>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60">
            <option value="">Select category</option>
            {(cats||[]).map(c => (<option key={c._id} value={c.slug}>{c.name} ({c.slug})</option>))}
          </select>
          <input value={quantity} onChange={e=>setQuantity(e.target.value)} type="number" placeholder="Available quantity" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="min-h-[100px] rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <div className="text-xs">Add more images</div>
          <input
            value={videoUrl}
            onChange={e=>setVideoUrl(e.target.value)}
            placeholder="YouTube Video URL (optional)"
            className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60"
          />
          <input name="images" type="file" multiple accept="image/*" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          
          <div className="flex flex-wrap gap-2">
            {images.map((src,i)=>(
              <div key={i} className="relative">
                <img src={src} className="h-16 w-16 rounded object-cover" />
                <button type="button"
                        onClick={()=>removeImage(i)}
                        title="Remove image"
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-black/10 bg-white text-xs shadow hover:bg-red-50 dark:border-white/10 dark:bg-neutral-800">
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={soldOut} onChange={e=>setSoldOut(e.target.checked)} /> Sold out</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={hot} onChange={e=>setHot(e.target.checked)} /> Hot</label>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="rounded-xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white dark:border-white/10 dark:bg-white dark:text-black">Save</button>
            <button type="button" onClick={del} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/60">Delete</button>
            <button type="button" onClick={onClose} className="ml-auto rounded-xl border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/60">Close</button>
          </div>
        </form>
      </div>

      
    </div>
  )
}

export default function Admin(){
  const toast = useToast();

  // Add Product — local image state for 8 slots (drag & drop + preview)
  const [addImages, setAddImages] = useState(Array(8).fill(null)); // { file, url } | null

  function setSlot(i, file){
    setAddImages(prev => {
      const next = prev.slice();
      try { if (next[i]?.url) URL.revokeObjectURL(next[i].url); } catch(e){}
      next[i] = file ? { file, url: URL.createObjectURL(file) } : null;
      return next;
    });
  }
  function handleFileInput(i, e){
    const f = e?.target?.files?.[0];
    if (f) setSlot(i, f);
  }
  function handleDrop(i, e){
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) setSlot(i, f);
  }
  function allowDrop(e){ e.preventDefault(); }
  function clearSlot(i){ setSlot(i, null); }


  /* ---------- Add Product ---------- */

  // Cleanup object URLs on unmount
  useEffect(()=>{
    return ()=>{
      try {
        (addImages||[]).forEach(s => { if(s?.url) URL.revokeObjectURL(s.url); });
      } catch(e){}
    };
  }, []);

  async function addProduct(e){
    e.preventDefault()
    const formEl = e.currentTarget
    const f = new FormData(formEl)
    const name = f.get('name')
    const slug = f.get('slug')
    const regularPrice = Number(f.get('regularPrice')||0)
    const salePrice = Number(f.get('salePrice')||0)
    const category = f.get('category') || ''
    const quantity = Number(f.get('quantity')||0)
    const description = f.get('description') || ''
    const videoUrl = f.get('videoUrl') || ''
    const soldOut = f.get('soldOut') === 'on'
    const hot = f.get('hot') === 'on'

    // SEO fields
    const seoTitle = f.get('seoTitle') || ''
    const seoDescription = f.get('seoDescription') || ''
    const seoKeywords = f.get('seoKeywords') || ''
    const seoOgImage = f.get('seoOgImage') || ''
    const seoCanonical = f.get('seoCanonical') || ''
    const seoNoindex = f.get('seoNoindex') === 'on'

    let images = [];
    const files = (addImages||[]).filter(Boolean).map(x=>x.file)
    if(!files || files.length===0){ toast.show('Please upload at least 1 product image'); return; }
    if(files && files.length){
      toast.show('Uploading images…', { duration: 1200 });
      const up = new FormData()
      Array.from(files).forEach(file=>up.append('files', file))
      const ur = await fetch('/api/admin/upload', { method:'POST', body: up })
      const data = await ur.json()
      if(!ur.ok || !data.paths){ toast.show('Image upload failed'); console.error('upload error', data); return; }
      images = data.paths || []
      toast.show('Images uploaded')
    }

    toast.show('Creating product…', { duration: 1000 })
    const body = { name, slug, regularPrice, salePrice, price: salePrice || regularPrice, category, quantity, description, videoUrl, soldOut, hot, images }
    const r = await fetch('/api/admin/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if(r.ok){
      const jr = await r.json();
      toast.show('Product created');
      // Create SEO entry if anything provided
      try{
        const seoPayload = {
          path: `/product/${slug}`,
          title: seoTitle || name,
          description: seoDescription || description?.slice(0,160) || '',
          keywords: seoKeywords,
          ogImage: seoOgImage || (images && images[0]) || '',
          noindex: seoNoindex,
          canonical: seoCanonical
        };
        // Only call if user filled at least one field
        if(seoPayload.title || seoPayload.description || seoPayload.keywords || seoPayload.ogImage || seoPayload.noindex || seoPayload.canonical){
          await fetch('/api/admin/seo-meta', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(seoPayload) });
        }
      }catch(e){ console.warn('SEO create failed', e) }
      formEl.reset();
      refreshProducts()
    } else { toast.show('Failed to create product') }
  }

  /* ---------- Products list ---------- */
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  async function refreshProducts(){
    const r = await fetch('/api/products?limit=100')
    const j = await r.json()
    setProducts(j.items || [])
  }
  useEffect(()=>{ refreshProducts() }, [])

  /* ---------- Categories ---------- */
  const [cats, setCats] = useState([])
  async function refreshCats(){
    const r = await fetch('/api/categories')
    const j = await r.json()
    setCats(j.categories || [])
  }
  useEffect(()=>{ refreshCats() }, [])

  async function addCategory(e){
    e.preventDefault()
    const formEl = e.currentTarget
    const f = new FormData(formEl)
    let body = { name: f.get('name'), slug: f.get('slug'), featured: f.get('featured')==='on' };
    const file = formEl.image?.files?.[0];
    if (file){
      const up = new FormData();
      up.append('files', file);
      const ur = await fetch('/api/admin/upload', { method:'POST', body: up });
      const data = await ur.json();
      if(ur.ok && data.paths?.length){ body.image = data.paths[0]; } else { console.error('upload failed', data); }
    }
    const r = await fetch('/api/admin/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if(r.ok){ formEl.reset(); toast.show('Category created'); refreshCats() } else { toast.show('Failed to create category') }
  }
  async function delCategory(id){
    if(!confirm('Delete category?')) return
    const r = await fetch(`/api/admin/categories/${id}`, { method:'DELETE' })
    if(r.ok){ toast.show('Category deleted'); refreshCats() } else { toast.show('Failed to delete category') }
  }
  async function toggleFeatured(cat, featured){
    const r = await fetch(`/api/admin/categories/${cat._id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ featured }) })
    if(r.ok){ toast.show('Updated'); refreshCats() } else { toast.show('Failed to update') }
  }


  async function updateCategoryImage(id, file){
    if(!file) return;
    try{
      const up = new FormData();
      up.append('files', file);
      const ur = await fetch('/api/admin/upload', { method:'POST', body: up });
      const data = await ur.json();
      const path = data.paths?.[0] || '';
      if(!ur.ok || !path){ throw new Error('Upload failed'); }
      await fetch(`/api/admin/categories/${id}`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ image: path }) });
      toast.show('Category image updated');
      refreshCats();
    }catch(e){ console.error(e); toast.show('Failed to update image'); }
  }

  /* ---------- Orders (read-only + status) ---------- */
  const [orders, setOrders] = useState([])
  const [siteMeta, setSiteMeta] = useState({ siteTitle:'', defaultDescription:'', defaultKeywords:'', ogImage:'', twitterHandle:'', canonicalBase:'' })
  const [seoEntries, setSeoEntries] = useState([])
  const [seoModal, setSeoModal] = useState(false)
  const [editSeo, setEditSeo] = useState(null)
  const [editOrder, setEditOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  async function refreshOrders(){
    const r = await fetch('/api/admin/orders')
    const j = await r.json()
    setOrders(j.orders || [])
  }
  useEffect(()=>{ refreshOrders() }, [])

  
  async function setStatus(o, status){
    try{
      const r = await fetch(`/api/admin/orders/${o._id}`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ currentStatus: status })
      });
      if(r.ok){ toast.show('Status updated'); refreshOrders() }
      else { toast.show('Failed to update status') }
    }catch(err){
      toast.show('Failed to update status')
    }
  }
function openOrderEdit(o){ setEditOrder(o); setShowOrderModal(true) }

  async function deleteOrder(o){
    if(!confirm('Delete this order? This cannot be undone.')) return;
    try{
      const r = await fetch(`/api/admin/orders/${o._id}`, { method:'DELETE' });
      if(!r.ok){ toast.show('Failed to delete'); return; }
      toast.show('Order deleted');
      refreshOrders();
    }catch(err){
      toast.show('Failed to delete')
    }
  }
async function saveOrderEdit(e){
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get('name') || '',
      phone: f.get('phone') || '',
      address: f.get('address') || '',
      city: f.get('city') || 'Dhaka',
      delivery: f.get('delivery') || 'inside',
      payment: f.get('payment') || 'cod',
      note: f.get('note') || ''
    };
    try{
      const r = await fetch(`/api/admin/orders/${editOrder._id}`, {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      if(!r.ok){ toast.show('Failed to update order'); return; }
      toast.show('Order updated');
      setShowOrderModal(false);
      setEditOrder(null);
      refreshOrders();
    }catch(err){ toast.show('Failed to update order') }
  }

  async function loadSeo(){
    try{
      const a = await fetch('/api/admin/site-settings'); 
      const b = await fetch('/api/admin/seo-meta');
      const s = await a.json(); 
      const se = await b.json();
      if(s?.settings) setSiteMeta(s.settings);
      if(se?.entries) setSeoEntries(se.entries);
    }catch(_e){}
  }
  useEffect(()=>{ loadSeo() }, [])

  async function saveSiteMeta(e){
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      siteTitle: f.get('siteTitle') || '',
      defaultDescription: f.get('defaultDescription') || '',
      defaultKeywords: f.get('defaultKeywords') || '',
      ogImage: f.get('ogImage') || '',
      twitterHandle: f.get('twitterHandle') || '',
      canonicalBase: f.get('canonicalBase') || '',
      gaMeasurementId: f.get('gaMeasurementId') || '',
      gtmContainerId: f.get('gtmContainerId') || '',
      analyticsEnabled: f.get('analyticsEnabled') === 'on'
    };
    const r = await fetch('/api/admin/site-settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(r.ok){ toast.show('Site metadata saved'); loadSeo() } else { toast.show('Failed to save site metadata') }
  }

  function openSeoModal(entry){ setEditSeo(entry || null); setSeoModal(true) }

  async function saveSeoEntry(e){
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      path: f.get('path') || '',
      title: f.get('title') || '',
      description: f.get('description') || '',
      keywords: f.get('keywords') || '',
      ogImage: f.get('ogImage') || '',
      noindex: f.get('noindex') === 'on',
      canonical: f.get('canonical') || ''
    };
    const url = editSeo? `/api/admin/seo-meta/${editSeo._id}` : '/api/admin/seo-meta';
    const method = editSeo? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(r.ok){ toast.show(editSeo? 'SEO entry updated' : 'SEO entry added'); setSeoModal(false); setEditSeo(null); loadSeo() }
    else { toast.show('Failed to save SEO entry') }
  }

  async function deleteSeo(entry){
    if(!confirm('Delete this SEO entry?')) return;
    const r = await fetch(`/api/admin/seo-meta/${entry._id}`, { method:'DELETE' });
    if(r.ok){ toast.show('SEO entry deleted'); loadSeo() } else { toast.show('Failed to delete') }
  }

  return (
    <div className="container py-8 space-y-8">
      <SalesOverview />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <button
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60"
          onClick={async()=>{ try { await fetch('/api/admin/logout', { method:'POST' }) } catch(e) {} window.location.href = '/' }}
        >
          Logout
        </button>
      </div>
      <Section title="Add Product">
        <form onSubmit={addProduct} className="grid gap-2 md:grid-cols-2">
          <input name="name" required placeholder="Name" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input name="slug" required placeholder="Slug (unique)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input name="regularPrice" type="number" step="1" placeholder="Regular Price (৳)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input name="salePrice" type="number" step="1" placeholder="Sale Price (৳)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <select name="category" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60">
            <option value="">Select category</option>
            {cats.map(c => (<option key={c._id} value={c.slug}>{c.name} ({c.slug})</option>))}
          </select>
          <input name="quantity" type="number" step="1" placeholder="Available quantity" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <div className="col-span-2">
  <p className="text-xs mb-2">Product Images (up to 8). Click or drag & drop into any box. <span className="text-red-600">*</span></p>
  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
    {Array.from({length:8}).map((_,i)=>(
      <div
        key={i}
        onDragOver={allowDrop}
        onDrop={(e)=>handleDrop(i, e)}
        className="relative aspect-square rounded-xl border border-dashed border-black/15 p-2 text-center text-xs dark:border-white/15"
      >
        {addImages[i]?.url ? (
          <div className="h-full w-full">
            <img src={addImages[i].url} alt={`Image ${i+1}`} className="h-full w-full rounded object-cover" />
            <button
              type="button"
              onClick={()=>clearSlot(i)}
              title="Remove"
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border bg-white text-sm font-bold shadow hover:bg-red-50 dark:border-white/10 dark:bg-neutral-800"
            >×</button>
          </div>
        ) : (
          <label className="group flex h-full w-full cursor-pointer flex-col items-center justify-center">
            <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleFileInput(i, e)} />
            <span className="rounded-md border px-2 py-1 text-[11px]">Upload</span>
            <span className="mt-1 opacity-70">Image {i+1}</span>
            <span className="mt-1 opacity-40">(drag & drop)</span>
          </label>
        )}
      </div>
    ))}
  </div>
</div>
          <textarea name="description" placeholder="Description" className="col-span-2 min-h-[100px] rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input name="videoUrl" placeholder="YouTube Video URL (optional)" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
<div className="col-span-2 flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="soldOut" /> Mark sold out</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="hot" /> Mark as hot</label>
              </div>
 
          <div className="col-span-2 mt-2 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
            <p className="mb-2 font-medium">SEO (optional)</p>
            <input name="seoTitle" placeholder="SEO Title (optional)" className="mb-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
            <textarea name="seoDescription" placeholder="SEO Description (optional)" className="mb-2 h-20 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
            <input name="seoKeywords" placeholder="SEO Keywords (comma separated)" className="mb-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
            <input name="seoOgImage" placeholder="OG Image URL (optional)" className="mb-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
            <div className="grid grid-cols-2 gap-2">
              <input name="seoCanonical" placeholder="Canonical URL (optional)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="seoNoindex" /> Noindex</label>
            </div>
          </div>

          

          <button className="col-span-2 rounded-xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white dark:border-white/10 dark:bg-white dark:text-black">Create</button>
        </form>
      </Section>

      <Section title="Manage Products">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {products.map(p => (
            <button key={p._id} onClick={()=>setEditing(p)} className="text-left overflow-hidden rounded-2xl border border-black/10 bg-white hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
              <img src={(p.images?.[0]) || 'https://i.ibb.co.com/Z1Wqp1m7/85483964-mario1.jpg'} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <div className="line-clamp-1 text-sm font-medium">{p.name}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {p.salePrice>0 ? <>৳{p.salePrice} <span className="line-through">৳{p.regularPrice||p.price}</span></> : <>৳{p.price||p.regularPrice}</>}
                </div>
              </div>
            </button>
          ))}
        </div>
        {editing && <ProductEdit p={editing} cats={cats} onClose={()=>setEditing(null)} onSaved={()=>{ setEditing(null); refreshProducts(); }} />}
      </Section>

      <Section title="Categories">
        <form onSubmit={addCategory} className="grid max-w-md grid-cols-2 gap-2">
          <input name="name" required placeholder="Name" className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <input name="slug" required placeholder="Slug" className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <label className="col-span-2 flex items-center gap-2 text-sm"><input name="featured" type="checkbox" /> Featured</label>
          <input name="image" type="file" accept="image/*" className="col-span-2 rounded-xl border border-black/10 file:mr-3 file:rounded-lg file:border file:px-3 file:py-1 file:text-xs dark:border-white/10" />
          <button className="col-span-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-black/60">Add Category</button>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {cats.map(c => (
            <div key={c._id} className="flex items-center justify-between rounded-xl border p-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                {c.image ? <img src={c.image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-neutral-200 dark:bg-neutral-800" />}
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">{c.slug} {c.featured? '• Featured':''}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs cursor-pointer rounded-lg border px-3 py-1">
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=>updateCategoryImage(c._id, e.currentTarget.files?.[0])} />
                  Upload image
                </label>
                <button onClick={()=>toggleFeatured(c, !c.featured)} className="rounded-lg border px-3 py-1 text-xs">{c.featured? 'Unfeature':'Feature'}</button>
                <button onClick={()=>delCategory(c._id)} className="rounded-lg border px-3 py-1 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Manage Coupons">
        <CouponAdmin />
      </Section>

      <Section title="Orders">
        <div className="grid gap-2">
          {orders.map(o => (
            <div key={o._id} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order {o._id.slice(-6)}</div>
                <select
                  value={o.currentStatus}
                  onChange={(e)=> setStatus(o, e.currentTarget.value)}
                  className="rounded-lg border px-2 py-1 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <p className="mt-1 text-sm">Customer: {o.name} • {o.phone}</p>
              <p className="mt-1 text-sm">{o.address}, {o.city}</p>
              {o.note && (<p className="mt-1 text-sm"><span className="font-medium">Special note:</span> {o.note}</p>)}
              <p className="mt-1 text-sm">Delivery: {o.delivery==='inside'?'Inside Dhaka (৳60)':'Outside Dhaka (৳100)'} • Payment: Cash on delivery</p>
              {o.giftWrap && (<p className="mt-1 text-sm">Gift wrap: Yes (৳50)</p>)}


              <div className="mt-2 text-sm">
                {o.items.map((it,i)=> (
                  <div key={i}>• {it.name} × {it.qty} — ৳{it.price}</div>
                ))}
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <button className="rounded-lg border border-black/10 px-2 py-1 dark:border-white/10" onClick={()=>openOrderEdit(o)}>Edit</button>
                <button className="rounded-lg border border-red-600/40 px-2 py-1 text-red-600" onClick={()=>deleteOrder(o)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Reviews">
        <ReviewsAdmin />
      </Section>

      <Section title="Questions & Answers">
        <QAAdmin />
      </Section>


      {showOrderModal && editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>{ setShowOrderModal(false); setEditOrder(null) }} aria-hidden="true"></div>
          <div role="dialog" aria-modal="true" className="relative w-[92%] max-w-lg rounded-2xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Edit Order</h3>
            <form onSubmit={saveOrderEdit} className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <input name="name" defaultValue={editOrder.name||''} placeholder="Name" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
              <input name="phone" defaultValue={editOrder.phone||''} placeholder="Phone (+88...)" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
              <input name="address" defaultValue={editOrder.address||''} placeholder="Address" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
              <input name="city" defaultValue={editOrder.city||'Dhaka'} placeholder="City" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
              <select name="delivery" defaultValue={editOrder.delivery||'inside'} className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60">
                <option value="inside">Inside Dhaka</option>
                <option value="outside">Outside Dhaka</option>
              </select>
              <select name="payment" defaultValue={editOrder.payment||'cod'} className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60">
                <option value="cod">Cash on delivery</option>
              </select>
              <textarea name="note" defaultValue={editOrder.note||''} placeholder="Special note" className="col-span-2 h-24 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
              <div className="col-span-2 mt-1 flex items-center justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={()=>{ setShowOrderModal(false); setEditOrder(null) }}>Cancel</button>
                <button className="rounded-xl border border-black/10 btn-primary dark:border-white/10 dark:bg-white dark:text-black">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Section title="SEO & Metadata">
        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={saveSiteMeta} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
            <h3 className="text-sm font-medium">Site defaults</h3>
            <input name="siteTitle" defaultValue={siteMeta.siteTitle||''} placeholder="Site Title" className="mt-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            <textarea name="defaultDescription" defaultValue={siteMeta.defaultDescription||''} placeholder="Default description" className="mt-2 h-24 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            <input name="defaultKeywords" defaultValue={siteMeta.defaultKeywords||''} placeholder="Default keywords (comma separated)" className="mt-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            <input name="ogImage" defaultValue={siteMeta.ogImage||''} placeholder="Default OG image URL" className="mt-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            <div className="grid grid-cols-2 gap-2">
              <input name="twitterHandle" defaultValue={siteMeta.twitterHandle||''} placeholder="Twitter handle (@...)" className="mt-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
              <input name="canonicalBase" defaultValue={siteMeta.canonicalBase||''} placeholder="Canonical base (https://example.com)" className="mt-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input name="gaMeasurementId" defaultValue={siteMeta.gaMeasurementId||""} placeholder="GA4 Measurement ID (e.g., G-XXXXXXX)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
              <input name="gtmContainerId" defaultValue={siteMeta.gtmContainerId||""} placeholder="GTM Container ID (e.g., GTM-XXXXXX)" className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
            </div>
            <label className="mt-2 inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
              <input type="checkbox" name="analyticsEnabled" defaultChecked={siteMeta.analyticsEnabled !== false} /> Enable analytics scripts
            </label>
            <div className="mt-3 flex justify-end">
              <button className="rounded-xl border border-black/10 bg-black px-3 py-2 text-sm text-white dark:border-white/10 dark:bg-white dark:text-black">Save defaults</button>
            </div>
          </form>

          <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Per-path entries</h3>
              <button className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10" onClick={()=>openSeoModal(null)}>Add</button>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {seoEntries.map(e => (
                <div key={e._id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="truncate"><span className="font-medium">{e.path}</span> — {e.title || '(no title)'}</div>
                    <div className="shrink-0 space-x-2">
                      <button className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10" onClick={()=>openSeoModal(e)}>Edit</button>
                      <button className="rounded-lg border border-red-600/40 px-2 py-1 text-xs text-red-600" onClick={()=>deleteSeo(e)}>Delete</button>
                    </div>
                  </div>
                  {e.description && <div className="mt-1 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-300">{e.description}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {seoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>{ setSeoModal(false); setEditSeo(null) }} aria-hidden="true" />
            <div className="relative w-[92%] max-w-lg rounded-2xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-neutral-900">
              <h3 className="text-lg font-semibold">{editSeo? 'Edit SEO entry' : 'Add SEO entry'}</h3>
              <form onSubmit={saveSeoEntry} className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <input name="path" defaultValue={editSeo?.path||''} placeholder="Path (e.g., /product/slug)" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
                <input name="title" defaultValue={editSeo?.title||''} placeholder="Title" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
                <textarea name="description" defaultValue={editSeo?.description||''} placeholder="Description" className="col-span-2 h-24 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
                <input name="keywords" defaultValue={editSeo?.keywords||''} placeholder="Keywords (comma separated)" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
                <input name="ogImage" defaultValue={editSeo?.ogImage||''} placeholder="OG image URL" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
                <input name="canonical" defaultValue={editSeo?.canonical||''} placeholder="Canonical URL (optional)" className="col-span-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/60" />
                <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" name="noindex" defaultChecked={!!editSeo?.noindex} /> Noindex this page</label>
                <div className="col-span-2 mt-1 flex items-center justify-end gap-2">
                  <button type="button" className="btn-secondary" onClick={()=>{ setSeoModal(false); setEditSeo(null) }}>Cancel</button>
                  <button className="rounded-xl border border-black/10 btn-primary dark:border-white/10 dark:bg-white dark:text-black">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Section>
      <Section title="Discord Webhooks">
        <WebhookAdmin />
      </Section>



    </div>
  )
}
function numberFormat(n){
  try{ return new Intl.NumberFormat('en-BD').format(Math.round(n)) }catch{ return Math.round(n).toString() }
}
function Sparkline({ data = [], height = 60 }){
  if(!data.length) return <svg width="100%" height={height} />
  const w = 280; // viewport width for path calc; SVG scales to width via viewBox
  const max = Math.max(...data); const min = Math.min(...data);
  const y = (v)=>{
    if(max === min) return height/2
    return height - ((v - min)/(max - min)) * (height - 4) - 2
  }
  const xStep = w / Math.max(1, data.length - 1)
  const pts = data.map((v,i)=>[i*xStep, y(v)])
  const d = pts.map((p,i)=> (i===0? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${height}`} height={height} className="w-full">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
    </svg>
  )
}
function SalesOverview(){
  const [range, setRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ revenue: 0, orders: 0 })
  async function load(){
    try{
      setLoading(true); setErr(null)
      const r = await fetch(`/api/admin/sales?range=${range}`, { cache: 'no-store' })
      const j = await r.json()
      if(!r.ok) throw new Error(j.error || 'Failed to load')
      setRows(j.daily || [])
      setTotals(j.totals || { revenue:0, orders:0 })
    }catch(e){ setErr(e.message) } finally{ setLoading(false) }
  }
  useEffect(()=>{ load() }, [range])
  const revSeries = rows.map(r=>r.revenue)
  return (
    <Section title="Sales Overview">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/60">
            <div className="text-xs text-neutral-500">Total revenue</div>
            <div className="text-xl font-semibold">৳{numberFormat(totals.revenue)}</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/60">
            <div className="text-xs text-neutral-500">Total orders</div>
            <div className="text-xl font-semibold">{numberFormat(totals.orders)}</div>
          </div>
        </div>
        <div className="ml-auto">
          <select value={range} onChange={e=>setRange(e.target.value)} className="rounded-lg border border-black/10 bg-white/70 px-2 py-1 text-sm dark:border-white/10 dark:bg-black/60">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>
      <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        {err && <div className="text-sm text-red-600">Failed to load: {err}</div>}
        {loading ? (
          <div className="h-16 animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-800/60" />
        ) : (
          <div className="text-neutral-600 dark:text-neutral-300">
            <Sparkline data={revSeries} height={64} />
            <div className="mt-2 text-xs">Daily revenue (৳)</div>
          </div>
        )}
      </div>
    </Section>
  )
}


function WebhookAdmin(){
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [hooks, setHooks] = useState([])
  const [input, setInput] = useState('')

  async function load(){
    try{
      setLoading(true); setErr(null)
      const r = await fetch('/api/admin/site-settings', { cache:'no-store' })
      const j = await r.json()
      setHooks(j?.settings?.discordWebhooks || [])
    }catch(e){
      setErr('Failed to load')
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{ load() }, [])

  async function save(newList){
    setLoading(true)
    const r = await fetch('/api/admin/site-settings', {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ discordWebhooks: newList })
    })
    if(r.ok){ setHooks(newList); setInput('') }
    setLoading(false)
  }

  function isValidDiscord(u){
    try{
      const url = new URL(u)
      return url.hostname.includes('discord.com') && url.pathname.includes('/api/webhooks/')
    }catch{ return false }
  }

  async function add(){
    const u = input.trim()
    if(!isValidDiscord(u)) { alert('Please paste a valid Discord webhook URL'); return; }
    if(hooks.includes(u)) { alert('This webhook is already added'); return; }
    await save([...hooks, u])
  }

  async function remove(u){
    if(!confirm('Remove this webhook?')) return;
    await save(hooks.filter(x => x !== u))
  }

  async function test(u){
    const r = await fetch('/api/admin/webhooks/test', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(u ? { url: u } : {})
    })
    if(r.ok){ alert('Test message sent to Discord') } else { const j = await r.json().catch(()=>({})); alert('Failed to send: ' + (j.error||r.statusText)) }
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
        <label className="text-sm font-medium">Add a Discord webhook</label>
        <div className="mt-2 flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste Discord webhook URL" className="flex-1 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60" />
          <button onClick={add} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60">Add</button>
          <button onClick={()=>test()} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/60">Send test to all</button>
        </div>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Tip: In Discord, go to Server Settings → Integrations → Webhooks → New Webhook, then copy the URL.</p>
      </div>

      <div className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
        <div className="mb-2 font-medium">Configured webhooks</div>
        {loading ? (
          <div className="h-10 animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-800/60" />
        ) : hooks.length === 0 ? (
          <div className="text-neutral-500">None added yet.</div>
        ) : (
          <div className="grid gap-2">
            {hooks.map((u,i)=>(
              <div key={i} className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">
                <div className="truncate">{u}</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>navigator.clipboard?.writeText(u)} className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10">Copy</button>
                  <button onClick={()=>test(u)} className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10">Test</button>
                  <button onClick={()=>remove(u)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


function ReviewsAdmin(){
  const [tab, setTab] = useState('pending') // pending | approved
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  async function load(){
    setLoading(true)
    const r = await fetch(`/api/admin/reviews?status=${tab}`, { cache:'no-store' })
    const j = await r.json()
    setRows(j.reviews || [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [tab])

  async function setApproved(id, approved){
    await fetch('/api/admin/reviews', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, approved }) })
    load()
  }
  async function remove(id){
    if(!confirm('Delete this review?')) return;
    await fetch('/api/admin/reviews', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <button onClick={()=>setTab('pending')} className={`rounded-lg border px-2 py-1 text-sm ${tab==='pending'?'bg-black text-white dark:bg-white dark:text-black':''}`}>Pending</button>
        <button onClick={()=>setTab('approved')} className={`rounded-lg border px-2 py-1 text-sm ${tab==='approved'?'bg-black text-white dark:bg-white dark:text-black':''}`}>Approved</button>
      </div>
      {loading ? <div className="h-12 animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-800/60" /> : (
        <div className="divide-y divide-black/5 text-sm dark:divide-white/10">
          {rows.map(r=>(
            <div key={r._id} className="py-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.name || 'Anonymous'} — {r.rating}★</div>
                <div className="flex items-center gap-2">
                  {tab==='pending' ? (
                    <button onClick={()=>setApproved(r._id, true)} className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10">Approve</button>
                  ) : (
                    <button onClick={()=>setApproved(r._id, false)} className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10">Unapprove</button>
                  )}
                  <button onClick={()=>remove(r._id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">Delete</button>
                </div>
              </div>
              <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Product ID: {r.productId}</div>
              {r.text && <div className="mt-1 whitespace-pre-wrap">{r.text}</div>}
            </div>
          ))}
          {rows.length===0 && <div className="py-6 text-center text-neutral-500">No entries.</div>}
        </div>
      )}
    </div>
  )
}

function QAAdmin(){
  const [tab, setTab] = useState('pending')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})

  async function load(){
    setLoading(true)
    const r = await fetch(`/api/admin/questions?status=${tab}`, { cache:'no-store' })
    const j = await r.json()
    setRows(j.questions || [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [tab])

  async function save(id, approved){
    await fetch('/api/admin/questions', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, approved, answer: answers[id] || undefined })
    })
    load()
  }
  async function remove(id){
    if(!confirm('Delete this question?')) return;
    await fetch('/api/admin/questions', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <button onClick={()=>setTab('pending')} className={`rounded-lg border px-2 py-1 text-sm ${tab==='pending'?'bg-black text-white dark:bg-white dark:text-black':''}`}>Pending</button>
        <button onClick={()=>setTab('approved')} className={`rounded-lg border px-2 py-1 text-sm ${tab==='approved'?'bg-black text-white dark:bg-white dark:text-black':''}`}>Approved</button>
      </div>
      {loading ? <div className="h-12 animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-800/60" /> : (
        <div className="divide-y divide-black/5 text-sm dark:divide-white/10">
          {rows.map(q=>(
            <div key={q._id} className="py-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{q.name || 'Anonymous'} asked</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>save(q._id, true)} className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10">Approve</button>
                  <button onClick={()=>save(q._id, false)} className="rounded-lg border border-black/10 px-2 py-1 text-xs dark:border-white/10">Unapprove</button>
                  <button onClick={()=>remove(q._id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">Delete</button>
                </div>
              </div>
              <div className="mt-1 whitespace-pre-wrap">{q.text}</div>
              <textarea
                placeholder="Answer (optional)"
                defaultValue={q.answer||''}
                onChange={(e)=>setAnswers(a=>({ ...a, [q._id]: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-xs dark:border-white/10 dark:bg-black/60" />
            </div>
          ))}
          {rows.length===0 && <div className="py-6 text-center text-neutral-500">No entries.</div>}
        </div>
      )}
    </div>
  )
}

// -- Popup Admin (create/edit) --
function PopupAdmin(){
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load(){
    const r = await fetch('/api/admin/popups', { cache:'no-store' });
    const j = await r.json();
    setList(j?.data||[]);
  }
  useEffect(()=>{ load(); }, []);

  async function save(e){
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    data.active = !!data.active;
    data.dismissible = !!data.dismissible;
    if (data.startAt) data.startAt = new Date(data.startAt).toISOString();
    if (data.endAt) data.endAt = new Date(data.endAt).toISOString();
    await fetch('/api/admin/popups', {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ ...(editing||{}), ...data })
    });
    setSaving(false);
    setEditing(null);
    load();
  }

  async function remove(id){
    if (!confirm('Delete this popup?')) return;
    await fetch('/api/admin/popups/'+id, { method:'DELETE' });
    load();
  }

  async function handleImagePick(e){
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const r = await fetch('/api/admin/upload', { method:'POST', body: form });
    const j = await r.json();
    if (j?.url) {
      setEditing(prev => ({ ...(prev||{}), imageUrl: j.url }));
    } else {
      alert('Upload failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">{list.length} popup(s)</div>
        <button type="button" onClick={()=>setEditing({ title:'', imageUrl:'', linkUrl:'', active:false, dismissible:true })} className="rounded-lg border px-3 py-1 text-xs">New Popup</button>
      </div>
      <div className="divide-y divide-black/5 dark:divide-white/10 rounded-xl border border-black/10 dark:border-white/10">
        {list.map(p => (
          <div key={p._id} className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <img src={p.imageUrl} alt="" className="h-12 w-12 rounded-lg border border-black/10 object-cover dark:border-white/10" />
              <div>
                <div className="font-medium">{p.title||'(no title)'}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">{p.active ? 'Active' : 'Inactive'}{p.startAt?` · from ${new Date(p.startAt).toLocaleString()}`:''}{p.endAt?` · until ${new Date(p.endAt).toLocaleString()}`:''}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={()=>setEditing(p)} className="rounded-lg border px-3 py-1 text-xs">Edit</button>
              <button type="button" onClick={()=>remove(p._id)} className="rounded-lg border px-3 py-1 text-xs">Delete</button>
            </div>
          </div>
        ))}
        {!list.length && <div className="p-3 text-sm text-neutral-500">No popups yet.</div>}
      </div>

      {editing && (
        <form onSubmit={save} className="space-y-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
          <input type="hidden" name="_id" defaultValue={editing?._id||''} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs">Title</label>
              <input name="title" defaultValue={editing?.title||''} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-900" />
            </div>
            <div>
              <label className="text-xs">Link URL (optional)</label>
              <input name="linkUrl" defaultValue={editing?.linkUrl||''} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-900" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs">Start at (optional)</label>
              <input type="datetime-local" name="startAt" defaultValue={editing?.startAt? new Date(editing.startAt).toISOString().slice(0,16): ''} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-900" />
            </div>
            <div>
              <label className="text-xs">End at (optional)</label>
              <input type="datetime-local" name="endAt" defaultValue={editing?.endAt? new Date(editing.endAt).toISOString().slice(0,16): ''} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-900" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs">Image URL</label>
              <input name="imageUrl" value={editing?.imageUrl||''} onChange={e=>setEditing(prev=>({...prev, imageUrl:e.target.value}))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-neutral-900" />
              <div className="mt-2 flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleImagePick} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={!!editing?.active} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="dismissible" defaultChecked={editing?.dismissible!==false} /> Dismissible</label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg border px-3 py-2 text-sm">{saving?'Saving...':'Save popup'}</button>
          </div>
        </form>
      )}
    </div>
  );
}


{/* ===== Home Popups ===== */}
<Section title="Home Popups">
  <PopupAdmin />
</Section>
