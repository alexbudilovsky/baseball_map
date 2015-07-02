import sqlite3

db_filename = 'mlb_schedule_2015.db'

conn = sqlite3.connect(db_filename)

team_to_loc = {}

day_id_to_home_teams = {} # ex: '3: [SF, OAK, ... ]

c = conn.cursor()

for row in c.execute('SELECT team_name_short, team_lat, team_long FROM teams'):
	team_to_loc[row[0]] = (row[1], row[2])

# 1 to 183 - day_id
for i in range(1, 184):
	for row in c.execute('SELECT home_team_short FROM schedules WHERE day_id={0}'.format(i)):
		if i not in day_id_to_home_teams:
			day_id_to_home_teams[i] = []

		day_id_to_home_teams[i].append(row[0])

print('var team_to_loc = {}')
for team in team_to_loc:
	print('team_to_loc[\'{0}\'] = [{1}, {2}]'.format(team, team_to_loc[team][0], team_to_loc[team][1]))

print('var day_id_to_home_teams = {}')
for day_id in day_id_to_home_teams:
	print('day_id_to_home_teams[{0}] = {1}'.format(day_id, day_id_to_home_teams[day_id]))