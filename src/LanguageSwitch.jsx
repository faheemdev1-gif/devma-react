export default function LanguageSwitch({language}){
 const location=typeof window==='undefined'?null:window.location;
 const current=location?.pathname||`/${language}/`;
 const page=current.includes('/privacy')?'privacy':current.includes('/services')||current.includes('/servizi')?'services':'home';
 const suffix=locale=>page==='privacy'?'privacy/':page==='services'?(locale==='it'?'servizi/':'services/') : '';
 const ending=(location?.search||'')+(location?.hash||'');
 return <div className="language-switch" role="group" aria-label={language==='it'?'Lingua del sito':'Website language'}><a href={'/it/'+suffix('it')+ending} lang="it" hrefLang="it" aria-label="Leggi in italiano" aria-current={language==='it'?'page':undefined}>IT</a><a href={'/en/'+suffix('en')+ending} lang="en" hrefLang="en" aria-label="Read in English" aria-current={language==='en'?'page':undefined}>EN</a></div>;
}
