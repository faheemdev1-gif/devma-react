import { createHash } from 'node:crypto';
import { confirmationEmail, notificationHtml } from './emailTemplates.js';

const services = new Set(['website', 'app', 'chatbot', 'rag', 'automation', 'iot', 'blockchain', 'unsure']);
const plans = [{ price: 490, pages: 1 }, { price: 990, pages: 5 }, { price: 1790, pages: 5 }];
const extras = { copywriting: 180, language: 220, booking: 150 };
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
function clean(value, max, required = false, singleLine = false) {
  if (typeof value !== 'string' || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value) || (singleLine && /[\r\n]/.test(value))) throw new Error('invalid');
  const result = value.trim();
  if (required && !result) throw new Error('invalid');
  return result;
}
export function validateEnquiry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid');
  const locale = body.locale === 'it' ? 'it' : 'en';
  const name = clean(body.name, 100, true, true);
  const email = clean(body.email, 160, true, true);
  if (!emailPattern.test(email) || !['contact', 'planner', 'website'].includes(body.kind)) throw new Error('invalid');
  if (body.website !== undefined && clean(body.website, 200)) throw new Error('invalid');
  const message = clean(body.message, 2000, true);
  const requestId = clean(body.requestId, 80, true, true);
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(requestId)) throw new Error('invalid');
  let estimate = null;
  if (body.estimate != null) {
    const e = body.estimate;
    if (!Number.isInteger(e.packageId) || !plans[e.packageId] || !Number.isInteger(e.pages) || e.pages < plans[e.packageId].pages || e.pages > 15 || !Array.isArray(e.addons) || e.addons.length > 3 || new Set(e.addons).size !== e.addons.length || e.addons.some(a => !Object.hasOwn(extras, a))) throw new Error('invalid');
    estimate = { packageId: e.packageId, pages: e.pages, addons: [...e.addons].sort(), total: plans[e.packageId].price + (e.pages - plans[e.packageId].pages) * 90 + e.addons.reduce((n, a) => n + extras[a], 0) };
  }
  const service = body.service ?? 'unsure';
  if (!services.has(service)) throw new Error('invalid');
  const context = {};
  for (const key of ['ready', 'budget', 'timing']) context[key] = clean(body.context?.[key] ?? '', 200, false, true);
  return { locale, name, email, message, requestId, kind: body.kind, service, context, estimate };
}
export function makeEmail(data) {
  const it = data.locale === 'it';
  const labels = it ? ['Nome', 'Email', 'Tipo di richiesta', 'Servizio', 'Messaggio', 'Situazione attuale', 'Budget indicativo', 'Tempistiche'] : ['Name', 'Email', 'Enquiry type', 'Service', 'Message', 'Starting point', 'Budget preference', 'Timing'];
  const names = it ? ['Essenziale', 'Professionale', 'Negozio'] : ['Launch', 'Business', 'Shop'];
  const serviceNames = it ? {website:'Sito web',app:'Applicazione',chatbot:'Chatbot IA',rag:'Sistema RAG',automation:'Automazione',iot:'IoT',blockchain:'Blockchain',unsure:'Da definire'} : {website:'Website',app:'Application',chatbot:'AI chatbot',rag:'RAG system',automation:'Automation',iot:'IoT',blockchain:'Blockchain',unsure:'To be discussed'};
  const kind = it ? {contact:'Contatto',planner:'Progetto',website:'Stima sito web'} : {contact:'Contact',planner:'Project',website:'Website estimate'};
  const rows = [`DEVMA — ${it ? 'NUOVA RICHIESTA DAL SITO' : 'NEW WEBSITE ENQUIRY'}`, '', `${labels[0]}: ${data.name}`, `${labels[1]}: ${data.email}`, `${labels[2]}: ${kind[data.kind]}`, `${labels[3]}: ${serviceNames[data.service]}`, '', `${labels[4]}:`, data.message];
  for (const [i, key] of ['ready', 'budget', 'timing'].entries()) if (data.context[key]) rows.push('', `${labels[5+i]}: ${data.context[key]}`);
  if (data.estimate) {
    const e = data.estimate;
    const addonNames = it ? {copywriting:'Supporto ai testi',language:'Seconda lingua',booking:'Prenotazioni'} : {copywriting:'Writing support',language:'Second language',booking:'Booking integration'};
    rows.push('', it ? 'STIMA INDICATIVA DEL SITO' : 'INDICATIVE WEBSITE ESTIMATE', `${it?'Pacchetto':'Package'}: ${names[e.packageId]}`, `${it?'Pagine':'Pages'}: ${e.pages}`, `${it?'Opzioni':'Additions'}: ${e.addons.map(a=>addonNames[a]).join(', ') || (it?'Nessuna':'None')}`, `${it?'Totale indicativo':'Indicative total'}: ${new Intl.NumberFormat(it?'it-IT':'en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0,useGrouping:'always'}).format(e.total)}`, it?'Stima non vincolante. Attività, trattamento fiscale, tempi e costi esterni da confermare.':'Non-binding estimate. Scope, tax treatment, timing and external costs must be confirmed.');
  }
  return { subject: `[Devma] ${it?'Nuova richiesta':'New enquiry'} — ${kind[data.kind]}`, text: rows.join('\n') };
}
export function allowedOrigins(env) {
  const origins = new Set(['https://devma.it', 'https://www.devma.it']);
  for (const raw of [env.VERCEL_URL, env.VERCEL_BRANCH_URL, ...(env.CONTACT_ALLOWED_ORIGINS || '').split(',')]) {
    if (!raw) continue;
    try { origins.add(new URL(raw.includes('://') ? raw : `https://${raw}`).origin); } catch { /* Ignore invalid configured origins. */ }
  }
  return origins;
}
export async function processEnquiry({ method, headers, body }, { env = process.env, fetchImpl = fetch } = {}) {
  const result = (status, code, extra={}) => ({ status, body: { ...(status===200?{ok:true}:{ok:false,code}), ...extra } });
  if (method !== 'POST') return result(405, 'method_not_allowed');
  if (!allowedOrigins(env).has(headers.origin) || (headers['sec-fetch-site'] && !['same-origin','none'].includes(headers['sec-fetch-site']))) return result(403, 'forbidden');
  if (!String(headers['content-type'] || '').toLowerCase().startsWith('application/json')) return result(415, 'invalid');
  if (Number(headers['content-length'] || 0) > 16000) return result(413, 'invalid');
  let data;
  try {
    if (typeof body === 'string' && Buffer.byteLength(body) > 16000) return result(413, 'invalid');
    data = validateEnquiry(typeof body === 'string' ? JSON.parse(body) : body);
  } catch { return result(400, 'invalid'); }
  const from = env.RESEND_FROM;
  const to = env.CONTACT_TO || 'faheem@devma.it';
  if (!env.RESEND_API_KEY || !from || /[\r\n]/.test(from) || !emailPattern.test(to)) return result(503, 'not_configured');
  const mail = makeEmail(data);
  const reference = 'DVM-' + createHash('sha256').update(data.requestId).digest('hex').slice(0, 10).toUpperCase();
  const idempotencyKey = 'devma-' + createHash('sha256').update(JSON.stringify({data,from,to})).digest('hex');
  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ from, to: [to], reply_to: data.email, subject: mail.subject, text: mail.text + '\n\n' + reference, html:notificationHtml(mail,data,reference) }), signal: AbortSignal.timeout(10000),
    });
    const sent = await response.json().catch(() => null);
    if (!response.ok || typeof sent?.id !== 'string') return result(response.status===429?429:502, response.status===429?'busy':'send_failed');
    // Receipt failure must never turn an accepted business enquiry into a failed submission.
    const confirmation = confirmationEmail(data, reference);
    let confirmationSent = false;
    try {
      const receipt = await fetchImpl('https://api.resend.com/emails', {
        method:'POST', headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey+'-confirmation'},
        body:JSON.stringify({from,to:[data.email],reply_to:to,...confirmation}),signal:AbortSignal.timeout(7000),
      });
      const receiptData = await receipt.json().catch(()=>null);
      confirmationSent = receipt.ok && typeof receiptData?.id === 'string';
    } catch { /* The original enquiry was already accepted. */ }
    return result(200, null, { id: sent.id, reference, confirmationSent });
  } catch { return result(502, 'send_failed'); }
}
