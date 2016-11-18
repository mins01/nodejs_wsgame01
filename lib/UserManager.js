"use strict";

var hp = require("./helper.js"),
	MsgObj = require("./MsgObj.js");

function UserManager(room){
	this.init(room);
}
UserManager.prototype={
	"constructor":UserManager
	,"allUsers":{} //방문자 전체 유저
	,"init":function(room){
		console.log(this+".init("+room+")");
		this.room = room;
		this.users = {};
	}
	,"toString":function(){
		return "{"+this.constructor.name+"}";
	}
	,"has":function(user){
		return !!(this.users[user.uid]);
	}
	,"nick":function(user,nick){ //Chat에 붙어있는 곳에서만 사용, Room일 경우, Room안의 사람만 체크함
		console.log(this+".nick("+user+","+nick+")");
		var nick = nick.trim();
		if(nick==''){
			var mo = new MsgObj();
			mo.cmd = "notice";
			mo.val = "당신에 닉네임은 "+user.nick+"입니다.";
			user.send(mo);
			return false;
		}
		if(user.nick == nick){
			var mo = new MsgObj();
			mo.cmd = "error";
			mo.val = "당신은 이미 같은 닉네임을 사용중입니다.";
			user.send(mo);
			return false;
		}
		if(this.hasNick(nick)){
			var mo = new MsgObj();
			mo.cmd = "error";
			mo.val = nick+"는 이미 사용중인 닉네임입니다.";
			user.send(mo);
			return false;
		}
		if(nick.length<4){
			var mo = new MsgObj();
			mo.cmd = "error";
			mo.val = "닉네임이 너무 짧습니다.(4자 이상)";
			user.send(mo);
			return false;
		}
		var oldNick = user.nick;
		user.nick = nick;
		var mo = new MsgObj();
		mo.cmd = "notice";
		mo.val = oldNick+"님이 "+nick+"님으로 닉네임을 변경하셨습니다.";
		user.room.broadcast(mo);

		var mo = new MsgObj();
		mo['cmd'] = "users";
		mo['users'] = "sync"; //사용자 정보 갱신
		mo['val'] = {};
		mo['val'][user.uid] = user.info();
		user.room.broadcast(mo);
		return false;
	}
	,"count":function(){
		return Object.keys(this.users).length
	}
	,"list":function(){
		var rarr = {};
		for(var x in this.users){
			var user = this.users[x];
			rarr[user.uid] = user.info();
		}
		return rarr;
	}
	,"hasNick":function(nick){
		for(var x in this.allUsers){
			if(this.allUsers[x].nick == nick){
				return true;
			}
		}
		return false;
	}

	,"remove4AllUsers":function(user){
		console.log(this+".remove4AllUsers("+user+")");
		if(!this.allUsers[user.uid]){
			return false;
		}
		delete this.allUsers[user.uid];
		return true;
	}
	,"add4AllUsers":function(user){
		console.log(this+".add4AllUsers("+user+")");
		if(this.allUsers[user.uid]){
			return false;
		}
		this.allUsers[user.uid] = user;
		
		//--- 탈출에 대한 이벤트 등록
		//var that = this;
		user.conn.once("close", function (code, reason) {
			console.log("방 나갔다 전체유저 추적! "+this.user.room+","+this.user);
			this.user.room.out(this.user); //방에서 out을 호출한다.
			this.user.room.um.remove4AllUsers(this.user); //전체 유저용
		}
		);
	}
	,"onadd":function(user){
	}
	,"add":function(user){
		this.add4AllUsers(user);
		console.log(this+".add("+user+")");
		if(this.users[user.uid]){
			return false;
		}
		this.users[user.uid] = user;
		this.onadd(user);

		return true;
	}
	,"onremove":function(user){
		var mo = new MsgObj();
		mo['cmd'] = "users";
		mo['users'] = "remove"; //사용자 삭제 싱크
		mo['val'] = {};
		mo['val'][user.uid] = {};
		user.room.broadcast(mo);
	}
	,"remove":function(user){
		console.log(this+".onremove("+user+")");
		if(!this.users[user.uid]){
			return false;
		}
		delete this.users[user.uid];
		this.onremove(user);
		return true;
	}
	,"broadcast":function(mo){
		for(var x in this.users){
			this.users[x].send(mo);
		}
	}
}

module.exports = UserManager;