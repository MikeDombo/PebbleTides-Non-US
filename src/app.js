var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');
var version = '2.9';
var allTideData;
if(typeof localStorage.allTideData !== "undefined" && localStorage.allTideData !== null && localStorage.allTideData !== ""){allTideData = JSON.parse(localStorage.allTideData);}
if(typeof allTideData === "undefined"){allTideData = {location1:{displayName:"", lookupName:""}, location2:{displayName:"", lookupName:""}, location3:{displayName:"", lookupName:""}, location4:{displayName:"", lookupName:""}, location5:{displayName:"", lookupName:""}, location6:{displayName:"", lookupName:""}, location7:{displayName:"", lookupName:""}, hourFormat: "12h", units: "M"};
				localStorage.allTideData = JSON.stringify(allTideData);}
if(allTideData.units === null || typeof allTideData.units === "undefined"){allTideData.units = "M";}
console.log(localStorage.allTideData);
var menu;

function updateCheck(){
	ajax(
  {
	url: 'http://mikedombrowski.com/pebtides-nonus/version/'+version+'/new.txt',
    type: 'text'
  },
  function(data) {
	console.log('New Version Found! Version: '+data);
	localStorage.update = 'true';
  },
  function(error) {
    console.log('No New Update!');
	localStorage.update = 'false';
  });
}

updateCheck();

