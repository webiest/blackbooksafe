/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */


var BBS;  if (!BBS) BBS = {};
if (!BBS.Application) BBS.Application = {};

BBS.Application = {
	loaders : [],
STATE_LIST : "applicationStateList",
 STATE_DETAIL : "applicationStateDetail",
 STATE_EDIT : "applicationStateEdit",
 STATE_LOGIN : "applicationStateLogin",
 STATE_CREATEDB : "applicationStateCreateDB",
	STATE_CONFIRMDEL : "applicationStateConfirmDelete",
	STATE_ABOUT : "applicationStateAbout",
	
	newAccount : false,
	
//	Dom elements for divs - now each in its own HTMLLoader
	firstPage : null,
	listPage : null,
	detailPage : null,
	editPage : null,
	
	firstPagePassField : null,
	
	visualList : null,

state : null,
	
	initialize : function() {
		var stage = htmlLoader.stage;
	
		stage.transform.perspectiveProjection.focalLength = 800;

		stage.addEventListener("keyDown",this.onKeyDown.createCallback(this), true);

		this.createHTMLLoaders();
	},
	
	onKeyDown : function(event) {
		if (event.target.stage.mouseChildren == true) {
			
			switch(this.state){
				
				case this.STATE_DETAIL:
				{
					switch (event.keyCode) {
						case air.Keyboard.LEFT:
							this.detailPrev();
							event.stopPropagation();
							break;
						case air.Keyboard.RIGHT:
							this.detailNext();
							event.stopPropagation();
							break;
						case air.Keyboard.UP:
						case air.Keyboard.DOWN:
							this.detailToEdit();
							event.stopPropagation();
							break;
						case air.Keyboard.ESCAPE:
							this.detailToList();
							event.stopPropagation();
							break;
					case air.Keyboard.DELETE:
						this.askDeleteConfirmation();
						event.stopPropagation();
						break;
					}
					break;
				}
				
				case this.STATE_LIST:
				{
					switch(event.keyCode){
						case air.Keyboard.DOWN:
							this.detailNext();
							event.stopPropagation();
							break;
						case air.Keyboard.UP:
							this.detailPrev();
							event.stopPropagation();
							break;
						case air.Keyboard.ENTER:
							this.listToDetail();
							event.stopPropagation();
							break;
						case air.Keyboard.ESCAPE:
							// if the user presses escape two times, 
							// we clear the search box
							if(!this.escapeCount) this.escapeCount = 1;
							else this.escapeCount ++;
							
							if(this.escapeCount>=2){
								$('searchBox').value = '';
								this.onSearchInsert();
								event.stopPropagation();
								this.escapeCount = 0;
							}
							break;
						default:
							// other keys will just focus the search box
							this.focusField( $('searchBox') );
							break;
					}
					break;
				}
			
				case this.STATE_EDIT:
				{
				switch (event.keyCode) {
					case air.Keyboard.ESCAPE:
						this.cancelEdit();
						event.stopPropagation();
						break;
					case air.Keyboard.ENTER:
					case air.Keyboard.NUMPAD_ENTER:
						this.saveContact();
						event.stopPropagation();
						break;

					}
					break;
				}
			
				case this.STATE_CREATEDB:
				{
					if (event.keyCode == air.Keyboard.ENTER ||
						event.keyCode == air.Keyboard.NUMPAD_ENTER) {
							this.createAccount();
							event.stopPropagation();
					}
					break;
				}
			
				case this.STATE_LOGIN:
				{
					if (event.keyCode == air.Keyboard.ENTER ||
						event.keyCode == air.Keyboard.NUMPAD_ENTER) {
							this.openAccount();
							event.stopPropagation();
					}
					break;
				}
			
				case this.STATE_CONFIRMDEL:
				{
				switch (event.keyCode) {
					case air.Keyboard.ENTER:
					case air.Keyboard.NUMPAD_ENTER:
						this.deleteContact();
						event.stopPropagation();
						break;
						
					case air.Keyboard.ESCAPE:
						this.hideConfirmDialog();
						event.stopPropagation();
						break;
				}
				break;
				}
				
				case this.STATE_ABOUT:
				{
				switch (event.keyCode) {
					case air.Keyboard.ENTER:
					case air.Keyboard.NUMPAD_ENTER:
					case air.Keyboard.ESCAPE:
						this.hideAbout();
						event.stopPropagation();
						break;
				}
				break;
				}
			} // end switch
		} // end if
	},
	
	createHTMLLoaders : function() {
		
		var paths = ["loginPage.html", "newUserPage.html", "listPage.html",
				"detailPage.html", "editPage.html", "confirmDeletePage.html",
				"aboutPage.html"];
		var leftToLoad = paths.length;
		var onLoadComplete = function(event) 
			{
				air.trace("Loaded");
				var loader = event.target;
				loader.width = loader.window.document.width;
				loader.height = loader.window.document.height;
			
				leftToLoad --;
				if (!leftToLoad) BBS.Application.loadersCreated();
			};
		//
		for (var i = 0; i < paths.length; i ++) {
			var loader = BBS.Utils.createHTMLLoader(paths[i], onLoadComplete);
			loader.x = 70;
			loader.y = 20;
			htmlLoader.stage.addChild(loader);
			loader.visible = false;
			// needed to prevent destruction
			this.loaders[i] = loader; 
		}
	},
	
	// step2
	loadersCreated : function() {
		// register event listeners for all pages
		this.registerHandlers();
		this.initIdleMonitor();
		
		if (BBS.Database.isInitialized()) {
			this.state = this.STATE_LOGIN;
			this.firstPage = $('loginPage');
			this.firstPagePassField = $('password');
			
		}
		else {
			this.state = this.STATE_CREATEDB
			this.firstPage = $('newUserPage');
			this.firstPagePassField = $('new_password');
		}
		
		
		this.detailPage = $('detailPage');
		this.listPage = $('listPage');
		this.editPage = $('editPage');
		this.confirmDeletePage = $('confirmDeletePage');
		this.aboutPage = $('aboutPage');
		
		this.editPage.htmlLoader.x = 120;
		this.editPage.htmlLoader.y = 70;
		
		this.detailPage.htmlLoader.x = 120;
		this.detailPage.htmlLoader.y = 70;

		this.firstPage.show();

		this.confirmDeletePage.htmlLoader.x = 120;
		this.confirmDeletePage.htmlLoader.y = 170;

		this.aboutPage.htmlLoader.x = 91.5;
		this.aboutPage.htmlLoader.y = 144;

		this.focusField( this.firstPagePassField );		
	},
	
	registerHandlers : function() {
		var moveFunction = function() {nativeWindow.startMove()};
		// login page
		$("loginheader").onmousedown = moveFunction;
		$("closelogin").addEventListener("click", this.exitApplication.createCallback(this));
		$("oklogin").addEventListener("click", this.openAccount.createCallback(this));
		// list page
		$("listheader").onmousedown = moveFunction;
		$("close").addEventListener("click", this.exitApplication.createCallback(this));
		$("minimize").addEventListener("click", this.minimizeApplication.createCallback(this));
		$("searchBox").oninput = this.onSearchInsert.createCallback(this);
		$("add").addEventListener("click", this.addContact.createCallback(this));
		$("viewAbout_btn").addEventListener("click", this.viewAbout.createCallback(this));
		$("viewSources_btn").addEventListener("click", this.viewSources.createCallback(this));
		// detail page
		$("detailheader").onmousedown = moveFunction;
		$("closedetails").addEventListener("click", this.detailToList.createCallback(this));
		$("detailPageBorder").addEventListener("dblclick", this.detailToEdit.createCallback(this));
		$("prevdetails").addEventListener("click", this.detailPrev.createCallback(this));
		$("nextdetails").addEventListener("click", this.detailNext.createCallback(this));
		$("backdetails").addEventListener("click", this.detailToList.createCallback(this));
		$("deletedetails").addEventListener("click", this.askDeleteConfirmation.createCallback(this));
		$("editdetails").addEventListener("click", this.detailToEdit.createCallback(this));
		// edit page
		$("editheader").onmousedown = moveFunction;
		$("closeedit").addEventListener("click", this.cancelEdit.createCallback(this));
		$("photo_wrapper").ondrop = this.fileDrop.createCallback(this);
		$("canceledit").addEventListener("click", this.cancelEdit.createCallback(this));
		$("okedit").addEventListener("click", this.saveContact.createCallback(this));
		// new user page
		$("newheader").onmousedown = moveFunction;
		$("closecreatepass").addEventListener("click", this.exitApplication.createCallback(this));
		$("okcreatepass").addEventListener("click", this.createAccount.createCallback(this));
		//confirm delete page
		$("confirmheader").onmousedown = moveFunction;
		$("cancelconfirm").addEventListener("click", this.hideConfirmDialog.createCallback(this));
		$("okconfirm").addEventListener("click", this.deleteContact.createCallback(this));
		//About box
		$("aboutheader").onmousedown = moveFunction;
		$("okabout").addEventListener("click", this.hideAbout.createCallback(this));
		$("closeabout").addEventListener("click", this.hideAbout.createCallback(this));
	},
	
	initIdleMonitor : function(threshold) {
		var nativeApp = air.NativeApplication.nativeApplication;
	
		if (threshold != null && threshold > 4)
			nativeApp.idleThreshold = threshold;
		nativeApp.addEventListener(air.Event.USER_IDLE, this.onUserIdle.createCallback(this));
	},
	
	invalidatePasswordFields:function() {
		$('new_password').shake();
		$('new_password').className = "badPassword";
		$('new_password').value = "";
		$('confirm_password').className = "badPassword";
		$('confirm_password').value = "";
		this.focusField( $('new_password') );
	},
	
	createAccount : function () {
		var newPass = $('new_password').value;
		var confirmedPass = $('confirm_password').value;
		var userText = $('newUser_text');
	
		
		if(newPass == null || newPass.length <=0) {
			this.invalidatePasswordFields();
			userText.innerHTML = '<span class="hint">' + 
								'Please specify a password!' + '</span>';
			return;
		}
		
		if(!isPasswordValid(newPass)) {
			this.invalidatePasswordFields();
			userText.innerHTML = '<span class="hint">' + 
				'The password should be 8-32 characters long and contain at least one ' +
				'lowercase letter, one uppercase letter and one number or symbol.'
				+ '</span>';
			return;
		}
		
		if (newPass != confirmedPass) {
			this.invalidatePasswordFields();
			userText.innerHTML = '<span class="hint">' + 
						'The two passwords do not match' +
						'</span>';
		} else {
			window.htmlLoader.stage.mouseChildren = false;
			var success = function(result, message) {
				if (!result) {
				air.trace("Cannot create database:", message);
					return;
				}
				// callback for addSample
				var sampleSuccess = function(result) {
					this.onDatabaseOpened(result);					
				}
				// add sample data
				
				BBS.SampleData.addSampleDataToDatabase(sampleSuccess.createCallback(this));
			};
			BBS.Database.initialize(newPass, success.createCallback(this));
		}
	},
	
	openAccount : function () {
		var password = $("password").value;
		$("password").value = "";
		$("password").className = "goodPassword";
		if (password) { 
			BBS.Database.initialize(password, this.onDatabaseOpened.createCallback(this));
		}
	},
	
	onDatabaseOpened : function(result, message) {
		window.htmlLoader.stage.mouseChildren = true;
		if (result) {
			this.visualList = new BBS.VisualList($('listPageBorder'));
			BBS.Database.getContactsLists(this.visualList.createContacts.createCallback(this.visualList))
		} else {
			air.trace("ERROR:", message);
			this.onLoginError();
			// database cannot be opened (wrong password)
		}
	},
	
	focusField: function(field){
		// we have to change the focus the owner htmlLoader too
		htmlLoader.stage.focus = field.ownerDocument.defaultView.htmlLoader;
		field.focus();		
	},
	
	onListReady : function() {
		this.state = this.STATE_LIST;
		this.firstPage.hide();
		this.listPage.show();
		this.focusField( $('searchBox') );
	},
	
	onLoginError : function() {
		$('password').shake();
		$('password').className = "badPassword";
		this.focusField( $('password') );
	},
	
	listToDetail : function (contact) {
		if(contact){
			this.visualList.setCurrent(contact);
		}else if(!this.visualList.current){
			// if no contact is specified use the currently selected one,
			// but in case we do not have any selected item fail silently
			return;
		}
		this.state = this.STATE_DETAIL;
		this.visualList.current.populateDetail();
		//
		this.listPage.blenderHide();
		this.detailPage.zoomShow(BBS.getBounds(this.visualList.current.listDiv));
	},
	
	listToNewContact : function (contact) {
		this.state = this.STATE_EDIT;
		this.visualList.setCurrent(contact);
		this.visualList.current.populateEdit();
		
		this.listPage.blenderHide();
		this.editPage.zoomShow(BBS.getBounds($('listPageBorder')));
		
		$('editPageBorder').scrollTop = 0;
		this.focusField( $('edit_firstName') );
	},
	
	detailToList : function(contactDeleted){
		this.state = this.STATE_LIST;
		var contact = this.visualList.current;
		if(contactDeleted && typeof contactDeleted == "boolean"){
			this.detailPage.blenderDisolve();
		}else{
			if (contact&&contact.listDiv){
				contact.listDiv.scrollIntoViewIfNeeded();
				this.detailPage.zoomHide(BBS.getBounds(contact.listDiv));
			}else{
				this.detailPage.zoomHide(BBS.getBounds($('listPageBorder')));
			}			
		}	
		this.listPage.blenderShow();
	},
	
	detailToEdit : function(){
		if (!this.visualList.current) {
//			Fail silently
			return;
		}
		this.state = this.STATE_EDIT;
		this.visualList.current.populateEdit();
		$('editPageBorder').scrollTop = 0;
		this.focusField( $('edit_firstName') );
		this.detailPage.flipX(this.editPage, false);
	},
	
	detailNext : function() {
		var list = this.visualList;
		var index = list.displayElementIndex(this.visualList.current);
		
		var item = list.displayElementAt(index + 1);
		var _self = this;
		if (item){
			list.setCurrent(item);
			if(this.state==this.STATE_DETAIL){
				this.detailPage.flipY(false, function(){
					_self.currentContact = item;
					_self.currentContact.populateDetail();
				});
			}			
		}
		else {
			this.detailPage.shake();
//			TODO - do something here
			runtime.trace("Next: End of contact list");
		}
	},

	detailPrev : function() {
		var list = this.visualList;
		var index = list.displayElementIndex(this.visualList.current);
		if(index==-1) index = list.displayedContacts.length;
		
		var item = list.displayElementAt(index - 1);
		if (item){
			list.setCurrent(item);
			if(this.state==this.STATE_DETAIL){
				var _self = this;
				this.detailPage.flipY(true, function(){
					_self.currentContact = item;
					_self.currentContact.populateDetail();
				});
			}
		}
		else {
			this.detailPage.shake();
//			TODO - do something here
			runtime.trace("Prev: End of contact list");
		}
	},
	
	addContact : function() {
		this.listToNewContact(new BBS.Contact());
	},	
	
	saveContact: function() {
		this.state = this.STATE_DETAIL;
		var ci = this.visualList.current;
		var isNew = (ci.id == null);

		this.detailPage.flipX(this.editPage, true);
		ci.updateFromEdit();
		var _self = this;
		var success = function(result, message) {
			if (!result) {
				air.trace("ERROR:", message);
				return;
			}
			// this will update images
			ci.contactSaved();
			if (isNew) {
				_self.visualList.push(ci);
				_self.visualList.setCurrent(ci);
			} else {
				ci.refreshListItem();
			}
			//
			ci.populateDetail();
			};	
		ci.save(success.createCallback(this));
	},
	
	cancelEdit: function() {
		var ci = this.visualList.current;
		if (ci && ci.id){
			this.state = this.STATE_DETAIL; 
			this.detailPage.flipX(this.editPage, true);
		} else {
			this.state = this.STATE_LIST;
			this.visualList.setCurrent(null);
			this.editPage.zoomHide(BBS.getBounds($('listPageBorder')));
			this.listPage.blenderShow();
		}
	},
	
	deleteContact : function() {
		this.hideConfirmDialog();
		var ci = this.visualList.current;
			ci.erase(success);
			
			var _self = this;
			function success(){
				_self.visualList.removeElement(ci);
			}
			
			// when a contact is deleted we use the disolve effect
			this.detailToList(true);
	},
	
	
	askDeleteConfirmation : function() {
		var ci = this.visualList.current;

		$("confirmText").innerHTML = 'Are you sure you want to remove '
				+ ci.firstName + " " + ci.lastName +
				" from your contact list?";
		
		var stage = window.htmlLoader.stage;
		stage.setChildIndex(this.confirmDeletePage.htmlLoader, stage.numChildren-1);
		this.confirmDeletePage.show();
		this.detailPage.htmlLoader.mouseChildren = false;
		this.state = this.STATE_CONFIRMDEL;
	},
	
	
	hideConfirmDialog : function() {
		this.detailPage.htmlLoader.mouseChildren = true;
		this.state = this.STATE_DETAIL;
		this.confirmDeletePage.hide();
	},
	
		
	onUserIdle : function() {
		if (this.state != this.STATE_LOGIN &&
			this.state != this.STATE_CREATEDB)
				this.logout();
	},
	
	
	logout : function() {
		var stage = window.htmlLoader.stage;

		stage.mouseChildren = false;
		
		BBS.Database.finalize();
		this.visualList.deleteAll();
		this.visualList = null;
		this.currentItem = null;
		
		stage.mouseChildren = true;
		$('newUserPage').hide();
		$('detailPage').hide();
		$('listPage').hide();
		$('listPage').blenderShow();
		$('listPage').hide();
		$('editPage').hide();
		$('aboutPage').hide();
		this.state = this.STATE_LOGIN;		
		this.firstPage = $('loginPage');
		this.firstPage.show();
		
		this.focusField($('password'));
	},
	
	minimizeApplication : function() {
		window.nativeWindow.minimize();
	},
	
	exitApplication : function() {
		BBS.Database.finalize();
		air.NativeApplication.nativeApplication.exit();
//		TODO - should clean, at least now, the images folder
	},
	
	onSearchInsert : function() {
		var query = (($('searchBox').value).trim()).replace(/ /g, '');
		query = query.toLowerCase();
		this.visualList.regenDisplayedContacts(query);
		this.escapeCount = 0;
	},
	
	// drag/drop function
	fileDrop : function(event) {
		var contact = this.visualList.current;
		//
		var callback = function(success, resizedFile) {
			// if resize failed, bail out
			if (!success) {
				// revert image to original
				contact.revertOriginalImage();
				return;
			};
			// update image src
			contact.updateImage(resizedFile.url);
		};
		// even if we receive a list of files
		// we will stop to the first image file
		var fileList = event.dataTransfer.getData("application/x-vnd.adobe.air.file-list");
		if (fileList) 
		{
			var imageFile = FileUtils.generateResizeTempFile(contact.id);
			for (i=0; i < fileList.length; i++) 
			{
				var file = fileList[i];
				file.canonicalize();
				// no folder
				if (file.isDirectory) continue; 
				var ext = file.extension; //getExtension(file);
				// allow only images
				if (ext.match(/png|jpg|gif|jpeg/i))
				{
					contact.updateImage(BBS.Assets.LOADER);
					FileUtils.resizeImage(file, imageFile, callback.createCallback(this));
				}
			}
		}
	},
	
	viewAbout: function(){
		var stage = window.htmlLoader.stage;
		stage.setChildIndex(this.aboutPage.htmlLoader, stage.numChildren-1);
		this.state = this.STATE_ABOUT;
		this.listPage.htmlLoader.mouseChildren = false;
		this.aboutPage.wavesShow();
	},
	
	hideAbout:function() {
		this.state = this.STATE_LIST;
		this.listPage.htmlLoader.mouseChildren = true;
		this.aboutPage.wavesHide();
	},
	
	viewSources: function(){
		var sb = air.SourceViewer.getDefault();
		var cfg = {
				exclude : [],
				colorScheme: 'nightScape'
			};
		sb.setup(cfg);
		sb.viewSource();
	}	
}


