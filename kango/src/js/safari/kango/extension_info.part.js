var getExtensionInfo=function(){var e=new XMLHttpRequest;return e.open("GET",safari.extension.baseURI+"extension_info.json",!1),e.overrideMimeType("text/plain"),e.send(null),JSON.parse(e.responseText)};module.exports=new ExtensionInfo(getExtensionInfo());