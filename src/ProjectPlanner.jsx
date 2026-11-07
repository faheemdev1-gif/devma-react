import { useEffect, useState } from 'react';
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
  const serviceName = projectServices.find(item => item.id === service)?.name || 'Help choosing the right service';
  useEffect(() => {
    const choose = event => { if (projectServices.some(item => item.id === event.detail)) setService(event.detail); };
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
  function submit(event) {
    event.preventDefault();
    window.location.href = `mailto:faheem@devma.it?subject=${encodeURIComponent(`Project enquiry: ${serviceName}`)}&body=${encodeURIComponent(text())}`;
    setStatus('Your email app should open a draft. Review it and press Send. If it does not open, download the brief and email faheem@devma.it.');
  }
  return <section className="planner-section" id="project-planner"><div className="wrap section">
    <div className="section-head split"><div><p className="eyebrow">YOUR IDEA / A SIMPLE WAY IN</p><h2>Start with what you want<br />to make better.</h2></div><p>For a website, app or something more ambitious. A few plain-language answers give us a useful place to start.</p></div>
    <div className="planner-layout"><form className="planner-form" onSubmit={submit}>
      <div className="planner-step"><span>01</span><div><h3>What are you thinking about?</h3><label htmlFor="planner-service">Choose a project type</label><select id="planner-service" value={service} onChange={e => setService(e.target.value)}><option value="unsure">I’m not sure yet</option>{projectServices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label htmlFor="planner-goal">What would you like to improve?</label><textarea id="planner-goal" maxLength={1200} rows={3} value={goal} onChange={e => setGoal(e.target.value)} placeholder={suggestions[service]} /><button type="button" className="example-fill" onClick={() => setGoal(suggestions[service])}>Use this example as a starting point →</button></div></div>
      <div className="planner-step"><span>02</span><div><h3>Where are you starting from?</h3><div className="planner-fields"><label>What do you have?<select value={ready} onChange={e => setReady(e.target.value)}><option>An early idea</option><option>An existing website or system</option><option>Content, designs or documents</option><option>A clear brief and requirements</option></select></label><label>Budget preference<select value={budget} onChange={e => setBudget(e.target.value)}><option>Help me work this out</option><option>Under €1,000</option><option>€1,000–€3,000</option><option>€3,000–€7,000</option><option>€7,000+</option></select></label></div><label>Timing<select value={time} onChange={e => setTime(e.target.value)}><option>Flexible — quality comes first</option><option>I have a target date to discuss</option><option>I would like to start soon</option><option>I’m just exploring options</option></select></label><p className="hint">Your preferences help shape the conversation. They don’t reserve a price or delivery date.</p></div></div>
      <div className="planner-step"><span>03</span><div><h3>Let’s make the introduction.</h3><div className="planner-fields"><label>Your name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" maxLength={100} /></label><label>Your email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" maxLength={160} /></label></div><div className="planner-actions"><button className="button dark" type="submit">Open my enquiry email <span>→</span></button><button type="button" className="text-link" onClick={download}>Save my brief ↓</button></div><p className="hint">Opens an email draft to faheem@devma.it. You review and send it yourself. These answers are not stored by this website.</p><p role="status" className="planner-status">{status}</p></div></div>
    </form><aside className="planner-summary"><p className="eyebrow">YOUR PROJECT, TAKING SHAPE</p><h3>{serviceName}</h3><p className="summary-goal">{goal || suggestions[service]}</p><dl><dt>Starting point</dt><dd>{ready}</dd><dt>Budget preference</dt><dd>{budget}</dd><dt>Timing</dt><dd>{time}</dd></dl><div className="next-conversation"><h4>What happens next?</h4><ol><li>We clarify the goal and who it’s for.</li><li>We suggest a manageable first version.</li><li>You receive an agreed scope, costs and next steps before committing.</li></ol></div><a href="mailto:faheem@devma.it">faheem@devma.it →</a><a href="tel:+393488454242">Prefer a call? +39 348 845 4242</a></aside></div>
  </div></section>;
}
