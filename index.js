const h = require("http");
const u = require("url");
const cheerio = require('cheerio');
const g = require('got');
console.log("STARTING SERVER...");
h.createServer(onRequest).listen(process.env.PORT || 3002);
console.log("STARTED!");

function onRequest(request,res) {
	var ul = u.parse(request.url, true);
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
		g("https://apimon.de/redirect/" + l).then(function(response) {
			var j = JSON.parse(response.body);
			if (j.valid == true) {
				var d = JSON.stringify({
					"link":j.destination,
					"resolvedUsing":"apimon-bitly"
				})
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				res.end(d);				
			}
		})
	} else if (l.includes("linkvertise.com") | l.includes("linkvertise.net") | l.includes("direct-link.net") | l.includes("file-link.net") | l.includes("up-to-down.net") | l.includes("link-to.net")) {
		if (!l.includes("linkvertise")) {
			g("https://apimon.de/redirect/" + l).then(function(response) {
				var j = JSON.parse(response.body);
				var l = j.destination;
			})
		}
		var options = { headers: {
			"Accept":"*/*",
			"Accept-Encoding":"gzip, deflate, br",
			"Accept-Language":"en-US,en;q=0.5",
			"Connection":"keep-alive",
			"DNT":"1",
			"Host":"linkvertise.net",
			"Upgrade-Insecure-Requests":"1",
			"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0"
		}}
		let k = {timestamp:new Date().getTime(),random:"6548307"}
		var ur = u.parse(l,true);
		var p = ur.pathname;
		var a = "https://linkvertise.net/api/v1/redirect/link/static" + p;
		g(a, options).then(function (response) {
			if (response.body.substring(0,1) == "<") {
				var d = JSON.stringify({
					"err": "couldNotResolve"
				})
				res.writeHead(404, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				res.end(d);
				return;
			}
			var r = JSON.parse(response.body);
			k.link_id = r.data.link.id;
			var b = "https://linkvertise.net/api/v1/redirect/link" + p + "/target?serial=" + Buffer.from(JSON.stringify(k)).toString("base64");
			g(b, options).then(function(response) {
				var r = JSON.parse(response.body);
				if (!r.data.target.includes("https://lv-download.de")) {
					var link = decodeURIComponent(r.data.target.split("&k=")[1].split("&subid=")[0])
				} else {
					var link = r.data.target;
				}
				var d = JSON.stringify({
					"link":link,
					"resolvedUsing":"linkvertise-resolver"
				})
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				res.end(d)
			})
		})
	} else if (l.includes("boost.ink")) {
		var options = {headers:{
			"Accept":"*/*",
			"Accept-Encoding":"gzip, deflate, br",
			"Accept-Language":"en-US,en;q=0.5",
			"Connection":"keep-alive",
			"DNT":"1",
			"Upgrade-Insecure-Requests":"1",
			"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0"
		}}
		g(l).then(function(response) {
			var $ = cheerio.load(response.body);
			for (var c in $("script")) {
				if ($("script")[c].attribs) {
					var d = $("script")[c].attribs.version
					if ($("script")[c].attribs.version) {
						var link = Buffer.from(d, "base64")
						var dc = link.toString('utf8');
						var d = JSON.stringify({
							"link":dc,
							"resolvedUsing":"boost-resolver"
						})
						res.writeHead(200, {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*"
						});
						res.end(d);
					}
				}
			}
		})
	} else {
		g("https://apimon.de/redirect/" + l).then(function(response) {
			var j = JSON.parse(response.body);
			if (j.valid == true) {
				var d = JSON.stringify({
					"link":j.destination,
					"resolvedUsing":"apimon-unk"
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