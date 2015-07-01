    function updateSlider(slideAmount) {
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

    	return month +  " " + day;
    }

    markers = []
    function showLocations(day_id) {
        var teams = day_id_to_home_teams[day_id]
        
        deleteMarkers()
        
        if (teams == undefined) {
            return
        }
        for (var i = 0; i < teams.length; i++) {
            putTeamOnMap(team_to_loc[teams[i]])
        }
    }



    function putTeamOnMap(loc) {
        var lat = loc[0]
        var lng = loc[1]

        var latLng = new google.maps.LatLng(lat, lng);

        addMarker(latLng)
    }

    // Add a marker to the map and push to the array.
    function addMarker(location) {
      var marker = new google.maps.Marker({
        position: location,
        map: map
      });
      markers.push(marker);
    }

    // Sets the map on all markers in the array.
    function setAllMap() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap();
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
    }