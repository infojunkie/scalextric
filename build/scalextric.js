var me=Object.create;var Vt=Object.defineProperty;var ve=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var ge=Object.getPrototypeOf,ye=Object.prototype.hasOwnProperty;var we=(r,t)=>()=>(t||r((t={exports:{}}).exports,t),t.exports);var Me=(r,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of be(t))!ye.call(r,i)&&i!==e&&Vt(r,i,{get:()=>t[i],enumerable:!(n=ve(t,i))||n.enumerable});return r};var Ee=(r,t,e)=>(e=r!=null?me(ge(r)):{},Me(t||!r||!r.__esModule?Vt(e,"default",{value:r,enumerable:!0}):e,r));var At=we(Y=>{(function(r,t){if(typeof define=="function"&&define.amd)define(["exports"],t);else if(typeof Y<"u")t(Y);else{var e={exports:{}};t(e.exports),r.jstoxml=e.exports}})(typeof globalThis<"u"?globalThis:typeof self<"u"?self:Y,function(r){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.default=r.toXML=void 0;function t(u){return i(u)||n(u)||c(u)||e()}function e(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function n(u){if(typeof Symbol<"u"&&u[Symbol.iterator]!=null||u["@@iterator"]!=null)return Array.from(u)}function i(u){if(Array.isArray(u))return h(u)}function o(u,a){var s=Object.keys(u);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(u);a&&(p=p.filter(function(v){return Object.getOwnPropertyDescriptor(u,v).enumerable})),s.push.apply(s,p)}return s}function l(u){for(var a=1;a<arguments.length;a++){var s=arguments[a]!=null?arguments[a]:{};a%2?o(Object(s),!0).forEach(function(p){g(u,p,s[p])}):Object.getOwnPropertyDescriptors?Object.defineProperties(u,Object.getOwnPropertyDescriptors(s)):o(Object(s)).forEach(function(p){Object.defineProperty(u,p,Object.getOwnPropertyDescriptor(s,p))})}return u}function g(u,a,s){return a in u?Object.defineProperty(u,a,{value:s,enumerable:!0,configurable:!0,writable:!0}):u[a]=s,u}function E(u,a){return I(u)||N(u,a)||c(u,a)||y()}function y(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function c(u,a){if(u){if(typeof u=="string")return h(u,a);var s=Object.prototype.toString.call(u).slice(8,-1);if(s==="Object"&&u.constructor&&(s=u.constructor.name),s==="Map"||s==="Set")return Array.from(u);if(s==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(s))return h(u,a)}}function h(u,a){(a==null||a>u.length)&&(a=u.length);for(var s=0,p=new Array(a);s<a;s++)p[s]=u[s];return p}function N(u,a){var s=u==null?null:typeof Symbol<"u"&&u[Symbol.iterator]||u["@@iterator"];if(s!=null){var p=[],v=!0,M=!1,V,O;try{for(s=s.call(u);!(v=(V=s.next()).done)&&(p.push(V.value),!(a&&p.length===a));v=!0);}catch(A){M=!0,O=A}finally{try{!v&&s.return!=null&&s.return()}finally{if(M)throw O}}return p}}function I(u){if(Array.isArray(u))return u}function T(u){"@babel/helpers - typeof";return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?T=function(s){return typeof s}:T=function(s){return s&&typeof Symbol=="function"&&s.constructor===Symbol&&s!==Symbol.prototype?"symbol":typeof s},T(u)}var m={ARRAY:"array",BOOLEAN:"boolean",DATE:"date",FUNCTION:"function",JSTOXML_OBJECT:"jstoxml-object",NULL:"null",NUMBER:"number",OBJECT:"object",STRING:"string"},Ct=[m.STRING,m.NUMBER,m.BOOLEAN],Lt='<?xml version="1.0" encoding="UTF-8"?>',at=["_selfCloseTag","_attrs"],$t=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:"",s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0;return a.repeat(s)},X=function(a){return Array.isArray(a)&&m.ARRAY||T(a)===m.OBJECT&&a!==null&&a._name&&m.JSTOXML_OBJECT||a instanceof Date&&m.DATE||a===null&&m.NULL||T(a)},st=function(a){return a.startsWith("<![CDATA[")},ot=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:"",s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},p=arguments.length>2?arguments[2]:void 0,v=a;if(T(a)===m.STRING){if(st(a))return a;var M=new RegExp("(".concat(Object.keys(s).join("|"),")(?!(\\w|#)*;)"),"g");v=String(a).replace(M,function(V,O){return s[O]||""})}return typeof p=="function"?p(v):v},Ft=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},s=arguments.length>1?arguments[1]:void 0,p=arguments.length>2?arguments[2]:void 0,v=arguments.length>3?arguments[3]:void 0,M=Array.isArray(a)?a:Object.entries(a).map(function(V){var O=E(V,2),A=O[0],k=O[1];return g({},A,k)});return M.reduce(function(V,O){var A=Object.keys(O)[0],k=O[A];if(T(p)===m.FUNCTION){var J=p(A,k);if(J)return V}var R=s?ot(k,s):k,W=!v&&R===!0?"":'="'.concat(R,'"');return V.push("".concat(A).concat(W)),V},[])},Pt=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},s=arguments.length>1?arguments[1]:void 0,p=arguments.length>2?arguments[2]:void 0,v=arguments.length>3?arguments[3]:void 0,M=Ft(a,s,p,v);if(M.length===0)return"";var V=M.join(" ");return" ".concat(V)},Dt=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return Object.keys(a).map(function(s){return{_name:s,_content:a[s]}})},zt=function(a){return Ct.includes(X(a))},Bt=function(a){return!a.match("<")},qt=function(a){var s=a.header,p=a.isOutputStart,v=s&&p;if(!v)return"";var M=T(s)===m.BOOLEAN;return M?Lt:s},ut={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"},lt=function u(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},p=s.depth,v=p===void 0?0:p,M=s.indent,V=s._isFirstItem,O=s._isOutputStart,A=O===void 0?!0:O,k=s.header,J=s.attributeReplacements,R=J===void 0?{}:J,W=s.attributeFilter,ct=s.attributeExplicitTrue,Xt=ct===void 0?!1:ct,ft=s.contentReplacements,Z=ft===void 0?{}:ft,ht=s.contentMap,pt=s.selfCloseTags,Jt=pt===void 0?!0:pt,Ht=typeof R=="boolean"&&!R,Gt=Ht?{}:l(l({},ut),R),Yt=typeof Z=="boolean"&&!Z,Wt=Yt?{}:l(l({},ut),Z),dt=typeof M=="string",Q=$t(M,v),Zt=X(a),mt=qt({header:k,indent:M,depth:v,isOutputStart:A}),H=A&&!mt&&V&&v===0,vt=dt&&!H?`
`:"",j="";switch(Zt){case m.JSTOXML_OBJECT:{var C=a._name,L=a._content;if(L===null&&typeof ht!="function"){j="".concat(vt).concat(Q).concat(C);break}var Qt=Array.isArray(L)&&L.every(zt);if(Qt){var te=L.map(function(S){return u({_name:C,_content:S},l(l({},s),{},{depth:v,_isOutputStart:!1}))});return te.join("")}if(at.includes(C))break;var D=u(L,l(l({},s),{},{depth:v+1,_isOutputStart:H})),ee=X(D),re=Bt(D),ne=st(D),bt="".concat(vt).concat(Q);if(C==="_comment"){j+="".concat(bt,"<!-- ").concat(L," -->");break}var gt=ee==="undefined"||D==="",ie=Jt,yt=a._selfCloseTag,wt=T(yt)===m.BOOLEAN?gt&&yt:gt&&ie,ae=wt?"/":"",se=Pt(a._attrs,Gt,W,Xt),oe="<".concat(C).concat(se).concat(ae,">"),ue=dt&&!re&&!ne?`
`.concat(Q):"",le=wt?"":"".concat(D).concat(ue,"</").concat(C,">");j+="".concat(bt).concat(oe).concat(le);break}case m.OBJECT:{var Mt=Object.keys(a),ce=Mt.map(function(S,z){var tt=l(l({},s),{},{_isFirstItem:z===0,_isLastItem:z+1===Mt.length,_isOutputStart:H}),B={_name:S};if(X(a[S])===m.OBJECT){at.forEach(function(et){var Tt=a[S][et];typeof Tt<"u"&&(B[et]=Tt,delete a[S][et])});var pe=typeof a[S]._content<"u";if(pe&&Object.keys(a[S]).length>1){var Et=Object.assign({},a[S]);delete Et._content,B._content=[].concat(t(Dt(Et)),[a[S]._content])}}typeof B._content>"u"&&(B._content=a[S]);var de=u(B,tt);return de},s);j=ce.join("");break}case m.FUNCTION:{var fe=a(s);j=u(fe,s);break}case m.ARRAY:{var he=a.map(function(S,z){var tt=l(l({},s),{},{_isFirstItem:z===0,_isLastItem:z+1===a.length,_isOutputStart:H});return u(S,tt)});j=he.join("");break}default:{j=ot(a,Wt,ht);break}}return"".concat(mt).concat(j)};r.toXML=lt;var Ut={toXML:lt};r.default=Ut})});var Te=2e3,f={s:1,n:0,d:1};function x(r,t){if(isNaN(r=parseInt(r,10)))throw G();return r*t}function d(r,t){if(t===0)throw rt();var e=Object.create(w.prototype);e.s=r<0?-1:1,r=r<0?-r:r;var n=$(r,t);return e.n=r/n,e.d=t/n,e}function Ot(r){for(var t={},e=r,n=2,i=4;i<=e;){for(;e%n===0;)e/=n,t[n]=(t[n]||0)+1;i+=1+2*n++}return e!==r?e>1&&(t[e]=(t[e]||0)+1):t[r]=(t[r]||0)+1,t}var K=function(r,t){var e=0,n=1,i=1,o=0,l=0,g=0,E=1,y=1,c=0,h=1,N=1,I=1,T=1e7,m;if(r!=null)if(t!==void 0){if(e=r,n=t,i=e*n,e%1!==0||n%1!==0)throw Ke()}else switch(typeof r){case"object":{if("d"in r&&"n"in r)e=r.n,n=r.d,"s"in r&&(e*=r.s);else if(0 in r)e=r[0],1 in r&&(n=r[1]);else throw G();i=e*n;break}case"number":{if(r<0&&(i=r,r=-r),r%1===0)e=r;else if(r>0){for(r>=1&&(y=Math.pow(10,Math.floor(1+Math.log(r)/Math.LN10)),r/=y);h<=T&&I<=T;)if(m=(c+N)/(h+I),r===m){h+I<=T?(e=c+N,n=h+I):I>h?(e=N,n=I):(e=c,n=h);break}else r>m?(c+=N,h+=I):(N+=c,I+=h),h>T?(e=N,n=I):(e=c,n=h);e*=y}else(isNaN(r)||isNaN(t))&&(n=e=NaN);break}case"string":{if(h=r.match(/\d+|./g),h===null)throw G();if(h[c]==="-"?(i=-1,c++):h[c]==="+"&&c++,h.length===c+1?l=x(h[c++],i):h[c+1]==="."||h[c]==="."?(h[c]!=="."&&(o=x(h[c++],i)),c++,(c+1===h.length||h[c+1]==="("&&h[c+3]===")"||h[c+1]==="'"&&h[c+3]==="'")&&(l=x(h[c],i),E=Math.pow(10,h[c].length),c++),(h[c]==="("&&h[c+2]===")"||h[c]==="'"&&h[c+2]==="'")&&(g=x(h[c+1],i),y=Math.pow(10,h[c+1].length)-1,c+=3)):h[c+1]==="/"||h[c+1]===":"?(l=x(h[c],i),E=x(h[c+2],1),c+=3):h[c+3]==="/"&&h[c+1]===" "&&(o=x(h[c],i),l=x(h[c+2],i),E=x(h[c+4],1),c+=5),h.length<=c){n=E*y,i=e=g+n*o+y*l;break}}default:throw G()}if(n===0)throw rt();f.s=i<0?-1:1,f.n=Math.abs(e),f.d=Math.abs(n)};function Ve(r,t,e){for(var n=1;t>0;r=r*r%e,t>>=1)t&1&&(n=n*r%e);return n}function Oe(r,t){for(;t%2===0;t/=2);for(;t%5===0;t/=5);if(t===1)return 0;for(var e=10%t,n=1;e!==1;n++)if(e=e*10%t,n>Te)return 0;return n}function Se(r,t,e){for(var n=1,i=Ve(10,e,t),o=0;o<300;o++){if(n===i)return o;n=n*10%t,i=i*10%t}return 0}function $(r,t){if(!r)return t;if(!t)return r;for(;;){if(r%=t,!r)return t;if(t%=r,!t)return r}}function w(r,t){if(K(r,t),this instanceof w)r=$(f.d,f.n),this.s=f.s,this.n=f.n/r,this.d=f.d/r;else return d(f.s*f.n,f.d)}var rt=function(){return new Error("Division by Zero")},G=function(){return new Error("Invalid argument")},Ke=function(){return new Error("Parameters must be integer")};w.prototype={s:1,n:0,d:1,abs:function(){return d(this.n,this.d)},neg:function(){return d(-this.s*this.n,this.d)},add:function(r,t){return K(r,t),d(this.s*this.n*f.d+f.s*this.d*f.n,this.d*f.d)},sub:function(r,t){return K(r,t),d(this.s*this.n*f.d-f.s*this.d*f.n,this.d*f.d)},mul:function(r,t){return K(r,t),d(this.s*f.s*this.n*f.n,this.d*f.d)},div:function(r,t){return K(r,t),d(this.s*f.s*this.n*f.d,this.d*f.n)},clone:function(){return d(this.s*this.n,this.d)},mod:function(r,t){if(isNaN(this.n)||isNaN(this.d))return new w(NaN);if(r===void 0)return d(this.s*this.n%this.d,1);if(K(r,t),f.n===0&&this.d===0)throw rt();return d(this.s*(f.d*this.n)%(f.n*this.d),f.d*this.d)},gcd:function(r,t){return K(r,t),d($(f.n,this.n)*$(f.d,this.d),f.d*this.d)},lcm:function(r,t){return K(r,t),f.n===0&&this.n===0?d(0,1):d(f.n*this.n,$(f.n,this.n)*$(f.d,this.d))},ceil:function(r){return r=Math.pow(10,r||0),isNaN(this.n)||isNaN(this.d)?new w(NaN):d(Math.ceil(r*this.s*this.n/this.d),r)},floor:function(r){return r=Math.pow(10,r||0),isNaN(this.n)||isNaN(this.d)?new w(NaN):d(Math.floor(r*this.s*this.n/this.d),r)},round:function(r){return r=Math.pow(10,r||0),isNaN(this.n)||isNaN(this.d)?new w(NaN):d(Math.round(r*this.s*this.n/this.d),r)},roundTo:function(r,t){return K(r,t),d(this.s*Math.round(this.n*f.d/(this.d*f.n))*f.n,f.d)},inverse:function(){return d(this.s*this.d,this.n)},pow:function(r,t){if(K(r,t),f.d===1)return f.s<0?d(Math.pow(this.s*this.d,f.n),Math.pow(this.n,f.n)):d(Math.pow(this.s*this.n,f.n),Math.pow(this.d,f.n));if(this.s<0)return null;var e=Ot(this.n),n=Ot(this.d),i=1,o=1;for(var l in e)if(l!=="1"){if(l==="0"){i=0;break}if(e[l]*=f.n,e[l]%f.d===0)e[l]/=f.d;else return null;i*=Math.pow(l,e[l])}for(var l in n)if(l!=="1"){if(n[l]*=f.n,n[l]%f.d===0)n[l]/=f.d;else return null;o*=Math.pow(l,n[l])}return f.s<0?d(o,i):d(i,o)},equals:function(r,t){return K(r,t),this.s*this.n*f.d===f.s*f.n*this.d},compare:function(r,t){K(r,t);var e=this.s*this.n*f.d-f.s*f.n*this.d;return(0<e)-(e<0)},simplify:function(r){if(isNaN(this.n)||isNaN(this.d))return this;r=r||.001;for(var t=this.abs(),e=t.toContinued(),n=1;n<e.length;n++){for(var i=d(e[n-1],1),o=n-2;o>=0;o--)i=i.inverse().add(e[o]);if(Math.abs(i.sub(t).valueOf())<r)return i.mul(this.s)}return this},divisible:function(r,t){return K(r,t),!(!(f.n*this.d)||this.n*f.d%(f.n*this.d))},valueOf:function(){return this.s*this.n/this.d},toFraction:function(r){var t,e="",n=this.n,i=this.d;return this.s<0&&(e+="-"),i===1?e+=n:(r&&(t=Math.floor(n/i))>0&&(e+=t,e+=" ",n%=i),e+=n,e+="/",e+=i),e},toLatex:function(r){var t,e="",n=this.n,i=this.d;return this.s<0&&(e+="-"),i===1?e+=n:(r&&(t=Math.floor(n/i))>0&&(e+=t,n%=i),e+="\\frac{",e+=n,e+="}{",e+=i,e+="}"),e},toContinued:function(){var r,t=this.n,e=this.d,n=[];if(isNaN(t)||isNaN(e))return n;do n.push(Math.floor(t/e)),r=t%e,t=e,e=r;while(t!==1);return n},toString:function(r){var t=this.n,e=this.d;if(isNaN(t)||isNaN(e))return"NaN";r=r||15;var n=Oe(t,e),i=Se(t,e,n),o=this.s<0?"-":"";if(o+=t/e|0,t%=e,t*=10,t&&(o+="."),n){for(var l=i;l--;)o+=t/e|0,t%=e,t*=10;o+="(";for(var l=n;l--;)o+=t/e|0,t%=e,t*=10;o+=")"}else for(var l=r;t&&l--;)o+=t/e|0,t%=e,t*=10;return o}};function St(r){return r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Kt(r,t=!1){return t?r.abs().compare(1)<0?r.inverse():r:r.abs().compare(1)>0?r.inverse():r}function _t(r,t,e){let n=0,i=r.length-1;for(;n<=i;){let o=i+n>>1,l=e(t,r[o]);if(l>0)n=o+1;else if(l<0)i=o-1;else return o}return~n}function q(r,t){return(r%t+t)%t}function It(r,t){let e=1/t;return Math.round(r*e)/e}function nt(r){return r.match(/\\?.|^$/g).reduce((t,e)=>(e==='"'?t.quote=!t.quote:!t.quote&&e===" "?t.a.push(""):t.a[t.a.length-1]+=e.replace(/\\(.)/,"$1"),t),{a:[""],quote:!1}).a}var b=class r{constructor(t,e){this.ratio=t;this.original=e}get cents(){return 1200*Math.log2(this.ratio.valueOf())}get savarts(){return 1e3*Math.log10(this.ratio.valueOf())}difference(t){return new r(this.ratio.div(t.ratio))}static fromRatio(t){return new r(new w(t),t)}static fromCents(t,e){return new r(new w(Math.pow(2,t/1200)),e??`${t} cents`)}static fromSavarts(t,e){return new r(new w(Math.pow(10,t/1e3)),e??`${t} savarts`)}static compare(t,e){return t.ratio.compare(e.ratio)}static JND=r.fromCents(5)};var F=class r{constructor(t,e){this.intervals=t;this.metadata=e;this.intervals.sort(b.compare),this.intervals[0].ratio.valueOf()!=1&&(this.intervals=[new b(new w(1)),...this.intervals])}static fromIntervals(t,e){return new r(t.map(n=>typeof n=="string"?new b(new w(n)):b.fromCents(n)),e)}_transposable;get transposable(){if(this._transposable!==void 0)return this._transposable;let t=this.intervals[1].difference(this.intervals[0]);return this._transposable=this.intervals.slice(1).every((e,n)=>{let i=e.difference(this.intervals[n]);return new b(Kt(i.difference(t).ratio,!0)).ratio.compare(b.JND.ratio)<0})}get steps(){return this.intervals.length-1}get octave(){return this.intervals[this.steps]}tune(t){return new b(this.intervals[t.pitchClass].ratio.mul(this.octave.ratio.pow(t.octave)))}nearest(t){let e=Math.floor(Math.log(t.ratio.valueOf())/Math.log(this.octave.ratio.valueOf())),n=new b(t.ratio.div(this.octave.ratio.pow(e))),i=_t(this.intervals,n,b.compare);if(i>=0)return{tone:new _(this,i,e),interval:t,difference:new b(new w(1))};{let o=~i,l=Math.abs(this.intervals[o-1].difference(n).cents),g=Math.abs(this.intervals[o].difference(n).cents),E=l<g?o-1:o,y=new _(this,E,e),c=this.tune(y);return{tone:y,interval:c,difference:c.difference(t)}}}static fromEdo(t){return new r(Array.from(Array(t+1)).map((e,n)=>b.fromCents(1200/t*n)),{name:`${t}edo (equal divisions of the octave)`})}},_=class r{constructor(t,e,n){this.tuning=t;this.pitchClass=e;this.octave=n}get pitch(){return this.pitchClass+this.octave*this.tuning.steps}get tune(){return this.tuning.tune(this)}static fromPitch(t,e){return new r(t,q(e,t.steps),Math.floor(e/t.steps))}};var U=class{keyValueMap=new Map;valueKeyMap=new Map;get size(){return this.keyValueMap.size}[Symbol.toStringTag];[Symbol.iterator]=this.keyValueMap[Symbol.iterator];entries=()=>this.keyValueMap.entries();keys=()=>this.keyValueMap.keys();values=()=>this.keyValueMap.values();get=t=>this.keyValueMap.get(t);getKey=t=>this.valueKeyMap.get(t);getValue=t=>this.get(t);set=(t,e)=>{this.delete(t),this.keyValueMap.set(t,e);let n=this.valueKeyMap.get(e)||[];return this.valueKeyMap.set(e,[...n,t]),this};setKey=(t,e)=>this.set(e,t);setValue=(t,e)=>this.set(t,e);clear=()=>{this.keyValueMap.clear(),this.valueKeyMap.clear()};delete=t=>{if(this.has(t)){let e=this.keyValueMap.get(t);this.keyValueMap.delete(t);let n=this.valueKeyMap.get(e).filter(i=>i!==t);return n.length>0?this.valueKeyMap.set(e,n):this.valueKeyMap.delete(e),!0}return!1};deleteKey=t=>this.delete(t);deleteValue=t=>this.hasValue(t)?(this.valueKeyMap.get(t).forEach(e=>{this.delete(e)}),!0):!1;forEach=(t,e)=>{this.keyValueMap.forEach((n,i)=>{t.apply(e,[n,i,this])})};has=t=>this.keyValueMap.has(t);hasKey=t=>this.has(t);hasValue=t=>this.valueKeyMap.has(t);inspect=()=>{let t="Multimap {",e=0;return this.forEach((n,i)=>{e++,t+=""+i.toString()+" => "+n.toString(),e<this.size&&(t+=", ")}),t+="}",t}};var P=class{constructor(t,e,n){this.tuning=t;this.notes=e;this.accidentals=n;this.parseMap=new U,Object.keys(e).forEach(i=>{this.parseMap.set(i,e[i]),Object.keys(n).forEach(o=>{this.parseMap.set(`${i}${o}`,q(e[i]+n[o],t.steps))})}),this.nameMap=new U,Object.keys(e).forEach(i=>{let o=[0];this.nameMap.set(i,e[i]),Object.keys(n).forEach(l=>{o.includes(n[l])||(this.nameMap.set(`${i}${l}`,q(e[i]+n[l],t.steps)),o.push(n[l]))})}),this.regex=new RegExp("^("+Array.from(this.parseMap.keys()).map(St).join("|")+")(-?\\d)$","i")}regex;nameMap;parseMap;name(t){return[...this.nameMap.getKey(t.pitchClass)].sort((n,i)=>n.length-i.length).map(n=>`${n}${t.octave}`)}parse(t){let e=this.regex.exec(t);if(!e)throw new Error(`[Solmization.parse] Could not match note ${t}`);return new _(this.tuning,this.parseMap.get(e[1]),parseInt(e[2],10))}};var it=class r{constructor(t,e,n){this.tuning=t;this.tones=e;this.metadata=n;if(e.some((i,o)=>!!e.slice(o+1).find(l=>l.pitchClass===i.pitchClass)))throw Error("Found repeating pitch class in tone row.")}transpose(t){return new r(this.tuning,this.tones.map(e=>_.fromPitch(this.tuning,t.pitch+e.pitch)))}invert(t){return new r(this.tuning,this.tones.map(e=>_.fromPitch(this.tuning,t.pitch-e.pitch)))}reverse(){return new r(this.tuning,[...this.tones].reverse())}rotate(t){let e=t%this.tones.length;return new r(this.tuning,[...this.tones.slice(e),...this.tones.slice(0,e)])}monotonize(t=!1){return new r(this.tuning,this.tones.reduce((e,n)=>{let i=e.length>0?e[e.length-1]:n;return!t&&n.pitch<i.pitch?e.push(new _(this.tuning,n.pitchClass,i.octave+(n.pitchClass<i.pitchClass?1:0))):t&&n.pitch>i.pitch?e.push(new _(this.tuning,n.pitchClass,i.octave+(n.pitchClass>i.pitchClass?-1:0))):e.push(n),e},[]))}get pitches(){return this.tones.map(t=>t.pitch)}static fromPitches(t,e,n){return new r(t,e.map(i=>_.fromPitch(t,i)),n)}static fromPitchClasses(t,e,n,i){return new r(t,e.map(o=>new _(t,o,n)),i)}},Nt=class r extends it{constructor(e,n,i,o){super(e,i,o);this.tuning=e;this.solmization=n;this.tones=i;this.metadata=o}static fromToneRow(e,n){return new r(e.tuning,n,e.tones,e.metadata)}};var Rt=Ee(At(),1);var xt={name:"scalextric",version:"0.8.0",description:"Like Unicode, but for music. One day.",type:"module",types:"./build/types/index.d.ts",exports:{import:"./build/scalextric.js",require:"./build/scalextric.cjs"},scripts:{build:"npm run build:esm && npm run build:cjs && npm run build:d.ts","build:esm":"esbuild src/index.ts --bundle --format=esm --minify --sourcemap --outfile=build/scalextric.js","build:cjs":"esbuild src/index.ts --bundle --platform=node --packages=external --minify --sourcemap --outfile=build/scalextric.cjs","build:d.ts":"tsc --emitDeclarationOnly --outDir build/types","build:watch":"esbuild src/index.ts --watch --bundle --format=esm --minify --sourcemap --outfile=build/scalextric.js","build:chords":"python src/utils/chordtable/generate.py > data/chords.json && echo 'Generate data/chords.json file'","build:scala":'wget -q -O data/scales.zip http://huygens-fokker.org/docs/scales.zip && unzip -o data/scales.zip -d data/ && for f in data/scl/*; do iconv -f iso-8859-1 -t utf-8 "$f" -o "$f"; done',test:"npm run test:lint && npm run test:ts && npm run test:js","test:lint":"eslint src","test:ts":"node --import=tsx --test test/*.spec.ts","test:js":"node --test test/*.spec.js",demo:"npm run demo:develop","demo:develop":"ws -d demo -p ${PORT:-8080}"},author:"Karim Ratib <karim.ratib@gmail.com> (https://github.com/infojunkie)",license:"GPL-3.0-only",devDependencies:{"@eslint/js":"^9.17.0","@types/jstoxml":"^2.0.4","@types/node":"^22.10.2",esbuild:"^0.24.0",eslint:"^9.17.0","local-web-server":"^5.4.0","ts-node":"^10.9.2",tsx:"^4.19.2",typescript:"^5.7.2","typescript-eslint":"^8.18.1","validate-with-xmllint":"^1.2.1"},dependencies:{"fraction.js":"^4.1.2",jstoxml:"^3.2.6"}};var{toXML:Ie}=Rt.default,jt="4.0",kt=class r{constructor(t,e,n={}){this.title=t;this.objects=e;this.options=Object.assign({},r.defaultOptions,n),this.reference=new P(F.fromEdo(12),{C:0,D:2,E:4,F:5,G:7,A:9,B:11},{})}static defaultOptions={divisions:768,time:{beats:4,beatType:4},tempo:60};static accidentals={"#":"sharp","\u266F":"sharp","\uE262":"sharp",n:"natural","\u266E":"natural","\uE261":"natural",b:"flat","\u266D":"flat","\uE260":"flat",x:"double-sharp","\u{1D12A}":"double-sharp","\uE263":"double-sharp","##":"sharp-sharp","\u266F\u266F":"sharp-sharp","\uE269":"sharp-sharp",bb:"flat-flat","\u266D\u266D":"flat-flat","\u{1D12B}":"flat-flat","\uE264":"flat-flat","n#":"natural-sharp","\u266E\u266F":"natural-sharp","\uE268":"natural-sharp",nb:"natural-flat","\u266E\u266D":"natural-flat","\uE267":"natural-flat","#x":"triple-sharp","\u266F\u{1D12A}":"triple-sharp","\uE265":"triple-sharp",bbb:"triple-flat","\u266D\u266D\u266D":"triple-flat","\uE266":"triple-flat","\uE280":"quarter-flat","\uE282":"quarter-sharp","\uE281":"three-quarters-flat","\uE283":"three-quarters-sharp","\uE275":"sharp-down","\uE274":"sharp-up","\uE273":"natural-down","\uE272":"natural-up","\uE271":"flat-down","\uE270":"flat-up","\uE277":"double-sharp-down","\uE276":"double-sharp-up","\uE279":"flat-flat-down","\uE278":"flat-flat-up","\uE27A":"arrow-down","\uE27B":"arrow-up","\uE446":"slash-quarter-sharp","\uE447":"slash-sharp","\uE442":"slash-flat","\uE440":"double-slash-flat","\uE443":"quarter-flat","\uE444":"quarter-sharp","\uE441":"flat","\uE445":"sharp","\uE450":"sharp-1","\uE451":"sharp-2","\uE452":"sharp-3","\uE453":"sharp-5","\uE454":"flat-1","\uE455":"flat-2","\uE456":"flat-3","\uE457":"flat-4","\uE461":"sori","\uE460":"koron"};static durations={8:"eighth",4:"quarter",2:"half",1:"whole"};options;reference;convert(){return Ie(this.convertDocument(),{header:`
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML ${jt} Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
      `.trim(),indent:"  "})}convertDocument(){return{_name:"score-partwise",_attrs:{version:jt},_content:[{work:{"work-title":this.title}},{identification:[{encoding:[{software:`@infojunkie/scalextric ${xt.version}`},{"encoding-date":r.convertDate(new Date)}]}]},{"part-list":{_name:"score-part",_attrs:{id:"P1"},_content:{_name:"part-name",_attrs:{"print-object":"no"},_content:this.title}}},{_name:"part",_attrs:{id:"P1"},_content:this.convertObjects()}]}}convertObjects(){return this.objects.reduce((t,e,n)=>{let i=this.convertMeasure(t.length+1);t.push(i),n>0&&i._content.push({_name:"print",_attrs:{"new-system":"yes"}}),n===0&&i._content.push({attributes:[{divisions:this.options.divisions},{key:[{fifths:0},{mode:"major"}]},{time:[{beats:this.options.time.beats},{"beat-type":this.options.time.beatType}]},{clef:[{sign:"G"},{line:2}]}]},{_name:"direction",_attrs:{placement:"above"},_content:[{"direction-type":[{_name:"metronome",_attrs:{parentheses:"no"},_content:[{"beat-unit":r.durations[this.options.time.beatType]},{"per-minute":this.options.tempo}]}]},{_name:"sound",_attrs:{tempo:this.options.tempo}}]}),e.metadata&&i._content.push({_name:"direction",_attrs:{placement:"above"},_content:[{"direction-type":[{words:e.metadata.label}]}]});let o=0;if(e.tones.forEach((l,g)=>{i._content.push(this.convertNote(l,e)),o=(o+1)%this.options.time.beats,o===0&&g<e.tones.length-1&&(i=this.convertMeasure(t.length+1),t.push(i))}),o>0)for(;o++<this.options.time.beats;)i._content.push({_name:"note",_content:[{_name:"rest"},{duration:this.options.divisions},{type:r.durations[this.options.time.beatType]}]});return i._content.push(this.convertBar("right","light-light")),t},[])}convertBar(t,e){return{_name:"barline",_attrs:{location:t},_content:[{"bar-style":e}]}}convertMeasure(t){return{_name:"measure",_attrs:{number:t},_content:[]}}convertNote(t,e){let n=e.solmization.name(t)[0],i=n[0],o=this.convertAccidental(n.slice(1,-1)),l=n[n.length-1],g=this.reference.parse(`${i}${l}`),E=t.tune.difference(g.tune).cents,y=It(E/100,.05);return{_name:"note",_content:[{_name:"pitch",_content:[{step:i},{alter:y},{octave:l}]},{duration:this.options.divisions},{type:r.durations[this.options.time.beatType]},{...o&&o!=="other"&&{accidental:o}},{...o&&o==="other"&&{_name:"accidental",_content:o,_attrs:{smufl:n.slice(1,-1)}}}]}}convertAccidental(t){return t.length?t in r.accidentals?r.accidentals[t]:"other":null}static convertDate(t){return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().split("T")[0]}};var Ne="Scale archive, Scala version 92, May 2024",Ae="Ableton 12.1";function xe(r,t=Ne){let e=0,n=0,i=0,o="",l,g=[],E=[],y=[];if((r+`\r
`).match(/^.*[\n\r]{1,2}|$/gm)?.map(c=>c.trim()).filter(c=>c.length>0).forEach(c=>{if(c.indexOf("!")!==0){if(e===0)l=c;else if(e===1)i=parseInt(c);else{let{interval:h,comment:N}=je(c);g.push(h),E.push(N)}e++}else{let h=c.substring(1).trim();h.length>0&&(n>0?y.push(h):o=h.replace(/\.a?scl$/,"")),n++}}),g.length!==i)throw new Error(`[tuningFromScala] Error in Scala format: Expecting ${i} intervals but got ${g.length} instead.`);return new F([b.fromRatio("1/1"),...g],{name:o,label:l,description:y.join(`\r
`),source:t,...E.some(c=>c!==void 0)&&{intervals:[void 0,...E]}})}function hr(r,t=Ae){let e=xe(r,t);if(e.metadata){let n=e.metadata.description?.matchAll(/@ABL\s+([\w]+)\s+(.*?)$/gm),i={};for(let o of n)switch(o[1]){case"NOTE_NAMES":nt(o[2]).forEach((l,g)=>{i[l]=g});break;case"REFERENCE_PITCH":{let l=nt(o[2]);e.metadata.reference={pitchClass:parseInt(l[0]),octave:parseInt(l[1]),frequency:parseFloat(l[2])};break}case"SOURCE":e.metadata.source=o[2];break;case"LINK":default:console.warn(`[solmizationFromAbleton] Unhandled directive @ABL ${o[1]}. Ignoring.`)}return new P(e,i,{})}throw new Error("[solmizationFromAbleton] Error in Ableton format: No metadata found in tuning.")}function je(r){let[t,e]=r.split("!").map(i=>i.trim()),n;if(t.indexOf("/")>0?n=b.fromRatio(t):t.indexOf(".")>0?n=b.fromCents(parseFloat(t),t):n=b.fromRatio(t),n.ratio.compare(0)<0)throw new Error(`[tuningFromScala] Error in Scala format: got negative ratio ${t} as interval`);return{interval:n,comment:e}}export{b as Interval,kt as MusicXML,P as Solmization,_ as Tone,it as ToneRow,Nt as ToneRowSolmized,F as Tuning,hr as solmizationFromAbleton,xe as tuningFromScala};
/*! Bundled license information:

fraction.js/fraction.js:
  (**
   * @license Fraction.js v4.3.7 31/08/2023
   * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
   *
   * Copyright (c) 2023, Robert Eisele (robert@raw.org)
   * Dual licensed under the MIT or GPL Version 2 licenses.
   **)
*/
//# sourceMappingURL=scalextric.js.map
