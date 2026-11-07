export const packages = [
  { id:0, price:490, pages:1 }, { id:1, price:990, pages:5 }, { id:2, price:1790, pages:5 },
];
export const addonPrices = { copywriting:180, language:220, booking:150 };
let currentEstimate = { packageId:0, pages:1, addons:[] };
export function calculateEstimate(value) {
  const plan=packages[value.packageId];
  const extraPages=Math.max(0,value.pages-plan.pages);
  return {...value,addons:[...value.addons],base:plan.price,includedPages:plan.pages,extraPages,extraCost:extraPages*90,total:plan.price+extraPages*90+value.addons.reduce((sum,key)=>sum+addonPrices[key],0)};
}
export function setCurrentEstimate(value) { currentEstimate={...value,addons:[...value.addons]}; }
export function getCurrentEstimate() { return calculateEstimate(currentEstimate); }
export function money(value,locale) { return new Intl.NumberFormat(locale==='it'?'it-IT':'en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0,useGrouping:'always'}).format(value); }
export function websiteBrief(value,locale) {
  const e=calculateEstimate(value),it=locale==='it';
  const names=it?['Essenziale','Professionale','Negozio']:['Launch','Business','Shop'];
  const labels=it?{copywriting:'Supporto ai testi',language:'Seconda lingua',booking:'Prenotazioni'}:{copywriting:'Writing support',language:'Second language',booking:'Booking integration'};
  return [`DEVMA — ${it?'RIEPILOGO DEL SITO WEB':'WEBSITE PROJECT BRIEF'}`,'',`${it?'Pacchetto':'Package'}: ${names[e.packageId]}`,`${it?'Pagine':'Pages'}: ${e.pages}`,`${it?'Opzioni':'Additions'}: ${e.addons.map(key=>labels[key]).join(', ')||(it?'Nessuna':'None')}`,`${it?'Totale indicativo':'Indicative total'}: ${money(e.total,locale)}`,'',it?'Stima non vincolante. Attività, trattamento fiscale e tempi da concordare. Dominio, hosting, abbonamenti e assistenza continuativa sono separati.':'Non-binding estimate. Scope, tax treatment and timing must be agreed. Domain, hosting, subscriptions and ongoing support are separate.'].join('\n');
}
