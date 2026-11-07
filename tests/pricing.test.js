import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateEstimate,websiteBrief,setCurrentEstimate,getCurrentEstimate} from '../src/pricing.js';
import {validateEnquiry} from '../server/enquiry.js';
test('all website combinations match the server-calculated price',()=>{
 for(let packageId=0;packageId<3;packageId++)for(let pages=packageId===0?1:5;pages<=15;pages++)for(let mask=0;mask<8;mask++){
  const addons=['copywriting','language','booking'].filter((_,i)=>mask&(1<<i));const estimate={packageId,pages,addons};
  const checked=validateEnquiry({locale:'en',kind:'website',name:'Test',email:'test@example.com',message:'Website',requestId:'test-request-123456',estimate});
  assert.equal(calculateEstimate(estimate).total,checked.estimate.total);
 }
});
test('current selections and downloadable briefs retain the selected language and details',()=>{
 const value={packageId:1,pages:6,addons:['copywriting']};setCurrentEstimate(value);value.addons.push('booking');assert.equal(getCurrentEstimate().total,1260);
 const en=websiteBrief(getCurrentEstimate(),'en'),it=websiteBrief(getCurrentEstimate(),'it');assert.match(en,/Business/);assert.match(en,/1,260/);assert.match(it,/Professionale/);assert.match(it,/1.260/);assert.match(it,/Supporto ai testi/);
});
