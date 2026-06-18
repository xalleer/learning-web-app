"use strict";(()=>{var e={};e.id=688,e.ids=[688],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2048:e=>{e.exports=require("fs")},2615:e=>{e.exports=require("http")},8791:e=>{e.exports=require("https")},5315:e=>{e.exports=require("path")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},2623:e=>{e.exports=require("worker_threads")},1568:e=>{e.exports=require("zlib")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},2950:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>q,patchFetch:()=>g,requestAsyncStorage:()=>x,routeModule:()=>l,serverHooks:()=>m,staticGenerationAsyncStorage:()=>v});var i={};t.r(i),t.d(i,{OPTIONS:()=>c,POST:()=>d,runtime:()=>n});var o=t(9303),a=t(8716),s=t(670),p=t(4526),u=t(5242);let n="nodejs";function c(){return(0,p.YM)()}async function d(e){try{let r=await e.json(),t=`Ти senior Full Stack developer. Зроби детальний code review українською.

Модуль: ${r.moduleTitle}
Завдання: ${r.practiceTitle}
Опис: ${r.description}
Критерії:
${(r.criteria||[]).map((e,r)=>`${r+1}. ${e}`).join("\n")}

Код (${r.language}):
\`\`\`${r.language}
${r.code}
\`\`\`

Поверни тільки JSON:
{
  "score": 1-10,
  "criteriaResults": { "критерій": true/false },
  "feedback": "Детальний фідбек по кожному критерію",
  "goodParts": "Що зроблено добре",
  "improvements": "Конкретні покращення з прикладами коду"
}`;return(0,p.AV)(200,await (0,u.oq)(t,1600))}catch(e){return(0,p.VR)(e)}}let l=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/practice/review/route",pathname:"/api/practice/review",filename:"route",bundlePath:"app/api/practice/review/route"},resolvedPagePath:"/Users/svatoslavarosenko/learning-web-app/app/api/practice/review/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:x,staticGenerationAsyncStorage:v,serverHooks:m}=l,q="/api/practice/review/route";function g(){return(0,s.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:v})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),i=r.X(0,[276,972,214,325],()=>t(2950));module.exports=i})();