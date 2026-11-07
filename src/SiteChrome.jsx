import {useState} from 'react';
import LanguageSwitch from './LanguageSwitch.jsx';
import {homeCopy} from './homeCopy.js';
export function pathsFor(language){const it=language==='it';return{home:`/${language}/`,services:it?'/it/servizi/':'/en/services/',privacy:it?'/it/privacy/':'/en/privacy/'};}
export function SiteHeader({language,home=false}){
 const c=homeCopy[language],paths=pathsFor(language),[open,setOpen]=useState(false),sections=['services','work','builder','process'];
 const href=id=>(home?'':paths.home)+'#'+id;
 return <header><a className="brand" href={paths.home} aria-label={language==='it'?'Devma, pagina iniziale':'Devma home'}>devma<span className="brand-dot">✳︎</span></a><nav aria-label={language==='it'?'Navigazione principale':'Main navigation'} className={open?'open':''}>{sections.map((id,i)=><a key={id} href={href(id)} onClick={()=>setOpen(false)}>{c.nav[i]}</a>)}</nav><a className="nav-cta" href={href('project-planner')}>{c.talk}<span>→</span></a><LanguageSwitch language={language}/><button id="menu" type="button" aria-label={language==='it'?'Apri il menu':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(value=>!value)}>☰</button></header>;
}
export function SiteFooter({language}){const c=homeCopy[language],paths=pathsFor(language);return <footer className="wrap commercial-footer"><a className="brand" href={paths.home}>devma<span className="brand-dot">✳︎</span></a><div><span>{c.footer}</span><a href="mailto:faheem@devma.it">faheem@devma.it</a></div><p>© <span id="year">{new Date().getFullYear()}</span> Devma</p><a className="privacy-link" href={paths.privacy}>{c.privacy}</a><a href="#" aria-label={language==='it'?'Torna all’inizio':'Back to top'}>↑</a></footer>;}
