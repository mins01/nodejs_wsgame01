var gameOthelloClientControl = {
	 "client":null
	,"resctrl":null
	,"info":null
	,"init":function(client,resctrl){
		this.client = client;
		this.resctrl = resctrl;
		/*
		this.goths = goths;
		this.goths.onmsg = this.onmsg.bind(this);
		this.goths.onmymsg = this.onmymsg.bind(this);
		this.goths.onerror = this.onerror.bind(this);
		this.goths.onstart = this.onstart.bind(this);
		this.goths.onend = this.onend.bind(this);
		this.goths.onsyncInfo = this.onsyncInfo.bind(this);
		*/
		var that = this;
		document.getElementById('othelloBoard').onclick = function(event){
			if(!that.isMyTurn()){
				console.log("당신은 차례가 아닙니다");
				return;
			}
			var td = event.target;
			if(td.tagName=='DIV'){
				td = td.parentNode;
			}
			if(td.tagName!='TD'){
				return false;
			}
			if(td.className =='b' || td.className =='w'){
				return false;
			}
			that.stone(td.seq);
		};
		
		var tds = document.getElementById('othelloBoard').getElementsByTagName('td');
		for(var i=0,m=tds.length;i<m;i++){
			tds[i].seq = i;
			
		}
	}
	//------ 보내는 부분
	,"stone":function(seq){
		var cm = {};
		cm.cmd="game";
		cm.game="stone"
		cm.val=seq;
		this.client.send(cm);
	}
	,"restart":function(){
		var cm = {};
		cm.cmd="game";
		cm.game="restart"
		cm.val="";
		this.client.send(cm);
	}
	,"joinB":function(){
		var cm = {};
		cm.cmd="game";
		cm.game="join"
		cm.val=1;
		this.client.send(cm);
	}
	,"joinW":function(){
		var cm = {};
		cm.cmd="game";
		cm.game="join"
		cm.val=2;
		this.client.send(cm);
	}
	,"out":function(){
		var cm = {};
		cm.cmd="game";
		cm.game="out"
		cm.val="";
		this.client.send(cm);
	}
	//------ 받는 부분
	,"onmessage":function(res){
		switch(res.game){
			case "syncInfo":
				this.syncInfo(res.val);
				break;
			case "error":
				this.resctrl.error(res);
				break;
			case "notice":
				this.resctrl.notice(res);
				break;
			case "msg":
				this.resctrl.notice(res);
				break;
		}
	
	}
	
	,"onmsg":function(msg){
		alert(msg);
	}
	,"onmymsg":function(msg){
		alert(msg);
	}
	,"onerror":function(msg){
		alert(msg);
	}
	,"onstart":function(info){
		console.log("onstart:"+info);
		this.syncInfo(info);
	}
	,"onend":function(info){
		console.log("onend:"+info);
		console.log(info);
		this.syncInfo(info);
	}
	,"onsyncInfo":function(info){
		console.log("onsyncInfo:");
		console.log(info);
		this.syncInfo(info);
	}
	,"isJoined":function(){
		if(this.info.bUser && this.info.bUser.uid == this.client.uid){
			return "b";
		}
		if(this.info.wUser && this.info.wUser.uid == this.client.uid){
			return "w";
		}
		return false;
	}
	,"isMyTurn":function(){
		if(this.info.isPlay){
			return this.info.turn == this.myColor();
		}
		return false;
	}
	,"myColor":function(){
		var t = this.info.bUser
		if(t && t.uid == this.client.uid){
			return 1;
		}
		var t = this.info.wUser
		if(t && t.uid == this.client.uid){
			return 2;
		}
		return 0;
	}
	,"syncInfo":function(info){
		this.info = info;
		var t = document.getElementById('divTurn');
		switch(info.turn){
			case 1:
				document.getElementById('othelloBoard').className="b";
				t.innerHTML = "흑";
				t.className = "labelBlack";
				break;
			case 2:
				document.getElementById('othelloBoard').className="w";
				t.innerHTML = "백";
				t.className = "labelWhite";
				break;
		}
		//--- 돌 표시
		var tds = document.getElementById('othelloBoard').getElementsByTagName('td');
		for(var i=0,m=info.boxs.length;i<m;i++){
			switch(info.boxs[i]){
				case 0: tds[i].className = "";break;
				case 1: tds[i].className = "b";break;
				case 2: tds[i].className = "w";break;
			}
		}
		//--- 마지막에 놓은 돌 표시
		if(info.last>-1){
			tds[info.last].className +=" n";
		}
		//--- 힌트 표시
		if(this.isMyTurn()){
			for(var i=0,m=info.ableBoxs.length;i<m;i++){ //놓을 수 있는 위치 표시
				tds[info.ableBoxs[i]].className ="c";
			}
		}
		//--- 점수 표시
		var tds = document.getElementById('divBScore').innerHTML = info.score[1];
		var tds = document.getElementById('divWScore').innerHTML = info.score[2];
		
		
		document.getElementById('btnJoinB').style.display = (info.bUser||this.isJoined())?"none":"";
		document.getElementById('btnJoinW').style.display = (info.wUser||this.isJoined())?"none":"";
		document.getElementById('btnOutB').style.display = (this.myColor()==1)?"":"none";
		document.getElementById('btnOutW').style.display = (this.myColor()==2)?"":"none";
		if(this.myColor()==1){
			document.getElementById('btnOutB').value = info.bUser.nick
		}else if(this.myColor()==2){
			document.getElementById('btnOutW').value = info.wUser.nick
		}else{
			document.getElementById('btnOutB').value = '포기';
			document.getElementById('btnOutW').value = '포기';
		}

		document.getElementById('btnRestart').disabled = (!this.isJoined())?true:false;

		
		
		
	}
}