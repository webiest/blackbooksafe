/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */


var Effect3D = {};

Effect3D.createFlipTween = function(firstFace, secondFace, axis, duration) {
	var startValue = 0, endValue = -180;
	var tween = new Tween(startValue, endValue, duration, Tween.effects.linear);

	var firstFaceT3D = new Transform3D(firstFace);
	var secondFaceT3D = new Transform3D(secondFace);
	
	var switchValue = (startValue + endValue) / 2;
	var flipped;
	
	tween.onStart = function(){
		firstFace.stage.mouseChildren = false;
		secondFace.stage.mouseChildren = false;
		
		firstFace.visible = !this.reversed;
		secondFace.visible = this.reversed;
		
		flipped = false;
	}
	
	tween.onEffect = function(value, percent){
		var shouldFlipLoaders = percent>0.5;
		var rotation = !this.reversed ? value : endValue - (value - startValue);
		
		firstFaceT3D.rotateAroundRotationCenter(rotation, axis);
		secondFaceT3D.rotateAroundRotationCenter(rotation+180, axis)

		if (shouldFlipLoaders&&!flipped) {
			firstFace.visible = this.reversed;
			secondFace.visible = !this.reversed;
			flipped = true;
		}
	}
	
	tween.onFinish = function() {
		firstFaceT3D.resetTransform();
		secondFaceT3D.resetTransform();
		firstFace.stage.mouseChildren = true;
		secondFace.stage.mouseChildren = true;
	}
	
	return tween;
}

Effect3D.copyDisplayObjectAsBitmap = function (orig){
	var data = new air.BitmapData(orig.width, orig.height, true, 0);
	data.draw(orig);
	return new air.Bitmap(data);
}


Effect3D.createSingleFlipTween = function(firstFace, axis, duration) {
	var startValue = 0, endValue = -90;
	var tween = new Tween(startValue, endValue, duration, Tween.effects.linear);

	var firstFaceT3D = new Transform3D(firstFace);
	firstFaceT3D.rotationCenter.z = firstFace.width/2;
	
	var secondFace;
	var secondFaceT3D;
	var oldFilters;
	var filteredSprite;
	var firstFaceParent;
	
	var flipped;
	
	tween.onStart = function(){
		firstFace.stage.mouseChildren = false;
		firstFace.visible = true;
		
		oldFilters = firstFace.filters;
		firstFace.filters = [];	
		
		filteredSprite = new runtime.flash.display.Sprite();
		filteredSprite.filters = oldFilters;
		
		firstFaceParent = firstFace.parent;
		
		firstFaceParent.addChild(filteredSprite);
		firstFaceParent.removeChild(firstFace);
		filteredSprite.addChild(firstFace);
		
		secondFace = Effect3D.copyDisplayObjectAsBitmap(firstFace);
		filteredSprite.addChild(secondFace);
		secondFaceT3D = new Transform3D(secondFace);
		secondFaceT3D.position = firstFaceT3D.position;
		secondFaceT3D.rotationCenter.z = secondFace.width/2;
		
		// change to the other half now, as we already have a 
		// snapshot of the old image
		if(this.onHalf){
			this.onHalf();
		}
		
		flipped = false;
	}
	
	tween.onEffect = function(value, percent){
		var shouldFlipLoaders = percent>0.5;
		var rotation = !this.reversed ? value : endValue - (value - startValue);
		
		if(this.reversed){
			firstFaceT3D.rotateAroundRotationCenter(rotation, axis);
			secondFaceT3D.rotateAroundRotationCenter(rotation+90, axis);
		}else{
			firstFaceT3D.rotateAroundRotationCenter(rotation+90, axis);
			secondFaceT3D.rotateAroundRotationCenter(rotation, axis);
		}
		if (shouldFlipLoaders&&!flipped) {
			filteredSprite.swapChildren(firstFace, secondFace);
			flipped = true;
		}
	}
	
	tween.onFinish = function() {
		filteredSprite.removeChild(secondFace);
		filteredSprite.removeChild(firstFace);
		filteredSprite.filters = null;
		firstFaceParent.removeChild(filteredSprite);
		firstFaceParent.addChild(firstFace);
		firstFaceT3D.resetTransform();
		firstFace.filters = oldFilters;
		firstFace.stage.mouseChildren = true;	
		filteredSprite = null;
		secondFace.bitmapData.dispose();
		secondFace = null;
		oldFilters = null;
	}
	
	return tween;
}
Effect3D.blendBounds = function(value, bounds1, bounds2){
	var lvalue = 1-value;
	return {
		x: value*bounds1.x + lvalue*bounds2.x,
		y: value*bounds1.y + lvalue*bounds2.y,
		width: value*bounds1.width + lvalue*bounds2.width,
		height: value*bounds1.height + lvalue*bounds2.height
	};
}

Effect3D.createZoomTween = function(firstFace, duration){
	var tween = new Tween (0, 1, duration, Tween.effects.linear);
	
	tween.originalBounds = {
		x: firstFace.x,
		y: firstFace.y,
		width: firstFace.width,
		height: firstFace.height
	};
	
	tween.onStart = function(){
		firstFace.stage.mouseChildren = false;
		
		if(!this.reversed){
			firstFace.visible = true;
		}
	}

	tween.onEffect = function(value){
		var transition = this.reversed ? value : 1-value;
		var newBounds = Effect3D.blendBounds(transition, this.bounds, this.originalBounds);
		firstFace.x = newBounds.x;
		firstFace.y = newBounds.y;
		firstFace.scaleX = newBounds.width / this.originalBounds.width;
		firstFace.scaleY = newBounds.height / this.originalBounds.height;
		firstFace.alpha = 1-transition;
	}
	
	tween.onFinish = function(){
		var originalBounds = this.originalBounds;
		firstFace.x = originalBounds.x;
		firstFace.y = originalBounds.y;
		firstFace.scaleX = 1;
		firstFace.scaleY = 1;
		firstFace.alpha = 1;
		
		if(this.reversed){
			firstFace.visible = false;
		}
		firstFace.stage.mouseChildren = true;
	}
	return tween;
}