export default function Shipping(){
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none py-8">
      <h1 className="text-2xl font-semibold">Shipping & Returns</h1>
      <h2>Shipping</h2>
      <p>We ship from Dhaka to all districts in Bangladesh. Standard delivery typically takes 2–5 business days.</p>
      <h2>Returns</h2>
      <p>Eligible returns accepted within 7 days of delivery if unopened and in original condition. Contact support for an RMA.</p>
      <h2>Damaged items</h2>
      <p>If your item arrives damaged, contact us within 48 hours with photos and your order ID.</p>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  )
}
