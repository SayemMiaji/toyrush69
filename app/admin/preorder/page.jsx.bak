"use client";

import { useEffect, useState } from "react";

const TABS = ["settings", "products", "orders"]; // Removed "webhooks" from TABS

function Tab({ value, current, onClick, children }) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={
        "rounded-md px-3 py-1 text-sm transition " +
        (active
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "hover:bg-black/5 dark:hover:bg-white/5")
      }
    >
      {children}
    </button>
  );
}

function Badge({ kind = "neutral", children }) {
  const styles = {
    success: "bg-green-500/15 text-green-500",
    warn: "bg-yellow-500/15 text-yellow-400",
    neutral: "bg-white/10 text-white/80",
  };
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold " +
        (styles[kind] || styles.neutral)
      }
    >
      {children}
    </span>
  );
}

function Currency({ value }) {
  const v = Number(value || 0);
  return (
    <span>
      {v.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

function AddressLine({ addr, customer }) {
  if (!addr && !customer) return <span>—</span>;
  if (addr && typeof addr === 'string') return <span>{addr}</span>;
  const a = addr || {};
  const parts = [a.address || customer?.address, a.area, a.city, a.postcode];
  const joined = parts.filter(Boolean).join(', ');
  return <span>{joined || '—'}</span>;
}

function OrdersTable({
  orders,
  onVerify,
  verifyingId,
  expanded,
  setExpanded,
  updateOrder, // <-- add this prop
}) {
  if (!orders?.length) {
    return (
      <div className="border border-white/10 rounded-2xl p-8 text-sm opacity-80">
        No pre-orders found yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-right">Advance Due</th>
            <th className="px-4 py-3 text-right">Advance Paid</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Order Status</th>
            <th className="px-4 py-3 text-left">Invoice ID</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => [
            <tr key={o.id} className="border-t border-white/10">
              <td className="px-4 py-3">
                {new Date(o.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                {o?.customer?.name ||
                  o?.customer?.phone ||
                  o?.customer?.email ||
                  "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Currency value={o.advanceDue} />
              </td>
              <td className="px-4 py-3 text-right">
                <Currency value={o.paid} />
              </td>
              <td className="px-4 py-3">
                {o.paid ? (<Badge kind="success">Paid</Badge>) : (<Badge kind="warn">Not paid</Badge>)}
                <span className="ml-2 opacity-70 text-xs">({o.uddoktaStatus || (o.paid ? "PAID" : "PENDING")})</span>
                
              </td>
              <td className="px-4 py-3">
                {/* Order Status Dropdown */}
                <select
                  value={o.currentStatus || "Pending"}
                  onChange={e => updateOrder(o, { currentStatus: e.target.value })}
                  className="rounded-lg border px-2 py-1 text-xs bg-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {o.invoiceId || "—"}
              </td>
              <td className="px-4 py-3 text-right flex gap-2 justify-end">
                {o.invoiceId ? (
                  <button
                    onClick={() => navigator.clipboard.writeText(o.invoiceId)}
                    className="px-2 py-1 rounded-md border border-white/15 hover:bg-white/5 text-xs"
                  >
                    Copy ID
                  </button>
                ) : null}
                <button
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [o.id]: !prev[o.id] }))
                  }
                  className="px-2 py-1 rounded-md border border-white/15 hover:bg-white/5 text-xs"
                >
                  {expanded[o.id] ? "Hide" : "Details"}
                </button>
                {o.invoiceId ? (
                  <button
                    onClick={() => onVerify(o.id)}
                    disabled={verifyingId === o.id}
                    className="px-2 py-1 rounded-md border border-white/15 hover:bg-white/5 text-xs disabled:opacity-60"
                  >
                    {verifyingId === o.id ? "Verifying…" : "Verify"}
                  </button>
                ) : null}
              </td>
            </tr>,

            expanded[o.id] ? (
              <tr className="border-t border-white/10" key={`${o.id}-details`}>
                <td colSpan={7} className="px-4 py-3 bg-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="font-semibold mb-1">Customer</div>
                      <div>Name: {o.customer?.name || "—"}</div>
                      <div>Phone: {o.customer?.phone || "—"}</div>
                      <div>Email: {o.customer?.email || "—"}</div>
                      <div>
                        Address:{" "}
                        <AddressLine addr={o.address} customer={o.customer} />
                      </div>
                      <div>City: {o.address?.city || o.customer?.city || "—"}</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Payment</div>
                      <div>Order ID: <span className="font-mono">{o.id}</span></div>
                      <div>
                        Status: {o.uddoktaStatus || (o.paid ? "PAID" : "PENDING")}
                      </div>
                      <div>Provider: {o.provider || "—"}</div>
                      <div>Method: {o.paymentMethod || "—"}</div>
                      <div>
                        Txn ID: <span className="font-mono">{o.transactionId || "—"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">
                        Items ({o.items?.length || 0})
                      </div>
                      <ul className="space-y-1">
                        {(o.items || []).map((it, idx) => (
                          <li key={idx} className="flex justify-between gap-2">
                            <span className="truncate">{it.name}</span>
                            <span>x{it.qty}</span>
                            <span>
                              <span className="opacity-70">@</span>{" "}
                              {Number(it.price || 0).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            ) : null
          ])}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPreorderPage() {
  const [tab, setTab] = useState("orders");

  // DATA
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  // Removed webhooks state
  // const [webhooks, setWebhooks] = useState([]);
  // const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // UI STATE
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  // const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [expanded, setExpanded] = useState({});

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/preorder/orders", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Failed to load orders", e);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadSettings() {
    setLoadingSettings(true);
    try {
      const r = await fetch("/api/admin/preorder/settings", { cache: "no-store" });
      const d = await r.json();
      if (d?.ok) setSettings(d.settings || d.data || d);
    } catch (e) {
      console.error("settings load failed", e);
    } finally {
      setLoadingSettings(false);
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const r = await fetch("/api/admin/preorder/products", { cache: "no-store" });
      const d = await r.json();
      if (Array.isArray(d?.products)) setProducts(d.products);
      else if (Array.isArray(d?.data)) setProducts(d.data);
      else setProducts([]);
    } catch (e) {
      console.error("products load failed", e);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadOrders();
    loadSettings();
    loadProducts();
    // Removed loadWebhooks();
  }, []);

  async function verifyNow(orderId) {
    setVerifyingId(orderId);
    try {
      await fetch("/api/admin/preorder/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      await loadOrders();
    } catch (e) {
      console.error("verify failed", e);
    } finally {
      setVerifyingId(null);
    }
  }

  // Add updateOrder function here
  async function updateOrder(order, patch) {
    const id = order._id || order.id;
    if (!id) return;
    const res = await fetch(`/api/admin/preorder/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data?.ok) {
      setOrders(prev =>
        prev.map(x => (String(x._id || x.id) === String(id) ? { ...x, ...patch } : x))
      );
    }
  }

  async function saveSettings() {
    if (!settings) return;
    const res = await fetch("/api/admin/preorder/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (data?.ok) {
      await loadSettings();
    }
  }

  async function updateProduct(p, patch) {
    const id = p._id || p.id;
    if (!id) return;
    const res = await fetch(`/api/admin/preorder/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data?.ok) {
      setProducts((prev) =>
        prev.map((x) => (String(x._id || x.id) === String(id) ? data.data : x))
      );
    }
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
        Preorder Admin
      </h1>

      <div className="mt-6 flex gap-2">
        {TABS.map((v) => (
          <Tab key={v} value={v} current={tab} onClick={setTab}>
            {v[0].toUpperCase() + v.slice(1)}
          </Tab>
        ))}
      </div>

      <div className="mt-6">
        {tab === "orders" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Orders</h2>
              <button
                onClick={loadOrders}
                className="px-3 py-1 rounded-md border border-white/15 hover:bg-white/5"
              >
                Refresh
              </button>
            </div>
            {loadingOrders ? (
              <div className="rounded-xl border border-white/10 p-6 text-sm opacity-80">
                Loading orders…
              </div>
            ) : (
              <OrdersTable
                orders={orders}
                onVerify={verifyNow}
                verifyingId={verifyingId}
                expanded={expanded}
                setExpanded={setExpanded}
                updateOrder={updateOrder}
              />
            )}
          </section>
        )}

        {tab === "settings" && (
          <section className="rounded-xl border border-white/10 p-6 text-sm">
            <h2 className="text-lg font-semibold mb-3">Settings</h2>
            {loadingSettings ? (
              <div className="opacity-80">Loading settings…</div>
            ) : settings ? (
              <pre className="whitespace-pre-wrap break-words text-xs bg-white/5 p-3 rounded-lg border border-white/10">
                {JSON.stringify(settings, null, 2)}
              </pre>
            ) : (
              <div className="opacity-80">No settings found.</div>
            )}
          </section>
        )}

        {tab === "products" && (
          <section className="rounded-xl border border-white/10 p-6 text-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Preorder Products</h2>
              <button
                onClick={loadProducts}
                className="px-3 py-1 rounded-md border border-white/15 hover:bg-white/5"
              >
                Refresh
              </button>
            </div>
            {loadingProducts ? (
              <div className="opacity-80">Loading products…</div>
            ) : products.length ? (
              <ul className="space-y-2">
                {products.map((p) => (
                  <li
                    key={p._id || p.id}
                    className="rounded-lg border border-white/10 p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {p.name || p.title || p.slug}
                      </div>
                      <div className="text-xs opacity-70">
                        slug: {p.slug || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!p.isPreOrder} onChange={e=>updateProduct(p, { isPreOrder: e.target.checked })} /> Pre‑order</label>
                      <input type="number" min={0} max={100} className="w-20 rounded-md border border-white/10 px-2 py-1 bg-transparent text-xs" value={p.preOrderAdvancePercent ?? 50} onChange={e=>updateProduct(p, { preOrderAdvancePercent: Number(e.target.value) })} />
                      <input className="w-48 rounded-md border border-white/10 px-2 py-1 bg-transparent text-xs" placeholder="Lead time e.g. Ships in 3–4 weeks" value={p.preOrderLeadTimeText || ""} onChange={e=>updateProduct(p, { preOrderLeadTimeText: e.target.value })} />
                      <button onClick={()=>loadProducts()} className="px-2 py-1 rounded-md border border-white/15 hover:bg-white/5 text-xs">Refresh</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="opacity-80">No preorder products yet.</div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}


