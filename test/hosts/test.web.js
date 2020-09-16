var HybrixTest=function(e){var t={};function n(s){if(t[s])return t[s].exports;var r=t[s]={i:s,l:!1,exports:{}};return e[s].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(s,r,function(t){return e[t]}.bind(null,r));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){n(1);const s=n(4);t.cli=e=>{const t=[],n=[];let r="\n";for(let o in e.assets)r+=o.toUpperCase()+" ",r+=s.renderSymbol(s.renderCellCLI,o,e.assets[o],t,n).join(""),r+="\n";r+="\n",r+="Issues:\n",n.sort();for(let e=0;e<n.length;++e)r+=" - "+n[e]+"\n";return r+="\n",r+="      SUCCESS RATE: "+Math.floor(100*((e.total-e.failures)/e.total||0))+"%\n",r},t.web=e=>{const t=[],n=[];let r='\n        <style>:target {\n          background-color: yellow;\n        }\n        .hostTests th {\n          text-align: left;\n        }\n        .hostTests td {\n          width: 20px;\n        }\n        .hostTests td:first-child {\n          padding-right: 10px;\n        }\n        .hostTests td:hover {\n          cursor: pointer;\n        }\n        .hostTests td:hover > .hostName {\n          display: block;\n        }\n        .hostTests .hostName {\n          position: absolute;\n          background: yellow;\n          display: none;\n          margin-top: -35px;\n          margin-left: 15px;\n          padding: 2px;\n          border: 1px solid black;\n        }\n        .hostTests .hostIssueTitle {\n          float: left;\n          width: 70px;\n        }\n        </style>\n        <span style="margin-right: 40px;"><b>Symbol</b></span><span><b>Hosts</b></span>\n        <table class="hostTests">\n        ';for(let o in e.assets)r+="<tr>",r+="<td>"+o+"</td>",r+=s.renderSymbol(s.renderCellWeb,o,e.assets[o],t,n).join(""),r+="</tr>";r+="</table>",r+="<h3>New Issues</h3>",r+="<ul>",n.sort();for(let e=0;e<n.length;++e)r+="<li>"+n[e]+"</li>";r+="</ul>",r+='<h3><a href="https://gitlab.com/groups/hybrix/-/issues?milestone_title=Coin+support+%3A+Test+Issues" target="_blank">Known Issues</a></h3>',r+="<ul>",t.sort();for(let e=0;e<t.length;++e)r+="<li>"+t[e]+"</li>";return r+="</ul>",r+="<h1>"+(e.total-e.failures)/e.total*100+"%</h1>",r}},function(e,t,n){const s=n(0),r=n(0),o=n(3).DEFAULT_TEST_SYMBOLS;function l(e){return{data:[{query:"/asset/"+e+"/test-hosts"},"rout"],step:"sequential"}}const i=e=>t=>{const n={};let s=0,r=0;for(let o in t){n[o]={};const l=t[o];if(e.includes(o)&&"object"==typeof l&&null!==l)for(let e in l){const t=l[e],i="Success"===t;i||++r,n[o][e]={valid:i,result:t,messages:["TODO"]},++s}else n[o].unknown={valid:!1,result:null,messages:["Asset not available"]},++s,++r}const o={assets:{},total:s,failures:r};return Object.keys(n).sort().forEach(e=>{o.assets[e]=n[e]}),o};t.runTests=function(e,t,n,s,r){e=e&&"*"!==e?e.split(","):o;const a={};for(let t of e)a[t]=l(t);t.sequential([{host:n},"addHost",a,"parallel",i(e)],s,e=>{console.error(e)},r)},t.web=s.web,t.cli=s.cli,t.xml=r.xml,t.renderSymbol=s.renderSymbol},function(e,t,n){const s=n(0),r=n(1),o=n(6);window.go=o.go(r,s)},function(e,t){t.DEFAULT_TEST_SYMBOLS=["bch","dummy","eth","flo","ark","btc","burst","dash","dgb","etc","hy","lsk","ltc","nxt","omni","rise","shift","ubq","waves","xcp","xem","xrp","zec","mock.btc","eth.xhy","waves.xhy","nxt.xhy","omni.xhy","xcp.xhy","xem.xhy"]},function(e,t,n){const s=n(5),r=(e,t,n,s,r,o)=>{const l=[];for(let i in n){const a=n[i],u=e(t,i,a.valid,a.known,a.result,s,r,o);l.push(u)}return l};function o(e){return void 0===e?"undefined":JSON.stringify(e)}const l=(e,t,n,s,r,l,i,a)=>{const u=o(r).replace(/"/g,"");return`\n<testcase id="${e+"_"+t+" host"}" name="${e+"_"+t}" time="0.001">${n?"":`<failure message="${u}" type="ERROR"></failure>`}</testcase>`},i=(e,t,n,r,o,l,i,a)=>{const u=o?` target="_blank" href="${o}"`:"",c=o?"":` <a style="color:red;"target="_blank" href="${s.link(e,t,n,r)}"><b>Create issue</b></a>`;return`\n    ${a?`<span class="hostIssueTitle">${e.toUpperCase()}</span>`:""}\n    <b style="color:red;">\n      ${a?"- Host ping failed":l}\n    </b> :\n    <a name="${i+u}">\n      ${r}\n    </a>\n    ${c}\n  `},a=(e,t,n,s,r)=>`<td style="text-align:center;background-color:${e}" title="${t}"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#${n}">&nbsp;</a>${r?'<span class="hostName">'+s+"</span>":""}</td>`;t.xml=(e,t)=>{const n=[],s=[];let o="";for(let i in e.assets)o+=r(l,i,e.assets[i],n,s,t).join("");return o='<?xml version="1.0" encoding="UTF-8" ?><testsuites id="hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001"><testsuite id="testsuite.hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001">'+o,o+="</testsuite></testsuites>",o},t.json=e=>o(e),t.renderCellWeb=(e,t,n,s,r,l,u,c)=>{const d=o(r).replace(/"/g,""),p="string"==typeof n?"Success"===n:n,h=c?Object.keys(r)[0]:t,f=e+" "+h,m=e+"_"+h,b=s||{},g=c?h:b.message||void 0;if(s){const t=p?"purple":"orange";return l.push(i(e,h,b,g,b.link,f,m,c)),a(t,d,m,f,c)}return p?`<td style="text-align:center;background-color:green" title="${d}">&nbsp;</td>`:(u.push(i(e,h,b,d,b.link,f,m,c)),a("red",d,m,f,c))},t.stringify=o,t.renderSymbol=r,t.renderCellCLI=(e,t,n,s,r,l,i)=>{const a=o(r).replace(/"/g,"");return s?n?(s.link?l.push("[36m"+e+" "+t+"[0m : "+s.message):l.push("[36m"+e+" "+t+"[0m : "+s.message+" [31m [Create issue][0m"),"[36m OK [0m"):(s.link?l.push("[33m"+e+" "+t+"[0m : "+s.message+" (Returned "+a+")"):l.push("[33m"+e+" "+t+"[0m : "+s.message+" [31m [Create issue][0m"),"[33mWARN[0m"):n?"[32m OK [0m":(i.push("[31m"+e+" "+t+"[0m : returned "+a+" [31m [Create issue][0m"),"[31mFAIL[0m")}},function(e,t){e.exports={link:function(e,t,n,s){const r=n&&n.message?n.message:"returned "+s;return`https://gitlab.com/hybrix/hybrixd/node/issues/new?issue[description]=${encodeURIComponent('/label ~"\\* Development Team \\*"\n/milestone %"DEV - asset maintenance - 2020-Q1"\n'+r)}&issue[title]=${encodeURIComponent(e+" "+t+" "+r)}`}}},function(e,t){let n="http://localhost:1111/";function s(e,t){t||(t=window.location.href),e=e.replace(/[[\]]/g,"\\$&");const n=new RegExp("[?&]"+e.toLowerCase()+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}t.go=function(e,t){return function(){const r=s("symbol"),o=new Hybrix.Interface({XMLHttpRequest:XMLHttpRequest});DEBUG="true"===s("debug"),s("host")&&(n=s("host"));e.runTests(r,o,n,e=>{document.body.innerHTML=t.web(e)},e=>{document.body.innerHTML='<div style="border-style:solid; border-width:1px; border-radius:10px; height:20px;"><div style="text-align:center;color:white;background-color:blue; border-radius:10px; height:20px; width:'+100*e+'%">'+Math.floor(100*e)+"%</div></div>"})}}}]);