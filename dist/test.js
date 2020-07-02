module.exports=function(e){var t={};function n(s){if(t[s])return t[s].exports;var r=t[s]={i:s,l:!1,exports:{}};return e[s].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(s,r,function(t){return e[t]}.bind(null,r));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t){function n(e){if("object"!=typeof e||null===e)return!1;const t=[].slice.call(arguments);return t.shift(),t.reduce((t,n)=>e.hasOwnProperty(n)&&t,!0)}function s(e){return e.fee&&("string"==typeof e.fee||"number"==typeof e.fee||"object"==typeof e.fee&&null!==e.fee)}function r(e){return"string"==typeof e&&e.startsWith("valid")}function i(e,t,n){if(t.hasOwnProperty("factor")){const n=Number(t.factor);return"string"==typeof e&&(-1!==e.toString().indexOf(".")&&e.split(".")[1].length===n||0===n&&e.length===n)}return!1}function o(e){return void 0!==e&&null!==e&&!("string"==typeof e&&e.startsWith("ERROR"))}t.test=function(e){return n(e)},t.sample=function(e){return n(e,"address","transaction")},t.details=function(e){return n(e,"symbol","name","factor","contract","mode","keygen-base")&&s(e)},t.sampleValid=r,t.sampleBalance=i,t.sampleUnspent=o,t.sampleHistory=function(e){return e instanceof Array},t.sampleTransaction=function(e){return n(e,"id","timestamp","amount","symbol","source","target","confirmed")&&s(e)},t.seedValid=r,t.seedBalance=i,t.seedUnspent=o,t.seedSign=function(e){return"string"==typeof e&&!e.startsWith("ERROR")},t.seedSignHash=function(e,t,n){if(n.hasOwnProperty("hash")){const t=n.hash;return e===t||"dynamic"===t&&"00000000"!==e}return!1}},function(e,t,n){const s=n(2),r=n(3),i=n(0),o=1e3,a=["bch","dummy","eth","flo","ark","btc","burst","dash","dgb","etc","exp","lsk","ltc","nxt","omni","rise","shift","ubq","waves","xcp","xem","xrp","zec","mock.btc","eth.xhy","waves.xhy","nxt.xhy","omni.xhy","xcp.xhy","xem.xhy"];function l(e,t){return console.log("fromAtomic",e,t),new s(e).div(new s(10).pow(t)).toFixed()}function u(e){return e=void 0===e?{}:e,["sample","details","test"].forEach(t=>{void 0===e[t]&&(e[t]={})}),e}const d=e=>({test:{data:(e=u(e)).test,step:"id"},sample:{data:e.sample,step:"id"},details:{data:e.details,step:"id"},sampleValid:{data:e.sampleValid,step:"id"},sampleBalance:{data:e.sampleBalance,step:"id"},sampleUnspent:{data:e.sampleUnspent,step:"id"},sampleHistory:{data:e.sampleHistory,step:"id"},sampleTransaction:{data:e.sampleTransaction,step:"id"},seedValid:{data:e.seedValid,step:"id"},seedBalance:{data:e.seedBalance,step:"id"},seedUnspent:{data:e.seedUnspent,step:"id"},seedSign:{data:e.seedSign,step:"id"},seedSignHash:{data:{data:e.seedSign},step:"hash"}}),c=Object.keys(d({}));function f(e,t,n){return console.log("getFeeForUnspents",e,t,n),"string"!=typeof e&&"number"!=typeof e?NaN:"string"==typeof t||"number"==typeof t?n["fee-symbol"]===n.symbol?new s(e).add(new s(t)).toFixed():e:"object"==typeof t&&null!==t?t.hasOwnProperty(n.symbol)?new s(e).add(new s(t[n.symbol])).toFixed():e:NaN}function p(e){return{data:[{symbol:e},"addAsset",{_options:{passErrors:!0},sample:{data:{query:"/asset/"+e+"/sample"},step:"rout"},test:{data:{query:"/asset/"+e+"/test"},step:"rout"},details:{data:{query:"/asset/"+e+"/details"},step:"rout"},address:{data:{symbol:e},step:"getAddress"},publicKey:{data:{symbol:e},step:"getPublicKey"}},"parallel",t=>{const n=(t=u(t)).test.amount||l(o,t.details.factor);return{_options:{passErrors:!0},sample:{data:t.sample,step:"id"},test:{data:t.test,step:"id"},details:{data:t.details,step:"id"},address:{data:t.address,step:"id"},sampleValid:{data:{query:"/asset/"+e+"/validate/"+t.sample.address},step:"rout"},sampleBalance:{data:{query:"/asset/"+e+"/balance/"+t.sample.address},step:"rout"},sampleUnspent:{data:{query:"/asset/"+e+"/unspent/"+t.sample.address+"/"+f(n,t.details.fee,t.details)+"/"+t.address+"/"+t.sample.publicKey},step:"rout"},sampleHistory:{data:{query:"/asset/"+e+"/history/"+t.sample.address},step:"rout"},sampleTransaction:{data:{query:"/asset/"+e+"/transaction/"+t.sample.transaction},step:"rout"},seedValid:{data:{query:"/asset/"+e+"/validate/"+t.address},step:"rout"},seedBalance:{data:{query:"/asset/"+e+"/balance/"+t.address},step:"rout"},seedUnspent:{data:{query:"/asset/"+e+"/unspent/"+t.address+"/"+f(n,t.details.fee,t.details)+"/"+t.sample.address+"/"+t.publicKey},step:"rout"}}},"parallel",t=>{const n=(t=u(t)).test.amount||l(o,t.details.factor);return{_options:{passErrors:!0},test:{data:t.test,step:"id"},sample:{data:t.sample,step:"id"},details:{data:t.details,step:"id"},sampleValid:{data:t.sampleValid+" "+t.sample.address,step:"id"},sampleBalance:{data:t.sampleBalance,step:"id"},sampleUnspent:{data:t.sampleUnspent,step:"id"},sampleHistory:{data:t.sampleHistory,step:"id"},sampleTransaction:{data:t.sampleTransaction,step:"id"},seedValid:{data:t.seedValid+" "+t.address,step:"id"},seedBalance:{data:t.seedBalance,step:"id"},seedUnspent:{data:t.seedUnspent,step:"id"},seedSign:{data:{symbol:e,amount:n,target:t.sample.address,validate:!1,unspent:t.test.hasOwnProperty("unspent")?t.test.unspent:t.seedUnspent,time:t.test.time},step:"rawTransaction"}}},"parallel",d,"parallel"],step:"sequential"}}const h=(e,t)=>n=>{const s={};let r=0,o=0;for(let a in n){s[a]={};const l=n[a];if(e.includes(a)&&void 0!==l){const e=l.details||{},n=l.test||{};for(let u in l){const d=l[u];if(i.hasOwnProperty(u)){const t=i[u](d,e,n);let r;t||r||++o,s[a][u]={valid:t,known:r,result:d,messages:["TODO"]}}else{const e=t?t[a+"_"+u]:void 0;s[a][u]={valid:!1,known:e,result:d,messages:["No validation available"]},++o}++r}}else for(let e of c){const n=t?t[a+"_"+e]:void 0;s[a][e]={valid:!1,known:n,result:null,messages:["Asset not available"]},++r,++o}}const a={assets:{},total:r,failures:o};return Object.keys(s).sort().forEach(e=>{a.assets[e]=s[e]}),a};t.runTests=function(e,t,n,s,r,i){const o={};e=e&&"*"!==e?e.split(","):a;for(let t of e)o[t]=p(t);t.sequential(["init",{username:"POMEW4B5XACN3ZCX",password:"TVZS7LODA5CSGP6U"},"session",{host:n},"addHost",o,"parallel",h(e,i)],s,e=>{console.error(e)},r)},t.xml=r.xml,t.web=r.web,t.json=r.json,t.cli=r.cli},function(e,t,n){var s;!function(r){"use strict";function i(e,t){var n,s,r,i,o,a,l,u,d=e.constructor,c=d.precision;if(!e.s||!t.s)return t.s||(t=new d(e)),E?h(t,c):t;if(l=e.d,u=t.d,o=e.e,r=t.e,l=l.slice(),i=o-r){for(0>i?(s=l,i=-i,a=u.length):(s=u,r=o,a=l.length),i>(a=(o=Math.ceil(c/P))>a?o+1:a+1)&&(i=a,s.length=1),s.reverse();i--;)s.push(0);s.reverse()}for(0>(a=l.length)-(i=u.length)&&(i=a,s=u,u=l,l=s),n=0;i;)n=(l[--i]=l[i]+u[i]+n)/q|0,l[i]%=q;for(n&&(l.unshift(n),++r),a=l.length;0==l[--a];)l.pop();return t.d=l,t.e=r,E?h(t,c):t}function o(e,t,n){if(e!==~~e||t>e||e>n)throw Error(O+e)}function a(e){var t,n,s,r=e.length-1,i="",o=e[0];if(r>0){for(i+=o,t=1;r>t;t++)s=e[t]+"",(n=P-s.length)&&(i+=c(n)),i+=s;o=e[t],(n=P-(s=o+"").length)&&(i+=c(n))}else if(0===o)return"0";for(;o%10==0;)o/=10;return i+o}function l(e,t){var n,s,r,i,o,l=0,d=0,c=e.constructor,f=c.precision;if(u(e)>16)throw Error(_+u(e));if(!e.s)return new c(v);for(null==t?(E=!1,o=f):o=t,i=new c(.03125);e.abs().gte(.1);)e=e.times(i),d+=5;for(o+=Math.log(U(2,d))/Math.LN10*2+5|0,n=s=r=new c(v),c.precision=o;;){if(s=h(s.times(e),o),n=n.times(++l),a((i=r.plus(D(s,n,o))).d).slice(0,o)===a(r.d).slice(0,o)){for(;d--;)r=h(r.times(r),o);return c.precision=f,null==t?(E=!0,h(r,f)):r}r=i}}function u(e){for(var t=e.e*P,n=e.d[0];n>=10;n/=10)t++;return t}function d(e,t,n){if(t>e.LN10.sd())throw E=!0,n&&(e.precision=n),Error(N+"LN10 precision limit exceeded");return h(new e(e.LN10),t)}function c(e){for(var t="";e--;)t+="0";return t}function f(e,t){var n,s,r,i,o,l,c,p,m,g=1,y=e,b=y.d,w=y.constructor,x=w.precision;if(y.s<1)throw Error(N+(y.s?"NaN":"-Infinity"));if(y.eq(v))return new w(0);if(null==t?(E=!1,p=x):p=t,y.eq(10))return null==t&&(E=!0),d(w,p);if(p+=10,w.precision=p,s=(n=a(b)).charAt(0),i=u(y),!(Math.abs(i)<15e14))return c=d(w,p+2,x).times(i+""),y=f(new w(s+"."+n.slice(1)),p-10).plus(c),w.precision=x,null==t?(E=!0,h(y,x)):y;for(;7>s&&1!=s||1==s&&n.charAt(1)>3;)s=(n=a((y=y.times(e)).d)).charAt(0),g++;for(i=u(y),s>1?(y=new w("0."+n),i++):y=new w(s+"."+n.slice(1)),l=o=y=D(y.minus(v),y.plus(v),p),m=h(y.times(y),p),r=3;;){if(o=h(o.times(m),p),a((c=l.plus(D(o,new w(r),p))).d).slice(0,p)===a(l.d).slice(0,p))return l=l.times(2),0!==i&&(l=l.plus(d(w,p+2,x).times(i+""))),l=D(l,new w(g),p),w.precision=x,null==t?(E=!0,h(l,x)):l;l=c,r+=2}}function p(e,t){var n,s,r;for((n=t.indexOf("."))>-1&&(t=t.replace(".","")),(s=t.search(/e/i))>0?(0>n&&(n=s),n+=+t.slice(s+1),t=t.substring(0,s)):0>n&&(n=t.length),s=0;48===t.charCodeAt(s);)++s;for(r=t.length;48===t.charCodeAt(r-1);)--r;if(t=t.slice(s,r)){if(r-=s,n=n-s-1,e.e=k(n/P),e.d=[],s=(n+1)%P,0>n&&(s+=P),r>s){for(s&&e.d.push(+t.slice(0,s)),r-=P;r>s;)e.d.push(+t.slice(s,s+=P));t=t.slice(s),s=P-t.length}else s-=r;for(;s--;)t+="0";if(e.d.push(+t),E&&(e.e>R||e.e<-R))throw Error(_+n)}else e.s=0,e.e=0,e.d=[0];return e}function h(e,t,n){var s,r,i,o,a,l,d,c,f=e.d;for(o=1,i=f[0];i>=10;i/=10)o++;if(0>(s=t-o))s+=P,r=t,d=f[c=0];else{if((c=Math.ceil((s+1)/P))>=(i=f.length))return e;for(d=i=f[c],o=1;i>=10;i/=10)o++;r=(s%=P)-P+o}if(void 0!==n&&(a=d/(i=U(10,o-r-1))%10|0,l=0>t||void 0!==f[c+1]||d%i,l=4>n?(a||l)&&(0==n||n==(e.s<0?3:2)):a>5||5==a&&(4==n||l||6==n&&(s>0?r>0?d/U(10,o-r):0:f[c-1])%10&1||n==(e.s<0?8:7))),1>t||!f[0])return l?(i=u(e),f.length=1,t=t-i-1,f[0]=U(10,(P-t%P)%P),e.e=k(-t/P)||0):(f.length=1,f[0]=e.e=e.s=0),e;if(0==s?(f.length=c,i=1,c--):(f.length=c+1,i=U(10,P-s),f[c]=r>0?(d/U(10,o-r)%U(10,r)|0)*i:0),l)for(;;){if(0==c){(f[0]+=i)==q&&(f[0]=1,++e.e);break}if(f[c]+=i,f[c]!=q)break;f[c--]=0,i=1}for(s=f.length;0===f[--s];)f.pop();if(E&&(e.e>R||e.e<-R))throw Error(_+u(e));return e}function m(e,t){var n,s,r,i,o,a,l,u,d,c,f=e.constructor,p=f.precision;if(!e.s||!t.s)return t.s?t.s=-t.s:t=new f(e),E?h(t,p):t;if(l=e.d,c=t.d,s=t.e,u=e.e,l=l.slice(),o=u-s){for((d=0>o)?(n=l,o=-o,a=c.length):(n=c,s=u,a=l.length),o>(r=Math.max(Math.ceil(p/P),a)+2)&&(o=r,n.length=1),n.reverse(),r=o;r--;)n.push(0);n.reverse()}else{for(r=l.length,(d=(a=c.length)>r)&&(a=r),r=0;a>r;r++)if(l[r]!=c[r]){d=l[r]<c[r];break}o=0}for(d&&(n=l,l=c,c=n,t.s=-t.s),a=l.length,r=c.length-a;r>0;--r)l[a++]=0;for(r=c.length;r>o;){if(l[--r]<c[r]){for(i=r;i&&0===l[--i];)l[i]=q-1;--l[i],l[r]+=q}l[r]-=c[r]}for(;0===l[--a];)l.pop();for(;0===l[0];l.shift())--s;return l[0]?(t.d=l,t.e=s,E?h(t,p):t):new f(0)}function g(e,t,n){var s,r=u(e),i=a(e.d),o=i.length;return t?(n&&(s=n-o)>0?i=i.charAt(0)+"."+i.slice(1)+c(s):o>1&&(i=i.charAt(0)+"."+i.slice(1)),i=i+(0>r?"e":"e+")+r):0>r?(i="0."+c(-r-1)+i,n&&(s=n-o)>0&&(i+=c(s))):r>=o?(i+=c(r+1-o),n&&(s=n-r-1)>0&&(i=i+"."+c(s))):((s=r+1)<o&&(i=i.slice(0,s)+"."+i.slice(s)),n&&(s=n-o)>0&&(r+1===o&&(i+="."),i+=c(s))),e.s<0?"-"+i:i}function y(e,t){return e.length>t?(e.length=t,!0):void 0}function b(e){if(!e||"object"!=typeof e)throw Error(N+"Object expected");var t,n,s,r=["precision",1,w,"rounding",0,8,"toExpNeg",-1/0,0,"toExpPos",0,1/0];for(t=0;t<r.length;t+=3)if(void 0!==(s=e[n=r[t]])){if(!(k(s)===s&&s>=r[t+1]&&s<=r[t+2]))throw Error(O+n+": "+s);this[n]=s}if(void 0!==(s=e[n="LN10"])){if(s!=Math.LN10)throw Error(O+n+": "+s);this[n]=new this(s)}return this}var v,w=1e9,x={precision:20,rounding:4,toExpNeg:-7,toExpPos:21,LN10:"2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"},E=!0,N="[DecimalError] ",O=N+"Invalid argument: ",_=N+"Exponent out of range: ",k=Math.floor,U=Math.pow,S=/^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,q=1e7,P=7,T=9007199254740991,R=k(T/P),A={};A.absoluteValue=A.abs=function(){var e=new this.constructor(this);return e.s&&(e.s=1),e},A.comparedTo=A.cmp=function(e){var t,n,s,r,i=this;if(e=new i.constructor(e),i.s!==e.s)return i.s||-e.s;if(i.e!==e.e)return i.e>e.e^i.s<0?1:-1;for(s=i.d.length,t=0,n=(r=e.d.length)>s?s:r;n>t;++t)if(i.d[t]!==e.d[t])return i.d[t]>e.d[t]^i.s<0?1:-1;return s===r?0:s>r^i.s<0?1:-1},A.decimalPlaces=A.dp=function(){var e=this,t=e.d.length-1,n=(t-e.e)*P;if(t=e.d[t])for(;t%10==0;t/=10)n--;return 0>n?0:n},A.dividedBy=A.div=function(e){return D(this,new this.constructor(e))},A.dividedToIntegerBy=A.idiv=function(e){var t=this.constructor;return h(D(this,new t(e),0,1),t.precision)},A.equals=A.eq=function(e){return!this.cmp(e)},A.exponent=function(){return u(this)},A.greaterThan=A.gt=function(e){return this.cmp(e)>0},A.greaterThanOrEqualTo=A.gte=function(e){return this.cmp(e)>=0},A.isInteger=A.isint=function(){return this.e>this.d.length-2},A.isNegative=A.isneg=function(){return this.s<0},A.isPositive=A.ispos=function(){return this.s>0},A.isZero=function(){return 0===this.s},A.lessThan=A.lt=function(e){return this.cmp(e)<0},A.lessThanOrEqualTo=A.lte=function(e){return this.cmp(e)<1},A.logarithm=A.log=function(e){var t,n=this,s=n.constructor,r=s.precision,i=r+5;if(void 0===e)e=new s(10);else if((e=new s(e)).s<1||e.eq(v))throw Error(N+"NaN");if(n.s<1)throw Error(N+(n.s?"NaN":"-Infinity"));return n.eq(v)?new s(0):(E=!1,t=D(f(n,i),f(e,i),i),E=!0,h(t,r))},A.minus=A.sub=function(e){var t=this;return e=new t.constructor(e),t.s==e.s?m(t,e):i(t,(e.s=-e.s,e))},A.modulo=A.mod=function(e){var t,n=this,s=n.constructor,r=s.precision;if(!(e=new s(e)).s)throw Error(N+"NaN");return n.s?(E=!1,t=D(n,e,0,1).times(e),E=!0,n.minus(t)):h(new s(n),r)},A.naturalExponential=A.exp=function(){return l(this)},A.naturalLogarithm=A.ln=function(){return f(this)},A.negated=A.neg=function(){var e=new this.constructor(this);return e.s=-e.s||0,e},A.plus=A.add=function(e){var t=this;return e=new t.constructor(e),t.s==e.s?i(t,e):m(t,(e.s=-e.s,e))},A.precision=A.sd=function(e){var t,n,s,r=this;if(void 0!==e&&e!==!!e&&1!==e&&0!==e)throw Error(O+e);if(t=u(r)+1,n=(s=r.d.length-1)*P+1,s=r.d[s]){for(;s%10==0;s/=10)n--;for(s=r.d[0];s>=10;s/=10)n++}return e&&t>n?t:n},A.squareRoot=A.sqrt=function(){var e,t,n,s,r,i,o,l=this,d=l.constructor;if(l.s<1){if(!l.s)return new d(0);throw Error(N+"NaN")}for(e=u(l),E=!1,0==(r=Math.sqrt(+l))||r==1/0?(((t=a(l.d)).length+e)%2==0&&(t+="0"),r=Math.sqrt(t),e=k((e+1)/2)-(0>e||e%2),r==1/0?t="1e"+e:t=(t=r.toExponential()).slice(0,t.indexOf("e")+1)+e,s=new d(t)):s=new d(r.toString()),r=o=(n=d.precision)+3;;)if(s=(i=s).plus(D(l,i,o+2)).times(.5),a(i.d).slice(0,o)===(t=a(s.d)).slice(0,o)){if(t=t.slice(o-3,o+1),r==o&&"4999"==t){if(h(i,n+1,0),i.times(i).eq(l)){s=i;break}}else if("9999"!=t)break;o+=4}return E=!0,h(s,n)},A.times=A.mul=function(e){var t,n,s,r,i,o,a,l,u,d=this,c=d.constructor,f=d.d,p=(e=new c(e)).d;if(!d.s||!e.s)return new c(0);for(e.s*=d.s,n=d.e+e.e,l=f.length,(u=p.length)>l&&(i=f,f=p,p=i,o=l,l=u,u=o),i=[],s=o=l+u;s--;)i.push(0);for(s=u;--s>=0;){for(t=0,r=l+s;r>s;)a=i[r]+p[s]*f[r-s-1]+t,i[r--]=a%q|0,t=a/q|0;i[r]=(i[r]+t)%q|0}for(;!i[--o];)i.pop();return t?++n:i.shift(),e.d=i,e.e=n,E?h(e,c.precision):e},A.toDecimalPlaces=A.todp=function(e,t){var n=this,s=n.constructor;return n=new s(n),void 0===e?n:(o(e,0,w),void 0===t?t=s.rounding:o(t,0,8),h(n,e+u(n)+1,t))},A.toExponential=function(e,t){var n,s=this,r=s.constructor;return void 0===e?n=g(s,!0):(o(e,0,w),void 0===t?t=r.rounding:o(t,0,8),n=g(s=h(new r(s),e+1,t),!0,e+1)),n},A.toFixed=function(e,t){var n,s,r=this,i=r.constructor;return void 0===e?g(r):(o(e,0,w),void 0===t?t=i.rounding:o(t,0,8),n=g((s=h(new i(r),e+u(r)+1,t)).abs(),!1,e+u(s)+1),r.isneg()&&!r.isZero()?"-"+n:n)},A.toInteger=A.toint=function(){var e=this,t=e.constructor;return h(new t(e),u(e)+1,t.rounding)},A.toNumber=function(){return+this},A.toPower=A.pow=function(e){var t,n,s,r,i,o,a=this,u=a.constructor,d=+(e=new u(e));if(!e.s)return new u(v);if(!(a=new u(a)).s){if(e.s<1)throw Error(N+"Infinity");return a}if(a.eq(v))return a;if(s=u.precision,e.eq(v))return h(a,s);if(o=(t=e.e)>=(n=e.d.length-1),i=a.s,o){if((n=0>d?-d:d)<=T){for(r=new u(v),t=Math.ceil(s/P+4),E=!1;n%2&&y((r=r.times(a)).d,t),0!==(n=k(n/2));)y((a=a.times(a)).d,t);return E=!0,e.s<0?new u(v).div(r):h(r,s)}}else if(0>i)throw Error(N+"NaN");return i=0>i&&1&e.d[Math.max(t,n)]?-1:1,a.s=1,E=!1,r=e.times(f(a,s+12)),E=!0,(r=l(r)).s=i,r},A.toPrecision=function(e,t){var n,s,r=this,i=r.constructor;return void 0===e?s=g(r,(n=u(r))<=i.toExpNeg||n>=i.toExpPos):(o(e,1,w),void 0===t?t=i.rounding:o(t,0,8),s=g(r=h(new i(r),e,t),(n=u(r))>=e||n<=i.toExpNeg,e)),s},A.toSignificantDigits=A.tosd=function(e,t){var n=this.constructor;return void 0===e?(e=n.precision,t=n.rounding):(o(e,1,w),void 0===t?t=n.rounding:o(t,0,8)),h(new n(this),e,t)},A.toString=A.valueOf=A.val=A.toJSON=function(){var e=this,t=u(e),n=e.constructor;return g(e,t<=n.toExpNeg||t>=n.toExpPos)};var D=function(){function e(e,t){var n,s=0,r=e.length;for(e=e.slice();r--;)n=e[r]*t+s,e[r]=n%q|0,s=n/q|0;return s&&e.unshift(s),e}function t(e,t,n,s){var r,i;if(n!=s)i=n>s?1:-1;else for(r=i=0;n>r;r++)if(e[r]!=t[r]){i=e[r]>t[r]?1:-1;break}return i}function n(e,t,n){for(var s=0;n--;)e[n]-=s,s=e[n]<t[n]?1:0,e[n]=s*q+e[n]-t[n];for(;!e[0]&&e.length>1;)e.shift()}return function(s,r,i,o){var a,l,d,c,f,p,m,g,y,b,v,w,x,E,O,_,k,U,S=s.constructor,T=s.s==r.s?1:-1,R=s.d,A=r.d;if(!s.s)return new S(s);if(!r.s)throw Error(N+"Division by zero");for(l=s.e-r.e,k=A.length,O=R.length,g=(m=new S(T)).d=[],d=0;A[d]==(R[d]||0);)++d;if(A[d]>(R[d]||0)&&--l,0>(w=null==i?i=S.precision:o?i+(u(s)-u(r))+1:i))return new S(0);if(w=w/P+2|0,d=0,1==k)for(c=0,A=A[0],w++;(O>d||c)&&w--;d++)x=c*q+(R[d]||0),g[d]=x/A|0,c=x%A|0;else{for((c=q/(A[0]+1)|0)>1&&(A=e(A,c),R=e(R,c),k=A.length,O=R.length),E=k,b=(y=R.slice(0,k)).length;k>b;)y[b++]=0;(U=A.slice()).unshift(0),_=A[0],A[1]>=q/2&&++_;do{c=0,0>(a=t(A,y,k,b))?(v=y[0],k!=b&&(v=v*q+(y[1]||0)),(c=v/_|0)>1?(c>=q&&(c=q-1),1==(a=t(f=e(A,c),y,p=f.length,b=y.length))&&(c--,n(f,p>k?U:A,p))):(0==c&&(a=c=1),f=A.slice()),b>(p=f.length)&&f.unshift(0),n(y,f,b),-1==a&&(1>(a=t(A,y,k,b=y.length))&&(c++,n(y,b>k?U:A,b))),b=y.length):0===a&&(c++,y=[0]),g[d++]=c,a&&y[0]?y[b++]=R[E]||0:(y=[R[E]],b=1)}while((E++<O||void 0!==y[0])&&w--)}return g[0]||g.shift(),m.e=l,h(m,o?i+u(m)+1:i)}}();x=function e(t){function n(e){var t=this;if(!(t instanceof n))return new n(e);if(t.constructor=n,e instanceof n)return t.s=e.s,t.e=e.e,void(t.d=(e=e.d)?e.slice():e);if("number"==typeof e){if(0*e!=0)throw Error(O+e);if(e>0)t.s=1;else{if(!(0>e))return t.s=0,t.e=0,void(t.d=[0]);e=-e,t.s=-1}return e===~~e&&1e7>e?(t.e=0,void(t.d=[e])):p(t,e.toString())}if("string"!=typeof e)throw Error(O+e);if(45===e.charCodeAt(0)?(e=e.slice(1),t.s=-1):t.s=1,!S.test(e))throw Error(O+e);p(t,e)}var s,r,i;if(n.prototype=A,n.ROUND_UP=0,n.ROUND_DOWN=1,n.ROUND_CEIL=2,n.ROUND_FLOOR=3,n.ROUND_HALF_UP=4,n.ROUND_HALF_DOWN=5,n.ROUND_HALF_EVEN=6,n.ROUND_HALF_CEIL=7,n.ROUND_HALF_FLOOR=8,n.clone=e,n.config=n.set=b,void 0===t&&(t={}),t)for(i=["precision","rounding","toExpNeg","toExpPos","LN10"],s=0;s<i.length;)t.hasOwnProperty(r=i[s++])||(t[r]=this[r]);return n.config(t),n}(x),v=new x(1),void 0===(s=function(){return x}.call(t,n,t,e))||(e.exports=s)}()},function(e,t,n){n(0);function s(e){return void 0===e?"undefined":JSON.stringify(e)}const r=(e,t,n,s,r)=>{const i=[];for(let o in n){const a=n[o],l=a.valid,u=a.known,d=a.result,c=(n.messages,e(t,o,l,u,d,s,r));i.push(c)}return i},i=(e,t,n,r,i,o,a)=>{const l=s(i).replace(/"/g,"");return r?n?(r.link?o.push("[36m"+e+" "+t+"[0m : "+r.message):o.push("[36m"+e+" "+t+"[0m : "+r.message+" [31m [Create issue][0m"),"[36m OK [0m"):(r.link?o.push("[33m"+e+" "+t+"[0m : "+r.message+" (Returned "+l+")"):o.push("[33m"+e+" "+t+"[0m : "+r.message+" [31m [Create issue][0m"),"[33mWARN[0m"):n?"[32m OK [0m":(a.push("[31m"+e+" "+t+"[0m : returned "+l+" [31m [Create issue][0m"),"[31mFAIL[0m")};function o(e,t,n,s){const r=n&&n.message?n.message:"returned "+s;return`https://gitlab.com/hybrix/hybrixd/node/issues/new?issue[description]=${encodeURIComponent(`/label ~"\\* Development Team \\*"\n/milestone %"DEV - asset maintenance - 2020-Q1"\n${r}`)}&issue[title]=${encodeURIComponent(e+" "+t+" "+r)}`}const a=(e,t,n,r,i,a,l)=>{const u=s(i).replace(/"/g,"");return r?n?(r.link?a.push('<b style="color:purple;">'+e+" "+t+'</b> : <a  name="'+e+"_"+t+'" target="_blank" href="'+r.link+'">'+r.message+"</a>"):a.push('<b style="color:purple;">'+e+" "+t+'</b> : <a name="'+e+"_"+t+'">'+r.message+' </a><a style="color:red;"target="_blank" href="'+o(e,t,r,r.message)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:purple" title="'+u+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>'):(r.link?a.push('<b style="color:orange;">'+e+" "+t+'</b> : <a  name="'+e+"_"+t+'" target="_blank" href="'+r.link+'">'+r.message+" (returned "+u+")</a>"):a.push('<b style="color:orange;">'+e+" "+t+'</b> : <a name="'+e+"_"+t+'">'+r.message+' </a><a style="color:red;"target="_blank" href="'+o(e,t,r,r.message)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:orange" title="'+u+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>'):n?'<td style="text-align:center;background-color:green" title="'+u+'">&nbsp;</td>':(l.push('<b style="color:red;">'+e+" "+t+"</b> : returned "+u+' <a  name="'+e+"_"+t+'" style="color:red;"target="_blank" href="'+o(e,t,void 0,u)+'"><b>Create issue</b></a>'),'<td style="text-align:center;background-color:red"  title="'+u+'"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#'+e+"_"+t+'">&nbsp;</a></td>')},l=(e,t,n,r,i,o,a)=>{const l=s(i).replace(/"/g,"");let u=`<testcase id="${e+"_"+t}" name="${e+" "+t}" time="0.001">`;return n||(u+=`<failure message="${l}" type="ERROR"></failure>`),u+="</testcase>"};t.xml=(e=>{const t=[],n=[];let s="";for(let i in e.assets)s=r(l,i,e.assets[i],t,n).join("");return s='<?xml version="1.0" encoding="UTF-8" ?><testsuites id="hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001"><testsuite id="testsuite.hybrix" name="hybrix" tests="'+e.total+'" failures="'+e.failures+'" time="0.001">'+s,s+="</testsuite></testsuites>"}),t.json=(e=>s(e)),t.cli=(e=>{const t=[],n=[];let s="\n";s+="   #   SAMPLE                                    SEED                    \n",s+="      ┌────┬─────┬──────┬────┬──────┬──────┬────┬────┬────┬──────┬──────┬────┬────┐\n",s+="      │Test│Sampl│Detail│Vald│Balnce│Unspnt│Hist│Tran│Vald│Balnce│Unspnt│Sign│Hash│\n";for(let o in e.assets){s+="      ├────┼─────┼──────┼────┼──────┼──────┼────┼────┼────┼──────┼──────┼────┼────┤\n",s+=o.substr(0,5)+"     ".substr(0,5-o.length)+" │";const a=r(i,o,e.assets[o],t,n);s+=a[0]+"│",s+=a[1]+" │",s+=" "+a[2]+" │",s+=a[3]+"│",s+=" "+a[4]+" │",s+=" "+a[5]+" │",s+=a[6]+"│",s+=a[7]+"│",s+=a[8]+"│",s+=" "+a[9]+" │",s+=" "+a[10]+" │",s+=a[11]+"│",s+=a[12]+"│",s+="\n"}s+="      └────┴─────┴──────┴────┴──────┴──────┴────┴────┴────┴──────┴──────┴────┴────┘\n",s+="\n",s+="New Issues:\n",n.sort();for(let e=0;e<n.length;++e)s+=" - "+n[e]+"\n";s+="\n",s+="Known Issues:\n",t.sort();for(let e=0;e<t.length;++e)s+=" - "+t[e]+"\n";return s+="\n",s+="      SUCCESS RATE: "+Math.floor(100*((e.total-e.failures)/e.total||0))+"%\n"}),t.web=(e=>{const t=[],n=[];let s='\n<style>\n:target {\n background-color: yellow;\n}\n</style>\n<table><tr><td>Symbol</td><td colspan="2"></td><td colspan="7" style="text-align:center;">Sample</td><td colspan="5"  style="text-align:center;">Seed</td></tr>';s+="<tr><td></td><td>Test</td><td>Sample</td><td>Details</td><td>Valid</td><td>Balance</td><td>Unspent</td>",s+="<td>History</td>",s+="<td>Transaction</td>",s+="<td>Valid</td><td>Balance</td><td>Unspent</td>",s+="<td>Sign</td><td>Hash</td></tr>";for(let i in e.assets)s+="<tr>",s+="<td>"+i+"</td>",s+=r(a,i,e.assets[i],t,n).join(""),s+="</tr>";s+="</table>",s+="<h3>New Issues</h3>",s+="<ul>",n.sort();for(let e=0;e<n.length;++e)s+="<li>"+n[e]+"</li>";s+="</ul>",s+='<h3><a href="https://gitlab.com/groups/hybrix/-/issues?milestone_title=Coin+support+%3A+Test+Issues" target="_blank">Known Issues</a></h3>',s+="<ul>",t.sort();for(let e=0;e<t.length;++e)s+="<li>"+t[e]+"</li>";return s+="</ul>",s+="<h1>"+(e.total-e.failures)/e.total*100+"%</h1>"})}]);