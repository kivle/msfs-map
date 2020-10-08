(this["webpackJsonpmsfs-map"]=this["webpackJsonpmsfs-map"]||[]).push([[0],{169:function(e,t,n){},171:function(e,t,n){"use strict";n.r(t);var a=n(0),i=n.n(a),r=n(15),c=n.n(r),o=(n(94),n(75)),l=n(76),u=n(8),s=n(40),p=n.n(s),d=n(29),m=n(30);var g=Object(m.b)({name:"map",initialState:{plane:{position:void 0,altitude:0,heading:0,airspeed:0,vertical_speed:0,airspeed_true:0,flaps:0,trim:0,rudder_trim:0},zoom:13},reducers:{updateMsfs:function(e,t){var n=t.payload.msg;e.plane.position=[n.latitude,n.longitude],e.plane.altitude=n.altitude,e.plane.heading=n.heading,e.plane.airspeed=n.airspeed,e.plane.vertical_speed=n.vertical_speed,e.plane.airspeed_true=n.airspeed_true,e.plane.flaps=n.flaps,e.plane.trim=n.trim,e.plane.rudder_trim=n.rudder_trim},zoomChanged:function(e,t){e.zoom=t.payload}}}),f=g.actions,v=f.updateMsfs,h=f.zoomChanged,b=function(e){!function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"ws://localhost:9000/ws",a=new WebSocket(n);a.onmessage=function(e){var n=JSON.parse(e.data);n.latitude>=0&&n.latitude<.015&&n.longitude>=0&&n.longitude<.015||t(n)},a.onerror=function(e){},a.onclose=function(i){try{a.close()}catch(r){}setTimeout((function(){return e(t,n)}),2e3)}}((function(t){e(v({msg:t}))}))},w=function(e){return e.map.plane.position},E=function(e){return e.map.zoom},y=function(e){return{altitude:e.map.plane.altitude,heading:e.map.plane.heading,airspeed:e.map.plane.airspeed,vertical_speed:e.map.plane.vertical_speed,airspeed_true:e.map.plane.airspeed_true,flaps:e.map.plane.flaps,trim:e.map.plane.trim,rudder_trim:e.map.plane.rudder_trim}},_=g.reducer,k=n(61),j=n.n(k);function x(){var e=Object(u.c)(y),t=e.airspeed,n=e.airspeed_true,i=e.altitude,r=e.heading,c=e.vertical_speed,o=e.flaps,l=e.trim,s=e.rudder_trim;return a.createElement("div",{className:j.a.main},a.createElement(O,{label:"Airspeed",value:"".concat(t," kt (").concat(n," kt)")}),a.createElement(O,{label:"Altitude",value:"".concat(i," ft")}),a.createElement(O,{label:"Heading",value:a.createElement(a.Fragment,null,a.createElement(d.a,{style:{transform:"rotate(".concat(r-90,"deg)")}})," ".concat(r,"\xb0"))}),a.createElement(O,{label:"V. speed",value:"".concat(c," ft/s")}),0!==parseFloat(o)&&a.createElement(O,{label:"Flaps",value:"".concat(o)}),0!==parseFloat(l)&&a.createElement(O,{label:"Trim",value:"".concat(l,"%")}),0!==parseFloat(s)&&a.createElement(O,{label:"R.Trim",value:"".concat(s,"%")}))}function O(e){var t=e.label,n=e.value;e.unit;return a.createElement("span",{className:j.a.infoField},a.createElement("label",null,t),a.createElement("span",null,n))}var P=n(86),z=n.n(P),S=n(87),F=n.n(S),N=n(88),W=n(45),B=n.n(W),C=n(12),V=n.n(C),G=n(28),L=n(62),M=n(43),A=n(44),I=new(function(){function e(){Object(M.a)(this,e)}return Object(A.a)(e,[{key:"getWikipediaApiUrl",value:function(e,t){var n=Object.keys(t).reduce((function(e,n){return e&&(e+="&"),"".concat(e," ").concat(encodeURIComponent(n),"=").concat(encodeURIComponent(t[n]))}),"");return"https://".concat(e,".wikipedia.org/w/api.php?").concat(n)}},{key:"getPagesByGeoLocation",value:function(){var e=Object(G.a)(V.a.mark((function e(t,n,a,i){var r,c,o,l;return V.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r={format:"json",action:"query",generator:"geosearch",ggslimit:20,ggsradius:i,ggscoord:n+"|"+a,origin:"*",prop:"extracts|pageimages|coordinates",exsentences:"10",exintro:!0,exlimit:20,pithumbsize:"400",imlimit:"10"},c=this.getWikipediaApiUrl(t,r),e.next=4,fetch(c);case 4:return o=e.sent,e.next=7,o.json();case 7:return l=e.sent,e.abrupt("return",l);case 9:case"end":return e.stop()}}),e,this)})));return function(t,n,a,i){return e.apply(this,arguments)}}()}]),e}()),U=new(function(){function e(t,n){Object(M.a)(this,e),this.api=t,this.storage=n,this.getPagesByGeoLocation=function(e,t){var n=0;return function(){var a=(new Date).getTime();if(!(a-n<t))return n=a,e.apply(void 0,arguments)}}(this.getPagesByGeoLocation.bind(this),1e4)}return Object(A.a)(e,[{key:"getPagesByGeoLocation",value:function(){var e=Object(G.a)(V.a.mark((function e(t,n,a,i){return V.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.api.getPagesByGeoLocation(t,n,a,i);case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e,this)})));return function(t,n,a,i){return e.apply(this,arguments)}}()}]),e}())(I,window.localStorage);var T=Object(m.b)({name:"wikipedia",initialState:{edition:"en",currentPage:void 0,pages:[],pagesViewed:[]},reducers:{addPages:function(e,t){var n,a=t.payload.data,i=(a=void 0===a?{}:a).query,r=(i=void 0===i?{}:i).pages;if(r){var c=Object.keys(r).reduce((function(e,t){return e.push(r[t]),e}),[]).filter((function(t){var n,a,i;return(null===t||void 0===t||null===(n=t.extract)||void 0===n?void 0:n.length)>100&&(!!(i=null===t||void 0===t?void 0:t.extract)&&i.length>100&&(i.match(/\./g)||[]).length>1)&&(null===t||void 0===t||null===(a=t.coordinates)||void 0===a?void 0:a.length)>0&&!e.pages.some((function(e){return t.pageid===e.pageid}))&&!e.pagesViewed.some((function(e){return t.pageid===e}))}));(n=e.pages).push.apply(n,Object(L.a)(c)),c.length&&void 0===e.currentPage&&(e.currentPage=c[0].pageid)}},nextPage:function(e){if(void 0!==e.currentPage){e.pages=e.pages.filter((function(t){return t.pageid!==e.currentPage})),e.pagesViewed.push(e.currentPage);for(var t=function(){var t=Math.min.apply(Math,Object(L.a)(e.pages.map((function(e){return e.extract.length})))),n=e.pages.find((function(e){return e.extract.length===t}));e.pages=e.pages.filter((function(e){return e.pageid!==n.pageid}))};e.pages.length>10;)t()}var n=e.pages.sort((function(e,t){var n,a;return(null===t||void 0===t||null===(n=t.extract)||void 0===n?void 0:n.length)-(null===e||void 0===e||null===(a=e.extract)||void 0===a?void 0:a.length)})).find((function(t){return!e.pagesViewed.some((function(e){return t.pageid===e}))}));e.currentPage=n?n.pageid:void 0},setEdition:function(e,t){var n=t.payload;e.edition=n}}}),J=T.actions,R=J.addPages,q=J.nextPage,X=(J.setEdition,function(e){return e.wikipedia.edition}),D=function(e){return e.wikipedia.pages},H=function(e){return e.wikipedia.currentPage&&e.wikipedia.pages.find((function(t){return t.pageid===e.wikipedia.currentPage}))},Q=T.reducer;function $(e){var t=e.page;return t.extract?z()(t.extract):null}function K(e){var t,n=e.page;return(null===n||void 0===n||null===(t=n.thumbnail)||void 0===t?void 0:t.source)?a.createElement("img",{src:n.thumbnail.source,alt:n.title}):null}function Y(){var e=Object(u.b)(),t=Object(u.c)(H),n=Object(a.useCallback)((function(){e(q())}),[e]);return Object(a.useEffect)((function(){if(t&&window.speechSynthesis){var e="".concat(t.title,"\n\n").concat(t.extract?Object(N.decode)(F()(t.extract)):""),a=new SpeechSynthesisUtterance(e);return a.voice=window.speechSynthesis.getVoices()[9],a.onend=function(){n()},window.speechSynthesis.speak(a),function(){return window.speechSynthesis.cancel()}}}),[t,n]),t?a.createElement("div",{className:B.a.main},a.createElement("div",{className:B.a.title},a.createElement("div",null,t.title," ",a.createElement("button",{onClick:n},"Next")),a.createElement(K,{page:t})),a.createElement("div",{className:B.a.text},a.createElement($,{page:t}))):null}function Z(){return a.createElement("div",null,a.createElement(x,null),a.createElement(Y,null))}function ee(){var e=Object(u.c)(H),t=Object(u.c)(D);return a.createElement(a.Fragment,null,t.map((function(t){return t&&t.coordinates&&t.coordinates.map((function(n){return a.createElement(p.a,{key:t.pageid,position:[n.lat,n.lon],icon:a.createElement(d.b,{size:t.pageid===e.pageid?64:32,opacity:t.pageid===e.pageid?1:.8})})}))})))}function te(){var e=Object(u.b)(),t=Object(u.c)(w),n=Object(u.c)(y).heading,r=Object(u.c)(E);Object(a.useEffect)((function(){e(b)}),[e]),Object(a.useEffect)((function(){var n,a,i;(null===t||void 0===t?void 0:t.length)>=2&&e((n=t[0],a=t[1],i=1e4,function(){var e=Object(G.a)(V.a.mark((function e(t,r){var c,o,l;return V.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return c=r(),o=X(c),e.next=4,U.getPagesByGeoLocation(o,n,a,i);case 4:(l=e.sent)&&t(R({data:l}));case 6:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}()))}),[e,t]);var c=Object(a.useCallback)((function(t){t.zoom!==r&&e(h(t.zoom))}),[e,r]),s=i.a.createElement("div",{style:{transform:"rotate(".concat(n-90,"deg)")}},i.a.createElement(d.a,{size:24})),m=(null===t||void 0===t?void 0:t.length)>=2?t:[51.505,-.09];return i.a.createElement(i.a.Fragment,null,i.a.createElement(Z,null),i.a.createElement(o.a,{center:m,zoom:r,onViewportChanged:c},i.a.createElement(l.a,{attribution:'&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}),i.a.createElement(ee,null),t&&i.a.createElement(p.a,{position:t,icon:s})))}n(169);var ne=function(){return i.a.createElement("div",{className:"App"},i.a.createElement(te,null))},ae=Object(m.a)({reducer:{map:_,wikipedia:Q}});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));n(170),n(3);window._store=ae,c.a.render(i.a.createElement(i.a.StrictMode,null,i.a.createElement(u.a,{store:ae},i.a.createElement(ne,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},45:function(e,t,n){e.exports={main:"Wikipedia_main__4NWFl",title:"Wikipedia_title__QXPcz",text:"Wikipedia_text__1Xntm"}},61:function(e,t,n){e.exports={main:"PlaneInfo_main__9z7SN",infoField:"PlaneInfo_infoField__3d4Nw"}},89:function(e,t,n){e.exports=n(171)},94:function(e,t,n){}},[[89,1,2]]]);
//# sourceMappingURL=main.f60fa093.chunk.js.map