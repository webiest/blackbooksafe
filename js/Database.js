/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */


var BBS; if (!BBS) BBS = {};
if (!BBS.Database) BBS.Database = {}

BBS.Database = {
	DATABASE_NAME : "BlackBook",
	DATABASE_FILE : null,
	sqlConnection : null,
	
	isInitialized : function() {
		this.DATABASE_FILE = air.File.applicationStorageDirectory.resolvePath(this.DATABASE_NAME);
		return this.DATABASE_FILE.exists;
	},
	
	initialize : function(password, callback) {
		//
		var success = function(event) {
			this.createTables(callback);
		};
		var failure = function(event) {
			callback(false, event.text);
		}		
		this.sqlConnection = new air.SQLConnection();
		this.sqlConnection.addEventListener(air.SQLEvent.OPEN, success.createCallback(this));
		this.sqlConnection.addEventListener(air.SQLErrorEvent.ERROR, failure.createCallback(this));
		this.sqlConnection.openAsync(this.DATABASE_FILE, air.SQLMode.CREATE, null, false, 1024
			,generateKey(password)
		);
	},
	
	finalize: function() {
		if (this.sqlConnection == null || !this.sqlConnection.connected)
			return;
	
		this.sqlConnection.close();		
	},
	
	createTables : function(callback) {
		// create tables
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = this.sqlConnection;
		stmt.text = 
			"CREATE TABLE IF NOT EXISTS Contacts ( " + 
				"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
				"firstName VARCHAR(32), " +
				"lastName VARCHAR(32), " +  
				"phone VARCHAR(32), " + 
				"email VARCHAR(64), " + 
				"website VARCHAR(256), " +
				"birthDate VARCHAR(32), " +
				"notes VARCHAR, " +
				"photo BLOB)";
		var success = function(event) {
			if (callback) callback(true);
		};
		var failure = function(event) {
			if (callback) callback(false, event.text);
		}
		//
		stmt.addEventListener(air.SQLErrorEvent.ERROR, failure);
		stmt.addEventListener(air.SQLEvent.RESULT, success);				
		stmt.execute();
	},
	
	getContactsLists: function(callback) {
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = this.sqlConnection;
		stmt.text = "SELECT * FROM Contacts";
		//
		var success = function(event) {
			var result = stmt.getResult();
			callback(true, result.data);
		};
		var failure = function(event) {
			callback(false, event.text);
		}
		//
		stmt.addEventListener(air.SQLErrorEvent.ERROR, failure);
		stmt.addEventListener(air.SQLEvent.RESULT, success);
		//
		stmt.execute();
	},
	
	getContact: function(id, callback) {
		if (!id) {
			callback(false, "Invalid id");
			return;
		}
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = this.sqlConnection;
		stmt.text = "SELECT * FROM Contacts WHERE id = :id";
		stmt.parameters[":id"] = id;
		//
		var success = function(event) {
			var result = stmt.getResult();
			callback(true, result.data);
		};
		var failure = function(event) {
			callback(false, event.text);
		}
		//
		stmt.addEventListener(air.SQLErrorEvent.ERROR, failure);
		stmt.addEventListener(air.SQLEvent.RESULT, success);
		//
		stmt.execute();
	},
	
	saveContact: function(contact, callback) {
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = this.sqlConnection;
		//
		var success = function(event) {
			var result = stmt.getResult();
			// save the id into the contact
			if (!contact.id) contact.id = result.lastInsertRowID;
			if (callback) callback(true, result.data);
		};
		var failure = function(event) {
			if (callback)  callback(false, event.toString());
		}
		//		
		if (contact.id) {
			stmt.text = "UPDATE Contacts SET " +
					"firstName = :firstName," + 
					"lastName = :lastName," +
					"phone = :phone," + 
					"email = :email," +
					"website = :website," +
					"birthDate = :birthDate," +
					"notes = :notes," +
					"photo = :photo " +
					"WHERE id = :id; ";
			stmt.parameters[":id"] = contact.id;
			stmt.parameters[":firstName"] = contact.firstName;
			stmt.parameters[":lastName"] = contact.lastName;
			stmt.parameters[":phone"] = contact.phone;
			stmt.parameters[":email"] = contact.email;
			stmt.parameters[":website"] = contact.website;
			stmt.parameters[":birthDate"] = contact.birthDate;
			stmt.parameters[":notes"] = contact.notes;
			stmt.parameters[":photo"] = contact.photo;
		} else {
			stmt.text = "INSERT INTO Contacts(firstName, lastName, phone, email, website, birthDate, notes, photo) " +
				"VALUES(:firstName, :lastName, :phone, :email, :website, :birthDate, :notes, :photo)";
			stmt.parameters[":firstName"] = contact.firstName;
			stmt.parameters[":lastName"] = contact.lastName;
			stmt.parameters[":phone"] = contact.phone;
			stmt.parameters[":email"] = contact.email;
			stmt.parameters[":website"] = contact.website;
			stmt.parameters[":birthDate"] = contact.birthDate;
			stmt.parameters[":notes"] = contact.notes;
			stmt.parameters[":photo"] = contact.photo;				
		}
		//
		stmt.addEventListener(air.SQLErrorEvent.ERROR, failure);
		stmt.addEventListener(air.SQLEvent.RESULT, success);
		//
		stmt.execute();		
	},
	
	deleteContact : function(contact, callback) {
		air.trace("Delete ", contact.id);
		if (!contact.id) {
			callback(false, "Invalid id");
			return;
		}
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = this.sqlConnection;
		stmt.text = "DELETE FROM Contacts WHERE id = :id";
		stmt.parameters[":id"] = contact.id;
		//
		var success = function(event) {
			callback(true);
		};
		var failure = function(event) {
			callback(false, event.text);
		}
		//
		stmt.addEventListener(air.SQLErrorEvent.ERROR, failure);
		stmt.addEventListener(air.SQLEvent.RESULT, success);
		//
		stmt.execute();
	}
	
};

