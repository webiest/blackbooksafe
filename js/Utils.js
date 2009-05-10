/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */

var BBS; if (!BBS) BBS = {};
if (!BBS.Utils) BBS.Utils = {};


BBS.Utils = {
	getListElement : function(document, id, imagePath, firstName, lastName, phone) {
		var div = document.createElement("div");
		div.className = "listDiv";
		div.innerHTML = "<table><tr>" + 
			"<td><img id='img_" + id  + "' width=36 height=48 class='photoSmall' src='" + imagePath + "' /></td>" +
			"<td><span class='tableFieldName listValue'>" + firstName + " " + lastName + "</span><span class='tableFieldName listValue'>" + phone + "</span></td>" +
			"</tr></table>";
		return div;		
	},
	
	createHTMLLoader : function(path, callback) {
		var loader = new air.HTMLLoader();
		loader.x = 20;
		loader.y = 20;
		loader.paintsDefaultBackground = false;
		//
		loader.filters = [BBS.Utils.createShadowFilter()];
		loader.addEventListener(air.Event.COMPLETE, callback);
		loader.load(new air.URLRequest(path));
		//
		return loader;
	},
	
	createShadowFilter : function (){
		var shadowFilter = new runtime.flash.filters.DropShadowFilter(0, 0);
		shadowFilter.blurX = 20;
		shadowFilter.blurY = 20;
		return shadowFilter; 
	},
	
	isAssetImage : function (path) {
		return path && (path.indexOf(BBS.Assets.IMAGE_UNAVAILABLE) != -1);
}
}

BBS.getBounds = function(element) {
	var offset = jQuery(element).offset();
	var htmlLoader = element.ownerDocument.defaultView.htmlLoader;
	return {
		x: offset.left + htmlLoader.x,
		y: offset.top + htmlLoader.y,
		width: jQuery(element).width(),
		height: jQuery(element).height()
	}
}

// Modify standard objects

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

Function.prototype.createCallback = function(obj, args){
		var method = this;
		return function() {
			var callArgs = args || arguments;
			return method.apply(obj || window, callArgs);
		};
};
