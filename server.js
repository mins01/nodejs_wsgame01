"use strict";

var ws = require("./node_modules/nodejs-websocket");
var Chat = require("./lib/Chat.js");
var hp = require("./lib/helper.js");

//hp.disableLog(); //콘솔 로그 사용중지
//hp.enableLog(); //콜솔 로그 사용

var nowebserver = true;
var webport = 8080;
var port = 8081; //서버포트

var argv = process.argv;
for(var i=0,m=argv.length;i<m;i++){
	var arg = argv[i];
	arg = arg.toLowerCase();
	if(arg=='--nowebserver'){
		nowebserver = false;

	}else if(arg=='--webport' && argv[i+1] && !isNaN(argv[i+1])){
		webport = argv[i+1];
		i++;
	}else if(arg=='--port' && argv[i+1] && !isNaN(argv[i+1])){
		port = argv[i+1];
		i++;
	}

}

console.log("nowebserver : "+(nowebserver?"1":"0"));
console.log("webport : "+webport);
console.log("port : "+port);



/*테스트 클라이언트용 웹서버 */
if(nowebserver){
	console.log("@webserver : start");
	var http = require("http");
	var fs = require("fs");
	var url = require('url');
	http.createServer(function (req, res) {

		var requrlobj = url.parse(req.url);
		var requrl = requrlobj.pathname
		if(!requrl || requrl=='/'){
			requrl = "/client.html";
		}
		requrl = "."+requrl;	
		if(fs.existsSync(requrl)){
			console.log(req.connection.remoteAddress +":"+requrl+":OK");
			if(requrl.indexOf(".js")>-1){
				res.writeHead(200, {'Content-Type' : 'text/javascript'});
			}else if(requrl.indexOf(".css")>-1){
				res.writeHead(200, {'Content-Type' : 'text/css'});
			}else{
				res.writeHead(200, {'Content-Type' : 'text/html'});
			}
			fs.createReadStream(requrl).pipe(res)
		}else{
			console.log(req.connection.remoteAddress +":"+requrl+":FAIL");
			res.writeHead(404, {'Content-Type' : 'text/plain'});
			res.write('Hello World');
			res.end();
		}
	}).listen(parseInt(webport));
}

/* 게임 서버 */
console.log("@server : start");
var chat = new Chat();
var server = ws.createServer(function(chat){
		return function (conn) {
			console.log("New connection")
			chat.addConn(conn);
		}
	}(chat));
chat.server(server);

server.listen(parseInt(port)); //포트 연결

