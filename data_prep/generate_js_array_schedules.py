import sqlite3

db_filename = 'mlb_schedule_2015.db'

conn = sqlite3.connect(db_filename)

# special case - for National League ASG, ASG_NL -> Cincinnati Reds
team_to_loc = {}

day_id_to_games = {} # ex: 9: [SF, MIN, ... ]

c = conn.cursor()

for row in c.execute('SELECT team_name_short, team_lat, team_long FROM teams'):
	team_to_loc[row[0]] = (row[1], row[2])

# 1 to 183 - day_id
for i in range(1, 184):
	for row in c.execute('SELECT home_team_short, away_team_short FROM schedules WHERE day_id={0}'.format(i)):
		if i not in day_id_to_games:
			day_id_to_games[i] = []

		game = [row[0], row[1]]
		day_id_to_games[i].append(game)

#ASG - special case
team_to_loc['ASG_NL'] = team_to_loc['CIN']
day_id_to_games[101] = [['ASG_NL', 'ASG_AL']]

print('var team_to_loc = {}')
for team in team_to_loc:
	print('team_to_loc[\'{0}\'] = [{1}, {2}]'.format(team, team_to_loc[team][0], team_to_loc[team][1]))

print('var day_id_to_games = {}')
for day_id in day_id_to_games:
	print('day_id_to_games[{0}] = {1}'.format(day_id, day_id_to_games[day_id]))

print('var team_name_to_code = {}')
print('team_name_to_code[\'Orioles\'] = \'BAL\'')
print('team_name_to_code[\'Red Sox\'] = \'BOS\'')
print('team_name_to_code[\'White Sox\'] = \'CWS\'')
print('team_name_to_code[\'Indians\'] = \'CLE\'')
print('team_name_to_code[\'Tigers\'] = \'DET\'')
print('team_name_to_code[\'Astros\'] = \'HOU\'')
print('team_name_to_code[\'Royals\'] = \'KC\'')
print('team_name_to_code[\'Twins\'] = \'MIN\'')
print('team_name_to_code[\'Yankees\'] = \'NYY\'')
print('team_name_to_code[\'Athletics\'] = \'OAK\'')
print('team_name_to_code[\'Mariners\'] = \'SEA\'')
print('team_name_to_code[\'Rays\'] = \'TB\'')
print('team_name_to_code[\'Rangers\'] = \'TEX\'')
print('team_name_to_code[\'Blue Jays\'] = \'TOR\'')
print('team_name_to_code[\'Angels\'] = \'LAA\'')
print('team_name_to_code[\'D-backs\'] = \'ARI\'')
print('team_name_to_code[\'Braves\'] = \'ATL\'')
print('team_name_to_code[\'Cubs\'] = \'CHC\'')
print('team_name_to_code[\'Reds\'] = \'CIN\'')
print('team_name_to_code[\'Rockies\'] = \'COL\'')
print('team_name_to_code[\'Dodgers\'] = \'LAD\'')
print('team_name_to_code[\'Marlins\'] = \'MIA\'')
print('team_name_to_code[\'Brewers\'] = \'MIL\'')
print('team_name_to_code[\'Mets\'] = \'NYM\'')
print('team_name_to_code[\'Phillies\'] = \'PHI\'')
print('team_name_to_code[\'Pirates\'] = \'PIT\'')
print('team_name_to_code[\'Padres\'] = \'SD\'')
print('team_name_to_code[\'Giants\'] = \'SF\'')
print('team_name_to_code[\'Cardinals\'] = \'STL\'')
print('team_name_to_code[\'Nationals\'] = \'WAS\'')
# SPECIAL CASE - ALL-STAR GAME
print('team_name_to_code[\'National\'] = \'ASG_NL\'')