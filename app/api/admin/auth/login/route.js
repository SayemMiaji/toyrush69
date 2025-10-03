
import { NextResponse } from "next/server";
import { verify, sign, isExpired } from '@/lib/auth'
export async function POST(req){
  try{
    const { username, password, captchaAnswer, captchaToken } = await req.json()
    const AUTH_SECRET=process.env.AUTH_SECRET||'dev-secret'
    const c=verify(captchaToken, AUTH_SECRET)
    if(!c||c.typ!=='captcha'||isExpired(c)) return NextResponse.json({ error:'Captcha expired. Please try again.' },{status:400})
    if(Number(captchaAnswer)!==Number(c.n1)+Number(c.n2)) return NextResponse.json({ error:'Captcha incorrect' },{status:400})
    const U=process.env.ADMIN_USERNAME||'admin', P=process.env.ADMIN_PASSWORD||'admin123'
    if(!(username===U && password===P)) return NextResponse.json({ error:'Invalid credentials' },{status:401})
    const token=sign({typ:'session',u:username,exp:Date.now()+7*24*60*60*1000}, AUTH_SECRET)
    const res=NextResponse.json({ ok:true })
    res.cookies.set('admin_session', token, { httpOnly:true, sameSite:'lax', path:'/', secure:process.env.NODE_ENV==='production', maxAge:7*24*60*60 })
    return res
  }catch{ return NextResponse.json({ error:'Login error' },{status:500}) }
}
