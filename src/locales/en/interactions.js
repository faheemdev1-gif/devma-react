import { getCurrentEstimate, websiteBrief } from '../../pricing.js';
import { sendEnquiry, createRequestId } from '../../enquiryClient.js';
export function initialiseSite() {
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
$('#year').textContent=new Date().getFullYear();$('#menu').onclick=()=>{const open=$('nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',open)};$$('nav a').forEach(a=>a.onclick=()=>{$('nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')});
let overviewSelection=0;
$('#service-guide-link').onclick=()=>window.dispatchEvent(new CustomEvent('devma:explore-service',{detail:['website','app','chatbot','automation','blockchain'][overviewSelection]}));
const services=[
 ['A better first impression. A clearer next step.','From a polished business website to an online shop, we help visitors understand your value and know exactly how to get in touch or buy.',['Business websites','Online shops','Booking journeys'],'→','YOUR BUSINESS. OPEN TO POSSIBILITY.'],
 ['An easier day, in the palm of their hand.','Give customers or your team one simple place to book, manage tasks or access a service. We design around the people who will actually use it.',['Customer portals','Web apps','Mobile apps'],'⌘','LESS FRICTION. MORE POSSIBILITY.'],
 ['Useful answers, without the endless searching.','An AI assistant can answer common questions or help your team find information in your own documents. RAG systems ground answers in your knowledge, with sources and human checks.',['AI chatbots','RAG systems','Knowledge assistants'],'✦','YOUR KNOWLEDGE. EASIER TO FIND.'],
 ['Fewer manual steps. More time for your business.','AI automation can help sort enquiries, draft responses and move information between your tools, with human approval where it matters. Business automation handles repeatable steps, while IoT automation connects physical devices, sensors and alerts.',['AI automation','Workflow automation','IoT automation'],'⇄','THE RIGHT THINGS, WORKING TOGETHER.'],
 ['A shared record people can verify.','For the right use case, blockchain can help track ownership, verify certificates or record transactions across organisations. We first check whether it adds real value to your project.',['Verifiable records','Digital ownership','Smart contracts'],'◇','TRUST, BUILT INTO THE PROCESS.']
];
$$('.service').forEach(b=>b.onclick=()=>{$$('.service').forEach(x=>x.classList.remove('active'));b.classList.add('active');overviewSelection=+b.dataset.service;const d=services[overviewSelection];$('#service-title').textContent=d[0];$('#service-copy').textContent=d[1];$('#service-tags').replaceChildren(...d[2].map(t=>{const s=document.createElement('span');s.textContent=t;return s}));$('#demo-icon').textContent=d[3];$('#demo-label').textContent=d[4]});
const estimate=()=>getCurrentEstimate();
function brief(){return websiteBrief(getCurrentEstimate(),'en');}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const formText={"send": "Send my enquiry", "sending": "Sending…", "sent": "Request sent ✓", "success": "Request sent. Thank you! We’ll reply to the email address you provided.", "download": "Your brief has been downloaded. Nothing has been sent."};
let formPending=false, formDelivered=false, formRequestId=null;
const dialogTitle=$('#brief-dialog h2').innerHTML;
const sendButton=$('#brief-form button[value="send"]');
function openBrief(include){
  $('#brief-form').elements.include.checked=include;
  if (!formPending) { $('#brief-form').hidden=false; $('#brief-dialog .dialog-intro').hidden=false; $('#brief-dialog h2').innerHTML=dialogTitle; $('#form-status').classList.remove('modal-receipt'); $('#form-status').textContent=''; formDelivered=false; formRequestId=null; sendButton.disabled=false; sendButton.textContent=formText.send; }
  $('#brief-dialog').showModal();
}
$('#brief-button').onclick=()=>openBrief(true);$('#contact-button').onclick=()=>openBrief(false);
$('#portfolio-request-button').onclick=()=>{openBrief(false);$('#brief-form').elements.idea.value='I’d like to see portfolio examples relevant to my business. My business is…';};
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
    const receipt=await sendEnquiry({locale:'en',kind:estimateData?'website':'contact',name:f.get('name'),email:f.get('email'),message:f.get('idea'),service:estimateData?'website':'unsure',estimate:estimateData,website:f.get('website')||'',requestId:formRequestId});
    formDelivered=true;sendButton.textContent=formText.sent;$('#brief-form').hidden=true;$('#brief-dialog .dialog-intro').hidden=true;$('#brief-dialog h2').textContent='Thank you. We’re listening.';$('#form-status').classList.add('modal-receipt');$('#form-status').textContent=`✓ Request received\n\nYour reference: ${receipt.reference}\n\nFaheem will review your enquiry and reply to ${f.get('email')}.\n\n${receipt.confirmationSent?'We’ve also sent a confirmation email. Please check your spam folder if you don’t see it.':'Your enquiry was received, but the confirmation email may not arrive. We can still reply to you.'}\n\nNext: we clarify your goal and agree a practical way forward.`;
  }catch(error){sendButton.disabled=false;sendButton.textContent=formText.send;$('#form-status').textContent=error.message;}
  finally{formPending=false;$('#brief-form').setAttribute('aria-busy','false');}
};
$$('dialog .close,dialog .close-secondary').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));$('#privacy-button').onclick=()=>{$('#modal-category').textContent='PRIVACY';$('#modal-title').textContent='Your information, kept simple.';$('#modal-description').textContent='When you submit a form, your name, email and project details are processed by the website hosting provider and Resend to deliver your enquiry to Devma. We use them to respond to your request. Downloading a brief does not send it. No analytics or advertising scripts have been added.';$('#modal-extra').innerHTML='<p>Fonts are requested from Google Fonts. Hosting providers may process technical request information to serve the website. Contact: <a href="mailto:faheem@devma.it">faheem@devma.it</a>, +39 348 845 4242. The final privacy notice must identify the business controller and explain email processing and retention before public launch.</p>';$('#project-dialog').showModal()};
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
