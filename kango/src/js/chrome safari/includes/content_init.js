function runContentScripts(n){var t=window==window.top;kango.invokeAsync("modules/kango/userscript_engine/getScripts",window.document.URL,n,t,function(t){object.forEach(t,function(t,o){kango.lang.evalScriptsInSandbox(window,t,o+"-"+n)})})}window.addEventListener("DOMContentLoaded",function(){apiReady.on(function(){runContentScripts("document-end")})},!1),apiReady.on(function(){runContentScripts("document-start")}),initApi();