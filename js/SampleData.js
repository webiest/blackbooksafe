/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */

var BBS; if (!BBS) BBS = {};
if (!BBS.SampleData) BBS.SampleData = {};

BBS.SampleData = {

	SAMPLE_IMAGES_DIRECTORY: air.File.applicationDirectory.resolvePath("sampleData/images/"),
	SAMPLE_DATA_FILE : air.File.applicationDirectory.resolvePath("sampleData/contacts.csv"),
	FIELD_NAME : ["id", "firstName", "lastName", "phone", "email", "website", "birthDate", "notes", "photo"],
	sampleContacts : [],
	
	addSampleDataToDatabase : function(callback) {
		// read sample file
		var content = FileUtils.readText(this.SAMPLE_DATA_FILE);
		var lines = content.split('\n');
		var contacts = BBS.SampleData.sampleContacts;
		for (var i = 0; i < lines.length; i ++) {
			var line = String(lines[i]).trim();
			if(line == "" || line == null) continue;
			if(line.substring(0, 2) == "//") continue;
			contacts.push(this.parseCSVLine(line));
		}
		if (callback) BBS.SampleData.callback = callback;
		if (contacts.length == 0) {
			if (callback) callback(true);
			return;
		}
		BBS.Database.saveContact(contacts.pop(), this.onContactAdded.createCallback(this));
	},
	
	onContactAdded : function(result, message) {
		if (!result) {
			air.trace("Error adding sample contacts", message);
			if (this.callback) this.callback(result, message);
			return;
		}
		var contacts = BBS.SampleData.sampleContacts;
		if (contacts.length == 0) {
			if (this.callback) this.callback(true);	
			return;
		}
		BBS.Database.saveContact(contacts.pop(), this.onContactAdded.createCallback(this));		
	},
	
	parseCSVLine : function(entry) {
		var fields = entry.split(",");
	
		var contact = new BBS.Contact();
		for (var i = 0; i < fields.length; i++) {
			if (fields[i] == "") continue;
			contact[BBS.SampleData.FIELD_NAME[i + 1]] = fields[i];
		}
		// read image
		if (contact.photo != null) {
			contact.photo = FileUtils.readBytes(BBS.SampleData.SAMPLE_IMAGES_DIRECTORY.resolvePath(contact.photo));
		}
		return contact;
	}
}
