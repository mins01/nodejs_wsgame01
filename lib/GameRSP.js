"use strict";

var hp = require("./helper.js");


var GameRSP = function(room){
	this.init(room);
}
GameRSP.prototype={
	"init":function(room){
		console.log("가위바위보 게임 초기화");
		this.um = new GameRSPUserManager();
		this.room = room;
		this.stat = 0; //0:준비중(참여가능), 1:게임중
		this.timer = null;
	}
	,"join":function(user){
		if(this.stat!=0){
			console.log("현재 참여할 수 없음. 기다려라.");
			return false;
		}
		this.um.add(user);
		console.log(this.um.uids);
	}
	//--- 게임 플로우
	,"startGame":function(){
		if(this.stat!=0){
			console.log("이미 게임이 실행중입니다.");
			return false;
		}
		this.stat = 1;

		this.startTimer();

		var cm = {}
		cm['cmd'] = "notice";
		//cm['nick'] = "##SYSTEM##";
		cm['val'] = "게임을 시작합니다. 60초안에 선택해주세요.";
		this.room.broadcast(cm)
	}
	,"startTimer":function(){
		console.log("타이머 시작");
		this.timer = setTimeout(this.showResult.bind(this),2000);
	}
	,"showResult":function(){
		this.stat = 0;
		console.log("타이머 끝");
		for(var k in this.um.uids){
			var userC = this.um.uids[k];
			var cm = {}
			cm['cmd'] = "notice";
			cm['val'] = "결과 : 당신이 이겼어요!";
			console.log(userC);
			userC.user.send(cm);
		}
		this.timer = setTimeout(this.startGame.bind(this),2000);
	}
	,"input":function(){
	}
	,"endTimer":function(){
	}
	//---
	,"out":function(user){
	}
	,"broadcast":function(cm){
		this.room.broadcast(cm);
	}
	,"messageControl":function(user,req){
		//여기까지 오면 cmd는 game이 되어있어야한다.
		console.log(req);
		switch(req.game){
			case "join": //가위바위보 참여
				this.join(user);
				break;
			case "start": //가위바위보 시작(타이머 시작)
				this.startGame();
				break;
			case "input": //가위바위보 제출
				break;
		}
	}
	,"room_onjoin":function(user){
		var cm = {}
		cm['cmd'] = "notice";
		//cm['nick'] = "##SYSTEM##";
		if(this.stat==0){
			cm['val'] = "가위바위보 게임에 참여하실 수 있습니다.";
		}else{
			cm['val'] = "가위바위보 게임이 진행중입니다. 나중에 참여해주세요.";
		}
		user.room.broadcast(cm)
	}
}

var GameRSPUserManager = function(){
	this.init();
}
GameRSPUserManager.prototype={
	 "init":function(){
		this.uids = {}
	}
	,"length":function(){
		var cnt = 0;
		for (var k in this.users ) {
			cnt++;
		}
		return cnt;
	}
	,"get":function(){
		if(this.uids[user.uid]){
			return this.uids[user.uid];
		}
		return null;
	}
	,"has":function(user){
		return !!this.uids[user.uid]
	}
	,"add":function(user){
		if(this.has(user)){
			console.log("이미참여중");			
			return false; //이미참여중
		}
		this.uids[user.uid] = new GameRSPUser(user);
		//--- 탈출에 대한 이벤트 등록
		var that = this;
		user.conn.on("close", function (code, reason) {
			console.log("나갔다. 추적");
			that.remove(this.user);
		});
	}
	,"remove":function(user){
		if(!this.uids[user.uid]){
			return false;
		}
		delete this.uids[user.uid];
		return true;
	}
}

var GameRSPUser = function(user){
	this.init(user);
}
GameRSPUser.prototype={
	 "init":function(user){
		this.win = 0;
		this.losw = 0;
		this.draw = 0;
		this.rock = 0;
		this.scissors = 0;
		this.paper = 0;
		this.input = "N";//가위바위보 상태저장용 (S:가위,R:바위,P:보자기)
		this.fInput = "N";//가위바위보 속임수용(S:가위,R:바위,P:보자기)
		this.user = user;
	}
}

module.exports = GameRSP;