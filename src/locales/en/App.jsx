import {useEffect,lazy,Suspense} from 'react';
import HomePage from '../../HomePage.jsx';
import ServicePage from '../../ServicePage.jsx';
import PrivacyPage from '../../PrivacyPage.jsx';
import ProjectPlanner from './ProjectPlanner.jsx';
import {PackageScope} from './ProjectExpectations.jsx';
import {initialiseSite} from './interactions.js';
const Guide=lazy(()=>import('./ProjectGuide.jsx'));
export default function App(){
 const path=typeof window==='undefined'?'/en/':window.location.pathname;
 const services=path.startsWith('/en/services');
 const privacy=path.startsWith('/en/privacy');
 useEffect(()=>{
   if(services||privacy)return;
   const cleanup=initialiseSite();
   if(window.location.hash){const target=document.getElementById(window.location.hash.slice(1));target?.scrollIntoView({behavior:'auto',block:'start'});}
   return cleanup;
 },[services,privacy]);
 if(privacy)return <PrivacyPage language="en"/>;
 if(services)return <Suspense fallback={<div className="loading-mark">devma</div>}><ServicePage language="en" Guide={Guide}/></Suspense>;
 return <HomePage language="en" Planner={ProjectPlanner} PackageScope={PackageScope}/>;
}
