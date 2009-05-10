/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */

var BBS; if (!BBS) BBS = {};
if (!BBS.FileUtils) BBS.FileUtils = {};

var FileUtils = {
	IMAGES_DIRECTORY : air.File.applicationStorageDirectory.resolvePath("images/"),
	
	generateTempFile : function(id) {
		if (id) {
			return this.IMAGES_DIRECTORY.resolvePath(id);
		}
		return this.IMAGES_DIRECTORY.resolvePath("$temp$");
	},
	
	generateResizeTempFile : function(id) {
		if (id) {
			return this.IMAGES_DIRECTORY.resolvePath("resize_" + id);
		}
		return this.IMAGES_DIRECTORY.resolvePath("$resize_temp$");
	},
	
	moveFile : function (oldFile, newFile) {
		try {
			oldFile.moveTo(newFile, true)
		} catch(e) {}
	},
	
	deleteFile : function(file) {
		if (!file.exists) return;
		try {
			file.deleteFile();
		}catch(e) {}
	},
	
	readBytes : function (file) {
		var filestream = new air.FileStream();
		var bytes = new air.ByteArray();
		try {
			filestream.open(file, air.FileMode.READ);
			filestream.readBytes(bytes, 0, file.size);
			filestream.close();
		} catch (e) { return false; };
		return bytes;
	},
	
	readText : function (file) {
		var fileStream = new air.FileStream();
		var data = "";
		try {		
			fileStream.open(file, air.FileMode.READ);
			data = fileStream.readUTFBytes(file.size);
			fileStream.close();
		} catch (e) {}
		return data;
	},
	
	writeBytes : function (file, bytes){
		var filestream = new air.FileStream();
		try {	
			filestream.open(file, air.FileMode.WRITE);
			filestream.writeBytes(bytes, 0, bytes.length);
			filestream.close();
		} catch (e) { air.trace("Error saving:", e); return false;}
		return true;
	},
	
	resizeImage : function (originalFile, resizedFile, callback) {
		var loader = new air.Loader();
		var completeHandler = function(event) {
			var image = loader.content;
			var scaled = new air.BitmapData(84, 112);
			air.trace("Resize", image.width, image.height);
			var matrix = new air.Matrix();
			matrix.scale(84 / image.width, 112 / image.height);
			scaled.draw(image, matrix);
			var img = new air.Bitmap(scaled);
			var pngBytes = runtime.com.adobe.images.PNGEncoder.encode(img.bitmapData); 
			air.trace("Save to ", resizedFile.url, pngBytes.length);
			if (!FileUtils.writeBytes(resizedFile, pngBytes)) {
				callback(false);
			}
			callback(true, resizedFile);
		};
		var ioErrorHandler = function(event) {
			callback(false);
		};
		loader.contentLoaderInfo.addEventListener(air.Event.COMPLETE, completeHandler);
		loader.contentLoaderInfo.addEventListener(air.IOErrorEvent.IO_ERROR, ioErrorHandler);
		loader.load(new air.URLRequest(originalFile.url));
	}
		
}
