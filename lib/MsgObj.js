"use strict";

/**
* 메세지객체 클레스
*/
function MsgObj(){

}
MsgObj.prototype ={
	"constructor":MsgObj
	,"toString":function(){
		return "{MsgObj}"+ this.toJson();
	}
	/**
	* JSON 형태로 변환
	*/
	,"toJson":function(){
		//console.log(this);
		return JSON.stringify(this);
	}
}

module.exports = MsgObj;