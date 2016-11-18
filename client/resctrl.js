var resctrl = {
	"init":function(client,form){
		this.usersSelect = document.getElementById('usersSelect');
		this.msgsDiv = document.getElementById('msgsDiv');
		this.msgsLimit = 100;
		
		client.onmessage = resctrl.onmessage.bind(resctrl);
	
		this.form = form;
		this.client = client;

		this.client.onopen = function(){
			document.getElementById('connStat').className="connected";
			console.log("Connection opened!")
		}
		this.client.onclose = function(event){
			document.getElementById('connStat').className="disconnected";
			console.log("Connection onclose!")
			console.log(event);
			// 에러코그 관련 참고 : http://tools.ietf.org/html/rfc6455#section-7.4.1 
			console.log("["+event.code+"]"+event.reason);
			
			document.getElementById('closeReason').textContent = "접속종료:"+"["+event.code+"]"+event.reason
			
		}
		this.client.onerror = function(event){
			console.log("Connection onerror!")
			console.log(event);

		}

		var that = this;
		this.form.onsubmit = function (event) {
			var cm = {}
			cm.cmd = this.cmd.value;
			cm.val = this.val.value;
			this.val.value = ""
			that.client.send(cm);
			
			if(cm.cmd != 'msg'){
				this.cmd.value = 'msg';
			}
			
			
			event.preventDefault();
			return false;
		}
		



	}
	,"msg":function(res){
		var str = res.nick+" > "+res.val;
		var div = document.createElement("div")
		div.className = 'msg';
		if(res.private){div.className+=" private"; }
		div.textContent = str
		this.addMsgs(div);
	}
	,"notice":function(res){
		var str = "<NOTICE> "+res.val;
		var div = document.createElement("div")
		div.className = 'notice';
		if(res.private){div.className+=" private"; }
		div.textContent = str
		this.addMsgs(div);
	}
	,"error":function(res){
		var str = "<ERROR> "+res.val;
		var div = document.createElement("div")
		div.className = 'error';
		if(res.private){div.className+=" private"; }
		div.textContent = str
		this.addMsgs(div);
	}
	,"users":function(res){
		var arr = [];
		var users = client.users();
		for(var x in users){
			arr.push(users[x]);
		}
		arr.sort(function(a,b){return a.nick>b.nick;});

		var val = this.usersSelect.value;
		this.usersSelect.length = 0;
		var opts = this.usersSelect.options;

		for(var i=0,m=arr.length;i<m;i++){
			var user = arr[i];
			var nick = user.nick;
			var opt = new Option(nick,nick,(val==nick),(val==nick));
			if(user.uid == this.client.uid){
				opt.className ="mine"
			}
			opts.add(opt);		
		}
		return true;
	}
	,"addMsgs":function(node){
		this.msgsDiv.appendChild(node);
		while(this.msgsDiv.childNodes.length>this.msgsLimit){
			msgsDiv.removeChild(msgsDiv.firstChild);
		}
		msgsDiv.scrollTop = 9999;
	}
	,"onmessage":function(res){
		switch(res.cmd){
			case "msg":
				this.msg(res);
				break;
			case "notice":
				this.notice(res);
				break;
			case "error":
				this.error(res);
				break;
			case "users":
				this.users(res);
				break;
			case "game":
				gameOthelloClientControl.onmessage(res);
			case "room":
				room.onmessage(res);
		}
	}
}

var room = {
	"reqList":function(){
		var cm = {};
		cm.cmd = "room";
		cm.room = "list";
		cm.val="";
		client.send(cm);
	}
	,"list":function(rooms){
		var ul = document.getElementById('roomList');
		var defLi = document.createElement('li');
		defLi.innerHTML= '<span></span><input type="button" value="입장">';
		while(ul.firstChild){
			ul.removeChild(ul.firstChild);
		}
		for(var i=0,m=rooms.length;i<m;i++){
			var r = rooms[i];
			var li = defLi.cloneNode(true);
			li.room = r;
			li.childNodes[0].textContent = "["+r.rid+"] "+r.subject+" ("+r.userCount+"/"+r.userLimit+")";
			li.childNodes[1].onclick=function(){
				room.reqJoin(this.parentNode.room.rid);
			};
			ul.appendChild(li);
		}
		if(rooms.length =='0'){
			var li = defLi.cloneNode(true);
			li.innerHTML = "만들어진 방이 없습니다.";
			ul.appendChild(li);
		}
	}
	,"reqJoin":function(rid){
		var cm = {};
		cm.cmd = "room";
		cm.room = "join";
		cm.val = rid;
		client.send(cm);
	}
	,"reqOut":function(rid){
		var cm = {};
		cm.cmd = "room";
		cm.room = "out";
		cm.val = rid;
		client.send(cm);
	}
	,"onmessage":function(res){
	//cmd가 room인것이 온다.
		switch(res.room){
			case "sync": //정보 싱크 {rid:xxxx , subject:xxxx}형식
				if(res.val.subject){
					var r = res.val;
					document.getElementById('headerSection').getElementsByTagName('span')[0].textContent = "["+r.rid+"] "+r.subject+" ("+r.userCount+"/"+r.userLimit+")";
					document.getElementById('layout').dataset.roomType = res.val.type
				}
				break;
			case "list":
				this.list(res.val);
			break;
		}
	}
	,"create":function(subject){
		var cm = {};
		cm.cmd = "room";
		cm.room = "create";
		cm.val = subject;
		client.send(cm);
	}
}