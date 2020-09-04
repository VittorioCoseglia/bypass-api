const h = require("http");
const u = require("url");
const g = require('got');
const cheerio = require('cheerio');
h.createServer(onRequest).listen(process.env.PORT || 3002);

function onRequest(req, res) {
    var ul = u.parse(req.url, true);
    var path = Buffer.from(ul.pathname.split("/").slice(1)[0], "base64").toString();
    var l = u.parse(path, true);
    if (path == "") {
        var d = JSON.stringify({
			"err":"noUrlFound",
			"version":"1.0"
		})
		res.writeHead(404, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*"
		});
		res.end(d);
    } else if (l.hostname == "linkvertise.net" | l.hostname == "linkvertise.com") {
        if (!l.hostname.includes("linkvertise")) {
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
    } else if (l.hostname == "boost.ink" | l.hostname == "bst.gg" | l.hostname == "booo.st") {
        var options = {headers:{
			"Accept":"*/*",
			"Accept-Encoding":"gzip, deflate, br",
			"Accept-Language":"en-US,en;q=0.5",
			"Connection":"keep-alive",
			"DNT":"1",
			"Upgrade-Insecure-Requests":"1",
			"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0"
		}}
		g(path).then(function(response) {
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
    } else if (l.hostname == "www.shortly.xyz") { 
		g(path).then(function(response) {
			var $ = cheerio.load(response.body)
			var input = "id=" + $("body form input").attr("value");
			g.post("https://www.shortly.xyz/getlink.php", {
				body: input,
				headers: {
					"Host": "www.shortly.xyz",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0",
					"Accept": "*/*",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					"X-Requested-With": "XMLHttpRequest",
					"Content-Length": byteCount(input),
					"Origin": "https://www.shortly.xyz",
					"Connection": "keep-alive",
					"Referer": "https://www.shortly.xyz",
					"DNT": "1"
				}
			}).then(function(response){ 
				var d = JSON.stringify({
					"link": response.body,
					"resolvedUsing": "shortlyResolver"
				});
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				res.end(d);
			})
		})
	} else {
        var p = "https://apimon.de/redirect/" + path
        g(p).then(function (response) {
            var b = JSON.parse(response.body);
            if (b.valid == true) {
                var d = JSON.stringify({
                    "link": b.destination,
                    "resolvedUsing": "generic-apimon"
                })
            }
        })
    }
}

function byteCount(s) {
	return encodeURI(s).split(/%..|./).length - 1;
}