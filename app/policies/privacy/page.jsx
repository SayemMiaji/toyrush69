export default function Privacy(){
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none py-8">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p>We respect your privacy. This policy explains how we collect and use your information.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Contact details (name, mobile number, address) for fulfilling orders</li>
        <li>Order history and status updates</li>
      </ul>
      <h2>How we use data</h2>
      <p>We use your information to process orders, provide tracking updates, and improve our service. We do not sell your data.</p>
      <h2>Your rights</h2>
      <p>To access or delete your data, contact us at privacy@toyrush.bd (demo).</p>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  )
}