var $ = function(e) {
	var la = BBS.Application.loaders;
	for (var i = 0; i < la.length; i++) {
		var el = la[i].window.document.getElementById(e);
		if (el != null) {
			el.htmlLoader = la[i];
			el.show = function(){
				this.htmlLoader.stage.mouseChildren = true;
				this.htmlLoader.visible = true;
			}	
			el.hide = function(){
				this.htmlLoader.visible = false;
			}
			el.getTween = function (name, createCallback, callback){
				if (!this.tweens) {
					this.tweens = {};
				}
				var tween = this.tweens [ name ];
				if (!tween) {
					var self = this;
					// if we can't find the tween by name, call the create callback and save the tween on finish
					createCallback(function(tween){
						self.tweens[name] = tween;
						callback(tween);
					});
				}else{
					callback(tween);
				}
			}
			el.getBlenderTween = function(callback, url, duration, transition){
				var self = this;
				this.getTween("blender_"+url, function(saveTweenCalblack){
					BlenderEffect.get(url, function(shader){
						saveTweenCalblack( BlenderEffect.createShaderTransition( self.htmlLoader, shader , duration, transition) );
					});
				}, callback);
			}
			
			el.getPageBlenderTween = function(callback){
				this.getBlenderTween(callback, "app:/assets/blender/page.pbj", 1200, Tween.effects.elasticEase);
			}
			
			el.blenderShow = function(){
				this.show();
				this.htmlLoader.mouseChildren = true;
				this.htmlLoader.tabEnabled = true;
				this.getPageBlenderTween(function(tween){ tween.keepTheEffect = false; tween.start(true); });
			}
			
			el.blenderHide = function(){
				this.show();
				// disable mouse events on the list html loader
				// as we don't want users to select the background list
				this.htmlLoader.mouseChildren = false;
				this.htmlLoader.tabEnabled = false;
				this.htmlLoader.stage.focus = null;
				this.getPageBlenderTween(function(tween){ tween.keepTheEffect = true; tween.start(false); });
			}
			
			el.blenderDisolve = function(){
				this.htmlLoader.stage.mouseChildren = false;
				this.getBlenderTween( function(tween){ tween.hideOnFinish = true; tween.start(false) }, "app:/assets/blender/disolve.pbj", 500, Tween.effects.linear);
			}
			
			el.blenderAppear = function(){
				this.show();
				this.htmlLoader.stage.mouseChildren = true;
				this.getBlenderTween( function(tween){ tween.hideOnFinish = false; tween.start(true) }, "app:/assets/blender/disolve.pbj", 500, Tween.effects.linear);
			}
			
			el.getWavesTween = function (callback) {
				var shaderParams = {
					waves: 2,
					weight: 0.9
				};
				this.getBlenderTween( function (tween) { 
					tween.shaderParams = shaderParams; 
					callback(tween);
				}, "app:/assets/blender/waves.pbj", 1200, Tween.effects.linear);
			}
			
			el.wavesShow = function() {
				this.show();
				this.getWavesTween( function(tween){ tween.hideOnFinish = false; tween.start(false) } );
			}
			
			el.wavesHide = function() {
				this.getWavesTween( function(tween){ tween.hideOnFinish = true; tween.start(true) } );
			}
			
			el.getShakeTween = function (callback) {
				var shaderParams = {
					waves: 2,
					weight: 0.9
				};
				this.getBlenderTween( function (tween) { 
					tween.shaderParams = shaderParams; 
					callback(tween);
				}, "app:/assets/blender/shake.pbj", 1000); 
			}
			
			el.shake = function() {
				this.getShakeTween( function(tween){
							tween.hideOnFinish = false;
							tween.disableInteraction = true;
							tween.start(false) } );
			}
			
			el.getFlipTween  = function(callback, flipName, secondObject, axis, duration){
				var self = this;
				this.getTween("flip"+flipName, function(saveTweenCalblack){
					saveTweenCalblack( Effect3D.createFlipTween(self.htmlLoader, secondObject.htmlLoader, axis, duration) );
				}, callback);
			}
			
			el.getFlipXTween = function(callback, toEl){
				this.getFlipTween (callback, "x", toEl, air.Vector3D.X_AXIS, 200 );
			}
			
			el.flipX = function(toEl, reversed){
				this.getFlipXTween(function(tween){ tween.start(reversed) }, toEl);
			}
			
			el.getSingleFlipTween  = function(callback, flipName, axis, duration){
				var self = this;
				this.getTween("flip"+flipName, function(saveTweenCalblack){
					saveTweenCalblack( Effect3D.createSingleFlipTween(self.htmlLoader, axis, duration) );
				}, callback);
			}
			
			el.getSingleFlipYTween = function(callback){
				this.getSingleFlipTween (callback, "singleY", air.Vector3D.Y_AXIS, 300 );
			}
			
			el.flipY = function(reversed, onHalf){
				this.getSingleFlipYTween(function(tween){ tween.onHalf = onHalf; tween.start(!reversed) });
			}
			
			el.getZoomTween  = function(callback){
				var self = this;
				this.getTween("zoom", function(saveTweenCalblack){
					saveTweenCalblack( Effect3D.createZoomTween(self.htmlLoader, 300) );
				}, callback);
			}
			
			el.zoomShow = function (bounds){
				this.getPageBlenderTween(function(tween){ tween.duration = 1500; tween.keepTheEffect = false; tween.start(true); });
				this.getZoomTween(function(tween){ tween.bounds = bounds; tween.start(false) });
			}
			
			el.zoomHide = function (bounds){
				this.getPageBlenderTween(function(tween){ tween.keepTheEffect = false; tween.start(false); });
				this.getZoomTween(function(tween){ tween.bounds = bounds; tween.start(true) });
			}			
			return el; 
		}
	}
	
	return null;
}
