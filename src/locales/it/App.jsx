import {useEffect,lazy,Suspense} from 'react';
import HomePage from '../../HomePage.jsx';
import ServicePage from '../../ServicePage.jsx';
import PrivacyPage from '../../PrivacyPage.jsx';
import ProjectPlanner from './ProjectPlanner.jsx';
import {PackageScope} from './ProjectExpectations.jsx';
import {initialiseSite} from './interactions.js';
const Guide=lazy(()=>import('./ProjectGuide.jsx'));
export default function App(){
 const path=typeof window==='undefined'?'/it/':window.location.pathname;
 const services=path.startsWith('/it/servizi');
 const privacy=path.startsWith('/it/privacy');
 useEffect(()=>{
   if(services||privacy)return;
   const cleanup=initialiseSite();
   if(window.location.hash){const target=document.getElementById(window.location.hash.slice(1));target?.scrollIntoView({behavior:'auto',block:'start'});}
   return cleanup;
 },[services,privacy]);
 if(privacy)return <PrivacyPage language="it"/>;
 if(services)return <Suspense fallback={<div className="loading-mark">devma</div>}><ServicePage language="it" Guide={Guide}/></Suspense>;
 return <HomePage language="it" Planner={ProjectPlanner} PackageScope={PackageScope}/>;
}
