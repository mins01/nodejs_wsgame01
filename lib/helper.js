"use strict";

var helper = {};
helper.disableLog = function(){
	if(!helper.disableLog.tmp){
		helper.disableLog.tmp = console.log;
		console.log = function() {};
	}
}
helper.enableLog = function(){
	if(helper.disableLog.tmp){
		console.log = helper.disableLog.tmp;
	}
}

module.exports = helper;