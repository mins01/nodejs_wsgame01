"use strict";
/**
* ROOM
* 동작 플로우 join -> out
*/
var hp = require("./helper.js"),
	MsgObj = require("./MsgObj.js"),
	UserManager = require("./UserManager.js"),
	GameOthelloServer = require("../gameOthello/GameOthelloServer.js"),
	GameOthelloServerControl = require("../gameOthello/GameOthelloServerControl.js");


function Room(rid,subject,type){
	this.init(rid,subject,type);
}
Room.prototype={
	 "constructor":Room
	,"name":"Room"
	,"init":function(rid,subject,type){
		console.log(this+".init("+rid+","+subject+","+type+")");
		if(!type) type = "game";
		var that = this;
		this.rid = rid;
		this.subject = subject;
		this.type = type;
		this._userLimit = 10; //입장자 수 제한
		
		this.um = new UserManager(this);
		if(type=="game"){ //게임룸일때
			this.game = new GameOthelloServerControl(this,new GameOthelloServer());
			this.game.start();
		}
	}
	,"toString":function(){
		return "{"+this.constructor.name+"["+this.rid+"]"+this.subject+"}";
	}
	,"userLimit":function(userLimit){
		
		if(userLimit == undefined){
			
		}else if(isNaN(userLimit)){
			return false;
		}else{
			console.log(this+".userLimit("+userLimit+")");
			this._userLimit =  userLimit;
		}
		return this._userLimit;
	}
	,"userCount":function(){
		return this.um.count();
	}
	,"info":function(){
		return {"rid":this.rid,"subject":this.subject
		,"type":this.type
		,"userCount":this.userCount()
		,"userLimit":this.userLimit()
		}
	}
	,"join":function(user){
		console.log(this+".join("+user+")");
		if(this.um.has(user)){
			console.log("ROOM : join : 이미 참여한 방");
			return false;//;
		}
		if(this.um.count() >= this.limit){
			var mo = new MsgObj();
			mo.cmd = "error";
			mo.val = "입장자 수 제한으로인해서 입장하실 수 없습니다. ("+this.userLimit+")";
			user.send(mo);
			return false;
		}


		//--- 방 참여자 정보. 새로 참여한 사람에게만
		var userlist = this.um.list();
		var mo = new MsgObj();
		mo['cmd'] = "users";
		mo['users'] = "list";
		mo['val'] = userlist;
		user.send(mo);

		console.log("ROOM : join : rid=" + this.rid + "&uid="+user.uid);
		this.um.add(user);
		user.join(this);

		var mo = new MsgObj();
		mo['cmd'] = "users";
		mo['users'] = "add"; //사용자 추가
		mo['val'] = {};
		mo['val'][user.uid] = user.info();
		this.broadcast(mo);
		

		this.sync();


		
		
		
		//--- 입장 알림
		if(this.type =='robby'){ //로비일때는 입장안내 안함
			var mo = new MsgObj();
			mo['cmd'] = "notice";
			//mo['nick'] = "##SYSTEM##";
			mo['val'] = this.subject+"에 "+user.nick+"님이 입장하셨습니다";
			user.send(mo);
			
		}else{
			var mo = new MsgObj();
			mo['cmd'] = "notice";
			//mo['nick'] = "##SYSTEM##";
			mo['val'] = this.subject+"에 "+user.nick+"님이 입장하셨습니다";
			this.broadcast(mo);
			
			if(this.game.onjoin){
				this.game.onjoin(user);
			}

		}
		console.log("방 "+this.subject+"에 "+user.nick+"가 참여");

		return true;
	}
	,"sync":function(){ //
		//--- 방 정보 전송
		var mo = new MsgObj();
		mo['cmd'] = "room";
		mo['room'] = "sync";
		mo['val'] = this.info();;
		this.broadcast(mo);
		console.log(mo);
	}
	,"out":function(user){
		console.log(this+".out("+user+")");
		if(this.um.remove(user)){
			var mo = new MsgObj();
			mo['cmd'] = "notice";
			//mo['nick'] = "##SYSTEM##";
			mo['val'] = user.nick+"님이 퇴장하셨습니다";
			user.room.broadcast(mo);
			this.sync();
		}
		if(this.game && this.game.out){
			this.game.out(user);
		}

	}
	,"broadcast":function(str){
		//console.log(this+".broadcast("+str+")");
		this.um.broadcast(str);
	}

}

module.exports = Room;