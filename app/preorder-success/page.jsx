import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";

async function getBaseUrl(){
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

async function fetchOrder(id){
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/orders/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json().catch(()=>null);
  return j || null;
}

export default async function Page({ searchParams }){
  const sp = (searchParams && typeof searchParams.then === 'function') ? await searchParams : searchParams;
  const spObj = sp instanceof URLSearchParams ? Object.fromEntries(sp.entries()) : (sp || {});

  const oid = spObj.oid || spObj.orderId || "";
  const result = oid ? await fetchOrder(oid) : null;
  const order = result?.data || null;
  const view = result?.view || {};

  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <div className="rounded-2xl border border-black/10 p-6 shadow-sm dark:border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Order Confirmation</h1>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">Pre‑order</span>
        </div>

        {!order ? (
          <p className="mt-4 text-sm opacity-80">We couldn’t find your order. If you just paid, please wait a moment and refresh.</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <div><span className="opacity-70">Order ID:</span> <span className="font-mono">{order._id}</span></div>
              <div><span className="opacity-70">Full name:</span> <span>{order.name || order.full_name}</span></div>
              <div><span className="opacity-70">Email:</span> <span>{view.email || "—"}</span></div>
              <div><span className="opacity-70">Phone:</span> <span>{order.phone}</span></div>
              <div><span className="opacity-70">Address:</span> <span>{order.address}</span></div>
              <div><span className="opacity-70">City:</span> <span>{order.city}</span></div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
                  {view.image && <Image src={view.image} alt={view.productName || 'Product'} fill className="object-cover" />}
                </div>
                <div>
                  <div><span className="opacity-70">Product:</span> <span>{view.productName || "—"}</span></div>
                  <div><span className="opacity-70">Quantity:</span> <span>{view.quantity}</span></div>
                </div>
              </div>
              <div><span className="opacity-70">Total amount:</span> <span>৳{order.total}</span></div>
              <div><span className="opacity-70">Advance paid:</span> <span>৳{order.advanceAmount || order.advance}</span></div>
              <div><span className="opacity-70">Due on COD:</span> <span>৳{order.dueOnDelivery || (order.total - (order.advanceAmount || 0))}</span></div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <div className="text-xs opacity-70">We’ve recorded your pre‑order. You’ll receive updates as it progresses.</div>
          <Link href="/" className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
