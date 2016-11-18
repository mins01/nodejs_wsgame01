"use strict";
/**
* room manager
*/

var hp = require("./helper.js"),
	MsgObj = require("./MsgObj.js"),
	Room = require("./Room.js");

function RoomManager(){
	this.init();
}
RoomManager.prototype={
	 "constructor":RoomManager
	,"init":function(){
		console.log(this+".init()");
		this.rooms={};
		this.rids = []; //0이면 방이 빠졌음. 
	}
	,"toString":function(){
		return "{"+this.constructor.name+"}";
	}
	/**
	* 방 만들기
	*/
	,"create":function(rid,subject,type){
		console.log(this+".create("+rid+","+subject+","+type+")");
		rid = rid.toString().substr(0,100);
		subject = subject.toString().substr(0,100);
		if(subject.length<2){
			return false;
		}

		if(this.rooms[rid]){
			return false;//'이미 같은 아이디의 방이 있음';
		}
		this.rooms[rid] = new Room(rid,subject,type)
		return this.rooms[rid];
	}
	/**
	* 방 만들기(rid 자동생성)
	*/
	,"createAutoRid":function(subject,type){
		var i=0,m=0,k=-1;
		for(i=0,m=this.rids.length;i<m;i++){
			if(this.rooms[i.toString()]){ continue;}
			this.rids[i] = 2;
			k=i;
			break;
		}
		if(k == -1){
			this.rids.push(2);
			k = this.rids.length-1;
		}
		var rid = k;
		this.rids[k] = 1;
		return this.create(rid,subject,type);
	}
	/**
	* 방 제거(비어있으면)
	*/
	,"removeForEmpty":function(room){
		if(room.userCount()>0){
			return false;
		}
		if(Object.keys(this.rooms).length < 3){
			return false; //최소 방을 2개 남긴다(그중 하나는 robby다)
		}
		return this.remove(room);
	}
	/**
	* 방 제거
	*/	
	,"remove":function(room){
		console.log(this+".remove() "+room);
		if(!room){
			return false;
		}
		if(room.type=="robby"){ //로비는 제거못함
			return false;
		}
		var rid = room.rid;
		this.rooms[rid] = null
		delete this.rooms[rid];
		
		console.log(this+".remove() "+room+" removed");
		return true;
	}
	/**
	* 방 참여, room의 join 호출
	*/
	,"join":function(user,rid){
		console.log(this+".join("+user+","+rid+")" );
		if(!this.rooms[rid]){
			console.log("방 "+rid+"가 없어서 join할 수 없음.");
			return false; //해당 방이 없음
		}
		
		if(user.room && user.room.rid != rid){//이전방에서 빠져나오기
			user.room.out(user);
			this.removeForEmpty(user.room); //방이 비어있으면 삭제한다.
		}
		
		var r = this.rooms[rid].join(user);
		if(r && this.rooms[rid].type=='robby'){ //로비일 경우 목록 표시
			var mo = new MsgObj();
			mo.cmd = "room";
			mo.room = "list";
			mo.val = this.list();
			user.send(mo);
		}
		return r;
	}
	/**
	* 방에서 나가기, room의 out호출
	*/
	,"out":function(user){
		console.log(this+".out("+user+")");
		if(user.room.type == 'robby'){ //로비인 경우 방을 나갈 수 없다.
			return true;
		}else{
			this.join(user,'robby'); //자동으로 방에 나가진다.
			return true;
		}
		return false;
	}
	/**
	* 방목록
	*/
	,"list":function(){
		var rarr = [];
		for(var k in this.rooms){
			console.log(this.rooms[k].info());
			if(this.rooms[k].type == 'robby') continue; //로비는 안보이게 한다.
			rarr.push(this.rooms[k].info());
		}
		return rarr;
	}
	/**
	* 요청 핸들러
	*/
	,"reqHandler":function(user,req){
		// .cmd는 room인 경우 이 메소드가 불린다.
		console.log(this+"::reqHandler");
		console.log(req);
		switch(req.room){
			case "out": //로비로 나간다
				this.out(user);
				break;
			case "list": //로비 목록
				var mo = new MsgObj();
				mo.cmd = "room";
				mo.room = "list";
				mo.val = this.list();
				user.send(mo);
				break;
			case "join":
				this.join(user,req.val);
				break;
			case "create":
				var r = this.createAutoRid(req.val);
				if(!r){
					var mo = new MsgObj();
					mo.cmd = "error";
					mo.val = "방 만들기에 실패하였습니다";
					user.send(mo);
					return false;
				}else{
					this.join(user,r.rid);
				}
		}
		return true;
	}
	
}



module.exports = RoomManager;