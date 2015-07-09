    // add proototype for day of year
    Date.prototype.getDOY = function() {
        var onejan = new Date(this.getFullYear(),0,1);
        return Math.ceil((this - onejan) / 86400000);
    }

    function setSliderToCurrentDay() {
        var dayOfBaseballYear = getCurrentDayOfBaseballYear();

        document.getElementById("calendarDaySlider").value = dayOfBaseballYear;
        updateSliderTextDiv(dayOfBaseballYear);
    }

    function updateSliderTextDiv(slideAmount) {
        var sliderDiv = document.getElementById("sliderSelectedDate");
        sliderDiv.innerHTML = slideAmtToDate(slideAmount);

        showLocations(slideAmount)
    }

    function slideAmtToDate(slideAmount) {
    	slideAmount = parseInt(slideAmount)

    	var month;
    	var day = slideAmount + 4; 	// four is offset to account for April 5
    	if (day <= 30) {
    		month = "Apr";  		// 26 days inclusive between Apr 5 and 30
    	} else if (day <= 61) {
    		month = "May";  		// 31 days in May
    		day -= 30;
    	} else if (day <= 91) {
    		month = "Jun";  		// 30 days in June
    		day -= 61;
    	} else if (day <= 122) {
    		month = "Jul";  		// 31 days in July
    		day -= 91;
    	} else if (day <= 153) {
    		month = "Aug";  		// 31 days in August
    		day -= 122;
    	} else if (day <= 183) {
    		month = "Sept"; 		// 30 days in September
    		day -= 153;
    	} else {
    		month = "Oct";  		// last day Oct 4th
    		day -= 183 ;
    	}

    	return dayOfMLBYearToDayOfWeek(slideAmount) + ", " + month +  " " + day;
    }

    // day1 = Sunday (April 5, 2015)
    function dayOfMLBYearToDayOfWeek(day_id) {
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

        var array_idx = (day_id - 1) % 7;

        return days[array_idx]
    }

    // returns number 1-183, or beginning/end if outside of year
    function getCurrentDayOfBaseballYear() {
        var baseballDayOfYear = new Date().getDOY() - 94; //94 - April 4th (need to subtract offset)
        if (baseballDayOfYear < 1) {
            return 1;
        } else if (baseballDayOfYear > 188) {
            return 188; 
        } else {
            return baseballDayOfYear
        }
    }

    ////////////////////////////////
    // Google Map Functions Below //
    ////////////////////////////////

    home_team_to_marker = {}
    markers = []
    function showLocations(day_id) {
        var teams = day_id_to_home_teams[day_id]
        
        deleteMarkers()
        
        if (teams == undefined) {
            return
        }
        for (var i = 0; i < teams.length; i++) {
            putTeamOnMap(teams[i]) 
        }
    }

    function putTeamOnMap(team) {
        var loc = team_to_loc[team]

        var lat = loc[0]
        var lng = loc[1]

        var latLng = new google.maps.LatLng(lat, lng);

        addMarker(latLng, team)
    }

    // Add a marker to the map and push to the array.
    // add info window if releasing slider
    function addMarker(location, name) {
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: name,
        icon: 'images/baseball_to_start.png'
      });

      markers.push(marker);
      home_team_to_marker[marker.getTitle()] = marker
    }

    // Sets the map on all markers in the array.
    function setAllMap(passedMap) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(passedMap);
      }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
      setAllMap(null);
    }

    // Shows any markers currently in the array.
    function showMarkers() {
      setAllMap(map);
    }

    // Deletes all markers in the array by removing references to them.
    function deleteMarkers() {
      clearMarkers();
      markers = [];
      home_team_to_marker = {}
    }