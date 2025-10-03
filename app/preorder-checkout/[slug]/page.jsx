
import PreorderCheckoutClient from './PreorderCheckoutClient'
export const revalidate = 0
export default async function Page({ params }){
  const { slug } = await params
  return <PreorderCheckoutClient slug={slug} />
}
