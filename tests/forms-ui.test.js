import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { unlinkSync } from 'node:fs';
import { webcrypto } from 'node:crypto';

const dom=new JSDOM('<!doctype html><html lang="en"><body><div id="root"></div></body></html>',{url:'https://devma.it/en/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','CustomEvent','FormData'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
dom.window.HTMLElement.prototype.scrollIntoView=function(){this.dataset.scrolledIntoView='true';};
const {createElement,act}=await import('react');const {createRoot}=await import('react-dom/client');
const apps={};
for(const lang of ['en','it']){
 await build({entryPoints:[`src/locales/${lang}/App.jsx`],bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external',outfile:`.qa-ui-${lang}.mjs`});
 apps[lang]=(await import(`../.qa-ui-${lang}.mjs`)).default;
}
let root;
async function mount(lang){document.documentElement.lang=lang;root=createRoot(document.getElementById('root'));await act(async()=>root.render(createElement(apps[lang])));}
async function unmount(){await act(async()=>root.unmount());}
async function click(element){await act(async()=>{element.click();await new Promise(resolve=>setTimeout(resolve,0));});}
function fillModal(){const form=document.getElementById('brief-form');form.elements.name.value='Test Visitor';form.elements.email.value='test@example.com';return form;}
function response(status,data){return{ok:status>=200&&status<300,status,json:async()=>data};}
function nativeInput(input,value){Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}
after(()=>{for(const lang of ['en','it'])try{unlinkSync(`.qa-ui-${lang}.mjs`);}catch{}dom.window.close();});

for(const lang of ['en','it']){
 test(`${lang}: real modal clicks show pending state, send one request and show the receipt`,async()=>{
  await mount(lang);try{
   await click(document.getElementById('portfolio-request-button'));const form=fillModal();assert.equal(form.elements.include.checked,false);
   let release,count=0,payload;globalThis.fetch=async(_url,options)=>{count++;payload=JSON.parse(options.body);return new Promise(resolve=>release=resolve);};
   const send=form.querySelector('button[value="send"]');
   await act(async()=>{send.click();await new Promise(resolve=>setTimeout(resolve,0));});
   assert.equal(send.disabled,true);assert.match(send.textContent,lang==='it'?/Invio/:/Sending/);send.click();assert.equal(count,1);assert.equal(payload.estimate,null);
   await act(async()=>{release(response(200,{ok:true,id:'test-email',reference:'DVM-UI',confirmationSent:true}));await new Promise(resolve=>setTimeout(resolve,0));});
   assert.equal(form.hidden,true);const status=document.getElementById('form-status');assert.match(status.textContent,/DVM-UI/);assert.equal(form.contains(status),false);assert.equal(document.getElementById('brief-dialog').scrollTop,0);
  }finally{await unmount();}
 });
 test(`${lang}: missing configuration is visible above Send, keeps the inputs and permits retry`,async()=>{
  await mount(lang);try{
   await click(document.getElementById('portfolio-request-button'));const form=fillModal();const send=form.querySelector('button[value="send"]');let first=true;
   globalThis.fetch=async()=>first?response(503,{ok:false,code:'not_configured'}):response(200,{ok:true,id:'retry',reference:'DVM-RETRY',confirmationSent:false});
   await click(send);const notice=document.getElementById('form-status');assert.match(notice.textContent,/FORM_CONFIG/);assert.equal(notice.getAttribute('role'),'alert');assert.equal(document.activeElement,notice);assert.equal(notice.dataset.scrolledIntoView,'true');assert.ok(notice.compareDocumentPosition(send)&dom.window.Node.DOCUMENT_POSITION_FOLLOWING);assert.equal(form.elements.email.value,'test@example.com');assert.equal(send.disabled,false);assert.equal(form.hidden,false);
   first=false;await click(send);assert.equal(form.hidden,true);assert.match(notice.textContent,/DVM-RETRY/);
  }finally{await unmount();}
 });
 test(`${lang}: calculator selection reaches the submitted estimate and fallback request IDs work`,async()=>{
  await mount(lang);const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');try{
   const planButtons=[...document.querySelectorAll('.package')];await click(planButtons[1]);await click(document.querySelector('.number-stepper button:last-child'));await click(document.querySelector('.addons input'));
   await click(document.getElementById('brief-button'));const form=fillModal();form.elements.idea.value='A business website';assert.equal(form.elements.include.checked,true);
   Object.defineProperty(globalThis,'crypto',{configurable:true,value:{getRandomValues:array=>webcrypto.getRandomValues(array)}});
   let payload;globalThis.fetch=async(_url,options)=>{payload=JSON.parse(options.body);return response(200,{ok:true,id:'estimate',reference:'DVM-ESTIMATE',confirmationSent:true});};
   await click(form.querySelector('button[value="send"]'));assert.deepEqual(payload.estimate,{packageId:1,pages:6,addons:['copywriting']});assert.match(payload.requestId,/^[a-f0-9]{32}$/);assert.equal(form.hidden,true);
  }finally{Object.defineProperty(globalThis,'crypto',descriptor);await unmount();}
 });
 test(`${lang}: guided form moves through stages and submits its controlled contact values`,async()=>{
  await mount(lang);try{
   const active=()=>document.querySelector('.planner-step:not([hidden])');assert.equal(active().querySelector('span').textContent,'01');
   await click(document.querySelector('.wizard-navigation .button'));assert.equal(active().querySelector('span').textContent,'02');await click(document.querySelector('.wizard-navigation .button'));assert.equal(active().querySelector('span').textContent,'03');
   const fields=active().querySelectorAll('.planner-fields input');await act(async()=>{nativeInput(fields[0],'Guided Visitor');nativeInput(fields[1],'guided@example.com');});
   let payload;globalThis.fetch=async(_url,options)=>{payload=JSON.parse(options.body);return response(200,{ok:true,id:'guided',reference:'DVM-GUIDED',confirmationSent:true});};
   await click(active().querySelector('button[type="submit"]'));assert.equal(payload.name,'Guided Visitor');assert.equal(payload.email,'guided@example.com');assert.equal(payload.kind,'planner');assert.match(document.querySelector('.enquiry-receipt').textContent,/DVM-GUIDED/);
  }finally{await unmount();}
 });
}
test('a network error and missing endpoint never silently leave the modal pending',async()=>{
 await mount('en');try{
  await click(document.getElementById('portfolio-request-button'));const form=fillModal();const send=form.querySelector('button[value="send"]');globalThis.fetch=async()=>{throw Error('offline');};await click(send);assert.match(document.getElementById('form-status').textContent,/FORM_NETWORK/);assert.equal(send.disabled,false);
  globalThis.fetch=async()=>({ok:false,status:404,json:async()=>{throw Error('HTML page');}});await click(send);assert.match(document.getElementById('form-status').textContent,/FORM_ENDPOINT/);assert.equal(send.disabled,false);
 }finally{await unmount();}
});

for(const lang of ['en','it']){
 test(`${lang}: commercial homepage has two paths and a clear section order`,async()=>{
  dom.reconfigure({url:`https://devma.it/${lang}/`});await mount(lang);try{
   assert.equal(document.querySelectorAll('.service-path').length,2);assert.equal(document.getElementById('project-guide'),null);
   const expected=['services','work','builder','process','project-planner','contact'];let previous=null;
   for(const id of expected){const node=document.getElementById(id);assert.ok(node,`Missing ${id}`);if(previous)assert.ok(previous.compareDocumentPosition(node)&dom.window.Node.DOCUMENT_POSITION_FOLLOWING);previous=node;}
   assert.equal(document.querySelector('.advanced-services a').getAttribute('href'),lang==='it'?'/it/servizi/':'/en/services/');
   assert.equal(document.querySelector('.privacy-link').getAttribute('href'),`/${lang}/privacy/`);
   await click(document.querySelector('.commercial-hero .text-link'));assert.equal(document.getElementById('planner-service').value,'automation');
   await click(document.getElementById('menu'));assert.equal(document.getElementById('menu').getAttribute('aria-expanded'),'true');await click(document.querySelector('nav a'));assert.equal(document.getElementById('menu').getAttribute('aria-expanded'),'false');
  }finally{await unmount();}
 });
 test(`${lang}: dedicated service guide keeps all seven services and links to a preselected enquiry`,async()=>{
  const route=lang==='it'?'servizi':'services';dom.reconfigure({url:`https://devma.it/${lang}/${route}/?service=rag`});await mount(lang);try{
   assert.equal(document.querySelectorAll('[role="tab"]').length,7);assert.equal(document.getElementById('guide-tab-rag').getAttribute('aria-selected'),'true');
   await click(document.getElementById('guide-tab-iot'));assert.equal(document.querySelector('.guide-first a').getAttribute('href'),`/${lang}/?service=iot#project-planner`);
   assert.equal(document.querySelector('.language-switch a[lang="it"]').getAttribute('href'),'/it/servizi/?service=rag');
   assert.equal(document.querySelector('.language-switch a[lang="en"]').getAttribute('href'),'/en/services/?service=rag');
  }finally{await unmount();}
  dom.reconfigure({url:`https://devma.it/${lang}/?service=iot#project-planner`});await mount(lang);try{assert.equal(document.getElementById('planner-service').value,'iot');}finally{await unmount();}
 });
 test(`${lang}: privacy is a real page with factual contact information and no public editing note`,async()=>{
  dom.reconfigure({url:`https://devma.it/${lang}/privacy/`});await mount(lang);try{
   const main=document.querySelector('main');assert.ok(main.textContent.includes('Faheem Mehmood'));assert.ok(main.textContent.includes('Resend'));assert.ok(main.textContent.includes('Vercel'));assert.ok(!main.textContent.includes('final privacy notice must'));assert.ok(!main.textContent.includes('Prima della pubblicazione definitiva'));assert.equal(document.querySelector('.language-switch a[lang="en"]').getAttribute('href'),'/en/privacy/');assert.equal(document.getElementById('brief-form'),null);
  }finally{await unmount();dom.reconfigure({url:'https://devma.it/en/'});}
 });
}
