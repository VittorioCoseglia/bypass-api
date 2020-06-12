const n = require("needle");
const h = require("http");
const u = require("url");
const ue = require("expand-url");
const fD = require('form-data');
const c = require('cheerio');
console.log("STARTING SERVER...");
h.createServer(onRequest).listen(3000);
console.log("STARTED!")

function onRequest(request,res) {
	var ul = u.parse(request.url,true);
	var l = ul.query.url;
	
	
	if (!l) {
		var d = JSON.stringify({
			"err":"noUrlFound",
			"version":"1.0"
		})
		res.writeHead(404, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*"
		});
		res.end(d);
	} else if (l.includes("bit.ly") | l.includes("goo.gl")) {
		ue.expand(l, function (err, longUrl) {
			if (longUrl && !err) {
				var d = JSON.stringify({
					"link":longUrl,
					"resolvedUsing":"expand-url"
				})
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				res.end(d);
			} else {
				n("https://apimon.de/redirect/" + l, function (error, response) {
					var j = response.body;
					if (j.valid == true) {
						var d = JSON.stringify({
							"link":j.destination,
							"reslovedUsing":"apimon-fallback"
						})
						res.writeHead(200, {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*"
						});
					} else {
						var d = JSON.stringify({
							"err":"noLink"
						})
						res.writeHead(404, {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*"
						});
						res.end(d);
					}
				})
			}
		})
	} else if (l.includes("ouo.io") | l.includes("ouo.press")) {
		n(l, function(error, response) {
			var h = response.body;
			res.writeHead(200, {
				"Access-Control-Allow-Origin": "*"
			})
			res.end(h);
			var $ = c.load(h);
			$('input').each(function () {
				var a = $(this)
				if (a.attr('name') == "_token") {
					var k = a.val()
					
					var hdrs = {
						"Host": "www.google.com",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0",
						"Accept": "*/*",
						"Accept-Language": "en-US,en;q=0.5",
						"Accept-Encoding": "gzip, deflate, br",
						"Content-Type": "application/x-protobuffer",
						"Content-Length": "4378",
						"Origin": "https://www.google.com",
						"Connection": "keep-alive",
						"DNT": "1",
						"TE": "Trailers"
					}
					n.post("https://www.google.com/recaptcha/api2/reload?k=6Lcr1ncUAAAAAH3cghg6cOTPGARa8adOf-y9zv2x", hdrs, function (error, response) {
						
					})
				}
			})
			
		})
	} else {
		n("https://apimon.de/redirect/" + l, function (error, response) {
			var j = response.body;
			if (j.valid == true) {
				var d = JSON.stringify({
					"link":j.destination,
					"resolvedUsing":"apimon-generic"
				})
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				res.end(d);
			}
		})
	}
}