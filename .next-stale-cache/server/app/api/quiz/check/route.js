"use strict";(()=>{var e={};e.id=961,e.ids=[961],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2048:e=>{e.exports=require("fs")},2615:e=>{e.exports=require("http")},8791:e=>{e.exports=require("https")},5315:e=>{e.exports=require("path")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},2623:e=>{e.exports=require("worker_threads")},1568:e=>{e.exports=require("zlib")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},5307:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>k,requestAsyncStorage:()=>q,routeModule:()=>l,serverHooks:()=>h,staticGenerationAsyncStorage:()=>x});var o={};t.r(o),t.d(o,{OPTIONS:()=>c,POST:()=>d,runtime:()=>p});var i=t(9303),s=t(8716),u=t(670),a=t(4526),n=t(5242);let p="nodejs";function c(){return(0,a.YM)()}async function d(e){try{let r=await e.json(),t=`Ти викладач курсу Full Stack Development. Перевір відповідь студента українською.

Модуль: ${r.moduleTitle}
Питання: ${r.question}
Ключові слова правильної відповіді: ${(r.expectedKeywords||[]).join(", ")}
Підказка що була доступна: ${r.hint||""}
Відповідь студента: ${r.userAnswer}

Поверни тільки JSON:
{
  "score": 1-5,
  "isCorrect": true/false,
  "feedback": "2-3 речення",
  "fullAnswer": "Повна правильна відповідь, 3-5 речень"
}`;return(0,a.AV)(200,await (0,n.oq)(t,1e3))}catch(e){return(0,a.VR)(e)}}let l=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/quiz/check/route",pathname:"/api/quiz/check",filename:"route",bundlePath:"app/api/quiz/check/route"},resolvedPagePath:"/Users/svatoslavarosenko/learning-web-app/app/api/quiz/check/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:q,staticGenerationAsyncStorage:x,serverHooks:h}=l,m="/api/quiz/check/route";function k(){return(0,u.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:x})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[276,972,214,325],()=>t(5307));module.exports=o})();