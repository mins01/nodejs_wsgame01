"use strict";

/**
* for Node.js
*/
var MsgObj = require("../lib/MsgObj.js");


function GameOthelloControl(room,goths){
	this.init(room,goths);
}

try{
	module.exports = GameOthelloControl;
}catch(e){
}
GameOthelloControl.prototype = {
	 "constructor":GameOthelloControl
	//,"goths":null
	//,"tUser":null
	//,"bUser":null //흑 유저
	//,"wUser":null //백 유저
	,"gameName":"othello"
	,"init":function(room,goths){
		console.log(this+".init("+room+","+goths+")");
		this.room = room;
		this.acting = 0;
		this.goths = goths;
		this.goths.onmsg = this.onmsg.bind(this);
		this.goths.onprivatemsg = this.onprivatemsg.bind(this);
		this.goths.onnotice = this.onnotice.bind(this);
		this.goths.onstart = this.onstart.bind(this);
		this.goths.onend = this.onend.bind(this);
		this.goths.onsyncInfo = this.onsyncInfo.bind(this);
		this.goths.onchangeturn = this.onchangeturn.bind(this);
	}
	,"toString":function(){
		return "{"+this.constructor.name+"["+this.room+"]}";
	}
	,"reqHandler":function(user,req){
		console.log(this+".reqHandler("+user+","+req+")");
		//console.log(req);
		this.tUser = user;
		switch(req.game){
			case "syncInfo":
				this.syncInfo(this.getInfo());
			break;
			case "stone":
				this.stone(user,req.val);
			break;
			case "start":
				this.start();
			case "restart":
				this.restart(user);
			break;
			case "join":
				this.join(user,req.val);
			break;
			case "out":
				this.out(user);
			break;
		}
	}
	,"isJoined":function(user){
		if(this.bUser && this.bUser.uid == user.uid){
			return true;
		}
		if(this.wUser && this.wUser.uid == user.uid){
			return true;
		}
		return false;
	}
	,"isMyTurn":function(user){
		var t = this.goths.turn==1?this.bUser:this.wUser;
		if(t && t.uid == user.uid){
			return true;
		}
		return false;
	}
	,"stone":function(user,seq){
		if(this.acting!=0){ //동시동작 제어
			this.onprivatenotice("참여할 수 있는 상태가 아닙니다.");
			return false;
		}
		this.acting = 1;
		console.log(this+".stone("+user+","+seq+")");
		if(this.isMyTurn(user)){
			var r = this.goths.stone(seq);
		}else{
			this.onprivatenotice("참여하실 수 없습니다");
		}
		this.acting = 0;
	}
	,"join":function(user,color){
		console.log(this+".stone("+user+","+color+")");
		this.tUser = user;
		if(color!=1 && color != 2){
			this.onprivatenotice("잘못된 요청입니다.");
			return false;
		}
		
		if(this.bUser && this.bUser.uid == user.uid){
			this.onprivatenotice("이미 흑의 유저로 참여중입니다.");
			return false;
		}
		if(this.wUser && this.wUser.uid == user.uid){
			this.onprivatenotice("이미 백의 유저로 참여중입니다.");
			return false;
		}
		if(color==1){
			if(this.bUser){
				this.onnotice("이미 흑의 유저가 참여중입니다.");
			}
			this.bUser = user;
			this.onmsg(user.nick+"님이 흑으로 게임에 참여하셨습니다.");
		}else if(color==2){
			if(this.wUser){
				this.onnotice("이미 백의 유저가 참여중입니다.");
			}
			this.wUser = user;
			this.onmsg(user.nick+"님이 백으로 게임에 참여하셨습니다.");
		}
		
		//--- 탈출에 대한 이벤트 등록
		/*  room.out에서 처리해준다.
		var that = this;
		user.conn.on("close", function (code, reason) {
			console.log("게임에서 나갔다. 추적");
			that.out(this.user);
		});
		*/
		this.syncInfo(this.getInfo())
		this.tUser  = null
	}
	,"out":function(user){
		console.log(this+".out("+user+")");
		this.tUser = user;
		if(this.bUser && this.bUser.uid == user.uid){
			this.bUser = null;
			this.onmsg(user.nick+"님의 포기로 흑 유저가 공석이 되었습니다. 참여하실 수 있습니다.");
		}
		if(this.wUser && this.wUser.uid == user.uid){
			this.wUser = null;
			this.onmsg(user.nick+"님의 포기로 백 유저가 공석이 되었습니다. 참여하실 수 있습니다.");
		}
		this.syncInfo(this.getInfo())
	}
	,"start":function(){
		console.log(this+".start()");
		this.goths.startGame();
	}
	,"restart":function(user){
		console.log(this+".restart("+user+")");
		if(!this.isJoined(user)){
			this.onprivatenotice("게임 참여자만 재시작을 할 수 있습니다.");
			return false;
		}
		this.onmsg("게임이 재시작 되었습니다.");
		this.goths.startGame();
	}
	,"getInfo":function(info){
		if(!info)info = this.goths.getInfo();
		if(this.bUser){
			info.bUser = this.bUser.info();
		}else{
			info.bUser = null;
		}
		if(this.wUser){
			info.wUser = this.wUser.info();
		}else{
			info.wUser = null;
		}
		return info;
	}
	,"onjoin":function(user){
		console.log("onjoin");
		this.tUser = user;
		this.syncInfo(this.getInfo())
	}
	,"onchangeturn":function(turn){
		var mo = new MsgObj();
		mo.cmd = "game";
		mo.game = "msg";
		mo.val = (turn=='1'?"흑":"백")+"의 차례입니다.";
		console.log(mo);
		this.room.broadcast(mo);
	}
	,"onmsg":function(msg){
		var mo = new MsgObj();
		mo.cmd = "game";
		mo.game = "msg";
		mo.val = msg;
		console.log(mo);
		this.room.broadcast(mo);
	}
	,"onprivatemsg":function(msg){
		var mo = new MsgObj();
		mo.cmd = "game";
		mo.game = "msg";
		mo.val = msg;
		this.tUser.send(mo);
	}
	,"onprivatenotice":function(msg){
		var mo = new MsgObj();
		mo.cmd = "game";
		mo.game = "notice";
		mo.val = msg;
		console.log(mo);
		this.tUser.send(mo);
	}
	,"onnotice":function(msg){
		var mo = new MsgObj();
		mo.cmd = "game";
		mo.game = "notice";
		mo.val = msg;
		console.log(mo);
		this.room.broadcast(mo);
	}
	,"onstart":function(){
		console.log("onstart");
	}
	,"onend":function(info){
		this.getInfo(info);
		console.log("onend:"+info);
		console.log(info);
		this.syncInfo(info);
		var t = info.score[1]-info.score[2];
		if(t == 0 ){
			var r = "무승부";
		}else if(t > 0){
			var r = "흑 승리";
		}else{
			var r = "백 승리";
		}
		var str="결과 : 흑("+info.score[1]+") VS 백("+info.score[2]+") = "+r+"("+Math.abs(t)+" 차이)";
		this.onnotice(str);
	}
	,"onsyncInfo":function(info){
		this.getInfo(info);
		console.log("onsyncInfo:");
		this.syncInfo(info);
	}
	,"syncInfo":function(info){
		
		var mo = new MsgObj();;
		mo.cmd = "game";
		mo.game = "syncInfo";
		mo.val = info;
		this.room.um.broadcast(mo);
	}
}

