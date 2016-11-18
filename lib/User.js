"use strict";

/**
* user
*/
var hp = require("./helper.js"),
	MsgObj = require("./MsgObj.js");


function User(uid,conn){
	this.init(uid,conn);
}
User.prototype={
	"constructor":User
	,"init":function(uid,conn){
		console.log(this+".init("+uid+","+conn+")");
		this.uid = uid;
		this.nick = uid;
		this.conn = conn; //web-socket connection
		this.room = null; //현재 방문중인 방(밖으로 나와도 robby이므로 입장 후 다시는 null이 되지는 않는다.)


		//--- UID 설정, 최초 한번만
		var mo = new MsgObj();
		mo.cmd = "uid";
		mo.val = uid;
		this.send(mo);

	}
	,"info":function(){ //외부에 보여주기 위한 정보
		return {"nick":this.nick,"uid":this.uid};
	}
	,"join":function(room){
		console.log(this+".join("+room+")");
		this.room = room;
	}
	,"send":function(mo){
		console.log(this+".send("+mo+")");
		if(mo instanceof String){ //JSON 문자열
			console.error("이 부분이 있으면 안된다.");
		}else{
			mo = mo.toJson();
			//mo = JSON.stringify(mo)
		}
		return this.conn.sendText(mo);
	}
	,"sendPrivate":function(mo){
		mo.private = "1";

		return this.send(mo);
	}
	,"toString":function(){
		return "{"+this.constructor.name+"["+this.uid+"]"+this.nick+"}";
	}
}

module.exports = User;