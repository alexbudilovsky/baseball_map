	var xmlloaded = false;
	var url = "http://gd2.mlb.com/components/game/mlb/year_2015/month_07/day_08/scoreboard.xml";


	function loadLiveScoresXMLForDay(slideAmt) {
		$.ajax({
    		url: url, // name of file you want to parse
    		dataType: "xml", // type of file you are trying to read
    		success: parse, // name of the function to call upon success
			error: function(){alert("Error: Something went wrong");},
			cache: false,
			async: true
  		});
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

			
      		addInfoWindow(home_team, home_team_score, away_team, away_team_score)

		}
	}

	function addInfoWindow(home_team, home_team_score, away_team, away_team_score) {
		var home_team_code = team_name_to_code[home_team]
		console.log(home_team_code)
		var cur_marker = home_team_to_marker[home_team_code]
		console.log(cur_marker.getTitle())
		console.log(cur_marker.getPosition())

		home_team_to_marker[home_team_code].setTitle('TEST HERE');

    	var infoWindow = new google.maps.InfoWindow;

    	google.maps.event.addListener(cur_marker, 'click', function() {
        	infoWindow.setContent(away_team + "@" + home_team + " " + away_team_score + ":" + home_team_score);
        	infoWindow.open(map,cur_marker);
    	});
	}