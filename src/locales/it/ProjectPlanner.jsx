import EnquiryReceipt from '../../EnquiryReceipt.jsx';
import { sendEnquiry, createRequestId } from '../../enquiryClient.js';
import { useEffect, useRef, useState } from 'react';
import { projectServices } from './projectContent.js';

const suggestions = {
  website: 'Vorrei che le persone capissero i miei servizi e mi contattassero.',
  app: 'Vorrei che clienti o collaboratori potessero svolgere un’attività in un unico spazio semplice.',
  chatbot: 'Vorrei rispondere alle domande frequenti dei clienti e passare le richieste a una persona.',
  rag: 'Vorrei che il mio team trovasse risposte affidabili nei nostri documenti.',
  automation: 'Vorrei evitare di ripetere la stessa attività amministrativa in strumenti diversi.',
  iot: 'Vorrei monitorare dispositivi o misurazioni e ricevere avvisi utili.',
  blockchain: 'Vorrei permettere di verificare un documento o un certificato digitale.',
  unsure: 'So cosa vorrei migliorare, ma ho bisogno di aiuto per scegliere la soluzione.',
};

export default function ProjectPlanner() {
  const [service, setService] = useState('unsure');
  const [goal, setGoal] = useState('');
  const [ready, setReady] = useState('Un’idea iniziale');
  const [budget, setBudget] = useState('Vorrei un aiuto per definirlo');
  const [time, setTime] = useState('Flessibili: la qualità viene prima');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [step, setStep] = useState(1);
  const previousStep = useRef(1);
  useEffect(() => {
    if (previousStep.current !== step) { const heading=document.querySelector('.planner-step:not([hidden]) h3'); if (heading) { heading.tabIndex=-1; heading.focus({preventScroll:true}); } }
    previousStep.current=step;
  },[step]);
  const [receipt, setReceipt] = useState(null);
  const [pending, setPending] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const requestId = useRef(null);
  const serviceName = projectServices.find(item => item.id === service)?.name || 'Un aiuto per scegliere il servizio';
  useEffect(() => {
    const choose = event => { if (projectServices.some(item => item.id === event.detail)) { setService(event.detail); setStep(1); setReceipt(null); setDelivered(false); requestId.current=null; } };
    window.addEventListener('devma:choose-service', choose);
    return () => window.removeEventListener('devma:choose-service', choose);
  }, []);
  const text = () => `DEVMA — PRIMA DESCRIZIONE DEL PROGETTO\n\nNome: ${name || 'Non indicato'}\nEmail: ${email || 'Non indicato'}\nProgetto: ${serviceName}\n\nCosa vorrei migliorare:\n${goal || suggestions[service]}\n\nSituazione attuale: ${ready}\nBudget indicativo: ${budget}\nTempistiche: ${time}\n\nVorrei capire insieme a voi i prossimi passi, le attività e i costi.\nQuesta è una richiesta di informazioni, non un ordine o un preventivo vincolante.\n`;
  function download() {
    const url = URL.createObjectURL(new Blob([text()], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'devma-riepilogo-progetto.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Il riepilogo è stato scaricato. Non è stato inviato nulla.');
  }
  async function submit(event) {
    event.preventDefault();
    if (step < 3) { setStep(value=>value+1); return; }
    if (pending || delivered) return;
    const form = event.currentTarget;
    setPending(true); setStatus('');
    try {
      requestId.current ||= createRequestId('it');
      const accepted = await sendEnquiry({ locale:'it', kind:'planner', name, email, message:goal || suggestions[service], service, context:{ ready, budget, timing:time }, website:new FormData(form).get('website') || '', requestId:requestId.current });
      setReceipt(accepted); setDelivered(true); setStatus('Richiesta inviata. Grazie! Ti risponderemo all’indirizzo email che hai indicato.');
    } catch(error) { setStatus(error.message); queueMicrotask(()=>{const notice=document.querySelector('.planner-status');notice?.focus({preventScroll:true});notice?.scrollIntoView({block:'nearest',behavior:'auto'});}); }
    finally { setPending(false); }
  }
  return <section className="planner-section" id="project-planner"><div className="wrap section">
    <div className="section-head split"><div><p className="eyebrow">LA TUA IDEA / UN INIZIO SEMPLICE</p><h2>Parti da ciò che vuoi<br />migliorare.</h2></div><p>Per un sito, un’app o un progetto più ampio. Bastano poche risposte, con parole tue, per iniziare bene.</p></div>
    <div className="planner-layout">{receipt ? <EnquiryReceipt language="it" receipt={receipt} email={email} /> : <form className="planner-form" onSubmit={submit} aria-busy={pending} onChange={() => { if (delivered) { setDelivered(false); setStatus(''); requestId.current=null; } }}><div className="wizard-progress" aria-label="Fasi della richiesta"><button type="button" disabled={step < 1} aria-current={step === 1 ? 'step' : undefined} onClick={()=>setStep(1)}><span>{step > 1 ? '✓' : '01'}</span>La tua idea</button><button type="button" disabled={step < 2} aria-current={step === 2 ? 'step' : undefined} onClick={()=>setStep(2)}><span>{step > 2 ? '✓' : '02'}</span>Il contesto</button><button type="button" disabled={step < 3} aria-current={step === 3 ? 'step' : undefined} onClick={()=>setStep(3)}><span>{step > 3 ? '✓' : '03'}</span>I contatti</button></div><div className="form-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <fieldset className="planner-step" hidden={step !== 1} disabled={pending} aria-label="La tua idea"><span>01</span><div><h3>Cosa hai in mente?</h3><label htmlFor="planner-service">Scegli il tipo di progetto</label><select id="planner-service" value={service} onChange={e => setService(e.target.value)}><option value="unsure">Non lo so ancora</option>{projectServices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label htmlFor="planner-goal">Cosa vorresti migliorare?</label><textarea id="planner-goal" maxLength={1200} rows={3} value={goal} onChange={e => setGoal(e.target.value)} placeholder={suggestions[service]} /><button type="button" className="example-fill" onClick={() => setGoal(suggestions[service])}>Usa questo esempio come punto di partenza →</button></div></fieldset>
      <fieldset className="planner-step" hidden={step !== 2} disabled={pending} aria-label="Il punto di partenza"><span>02</span><div><h3>Da dove parti?</h3><div className="planner-fields"><label>Cosa hai già?<select value={ready} onChange={e => setReady(e.target.value)}><option>Un’idea iniziale</option><option>Un sito o un sistema già esistente</option><option>Contenuti, proposte grafiche o documenti</option><option>Una descrizione e requisiti già definiti</option></select></label><label>Budget indicativo<select value={budget} onChange={e => setBudget(e.target.value)}><option>Vorrei un aiuto per definirlo</option><option>Meno di 1.000 €</option><option>1.000–3.000 €</option><option>3.000–7.000 €</option><option>Oltre 7.000 €</option></select></label></div><label>Tempistiche<select value={time} onChange={e => setTime(e.target.value)}><option>Flessibili: la qualità viene prima</option><option>Ho una data da valutare insieme</option><option>Vorrei iniziare presto</option><option>Sto solo valutando le possibilità</option></select></label><p className="hint">Le tue preferenze ci aiutano a orientare il confronto. Non confermano un prezzo o una data di consegna.</p></div></fieldset>
      <fieldset className="planner-step" hidden={step !== 3} disabled={pending} aria-label="I tuoi contatti"><span>03</span><div><h3>Presentiamoci.</h3><div className="planner-fields"><label>Il tuo nome<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required={step===3} placeholder="Il tuo nome" maxLength={100} /></label><label>La tua email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required={step===3} placeholder="nome@esempio.it" maxLength={160} /></label></div><div className="planner-actions"><button className="button dark" type="submit" disabled={pending || delivered}>{pending ? 'Invio in corso…' : delivered ? 'Richiesta inviata ✓' : 'Invia la richiesta'} <span>→</span></button><button type="button" className="text-link" onClick={download}>Salva il riepilogo ↓</button></div><p className="hint">La richiesta arriva direttamente a Faheem. Usiamo i dati per risponderti e inviarti una conferma email. Salvare il riepilogo non lo invia.</p><p role="status" className="planner-status" aria-live="polite" tabIndex={-1}>{status}</p></div></fieldset>
    <div className="wizard-navigation">{step > 1 && <button type="button" className="wizard-back" disabled={pending} onClick={()=>setStep(value=>value-1)}>← Indietro</button>}{step < 3 && <button type="button" className="button dark" onClick={()=>setStep(value=>value+1)}>Continua <span>→</span></button>}<span>Passo {step} / 3</span></div></form>}<aside className="planner-summary"><p className="eyebrow">IL TUO PROGETTO PRENDE FORMA</p><h3>{serviceName}</h3><p className="summary-goal">{goal || suggestions[service]}</p><dl><dt>Punto di partenza</dt><dd>{ready}</dd><dt>Budget indicativo</dt><dd>{budget}</dd><dt>Tempistiche</dt><dd>{time}</dd></dl><div className="next-conversation"><h4>Cosa succede dopo?</h4><ol><li>Chiariamo l’obiettivo e a chi si rivolge.</li><li>Proponiamo una prima versione concreta.</li><li>Concordiamo attività, costi e prossimi passi prima di qualsiasi impegno.</li></ol></div><a href="mailto:faheem@devma.it">faheem@devma.it →</a><a href="tel:+393488454242">Preferisci chiamare? +39 348 845 4242</a></aside></div>
  </div></section>;
}
