"use strict";
/**
* echo 임의사용금지
* echo 제작자 : 공대여자
*/
var hp = require("./helper.js"),
	MsgObj = require("./MsgObj.js"),
	RoomManager = require("./RoomManager.js"),
	UserManager = require("./UserManager.js"),
	User = require("./User.js");



function Chat(){
	this.init();
}
//var x = new Chat();


Chat.prototype = {
	 "constructor":Chat
	,"init":function(){
		console.log(this.constructor.name);
		console.log(this+".init()");
		this._conn = null;
		this.userCounter = 1000000;
		this._server = null;
		this.roomManager = null;
		this.rm = null;
		this.um = null;

		//--- 모든 사람 관리용
		//this.um = new UserManager(null);
		
		this.rm = new RoomManager();
		var r = this.rm.create("robby","로비","robby");
		r.userLimit(999);
		this.rm.createAutoRid("게임룸1");
		this.rm.createAutoRid("게임룸방2");
		

	}
	,"toString":function(){
		return "{"+this.constructor.name+"}";
	}
	/**
	* 새로운 접속자
	*/
	,"addConn":function(conn){
		console.log();
		console.log(this+".addConn() "+conn.socket.remoteAddress+":"+conn.socket.remotePort);
		var that = this;

		this.userCounter = this.userCounter % 1000000;
		var uid = (Math.round((new Date).getTime()/1000)%10000).toString() + this.userCounter.toString();
		this.userCounter++;
		var user = new User(uid,conn);
		conn.user = user;
		
		// 이벤트 등록
		conn.on("text", function (str) {
			that.ontext(this,str);
		});
		/*-- 동작안함, 이미 커넥션 된 conn을 받기 때문에 밑의 server부분 이벤트쪽을 제어
		conn.on("connect", function () {
			that.onconnect(this);
		})
		*/
		conn.once("close", function (code, reason) {
			that.onclose(this,code, reason);
		});
		conn.on("error", function (err) {
			that.onerror(this,err);
		});
		/*
		conn.on("binary", function (inStream) {
			console.log("@conn stat : binary");
			console.log(inStream);
			that.onbinary(this,inStream);
		});
		*/

		//-- 전체 유저에 등록
		//this.um.add(user);
		//-- 방에 참여
		this.rm.join(user,"robby");
	}
	/**
	* 서버설정
	*/
	,"server":function(server){
		this._server = server;
		if(server){
			this._server = server;
			this._initServer();
		}
		return this._server;
	}
	/**
	* 서버설정 (이벤트 제어)
	*/
	,"_initServer":function(){
		var server = this._server
		var that = this;
		server.on("listening", function () {
			console.info("@server stat : listening");
		});
		server.once("close", function () {
			console.info("@server stat : close");
		});
		server.on("error", function (errObj) {
			console.info("@server stat : error");
			console.info(errObj);
		});
		server.on("connection", function (conn) {
			that.onconnect(conn);
		});
	}
	//--- 이벤트에 따른 반응
	,"ontext":function(conn,str){
		console.log(this+".ontext("+conn.user.nick+","+str+")");
		var req = JSON.parse(str);
		this.reqHandler(conn.user,req)
	}
	,"onconnect":function(conn){
		console.log(this+".onconnect("+conn.user+")");
	}
	,"onclose":function(conn, code, reason){
		console.log(this+".onclose("+conn.user+","+code+","+reason+")" );
	}
	,"onerror":function(conn,str){
		console.log(this+".error() ["+conn.user+"] "+str);
	}
	/**
	* 요청 핸들러
	*/
	,"reqHandler":function(user,req){
		console.log(this+".reqHandler("+user+","+req+")");
		//console.log(req);
		if(req.val == undefined){ req.val = "";}
		switch(req.cmd){
			case "msg": //일반 메세지
				if(req.val.length>200){
					var mo = new MsgObj();
					mo.cmd = "error";
					mo.val = "비정상적인 요청 입니다.";
					user.send(mo);
					return false;
				}
				var mo = new MsgObj();
				mo['cmd'] = req.cmd;
				mo['nick'] = user.nick;
				mo['val'] = req.val;
				user.room.broadcast(mo);
				break;
			case "nick": //닉네임변경
				user.room.um.nick(user,req.val);
				break;
			case "room": //room 메세지
				this.rm.reqHandler(user,req);
				break;
			case "game": //게임 메세지
				//console.log(user.room);
				if(user.room.game){
					user.room.game.reqHandler(user,req);
				}else{
					var mo = new MsgObj();
					mo['cmd'] = "notice";
					mo['val'] = "게임이 없습니다.";
					user.room.broadcast(mo);
				}
				break;
		}
		return true;
	}

};

module.exports = Chat;


