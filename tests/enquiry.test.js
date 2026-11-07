import test from 'node:test';
import assert from 'node:assert/strict';
import { processEnquiry } from '../server/enquiry.js';
import { confirmationEmail, notificationHtml } from '../server/emailTemplates.js';
const env = { RESEND_API_KEY:'test-secret-never-expose', RESEND_FROM:'Devma <website@notify.devma.it>', CONTACT_TO:'faheem@devma.it' };
const headers = { origin:'https://devma.it', 'content-type':'application/json', 'sec-fetch-site':'same-origin' };
const body = {name:'Test Customer',email:'customer@example.com',message:'I need a website for my business.',locale:'en',kind:'website',service:'website',website:'',requestId:'test-request-123456789',estimate:{packageId:1,pages:6,addons:['copywriting'],total:1}};
const accepted=()=>({ok:true,status:200,json:async()=>({id:'email-test-id'})});
function call(overrides={},options={}) { return processEnquiry({method:'POST',headers,body,...overrides},{env,fetchImpl:async()=>accepted(),...options}); }
test('sends notification first and bilingual-ready confirmation second, with correct reply addresses',async()=>{
 const requests=[];
 const result=await call({body:{...body,to:'attacker@example.com'}},{fetchImpl:async(url,options)=>{requests.push({url,options,payload:JSON.parse(options.body)});return accepted();}});
 assert.equal(result.status,200);assert.equal(requests.length,2);
 const [admin,receipt]=requests;
 assert.deepEqual(admin.payload.to,['faheem@devma.it']);assert.equal(admin.payload.reply_to,'customer@example.com');assert.match(admin.payload.text,/1,260/);
 assert.deepEqual(receipt.payload.to,['customer@example.com']);assert.equal(receipt.payload.reply_to,'faheem@devma.it');assert.match(receipt.payload.text,/thank you for getting in touch/i);assert.match(receipt.payload.text,/Faheem will reply/);assert.ok(!receipt.payload.text.includes(body.message));
 assert.match(result.body.reference,/^DVM-[A-F0-9]{10}$/);assert.ok(receipt.payload.text.includes(result.body.reference));assert.equal(result.body.confirmationSent,true);
 assert.ok(admin.payload.html.includes('devma'));assert.ok(receipt.payload.html.includes('lang="en"'));assert.ok(!JSON.stringify(result).includes(env.RESEND_API_KEY));
});
test('Italian acknowledgement and project details are localised',async()=>{
 const requests=[];
 const result=await call({body:{...body,locale:'it',kind:'planner',service:'rag',estimate:null,context:{ready:'Documenti disponibili',budget:'Da definire',timing:'Flessibili'}}},{fetchImpl:async(_url,options)=>{requests.push(JSON.parse(options.body));return accepted();}});
 assert.equal(result.status,200);assert.match(requests[0].text,/NUOVA RICHIESTA/);assert.match(requests[0].text,/Sistema RAG/);assert.match(requests[0].text,/Documenti disponibili/);assert.match(requests[1].subject,/Abbiamo ricevuto/);assert.match(requests[1].text,/grazie per aver contattato Devma/);assert.match(requests[1].text,/Faheem ti risponderà/);assert.match(requests[1].html,/lang="it"/);
});
test('separate stable idempotency keys protect both emails on retries',async()=>{
 const keys=[];const fetchImpl=async(_url,o)=>{keys.push(o.headers['Idempotency-Key']);return accepted();};
 await call({}, {fetchImpl});await call({}, {fetchImpl});assert.equal(keys.length,4);assert.equal(keys[0],keys[2]);assert.equal(keys[1],keys[3]);assert.notEqual(keys[0],keys[1]);assert.equal(keys[1],keys[0]+'-confirmation');
});
test('acknowledgement failure never loses or misreports the accepted business enquiry',async()=>{
 for(const failure of ['network','rejected','invalid']){
  let count=0;
  const result=await call({}, {fetchImpl:async()=>{count++;if(count===1)return accepted();if(failure==='network')throw Error('network');return{ok:failure==='invalid',status:failure==='invalid'?200:429,json:async()=>({})};}});
  assert.equal(count,2);assert.equal(result.status,200);assert.equal(result.body.ok,true);assert.equal(result.body.confirmationSent,false);assert.match(result.body.reference,/^DVM-/);
 }
});
test('invalid fields, honeypot, header injection and tampered estimates send neither email',async()=>{
 for(const candidate of [{...body,email:'invalid'},{...body,name:'Name\r\nBcc: attacker@example.com'},{...body,message:''},{...body,website:'spam'},{...body,estimate:{packageId:1,pages:1,addons:[]}},{...body,estimate:{packageId:0,pages:2,addons:['free']}}]){
  let sent=false;const result=await call({body:candidate},{fetchImpl:async()=>{sent=true;throw Error('must not send');}});assert.equal(result.status,400);assert.equal(sent,false);
 }
});
test('HTML templates escape visitor content and never echo a submitted message in the acknowledgement',()=>{
 const data={...body,name:'<img src=x onerror=alert(1)>',message:'<script>alert(1)</script>',context:{}};
 const receipt=confirmationEmail(data,'DVM-TEST');const admin=notificationHtml({subject:'<script>',text:data.message},data,'DVM-TEST');
 assert.ok(!receipt.html.includes('<img src=x'));assert.ok(!receipt.text.includes(data.message));assert.ok(admin.includes('&lt;script&gt;'));assert.ok(!admin.includes('<script>'));
});
test('cross-origin, wrong method and oversized input are rejected',async()=>{
 assert.equal((await call({headers:{...headers,origin:'https://other.example'}})).status,403);
 assert.equal((await call({headers:{...headers,origin:undefined}})).status,403);
 assert.equal((await call({method:'GET'})).status,405);
 assert.equal((await call({headers:{...headers,'content-length':'20000'}})).status,413);
 assert.equal((await call({body:'{not json'})).status,400);
});
test('failed notification never sends customer confirmation or exposes provider errors',async()=>{
 assert.equal((await call({}, {env:{}})).body.code,'not_configured');
 for(const failure of ['rejection','malformed','network']){
  let count=0;const result=await call({}, {fetchImpl:async()=>{count++;if(failure==='network')throw Error('network');return{ok:failure==='malformed',status:failure==='malformed'?200:422,json:async()=>({message:'private error'})};}});
  assert.equal(count,1);assert.equal(result.status,502);assert.equal(result.body.ok,false);assert.ok(!JSON.stringify(result).includes('private error'));
 }
 assert.equal((await call({}, {fetchImpl:async()=>({ok:false,status:429,json:async()=>({})})})).status,429);
});
