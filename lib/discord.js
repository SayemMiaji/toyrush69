export async function sendDiscordPreorder({ webhookUrl, request }) {
  try {
    if (!webhookUrl) return { ok:false, error: 'No webhook URL configured' };
    const payload = {
      content: '**New Preorder Request**',
      embeds: [
        {
          title: request.productName || 'Preorder Request',
          description: [
            `**Customer:** ${request.fullName}`,
            request.productUrl ? `**URL:** ${request.productUrl}` : null,
            `**WhatsApp:** ${request.whatsapp}`,
          ].filter(Boolean).join('\n'),
          timestamp: new Date(request.createdAt || Date.now()).toISOString(),
        }
      ]
    };

    // If there are images as data URLs, upload as attachments
    const files = [];
    const MAX_FILES = 4;
    const imgs = (request.images || []).slice(0, MAX_FILES);
    for (let i = 0; i < imgs.length; i++) {
      const src = imgs[i];
      if (typeof src === 'string' && src.startsWith('data:')) {
        const [meta, b64] = src.split(',');
        const mime = (meta.match(/^data:(.*?);/i) || [,'image/jpeg'])[1];
        const buf = Buffer.from(b64, 'base64');
        files.push({ name: `image_${i+1}.${mime.split('/')[1] || 'jpg'}`, type: mime, data: buf });
      }
    }

    // If there are attachments, use multipart/form-data
    if (files.length) {
      const form = new FormData();
      form.set('payload_json', JSON.stringify(payload));
      files.forEach((f, idx) => {
        form.append(`files[${idx}]`, new Blob([f.data], { type: f.type }), f.name);
      });
      const resp = await fetch(webhookUrl, { method: 'POST', body: form });
      if (!resp.ok) {
        const t = await resp.text();
        return { ok:false, error: `Discord responded ${resp.status}: ${t}` };
      }
      return { ok:true };
    }

    // Otherwise send JSON only
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const t = await resp.text();
      return { ok:false, error: `Discord responded ${resp.status}: ${t}` };
    }
    return { ok:true };
  } catch (e) {
    return { ok:false, error: e?.message || String(e) };
  }
}
