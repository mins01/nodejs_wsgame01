var client = {
	"conn":null
	,"form":null
	,"_room":null
	,"uid":""
	,"room":function(roomCMD,room){
		switch(roomCMD){
			case "sync":
				if(room){
					this._room = room;
				}
			break;
		}
		return this._room;

	}
	,"_users":{}
	,"users":function(usersCMD,val){
		switch(usersCMD){
			case "list":
				this._users = val;
				break;
			case "add":
			case "sync":
				for(var x in val){
					this._users[x] = val[x]
				}
				break;
			case "remove":
				for(var x in val){
					this._users[x] = null;
					delete this._users[x];
				}
				break;
		}
		return this._users;
	}
	,"init":function(){

	}
	,"connect":function(url){
		if(!url){
			url = "ws://"+window.location.hostname+":8081";
		}
		this.conn = new WebSocket(url);

		this.conn.onopen = this.onopen.bind(this);
		this.conn.onclose = this.onclose.bind(this);
		this.conn.onerror = this.onerror.bind(this);
		this.conn.onmessage = this._onmessage.bind(this);

	}
	,"send":function(cm){
		var str = JSON.stringify(cm);
		if (str)
			this.conn.send(str)
	}
	// conn 이벤트 처리용
	,"onopen":function(){
		console.log("Connection opened")
	}
	,"onclose":function(event){
		console.log("Connection onclose")
		console.log(event);
	}
	,"onerror":function(event){
		console.log("Connection onerror")
		console.log(event);
	}
	,"_onmessage":function(event){
		var res = JSON.parse(event.data);
		res["timeStamp"] = event.timeStamp;
		console.log(res);
		if(res.val == undefined){ res.val = ""; }

		switch(res.cmd){
			case "users":
				this.users(res.users,res.val);
				break;
			case "room":
				this.room(res.val);
				break;
			case "uid":
				this.uid = res.val
				break;
		}
		


		this.onmessage(res);
	}
	,"onmessage":function(res){
		var div = document.createElement("div")
		div.textContent = JSON.stringify(res);
		document.body.appendChild(div)
	}
}