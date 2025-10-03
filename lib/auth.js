
import crypto from 'crypto'
function b64url(buf){ return Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') }
function b64urlDecode(str){ str=str.replace(/-/g,'+').replace(/_/g,'/'); while(str.length%4) str+='='; return Buffer.from(str,'base64').toString() }
export function sign(data, secret){ const json=typeof data==='string'?data:JSON.stringify(data); const payload=b64url(json); const sig=crypto.createHmac('sha256',secret).update(payload).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); return payload+'.'+sig }
export function verify(token, secret){ if(!token||token.indexOf('.')<0) return null; const [payload,sig]=token.split('.'); const expected=crypto.createHmac('sha256',secret).update(payload).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); if(sig!==expected) return null; try{ const json=b64urlDecode(payload); return JSON.parse(json) }catch{ return null } }
export function isExpired(obj){ if(!obj||!obj.exp) return true; return Date.now()>Number(obj.exp) }
