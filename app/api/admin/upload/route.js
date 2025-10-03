import { NextResponse } from "next/server";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function pickUrl(json){
  // imgbb returns { data: { url, display_url } }
  return json?.data?.url || json?.data?.display_url || null
}

export async function POST(req){
  const key = process.env.IMGBB_API_KEY
  const expire = process.env.IMGBB_EXPIRATION // seconds (optional)
  if(!key) return NextResponse.json({ error: 'Missing IMGBB_API_KEY' }, { status: 500 })

  const inForm = await req.formData()
  let files = inForm.getAll('files')
  const single = inForm.get('file')
  if((!files || files.length===0) && single) files = [single]
  if(!files || files.length===0){
    return NextResponse.json({ error: 'No files provided (fields: files[] or file)' }, { status: 400 })
  }

  const urls = []
  for (const file of files){
    // Try binary multipart first
    const fd = new FormData()
    fd.append('key', key)
    if (expire) fd.append('expiration', String(expire))
    // Important: field name MUST be 'image'
    fd.append('image', file, file.name || 'upload.jpg')

    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd })
    let json = null
    try { json = await res.json() } catch(e) {}

    let url = json ? pickUrl(json) : null

    if(!res.ok || !url){
      // Fallback: base64 encode
      const buf = Buffer.from(await file.arrayBuffer())
      const b64 = buf.toString('base64')
      const fd2 = new FormData()
      fd2.append('key', key)
      if (expire) fd2.append('expiration', String(expire))
      fd2.append('image', b64)
      const res2 = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd2 })
      let json2 = null
      try { json2 = await res2.json() } catch(e) {}
      url = json2 ? pickUrl(json2) : null
      if(!res2.ok || !url){
        return NextResponse.json({ error: 'ImgBB upload failed', detail: json2 || json || { status: res.status } }, { status: 502 })
      }
    }

    urls.push(url)
  }

  return NextResponse.json({ paths: urls })
}
