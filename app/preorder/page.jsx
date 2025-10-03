
import { dbConnect } from '@/lib/db'
import Product from '@/models/Product'
import ProductCard from '@/components/ProductCard'

export const revalidate = 0

export default async function PreorderPage(){
  await dbConnect()
  const items = await Product.find({ isPreOrder: true }).sort({ createdAt:-1 }).lean()

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold">Pre‑order</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Browse items available for pre‑order.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items?.length ? items.map((p) => <ProductCard key={p._id} p={p} />) : (
          <div className="col-span-full rounded-xl border border-black/10 p-6 text-center text-sm dark:border-white/10">
            No products are currently available for pre‑order.
          </div>
        )}
      </div>
    </div>
  )
}
