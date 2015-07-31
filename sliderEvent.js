    var whichTeamToShow = "ALL"

    // add proototype for day of year
    Date.prototype.getDOY = function() {
        var onejan = new Date(this.getFullYear(),0,1);
        return Math.ceil((this - onejan) / 86400000);
    }

    function getURLParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
               return sParameterName[1];
            }
        }
    }

    function getURLForSharing() {
        var selectObj = document.getElementById("selectTeam");
        var clean_uri = location.protocol + "//" + location.host + location.pathname;

        clean_uri += "?baseball_day=" + document.getElementById("calendarDaySlider").value
        clean_uri += "&team_to_show=" + selectObj.value

        prompt("Copy to clipboard: Ctrl+C, Enter", clean_uri);
    }

    function cleanURLQuery() {
        var clean_uri = location.protocol + "//" + location.host + location.pathname;

        window.history.replaceState({}, document.title, clean_uri);
    }

    function setDropDownToTeamCode() {
        var selectObj = document.getElementById("selectTeam");

        for (var i = 0; i < selectObj.options.length; i++) {
            if (selectObj.options[i].value == whichTeamToShow) {
                selectObj.options[i].selected = true;
                return;
            }
        }
    }

    // example: baseball_map.html?baseball_day=50&team_to_show=OAK|ALL|...
    function setSliderToDayFromURL() {
        var baseball_day = getURLParameter('baseball_day')
        var team_to_show = getURLParameter('team_to_show')

        if (team_to_show != undefined && team_to_show != null) {
            if (!(team_to_show.toUpperCase() in team_to_loc)  && team_to_show != "NONE") {
                whichTeamToShow = "ALL"
            } else {
               whichTeamToShow = team_to_show.toUpperCase()                
            }

            setDropDownToTeamCode()
        }

        if (baseball_day != undefined && baseball_day != null) {
            baseball_day = parseInt(baseball_day)
            if (baseball_day >= 1 && baseball_day <= 188) {
                setSliderToDay(baseball_day)
                loadLiveScoresXMLForSliderDay()
                return
            }
        } 

        setSliderToCurrentDay()
    }

    function setSliderToCurrentDay() {
        var dayOfBaseballYear = getCurrentDayOfBaseballYear();

        setSliderToDay(dayOfBaseballYear)
        loadLiveScoresXMLForSliderDay()
    }

    function setSliderToDay(baseballDay) {
        document.getElementById("calendarDaySlider").value = baseballDay;
        updateSliderTextDiv(baseballDay);
    }

    function updateSliderTextDiv(slideAmount) {
        var sliderDiv = document.getElementById("sliderSelectedDate");
        sliderDiv.innerHTML = slideAmtToDate(slideAmount);

        showLocations(slideAmount)
    }

    function moveSliderRight() {
        var slideAmt = getSliderValue()

        if (slideAmt < 183) {
            setSliderToDay(slideAmt + 1)
            loadLiveScoresXMLForSliderDay()
        }
    }

    function moveSliderLeft() {
        var slideAmt = getSliderValue()

        if (slideAmt > 1) {
            setSliderToDay(slideAmt - 1)
            loadLiveScoresXMLForSliderDay()
        }
    }

    function getSliderValue() {
        return parseInt(document.getElementById('calendarDaySlider').value)
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

    	return dayOfMLBYearToDayOfWeek(slideAmount) + ", " + month +  " " + day + ", 2015";
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

    // by default, ALL is selected
    function showTeamOrAll(selection) {
        whichTeamToShow = selection

        showLocations(getSliderValue())
        loadLiveScoresXMLForSliderDay()
    }

    ////////////////////////////////
    // Google Map Functions Below //
    ////////////////////////////////

    home_team_to_marker = {}
    markers = []
    currentBaseballDay = getCurrentDayOfBaseballYear()
    show_for_day = 1
    function showLocations(day_id) {
        show_for_day = day_id
        var teams = day_id_to_games[day_id]
        
        deleteMarkers()
        
        if (teams == undefined) {
            return
        }
        for (var i = 0; i < teams.length; i++) {
            var homeTeam = teams[i][0]
            var awayTeam = teams[i][1]

            var marker = putTeamOnMap(homeTeam)
            addIconToMarker(marker, homeTeam, awayTeam)
        }
    }

    function addIconToMarker(marker, homeTeamcode, awayTeamcode) {
        if (whichTeamToShow == "ALL" || whichTeamToShow == homeTeamcode || whichTeamToShow == awayTeamcode) {
            if (whichTeamToShow == "ALL") {
                var path = getPathToTeamIcon(homeTeamcode)
            } else {
                var path = getPathToTeamIcon(whichTeamToShow)
            }
            marker.setIcon(path)
        } else {
            if (show_for_day == 101) {
              marker.setIcon(allStarGameIcon)
            } else if (show_for_day < currentBaseballDay) {
              marker.setIcon(overIcon)
            } else {
              marker.setIcon(toStartIcon)
            }
        }

    }

    function getPathToTeamIcon(teamname) {
        return "images/team_icons/teamcode_icon_small.png".replace(/teamcode/, teamname)
    }

    function putTeamOnMap(team) {
        var loc = team_to_loc[team]

        var lat = loc[0]
        var lng = loc[1]

        var latLng = new google.maps.LatLng(lat, lng);

        return addMarker(latLng, team)
    }

    // Add a marker to the map and push to the array.
    // add info window if releasing slider
    function addMarker(location, name) {
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: name
      });
      marker.clicked = false

      markers.push(marker);
      home_team_to_marker[marker.getTitle()] = marker
      return marker
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