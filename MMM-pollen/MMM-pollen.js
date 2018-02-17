
Module.register("MMM-pollen",{
	// Module config defaults.
	defaults: {
		updateInterval: 60*60*1000, 
		animationSpeed: 1000,
		lang: config.language,
		initialLoadDelay: 1000,
		retryDelay: 60000,
		locationLongitude: 6.77,
		locationLatitude: 51.4,
		noEmptyLines: true,
		pollenLayers: "Pollenflug_Hasel,Pollenflug_Erle,Pollenflug_Esche,Pollenflug_Birke,Pollenflug_Graeser,Pollenflug_Roggen,Pollenflug_Beifuss,Pollenflug_Ambrosia"
	},

	getScripts: function() {
		return ["moment.js"];
	},
	
	getStyles: function() {
		return ["font-awesome.css"];
	},

	start: function() {
		Log.error("Starting module: " + this.name);
		moment.locale(config.language);
		this.top = 0.0;
		this.left = 0.0;
		this.loaded = false;
		this.msg = "";
		this.calculateTopLeft();
		this.scheduleUpdate(this.config.initialLoadDelay);
	},
	
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		var innerElem = document.createElement("div");
		innerElem.className = "xsmall";
		if (!this.loaded) {
			innerElem.innerHTML = "LOADING";
		}
		else {
			innerElem.innerHTML = this.msg;
		}
		wrapper.appendChild(innerElem);
		return wrapper;
	},

	updatePollen: function() {
		var now = new Date();
		var urlPre = "https://maps.dwd.de/geoserver/dwd/wms?service=WMS&version=1.3&request=GetFeatureInfo&layers=" + this.config.pollenLayers +"&styles=&bbox=5.866,47.27,15.042,55.057&width=512&height=434&srs=EPSG:4326&query_layers=" +this.config.pollenLayers + "&x="+this.left+"&y="+this.top+"&info_format=application/json&FEATURE_COUNT=24&time=";
		var self = this;
		var retry = true;
		var dayFrom = this.pad(now.getDate(), 2);
		var monthFrom = this.pad((now.getMonth() + 1), 2);
		var yearFrom = now.getFullYear();
		var twoDaysLater = new Date();
		twoDaysLater.setTime(now.getTime() + 2 * 24 * 60 * 60 * 1000);
		var dayTo = this.pad(twoDaysLater.getDate(), 2);
		var monthTo = this.pad(twoDaysLater.getMonth() + 1, 2);
		var yearTo = twoDaysLater.getFullYear();
		var urlPost = yearFrom + "-" + monthFrom + "-" + dayFrom + "T00:00:00.000Z/" + yearTo + "-" + monthTo + "-" + dayTo + "T00:00:00.000Z";
		var url = urlPre + urlPost;

		var pollenRequest = new XMLHttpRequest();
		pollenRequest.open("GET", url, true);
		pollenRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processPollen(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.addon = "ERROR 401";
					self.updateDom(self.config.animationSpeed);
					this.retry = true;
				} else {
					self.addon = "OTHER ERROR:" + this.status;
				}
				if (this.retry) {
					self.scheduleUpdate(self.config.retryDelay);
				}
			}
		};
		pollenRequest.send();
		this.updateDom(self.config.animationSpeed);
		this.scheduleUpdate(self.config.updateInterval);
	},
	
	processPollen: function(data) {
		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		var i;
		try {
			var currentPollenName = "";
			var today = "";
			var tomorrow = "";
			var pollenArea = "";
			this.msg = "<table><tr><th width=100>Pollen</th><th width=70>heute</th><th width=70>morgen</th>";
			for (i=0;i < data.features.length; i++) {
				if (currentPollenName != data.features[i].properties.PARAMETER_NAME) {
					this.addPollenRow(currentPollenName, today, tomorrow);
					currentPollenName = data.features[i].properties.PARAMETER_NAME;
					today = "";
					tomorrow = "";
				}
				if (today == "") {
					today = data.features[i].properties.PARAMETER_VALUE;
				}
				else {
					tomorrow = data.features[i].properties.PARAMETER_VALUE;
				}
				if (pollenArea == "") {
					pollenArea = data.features[i].properties.GEN;
				}
			}
			this.addPollenRow(currentPollenName, today, tomorrow);
			this.msg = this.msg + "</table>";
			if (pollenArea != "") {
				this.msg = "<div>" + pollenArea + "<br>" + this.msg + "<div>";
			}
			this.updateDom(this.config.animationSpeed);		
		} catch(err) {
			this.msg = err.message;
			this.updateDom(this.config.animationSpeed);		
		}
	},
	
	addPollenRow: function(pollenName, today, tomorrow) {
		if (pollenName == "") {
			return;
		}
		// supress not relevant lines
		if (this.config.noEmptyLines && today == "keine" && tomorrow == "keine") {
			return;
		}		
		var colorToday = this.getPollenCell(today);
		var colorTomorrow = this.getPollenCell(tomorrow);
		
		var cellToday = "<td>" + colorToday + "</td>";
		var cellTomorrow = "<td>" + colorTomorrow + "</td>";
		this.msg = this.msg + "<tr>";
		this.msg = this.msg + "<td align=left>"+pollenName+"</td>";
		this.msg = this.msg + cellToday + cellTomorrow;
		this.msg = this.msg + "</tr>";
	},
	
	getPollenCell: function(pollenValue) {
		switch (pollenValue) {
			case "hoch":
				return "<div style=\"color:darkred;\" class=\"fa fa-arrow-up\"></div>";
			case "mittel bis hoch":
				return  "<div style=\"color:red;transform:rotate(45deg);\" class=\"fa fa-arrow-up\"></div>";
			case "mittel":
				return  "<div style=\"color:darkorange;\" class=\"fa fa-arrow-right\"></div>";
			case "gering bis mittel":
				return "<div style=\"color:orange;transform:rotate(45deg);\" class=\"fa fa-arrow-right\"></div>";
			case "gering":
				return "<div style=\"color:yellow;\" class=\"fa fa-arrow-down\"></div>";
			case "keine":
				return "<div style=\"color:DarkSlateGray;\" class=\"fa fa-smile-o\"></div>";
		}
	},

	scheduleUpdate: function(delay) {
		var self = this;
		setTimeout(function() {
			self.updatePollen();
		}, delay);
	},	

	pad: function(number, length) {
	    var str = '' + number;
	    while (str.length < length) {
	        str = '0' + str;
	    }
	    return str;
	},
	
    calculateTopLeft: function() {
		var rely = this.config.locationLatitude - 55.057;
        this.top = Math.round(rely * -55.73391550019264);
		var relx = this.config.locationLongitude - 5.866;
        this.left = Math.round(relx * 55.79773321708805);
    },
});
