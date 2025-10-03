'use client'

function normalizeStatus(s=''){
  const k = String(s||'').toLowerCase().replace(/[^a-z]/g,'');
  // common aliases
  if (k === 'cancel' || k === 'canceled') return 'cancelled';
  return k;
}

export default function StatusPipeline({
  currentStatus,
  history = [],
  flow = ['processing','shipped','delivered'],
  cancelledKey = 'cancelled',
}){
  // derive current from provided or history
  let curr = normalizeStatus(currentStatus);
  if (!curr && Array.isArray(history) && history.length){
    for (let i = history.length - 1; i >= 0; i--){
      const v = normalizeStatus(history[i]?.status || history[i]?.title);
      if (v) { curr = v; break; }
    }
  }

  // If cancelled, show single red marker
  if (curr === normalizeStatus(cancelledKey)){
    return (
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        <span className="text-red-500 font-medium">Cancelled</span>
      </div>
    );
  }

  const flowKeys = flow.map(normalizeStatus);
  const idx = flowKeys.indexOf(curr);
  return (
    <ul className="grid gap-2">
      {flow.map((label, i)=>{
        const state = (idx === -1)
          ? 'upcoming'
          : (i < idx ? 'completed' : (i === idx ? 'current' : 'upcoming'));
        const dotClass = state === 'current'
          ? 'bg-green-500'
          : state === 'completed'
            ? 'bg-gray-400'
            : 'bg-transparent border border-gray-400';
        const textClass = state === 'current'
          ? 'text-green-600 font-medium'
          : state === 'completed'
            ? 'text-gray-500'
            : 'text-gray-400';
        return (
          <li key={label} className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`}></span>
            <span className={textClass}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
