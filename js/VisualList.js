/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */


var BBS;  if (!BBS) BBS = {};

BBS.VisualList = function (parent){
	this.contacts = [];
	this.body = parent;
	
	this.displayedContacts = [];
	this.query = "";
}

BBS.VisualList.prototype.createContacts = function(result, data) {
	if (!result) {
		// error loading contacts
		return;
	}
	if (data != null)  // data is null when DB is empty
	for (var i = 0; i < data.length; i++) {
		var contact = new BBS.Contact();
		contact.createContact(data[i]);
		this.contacts.push(contact);
		this.displayedContacts.push(contact);
	}
	
	this.generateDOMList();

	setTimeout(BBS.Application.onListReady(), 0);
}


BBS.VisualList.prototype.generateDOMList = function() {
	for (var i = 0; i < this.displayedContacts.length; i++) {
		var div = this.displayedContacts[i].generateList(this.body.ownerDocument);
		this.body.appendChild(div);
	}
}


BBS.VisualList.prototype.push = function(contact) {
	this.contacts.push(contact);

	if (this.isInSearch(contact))
		this.addToDisplayList(contact);
}

BBS.VisualList.prototype.addToDisplayList = function(contact) {
	this.displayedContacts.push(contact);
	var div = contact.generateList(this.body.ownerDocument);
	this.body.appendChild(div);
}


BBS.VisualList.prototype.removeElement = function(element) {
	this.contacts.splice(this.elementIndex(element), 1);
	
	if (this.isInSearch(element))
		this.removeFromDisplayList(element);
}


BBS.VisualList.prototype.removeFromDisplayList = function(contact) {
	this.body.removeChild(contact.listDiv);
//	Methods to/from display list - index, contact etc.
	for (var i = 0; i < this.displayedContacts.length; i++) {
		if (this.displayedContacts[i] == contact){
			this.setCurrent(this.displayedContacts[i+1] || this.displayedContacts[i-1]);
			this.displayedContacts.splice(i, 1);
			return;
		}
	}
}

BBS.VisualList.prototype.elementIndex = function(element) {
//	This can be done more effectively by finding a way to get
//	the contact without iterating over the array
	for (var i = 0; i < this.contacts.length; i++) {
		if (this.contacts[i] == element)
			return i;
	}
}


BBS.VisualList.prototype.elementAt = function(index) {
	return this.contacts[index];
}


BBS.VisualList.prototype.displayElementAt = function(index) {
	return this.displayedContacts[index];
}

BBS.VisualList.prototype.displayElementIndex = function(element) {
//	This can be done more effectively by finding a way to get
//	the contact without iterating over the array
	for (var i = 0; i < this.displayedContacts.length; i++) {
		if (this.displayedContacts[i] == element)
			return i;
	}
	return -1;
}

BBS.VisualList.prototype.isInSearch = function(contact){
	var target = (contact.firstName + contact.lastName).replace(/ /g,'');
	target = target.toLowerCase();
	var index = target.search(this.query);
	if (index >= 0)
		return true;
		
	return false;
}

BBS.VisualList.prototype.clearDisplayList = function() {
	while(this.displayedContacts.length > 0)  //isEmpty()
		this.removeFromDisplayList(this.displayedContacts[0]);
}

BBS.VisualList.prototype.regenDisplayedContacts = function(query) {
	this.query = query;
	
	this.clearDisplayList();
	for (var i = 0; i < this.contacts.length; i++) {
		if (query == "" || this.isInSearch(this.contacts[i]))
			this.addToDisplayList(this.contacts[i]);
	}
}

BBS.VisualList.prototype.setCurrent = function(item){
	var elemMethods = this.body.ownerDocument.defaultView.Element.Methods;
	
	if(this.current && this.current.listDiv){
		jQuery(this.current.listDiv).removeClass("selectedContact");
	}
	 
	this.current = item;
	
	if(this.current && this.current.listDiv){
		this.current.listDiv.scrollIntoViewIfNeeded();
		jQuery(this.current.listDiv).addClass("selectedContact");
	}
}
	
BBS.VisualList.prototype.deleteAll = function() {
	$("listPageBorder").innerHTML = "";
	this.contacts = [];
	this.displayedContacts = [];
	this.query = "";
}
