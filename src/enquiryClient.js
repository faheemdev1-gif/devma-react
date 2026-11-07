const messages = {
  en: {
    invalid:'Please check your name, email and project details, then try again.',
    forbidden:'The site address is not allowed to send this form. Please open devma.it and try again. [FORM_ORIGIN]',
    not_configured:'Website sending has not been activated yet. Please email faheem@devma.it or call +39 348 845 4242. [FORM_CONFIG]',
    sender_unverified:'The website’s sending address has not been verified yet. Please email faheem@devma.it. [FORM_SENDER]',
    endpoint_missing:'The sending service is not deployed at this website address. Please email faheem@devma.it. [FORM_ENDPOINT]',
    busy:'The service is busy. Please wait a moment and try again. [FORM_BUSY]',
    send_failed:'We could not confirm your request was sent. Your details are still here. Please retry or email faheem@devma.it. [FORM_SEND]',
    network:'The request could not connect or took too long. Your details are still here. Please retry or email faheem@devma.it. [FORM_NETWORK]',
  },
  it: {
    invalid:'Controlla nome, email e dettagli del progetto, poi riprova.',
    forbidden:'Questo indirizzo del sito non è autorizzato a inviare il modulo. Apri devma.it e riprova. [FORM_ORIGIN]',
    not_configured:'L’invio dal sito non è ancora attivo. Scrivi a faheem@devma.it o chiama il +39 348 845 4242. [FORM_CONFIG]',
    sender_unverified:'L’indirizzo di invio del sito non è ancora verificato. Scrivi a faheem@devma.it. [FORM_SENDER]',
    endpoint_missing:'Il servizio di invio non è pubblicato a questo indirizzo del sito. Scrivi a faheem@devma.it. [FORM_ENDPOINT]',
    busy:'Il servizio è occupato. Attendi un momento e riprova. [FORM_BUSY]',
    send_failed:'Non siamo riusciti a confermare l’invio. I tuoi dati sono ancora qui. Riprova o scrivi a faheem@devma.it. [FORM_SEND]',
    network:'Non è stato possibile collegarsi al servizio o il tempo è scaduto. I tuoi dati sono ancora qui. Riprova o scrivi a faheem@devma.it. [FORM_NETWORK]',
  },
};
export function createRequestId(locale='en') {
  const secureCrypto=globalThis.crypto;
  if (typeof secureCrypto?.randomUUID === 'function') return secureCrypto.randomUUID();
  if (typeof secureCrypto?.getRandomValues === 'function') {
    const bytes=secureCrypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
  }
  throw new Error(messages[locale==='it'?'it':'en'].network);
}
export async function sendEnquiry(payload) {
  const locale = payload.locale === 'it' ? 'it' : 'en';
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),25000);
  try {
    const response = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify(payload), signal:controller.signal });
    const data = await response.json().catch(()=>null);
    const code=data?.code || (response.status===404||response.status===405?'endpoint_missing':null);
    if (!response.ok || data?.ok !== true || !data.id) throw new Error(messages[locale][code] || messages[locale].send_failed);
    return data;
  } catch(error) {
    if (Object.values(messages[locale]).includes(error.message)) throw error;
    throw new Error(messages[locale].network);
  } finally { clearTimeout(timeout); }
}
