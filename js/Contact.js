/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */


var BBS; if (!BBS) BBS = {};

BBS.Contact = function(){
	this.id = null;
	this.firstName = null;
	this.lastName = null;
	this.phone = null;
	this.imagePath = BBS.Assets.IMAGE_UNAVAILABLE;
	this.smallImagePath = BBS.Assets.IMAGE_UNAVAILABLE_SMALL;
	this.email = null;
	this.website = null;
	this.birthDate = null;
	this.notes = null;
	this.photo = null;
	
	this.listDiv = null;
}


//	Commits the contact information to the database
BBS.Contact.prototype.save = function(callback){
	BBS.Database.saveContact(this, callback);
}

BBS.Contact.prototype.erase = function(callback) {
	BBS.Database.deleteContact(this, callback);
}

BBS.Contact.prototype.createContact = function (data) {	
	for (var i in data) {
		this[i] = data[i];
	}
	// if there is a photo create now the picture
	if (this.photo != null) {
		var imageFile = FileUtils.generateTempFile(this.id);
		FileUtils.writeBytes(imageFile, this.photo);
		this.imagePath = imageFile.url;
		this.smallImagePath = imageFile.url;
	}
}

BBS.Contact.prototype.generateList = function (document) {
	if (this.listDiv == null) {
		this.listDiv = BBS.Utils.getListElement(document, this.id, this.imagePath, this.firstName, this.lastName, this.phone);
		var that = this;
		this.listDiv.onclick = function (e) { BBS.Application.listToDetail(that); }		
	}
	
	return this.listDiv;
}

BBS.Contact.prototype.populateDetail = function () {
	$('detail_name').innerHTML = this.firstName + " " + this.lastName;
	$('detail_phone').innerHTML = this.phone;
	
	// add ?random_number to force image reloading
	$('detail_photo').src = this.imagePath + "?" + Math.random();
		
	$('detail_email').innerHTML = this.email;
	$('detail_website').innerHTML = this.website;
	$('detail_birthday').innerHTML = this.birthDate;
	$('detail_notes').innerHTML = this.notes;
	
	$('detailPageBorder').scrollTop = 0;
}


BBS.Contact.prototype.populateEdit = function () {
	$('edit_firstName').value = this.firstName;
	$('edit_lastName').value = this.lastName;
	$('edit_phone').value = this.phone;
	
	// add ?random_number to force image reloading
	$('edit_photo').src = this.imagePath + "?" + Math.random();
		
	$('edit_email').value = this.email;
	$('edit_website').value = this.website;
	$('edit_birthday').value = this.birthDate;
	$('edit_notes').value = this.notes;
}

BBS.Contact.prototype.updateFromEdit = function () {
	this.firstName = $('edit_firstName').value;
	this.lastName = $('edit_lastName').value;
	this.phone = $('edit_phone').value;
	
	img = $('edit_photo');
	if (!BBS.Utils.isAssetImage(img.src))
	{
		var imageFile = new air.File(img.src);
		this.photo = FileUtils.readBytes(imageFile);
	}
	else
		this.photo = null;
		
	this.email = $('edit_email').value;
	this.website = $('edit_website').value;
	this.birthDate = $('edit_birthday').value;
	this.notes = $('edit_notes').value;
}

BBS.Contact.prototype.refreshListItem = function(){
	if (!this.listDiv)
		return;
		
	var div = BBS.Utils.getListElement(document, this.id, this.imagePath, this.firstName, this.lastName, this.phone);
	this.listDiv.parentNode.replaceChild(div, this.listDiv);
	this.listDiv = div;
	
	var that = this;
	this.listDiv.onclick = function (e) { BBS.Application.listToDetail(that); }
	jQuery(this.listDiv).addClass('selectedContact');
}

BBS.Contact.prototype.updateImage = function(newImageURL) {
	// on save, these oldPath needs to be deleted
	if (!BBS.Utils.isAssetImage(this.oldImagePath)) { 
		this.oldImagePath = this.imagePath;
		this.oldSmallImagePath = this.smallImagePath;
	}
	// update image paths
	this.imagePath = newImageURL;
	this.smallImagePath = newImageURL;
	// update src to load new image
	$('edit_photo').src = this.imagePath + "?" + Math.random();
}

BBS.Contact.prototype.revertOriginalImage = function() {
	if (this.oldImagePath) {
		this.imagePath = this.oldImagePath;
		this.smallImagePath = this.oldSmallImagePath;
		delete this.oldImagePath;
		delete this.oldSmallImagePath;
		// update src to update image
		$("edit_photo").src = this.imagePath + "?" + Math.random();
	}
	// delete temporary (if exists)
	var tempFile = FileUtils.generateResizeTempFile(this.id);
	FileUtils.deleteFile(tempFile);
}

BBS.Contact.prototype.contactSaved = function() {
	// move image from temp to final position
	// contact must have an id now
	var finalFile = FileUtils.generateTempFile(this.id);
	var imageFile = new air.File(this.imagePath);
	if (imageFile.url == finalFile.url) return;
	if (BBS.Utils.isAssetImage(imageFile.url)) return;
	try {
		imageFile.moveTo(finalFile, true);
	} catch(e) {}
	// update paths 
	this.imagePath = finalFile.url;
	this.smallImagePath = finalFile.url;
	// delete old paths
	if (this.oldImagePath) {
		delete this.oldImagePath;
		delete this.oldSmallImagePath;
	}	
}
