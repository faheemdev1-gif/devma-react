const messages = {
  en: { invalid:'Please check your name, email and project details, then try again.', forbidden:'Please reload this page and try again.', not_configured:'The form is temporarily unavailable. Please email faheem@devma.it or call +39 348 845 4242.', busy:'The service is busy. Please wait a moment and try again.', send_failed:'We could not confirm your request was sent. Your details are still here. Please retry or email faheem@devma.it.' },
  it: { invalid:'Controlla nome, email e dettagli del progetto, poi riprova.', forbidden:'Ricarica la pagina e riprova.', not_configured:'Il modulo non è al momento disponibile. Scrivi a faheem@devma.it o chiama il +39 348 845 4242.', busy:'Il servizio è occupato. Attendi un momento e riprova.', send_failed:'Non siamo riusciti a confermare l’invio. I tuoi dati sono ancora qui. Riprova o scrivi a faheem@devma.it.' },
};
export function createRequestId() { return crypto.randomUUID(); }
export async function sendEnquiry(payload) {
  const locale = payload.locale === 'it' ? 'it' : 'en';
  try {
    const response = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify(payload), signal:AbortSignal.timeout(25000) });
    const data = await response.json().catch(()=>null);
    if (!response.ok || data?.ok !== true || !data.id) throw new Error(messages[locale][data?.code] || messages[locale].send_failed);
    return data;
  } catch(error) {
    if (Object.values(messages[locale]).includes(error.message)) throw error;
    throw new Error(messages[locale].send_failed);
  }
}
