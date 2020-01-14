module.exports=function(e){var t={};function s(n){if(t[n])return t[n].exports;var a=t[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,s),a.l=!0,a.exports}return s.m=e,s.c=t,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)s.d(n,a,function(t){return e[t]}.bind(null,a));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=1)}([function(e,t){function s(e){return"string"==typeof e&&e.startsWith("valid")}function n(e,t,s){if(t.hasOwnProperty("factor")){const s=t.factor;return"string"==typeof e&&-1!==e.toString().indexOf(".")&&e.split(".")[1].length===Number(s)}return!1}function a(e){return void 0!==e&&null!==e}t.test=function(e){return"object"==typeof e&&null!==e},t.sample=function(e){return"object"==typeof e&&null!==e&&e.hasOwnProperty("address")&&e.hasOwnProperty("transaction")},t.details=function(e){return"object"==typeof e&&null!==e&&e.hasOwnProperty("symbol")&&e.hasOwnProperty("name")&&e.hasOwnProperty("fee")&&typeof e.hasOwnProperty("fee")&&e.hasOwnProperty("factor")&&e.hasOwnProperty("contract")&&e.hasOwnProperty("mode")&&e.hasOwnProperty("keygen-base")},t.sampleValid=s,t.sampleBalance=n,t.sampleUnspent=a,t.sampleHistory=function(e){return"object"==typeof e&&null!==e},t.sampleTransaction=function(e){return"object"==typeof e&&null!==e&&e.hasOwnProperty("id")&&e.hasOwnProperty("timestamp")&&e.hasOwnProperty("amount")&&e.hasOwnProperty("symbol")&&e.hasOwnProperty("fee")&&e.hasOwnProperty("source")&&e.hasOwnProperty("target")&&e.hasOwnProperty("confirmed")},t.seedValid=s,t.seedBalance=n,t.seedUnspent=a,t.seedSign=function(e){return"string"==typeof e},t.seedSignHash=function(e,t,s){if(s.hasOwnProperty("hash")){const t=s.hash;return e===t||"dynamic"===t&&"00000000"!==e}return!1}},function(e,t,s){const n=s(2),a=s(3).knownIssues,i=s(0),r=1e-5,o=["bch","dummy","eth","flo","ark","btc","burst","dash","dgb","etc","exp","lsk","ltc","nxt","omni","rise","shift","ubq","waves","xcp","xem","xrp","zec","mock.btc","eth.xhy","waves.xhy","nxt.xhy","omni.xhy","xcp.xhy","xem.xhy"],l=e=>({test:{data:e.test,step:"id"},sample:{data:e.sample,step:"id"},details:{data:e.details,step:"id"},sampleValid:{data:e.sampleValid,step:"id"},sampleBalance:{data:e.sampleBalance,step:"id"},sampleUnspent:{data:e.sampleUnspent,step:"id"},sampleHistory:{data:e.sampleHistory,step:"id"},sampleTransaction:{data:e.sampleTransaction,step:"id"},seedValid:{data:e.seedValid,step:"id"},seedBalance:{data:e.seedBalance,step:"id"},seedUnspent:{data:e.seedUnspent,step:"id"},seedSign:{data:e.seedSign,step:"id"},seedSignHash:{data:{data:e.seedSign},step:"hash"}}),d=Object.keys(l({}));function p(e){return{data:[{symbol:e},"addAsset",{sample:{data:{query:"/asset/"+e+"/sample"},step:"rout"},test:{data:{query:"/asset/"+e+"/test"},step:"rout"},details:{data:{query:"/asset/"+e+"/details"},step:"rout"},address:{data:{symbol:e},step:"getAddress"},publicKey:{data:{symbol:e},step:"getPublicKey"}},"parallel",t=>(void 0===t.sample&&(t.sample={}),void 0===t.details&&(t.details={}),void 0===t.test&&(t.test={}),{sample:{data:t.sample,step:"id"},test:{data:t.test,step:"id"},details:{data:t.details,step:"id"},address:{data:t.address,step:"id"},sampleValid:{data:{query:"/asset/"+e+"/validate/"+t.sample.address},step:"rout"},sampleBalance:{data:{query:"/asset/"+e+"/balance/"+t.sample.address},step:"rout"},sampleUnspent:{data:{query:"/asset/"+e+"/unspent/"+t.sample.address+"/"+(Number(r)+Number(t.details.fee))+"/"+t.address+"/"+t.sample.publicKey},step:"rout"},sampleHistory:{data:{query:"/asset/"+e+"/history/"+t.sample.address},step:"rout"},sampleTransaction:{data:{query:"/asset/"+e+"/transaction/"+t.sample.transaction},step:"rout"},seedValid:{data:{query:"/asset/"+e+"/validate/"+t.address},step:"rout"},seedBalance:{data:{query:"/asset/"+e+"/balance/"+t.address},step:"rout"},seedUnspent:{data:{query:"/asset/"+e+"/unspent/"+t.address+"/"+(Number(r)+Number(t.details.fee))+"/"+t.sample.address+"/"+t.publicKey},step:"rout"}}),"parallel",t=>({test:{data:t.test,step:"id"},sample:{data:t.sample,step:"id"},details:{data:t.details,step:"id"},sampleValid:{data:t.sampleValid+" "+t.sample.address,step:"id"},sampleBalance:{data:t.sampleBalance,step:"id"},sampleUnspent:{data:t.sampleUnspent,step:"id"},sampleHistory:{data:t.sampleHistory,step:"id"},sampleTransaction:{data:t.sampleTransaction,step:"id"},seedValid:{data:t.seedValid+" "+t.address,step:"id"},seedBalance:{data:t.seedBalance,step:"id"},seedUnspent:{data:t.seedUnspent,step:"id"},seedSign:{data:{symbol:e,amount:r,target:t.sample.address,validate:!1,unspent:t.test.hasOwnProperty("unspent")?t.test.unspent:t.seedUnspent,time:t.test.time},step:"rawTransaction"}}),"parallel",l,"parallel"],step:"sequential"}}const u=e=>t=>{const s={};let n=0,r=0;for(let o in t)if(s[o]={},e.includes(o)){const e=t[o].details,l=t[o].test;for(let d in t[o]){const p=t[o][d];if(i.hasOwnProperty(d)){const n=i[d](t[o][d],e,l);let u;n||(++r,u=a[o+"_"+d]),s[o][d]={valid:n,known:u,result:p,messages:["TODO"]}}else{const e=a[o+"_"+d];s[o][d]={valid:!1,known:e,result:p,messages:["No validation available"]},++r}++n}}else for(let e of d){const t=a[o+"_"+e];s[o][e]={valid:!1,known:t,result:null,messages:["Asset not available"]},++n,++r}const o={assets:{},total:n,failures:r};return Object.keys(s).sort().forEach(e=>{o.assets[e]=s[e]}),o};t.runTests=function(e,t,s,n,a){const i={};e=e&&"*"!==e?e.split(","):o;for(let t of e)i[t]=p(t);t.sequential(["init",{username:"POMEW4B5XACN3ZCX",password:"TVZS7LODA5CSGP6U"},"session",{host:s},"addHost",i,"parallel",u(e)],n,e=>{console.error(e)},a)},t.xml=n.xml,t.json=n.json,t.cli=n.cli},function(e,t,s){s(0);const n=(e,t,s,n,a)=>{const i=[];for(let r in s){const o=s[r],l=o.valid,d=o.known,p=o.result,u=(s.messages,e(t,r,l,d,p,n,a));i.push(u)}return i},a=(e,t,s,n,a,i,r)=>{if(n)return s?(n.link?i.push("[36m"+e+" "+t+"[0m : "+n.message):i.push("[36m"+e+" "+t+"[0m : "+n.message+" [31m [Create issue][0m"),"[36m OK [0m"):(n.link?i.push("[33m"+e+" "+t+"[0m : "+n.message):i.push("[33m"+e+" "+t+"[0m : "+n.message+" [31m [Create issue][0m"),"[33mWARN[0m");if(s)return"[32m OK [0m";{let s;return s=(s="object"==typeof data?JSON.stringify(a):String(a)).replace(/"/g,""),r.push("[31m"+e+" "+t+"[0m : returned "+s+" [31m [Create issue][0m"),"[31mFAIL[0m"}};function i(e,t,s){return`https://gitlab.com/hybrix/hybrixd/node/issues/new?issue[description]=${encodeURIComponent('/label ~"\\* Development Team \\*"\n/milestone %"Coin support : Test Issues"\n')}&issue[title]=${encodeURIComponent(e+" "+t+" "+(s?s.message:""))} `}const r=(e,t,s,n,a,r,o)=>{let l;return l=(l="object"==typeof a?JSON.stringify(a):String(a)).replace(/"/g,""),n?s?(n.link?r.push('<b style="color:purple;">'+e+" "+t+'</b> : <a  name="'+e+"_"+t+'" target="_blank" href="'+n.link+'">'+n.message+"</a>"):r.push('<b style="color:purple;">'+e+" "+t+'</b> : <a name="'+e+"_"+t+'">'+n.message+' </a><a style="color:red;"target="_blank" href="'+i(e,t,n)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:purple" title="'+l+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>'):(n.link?r.push('<b style="color:orange;">'+e+" "+t+'</b> : <a  name="'+e+"_"+t+'" target="_blank" href="'+n.link+'">'+n.message+"</a>"):r.push('<b style="color:orange;">'+e+" "+t+'</b> : <a name="'+e+"_"+t+'">'+n.message+' </a><a style="color:red;"target="_blank" href="'+i(e,t,n)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:orange" title="'+l+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>'):s?'<td style="text-align:center;background-color:green" title="'+l+'">&nbsp;</td>':(o.push('<b style="color:red;">'+e+" "+t+"</b> : returned "+l+' <a  name="'+e+"_"+t+'" style="color:red;"target="_blank" href="'+i(e,t)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:red"  title="'+l+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>')},o=(e,t,s,n,a,i,r)=>{let o;o=(o="object"==typeof a?JSON.stringify(a):String(a)).replace(/"/g,'\\"');let l=`<testcase id="${e+"_"+t}" name="${e+" "+t}" time="0.001">`;return s||(l+=`<failure message="${o}" type="ERROR"></failure>`),l+="</testcase>"};t.xml=(e=>{const t=[],s=[];let a="";for(let i in e.assets)a=n(o,i,e.assets[i],t,s).join("");return a='<?xml version="1.0" encoding="UTF-8" ?><testsuites id="hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001"><testsuite id="testsuite.hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001">'+a,a+="</testsuite></testsuites>"}),t.json=(e=>JSON.stringify(e)),t.cli=(e=>{const t=[],s=[];let i="\n";i+="   #   SAMPLE                                    GENERATED                    \n",i+="      ┌────┬──────┬─────┬────┬──────┬──────┬────┬────┬────┬──────┬──────┬────┬────┐\n",i+="      │Test│Detail│Sampl│Vald│Balnce│Unspnt│Hist│Tran│Vald│Balnce│Unspnt│Sign│Hash│\n";for(let r in e.assets){i+="      ├────┼──────┼─────┼────┼──────┼──────┼────┼────┼────┼──────┼──────┼────┼────┤\n",i+=r.substr(0,5)+"     ".substr(0,5-r.length)+" │";const o=n(a,r,e.assets[r],t,s);i+=o[0]+"│",i+=" "+o[1]+" │",i+=o[2]+" │",i+=o[3]+"│",i+=" "+o[4]+" │",i+=" "+o[5]+" │",i+=o[6]+"│",i+=o[7]+"│",i+=o[8]+"│",i+=" "+o[9]+" │",i+=" "+o[10]+" │",i+=o[11]+"│",i+=o[12]+"│",i+="\n"}i+="      └────┴──────┴─────┴────┴──────┴──────┴────┴────┴────┴──────┴──────┴────┴────┘\n",i+="\n",i+="New Issues:\n",s.sort();for(let e=0;e<s.length;++e)i+=" - "+s[e]+"\n";i+="\n",i+="Known Issues:\n",t.sort();for(let e=0;e<t.length;++e)i+=" - "+t[e]+"\n";return i+="\n",i+="      SUCCESS RATE: "+Math.floor(100*((e.total-e.failures)/e.total||0))+"%\n"}),t.web=(e=>{const t=[],s=[];let a='\n<style>\n:target {\n background-color: yellow;\n}\n</style>\n<table><tr><td>Symbol</td><td colspan="2"></td><td colspan="7" style="text-align:center;">Sample</td><td colspan="5"  style="text-align:center;">Generated</td></tr>';a+="<tr><td></td><td>Test</td><td>Details</td><td>Sample</td><td>Valid</td><td>Balance</td><td>Unspent</td>",a+="<td>History</td>",a+="<td>Transaction</td>",a+="<td>Valid</td><td>Balance</td><td>Unspent</td>",a+="<td>Sign</td><td>Hash</td></tr>";for(let i in e.assets)a+="<tr>",a+="<td>"+i+"</td>",a+=n(r,i,e.assets[i],t,s).join(""),a+="</tr>";a+="</table>",a+="<h3>New Issues</h3>",a+="<ul>",s.sort();for(let e=0;e<s.length;++e)a+="<li>"+s[e]+"</li>";a+="</ul>",a+='<h3><a href="https://gitlab.com/groups/hybrix/-/issues?milestone_title=Coin+support+%3A+Test+Issues" target="_blank">Known Issues</a></h3>',a+="<ul>",t.sort();for(let e=0;e<t.length;++e)a+="<li>"+t[e]+"</li>";a+="</ul>",a+="<h1>"+(e.total-e.failures)/e.total*100+"%</h1>",console.log(e),document.body.innerHTML=a})},function(e,t){t.knownIssues={bch_seedSign:{message:"Not yet functioning. Perhaps funds missing for test",link:""},bch_seedSignHash:{message:"Not yet functioning. Perhaps funds missing for test",link:""},btc_seedSignHash:{message:"Signing still holds a dynamic componement",link:""},burst_seedUnspent:{message:"Not yet functioning. Perhaps funds missing for test",link:""},burst_seedSign:{message:"Not yet functioning. Perhaps funds missing for test",link:""},burst_seedSignHash:{message:"Not yet functioning. Perhaps funds missing for test / Signing still holds a dynamic componement",link:""},dash_seedSign:{message:"Unstable host. Should work",link:""},dash_seedSignHash:{message:"Unstable host. Should work",link:""},dash_sampleHistory:{message:"Unstable host. Should work",link:""},dgb_sampleHistory:{message:"Not yet functioning",link:""},dgb_seedSign:{message:"Not yet functioning. Perhaps funds missing for test",link:""},dgb_seedSignHash:{message:"Not yet functioning. Perhaps funds missing for test",link:""},etc_sampleHistory:{message:"Not yet functioning",link:"https://gitlab.com/hybrix/hybrixd/node/issues/699"},"eth.xhy_sampleHistory":{message:"Eth token history not yet supported",link:"https://gitlab.com/hybrix/hybrixd/node/issues/701"},exp_sampleHistory:{message:"Not yet functioning",link:""},flo_seedSign:{message:"Not yet functioning. Perhaps funds missing for test",link:""},flo_seedSignHash:{message:"Not yet functioning. Perhaps funds missing for test",link:""},nxt_seedSignHash:{message:"Signing still holds a dynamic componement",link:""},"nxt.xhy_seedSignHash":{message:"Signing still holds a dynamic componement",link:""},omni_seedSignHash:{message:"Not yet functioning. Perhaps funds missing for test",link:""},"omni.xhy_seedSignHash":{message:"Not yet functioning. Perhaps funds missing for test",link:""},ubq_sampleHistory:{message:"Not yet functioning",link:"https://gitlab.com/hybrix/hybrixd/node/issues/697"},rise_sampleTransaction:{message:"Not yet functioning",link:"https://gitlab.com/hybrix/hybrixd/node/issues/885"},shift_sampleTransaction:{message:"Not yet functioning",link:"https://gitlab.com/hybrix/hybrixd/node/issues/885"},xcp_seedSignHash:{message:"Signing still holds a dynamic componement",link:""},"xcp.xhy_seedSignHash":{message:"Signing still holds a dynamic componement",link:""},xcp_sampleTransaction:{message:"Missing data for source,dest,amount, fee",link:"https://gitlab.com/hybrix/hybrixd/node/issues/705"},"xcp.xhy_sampleTransaction":{message:"Missing data for source,dest,amount, fee",link:"https://gitlab.com/hybrix/hybrixd/node/issues/705"},xrp_seedSignHash:{message:"Signing still holds a dynamic componement",link:""},zec_seedSign:{message:"Not yet functioning. Perhaps funds missing for test",link:""},zec_seedSignHash:{message:"Not yet functioning. Perhaps funds missing for test",link:""},zec_sampleHistory:{message:"Unstable",link:"https://gitlab.com/hybrix/hybrixd/node/issues/702"}}}]);