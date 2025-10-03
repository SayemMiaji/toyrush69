import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import BottomNav from '@/components/BottomNav'
import { CartProvider } from '@/components/cart/CartContext'
import CartDrawer from '@/components/cart/CartDrawer'
import { ToastProvider } from '@/components/toast/ToastContext'
import ToastViewport from '@/components/toast/ToastViewport'
import TopProgress from '@/components/TopProgress'
import AnalyticsScripts from '@/components/AnalyticsScripts'
import { dbConnect } from '@/lib/db'
import SiteSettings from '@/models/SiteSettings'
import { Suspense } from 'react'


export async function generateMetadata(){
  try{
    await dbConnect();
    const s = await SiteSettings.findOne({}).lean();
    const title = s?.siteTitle || 'ToyRush Bangladesh — Minimal Toys & Bricks';
    const description = s?.defaultDescription || 'Lego-inspired sets, RC cars, bricks & more. Dhaka-based, delivery across Bangladesh.';
    const keywords = s?.defaultKeywords || 'toys, lego, rc car, bangladesh, dhaka';
    const ogImage = s?.ogImage || undefined;
    const metadata = {
      icons: { icon: '/icon.png', apple: '/apple-icon.png', shortcut: '/favicon.ico' },
      title,
      description,
      keywords,
      openGraph: {
        title, description,
        images: ogImage ? [{ url: ogImage }] : undefined
      },
      twitter: {
        card: 'summary_large_image',
        site: s?.twitterHandle || undefined,
        title, description,
        images: ogImage ? [ogImage] : undefined
      },
      metadataBase: s?.canonicalBase ? new URL(s.canonicalBase) : undefined
    };
    return metadata;
  }catch(_e){
    return {
      title: 'ToyRush Bangladesh — Minimal Toys & Bricks',
      description: 'Lego-inspired sets, RC cars, bricks & more. Dhaka-based, delivery across Bangladesh.'
    }
  }
}

export default function RootLayout({ children }){
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <Suspense fallback={null}>
  <TopProgress />
</Suspense>
        <AnalyticsScripts />
        <ToastProvider>
          <CartProvider>
            <SiteHeader />
            <main className="container">{children}</main>
            <SiteFooter />
            <BottomNav />
            <CartDrawer />
            <ToastViewport />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}