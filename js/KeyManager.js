/*
 * Copyright 2007-2008. Adobe Systems Incorporated.
 * All rights reserved.
 */

var ELS_RGN_ITEM_NAME = "Random Generated Number";
var BYTE_LENGTH = 32;

//	TODO - for test purposes only; to be removed in final app version
//air.EncryptedLocalStore.reset();
//runtime.trace("Reset ELS");

function generateKey(password) {
//	Step 1: generate a 256 bit random number (or check if one
//  such number exists in ELS)
	var randomNumber = getRandomNumber();

//	Step 2: concatenate password into a 256 bit string
	var concatenatedPass = concatPassTo256Bit(password);

//	Step 3: XOR the above two 256 bit numbers
	var xorPassAndRN = arrayBitwiseXOR(randomNumber, concatenatedPass);
	
//	Step 4: use sha256 to hash the result of the XOR
	var hash = runtime.com.adobe.crypto.SHA256.hashBytes(xorPassAndRN);
	
	return hashToByteArray(hash);
}

function generate256BitRN() {
	var num = new air.ByteArray();
	num.length = BYTE_LENGTH; //32 bytes
	
	for (var i = 0; i < BYTE_LENGTH; i++)
		num[i] = runtime.Math.floor(runtime.Math.random() * 256);
		
	return num;
}


function getRandomNumber() {
	var value = air.EncryptedLocalStore.getItem(ELS_RGN_ITEM_NAME);

	if (value == null) {
		//		This is the first Key generation and no RN was stored in ELS
		//		Generate a new RN with the flash RNG
		runtime.trace("Generated 256 bit RN");
		value = generate256BitRN();
		
		//	Step 5: Store the random number from step one in ELS
		//  in order to be able to rebuild the key later, with the propper pass
		air.EncryptedLocalStore.setItem(ELS_RGN_ITEM_NAME, value);
	}
	else
//		Getting the RN from ELS to generate the first key as the first time
		runtime.trace("Got RN from ELS");
	
	return value;
}

//Be warnend, this will truncate the pass to 32 characters if the 
//password is longer than 32 bytes
function concatPassTo256Bit(password) {
	var concatPass = new air.ByteArray();
	concatPass.length = BYTE_LENGTH;
	
	var passIndex = 0;
	for (var i = 0; i < BYTE_LENGTH; i++) {
		concatPass[i] = password.charCodeAt(passIndex);
		
		passIndex ++;
		if (passIndex == password.length)
			passIndex = 0;
	}
	
	return concatPass;
}

//Function already assumes the length of both arrays
function arrayBitwiseXOR(first, second) {
	var xorResult = new air.ByteArray();
	xorResult.length = BYTE_LENGTH;
	
	for (var i = 0; i < BYTE_LENGTH; i++)
		xorResult[i] = first[i] ^ second[i];
		
	return xorResult;
}

//Take a 256bit (32byte) hash string and return a 16 byte ByteArray
//16 bytes is the length of the key for the database encryption
function hashToByteArray(hash) {
	var key = new air.ByteArray();
	key.length = BYTE_LENGTH / 2;
	
//	Only use the first 16 bytes of the hash / string
	for (var i = 0; i < BYTE_LENGTH / 2; i++) {
		var t = parseInt("0x" + hash.substr(i, 2));
		key.writeByte(t&0x00FF);
	}
	
	return key;
}


function isPasswordValid(password) {
	var strongPasswordPattern = /(?=^.{8,32}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
	
	return strongPasswordPattern.test(password);
}
