import { useEffect, useState } from 'react';
import { projectServices } from './projectContent.js';

export default function ProjectGuide({homePath}) {
  const [selected, setSelected] = useState(()=>{const requested=typeof window==='undefined'?'website':new URLSearchParams(window.location.search).get('service');return projectServices.some(item=>item.id===requested)?requested:'website';});
  useEffect(() => {
    const choose = event => { if (projectServices.some(item => item.id === event.detail)) setSelected(event.detail); };
    window.addEventListener('devma:explore-service', choose);
    return () => window.removeEventListener('devma:explore-service', choose);
  }, []);
  const service = projectServices.find(item => item.id === selected);
  function handleKey(event, index) {
    const keys = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 };
    let next;
    if (event.key in keys) next = (index + keys[event.key] + projectServices.length) % projectServices.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = projectServices.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(projectServices[next].id);
    document.getElementById(`guide-tab-${projectServices[next].id}`)?.focus();
  }
  return (
    <section className="project-guide section wrap" id="project-guide" aria-labelledby="guide-heading">
      <div className="section-head split">
        <div><p className="eyebrow">A CLOSER LOOK / WHAT YOUR PROJECT COULD INCLUDE</p><h2 id="guide-heading">Less guesswork.<br />A clearer picture.</h2></div>
        <p>Explore what we can build, what you’ll receive and the few things we need to get started. No technical brief required.</p>
      </div>
      <div className="guide-layout">
        <div className="guide-tabs" role="tablist" aria-label="Explore project types">
          {projectServices.map((item, index) => (
            <button key={item.id} id={`guide-tab-${item.id}`} role="tab" aria-selected={selected === item.id} aria-controls="guide-panel" tabIndex={selected === item.id ? 0 : -1} onClick={() => setSelected(item.id)} onKeyDown={event => handleKey(event, index)}>
              <span>{item.icon}</span>{item.name}<b aria-hidden="true">→</b>
            </button>
          ))}
          <p className="guide-help">Not sure which one fits?<br /><a href={homePath+'#project-planner'}>Describe the problem instead →</a></p>
        </div>
        <article className="guide-panel" id="guide-panel" role="tabpanel" aria-labelledby={`guide-tab-${service.id}`} tabIndex={0}>
          <p className="eyebrow">{service.name}</p><h3>{service.outcome}</h3><p className="guide-intro">{service.intro}</p>
          <div className="guide-example"><span>PICTURE THIS</span><p>{service.example}</p><small>Illustrative example · your scope is agreed individually</small></div>
          <div className="guide-columns"><div><h4>What your project can include</h4><ul>{service.deliverables.map(text => <li key={text}>{text}</li>)}</ul></div><div><h4>What we need from you</h4><ul>{service.inputs.map(text => <li key={text}>{text}</li>)}</ul><p className="guide-reassurance">Missing something? Share what you have. We’ll identify the gaps together.</p></div></div>
          <details className="guide-details"><summary>Decisions we’ll help you make <span>+</span></summary><p>{service.decisions}</p></details>
          <div className="guide-cost"><h4>How we scope the cost</h4><p>{service.next}</p></div>
          <div className="guide-first"><div><span>A SENSIBLE FIRST STEP</span><p>{service.first}</p></div><a className="button dark" href={`${homePath}?service=${service.id}#project-planner`} onClick={() => window.dispatchEvent(new CustomEvent('devma:choose-service', { detail: service.id }))}>Plan this project <span>→</span></a></div>
        </article>
      </div>
    </section>
  );
}
