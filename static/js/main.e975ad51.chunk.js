(this["webpackJsonpmsfs-map"]=this["webpackJsonpmsfs-map"]||[]).push([[0],{100:function(e){e.exports=JSON.parse('{"a":"0.3.2"}')},106:function(e,t,a){},15:function(e,t,a){e.exports={main:"Preferences_main__ok2ws",preference:"Preferences_preference__191Je",preferenceButton:"Preferences_preferenceButton__FdKIq",expanded:"Preferences_expanded__Gn5Np",caret:"Preferences_caret__WiQ2N"}},16:function(e,t,a){e.exports={main:"ButtonBar_main__3br2_",btn:"ButtonBar_btn__34S_Q",active:"ButtonBar_active__3Biec",gap:"ButtonBar_gap__2g3HT"}},185:function(e,t,a){},187:function(e,t,a){"use strict";a.r(t);var n=a(1),i=a.n(n),r=a(13),c=a.n(r),s=(a(106),a(92)),o=a(3),l=a(5),u=a(8),d=a(69),p=a.n(d),b=a(21),g=Object(b.b)({name:"simdata",initialState:{position:void 0,altitude:0,heading:0,airspeed:0,vertical_speed:0,airspeed_true:0,flaps:0,trim:0,rudder_trim:0},reducers:{updateData:function(e,t){var a=t.payload;e.position&&e.position[0]===a.latitude&&e.position[1]===a.longitude||(e.position=[a.latitude,a.longitude]),e.altitude=a.altitude,e.heading=a.heading,e.airspeed=a.airspeed,e.vertical_speed=a.vertical_speed,e.airspeed_true=a.airspeed_true,e.flaps=a.flaps,e.trim=a.trim,e.rudder_trim=a.rudder_trim}}}),f=g.actions.updateData,j=function(e){return e.simdata},h=g.reducer,v=a(2),m=n.memo((function(e){var t=e.airspeed,a=e.airspeed_true,n=e.altitude,i=e.heading,r=e.vertical_speed,c=e.flaps,s=e.trim,o=e.rudder_trim;return Object(v.jsxs)("div",{className:p.a.main,children:[Object(v.jsx)(O,{label:"Airspeed",value:"".concat(t," kt (").concat(a," kt)")}),Object(v.jsx)(O,{label:"Altitude",value:"".concat(n," ft")}),Object(v.jsx)(O,{label:"Heading",value:Object(v.jsxs)(v.Fragment,{children:[Object(v.jsx)(u.e,{style:{transform:"rotate(".concat(i-90,"deg)")}})," ".concat(i,"\xb0")]})}),Object(v.jsx)(O,{label:"V. speed",value:"".concat(r," ft/s")}),0!==parseFloat(c)&&Object(v.jsx)(O,{label:"Flaps",value:"".concat(c)}),0!==parseFloat(s)&&Object(v.jsx)(O,{label:"Trim",value:"".concat(s,"%")}),0!==parseFloat(o)&&Object(v.jsx)(O,{label:"R.Trim",value:"".concat(o,"%")})]})}));function O(e){var t=e.label,a=e.value;e.unit;return Object(v.jsxs)("span",{className:p.a.infoField,children:[Object(v.jsx)("label",{children:t}),Object(v.jsx)("span",{children:a})]})}function k(){var e=Object(l.d)(j);return Object(v.jsx)(m,Object(o.a)({},e))}var x=a(95),y=a(53),w=a.n(y),_=a(9),S=a.n(_),P=a(14),C=a(55),z=a(39),M=a.n(z),R=a(40),N=a(19),E=a(20),F=function(){function e(){Object(N.a)(this,e)}return Object(E.a)(e,[{key:"getWikipediaApiUrl",value:function(e,t){var a=Object.keys(t).reduce((function(e,a){return e&&(e+="&"),"".concat(e).concat(encodeURIComponent(a),"=").concat(encodeURIComponent(t[a]))}),"");return"https://".concat(e,".wikipedia.org/w/api.php?").concat(a)}},{key:"getPagesByGeoLocation",value:function(){var e=Object(P.a)(S.a.mark((function e(t,a,n,i){var r,c,s,o;return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r={format:"json",action:"query",generator:"geosearch",ggslimit:20,ggsradius:i,ggscoord:a+"|"+n,origin:"*",prop:"extracts|pageimages|coordinates",exsentences:"10",exintro:!0,exlimit:20,pithumbsize:"400",imlimit:"10"},c=this.getWikipediaApiUrl(t,r),e.next=4,fetch(c);case 4:return s=e.sent,e.next=7,s.json();case 7:return o=e.sent,e.abrupt("return",o);case 9:case"end":return e.stop()}}),e,this)})));return function(t,a,n,i){return e.apply(this,arguments)}}()}]),e}(),V=new F,W=function(){function e(t,a){Object(N.a)(this,e),this.api=t,this.storage=a}return Object(E.a)(e,[{key:"getPagesByGeoLocation",value:function(){var e=Object(P.a)(S.a.mark((function e(t,a,n,i){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.api.getPagesByGeoLocation(t,a,n,i);case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e,this)})));return function(t,a,n,i){return e.apply(this,arguments)}}()}]),e}(),B=new W(V,window.localStorage),I=a(70),T=a.n(I),A=new(function(){function e(){Object(N.a)(this,e),this.language="en",this.loadClassifier()}return Object(E.a)(e,[{key:"setLanguage",value:function(e){this.language=e,this.loadClassifier()}},{key:"storageKey",get:function(){return"".concat(this.language,"_classifier")}},{key:"loadClassifier",value:function(){localStorage[this.storageKey]?this.classifier=T.a.fromJson(localStorage[this.storageKey]):this.classifier=T()()}},{key:"saveClassifier",value:function(){localStorage[this.storageKey]=this.classifier.toJson()}},{key:"clearClassifier",value:function(){localStorage[this.storageKey]&&localStorage.removeItem(this.storageKey),this.loadClassifier()}},{key:"add",value:function(e,t){this.classifier.learn(e,t),this.saveClassifier()}},{key:"classify",value:function(e){return this.classifier.categorize(e)}}]),e}()),J=["en","ceb","sv","de","fr","nl","ru","it","es","pl","war","vi","ja","zh","arz","ar","uk","pt","fa","ca","sr","id","no","ko","fi","hu","cs","sh","ro","zh-min-nan","tr","eu","ms","ce","eo","he","hy","bg","da","azb","sk","kk","min","hr","et","lt","be","el","simple","az","sl","gl","ur","nn","tt","hi","ka","th","uz","la","cy","ta","vo","mk","ast","lv","zh-yue","tg","bn","af","mg","oc","bs","sq","ky","nds","new","be-tarask","ml","te","br","tl","vec","pms","mr","su","ht","sw","lb","jv","pnb","ba","ga","szl","is","my","sco","fy","cv","lmo","wuu","an","pa","ne","diq","ku","yo","bar","io","gu","ckb","als","kn","scn","bpy","qu","ia","mn","bat-smg","si","nv","or","cdo","ilo","gd","xmf","yi","am","nap","bug","wa","sd","hsb","mai","fo","map-bms","mzn","li","sah","eml","os","ps","sa","frr","bcl","zh-classical","ace","mrj","mhr","avk","hif","gor","hak","roa-tara","pam","hyw","km","nso","rue","crh","se","bh","as","shn","vls","mi","nds-nl","nah","sc","vep","gan","myv","sn","ab","glk","bo","lrc","co","so","tk","fiu-vro","csb","ha","kv","ie","gv","udm","pcd","ay","kab","zea","sat","nrm","ug","lij","zu","kw","frp","lez","ban","stq","lfn","gn","mwl","gom","rm","mt","lo","lad","koi","fur","olo","ang","dty","dsb","bjn","ext","ln","cbk-zam","dv","ksh","tyv","ary","gag","pfl","pag","pi","av","awa","haw","bxr","xal","krc","pap","za","pdc","rw","kaa","szy","arc","to","nov","jam","tpi","kbp","kbd","ig","inh","na","tet","wo","tcy","ki","atj","jbo","roa-rup","bi","lbe","kg","ty","lg","mdf","fj","srn","xh","gcr","ltg","lld","chr","ak","om","sm","kl","got","pih","st","cu","ny","nqo","tn","tw","ts","rmy","bm","mnw","chy","rn","tum","ss","ch","iu","pnt","ks","ady","ve","ee","ik","ff","sg","dz","ti","cr","din","ng","cho","kj","mh","ho","ii","aa","mus","hz","kr"],L=Object(b.b)({name:"wikipedia",initialState:{edition:"en",isEnabled:!0,availableEditions:J,currentVoice:void 0,availableVoices:[],currentPageid:void 0,pages:[],pagesViewed:[],lastSearchPosition:void 0,lastSearchRadius:void 0,lastSearchTime:void 0,searchRadius:1e4,isPlaying:!1},reducers:{setEnabled:function(e,t){t.payload?e.isEnabled=!0:(e.isEnabled=!1,e.isPlaying=!1,e.currentPageid=void 0,e.pages=[])},addPages:function(e,t){var a,n=t.payload,i=n.data,r=(i=void 0===i?{}:i).query,c=(r=void 0===r?{}:r).pages,s=n.searchPosition,o=n.searchRadius,l=n.searchTime;if(c){var u=Object.keys(c).reduce((function(e,t){return e.push(c[t]),e}),[]).filter((function(t){return!e.pages.some((function(e){return t.pageid===e.pageid}))&&!e.pagesViewed.some((function(e){return t.pageid===e}))}));(a=e.pages).push.apply(a,Object(C.a)(u)),u.length&&void 0===e.currentPageid&&(e.currentPageid=u[0].pageid),e.lastSearchPosition=s,e.lastSearchRadius=o,e.lastSearchTime=l}},nextPage:function(e){for(void 0!==e.currentPageid&&(e.pages=e.pages.filter((function(t){return t.pageid!==e.currentPageid})),e.pagesViewed.push(e.currentPageid));e.pages.length>30;)e.pages.some((function(e){return"bad"===e.rating}))?function(){var t=e.pages.filter((function(e){return"bad"===e.rating})),a=Math.min.apply(Math,Object(C.a)(t.map((function(e){return e.extract.length})))),n=t.find((function(e){return e.extract.length===a}));e.pages=e.pages.filter((function(e){return e.pageid!==n.pageid}))}():function(){var t=Math.min.apply(Math,Object(C.a)(e.pages.map((function(e){return e.extract.length})))),a=e.pages.find((function(e){return e.extract.length===t}));e.pages=e.pages.filter((function(e){return e.pageid!==a.pageid}))}();var t=e.pages.filter((function(e){return"good"===e.rating})).sort((function(e,t){var a,n;return(null===t||void 0===t||null===(a=t.extract)||void 0===a?void 0:a.length)-(null===e||void 0===e||null===(n=e.extract)||void 0===n?void 0:n.length)})).find((function(t){return!e.pagesViewed.some((function(e){return t.pageid===e}))}));t?e.currentPageid=t.pageid:e.pages.length?e.currentPageid=e.pages[0].pageid:e.currentPageid=void 0},setEdition:function(e,t){var a=t.payload;e.edition=a,e.currentPageid=void 0,e.pages=[],e.pagesViewed=[],e.lastSearchPosition=void 0,e.lastSearchRadius=void 0,e.lastSearchTime=void 0},setVoice:function(e,t){var a=t.payload;e.currentVoice=a},setAvailableVoices:function(e,t){var a=t.payload;e.availableVoices=a,e.voice&&!e.availableVoices.some((function(t){return t===e.voice}))&&(e.voice=void 0)},setSearchRadius:function(e,t){e.searchRadius=parseInt(t.payload,10)},setIsPlaying:function(e,t){e.isPlaying=t.payload},updatePageRatings:function(e,t){t.payload.forEach((function(t){var a=e.pages.find((function(e){return e.pageid===t.pageid}));a.rating=t.rating,a.userRated=!!t.userRated}))}}}),q=L.actions,D=q.setEnabled,G=q.addPages,K=q.nextPage,U=q.setVoice,Q=q.setAvailableVoices,H=q.setSearchRadius,X=q.setIsPlaying,Z=q.updatePageRatings,$=function(e){return function(){var t=Object(P.a)(S.a.mark((function t(a,n){return S.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:a(L.actions.setEdition(e)),A.setLanguage(e);case 2:case"end":return t.stop()}}),t)})));return function(e,a){return t.apply(this,arguments)}}()},Y=function(e,t,a){return function(){var n=Object(P.a)(S.a.mark((function n(i,r){var c,s,o;return S.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return c=r(),s=ne(c),n.next=4,B.getPagesByGeoLocation(s,e,t,a);case 4:(o=n.sent)&&(i(G({data:o,searchPosition:[e,t],searchRadius:a,searchTime:(new Date).getTime()})),i(ee()));case 6:case"end":return n.stop()}}),n)})));return function(e,t){return n.apply(this,arguments)}}()},ee=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return function(){var t=Object(P.a)(S.a.mark((function t(a,n){var i,r,c,s;return S.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return i=n(),r=se(i),c=r.filter((function(t){return e||!t.rating})),t.next=5,Promise.all(c.map(function(){var e=Object(P.a)(S.a.mark((function e(t){var a,n;return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=Object(R.decode)(M()(t.extract)),e.next=3,A.classify(a);case 3:return n=e.sent,e.abrupt("return",{pageid:t.pageid,rating:n});case 5:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()));case 5:s=t.sent,a(Z(s));case 7:case"end":return t.stop()}}),t)})));return function(e,a){return t.apply(this,arguments)}}()},te=function(e,t){return function(){var a=Object(P.a)(S.a.mark((function a(n,i){var r,c,s,o,l,u;return S.a.wrap((function(a){for(;;)switch(a.prev=a.next){case 0:if(r=i(),c=se(r),s=c.find((function(t){return t.pageid===e}))){a.next=5;break}return a.abrupt("return");case 5:return o=Object(R.decode)(M()(s.extract)),A.add(o,t),a.next=9,A.classify(o);case 9:l=a.sent,n(Z([{userRated:!0,rating:l,pageid:e}])),u=i(),oe(u).pageid===e&&"bad"===t&&n(K()),n(ee(!0));case 15:case"end":return a.stop()}}),a)})));return function(e,t){return a.apply(this,arguments)}}()},ae=function(e){return e.wikipedia.isEnabled},ne=function(e){return e.wikipedia.edition},ie=function(e){return e.wikipedia.availableEditions},re=function(e){return e.wikipedia.currentVoice},ce=function(e){return e.wikipedia.availableVoices},se=function(e){return e.wikipedia.pages},oe=function(e){return e.wikipedia.currentPageid&&e.wikipedia.pages.find((function(t){return t.pageid===e.wikipedia.currentPageid}))},le=function(e){return e.wikipedia.searchRadius},ue=function(e){return e.wikipedia.isPlaying},de=function(e){return e.wikipedia.lastSearchPosition},pe=function(e){return e.wikipedia.lastSearchRadius},be=function(e){return e.wikipedia.lastSearchTime},ge=L.reducer,fe=a(54),je=a.n(fe),he=n.memo((function(e){var t=e.page,a=Object(l.c)(),i=Object(n.useCallback)((function(){a(te(t.pageid,"bad"))}),[a,t]),r=Object(n.useCallback)((function(){a(te(t.pageid,"good"))}),[a,t]);return Object(v.jsxs)("div",{className:je.a.main,children:[Object(v.jsx)("button",{disabled:t.userRated,className:"bad"===t.rating?je.a.currentRating:"",onClick:i,children:Object(v.jsx)(u.h,{size:"100%"})}),Object(v.jsx)("button",{disabled:t.userRated,className:"good"===t.rating?je.a.currentRating:"",onClick:r,children:Object(v.jsx)(u.i,{size:"100%"})})]})}));function ve(e){var t=e.page;return t.extract?Object(x.a)(t.extract):null}function me(e){var t,a=e.page;return(null===a||void 0===a||null===(t=a.thumbnail)||void 0===t?void 0:t.source)?Object(v.jsx)("img",{src:a.thumbnail.source,alt:a.title}):null}var Oe=n.memo((function(e){var t=e.link,a=e.page;return Object(v.jsxs)("div",{className:w.a.main,children:[Object(v.jsxs)("div",{className:w.a.title,children:[Object(v.jsx)("div",{children:Object(v.jsx)("a",{href:t,target:"_blank",rel:"noopener noreferrer",children:a.title})}),Object(v.jsx)(me,{page:a})]}),Object(v.jsx)("div",{className:w.a.text,children:Object(v.jsx)(ve,{page:a})}),Object(v.jsx)(he,{page:a})]})}));function ke(){var e=Object(l.d)(oe),t=Object(l.d)(ne);if(!e)return null;var a="https://".concat(t,".wikipedia.org/?curid=").concat(e.pageid);return Object(v.jsx)(Oe,{link:a,page:e})}var xe=a(11),ye=a(71),we=a(15),_e=a.n(we),Se=[{name:"OpenStreetMap",type:"tileServer",tileServer:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors'},{name:"Stamen toner",type:"tileServer",tileServer:"http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png",attribution:'&copy; <a target="_blank\' href="http://maps.stamen.com">Stamen</a>'},{name:"Stamen terrain",type:"tileServer",tileServer:"http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png",attribution:'&copy; <a target="_blank\' href="http://maps.stamen.com">Stamen</a>'},{name:"Stamen watercolor",type:"tileServer",tileServer:"http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png",attribution:'&copy; <a target="_blank\' href="http://maps.stamen.com">Stamen</a>'},{name:"Carto Dark",type:"tileServer",tileServer:"https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",attribution:'&copy; <a target="_blank\' href="https://carto.com">Carto</a>'},{name:"Carto (voyager)",type:"tileServer",tileServer:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",attribution:'&copy; <a target="_blank" href="https://osm.org/copyright">OpenStreetMap</a> <a target="_blank" href="https://carto.com/">Carto</a>',subdomains:"abcd"},{name:"Airspace data (OpenAIP)",type:"tileServer",tileServer:"https://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png",attribution:'"Airspace data: <a target="_blank" href="https://www.openaip.net/">OpenAIP</a>',subdomains:"12"}],Pe=Object(b.b)({name:"map",initialState:{isFollowing:!0,currentMap:"OpenStreetMap",availableMaps:Se},reducers:{setCurrentMap:function(e,t){e.currentMap=t.payload},setIsFollowing:function(e,t){e.isFollowing=t.payload}}}),Ce=Pe.actions,ze=(Ce.updateMsfs,Ce.setCurrentMap),Me=Ce.setIsFollowing,Re=function(e){return e.map.availableMaps.find((function(t){return t.name===e.map.currentMap}))},Ne=function(e){return e.map.availableMaps},Ee=function(e){return e.map.isFollowing},Fe=Pe.reducer,Ve=n.memo((function(e){var t=e.expanded,a=e.toggleExpanded,n=e.changeMap,i=e.currentMap,r=e.availableMaps,c=e.changeEdition,s=e.edition,o=e.availableEditions,l=e.changeSearchRadius,d=e.searchRadius,p=e.changeVoice,b=e.voice,g=e.availableVoices,f=e.clearTrainingData;return Object(v.jsxs)("div",{className:_e.a.main,children:[Object(v.jsxs)("button",{className:"".concat(_e.a.preferenceButton).concat(t?" ".concat(_e.a.expanded):""),onClick:a,children:[Object(v.jsx)(u.c,{size:"100%"}),Object(v.jsx)(u.b,{className:_e.a.caret})]}),t&&Object(v.jsxs)(v.Fragment,{children:[Object(v.jsxs)("div",{className:_e.a.preference,children:[Object(v.jsx)("label",{htmlFor:"mapserver",children:"Map"}),Object(v.jsx)("select",{id:"mapserver",onChange:n,value:i.name,children:r.map((function(e){var t=e.name;return Object(v.jsx)("option",{value:t,children:t},t)}))})]}),Object(v.jsxs)("div",{className:_e.a.preference,children:[Object(v.jsx)("label",{htmlFor:"wikipedia-edition",children:"Wikipedia Edition"}),Object(v.jsx)("select",{id:"wikipedia-edition",onChange:c,value:s,children:o.map((function(e){return Object(v.jsx)("option",{value:e,children:ye.a.getName(e)?"".concat(ye.a.getName(e)," (").concat(e,")"):e},e)}))})]}),Object(v.jsxs)("div",{className:_e.a.preference,children:[Object(v.jsx)("label",{htmlFor:"searchRadius",children:"Wikipedia search radius"}),Object(v.jsx)("select",{id:"searchRadius",onChange:l,value:d,children:[5e3,1e4,2e4,5e4,1e5].map((function(e){return Object(v.jsx)("option",{value:e,children:"".concat(e/1e3," km")},e)}))})]}),Object(v.jsxs)("div",{className:_e.a.preference,children:[Object(v.jsx)("label",{htmlFor:"voice",children:"Voice"}),Object(v.jsx)("select",{id:"voice",onChange:p,value:b,children:g.map((function(e){return Object(v.jsx)("option",{value:e,children:e},e)}))})]}),Object(v.jsx)("div",{className:_e.a.preference,children:Object(v.jsx)("button",{type:"button",onClick:f,children:"Clear traning data"})})]})]})}));function We(){var e=Object(l.c)(),t=Object(n.useState)(!1),a=Object(xe.a)(t,2),i=a[0],r=a[1],c=Object(l.d)(ne),s=Object(l.d)(ie),o=Object(l.d)(re),u=Object(l.d)(ce),d=Object(l.d)(Re),p=Object(l.d)(Ne),b=Object(l.d)(le);Object(n.useEffect)((function(){Object(l.b)((function(){localStorage["wikipedia-enabled"]&&e(D(JSON.parse(localStorage["wikipedia-enabled"]))),localStorage["wikipedia-edition"]&&e($(localStorage["wikipedia-edition"])),localStorage.voice&&e(U(localStorage.voice)),localStorage.currentMap&&e(ze(localStorage.currentMap)),localStorage.searchRadius&&e(H(localStorage.searchRadius))}))}),[e]);var g=Object(n.useCallback)((function(t){localStorage["wikipedia-edition"]=t.target.value,e($(t.target.value))}),[e]),f=Object(n.useCallback)((function(t){localStorage.voice=t.target.value,e(U(t.target.value))}),[e]),j=Object(n.useCallback)((function(t){localStorage.currentMap=t.target.value,e(ze(t.target.value))}),[e]),h=Object(n.useCallback)((function(t){localStorage.searchRadius=t.target.value,e(H(t.target.value))}),[e]),m=Object(n.useCallback)((function(e){r(!i)}),[i]),O=Object(n.useCallback)((function(){A.clearClassifier(),e(ee(!0))}),[e]);return Object(n.useEffect)((function(){var t=function(){var t=window.speechSynthesis.getVoices();e(Q(t.map((function(e){return e.name}))))};return t(),window.speechSynthesis.addEventListener("voiceschanged",t),function(){return window.speechSynthesis.removeEventListener("voiceschanged",t)}}),[e]),Object(v.jsx)(Ve,{expanded:i,toggleExpanded:m,changeMap:j,currentMap:d,availableMaps:p,changeEdition:g,edition:c,availableEditions:s,changeSearchRadius:h,searchRadius:b,changeVoice:f,voice:o,availableVoices:u,clearTrainingData:O})}var Be=a(96),Ie=a(16),Te=a.n(Ie),Ae=n.memo((function(e){var t=e.isFollowing,a=e.toggleFollow,n=e.isWikipediaEnabled,i=e.toggleIsEnabled,r=e.togglePlaybackState,c=e.isPlaying,s=e.next;return Object(v.jsxs)("div",{className:Te.a.main,children:[Object(v.jsx)("button",{className:"".concat(Te.a.btn," ").concat(t?Te.a.active:""),onClick:a,children:Object(v.jsx)(Be.a,{size:"100%"})}),Object(v.jsx)("button",{className:"".concat(Te.a.btn," ").concat(Te.a.gap," ").concat(n?Te.a.active:""),onClick:i,children:Object(v.jsx)(u.j,{size:"100%"})}),n&&Object(v.jsxs)(v.Fragment,{children:[Object(v.jsxs)("button",{className:"".concat(Te.a.btn," ").concat(Te.a.gap),onClick:r,children:[c&&Object(v.jsx)(u.d,{size:"100%"}),!c&&Object(v.jsx)(u.f,{size:"100%"})]}),Object(v.jsx)("button",{className:"".concat(Te.a.btn),onClick:s,children:Object(v.jsx)(u.g,{size:"100%"})})]})]})}));function Je(){var e=Object(l.c)(),t=Object(l.d)(oe),a=null!==t&&void 0!==t?t:{},i=a.rating,r=a.title,c=a.extract,s=Object(l.d)(re),o=Object(l.d)(ue),u=Object(n.useCallback)((function(){e(X(!o))}),[e,o]);Object(n.useEffect)((function(){o||speechSynthesis.cancel()}),[o]);var d=Object(n.useCallback)((function(){e(K())}),[e]);Object(n.useEffect)((function(){if(o&&r&&c&&s){if("bad"!==i){var e="".concat(r,"\n\n").concat(c?Object(R.decode)(M()(c)):""),t=new SpeechSynthesisUtterance(e);return t.voice=window.speechSynthesis.getVoices().find((function(e){return e.name===s})),t.onend=function(){d()},window.speechSynthesis.speak(t),function(){t.onend=null,speechSynthesis.cancel()}}var a=setTimeout((function(){return d()}),8e3);return function(){return clearTimeout(a)}}}),[o,i,r,c,d,s]),Object(n.useEffect)((function(){var e=function(e){"n"===e.key?d():" "===e.key&&u()};return document.addEventListener("keypress",e),function(){return document.removeEventListener("keypress",e)}}),[d,u]);var p=Object(l.d)(Ee),b=Object(n.useCallback)((function(){e(Me(!p))}),[e,p]),g=Object(l.d)(ae),f=Object(n.useCallback)((function(){localStorage["wikipedia-enabled"]=JSON.stringify(!g),e(D(!g))}),[e,g]);return Object(v.jsx)(Ae,{isFollowing:p,toggleFollow:b,isWikipediaEnabled:g,toggleIsEnabled:f,togglePlaybackState:u,isPlaying:o,next:d})}function Le(){return Object(v.jsxs)("div",{children:[Object(v.jsx)(k,{}),Object(v.jsx)(ke,{}),Object(v.jsx)(We,{}),Object(v.jsx)(Je,{})]})}var qe=a(32),De=a(91),Ge=a(51),Ke=a.n(Ge);var Ue=a(98),Qe=a(26),He=a.n(Qe);function Xe(e){var t=e.isReading,a=e.tts;return Object(v.jsxs)(v.Fragment,{children:[!t&&Object(v.jsx)(u.j,{size:32}),t&&a&&Object(v.jsx)(Ue.a,{className:He.a.speaker,size:32,stroke:"black",strokeWidth:1,color:"#FFF"}),t&&!a&&Object(v.jsx)(u.a,{className:He.a.speaker,size:30})]})}var Ze=n.memo((function(e){var t,a=e.page,n=e.isCurrentPage,i=e.isPlaying,r=a.pageid,c=a.rating,s=a.coordinates,o=He.a.marker;return n&&(o+=" ".concat(He.a.current)),"bad"===c&&(o+=" ".concat(He.a.ratedBad)),null!==(t=null===s||void 0===s?void 0:s.map((function(e,t){return Object(v.jsx)(Ke.a,{position:e,icon:Object(v.jsx)("div",{className:He.a.container,children:Object(v.jsx)("div",{className:o,children:Object(v.jsx)(Xe,{isReading:i&&n,tts:"good"===c})})})},"".concat(r,"-").concat(t))})))&&void 0!==t?t:null}));function $e(){var e=Object(l.d)(se),t=Object(l.d)(oe),a=Object(l.d)(ue);return function(e,t){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1e4,i=Object(l.c)(),r=Object(l.d)(ae),c=Object(l.d)(de),s=Object(l.d)(pe),o=Object(l.d)(be);Object(n.useEffect)((function(){if(e&&r){var n=(null===e||void 0===e?void 0:e[0])!==(null===c||void 0===c?void 0:c[0])||(null===e||void 0===e?void 0:e[1])!==(null===c||void 0===c?void 0:c[1]),l=t!==s,u=(new Date).getTime()-o;(n&&u>a||l)&&i(Y(e[0],e[1],t))}}),[i,r,e,c,t,s,o,a])}(Object(l.d)(j).position,Object(l.d)(le)),null===e||void 0===e?void 0:e.map((function(e){return Object(v.jsx)(Ze,{page:e,isCurrentPage:e.pageid===(null===t||void 0===t?void 0:t.pageid),isPlaying:a},e.pageid)}))}var Ye=a(99),et=a.n(Ye),tt=a(93),at=a(100),nt=n.memo((function(e){var t=e.currentMap,a='&copy; <a target="_blank" href="https://en.wikipedia.org">Wikipedia</a>, '+"".concat(t.attribution,", ")+'&copy; <a target="_blank" href="https://react-leaflet.js.org/">react-leaflet</a>, '+'<a target="_blank" href="https://github.com/kivle/msfs-map">MSFS-map</a> v'.concat(at.a),n=null,i=t.subdomains?{subdomains:t.subdomains}:{};return"tileServer"===t.type&&(n=Object(v.jsx)(tt.a,Object(o.a)({attribution:a,url:t.tileServer},i),t.tileServer)),n}));function it(){var e=Object(qe.a)(),t=Object(l.d)(j),a=t.position,i=t.heading,r=Object(l.d)(Re),c=Object(l.d)(le),s=Object(l.d)(Ee),o=Object(l.d)(ae);Object(n.useEffect)((function(){s&&a&&e.setView(a,e.getZoom(),{animate:!0})}),[e,s,a]);var d=Object(v.jsx)("div",{className:et.a.plane,style:{transform:"rotate(".concat(i-90,"deg)")},children:Object(v.jsx)(u.e,{size:32,stroke:"white",strokeWidth:"40",fill:"#44F"})});return Object(v.jsxs)(v.Fragment,{children:[Object(v.jsx)(nt,{currentMap:r}),o&&Object(v.jsx)($e,{}),a&&o&&Object(v.jsx)(De.a,{center:a,radius:c,color:"blue",fill:!1}),a&&Object(v.jsx)(Ke.a,{position:a,icon:d})]})}function rt(){return Object(v.jsxs)(v.Fragment,{children:[Object(v.jsx)(Le,{}),Object(v.jsx)(s.a,{center:[51.505,-.09],zoom:13,children:Object(v.jsx)(it,{})})]})}a(185);var ct=function(){return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"ws://localhost:9000/ws",t=Object(l.c)();Object(n.useEffect)((function(){var a=void 0,n=!1,i=void 0;return function r(){(a=new WebSocket(e)).onmessage=function(e){var a=JSON.parse(e.data);a.latitude>=0&&a.latitude<.015&&a.longitude>=0&&a.longitude<.015||t(f(a))},a.onerror=function(e){console.debug(e)},a.onclose=function(e){n||(i=setTimeout(r,2e3))}}(),function(){try{clearTimeout(i),n=!0,a.close(),a=void 0}catch(e){}}}),[t,e])}(),Object(v.jsx)("div",{className:"App",children:Object(v.jsx)(rt,{})})},st=Object(b.a)({reducer:{map:Fe,simdata:h,wikipedia:ge}});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(186),a(4);window._store=st,c.a.render(Object(v.jsx)(i.a.StrictMode,{children:Object(v.jsx)(l.a,{store:st,children:Object(v.jsx)(ct,{})})}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},26:function(e,t,a){e.exports={container:"WikipediaMarker_container__3Rt_r",marker:"WikipediaMarker_marker__5fM6z",ratedBad:"WikipediaMarker_ratedBad__36bmw",current:"WikipediaMarker_current__sVu6_",speaker:"WikipediaMarker_speaker__DnvOa",pulse:"WikipediaMarker_pulse__1k_If"}},53:function(e,t,a){e.exports={main:"Wikipedia_main__4NWFl",title:"Wikipedia_title__QXPcz",text:"Wikipedia_text__1Xntm"}},54:function(e,t,a){e.exports={main:"RateArticle_main__15vGb",currentRating:"RateArticle_currentRating__Jxuyb"}},69:function(e,t,a){e.exports={main:"PlaneInfo_main__9z7SN",infoField:"PlaneInfo_infoField__3d4Nw"}},99:function(e,t,a){e.exports={plane:"MapContent_plane__1IguB"}}},[[187,1,2]]]);
//# sourceMappingURL=main.e975ad51.chunk.js.map