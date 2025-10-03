
import { NextResponse } from 'next/server'
export function middleware(req){
  const { pathname } = req.nextUrl
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isAdminApi  = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth/')
  if(isAdminPage || isAdminApi){
    const session = req.cookies.get('admin_session')?.value
    if(!session){
      if(isAdminApi) return NextResponse.json({ error:'Unauthorized' },{status:401})
      const url = req.nextUrl.clone(); url.pathname='/admin/login'; url.searchParams.set('next', pathname); return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}
export const config = { matcher: ['/admin/:path*','/api/admin/:path*'] }
