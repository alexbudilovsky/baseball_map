	var xmlloaded = false;
	var url_template = "http://gd2.mlb.com/components/game/mlb/year_2015/month_07/day_08/scoreboard.xml";
	var toStartIcon = "images/baseball_to_start.png"
	var inProgIcon = "images/baseball_in_prog.png"
	var overIcon = "images/baseball_over.png"
	var delayIcon = ""

	function loadLiveScoresXMLForSliderDay() {
		var slideAmt = document.getElementById('calendarDaySlider').value

		var url = getUrlForDay(slideAmt)

		$.ajax({
    		url: url, // name of file you want to parse
    		dataType: "xml", // type of file you are trying to read
    		success: parse, // name of the function to call upon success
			error: function(){alert("Error: Something went wrong");},
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
			var teams = game.getElementsByTagName('team')

			var home_team = teams[0].getAttribute('name')
			var home_team_score = teams[0].getElementsByTagName('gameteam')[0].getAttribute('R')
			var away_team = teams[1].getAttribute('name')
			var away_team_score = teams[1].getElementsByTagName('gameteam')[0].getAttribute('R')


			var inningnum = game.getElementsByTagName('inningnum')[0].getAttribute('inning')
			var half = game.getElementsByTagName('inningnum')[0].getAttribute('half')

			var html = generateHTMLForInProgressGame(home_team, home_team_score, away_team, away_team_score, inningnum, half)
      		var cur_marker = home_team_to_marker[team_name_to_code[home_team]]
      		cur_marker.setIcon(inProgIcon)

      		addInfoWindow(cur_marker, html)
		}

		for (i = 0; i < games_over.length; i++) {
			var game = games_over[i]
			var teams = game.getElementsByTagName('team')

			var home_team = teams[0].getAttribute('name')
			var home_team_score = teams[0].getElementsByTagName('gameteam')[0].getAttribute('R')
			var away_team = teams[1].getAttribute('name')
			var away_team_score = teams[1].getElementsByTagName('gameteam')[0].getAttribute('R')

			var html = generateHTMLForGameOverGame(home_team, home_team_score, away_team, away_team_score)
      		var cur_marker = home_team_to_marker[team_name_to_code[home_team]]
      		cur_marker.setIcon(overIcon)

      		addInfoWindow(cur_marker, html)
		}

		for (i = 0; i < pregame.length; i++) {
			var game = pregame[i]
			var teams = game.getElementsByTagName('team')

			var home_team = teams[0].getAttribute('name')
			var away_team = teams[1].getAttribute('name')
			var start_time = game.getElementsByTagName('game')[0].getAttribute('start_time')

			var html = generateHTMLForPreGame(home_team, away_team, start_time)

			var cur_marker = home_team_to_marker[team_name_to_code[home_team]]
			cur_marker.setIcon(toStartIcon)

      		addInfoWindow(cur_marker, html)
		}
	}

	//TODO add delay status
	function generateHTMLForPreGame(home_team, away_team, start_time) {
		var html = "<center>" + away_team + " at " + home_team + "</center>"
		html += "Start Time: <b>" + start_time + "</b>"
		return html 
	}

	function generateHTMLForGameOverGame(home_team, home_team_score, away_team, away_team_score) {
		var html = "<b>Final: </b><br>"
		html += away_team + " <b>" + away_team_score + "</b> at " + home_team + " <b>" + home_team_score + "</b><br>"
		return html
	}

	function generateHTMLForInProgressGame(home_team, home_team_score, away_team, away_team_score, inningnum, half) {
		var html = "<b>In Progress: </b><br>"
		html += away_team + " <b>" + away_team_score + "</b> at " + home_team + " <b>" + home_team_score + "</b><br>"
		html += "<center>"
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
		html += "</center>"

		return html
	}

	function addInfoWindow(cur_marker, html) {
    	var infoWindow = new google.maps.InfoWindow;

    	google.maps.event.addListener(cur_marker, 'click', function() {
        	infoWindow.setContent(html);
        	infoWindow.open(map,cur_marker);
    	});
	}