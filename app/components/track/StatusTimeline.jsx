'use client'
export default function StatusTimeline({ steps=[] }){
  if (!steps?.length) return null;
  return (
    <ol className="relative border-s border-black/10 dark:border-white/10 ps-6 space-y-4">
      {steps.map((s, i)=>(
        <li key={i} className="ms-4">
          <div className="absolute w-3 h-3 bg-current rounded-full mt-1.5 -start-1.5"></div>
          <time className="block text-xs opacity-70">{s.date || s.at || ''}</time>
          <h3 className="text-sm font-medium">{s.title || s.status || ''}</h3>
          {s.note ? <p className="text-xs opacity-80">{s.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}
