import Script from 'next/script'
import { dbConnect } from '@/lib/db'
import SiteSettings from '@/models/SiteSettings'

export default async function AnalyticsScripts(){
  try{
    await dbConnect()
    const s = await SiteSettings.findOne({}).lean()
    const enabled = s?.analyticsEnabled !== false
    const ga = (s?.gaMeasurementId || '').trim()
    const gtm = (s?.gtmContainerId || '').trim()
    if(!enabled || (!ga && !gtm)) return null
    return (
      <>
        {ga && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga}');
              `}
            </Script>
          </>
        )}
        {gtm && (
          <>
            <Script id="gtm-init" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtm}');
              `}
            </Script>
            {/* Optional GTM <noscript> fallback */}
            <noscript>
              <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
                height="0" width="0" style={{display:'none',visibility:'hidden'}} />
            </noscript>
          </>
        )}
      </>
    )
  }catch(_e){
    return null
  }
}
