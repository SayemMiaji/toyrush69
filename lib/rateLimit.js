const buckets = new Map(); // key => { count, reset }
const FAIL_BUCKETS = new Map(); // track failures if needed (not used now)

function keyFor(ip){
  const now = Date.now();
  const hour = Math.floor(now / (60*60*1000));
  return `${ip}|${hour}`;
}

export function allow(ip, limit = 10){
  const k = keyFor(ip || "unknown");
  const e = buckets.get(k) || { count: 0 };
  e.count += 1;
  buckets.set(k, e);
  return e.count <= limit;
}
