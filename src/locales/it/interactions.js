import { getCurrentEstimate, websiteBrief } from '../../pricing.js';
import { sendEnquiry, createRequestId } from '../../enquiryClient.js';
export function initialiseSite() {
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
$('#year').textContent=new Date().getFullYear();$('#menu').onclick=()=>{const open=$('nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',open)};$$('nav a').forEach(a=>a.onclick=()=>{$('nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')});
let overviewSelection=0;
$('#service-guide-link').onclick=()=>window.dispatchEvent(new CustomEvent('devma:explore-service',{detail:['website','app','chatbot','automation','blockchain'][overviewSelection]}));
const services=[
 ['Una prima impressione migliore. Il passo successivo, più chiaro.','Dal sito professionale al negozio online, aiutiamo chi ti visita a capire cosa offri e a contattarti o acquistare con facilità.',['Siti aziendali','Negozi online','Prenotazioni'],'→','LA TUA ATTIVITÀ. NUOVE POSSIBILITÀ.'],
 ['La giornata diventa più semplice.','Offri a clienti o collaboratori un unico spazio per prenotare, gestire attività o accedere a un servizio. Progettiamo intorno alle persone che lo useranno.',['Portali clienti','Applicazioni web','App mobile'],'⌘','MENO OSTACOLI. PIÙ POSSIBILITÀ.'],
 ['Risposte utili, senza ricerche infinite.','Un assistente IA può rispondere alle domande frequenti o aiutare il team a cercare nei propri documenti. Nei sistemi RAG le risposte si basano sulle tue fonti, con riferimenti e verifiche umane.',['Chatbot IA','Sistemi RAG','Assistenti documentali'],'✦','IL TUO SAPERE. PIÙ FACILE DA TROVARE.'],
 ['Meno passaggi manuali. Più tempo per la tua attività.','L’automazione con IA aiuta a classificare richieste, preparare risposte e trasferire informazioni tra strumenti, con approvazione umana quando serve. I flussi aziendali gestiscono i passaggi ripetitivi; l’IoT collega dispositivi, sensori e avvisi.',['Automazione IA','Automazione dei processi','Automazione IoT'],'⇄','GLI STRUMENTI GIUSTI, INSIEME.'],
 ['Dati condivisi che si possono verificare.','Quando è adatta al progetto, la blockchain aiuta a verificare certificati, registrare transazioni o tracciare titolarità digitali tra organizzazioni. Prima valutiamo il vantaggio concreto.',['Registrazioni verificabili','Titolarità digitale','Smart contract'],'◇','LA VERIFICA FA PARTE DEL PROGETTO.']
];
$$('.service').forEach(b=>b.onclick=()=>{$$('.service').forEach(x=>x.classList.remove('active'));b.classList.add('active');overviewSelection=+b.dataset.service;const d=services[overviewSelection];$('#service-title').textContent=d[0];$('#service-copy').textContent=d[1];$('#service-tags').replaceChildren(...d[2].map(t=>{const s=document.createElement('span');s.textContent=t;return s}));$('#demo-icon').textContent=d[3];$('#demo-label').textContent=d[4]});
const estimate=()=>getCurrentEstimate();
function brief(){return websiteBrief(getCurrentEstimate(),'it');}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const formText={"send": "Invia la richiesta", "sending": "Invio in corso…", "sent": "Richiesta inviata ✓", "success": "Richiesta inviata. Grazie! Ti risponderemo all’indirizzo email che hai indicato.", "download": "Il riepilogo è stato scaricato. Non è stato inviato nulla."};
let formPending=false, formDelivered=false, formRequestId=null;
const dialogTitle=$('#brief-dialog h2').innerHTML;
const sendButton=$('#brief-form button[value="send"]');
function openBrief(include){
  $('#brief-form').elements.include.checked=include;
  if (!formPending) { $('#brief-form').hidden=false; $('#brief-dialog .dialog-intro').hidden=false; $('#brief-dialog h2').innerHTML=dialogTitle; $('#form-status').classList.remove('modal-receipt'); $('#form-status').textContent=''; formDelivered=false; formRequestId=null; sendButton.disabled=false; sendButton.textContent=formText.send; }
  $('#brief-dialog').showModal();
}
$('#brief-button').onclick=()=>openBrief(true);$('#contact-button').onclick=()=>openBrief(false);
$('#portfolio-request-button').onclick=()=>{openBrief(false);$('#brief-form').elements.idea.value='Vorrei vedere esempi di portfolio pertinenti alla mia attività. Mi occupo di…';};
$('#brief-form').addEventListener('input',()=>{if(formDelivered){formDelivered=false;formRequestId=null;sendButton.disabled=false;sendButton.textContent=formText.send;$('#form-status').textContent='';}});
$('#brief-form').onsubmit=async e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  if(e.submitter?.value==='download'){download(`Devma\n\n${f.get('name')}\n${f.get('email')}\n\n${f.get('idea')}\n\n${f.get('include')?brief():''}`,'devma-project-brief.txt');$('#form-status').textContent=formText.download;return;}
  if(formPending||formDelivered)return;
  formPending=true;formRequestId ||= createRequestId();sendButton.disabled=true;sendButton.textContent=formText.sending;$('#form-status').textContent='';$('#brief-form').setAttribute('aria-busy','true');
  const current=estimate();
  const estimateData=f.get('include')?{packageId:current.packageId,pages:current.pages,addons:current.addons}:null;
  try{
    const receipt=await sendEnquiry({locale:'it',kind:estimateData?'website':'contact',name:f.get('name'),email:f.get('email'),message:f.get('idea'),service:estimateData?'website':'unsure',estimate:estimateData,website:f.get('website')||'',requestId:formRequestId});
    formDelivered=true;sendButton.textContent=formText.sent;$('#brief-form').hidden=true;$('#brief-dialog .dialog-intro').hidden=true;$('#brief-dialog h2').textContent='Grazie. Ti ascoltiamo.';$('#form-status').classList.add('modal-receipt');$('#form-status').textContent=`✓ Richiesta ricevuta\n\nIl tuo riferimento: ${receipt.reference}\n\nFaheem esaminerà la richiesta e ti risponderà a ${f.get('email')}.\n\n${receipt.confirmationSent?'Abbiamo inviato anche un’email di conferma. Se non la trovi, controlla la cartella spam.':'La richiesta è stata ricevuta, ma l’email di conferma potrebbe non arrivare. Potremo comunque risponderti.'}\n\nIl prossimo passo: chiarire l’obiettivo e concordare un percorso concreto.`;
  }catch(error){sendButton.disabled=false;sendButton.textContent=formText.send;$('#form-status').textContent=error.message;}
  finally{formPending=false;$('#brief-form').setAttribute('aria-busy','false');}
};
$$('dialog .close,dialog .close-secondary').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));$('#privacy-button').onclick=()=>{$('#modal-category').textContent='PRIVACY';$('#modal-title').textContent='I tuoi dati, con chiarezza.';$('#modal-description').textContent='Quando invii un modulo, nome, email e dettagli del progetto vengono trattati dal fornitore di hosting e da Resend per recapitare la richiesta a Devma. Li usiamo per risponderti. Scaricare un riepilogo non lo invia. Non sono stati aggiunti strumenti di analisi o pubblicità.';$('#modal-extra').innerHTML='<p>I caratteri vengono caricati da Google Fonts. I fornitori di hosting possono trattare dati tecnici delle richieste per rendere disponibile il sito. Contatto: <a href="mailto:faheem@devma.it">faheem@devma.it</a>, +39 348 845 4242. Prima della pubblicazione definitiva, l’informativa privacy deve indicare il titolare del trattamento e spiegare gestione e conservazione delle email.</p>';$('#project-dialog').showModal()};
// Pause decorative CSS motion outside the viewport and in background tabs.
const navigationLinks=$$('nav a[href^="#"]');
const sectionObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
    navigationLinks.forEach(link=>{const active=link.getAttribute('href')==='#'+entry.target.id;link.classList.toggle('is-current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
},{rootMargin:'-15% 0px -65% 0px',threshold:0});
navigationLinks.forEach(link=>{const section=document.querySelector(link.getAttribute('href'));if(section)sectionObserver.observe(section);});
const motionTargets = $$('[data-motion]');
const visibleTargets = new Set();
const updateMotion = () => motionTargets.forEach(node => {
  node.classList.toggle('motion-paused', document.hidden || !visibleTargets.has(node));
});
const motionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? visibleTargets.add(entry.target) : visibleTargets.delete(entry.target));
  updateMotion();
}, { threshold: 0.01 });
motionTargets.forEach(node => { node.classList.add('motion-paused'); motionObserver.observe(node); });
document.addEventListener('visibilitychange', updateMotion);
return () => {
  motionObserver.disconnect();
  sectionObserver.disconnect();
  document.removeEventListener('visibilitychange', updateMotion);
};
}
