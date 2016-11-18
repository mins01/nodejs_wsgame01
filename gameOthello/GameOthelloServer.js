"use strict";
/**
* for Node.js
*/
function GameOthelloServer(){
	this.init();
}

try{
	module.exports = GameOthelloServer;
}catch(e){
}

GameOthelloServer.prototype={
	 "constructor":GameOthelloServer
	,"boxs":null
	,"turn":0
	,"turnCount":0
	,"history":[]
	,"isPlay":false
	,"score":null
	,"init":function(){
		this.turn = 1; //1:black, 2:white
		this.boxs = [0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					];
		this.score = [0,0,0];
		this.last = -1;
		//this.startGame();
	}
	,"toString":function(){
		return "{"+this.constructor.name+"}";
	}
	,"printBoxs":function(){
		var x = []
		var boxs = this.boxs
		for(var i=0,m=boxs.length;i<m;i++){
			x.push(i+"="+boxs[i]);
			if(i%8==7){
				x.push("\n");
			}
		}
		console.log(x.join(":"));
	}
	,"_syncInfo":function(){ //정보 싱크
		this.score[0]=0;
		this.score[1]=0;
		this.score[2]=0;
		for(var i=0,m=this.boxs.length;i<m;i++){
			this.score[this.boxs[i]]++;
		}
		this.onsyncInfo(this.getInfo());
	}
	,"getInfo":function(){
		var info = {};
		info.isPlay = this.isPlay;
		info.turn = this.turn;
		info.score = this.score;
		info.turnCount = this.turnCount;
		info.boxs = this.boxs;
		info.last = this.last;
		info.ableBoxs = this.ableSeqs();
		return info;
	}
	,"startGame":function(){
		this.isPlay = true;
		this.turn = 1;
		this.last = -1;
		this.turnCount = -1; //checkGameOver를 한번 호출하면 +1이 자동으로 된다.

		//this.setDivTurn(this.turn);
		//this.syncScore();
		var boxs = this.boxs;
		for(var i=0,m=boxs.length;i<m;i++){
			boxs[i] = 0; //0으로 초기화
		}
		//--- 기본위치
		//*
		boxs[27] = 2;
		boxs[28] = 1;
		boxs[35] = 1;
		boxs[36] = 2;
		//*/
		//--- 테스트용 위치
		/*
		boxs[27] = 1;
		boxs[28] = 1;
		boxs[35] = 1;
		boxs[36] = 2;
		/*/
		//-- (흑이 둘 차례가 없는 경우
		/*
		boxs[26] = 2;
		boxs[27] = 2;
		boxs[28] = 2;
		boxs[29] = 2;
		boxs[30] = 2;

		boxs[35] = 1;
		boxs[36] = 2;
		boxs[37] = 0;

		boxs[42] = 2;
		boxs[43] = 2;
		boxs[44] = 2;
		boxs[45] = 2;
		boxs[46] = 2;
		//*/
		this.onstart();
		if(this.checkGameOver(this.turn)){
			this.endGame();
		}
	}
	,"endGame":function(){ //게임 종료
		this.isPlay = false;
		this.msg("게임종료");
		this.onend(this.getInfo());
	}
	,"getStoneStr":function(turn){
		switch(turn){
			case 1:return '흑';break;
			case 2:return '백';break;
			default:return '-';break;
		}
	}
	,"getReverceTurn":function(turn){
		return  (turn+2)%2+1;
	}
	,"checkGameOver":function(turn){ //게임 종료 체크. 받은 turn에서 놓을 곳이 남아있는지 체크
		//var turn = this.turn;
		var rturn = this.getReverceTurn(turn); //반대 턴
		if(this.ableSeqs(turn).length == 0){
			if(this.ableSeqs(rturn).length == 0){ //흑,백 둘다 놓을 곳이 없음.
				this._syncInfo();
				return true;
			}else{
				this.msg(this.getStoneStr(turn)+"은 돌을 놓을 수 없습니다. 턴을 넘깁니다.");
				this.changeTurn(rturn); //턴을 바꿈
				this._syncInfo();
				return false;
			}
		}
		this.changeTurn(turn);
		this._syncInfo();
		return false;
	}
	,"stone":function(seq){
		if(isNaN(seq) || seq<0 || seq>64){
			this.notice(seq+"는 사용할 수 없는 위치입니다.");
			 false;
		}
		var revSeqs = this.checkSeqs(seq,this.turn);
		if(revSeqs.length>0){
			//this.turnCount++;
			this.boxs[seq] = this.turn;
			this.last = seq;
			for(var i=0,m=revSeqs.length;i<m;i++){
				var revSeq = revSeqs[i];
				if(this.boxs[revSeq]==0){
					this.notice(revSeq+"는 넘길 수 없다. 돌이 없다.");
					break;
				}
				this.boxs[revSeq]=this.turn;
			}
			if(this.checkGameOver(  this.getReverceTurn(this.turn) )){ //게임 종료 확인
				this.endGame();
			}
		}else{
			this.privatemsg("해당 위치에 돌을 놓을 수 없습니다.");
		}
		
	}
	,"ableSeqs":function(turn){  //놓을 수 있는 위치 찾기
		if(turn == undefined) turn = this.turn;
		var ableSeqs = [];
		var boxs = this.boxs //box와 seq거 거의 같은 뜻이다. boxs의 인덱스가 seq다.
		for(var i=0,m=boxs.length;i<m;i++){
			if(boxs[i] != 0){continue;}
			var t = this.checkSeqs(i,turn);
			if(t.length>0){
				ableSeqs.push(i);
				
			}
		}
		return ableSeqs;
	}
	,"checkSeqs":function(seq,turn){ //8방향 배열에서 돌을 놓을 수 있는 위치를 구한다.
		var relSeqss = this.getRelSeqss(seq);
		var ableSeqs = [];
		var rturn = turn=='1'?'2':'1';//상대 돌색 구분용
		for(var i=0,m=relSeqss.length;i<m;i++){
			var relSeqs = relSeqss[i];
			if(relSeqs.length==0){continue;} //비어있는 방향은 무시

			if(this.boxs[relSeqs[0]]==0 || this.boxs[relSeqs[0]]==turn){ 
				continue; //비어있는칸, 같은색 칸 무시
			}
			var tmpArr = [relSeqs[0]];
			for(var i2=1,m2=relSeqs.length;i2<m2;i2++){ //같은색 돌이 있는지 체크, 없으면 OUT
				var relSeq = relSeqs[i2];
				if(this.boxs[relSeq] == turn){
					ableSeqs = ableSeqs.concat(tmpArr);
					break;
				}else if(this.boxs[relSeq] == rturn){
					tmpArr.push(relSeq);
				}else if(this.boxs[relSeq] == 0){
					break;
				}else{
					this.notice("잘못된 동작");
				}

			}

		}
		
		return ableSeqs;
	}
	,"getRelSeqss":function(iSeq){ //8방향의 배열 구하기, 여기서 돌을 놓을 수 있는지는 체크하지 않는다.
		var rseq = []; //디버깅 힘들어서 분리
		var ts = [],tss = [];
		var tseq = null;
		var seq = 0;
		for(var i=0,m=8;i<m;i++){
			seq = iSeq;
			while((tseq = this.getDirSeq(seq,i))!=null){
				ts.push(tseq);
				seq = tseq;
			}
			tss.push(ts);
			ts = [];
		}
		return tss;
	}
	,"getDirSeq":function(seq,dir){
		//var seq = td.seq;
		var t0 = seq%8;
		var t1 = -1;
		var rtd = null;
		switch(dir){
			case 0:	t1=seq-8;	break;
			case 1:	if(t0!=7){t1=seq-8+1;}break;
			case 2:	if(t0!=7){t1=seq+1;}break;
			case 3:	if(t0!=7){t1=seq+8+1;}break;
			case 4:	t1=seq+8;break;
			case 5:	if(t0!=0){t1=seq+8-1;}break;
			case 6:	if(t0!=0){t1=seq-1;}break;
			case 7:	if(t0!=0){t1=seq-8-1;}break;
		}
		if(t1<0 || t1>=this.boxs.length){
			return null;
		}
		//return this.tds[t1];
		return t1;
	}
	,"changeTurn":function(turn){
		this.turn = turn;
		this.turnCount++;
		this.onchangeturn(this.turn);
	}
	,"onchangeturn":function(turn){
	}
	,"msg":function(msg){
		console.log(msg);
		this.onmsg(msg);
	}
	,"onmsg":function(msg){
	}
	,"privatemsg":function(msg){
		console.log(msg);
		this.onprivatemsg(msg);
	}
	,"onprivatemsg":function(msg){
	}
	,"notice":function(msg){
		console.log(msg);
		this.onnotice(msg);
	}
	,"onnotice":function(msg){
	}
	,"onstart":function(){
		//console.log(info);
	}
	,"onend":function(info){
		console.log(info);
	}
	,"onsyncInfo":function(info){
		console.log(info);
	}

}//END:GameOthelloServer.prototype