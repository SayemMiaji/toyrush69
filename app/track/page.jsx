export const dynamic = 'force-static';
import Link from 'next/link';

export default function TrackLanding(){
  return (
    <main className="container py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Track Your Order</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Choose what you want to track: a <strong>regular order</strong> you fully paid for,
          or a <strong>pre‑order</strong> where you paid an advance. Keep your WhatsApp/phone number handy.
        </p>
        <ul className="list-disc pl-5 text-xs text-neutral-600 dark:text-neutral-400">
          <li>Use the same phone number you used when placing the order.</li>
          <li>If no result appears, double‑check your digits and try again.</li>
          <li>Still stuck? Message us on WhatsApp with your name and item details.</li>
        </ul>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/track/regular" className="rounded-2xl border border-black/10 dark:border-white/10 p-6 hover:bg-black/5 dark:hover:bg-white/5">
          <h2 className="text-lg font-semibold mb-1">Track Regular Order</h2>
          <p className="text-sm opacity-80">For in‑stock or standard orders (fully paid).</p>
        </Link>
        <Link href="/track/preorder" className="rounded-2xl border border-black/10 dark:border-white/10 p-6 hover:bg-black/5 dark:hover:bg-white/5">
          <h2 className="text-lg font-semibold mb-1">Track Pre‑Order</h2>
          <p className="text-sm opacity-80">For advance‑paid pre‑orders awaiting arrival.</p>
        </Link>
      </section>
    </main>
  );
}
