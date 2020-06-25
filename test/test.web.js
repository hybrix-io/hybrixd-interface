var HybrixTest=function(e){var t={};function n(s){if(t[s])return t[s].exports;var r=t[s]={i:s,l:!1,exports:{}};return e[s].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(s,r,function(t){return e[t]}.bind(null,r));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){function s(e){return void 0===e?"undefined":JSON.stringify(e)}n(1);const r=(e,t,n,s,r)=>{const i=[];for(let o in n){const a=n[o],d=a.valid,l=a.known,u=a.result,c=(n.messages,e(t,o,d,l,u,s,r));i.push(c)}return i},i=(e,t,n,r,i,o,a)=>{const d=s(i).replace(/"/g,"");return r?n?(r.link?o.push("[36m"+e+" "+t+"[0m : "+r.message):o.push("[36m"+e+" "+t+"[0m : "+r.message+" [31m [Create issue][0m"),"[36m OK [0m"):(r.link?o.push("[33m"+e+" "+t+"[0m : "+r.message+" (Returned "+d+")"):o.push("[33m"+e+" "+t+"[0m : "+r.message+" [31m [Create issue][0m"),"[33mWARN[0m"):n?"[32m OK [0m":(a.push("[31m"+e+" "+t+"[0m : returned "+d+" [31m [Create issue][0m"),"[31mFAIL[0m")};function o(e,t,n,s){const r=n&&n.message?n.message:"returned "+s;return`https://gitlab.com/hybrix/hybrixd/node/issues/new?issue[description]=${encodeURIComponent(`/label ~"\\* Development Team \\*"\n/milestone %"DEV - asset maintenance - 2020-Q1"\n${r}`)}&issue[title]=${encodeURIComponent(e+" "+t+" "+r)}`}const a=(e,t,n,r,i,a,d)=>{const l=s(i).replace(/"/g,"");return r?n?(r.link?a.push('<b style="color:purple;">'+e+" "+t+'</b> : <a  name="'+e+"_"+t+'" target="_blank" href="'+r.link+'">'+r.message+"</a>"):a.push('<b style="color:purple;">'+e+" "+t+'</b> : <a name="'+e+"_"+t+'">'+r.message+' </a><a style="color:red;"target="_blank" href="'+o(e,t,r,r.message)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:purple" title="'+l+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>'):(r.link?a.push('<b style="color:orange;">'+e+" "+t+'</b> : <a  name="'+e+"_"+t+'" target="_blank" href="'+r.link+'">'+r.message+" (returned "+l+")</a>"):a.push('<b style="color:orange;">'+e+" "+t+'</b> : <a name="'+e+"_"+t+'">'+r.message+' </a><a style="color:red;"target="_blank" href="'+o(e,t,r,r.message)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:orange" title="'+l+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>'):n?'<td style="text-align:center;background-color:green" title="'+l+'">&nbsp;</td>':(d.push('<b style="color:red;">'+e+" "+t+"</b> : returned "+l+' <a  name="'+e+"_"+t+'" style="color:red;"target="_blank" href="'+o(e,t,void 0,l)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:red"  title="'+l+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>')},d=(e,t,n,r,i,o,a)=>{const d=s(i).replace(/"/g,"");let l=`<testcase id="${e+"_"+t}" name="${e+" "+t}" time="0.001">`;return n||(l+=`<failure message="${d}" type="ERROR"></failure>`),l+"</testcase>"};t.xml=(e=>{const t=[],n=[];let s="";for(let i in e.assets)s=r(d,i,e.assets[i],t,n).join("");return(s='<?xml version="1.0" encoding="UTF-8" ?><testsuites id="hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001"><testsuite id="testsuite.hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001">'+s)+"</testsuite></testsuites>"}),t.json=(e=>s(e)),t.cli=(e=>{const t=[],n=[];let s="\n";s+="   #   SAMPLE                                    SEED                    \n",s+="      ┌────┬─────┬──────┬────┬──────┬──────┬────┬────┬────┬──────┬──────┬────┬────┐\n",s+="      │Test│Sampl│Detail│Vald│Balnce│Unspnt│Hist│Tran│Vald│Balnce│Unspnt│Sign│Hash│\n";for(let o in e.assets){s+="      ├────┼─────┼──────┼────┼──────┼──────┼────┼────┼────┼──────┼──────┼────┼────┤\n",s+=o.substr(0,5)+"     ".substr(0,5-o.length)+" │";const a=r(i,o,e.assets[o],t,n);s+=a[0]+"│",s+=a[1]+" │",s+=" "+a[2]+" │",s+=a[3]+"│",s+=" "+a[4]+" │",s+=" "+a[5]+" │",s+=a[6]+"│",s+=a[7]+"│",s+=a[8]+"│",s+=" "+a[9]+" │",s+=" "+a[10]+" │",s+=a[11]+"│",s+=a[12]+"│",s+="\n"}s+="      └────┴─────┴──────┴────┴──────┴──────┴────┴────┴────┴──────┴──────┴────┴────┘\n",s+="\n",s+="New Issues:\n",n.sort();for(let e=0;e<n.length;++e)s+=" - "+n[e]+"\n";s+="\n",s+="Known Issues:\n",t.sort();for(let e=0;e<t.length;++e)s+=" - "+t[e]+"\n";return(s+="\n")+"      SUCCESS RATE: "+Math.floor(100*((e.total-e.failures)/e.total||0))+"%\n"}),t.web=(e=>{const t=[],n=[];let s='\n<style>\n:target {\n background-color: yellow;\n}\n</style>\n<table><tr><td>Symbol</td><td colspan="2"></td><td colspan="7" style="text-align:center;">Sample</td><td colspan="5"  style="text-align:center;">Seed</td></tr>';s+="<tr><td></td><td>Test</td><td>Sample</td><td>Details</td><td>Valid</td><td>Balance</td><td>Unspent</td>",s+="<td>History</td>",s+="<td>Transaction</td>",s+="<td>Valid</td><td>Balance</td><td>Unspent</td>",s+="<td>Sign</td><td>Hash</td></tr>";for(let i in e.assets)s+="<tr>",s+="<td>"+i+"</td>",s+=r(a,i,e.assets[i],t,n).join(""),s+="</tr>";s+="</table>",s+="<h3>New Issues</h3>",s+="<ul>",n.sort();for(let e=0;e<n.length;++e)s+="<li>"+n[e]+"</li>";s+="</ul>",s+='<h3><a href="https://gitlab.com/groups/hybrix/-/issues?milestone_title=Coin+support+%3A+Test+Issues" target="_blank">Known Issues</a></h3>',s+="<ul>",t.sort();for(let e=0;e<t.length;++e)s+="<li>"+t[e]+"</li>";return(s+="</ul>")+"<h1>"+(e.total-e.failures)/e.total*100+"%</h1>"})},function(e,t){function n(e){if("object"!=typeof e||null===e)return!1;const t=[].slice.call(arguments);return t.shift(),t.reduce((t,n)=>e.hasOwnProperty(n)&&t,!0)}function s(e){return e.fee&&("string"==typeof e.fee||"number"==typeof e.fee||"object"==typeof e.fee&&null!==e.fee)}function r(e){return"string"==typeof e&&e.startsWith("valid")}function i(e,t,n){if(t.hasOwnProperty("factor")){const n=Number(t.factor);return"string"==typeof e&&(-1!==e.toString().indexOf(".")&&e.split(".")[1].length===n||0===n&&e.length===n)}return!1}function o(e){return void 0!==e&&null!==e&&!("string"==typeof e&&e.startsWith("ERROR"))}t.test=function(e){return n(e)},t.sample=function(e){return n(e,"address","transaction")},t.details=function(e){return n(e,"symbol","name","factor","contract","mode","keygen-base")&&s(e)},t.sampleValid=r,t.sampleBalance=i,t.sampleUnspent=o,t.sampleHistory=function(e){return e instanceof Array},t.sampleTransaction=function(e){return n(e,"id","timestamp","amount","symbol","source","target","confirmed")&&s(e)},t.seedValid=r,t.seedBalance=i,t.seedUnspent=o,t.seedSign=function(e){return"string"==typeof e&&!e.startsWith("ERROR")},t.seedSignHash=function(e,t,n){if(n.hasOwnProperty("hash")){const t=n.hash;return e===t||"dynamic"===t&&"00000000"!==e}return!1}},function(e,t,n){const s=n(0),r=n(3);let i="http://localhost:1111/";function o(e,t){t||(t=window.location.href),e=e.replace(/[[\]]/g,"\\$&");const n=new RegExp("[?&]"+e.toLowerCase()+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}window.go=function(){const e=o("symbol"),t=new Hybrix.Interface({XMLHttpRequest:XMLHttpRequest});DEBUG="true"===o("debug"),o("host")&&(i=o("host")),r.runTests(e,t,i,e=>{document.body.innerHTML=s.web(e)},e=>{document.body.innerHTML='<div style="border-style:solid; border-width:1px; border-radius:10px; height:20px;"><div style="text-align:center;color:white;background-color:blue; border-radius:10px; height:20px; width:'+100*e+'%">'+Math.floor(100*e)+"%</div></div>"})}},function(e,t,n){const s=n(4),r=n(0),i=n(5).knownIssues,o=n(1),a=1e3,d=["bch","dummy","eth","flo","ark","btc","burst","dash","dgb","etc","exp","lsk","ltc","nxt","omni","rise","shift","ubq","waves","xcp","xem","xrp","zec","mock.btc","eth.xhy","waves.xhy","nxt.xhy","omni.xhy","xcp.xhy","xem.xhy"];function l(e,t){return new s(e).div(new s(10).pow(t)).toFixed()}function u(e){return e=void 0===e?{}:e,["sample","details","test"].forEach(t=>{void 0===e[t]&&(e[t]={})}),e}const c=e=>({test:{data:(e=u(e)).test,step:"id"},sample:{data:e.sample,step:"id"},details:{data:e.details,step:"id"},sampleValid:{data:e.sampleValid,step:"id"},sampleBalance:{data:e.sampleBalance,step:"id"},sampleUnspent:{data:e.sampleUnspent,step:"id"},sampleHistory:{data:e.sampleHistory,step:"id"},sampleTransaction:{data:e.sampleTransaction,step:"id"},seedValid:{data:e.seedValid,step:"id"},seedBalance:{data:e.seedBalance,step:"id"},seedUnspent:{data:e.seedUnspent,step:"id"},seedSign:{data:e.seedSign,step:"id"},seedSignHash:{data:{data:e.seedSign},step:"hash"}}),f=Object.keys(c({}));function p(e,t,n){return"string"==typeof t||"number"==typeof t?n["fee-symbol"]===n.symbol?new s(e).add(new s(t)).toFixed():e:"object"==typeof t&&null!==t?t.hasOwnProperty(n.symbol)?new s(e).add(new s(t[n.symbol])).toFixed():e:NaN}function h(e){return{data:[{symbol:e},"addAsset",{_options:{passErrors:!0},sample:{data:{query:"/asset/"+e+"/sample"},step:"rout"},test:{data:{query:"/asset/"+e+"/test"},step:"rout"},details:{data:{query:"/asset/"+e+"/details"},step:"rout"},address:{data:{symbol:e},step:"getAddress"},publicKey:{data:{symbol:e},step:"getPublicKey"}},"parallel",t=>{const n=(t=u(t)).test.amount||l(a,t.details.factor);return{_options:{passErrors:!0},sample:{data:t.sample,step:"id"},test:{data:t.test,step:"id"},details:{data:t.details,step:"id"},address:{data:t.address,step:"id"},sampleValid:{data:{query:"/asset/"+e+"/validate/"+t.sample.address},step:"rout"},sampleBalance:{data:{query:"/asset/"+e+"/balance/"+t.sample.address},step:"rout"},sampleUnspent:{data:{query:"/asset/"+e+"/unspent/"+t.sample.address+"/"+p(n,t.details.fee,t.details)+"/"+t.address+"/"+t.sample.publicKey},step:"rout"},sampleHistory:{data:{query:"/asset/"+e+"/history/"+t.sample.address},step:"rout"},sampleTransaction:{data:{query:"/asset/"+e+"/transaction/"+t.sample.transaction},step:"rout"},seedValid:{data:{query:"/asset/"+e+"/validate/"+t.address},step:"rout"},seedBalance:{data:{query:"/asset/"+e+"/balance/"+t.address},step:"rout"},seedUnspent:{data:{query:"/asset/"+e+"/unspent/"+t.address+"/"+p(n,t.details.fee,t.details)+"/"+t.sample.address+"/"+t.publicKey},step:"rout"}}},"parallel",t=>{const n=(t=u(t)).test.amount||l(a,t.details.factor);return{_options:{passErrors:!0},test:{data:t.test,step:"id"},sample:{data:t.sample,step:"id"},details:{data:t.details,step:"id"},sampleValid:{data:t.sampleValid+" "+t.sample.address,step:"id"},sampleBalance:{data:t.sampleBalance,step:"id"},sampleUnspent:{data:t.sampleUnspent,step:"id"},sampleHistory:{data:t.sampleHistory,step:"id"},sampleTransaction:{data:t.sampleTransaction,step:"id"},seedValid:{data:t.seedValid+" "+t.address,step:"id"},seedBalance:{data:t.seedBalance,step:"id"},seedUnspent:{data:t.seedUnspent,step:"id"},seedSign:{data:{symbol:e,amount:n,target:t.sample.address,validate:!1,unspent:t.test.hasOwnProperty("unspent")?t.test.unspent:t.seedUnspent,time:t.test.time},step:"rawTransaction"}}},"parallel",c,"parallel"],step:"sequential"}}t.runTests=function(e,t,n,s,r){const a={};e=e&&"*"!==e?e.split(","):d;for(let t of e)a[t]=h(t);t.sequential(["init",{username:"POMEW4B5XACN3ZCX",password:"TVZS7LODA5CSGP6U"},"session",{host:n},"addHost",a,"parallel",(e=>t=>{const n={};let s=0,r=0;for(let a in t){n[a]={};const d=t[a];if(e.includes(a)&&void 0!==d){const e=d.details||{},t=d.test||{};for(let l in d){const u=d[l];if(o.hasOwnProperty(l)){const s=o[l](u,e,t);let d;s||(d=i[a+"_"+l])||++r,n[a][l]={valid:s,known:d,result:u,messages:["TODO"]}}else{const e=i[a+"_"+l];n[a][l]={valid:!1,known:e,result:u,messages:["No validation available"]},++r}++s}}else for(let e of f){const t=i[a+"_"+e];n[a][e]={valid:!1,known:t,result:null,messages:["Asset not available"]},++s,++r}}const a={assets:{},total:s,failures:r};return Object.keys(n).sort().forEach(e=>{a.assets[e]=n[e]}),a})(e)],s,e=>{console.error(e)},r)},t.xml=r.xml,t.web=r.web,t.json=r.json,t.cli=r.cli},function(e,t,n){var s;!function(r){"use strict";function i(e,t){var n,s,r,i,o,a,d,l,u=e.constructor,c=u.precision;if(!e.s||!t.s)return t.s||(t=new u(e)),x?h(t,c):t;if(d=e.d,l=t.d,o=e.e,r=t.e,d=d.slice(),i=o-r){for(0>i?(s=d,i=-i,a=l.length):(s=l,r=o,a=d.length),i>(a=(o=Math.ceil(c/P))>a?o+1:a+1)&&(i=a,s.length=1),s.reverse();i--;)s.push(0);s.reverse()}for(0>(a=d.length)-(i=l.length)&&(i=a,s=l,l=d,d=s),n=0;i;)n=(d[--i]=d[i]+l[i]+n)/k|0,d[i]%=k;for(n&&(d.unshift(n),++r),a=d.length;0==d[--a];)d.pop();return t.d=d,t.e=r,x?h(t,c):t}function o(e,t,n){if(e!==~~e||t>e||e>n)throw Error(S+e)}function a(e){var t,n,s,r=e.length-1,i="",o=e[0];if(r>0){for(i+=o,t=1;r>t;t++)s=e[t]+"",(n=P-s.length)&&(i+=c(n)),i+=s;o=e[t],(n=P-(s=o+"").length)&&(i+=c(n))}else if(0===o)return"0";for(;o%10==0;)o/=10;return i+o}function d(e,t){var n,s,r,i,o,d=0,u=0,c=e.constructor,f=c.precision;if(l(e)>16)throw Error(E+l(e));if(!e.s)return new c(_);for(null==t?(x=!1,o=f):o=t,i=new c(.03125);e.abs().gte(.1);)e=e.times(i),u+=5;for(o+=Math.log(U(2,u))/Math.LN10*2+5|0,n=s=r=new c(_),c.precision=o;;){if(s=h(s.times(e),o),n=n.times(++d),a((i=r.plus(R(s,n,o))).d).slice(0,o)===a(r.d).slice(0,o)){for(;u--;)r=h(r.times(r),o);return c.precision=f,null==t?(x=!0,h(r,f)):r}r=i}}function l(e){for(var t=e.e*P,n=e.d[0];n>=10;n/=10)t++;return t}function u(e,t,n){if(t>e.LN10.sd())throw x=!0,n&&(e.precision=n),Error(N+"LN10 precision limit exceeded");return h(new e(e.LN10),t)}function c(e){for(var t="";e--;)t+="0";return t}function f(e,t){var n,s,r,i,o,d,c,p,m,g=1,y=e,b=y.d,w=y.constructor,v=w.precision;if(y.s<1)throw Error(N+(y.s?"NaN":"-Infinity"));if(y.eq(_))return new w(0);if(null==t?(x=!1,p=v):p=t,y.eq(10))return null==t&&(x=!0),u(w,p);if(p+=10,w.precision=p,s=(n=a(b)).charAt(0),i=l(y),!(Math.abs(i)<15e14))return c=u(w,p+2,v).times(i+""),y=f(new w(s+"."+n.slice(1)),p-10).plus(c),w.precision=v,null==t?(x=!0,h(y,v)):y;for(;7>s&&1!=s||1==s&&n.charAt(1)>3;)s=(n=a((y=y.times(e)).d)).charAt(0),g++;for(i=l(y),s>1?(y=new w("0."+n),i++):y=new w(s+"."+n.slice(1)),d=o=y=R(y.minus(_),y.plus(_),p),m=h(y.times(y),p),r=3;;){if(o=h(o.times(m),p),a((c=d.plus(R(o,new w(r),p))).d).slice(0,p)===a(d.d).slice(0,p))return d=d.times(2),0!==i&&(d=d.plus(u(w,p+2,v).times(i+""))),d=R(d,new w(g),p),w.precision=v,null==t?(x=!0,h(d,v)):d;d=c,r+=2}}function p(e,t){var n,s,r;for((n=t.indexOf("."))>-1&&(t=t.replace(".","")),(s=t.search(/e/i))>0?(0>n&&(n=s),n+=+t.slice(s+1),t=t.substring(0,s)):0>n&&(n=t.length),s=0;48===t.charCodeAt(s);)++s;for(r=t.length;48===t.charCodeAt(r-1);)--r;if(t=t.slice(s,r)){if(r-=s,n=n-s-1,e.e=H(n/P),e.d=[],s=(n+1)%P,0>n&&(s+=P),r>s){for(s&&e.d.push(+t.slice(0,s)),r-=P;r>s;)e.d.push(+t.slice(s,s+=P));t=t.slice(s),s=P-t.length}else s-=r;for(;s--;)t+="0";if(e.d.push(+t),x&&(e.e>q||e.e<-q))throw Error(E+n)}else e.s=0,e.e=0,e.d=[0];return e}function h(e,t,n){var s,r,i,o,a,d,u,c,f=e.d;for(o=1,i=f[0];i>=10;i/=10)o++;if(0>(s=t-o))s+=P,r=t,u=f[c=0];else{if((c=Math.ceil((s+1)/P))>=(i=f.length))return e;for(u=i=f[c],o=1;i>=10;i/=10)o++;r=(s%=P)-P+o}if(void 0!==n&&(a=u/(i=U(10,o-r-1))%10|0,d=0>t||void 0!==f[c+1]||u%i,d=4>n?(a||d)&&(0==n||n==(e.s<0?3:2)):a>5||5==a&&(4==n||d||6==n&&(s>0?r>0?u/U(10,o-r):0:f[c-1])%10&1||n==(e.s<0?8:7))),1>t||!f[0])return d?(i=l(e),f.length=1,t=t-i-1,f[0]=U(10,(P-t%P)%P),e.e=H(-t/P)||0):(f.length=1,f[0]=e.e=e.s=0),e;if(0==s?(f.length=c,i=1,c--):(f.length=c+1,i=U(10,P-s),f[c]=r>0?(u/U(10,o-r)%U(10,r)|0)*i:0),d)for(;;){if(0==c){(f[0]+=i)==k&&(f[0]=1,++e.e);break}if(f[c]+=i,f[c]!=k)break;f[c--]=0,i=1}for(s=f.length;0===f[--s];)f.pop();if(x&&(e.e>q||e.e<-q))throw Error(E+l(e));return e}function m(e,t){var n,s,r,i,o,a,d,l,u,c,f=e.constructor,p=f.precision;if(!e.s||!t.s)return t.s?t.s=-t.s:t=new f(e),x?h(t,p):t;if(d=e.d,c=t.d,s=t.e,l=e.e,d=d.slice(),o=l-s){for((u=0>o)?(n=d,o=-o,a=c.length):(n=c,s=l,a=d.length),o>(r=Math.max(Math.ceil(p/P),a)+2)&&(o=r,n.length=1),n.reverse(),r=o;r--;)n.push(0);n.reverse()}else{for(r=d.length,(u=(a=c.length)>r)&&(a=r),r=0;a>r;r++)if(d[r]!=c[r]){u=d[r]<c[r];break}o=0}for(u&&(n=d,d=c,c=n,t.s=-t.s),a=d.length,r=c.length-a;r>0;--r)d[a++]=0;for(r=c.length;r>o;){if(d[--r]<c[r]){for(i=r;i&&0===d[--i];)d[i]=k-1;--d[i],d[r]+=k}d[r]-=c[r]}for(;0===d[--a];)d.pop();for(;0===d[0];d.shift())--s;return d[0]?(t.d=d,t.e=s,x?h(t,p):t):new f(0)}function g(e,t,n){var s,r=l(e),i=a(e.d),o=i.length;return t?(n&&(s=n-o)>0?i=i.charAt(0)+"."+i.slice(1)+c(s):o>1&&(i=i.charAt(0)+"."+i.slice(1)),i=i+(0>r?"e":"e+")+r):0>r?(i="0."+c(-r-1)+i,n&&(s=n-o)>0&&(i+=c(s))):r>=o?(i+=c(r+1-o),n&&(s=n-r-1)>0&&(i=i+"."+c(s))):((s=r+1)<o&&(i=i.slice(0,s)+"."+i.slice(s)),n&&(s=n-o)>0&&(r+1===o&&(i+="."),i+=c(s))),e.s<0?"-"+i:i}function y(e,t){return e.length>t?(e.length=t,!0):void 0}function b(e){if(!e||"object"!=typeof e)throw Error(N+"Object expected");var t,n,s,r=["precision",1,w,"rounding",0,8,"toExpNeg",-1/0,0,"toExpPos",0,1/0];for(t=0;t<r.length;t+=3)if(void 0!==(s=e[n=r[t]])){if(!(H(s)===s&&s>=r[t+1]&&s<=r[t+2]))throw Error(S+n+": "+s);this[n]=s}if(void 0!==(s=e[n="LN10"])){if(s!=Math.LN10)throw Error(S+n+": "+s);this[n]=new this(s)}return this}var _,w=1e9,v={precision:20,rounding:4,toExpNeg:-7,toExpPos:21,LN10:"2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"},x=!0,N="[DecimalError] ",S=N+"Invalid argument: ",E=N+"Exponent out of range: ",H=Math.floor,U=Math.pow,O=/^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,k=1e7,P=7,T=9007199254740991,q=H(T/P),B={};B.absoluteValue=B.abs=function(){var e=new this.constructor(this);return e.s&&(e.s=1),e},B.comparedTo=B.cmp=function(e){var t,n,s,r,i=this;if(e=new i.constructor(e),i.s!==e.s)return i.s||-e.s;if(i.e!==e.e)return i.e>e.e^i.s<0?1:-1;for(s=i.d.length,t=0,n=(r=e.d.length)>s?s:r;n>t;++t)if(i.d[t]!==e.d[t])return i.d[t]>e.d[t]^i.s<0?1:-1;return s===r?0:s>r^i.s<0?1:-1},B.decimalPlaces=B.dp=function(){var e=this,t=e.d.length-1,n=(t-e.e)*P;if(t=e.d[t])for(;t%10==0;t/=10)n--;return 0>n?0:n},B.dividedBy=B.div=function(e){return R(this,new this.constructor(e))},B.dividedToIntegerBy=B.idiv=function(e){var t=this.constructor;return h(R(this,new t(e),0,1),t.precision)},B.equals=B.eq=function(e){return!this.cmp(e)},B.exponent=function(){return l(this)},B.greaterThan=B.gt=function(e){return this.cmp(e)>0},B.greaterThanOrEqualTo=B.gte=function(e){return this.cmp(e)>=0},B.isInteger=B.isint=function(){return this.e>this.d.length-2},B.isNegative=B.isneg=function(){return this.s<0},B.isPositive=B.ispos=function(){return this.s>0},B.isZero=function(){return 0===this.s},B.lessThan=B.lt=function(e){return this.cmp(e)<0},B.lessThanOrEqualTo=B.lte=function(e){return this.cmp(e)<1},B.logarithm=B.log=function(e){var t,n=this,s=n.constructor,r=s.precision,i=r+5;if(void 0===e)e=new s(10);else if((e=new s(e)).s<1||e.eq(_))throw Error(N+"NaN");if(n.s<1)throw Error(N+(n.s?"NaN":"-Infinity"));return n.eq(_)?new s(0):(x=!1,t=R(f(n,i),f(e,i),i),x=!0,h(t,r))},B.minus=B.sub=function(e){var t=this;return e=new t.constructor(e),t.s==e.s?m(t,e):i(t,(e.s=-e.s,e))},B.modulo=B.mod=function(e){var t,n=this,s=n.constructor,r=s.precision;if(!(e=new s(e)).s)throw Error(N+"NaN");return n.s?(x=!1,t=R(n,e,0,1).times(e),x=!0,n.minus(t)):h(new s(n),r)},B.naturalExponential=B.exp=function(){return d(this)},B.naturalLogarithm=B.ln=function(){return f(this)},B.negated=B.neg=function(){var e=new this.constructor(this);return e.s=-e.s||0,e},B.plus=B.add=function(e){var t=this;return e=new t.constructor(e),t.s==e.s?i(t,e):m(t,(e.s=-e.s,e))},B.precision=B.sd=function(e){var t,n,s,r=this;if(void 0!==e&&e!==!!e&&1!==e&&0!==e)throw Error(S+e);if(t=l(r)+1,n=(s=r.d.length-1)*P+1,s=r.d[s]){for(;s%10==0;s/=10)n--;for(s=r.d[0];s>=10;s/=10)n++}return e&&t>n?t:n},B.squareRoot=B.sqrt=function(){var e,t,n,s,r,i,o,d=this,u=d.constructor;if(d.s<1){if(!d.s)return new u(0);throw Error(N+"NaN")}for(e=l(d),x=!1,0==(r=Math.sqrt(+d))||r==1/0?(((t=a(d.d)).length+e)%2==0&&(t+="0"),r=Math.sqrt(t),e=H((e+1)/2)-(0>e||e%2),s=new u(t=r==1/0?"1e"+e:(t=r.toExponential()).slice(0,t.indexOf("e")+1)+e)):s=new u(r.toString()),r=o=(n=u.precision)+3;;)if(s=(i=s).plus(R(d,i,o+2)).times(.5),a(i.d).slice(0,o)===(t=a(s.d)).slice(0,o)){if(t=t.slice(o-3,o+1),r==o&&"4999"==t){if(h(i,n+1,0),i.times(i).eq(d)){s=i;break}}else if("9999"!=t)break;o+=4}return x=!0,h(s,n)},B.times=B.mul=function(e){var t,n,s,r,i,o,a,d,l,u=this,c=u.constructor,f=u.d,p=(e=new c(e)).d;if(!u.s||!e.s)return new c(0);for(e.s*=u.s,n=u.e+e.e,d=f.length,(l=p.length)>d&&(i=f,f=p,p=i,o=d,d=l,l=o),i=[],s=o=d+l;s--;)i.push(0);for(s=l;--s>=0;){for(t=0,r=d+s;r>s;)a=i[r]+p[s]*f[r-s-1]+t,i[r--]=a%k|0,t=a/k|0;i[r]=(i[r]+t)%k|0}for(;!i[--o];)i.pop();return t?++n:i.shift(),e.d=i,e.e=n,x?h(e,c.precision):e},B.toDecimalPlaces=B.todp=function(e,t){var n=this,s=n.constructor;return n=new s(n),void 0===e?n:(o(e,0,w),void 0===t?t=s.rounding:o(t,0,8),h(n,e+l(n)+1,t))},B.toExponential=function(e,t){var n,s=this,r=s.constructor;return void 0===e?n=g(s,!0):(o(e,0,w),void 0===t?t=r.rounding:o(t,0,8),n=g(s=h(new r(s),e+1,t),!0,e+1)),n},B.toFixed=function(e,t){var n,s,r=this,i=r.constructor;return void 0===e?g(r):(o(e,0,w),void 0===t?t=i.rounding:o(t,0,8),n=g((s=h(new i(r),e+l(r)+1,t)).abs(),!1,e+l(s)+1),r.isneg()&&!r.isZero()?"-"+n:n)},B.toInteger=B.toint=function(){var e=this,t=e.constructor;return h(new t(e),l(e)+1,t.rounding)},B.toNumber=function(){return+this},B.toPower=B.pow=function(e){var t,n,s,r,i,o,a=this,l=a.constructor,u=+(e=new l(e));if(!e.s)return new l(_);if(!(a=new l(a)).s){if(e.s<1)throw Error(N+"Infinity");return a}if(a.eq(_))return a;if(s=l.precision,e.eq(_))return h(a,s);if(o=(t=e.e)>=(n=e.d.length-1),i=a.s,o){if((n=0>u?-u:u)<=T){for(r=new l(_),t=Math.ceil(s/P+4),x=!1;n%2&&y((r=r.times(a)).d,t),0!==(n=H(n/2));)y((a=a.times(a)).d,t);return x=!0,e.s<0?new l(_).div(r):h(r,s)}}else if(0>i)throw Error(N+"NaN");return i=0>i&&1&e.d[Math.max(t,n)]?-1:1,a.s=1,x=!1,r=e.times(f(a,s+12)),x=!0,(r=d(r)).s=i,r},B.toPrecision=function(e,t){var n,s,r=this,i=r.constructor;return void 0===e?s=g(r,(n=l(r))<=i.toExpNeg||n>=i.toExpPos):(o(e,1,w),void 0===t?t=i.rounding:o(t,0,8),s=g(r=h(new i(r),e,t),(n=l(r))>=e||n<=i.toExpNeg,e)),s},B.toSignificantDigits=B.tosd=function(e,t){var n=this.constructor;return void 0===e?(e=n.precision,t=n.rounding):(o(e,1,w),void 0===t?t=n.rounding:o(t,0,8)),h(new n(this),e,t)},B.toString=B.valueOf=B.val=B.toJSON=function(){var e=this,t=l(e),n=e.constructor;return g(e,t<=n.toExpNeg||t>=n.toExpPos)};var R=function(){function e(e,t){var n,s=0,r=e.length;for(e=e.slice();r--;)n=e[r]*t+s,e[r]=n%k|0,s=n/k|0;return s&&e.unshift(s),e}function t(e,t,n,s){var r,i;if(n!=s)i=n>s?1:-1;else for(r=i=0;n>r;r++)if(e[r]!=t[r]){i=e[r]>t[r]?1:-1;break}return i}function n(e,t,n){for(var s=0;n--;)e[n]-=s,s=e[n]<t[n]?1:0,e[n]=s*k+e[n]-t[n];for(;!e[0]&&e.length>1;)e.shift()}return function(s,r,i,o){var a,d,u,c,f,p,m,g,y,b,_,w,v,x,S,E,H,U,O=s.constructor,T=s.s==r.s?1:-1,q=s.d,B=r.d;if(!s.s)return new O(s);if(!r.s)throw Error(N+"Division by zero");for(d=s.e-r.e,H=B.length,S=q.length,g=(m=new O(T)).d=[],u=0;B[u]==(q[u]||0);)++u;if(B[u]>(q[u]||0)&&--d,0>(w=null==i?i=O.precision:o?i+(l(s)-l(r))+1:i))return new O(0);if(w=w/P+2|0,u=0,1==H)for(c=0,B=B[0],w++;(S>u||c)&&w--;u++)v=c*k+(q[u]||0),g[u]=v/B|0,c=v%B|0;else{for((c=k/(B[0]+1)|0)>1&&(B=e(B,c),q=e(q,c),H=B.length,S=q.length),x=H,b=(y=q.slice(0,H)).length;H>b;)y[b++]=0;(U=B.slice()).unshift(0),E=B[0],B[1]>=k/2&&++E;do{c=0,0>(a=t(B,y,H,b))?(_=y[0],H!=b&&(_=_*k+(y[1]||0)),(c=_/E|0)>1?(c>=k&&(c=k-1),1==(a=t(f=e(B,c),y,p=f.length,b=y.length))&&(c--,n(f,p>H?U:B,p))):(0==c&&(a=c=1),f=B.slice()),b>(p=f.length)&&f.unshift(0),n(y,f,b),-1==a&&1>(a=t(B,y,H,b=y.length))&&(c++,n(y,b>H?U:B,b)),b=y.length):0===a&&(c++,y=[0]),g[u++]=c,a&&y[0]?y[b++]=q[x]||0:(y=[q[x]],b=1)}while((x++<S||void 0!==y[0])&&w--)}return g[0]||g.shift(),m.e=d,h(m,o?i+l(m)+1:i)}}();v=function e(t){function n(e){var t=this;if(!(t instanceof n))return new n(e);if(t.constructor=n,e instanceof n)return t.s=e.s,t.e=e.e,void(t.d=(e=e.d)?e.slice():e);if("number"==typeof e){if(0*e!=0)throw Error(S+e);if(e>0)t.s=1;else{if(!(0>e))return t.s=0,t.e=0,void(t.d=[0]);e=-e,t.s=-1}return e===~~e&&1e7>e?(t.e=0,void(t.d=[e])):p(t,e.toString())}if("string"!=typeof e)throw Error(S+e);if(45===e.charCodeAt(0)?(e=e.slice(1),t.s=-1):t.s=1,!O.test(e))throw Error(S+e);p(t,e)}var s,r,i;if(n.prototype=B,n.ROUND_UP=0,n.ROUND_DOWN=1,n.ROUND_CEIL=2,n.ROUND_FLOOR=3,n.ROUND_HALF_UP=4,n.ROUND_HALF_DOWN=5,n.ROUND_HALF_EVEN=6,n.ROUND_HALF_CEIL=7,n.ROUND_HALF_FLOOR=8,n.clone=e,n.config=n.set=b,void 0===t&&(t={}),t)for(i=["precision","rounding","toExpNeg","toExpPos","LN10"],s=0;s<i.length;)t.hasOwnProperty(r=i[s++])||(t[r]=this[r]);return n.config(t),n}(v),_=new v(1),void 0===(s=function(){return v}.call(t,n,t,e))||(e.exports=s)}()},function(e,t){const n={};[["bch_seedSign","Not yet functioning. Perhaps funds missing for test","1033"],["bch_seedSignHash","Not yet functioning. Perhaps funds missing for test","1034"],["bch_sampleBalance","returned undefined","995"],["bch_sampleHistory","returned undefined","996"],["bch_sampleTransaction","returned undefined","997"],["bch_sampleUnspent","returned undefined","998"],["bch_seedBalance","returned undefined","1016"],["bch_seedUnspent","returned undefined","999"],["bch_sampleValid","returned undefined","1026"],["bch_seedValid","returned null","1115"],["bch_test","returned null","1114"],["bch_details","returned null","1117"],["bch_sample","returned null","1116"],["btc_seedSignHash","Signing still holds a dynamic componement","1035"],["burst_seedUnspent","Not yet functioning. Perhaps funds missing for test","1038"],["burst_seedSign","Not yet functioning. Perhaps funds missing for test","1036"],["burst_seedSignHash","Not yet functioning. Perhaps funds missing for test / Signing still holds a dynamic componement","1037"],["dash_seedSign","Unstable host. Should work","1039"],["dash_seedSignHash","Unstable host. Should work","1040"],["dash_seedBalance","returned undefined","1018"],["dash_seedUnspent","returned undefined","1022"],["dash_sampleTransaction","Malfunction","1060"],["dash_sampleHistory","Unstable host. Should work","1063"],["dash_sampleBalance","returned undefined","1021"],["dash_sampleUnspent","returned undefined","1025"],["dgb_sampleHistory","Not yet functioning","1041"],["dgb_seedSign","Not yet functioning. Perhaps funds missing for test","1042"],["dgb_seedSignHash","Not yet functioning. Perhaps funds missing for test","1043"],["dgb_sampleUnspent","returned undefined","1000"],["dgb_seedUnspent","returned undefined","1001"],["etc_sampleHistory","Not yet functioning","1023"],["etc_sampleBalance","Not yet functioning","1024"],["etc_seedBalance","returned undefined","699"],["eth.xhy_sampleHistory","Eth token history not yet supported","701"],["eth.xhy_sampleBalance","returned undefined","1002"],["eth.xhy_seedBalance","returned undefined","1003"],["exp_sampleHistory","Not yet functioning","1044"],["exp_seedSignHash","returned 49AFC302","1004"],["flo_seedSign","Not yet functioning. Perhaps funds missing for test","1045"],["flo_seedSignHash","Not yet functioning. Perhaps funds missing for test","1046"],["flo_seedUnspent","returned undefined","1005"],["flo_sampleTransaction","returned undefined","1056"],["ltc_sampleHistory","returned undefined","1006"],["ltc_sampleBalance","returned undefined","1057"],["ltc_sampleUnspent","returned undefined","1058"],["ltc_seedBalance","returned undefined","1027"],["ltc_seedSign","returned undefined","1028"],["ltc_seedSignHash","returned undefined","1029"],["ltc_seedUnspent","returned undefined","1030"],["ltc_sampleTransaction","Not yet functioning","1061"],["nxt_seedSignHash","Signing still holds a dynamic componement",""],["nxt_sampleHistory","returned valid","1017"],["nxt.xhy_seedSignHash","Signing still holds a dynamic componement",""],["nxt.xhy_seedSign","returned null","1008"],["omni_seedSignHash","Not yet functioning. Perhaps funds missing for test","1047"],["omni_sampleHistory","returned math calculation error","1009"],["omni.xhy_seedSignHash","Not yet functioning. Perhaps funds missing for test","1048"],["omni.xhy_sampleHistory","returned math calculation error","1010"],["ubq_sampleHistory","Not yet functioning","697"],["ubq_seedSignHash","returned 1149D33D","1011"],["rise_sampleTransaction","Not yet functioning","885"],["rise_sampleHistory","returned undefined","1059"],["shift_sampleTransaction","Not yet functioning","885"],["shift_sampleHistory","returned undefined","1123"],["shift_sampleBalance","returned undefined","1124"],["shift_seedBalance","returned undefined","1122"],["xcp_seedSignHash","Signing still holds a dynamic componement","1049"],["xcp_sampleTransaction","Missing data for source,dest,amount, fee","705"],["xcp_sampleHistory","returned undefined","1019"],["xcp.xhy_sampleTransaction","Missing data for source,dest,amount, fee","705"],["xcp.xhy_sampleHistory","returned undefined","1054"],["xcp.xhy_sampleBalance","returned undefined","1055"],["xcp.xhy_seedSignHash","Signing still holds a dynamic componement","1050"],["xem_sampleHistory","returned undefined","1012"],["xem.xhy_sampleHistory","returned undefined","1013"],["xrp_seedSignHash","Signing still holds a dynamic componement","1051"],["xrp_seedSign","returned undefined","1121"],["xrp_sampleHistory","returned undefined","1014"],["zec_seedSign","Not yet functioning. Perhaps funds missing for test","1052"],["zec_seedSignHash","Not yet functioning. Perhaps funds missing for test","1053"],["zec_sampleHistory","Unstable","702"],["zec_sampleUnspent","returned undefined","1120"]].map(function(e){n[e[0]]={message:e[1],link:""===e[2]?"":"https://gitlab.com/hybrix/hybrixd/node/issues/"+e[2]}}),t.knownIssues=n}]);