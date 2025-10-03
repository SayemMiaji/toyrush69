export default function Terms(){
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none py-8">
      <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
      <p>Welcome to ToyRush Bangladesh ("we", "our"). By accessing or using our website and services, you agree to these Terms. Please read them carefully.</p>
      <h2>Orders & Availability</h2>
      <p>All orders are subject to availability. We reserve the right to cancel and refund any order prior to dispatch.</p>
      <h2>Pricing</h2>
      <p>All prices are listed in Bangladeshi Taka (৳). We may change pricing at any time. The price at checkout is the final price.</p>
      <h2>Use of Website</h2>
      <p>You agree not to misuse the site or attempt to interfere with its normal operation. All content is owned by ToyRush Bangladesh.</p>
      <h2>Contact</h2>
      <p>Based in Dhaka, Bangladesh. For support: support@toyrush.bd (demo).</p>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  )
}