//Parse tide data 
function parseTide(tides, index, loc_name){
//setup Vars
	console.log("finding tide");
	var currTime = Math.round(Date.now()/1000);
	var tide;
	var tideTime = tides[index];
	var responseMessage;
	if(index%2===0){
		tide = "High tide";
	}
	else{
		tide = "Low tide";
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
		var date = new Date(tideTime * 1000);
		var tideTimeStr;	
		var minutes;
		if(date.getMinutes()<10){minutes = "0"+date.getMinutes();}
		else{minutes = date.getMinutes();}
		if(allTideData.hourFormat == "12h" && date.getHours()>12){
			tideTimeStr = (date.getHours()-12)+":"+minutes+" PM";
		}
		else if (allTideData.hourFormat == "12h"){
			if (date.getHours() === 0){
				tideTimeStr = "12:"+minutes+" AM";
			}
			else if (date.getHours() >= 12){
				tideTimeStr = date.getHours()+":"+minutes+" PM";
			}
			else {
				tideTimeStr = date.getHours()+":"+minutes+" AM";
			}
		}
		else if (allTideData.hourFormat == "24h" && date.getHours() === 0){
			tideTimeStr = date.getHours()+"0"+":"+minutes;
		}
		else{tideTimeStr = date.getHours()+":"+minutes;}
		responseMessage = responseMessage + " ("+tideTimeStr+") in " +loc_name;
	//compile data to be written to screen and print it
	var resultCard = new UI.Card({title: "Tide Aware Result", body:responseMessage, scrollable:true});
	resultCard.show();
}

function setData(response, loc_name){
	var high_tides = response.substring(response.indexOf("var high_tides = Array("), response.indexOf("var low_tides = Array("));
	var low_tides = response.substring(response.indexOf("var low_tides = Array("), response.indexOf("var hrdiff"));
	loc_name = response.substring(response.indexOf("Today's tide times for ")+23, response.indexOf("</h2>\n\n"));
	console.log(high_tides+" "+low_tides);
	high_tides = high_tides.substring(23, high_tides.length-9);
	high_tides = high_tides.split(", ");
	low_tides = low_tides.substring(22, low_tides.length-9);
	low_tides = low_tides.split(", ");
	var currTime = Math.round(Date.now()/1000);
	high_tides[high_tides.length]=currTime;
	high_tides.sort(function(a, b){return a-b;});
	low_tides[low_tides.length] = currTime;
	low_tides.sort(function(a, b){return a-b;});
	var highs = high_tides;
	var lows = low_tides;
	var possible_high;
	var possible_low;
	var next_high;
	var next_low;
	if(highs[highs.indexOf(currTime)+1]-currTime >= Math.abs(highs[highs.indexOf(currTime)-1]-currTime)){
		possible_high = highs[highs.indexOf(currTime)-1];
		next_high = highs[highs.indexOf(currTime)+1];
	}
	else {
		possible_high = highs[highs.indexOf(currTime)+1];
		next_high = highs[highs.indexOf(currTime)+2];
	}
	if(lows[lows.indexOf(currTime)+1]-currTime >= Math.abs(lows[lows.indexOf(currTime)-1]-currTime)){
		possible_low = lows[lows.indexOf(currTime)-1];
		next_low = lows[lows.indexOf(currTime)+1];
	}
	else {
		possible_low = lows[lows.indexOf(currTime)+1];
		next_low = lows[lows.indexOf(currTime)+2];
	}
	var tides = new Array(possible_high, possible_low, next_high, next_low);
	
	var times = [];
	for(var i=0; i<4; i++){
		var date = new Date(tides[i] * 1000);
		var tideTimeStr;	
		var minutes;
		if(date.getMinutes()<10){minutes = "0"+date.getMinutes();}
		else{minutes = date.getMinutes();}
		if(allTideData.hourFormat == "12h" && date.getHours()>12){
			tideTimeStr = (date.getHours()-12)+":"+minutes+" PM";
		}
		else if (allTideData.hourFormat == "12h"){
			if (date.getHours() === 0){
				tideTimeStr = "12:"+minutes+" AM";
			}
			else if (date.getHours() >= 12){
				tideTimeStr = date.getHours()+":"+minutes+" PM";
			}
			else {
				tideTimeStr = date.getHours()+":"+minutes+" AM";
			}
		}
		else if (allTideData.hourFormat == "24h" && date.getHours() === 0){
			tideTimeStr = date.getHours()+"0"+":"+minutes;
		}
		else{tideTimeStr = date.getHours()+":"+minutes;}
		var months =["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var month = months[date.getMonth()];
		times.push(date.getDate()+" "+month+" " + tideTimeStr);
	}
	var tideMen = [];
	tideMen.push({title:'High Tide',subtitle:times[0]});
	tideMen.push({title:'Low Tide',subtitle:times[1]});
	tideMen.push({title:'High Tide',subtitle:times[2]});
	tideMen.push({title:'Low Tide',subtitle:times[3]});
	var tideMenu = new UI.Menu({sections: [{title: 'Tides in '+loc_name, items: tideMen}]});
	tideMenu.on('select', function(e){parseTide(tides, e.itemIndex, loc_name);});
	tideMenu.show();
}

//Actually get the tides and package it to send to parseTide
function getTides(zip) {
	zip = encodeURIComponent(zip);
	console.log("called getTides using: "+zip);
	ajax(
  {
    url: 'http://www.tide-forecast.com/locations/'+zip+'/tides/latest'
  },
  function(result) {
    // Success!
	
	ajax(
	{
		url: 'http://mikedombrowski.com/analytics.php?location='+zip+'&US=FALSE&ID='+Pebble.getAccountToken()+'&settings='+encodeURIComponent(JSON.stringify(allTideData))+"&ver="+version
	},
	function(data){}, function(error){});
  

    console.log('success '+JSON.stringify(result));
	setData(result, zip);
  },
  function(error) {
    // Failure!
    console.log('Failed fetching data: ' + error);
  }
  );}

function makeMenu(){
	var locations = [];
	if(localStorage.update == 'true'){locations.push({
      title:'New Update Available',
      subtitle:''
	});}
	var x = 1;
	for(var i=1; i<8; i++){
		var title = "Location "+x;
		var loc = "location"+i;
		if(typeof allTideData[loc] != "undefined"){
		if (allTideData[loc].displayName === ""){
			continue;
		}
		else{
			var subtitle = allTideData[loc].displayName;
			locations.push({
			title:title,
			subtitle:subtitle
			});
			x++;
		}}
	}
	locations.push({
			title:'About',
			subtitle:'About This App'
			});
	locations.push({
			title:'Settings',
			subtitle:'Change App Settings'
			});
	menu = new UI.Menu({
   sections: [{
		title: 'Tide Locations',
		items: locations
    }]
  });
	menu.on('select', function(e){
		if (locations[e.itemIndex].title == 'About'){
			var card = new UI.Card();
			card.title('Tide Aware');
			card.scrollable(true);
			card.body('By Michael Dombrowski\nMikeDombrowski.com\n\nVersion '+version);
			card.show();
		}
		else if (locations[e.itemIndex].title == 'Settings'){
			var settMenu = new UI.Menu({
		sections: [{
			title: 'App Settings',
			items: [{title:'Current ('+allTideData.hourFormat+')',subtitle:'12 or 24 Hour Time'},
					{title:'Current ('+allTideData.units+')',subtitle:'Tide Height Units (Ft/M)'}]
		}]
		});
			settMenu.on('select', function(e){
				if(e.itemIndex===0){
				if (allTideData.hourFormat == '12h'){allTideData.hourFormat = '24h';}
				else {allTideData.hourFormat = '12h';}
				settMenu.items(0,[{title:'Current ('+allTideData.hourFormat+')', subtitle:'12 or 24 Hour Time'}, {title:'Current ('+allTideData.units+')',subtitle:'Tide Height Units (Ft/M)'}]);}
				else{
					if (allTideData.units == 'M'){allTideData.units = 'Ft';}
					else {allTideData.units = 'M';}
					settMenu.items(0,[{title:'Current ('+allTideData.hourFormat+')', subtitle:'12 or 24 Hour Time'}, {title:'Current ('+allTideData.units+')',subtitle:'Tide Height Units (Ft/M)'}]);
				}
			});
			settMenu.show();
		}
		else{
			var getter;
			for(var i=1; i<8; i++){
				if(typeof allTideData['location'+i] != "undefined"){
				if(allTideData['location'+i].displayName == e.item.subtitle){
					getter = allTideData['location'+i].lookupName;
				}
				}}
			getTides(getter);}
	});
	menu.show();
}
//Apply Selected Configuration Options
function setUp(options){
	console.log("setup called");
	allTideData = options;
	localStorage.allTideData = JSON.stringify(allTideData);
	menu.hide();
	makeMenu();
}
Settings.config(
  { url: "http://mikedombrowski.com/pebtides-nonus/version/"+version+"/config.html?data="+encodeURIComponent(JSON.stringify(allTideData))},
  function(e) {
    console.log('opening configurable'+"http://mikedombrowski.com/pebtides-nonus/version/"+version+"/config.html?data="+encodeURIComponent(JSON.stringify(allTideData)));
  },
  function(e) {
	var options = JSON.parse(decodeURIComponent(e.response));
	console.log("Options = " + JSON.stringify(options));
	if(options.hourFormat == "12h" || options.hourFormat == "24h"){
		setUp(options);
	}
  }
);
makeMenu();