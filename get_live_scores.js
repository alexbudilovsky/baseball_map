	var url_template = "http://gd2.mlb.com/components/game/mlb/year_2015/month_07/day_08/scoreboard.xml";
	var toStartIcon = "images/baseball_to_start.png"
	var inProgIcon = "images/baseball_in_prog.png"
	var overIcon = "images/baseball_over.png"
	var delayIcon = "images/baseball_delay.png"
	var doubleHeaderOverOver = "images/double_header.png"
	var futureDoubleHeaderIcon = "images/future_double_header.png"
	var doubleHeaderFinalAndToPlay = "images/double_header_final_and_to_play.png"
	var doubleHeaderInProgToPlay = "images/double_header_in_prog_to_play.png"
	var doubleHeaderDelayToPlay = "images/double_header_delay_to_play.png"
	var doubleHeaderFinalInGame = "images/double_header_final_in_game.png"
	var doubleHeaderFinalDelayed = "images/double_header_final_delayed.png"
	var allStarGameIcon = "images/all-star_game.png"

	function loadLiveScoresXMLForSliderDay() {
		var slideAmt = document.getElementById('calendarDaySlider').value

		var url = getUrlForDay(slideAmt)

		jQuery.support.cors = true;  // needed for IE
		$.ajax({
    		url: url, // name of file you want to parse
    		dataType: "xml", // type of file you are trying to read
    		success: parse, // name of the function to call upon success
			error: function(jqXHR, textStatus, errorThrown){
				console.log(errorThrown+'\n'+status+'\n'+jqXHR.statusText);
			},
			cache: false,
			async: true
  		});
	}

	function getUrlForDay(baseballDay) {
		baseballDay = parseInt(baseballDay)

    	var month;
    	var day = baseballDay + 4; 	// four is offset to account for April 5
    	if (day <= 30) {
    		month = "04";  		// 26 days inclusive between Apr 5 and 30
    	} else if (day <= 61) {
    		month = "05";  		// 31 days in May
    		day -= 30;
    	} else if (day <= 91) {
    		month = "06";  		// 30 days in June
    		day -= 61;
    	} else if (day <= 122) {
    		month = "07";  		// 31 days in July
    		day -= 91;
    	} else if (day <= 153) {
    		month = "08";  		// 31 days in August
    		day -= 122;
    	} else if (day <= 183) {
    		month = "09"; 		// 30 days in September
    		day -= 153;
    	} else {
    		month = "10";  		// last day Oct 4th
    		day -= 183 ;
    	}

    	if (day < 10) {
    		day = "0" + day
    	} else {
    		day = "" + day
    	}

    	var url = "http://gd2.mlb.com/components/game/mlb/year_2015/month_" + month + "/day_" + day + "/scoreboard.xml"
    	return url
	}

	function parse(xml) {
		var games_over = xml.getElementsByTagName('go_game');
		var in_progress = xml.getElementsByTagName('ig_game');
		var pregame = xml.getElementsByTagName('sg_game');

		for (i=0; i < in_progress.length; i++) {
			var game = in_progress[i]

			addWindowForInProgGame(game) 
		}

		for (i = 0; i < games_over.length; i++) {
			var game = games_over[i]

			addWindowForPostgame(game)
		}

		for (i = 0; i < pregame.length; i++) {
			var game = pregame[i]

			addWindowForPregame(game)	
		}
	}

	function getGameId(game) {
		return game.getElementsByTagName('game')[0].getAttribute('id')
	}

	function setIconForMarker(marker, icon, homeTeamName, awayTeamName) {
		homeTeamCode = team_name_to_code[homeTeamName]
		awayTeamCode = team_name_to_code[awayTeamName]
		if (whichTeamToShow != "ALL" && whichTeamToShow != homeTeamCode && whichTeamToShow != awayTeamCode) {
			marker.setIcon(icon)
		}
	}

	function addWindowForInProgGame(game) {
		var teams = game.getElementsByTagName('team')

		var home_team = teams[0].getAttribute('name')
		var home_team_score = teams[0].getElementsByTagName('gameteam')[0].getAttribute('R')
		var away_team = teams[1].getAttribute('name')
		var away_team_score = teams[1].getElementsByTagName('gameteam')[0].getAttribute('R')


		var inningnum = game.getElementsByTagName('inningnum')[0].getAttribute('inning')
		var half = game.getElementsByTagName('inningnum')[0].getAttribute('half')

		var html = generateHTMLForInProgressGame(home_team, home_team_score, away_team, away_team_score, inningnum, half)
  		html += generateMLBUrlForId(game)

  		var cur_marker = home_team_to_marker[team_name_to_code[home_team]]
  		if (cur_marker == undefined) { // marker not on map
  			return
  		}

  		setIconForMarker(cur_marker, inProgIcon, home_team, away_team)

  		addInfoWindow(cur_marker, html)
	}

	function addWindowForPregame(game) {
		var teams = game.getElementsByTagName('team')

		var home_team = teams[0].getAttribute('name')
		var away_team = teams[1].getAttribute('name')
		var start_time = game.getElementsByTagName('game')[0].getAttribute('start_time')

		var cur_marker = home_team_to_marker[team_name_to_code[home_team]]
  		if (cur_marker == undefined) { // marker not on map
  			return
  		}

		var html
		if (game.getElementsByTagName('game')[0].getAttribute("status") == "OTHER") {
			// game delayed
			html = generateHTMLForGameDelay(home_team, away_team, start_time, game.getElementsByTagName("delay_reason")[0].childNodes[0].nodeValue)
			html += generateMLBUrlForId(game)

			setIconForMarker(cur_marker, delayIcon, home_team, away_team)
		} else {
			html = generateHTMLForPreGame(home_team, away_team, start_time)
			html += generateMLBUrlForId(game)

			setIconForMarker(cur_marker, toStartIcon, home_team, away_team)
		}


		addInfoWindow(cur_marker, html)
	}

	function addWindowForPostgame(game) {
		var teams = game.getElementsByTagName('team')

		var home_team = teams[0].getAttribute('name')
		var home_team_score = teams[0].getElementsByTagName('gameteam')[0].getAttribute('R')
		var away_team = teams[1].getAttribute('name')
		var away_team_score = teams[1].getElementsByTagName('gameteam')[0].getAttribute('R')
		var start_time = game.getElementsByTagName('game')[0].getAttribute('start_time')

		var html = generateHTMLForGameOverGame(home_team, home_team_score, away_team, away_team_score, start_time)
		html += generateMLBUrlForId(game)

  		var cur_marker = home_team_to_marker[team_name_to_code[home_team]]
  		if (cur_marker == undefined) { // marker not on map
  			return
  		}
  		
  		setIconForMarker(cur_marker, overIcon, home_team, away_team)

  		addInfoWindow(cur_marker, html)
	}

	function generateHTMLForGameDelay(home_team, away_team, start_time, delay_reason) {
		html = "Delayed: <b>" + delay_reason + "</b>"
		html += "<center>" + away_team + " at " + home_team + "</center>"
		html += "Start Time: <b>" + start_time + "</b><br>"
		return html
	}

	function generateHTMLForPreGame(home_team, away_team, start_time) {
		var html = "<center>" + away_team + " at " + home_team + "</center>"
		html += "Start Time: <b>" + start_time + "</b><br>"
		return html 
	}

	function generateHTMLForGameOverGame(home_team, home_team_score, away_team, away_team_score, start_time) {
		var html = "<b>Final: </b><br>"
		html += away_team + " <b>" + away_team_score + "</b> at " + home_team + " <b>" + home_team_score + "</b><br>"
		html += "<i>Started: " + start_time + "</i><br>"
		return html
	}

	function generateHTMLForInProgressGame(home_team, home_team_score, away_team, away_team_score, inningnum, half) {
		var html = "<i>In Progress: </i><br>"
		html += away_team + " <b>" + away_team_score + "</b> at " + home_team + " <b>" + home_team_score + "</b><br>"
		html += "<center><b>"
		if (half == 'T') {
			html += "Top "
		} else {
			html += "Bot "
		}

		if (inningnum == 1) {
			html += "1st"
		} else if (inningnum == 2) {
			html += "2nd"
		} else if (inningnum == 3) {
			html += "3rd"
		} else {
			html += inningnum + "th"
		}
		html += "</b></center>"

		return html
	}

	function generateMLBUrlForId(game) {
		var id = getGameId(game)
		var url = "http://mlb.mlb.com/mlb/gameday/index.jsp?gid=" + id

		var html = "<center><a href=\"" + url + "\" target=\"_blank\">Game Link</a></center>"

		return html
	}

	function addInfoWindow(cur_marker, html) {
		var home_team_code = cur_marker.getTitle()

		if (home_team_code in home_team_to_infowindow) {
			var content = home_team_to_infowindow[home_team_code].getContent()
			home_team_to_infowindow[home_team_code].setContent(content + html)

			if (cur_marker.getIcon() == overIcon) {
				if (html.indexOf("In Progress") > -1) {
					setIconForMarker(cur_marker, doubleHeaderFinalInGame, home_team, away_team)
				} else if (html.indexOf("Delayed") > -1) {
					setIconForMarker(cur_marker, doubleHeaderFinalDelayed, home_team, away_team)
				} else if (html.indexOf("Final") > -1) {
					setIconForMarker(cur_marker, doubleHeaderOverOver, home_team, away_team)
				} else {
					setIconForMarker(cur_marker, doubleHeaderFinalAndToPlay, home_team, away_team)
				}
			} else if (cur_marker.getIcon() == inProgIcon) {
				setIconForMarker(cur_marker, doubleHeaderInProgToPlay, home_team, away_team)
			} else if (cur_marker.getIcon() == delayIcon) {
				setIconForMarker(cur_marker, doubleHeaderDelayToPlay, home_team, away_team)
			} else {
				setIconForMarker(cur_marker, futureDoubleHeaderIcon, home_team, away_team)
			}
		} else {
			var infoWindow = new google.maps.InfoWindow;
			infoWindow.setContent(html);

	    	google.maps.event.addListener(cur_marker, 'mouseover', function() {
	    		if (infoWindow.getMap() == null) {
	    			infoWindow.open(map,cur_marker)
	    		}
	    	});

	    	google.maps.event.addListener(cur_marker, 'mouseout', function() {
	    		if (infoWindow.getMap() != null && !cur_marker.clicked) {
	    			infoWindow.close()
	    		} 
	    	});

	    	google.maps.event.addListener(cur_marker, 'click', function() {
	    		cur_marker.clicked = !cur_marker.clicked
	    		if (!cur_marker.clicked) {
	    			infoWindow.close()
	    		}
	    	});

	    	home_team_to_infowindow[home_team_code] = infoWindow
		}

		if (home_team_code == 'ASG_NL') { // special All-Start Game case
			cur_marker.setIcon(allStarGameIcon)
		}


	}