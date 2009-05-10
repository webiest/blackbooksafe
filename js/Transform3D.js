/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */

var Transform3D = function(target) {
	this.target = target;
	this.setDefaultRotationCenter();
}

Transform3D.prototype.setDefaultRotationCenter = function() {
	this.position = {
		x: this.target.x,
		y: this.target.y
	}
	this.rotationCenter = { 
		x : this.target.width/2,
		y : this.target.height/2,
		z : 0
	};
}

Transform3D.prototype.resetTransform = function() {
	this.target.transform.matrix3D = null;
	this.target.x = this.position.x;
	this.target.y = this.position.y; 
}

Transform3D.prototype.rotateAroundX = function(degrees) {
	this.setRoration(degrees, air.Vector3D.X_AXIS);
}

Transform3D.prototype.rotateAroundY = function(degrees) {
	this.setRoration(degrees, air.Vector3D.Y_AXIS);
}

Transform3D.prototype.rotateAroundZ = function(degrees) {
	this.setRoration(degrees, air.Vector3D.Z_AXIS);
}

Transform3D.prototype.rotateAroundRotationCenter = function(degrees, axis){
	var center = this.rotationCenter;
	var position = this.position;
	this.target.z = 0;
	var result;
	if(this.target.transform.perspectiveProjection){
		result = this.target.transform.perspectiveProjection.toMatrix3D();	
	}else{
		result = new air.Matrix3D();
	}
	result.appendTranslation(-center.x, -center.y, -center.z);
	result.appendRotation(degrees, axis);
	result.appendTranslation(position.x+center.x, position.y+center.y, center.z);
	this.target.transform.matrix3D = result;	
}
