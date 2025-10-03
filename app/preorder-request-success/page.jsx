export const dynamic = 'force-static';
export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Request received ✅</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Thanks! We’ve received your preorder request. Our team will contact you on WhatsApp as soon as possible with pricing and shipping details.
      </p>
    </main>
  );
}
