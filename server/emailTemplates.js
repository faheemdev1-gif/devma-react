export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function shell({ locale, eyebrow, title, content, footer }) {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f4f4ed;color:#20271f;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px"><tr><td style="padding:8px 8px 28px;font-size:36px;font-weight:700;letter-spacing:-2px">devma<span style="color:#2d4fff">✳</span></td></tr><tr><td style="background:#ffffff;border:1px solid #dce2d5;border-radius:12px;padding:36px 28px"><p style="font-size:10px;font-weight:700;letter-spacing:2px;color:#2d4fff;margin:0 0 20px">${escapeHtml(eyebrow)}</p><h1 style="font-size:30px;line-height:1.2;font-weight:500;letter-spacing:-1px;margin:0 0 24px">${escapeHtml(title)}</h1>${content}</td></tr><tr><td style="padding:24px 8px;color:#687460;font-size:11px;line-height:1.8">${footer}<br><a href="https://devma.it/${locale}/" style="color:#2d4fff">devma.it</a> · <a href="mailto:faheem@devma.it" style="color:#687460">faheem@devma.it</a></td></tr></table></td></tr></table></body></html>`;
}
export function confirmationEmail(data, reference) {
  const it = data.locale === 'it';
  const firstName = data.name.split(/\s+/)[0];
  const title = it ? 'La tua idea è in buone mani.' : 'Your idea has a place to start.';
  const subject = it ? 'Abbiamo ricevuto la tua richiesta | Devma' : 'We’ve received your enquiry | Devma';
  const greeting = it ? `Ciao ${firstName},` : `Hi ${firstName},`;
  const thanks = it ? 'grazie per aver contattato Devma. Abbiamo ricevuto la tua richiesta e Faheem ti risponderà a questo indirizzo email dopo averla esaminata.' : 'thank you for getting in touch with Devma. We’ve received your enquiry, and Faheem will reply to this email address after reviewing it.';
  const next = it ? 'Il prossimo passo è capire meglio il tuo obiettivo e proporti un modo concreto per iniziare. Se serviranno altre informazioni, te le chiederemo con semplicità.' : 'The next step is to understand your goal and suggest a practical way forward. If we need any more information, we’ll ask you for it in plain language.';
  const add = it ? 'Vuoi aggiungere qualcosa? Rispondi direttamente a questa email: la tua risposta arriverà a Faheem.' : 'Want to add anything? Just reply to this email—your reply will go directly to Faheem.';
  const noCommitment = it ? 'Questa conferma non è un ordine né un preventivo. Non devi effettuare alcun pagamento.' : 'This acknowledgement is not an order or a quote. No payment is required.';
  const sign = it ? 'A presto,\nFaheem · Devma' : 'Speak soon,\nFaheem · Devma';
  const refLabel = it ? 'Riferimento della richiesta' : 'Your enquiry reference';
  const footer = it ? 'Email di conferma automatica inviata in seguito a una richiesta sul sito Devma. Se non l’hai inviata tu, puoi ignorare questo messaggio.' : 'Automatic acknowledgement of an enquiry submitted on the Devma website. If you did not submit it, you can ignore this message.';
  const paragraph = text => `<p style="font-size:15px;line-height:1.8;margin:0 0 18px">${escapeHtml(text)}</p>`;
  const html = shell({ locale:data.locale, eyebrow:it?'RICHIESTA RICEVUTA':'ENQUIRY RECEIVED', title, content:paragraph(greeting)+paragraph(thanks)+`<div style="padding:18px 20px;background:#edf1e5;border-radius:6px;margin:24px 0"><span style="font-size:10px;color:#687460">${refLabel}</span><p style="font-size:20px;letter-spacing:1px;margin:8px 0 0">${escapeHtml(reference)}</p></div>`+paragraph(next)+paragraph(add)+`<p style="font-size:12px;line-height:1.8;color:#687460">${escapeHtml(noCommitment)}</p>`+paragraph(sign).replace('\n','<br>'), footer });
  return { subject, text:[greeting,'',thanks,'',`${refLabel}: ${reference}`,'',next,'',add,'',noCommitment,'',sign,'',footer].join('\n'), html };
}
export function notificationHtml(mail, data, reference) {
  const it = data.locale === 'it';
  return shell({ locale:data.locale, eyebrow:it?'NUOVA RICHIESTA DAL SITO':'NEW WEBSITE ENQUIRY', title:mail.subject.replace('[Devma] ',''), content:`<p style="font-size:12px;color:#687460">${escapeHtml(reference)}</p><div style="font-size:14px;line-height:1.85;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(mail.text)}</div>`, footer:it?'Rispondi a questa email per contattare il cliente.':'Reply to this email to contact the customer.' });
}
