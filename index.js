const n = require("needle");
const h = require("http");
const u = require("url");
const ue = require("expand-url");
console.log("")
h.createServer(onRequest).listen(3000);

function onRequest(request,response) {
	var ul = u.parse(request.url,true);
	var l = ul.query.url;
	
	
	if (!l) {
		var d = JSON.stringify({
			"err":"noUrlFound",
			"version":"1.0"
		})
		response.writeHead(404, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*"
		});
		response.end(d);
	} else if (l.includes("goo.gl")){
		ue.expand(l, function (err, longUrl) {
			var d = JSON.stringify({
				"link":longUrl
			})
			response.writeHead(404, {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*"
			});
			response.end(d);
		})
	}
}