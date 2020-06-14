const n = require("needle");
const h = require("http");
const u = require("url");
const ue = require("expand-url");
const fD = require('form-data');
const c = require('cheerio');
console.log("STARTING SERVER...");
h.createServer(onRequest).listen(process.env.PORT || 3000);
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
		})
	} else if (l.includes("ouo.io") | l.includes("ouo.press")) {
		//not completed
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
	} else if (l.includes("linkvertise.com") | l.includes("linkvertise.net") | l.includes("direct-link.net") | l.includes("file-link.net") | l.includes("up-to-down.net") | l.includes("link-to.net")) {
		let k = {timestamp:new Date().getTime(),random:"375123"}
			console.log(" - linkvertise script - ")
			var ur = u.parse(l,true);
			var p = ur.pathname;
			var a = "https://linkvertise.net/api/v1/redirect/link/static" + p;
			console.log("-> sending 1st request");
			n(a, function(error, response) {
				console.log("-> 1st response recieved")
				var r = response.body;
				k.link_id = r.data.link.id;
				var hdrs = {
					"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
					"Accept-Encoding":"gzip, deflate, br",
					"Accept-Language":"en-US,en;q=0.5",
					"Connection":"keep-alive",
					"DNT":"1",
					"Host":"linkvertise.net",
					"Upgrade-Insecure-Requests":"1",
					"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0"
				}
				var b = "https://linkvertise.net/api/v1/redirect/link" + p + "/target?serial=" + Buffer.from(JSON.stringify(k)).toString("base64");
				console.log(b);
				n("post", b, hdrs, function (error, response) {
					console.log("-> got second response");
					var r = response.body;
					if (r.data) {
						console.log("-> scraped destination, sent ")
						var d = JSON.stringify({
							"link":r.data.target,
							"resolvedUsing":"linkvertise-script"
						})
						res.end(d)
						console.log("-> sent server response");
					} else {
						res.end(r)
						console.log("-> sent server response");
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


function gbVar(oUrl) {
	n("https://apimon.de/redirect/" + oUrl, function (error, response) {
		var j = response.body;
		if (j.valid == true) {
			return j.destination;
		}
	})
}