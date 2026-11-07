import EnquiryReceipt from '../../EnquiryReceipt.jsx';
import { sendEnquiry, createRequestId } from '../../enquiryClient.js';
import { useEffect, useRef, useState } from 'react';
import { projectServices } from './projectContent.js';

const suggestions = {
  website: 'I want people to understand my services and contact me.',
  app: 'I want customers or staff to complete a task in one simple place.',
  chatbot: 'I want to answer common customer questions and pass enquiries to a person.',
  rag: 'I want my team to find reliable answers in our own documents.',
  automation: 'I want to stop repeating the same admin task across different tools.',
  iot: 'I want to monitor devices or readings and receive useful alerts.',
  blockchain: 'I want people to verify a digital record or certificate.',
  unsure: 'I know what could be better, but I need help choosing the right approach.',
};

export default function ProjectPlanner() {
  const [service, setService] = useState('unsure');
  const [goal, setGoal] = useState('');
  const [ready, setReady] = useState('An early idea');
  const [budget, setBudget] = useState('Help me work this out');
  const [time, setTime] = useState('Flexible — quality comes first');
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
  const serviceName = projectServices.find(item => item.id === service)?.name || 'Help choosing the right service';
  useEffect(() => {
    const choose = event => { if (projectServices.some(item => item.id === event.detail)) { setService(event.detail); setStep(1); setReceipt(null); setDelivered(false); requestId.current=null; } };
    window.addEventListener('devma:choose-service', choose);
    return () => window.removeEventListener('devma:choose-service', choose);
  }, []);
  const text = () => `DEVMA — PROJECT STARTER\n\nName: ${name || 'Not supplied'}\nEmail: ${email || 'Not supplied'}\nProject: ${serviceName}\n\nWhat I want to improve:\n${goal || suggestions[service]}\n\nWhere I am today: ${ready}\nBudget preference: ${budget}\nTiming: ${time}\n\nPlease help me understand the next step, scope and costs.\nThis is an enquiry, not an order or a binding quote.\n`;
  function download() {
    const url = URL.createObjectURL(new Blob([text()], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'devma-project-starter.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Your project starter has been downloaded. Nothing has been sent.');
  }
  async function submit(event) {
    event.preventDefault();
    if (step < 3) { setStep(value=>value+1); return; }
    if (pending || delivered) return;
    const form = event.currentTarget;
    setPending(true); setStatus('');
    try {
      requestId.current ||= createRequestId('en');
      const accepted = await sendEnquiry({ locale:'en', kind:'planner', name, email, message:goal || suggestions[service], service, context:{ ready, budget, timing:time }, website:new FormData(form).get('website') || '', requestId:requestId.current });
      setReceipt(accepted); setDelivered(true); setStatus('Request sent. Thank you! We’ll reply to the email address you provided.');
    } catch(error) { setStatus(error.message); queueMicrotask(()=>{const notice=document.querySelector('.planner-status');notice?.focus({preventScroll:true});notice?.scrollIntoView({block:'nearest',behavior:'auto'});}); }
    finally { setPending(false); }
  }
  return <section className="planner-section" id="project-planner"><div className="wrap section">
    <div className="section-head split"><div><p className="eyebrow">YOUR IDEA / A SIMPLE WAY IN</p><h2>Start with what you want<br />to make better.</h2></div><p>For a website, app or something more ambitious. A few plain-language answers give us a useful place to start.</p></div>
    <div className="planner-layout">{receipt ? <EnquiryReceipt language="en" receipt={receipt} email={email} /> : <form className="planner-form" onSubmit={submit} aria-busy={pending} onChange={() => { if (delivered) { setDelivered(false); setStatus(''); requestId.current=null; } }}><div className="wizard-progress" aria-label="Enquiry steps"><button type="button" disabled={step < 1} aria-current={step === 1 ? 'step' : undefined} onClick={()=>setStep(1)}><span>{step > 1 ? '✓' : '01'}</span>Your idea</button><button type="button" disabled={step < 2} aria-current={step === 2 ? 'step' : undefined} onClick={()=>setStep(2)}><span>{step > 2 ? '✓' : '02'}</span>The context</button><button type="button" disabled={step < 3} aria-current={step === 3 ? 'step' : undefined} onClick={()=>setStep(3)}><span>{step > 3 ? '✓' : '03'}</span>Your details</button></div><div className="form-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <fieldset className="planner-step" hidden={step !== 1} disabled={pending} aria-label="Your idea"><span>01</span><div><h3>What are you thinking about?</h3><label htmlFor="planner-service">Choose a project type</label><select id="planner-service" value={service} onChange={e => setService(e.target.value)}><option value="unsure">I’m not sure yet</option>{projectServices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label htmlFor="planner-goal">What would you like to improve?</label><textarea id="planner-goal" maxLength={1200} rows={3} value={goal} onChange={e => setGoal(e.target.value)} placeholder={suggestions[service]} /><button type="button" className="example-fill" onClick={() => setGoal(suggestions[service])}>Use this example as a starting point →</button></div></fieldset>
      <fieldset className="planner-step" hidden={step !== 2} disabled={pending} aria-label="Your starting point"><span>02</span><div><h3>Where are you starting from?</h3><div className="planner-fields"><label>What do you have?<select value={ready} onChange={e => setReady(e.target.value)}><option>An early idea</option><option>An existing website or system</option><option>Content, designs or documents</option><option>A clear brief and requirements</option></select></label><label>Budget preference<select value={budget} onChange={e => setBudget(e.target.value)}><option>Help me work this out</option><option>Under €1,000</option><option>€1,000–€3,000</option><option>€3,000–€7,000</option><option>€7,000+</option></select></label></div><label>Timing<select value={time} onChange={e => setTime(e.target.value)}><option>Flexible — quality comes first</option><option>I have a target date to discuss</option><option>I would like to start soon</option><option>I’m just exploring options</option></select></label><p className="hint">Your preferences help shape the conversation. They don’t reserve a price or delivery date.</p></div></fieldset>
      <fieldset className="planner-step" hidden={step !== 3} disabled={pending} aria-label="Your contact details"><span>03</span><div><h3>Let’s make the introduction.</h3><div className="planner-fields"><label>Your name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required={step===3} placeholder="Your name" maxLength={100} /></label><label>Your email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required={step===3} placeholder="you@example.com" maxLength={160} /></label></div><div className="planner-actions"><button className="button dark" type="submit" disabled={pending || delivered}>{pending ? 'Sending…' : delivered ? 'Request sent ✓' : 'Send my enquiry'} <span>→</span></button><button type="button" className="text-link" onClick={download}>Save my brief ↓</button></div><p className="hint">Your enquiry goes directly to Faheem. We use your details to respond and send a confirmation email. Saving the brief does not send it.</p><p role="status" className="planner-status" aria-live="polite" tabIndex={-1}>{status}</p></div></fieldset>
    <div className="wizard-navigation">{step > 1 && <button type="button" className="wizard-back" disabled={pending} onClick={()=>setStep(value=>value-1)}>← Back</button>}{step < 3 && <button type="button" className="button dark" onClick={()=>setStep(value=>value+1)}>Continue <span>→</span></button>}<span>Step {step} / 3</span></div></form>}<aside className="planner-summary"><p className="eyebrow">YOUR PROJECT, TAKING SHAPE</p><h3>{serviceName}</h3><p className="summary-goal">{goal || suggestions[service]}</p><dl><dt>Starting point</dt><dd>{ready}</dd><dt>Budget preference</dt><dd>{budget}</dd><dt>Timing</dt><dd>{time}</dd></dl><div className="next-conversation"><h4>What happens next?</h4><ol><li>We clarify the goal and who it’s for.</li><li>We suggest a manageable first version.</li><li>You receive an agreed scope, costs and next steps before committing.</li></ol></div><a href="mailto:faheem@devma.it">faheem@devma.it →</a><a href="tel:+393488454242">Prefer a call? +39 348 845 4242</a></aside></div>
  </div></section>;
}
