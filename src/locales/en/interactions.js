import { getCurrentEstimate, websiteBrief } from '../../pricing.js';
import { sendEnquiry, createRequestId } from '../../enquiryClient.js';
export function initialiseSite() {
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const estimate=()=>getCurrentEstimate();
function brief(){return websiteBrief(getCurrentEstimate(),'en');}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const formText={"send": "Send my enquiry", "sending": "Sending…", "sent": "Request sent ✓", "success": "Request sent. Thank you! We’ll reply to the email address you provided.", "download": "Your brief has been downloaded. Nothing has been sent."};
let formPending=false, formDelivered=false, formRequestId=null;
const dialogTitle=$('#brief-dialog h2').innerHTML;
const sendButton=$('#brief-form button[value="send"]');
function openBrief(include){
  $('#brief-form').elements.include.checked=include;
  if (!formPending) { sendButton.before($('#form-status')); $('#form-status').setAttribute('role','status'); $('#brief-form').hidden=false; $('#brief-dialog .dialog-intro').hidden=false; $('#brief-dialog h2').innerHTML=dialogTitle; $('#form-status').classList.remove('modal-receipt','is-error'); $('#form-status').textContent=''; formDelivered=false; formRequestId=null; sendButton.disabled=false; sendButton.textContent=formText.send; }
  $('#brief-dialog').showModal();
}
$('#brief-button').onclick=()=>openBrief(true);$('#contact-button').onclick=()=>openBrief(false);
$('#portfolio-request-button').onclick=()=>{openBrief(false);$('#brief-form').elements.idea.value='I’d like to request portfolio examples relevant to my industry and project. Please contact me to discuss them.';};
$('#brief-form').addEventListener('input',()=>{if(formDelivered){formDelivered=false;formRequestId=null;sendButton.disabled=false;sendButton.textContent=formText.send;$('#form-status').textContent='';}});
$('#brief-form').onsubmit=async e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  if(e.submitter?.value==='download'){download(`Devma\n\n${f.get('name')}\n${f.get('email')}\n\n${f.get('idea')}\n\n${f.get('include')?brief():''}`,'devma-project-brief.txt');$('#form-status').textContent=formText.download;return;}
  if(formPending||formDelivered)return;
  formPending=true;sendButton.disabled=true;sendButton.textContent=formText.sending;$('#form-status').textContent='';$('#form-status').classList.remove('is-error');$('#brief-form').setAttribute('aria-busy','true');
  try{
    formRequestId ||= createRequestId('en');
    const current=estimate();
    const estimateData=f.get('include')?{packageId:current.packageId,pages:current.pages,addons:current.addons}:null;
    const receipt=await sendEnquiry({locale:'en',kind:estimateData?'website':'contact',name:f.get('name'),email:f.get('email'),message:f.get('idea'),service:estimateData?'website':'unsure',estimate:estimateData,website:f.get('website')||'',requestId:formRequestId});
    formDelivered=true;sendButton.textContent=formText.sent;$('#brief-form').after($('#form-status'));$('#brief-form').hidden=true;$('#brief-dialog').scrollTop=0;$('#brief-dialog .dialog-intro').hidden=true;$('#brief-dialog h2').textContent='Thank you. We’re listening.';$('#form-status').classList.add('modal-receipt');$('#form-status').textContent=`✓ Request received\n\nYour reference: ${receipt.reference}\n\nFaheem will review your enquiry and reply to ${f.get('email')}.\n\n${receipt.confirmationSent?'We’ve also sent a confirmation email. Please check your spam folder if you don’t see it.':'Your enquiry was received, but the confirmation email may not arrive. We can still reply to you.'}\n\nNext: we clarify your goal and agree a practical way forward.`;
  }catch(error){sendButton.disabled=false;sendButton.textContent=formText.send;const notice=$('#form-status');notice.classList.add('is-error');notice.setAttribute('role','alert');notice.textContent=error.message;notice.focus({preventScroll:true});notice.scrollIntoView({block:'nearest',behavior:'auto'});}
  finally{formPending=false;$('#brief-form').setAttribute('aria-busy','false');}
};
$$('dialog .close,dialog .close-secondary').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));// Pause decorative CSS motion outside the viewport and in background tabs.
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
