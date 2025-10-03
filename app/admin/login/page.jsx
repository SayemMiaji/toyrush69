
import LoginClient from './LoginClient'

export const dynamic = 'force-dynamic'

export default function Page({ searchParams }){
  const next = searchParams?.next || '/admin/preorder'
  return <LoginClient next={next} />
}
