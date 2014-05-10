//setup global variables
var version = "1.0.5";
var printer;
if(localStorage.iPhone !== null && localStorage.iPhone === false){
	checkUpdates();
}

//Check for updates
function checkUpdates(){
	var response;
	var req = new XMLHttpRequest();
	req.onload = function(e) {
       response = req.responseText;
		if(response!==null && req.status == 200){
			var current = version.split(".");
			console.log("web version "+response[0]+"."+response[1]+"."+response[2]+" current version "+current[0]+"."+current[1]+"."+current[2]);
			if(response[0]>current[0]){
				localStorage.update = "true";
			}
			else if(response[1](19,20)>current[1]){
				localStorage.update = "true";
			}
			else if(response[2]>current[2]){
				localStorage.update =  "true";
			}
			else{localStorage.update = "false";}
		}};
  req.open('GET', "http://mikedombrowski.com/pbtides-version-non-us");
  req.send(null);
}

//Parse tide data 
function findTide(highs, lows, loc_name){
//setup Vars
	console.log("finding tide");
	var currTime = Math.round(Date.now()/1000);
	highs[highs.length]=currTime;
	highs.sort(function(a, b){return a-b;});
	lows[lows.length] = currTime;
	lows.sort(function(a, b){return a-b;});
	var possible_high;
	var possible_low;
	var tide;
	var tideTime;
	var responseMessage;
	if(highs[highs.indexOf(currTime)+1]-currTime >= Math.abs(highs[highs.indexOf(currTime)-1]-currTime)){
	possible_high = highs[highs.indexOf(currTime)-1];
	}
	else {
		possible_high = highs[highs.indexOf(currTime)+1];
	}
	if(lows[lows.indexOf(currTime)+1]-currTime >= Math.abs(lows[lows.indexOf(currTime)-1]-currTime)){
	possible_low = lows[lows.indexOf(currTime)-1];
	}
	else {
		possible_low = lows[lows.indexOf(currTime)+1];
	}
	if(Math.abs(possible_high-currTime) > Math.abs(possible_low-currTime)){
		tide = "Low tide";
		tideTime = possible_low;
	}
	else {
		tide = "High tide";
		tideTime = possible_high;
	}
	console.log(tide+" "+tideTime);
	var diffTime = tideTime - currTime;
	var tideTimemin = ((diffTime)/60);
	var tideTimehr = (tideTimemin-(tideTimemin%60))/60;
	var hour;
	var timePassed = new Array("","");
	var minute;
	if((Math.round(Math.abs(tideTimemin)) == 1 || Math.round(Math.abs(tideTimemin%60)) == 1)){minute=" minute";}
		else {minute=" minutes";}
		if (Math.abs(tideTimehr) > 1){hour = " hours";}
		else {hour = " hour";}
		if(tideTimemin <= 0){
			timePassed[0] = " was ";
			timePassed[1] = " ago";}
		else {
			timePassed[0] = " is in ";
			timePassed[1] = "";}
	//Put together responseMessage
		if(Math.abs(tideTimemin)>=60) {
			if (tideTimemin%60 == "0") {
				responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour + timePassed[1];
				}
			else {
				responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour + " and " + Math.round(Math.abs(tideTimemin%60)) + minute + timePassed[1];
				}
			}
		else{
			responseMessage = tide + timePassed[0] + Math.round(Math.abs(tideTimemin)) + minute + timePassed[1];
			}
		loc_name = loc_name.replace(/-/g,', ');
		responseMessage = responseMessage + " in " +loc_name;
//compile data to be written to screen and print it
		printer = printer + responseMessage+"\n\n";
		simply.style("large");
		simply.body(printer);
}

//Actually get the tides and package it to send to parseTide
function getTides(location) {
	console.log("downloading");
	var response;
	var req = new XMLHttpRequest();
	req.onload = function(e) {
       response = JSON.parse(req.responseText);
		if(response!==null && req.status == 200){
			setData(response.contents, location);
		}};
  req.open('GET', "http://whateverorigin.org/get?url=http%3A//www.tide-forecast.com/locations/"+location+"/tides/latest");
  req.send(null);
}

function setData(response, loc_name){
	var high_tides = response.substring(response.indexOf("var high_tides = Array("), response.indexOf("var low_tides = Array("));
	var low_tides = response.substring(response.indexOf("var low_tides = Array("), response.indexOf("var hrdiff"));
	console.log(high_tides+" "+low_tides);
	high_tides = high_tides.substring(23, high_tides.length-9);
	high_tides = high_tides.split(", ");
	low_tides = low_tides.substring(22, low_tides.length-9);
	low_tides = low_tides.split(", ");
	findTide(high_tides, low_tides, loc_name);
}

//Run it
function runPos() {
	if(localStorage.update == "true"){
		printer = "A new update was found, please unload the app from your watch and reload\n\n";}
	else{printer = "";}
//Choose which locations to find tides for
	if(localStorage.location1 !== "" && localStorage.location1 !== null){
		getTides(localStorage.location1);
	}
	if(localStorage.location2 !== "" && localStorage.location2 !== null){
		getTides(localStorage.location2);
	}
	if(localStorage.location3 !== "" && localStorage.location3 !== null){
		getTides(localStorage.location3);
	}
	if(localStorage.location4 !== "" && localStorage.location4 !== null){
		getTides(localStorage.location4);
	}
    if(localStorage.location5 !== "" && localStorage.location5 !== null){
		getTides(localStorage.location5);
	}
	if(localStorage.location6 !== "" && localStorage.location6 !== null){
		getTides(localStorage.location6);
	}
	if(localStorage.location7 !== "" && localStorage.location7 !== null){
		getTides(localStorage.location7);
	}
}

//Apply Selected Configuration Options
function setUp(options){
	console.log("setup called");
	localStorage.location1 = options.location1;
	localStorage.location2 = options.location2;
	localStorage.location3 = options.location3;
	localStorage.location4 = options.location4;
	localStorage.location5 = options.location5;
	localStorage.location6 = options.location6;
	localStorage.location7 = options.location7;
	localStorage.iPhone = options.iPhone;
	mainPage();
}

//
//Pebble Listeners
//
Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL("http://mikedombrowski.com/pebbletides-config-non-us.html?loc1="+localStorage.location1+"&loc2="+localStorage.location2+"&loc3="+localStorage.location3+"&loc4="+localStorage.location4+"&loc5="+localStorage.location5+"&loc6="+localStorage.location6+"&loc7="+localStorage.location7);
});
Pebble.addEventListener("webviewclosed", function(e) {
	var options = JSON.parse(decodeURIComponent(e.response));
	console.log("Options = " + JSON.stringify(options));
		setUp(options);
	});

//
//Simply.js Stuff
//
simply.on('singleClick', function(e) {
	if(e.button == "select"){
		runPos();}
});
mainPage();
function mainPage(){
	simply.scrollable(true);
	simply.style("small");
	simply.setText({
		title: 'Pebble Tides',
		body: 'Press \'Select\' to Get Tides.\n\nCurrent Configuration:\nlocation 1: '+localStorage.location1+'\nlocation 2: '+localStorage.location2+'\nlocation 3: '+localStorage.location3+'\nlocation 4: '+localStorage.location4+'\nlocation 5: '+localStorage.location5+'\nlocation 6: '+localStorage.location6+'\nlocation 7: '+localStorage.location7+
		'\n\nBy Michael Dombrowski\nMikeDombrowski.com\n\nVersion '+version,}, true);
}
