'use client'
import { useState } from 'react'
import TrackForm from '@/app/components/track/TrackForm'
import StatusPipeline from '@/app/components/track/StatusPipeline'

function maskId(id=''){
  if(!id) return '';
  const s=String(id);
  return s.length>4 ? `${s.slice(0,3)}*****${s.slice(-4)}` : s;
}
function maskPhone(p=''){
  const digits = String(p).replace(/\D+/g,'');
  return digits.length>=4 ? `******${digits.slice(-4)}` : '******';
}

export default function TrackPreorderPage(){
  const [orders, setOrders] = useState(null);
  return (
    <main className="container py-8 space-y-8"><div className="rounded-2xl border border-black/10 dark:border-white/10 p-4"><h1 className="text-lg font-semibold mb-1">How to Track Your Pre‑Order</h1><ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300"><li>Enter the phone number you used when placing the pre‑order.</li><li>Complete the quick captcha to confirm you’re human.</li><li>We’ll show all matching pre‑orders; click an item to view its current status.</li><li>If you don’t see your order, double‑check your phone digits or contact us on Social media.</li></ul></div>
      <h1 className="text-xl font-semibold">Track Pre‑Order</h1>
      <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
        <TrackForm kind="preorder" onResult={setOrders} />
      </section>

      {Array.isArray(orders) && (
        orders.length ? (
          <section className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
            <h2 className="text-lg font-semibold mb-4">Your Pre‑Orders</h2>
            <ul className="grid gap-4">
              {orders.map((o, idx)=>(
                <li key={idx} className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm opacity-70">Pre‑Order</div>
                      <div className="font-medium">{maskId(o.id||o._id||o.orderId)}</div>
                      <div className="text-xs opacity-70 mt-1">Phone: {maskPhone(o.phone)}</div>
                      {o.city ? <div className="text-xs opacity-70">City: {o.city}</div> : null}
                    </div>
                    <div className="text-right text-sm">
                      <div>Subtotal: {o.subtotal}</div>
                      <div>Delivery: {o.delivery}</div>
                      <div>Total: {o.total}</div>
                      {'paid' in o ? <div>Paid: {o.paid}</div> : null}
                      {'due' in o ? <div>Due: {o.due}</div> : null}
                      {'advancePercent' in o ? <div>Advance %: {o.advancePercent}</div> : null}
                      {'preOrderAdvancePaid' in o ? <div>Advance Paid: {String(o.preOrderAdvancePaid)}</div> : null}
                      {'preOrderBalancePaid' in o ? <div>Balance Due Paid: {String(o.preOrderBalancePaid)}</div> : null}
                    </div>
                  </div>

                  {o.items?.length ? (
                    <div className="mt-3 grid gap-2">
                      {o.items.map((it,i)=>(
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {it.image ? <img src={it.image} alt={it.title||''} className="w-10 h-10 rounded-md object-cover" /> : null}
                          <div className="flex-1">
                            <div className="font-medium">{it.title}</div>
                            <div className="opacity-70">Qty: {it.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {o.timeline?.length ? (
                    <div className="mt-4">
                      <StatusPipeline currentStatus={o.currentStatus} history={o.timeline} flow={['Pending','Processing','Shipped','Delivered']} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4 text-sm opacity-80">
            No orders found for this phone. Check digits.
          </div>
        )
      )}
    </main>
  );
}
