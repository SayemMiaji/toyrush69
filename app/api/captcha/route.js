import { NextResponse } from "next/server";
import { sign } from '@/lib/auth'

export async function GET(){
  const n1 = Math.floor(2 + Math.random() * 8);
  const n2 = Math.floor(2 + Math.random() * 8);
  const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret';
  const token = sign({ typ:'captcha', n1, n2, exp: Date.now() + 10*60*1000 }, AUTH_SECRET);
  return NextResponse.json({ question: `${n1} + ${n2} = ?`, captchaToken: token });
}
