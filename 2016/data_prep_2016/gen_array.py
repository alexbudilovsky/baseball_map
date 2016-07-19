import csv

teams = {'NYN': 'NYM', 'KCA' : 'KC', 'SLN' : 'STL', 'TBA' : 'TB', 
'CHA' : 'CWS', 'CHN' : 'CHC', 'NYA' : 'NYY', 'LAN' : 'LAD', 'SDN' : 'SD', 'SFN' : 'SF', 'ANA' : 'LAA'}

dayId = 0
activeDate = ""
fullSched = {}

with open('sked.csv') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		date = row[0]
		awayTeam = row[3]
		homeTeam = row[6]
		if awayTeam in teams:
			awayTeam = teams[awayTeam]
		if homeTeam in teams:
			homeTeam = teams[homeTeam]

		if activeDate != date:
			activeDate = date
			if date == '20160715': #ASG
				dayId = dayId + 5
			else:
				dayId = dayId + 1

			fullSched[dayId] = []


		gameArr = [homeTeam, awayTeam]
		fullSched[dayId].append(gameArr)

ASG = [['ASG_NL', 'ASG_AL']]
fullSched[101] = ASG

print('var day_id_to_games = {}')

for day_id in fullSched:
	print('day_id_to_games[{0}] = {1}'.format(day_id, fullSched[day_id]))
