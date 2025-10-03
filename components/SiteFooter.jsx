import Link from 'next/link';
export default function SiteFooter(){
  return (
    <footer className="container pb-12">
      <div className="mt-12 rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium">Dhaka-based • Delivering all over Bangladesh</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">© {new Date().getFullYear()} ToyRush Bangladesh</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <Link href="/policies/privacy" className="hover:underline">Privacy</Link>
            <Link href="/policies/terms" className="hover:underline">Terms</Link>
            <Link href="/policies/shipping-returns" className="hover:underline">Shipping & Returns</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
