import Link from "next/link";

export default async function Page(){
  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <div className="rounded-2xl border border-black/10 p-6 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold">Payment Cancelled</h1>
        <p className="mt-3 text-sm opacity-80">
          Your payment was cancelled.
          You can try paying the advance again from the preorder page, or choose a different payment method if available.
          If you were charged but redirected to this page, please contact us through social media.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5">Home</Link>
          <Link href="/track" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5">Track Order</Link>
                    <Link href="https://www.instagram.com/toyrushbd" className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5">Instagram</Link>
        </div>
      </div>
    </div>
  )
}
