/*! modernizr 3.5.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-addtest-domprefixes-teststyles !*/
!function(e,n,t){function o(e,n){return typeof e===n}function s(){var e,n,t,s,i,a,r;for(var l in d)if(d.hasOwnProperty(l)){if(e=[],n=d[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(s=o(n.fn,"function")?n.fn():n.fn,i=0;i<e.length;i++)a=e[i],r=a.split("."),1===r.length?Modernizr[r[0]]=s:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=s),c.push((s?"":"no-")+r.join("-"))}}function i(e){var n=v.className,t=Modernizr._config.classPrefix||"";if(m&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(o,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),m?v.className.baseVal=n:v.className=n)}function a(e,n){if("object"==typeof e)for(var t in e)g(e,t)&&a(t,e[t]);else{e=e.toLowerCase();var o=e.split("."),s=Modernizr[o[0]];if(2==o.length&&(s=s[o[1]]),"undefined"!=typeof s)return Modernizr;n="function"==typeof n?n():n,1==o.length?Modernizr[o[0]]=n:(!Modernizr[o[0]]||Modernizr[o[0]]instanceof Boolean||(Modernizr[o[0]]=new Boolean(Modernizr[o[0]])),Modernizr[o[0]][o[1]]=n),i([(n&&0!=n?"":"no-")+o.join("-")]),Modernizr._trigger(e,n)}return Modernizr}function r(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):m?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function l(){var e=n.body;return e||(e=r(m?"svg":"body"),e.fake=!0),e}function f(e,t,o,s){var i,a,f,d,u="modernizr",c=r("div"),p=l();if(parseInt(o,10))for(;o--;)f=r("div"),f.id=s?s[o]:u+(o+1),c.appendChild(f);return i=r("style"),i.type="text/css",i.id="s"+u,(p.fake?p:c).appendChild(i),p.appendChild(c),i.styleSheet?i.styleSheet.cssText=e:i.appendChild(n.createTextNode(e)),c.id=u,p.fake&&(p.style.background="",p.style.overflow="hidden",d=v.style.overflow,v.style.overflow="hidden",v.appendChild(p)),a=t(c,e),p.fake?(p.parentNode.removeChild(p),v.style.overflow=d,v.offsetHeight):c.parentNode.removeChild(c),!!a}var d=[],u={_version:"3.5.0",_config:{classPrefix:"",enableClasses:0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){d.push({name:e,fn:n,options:t})},addAsyncTest:function(e){d.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=u,Modernizr=new Modernizr;var c=[],p="Moz O ms Webkit",h=u._config.usePrefixes?p.toLowerCase().split(" "):[];u._domPrefixes=h;var g;!function(){var e={}.hasOwnProperty;g=o(e,"undefined")||o(e.call,"undefined")?function(e,n){return n in e&&o(e.constructor.prototype[n],"undefined")}:function(n,t){return e.call(n,t)}}();var v=n.documentElement,m="svg"===v.nodeName.toLowerCase();u._l={},u.on=function(e,n){this._l[e]||(this._l[e]=[]),this._l[e].push(n),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},u._trigger=function(e,n){if(this._l[e]){var t=this._l[e];setTimeout(function(){var e,o;for(e=0;e<t.length;e++)(o=t[e])(n)},0),delete this._l[e]}},Modernizr._q.push(function(){u.addTest=a});u.testStyles=f;s(),delete u.addTest,delete u.addAsyncTest;for(var y=0;y<Modernizr._q.length;y++)Modernizr._q[y]();e.Modernizr=Modernizr}(window,document);

// Custom RTC Fullscreen API Test
Modernizr.addTest("fullscreen", function() {
	var l = ["CancelFullScreen", "ExitFullScreen", "CancelFullscreen", "ExitFullscreen"],
        p = Modernizr._domPrefixes;

	for (var i = 0; i < l.length; i++) {
		if (!!document[l[i].replace(/^[A-Z]/, function(m) { return m.toLowerCase() })]) {
			return true;
		}

		for (var n = 0; n < p.length; n++) {
			if (!!document[p[n] + l[i]]) {
				return true;
			}
		}
	}

	return false;
});
