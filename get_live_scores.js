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

	var homeTeamToGamesInfo = {} // value of array of length one, unless double header
	var GAMEOVER = "gameover"
	var INPROG = "inprog"
	var PREGAME = "pregame"
	var DELAY = "delay"
	function parse(xml) {
		homeTeamToGamesInfo = {} // clear dictionary

		var games_over = xml.getElementsByTagName('go_game');
		var in_progress = xml.getElementsByTagName('ig_game');
		var pregame = xml.getElementsByTagName('sg_game');

		// first populate homeTeamToGamesInfo
		for (i=0; i < games_over.length; i++) {
			addToGamesInfo(games_over[i], GAMEOVER)
		}

		for (i=0; i < in_progress.length; i++) {
			addToGamesInfo(in_progress[i], INPROG)
		}

		for (i=0; i < pregame.length; i++) {
			addToGamesInfo(pregame[i], PREGAME)
		}

		for (var key in homeTeamToGamesInfo) {
			addTextWindowForGameInfo(key)
		}
	}

	function addTextWindowForGameInfo(homeTeamCode) {
		gameInfo = homeTeamToGamesInfo[homeTeamCode]

		html = createHTMLForGameInfo(gameInfo[0])

		if (gameInfo.length > 1) {
			html += createHTMLForGameInfo(gameInfo[1]) // assume only double headers allowed
		}

  		var cur_marker = getMarkerForTeamCode(homeTeamCode)
  		if (cur_marker == undefined) { // marker not on map
  			return
  		}

  		setIconForMarker(cur_marker, getIconForGamesInfo(gameInfo), home_team, away_team)

  		addInfoWindow(cur_marker, html)
	}

	// handles double headers as well

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
	function getIconForGamesInfo(gamesInfo) {
		if (gamesInfo.length > 1) {
			gameType1 = gamesInfo[0]['gameType'] // first game
			gameType2 = gamesInfo[1]['gameType'] // second game

			if (gameType1 == GAMEOVER) {
				if (gameType2 == GAMEOVER) {
					return doubleHeaderOverOver
				} else if (gameType2 == INPROG) {
					return doubleHeaderFinalInGame
				} else if (gameType2 == PREGAME) {
					return doubleHeaderFinalAndToPlay
				} else if (gameType2 == DELAY) {
					return doubleHeaderFinalDelayed
				}
			} else if (gameType1 == INPROG) {
				return doubleHeaderInProgToPlay
			} else if (gameType1 == PREGAME) {
				return futureDoubleHeaderIcon
			} else if (gameType1 == DELAY) {
				return doubleHeaderDelayToPlay
			}

		} else {
			gameType = gamesInfo[0]['gameType']
			if (gameType == GAMEOVER) {
				return overIcon
			} else if (gameType == INPROG) {
				return inProgIcon
			} else if (gameType == DELAY) {
				return delayIcon
			} else if (gameType == PREGAME) {
				return toStartIcon
			}
		}

	}

	function createHTMLForGameInfo(gameInfo) {
		home_team = gameInfo['homeTeam']
		away_team = gameInfo['awayTeam']
		start_time = gameInfo['startTime']
		gameId = gameInfo['gameId']

		var html

		if (gameInfo['gameType'] == GAMEOVER) {
			html = "<b>Final: </b><br>"
			html += away_team + " <b>" + gameInfo['awayScore'] + "</b> at " + home_team + " <b>" + gameInfo['homeScore'] + "</b><br>"
			html += "<i>Started: " + start_time + "</i><br>"
		} else if (gameInfo['gameType'] == INPROG) {
			html = "<i>In Progress: </i><br>"
			html += away_team + " <b>" + gameInfo['awayScore'] + "</b> at " + home_team + " <b>" + gameInfo['homeScore'] + "</b><br>"
			html += "<center><b>"
			
			inningnum = gameInfo['inningNum']
			half = gameInfo['half']

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
		} else if (gameInfo['gameType'] == PREGAME) {
			html = "<center>" + away_team + " at " + home_team + "</center>"
			html += "Start Time: <b>" + start_time + "</b><br>"
		} else if (gameInfo['gameType'] == DELAY) {
			html = "Delayed: <b>" + gameInfo['delayStatus'] + "</b>"
			html += "<center>" + away_team + " at " + home_team + "</center>"
			html += "Start Time: <b>" + start_time + "</b><br>"
		}

		html += generateMLBUrlForId(gameId)
		return html
	}

	function addToGamesInfo(game, game_type) {
		gameInfo = {}

		var teams = getPlayingTeams(game) // index 0 is home team
		var gameId = getGameId(game)
		var startTime = getGameStartTime(game)

		gameInfo['homeTeam'] = teams[0]
		gameInfo['awayTeam'] = teams[1]
		gameInfo['gameId'] = gameId
		gameInfo['startTime'] = startTime

		if (game_type == GAMEOVER) {
			scores = getScores(game)

			gameInfo['homeScore'] = scores[0]
			gameInfo['awayScore'] = scores[1]

			gameInfo['gameType'] = GAMEOVER
		} else if (game_type == INPROG) {
			scores = getScores(game)
			inninginfo = getInningInfo(game)

			gameInfo['homeScore'] = scores[0]
			gameInfo['awayScore'] = scores[1]

			gameInfo['inningNum'] = inninginfo[0]
			gameInfo['half'] = inninginfo[1]

			gameInfo['gameType'] = INPROG
		} else if (game_type == PREGAME) {
			delayStatus = getDelayStatus(game)
			if (delayStatus != undefined) {
				gameInfo['delayStatus'] = delayStatus
				gameInfo['gameType'] = DELAY
			} else {
				gameInfo['gameType'] = PREGAME
			}
		}

		homeTeamCode = teamNameToCode(teams[0])

		if (homeTeamCode in homeTeamToGamesInfo) {
			homeTeamToGamesInfo[homeTeamCode].push(gameInfo)
		} else {
			homeTeamToGamesInfo[homeTeamCode] = [gameInfo]
		}
	}

	/////////////
	// xml parse functions
	/////////////

	function getGameId(game) {
		return game.getElementsByTagName('game')[0].getAttribute('id')
	}

	// returns [home_team, away_team]
	function getPlayingTeams(game) {
		var teams = game.getElementsByTagName('team')
		homeTeamCode = teams[0].getAttribute('name')
		awayTeamCode = teams[1].getAttribute('name')

		return [homeTeamCode, awayTeamCode]
	}

	// return [home team score, away team score]
	function getScores(game) {
		var teams = game.getElementsByTagName('team')
		var home_team_score = teams[0].getElementsByTagName('gameteam')[0].getAttribute('R')
		var away_team_score = teams[1].getElementsByTagName('gameteam')[0].getAttribute('R')

		return [home_team_score, away_team_score]
	}
 	
 	// return [inningnum, half] -> half = T/B (top or bottom) 
	function getInningInfo(game) {
		var inningnum = game.getElementsByTagName('inningnum')[0].getAttribute('inning')
		var half = game.getElementsByTagName('inningnum')[0].getAttribute('half')

		return [inningnum, half]
	}

	function getGameStartTime(game) {
		return game.getElementsByTagName('game')[0].getAttribute('start_time') + " EST"
	}

	// returns undefined if no delay
	function getDelayStatus(game) {
		var status = game.getElementsByTagName('game')[0].getAttribute("status")
		if (status == "OTHER") {
			delayStatus = game.getElementsByTagName("delay_reason")[0].childNodes[0].nodeValue
		} else {
			delayStatus = undefined
		}

		return delayStatus
	}

	////////////
	// end xml parse functions
	////////////

	function teamNameToCode(teamName) {
		return team_name_to_code[teamName]
	}

	function getMarkerForTeamCode(teamCode) {
		return home_team_to_marker[teamCode]
	}

	function getMarkerForTeamName(teamName) {
		return getMarkerForTeamCode(teamNameToCode(teamName))
	}

	function setIconForMarker(marker, icon, homeTeamName, awayTeamName) {
		homeTeamCode = teamNameToCode(homeTeamName)
		awayTeamCode = teamNameToCode(awayTeamName)

		if (homeTeamCode == 'ASG_NL') { // special All-Start Game case
			marker.setIcon(allStarGameIcon)
		} else if (whichTeamToShow != "ALL" && whichTeamToShow != homeTeamCode && whichTeamToShow != awayTeamCode) {
			marker.setIcon(icon)
		}
	}

	function generateMLBUrlForId(id) {
		var url = "http://mlb.mlb.com/mlb/gameday/index.jsp?gid=" + id

		var html = "<center><a href=\"" + url + "\" target=\"_blank\">Game Link</a></center>"

		return html
	}

	function addInfoWindow(cur_marker, html) {
		var home_team_code = cur_marker.getTitle()

		var infoWindow = new google.maps.InfoWindow;
		infoWindow.setContent(html);

    	google.maps.event.addListener(cur_marker, 'mouseover', function() {
    		if (infoWindow.getMap() == null) {
    			infoWindow.open(map,cur_marker)
    		}
    		cur_marker.setIcon(getLargeIconPath(cur_marker))
    	});

    	google.maps.event.addListener(cur_marker, 'mouseout', function() {
    		if (infoWindow.getMap() != null && !cur_marker.clicked) {
    			infoWindow.close()
    			cur_marker.setIcon(getSmallIconPath(cur_marker))
    		}
    	});

    	google.maps.event.addListener(cur_marker, 'click', function() {
    		cur_marker.clicked = !cur_marker.clicked
    		if (!cur_marker.clicked) {
    			infoWindow.close()
    			cur_marker.setIcon(getSmallIconPath(cur_marker))
    		} else {
    			cur_marker.setIcon(getLargeIconPath(cur_marker))
    		}
    	});
	}

	function getSmallIconPath(marker) {
		var path = marker.getIcon()

		if (path.indexOf("_small") > -1) {
			return path
		} else {
			return path.replace(/_icon\.png/, "_icon_small.png")
		}
	}

	function getLargeIconPath(marker) {
		return marker.getIcon().replace(/_small/, "")
	}