import sys
import urllib.request
import re
import csv
import time

'''
this script designed to run independent of generate_team_inserts.py
'''

team_id_to_code = {}

SCHEDULE_TABLE = "schedules"
SCHEDULE_ID = "id"
SCHEDULE_DAY_ID = "day_id" # Apr 5 = 1, etc
SCHEDULE_HOME_TEAM_SHORT = "home_team_short"
SCHEDULE_AWAY_TEAM_SHORT = "away_team_short"
SCHEDULE_TIME_START = "time_start" # not super necessary for 'MVP'

APR4_YEAR_DAY = 94 #94th day of year

all_insert_statements = []

def create_table():
	all_insert_statements.append("CREATE TABLE " + SCHEDULE_TABLE + "("
		+ SCHEDULE_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
		+ SCHEDULE_DAY_ID + " INTEGER, "
		+ SCHEDULE_HOME_TEAM_SHORT + " CHAR(3), "
		+ SCHEDULE_AWAY_TEAM_SHORT + " CHAR(3), "
		+ SCHEDULE_TIME_START + " CHAR(30));");

# map team id to team code, for schedule lookup
def iterate_through_teams():
	with open('../schedule_data/mlb_teams.csv') as csvfile:
		reader = csv.DictReader(csvfile)
		for row in reader:
			team_id_to_code[int(row['id'])] = row['code']

def create_schedule_inserts_from_csv():
	with open('../schedule_data/2015mlb_games.csv') as csvfile:
		reader = csv.DictReader(csvfile)
		for row in reader:
			home_id = int(row['home'])
			vis_id = int(row['visitor'])
			
			if home_id < 1 or vis_id < 1: #invalid ids (only top row)
				continue

			start_date_et = time.strptime(row['datetime_et'], '%Y-%m-%d %H:%M:%S') #ex format: "2015-06-06 16:10:00"
			year_day_of_game = start_date_et.tm_yday - APR4_YEAR_DAY # Apr5 = day 1 of season
			start_time = time.strftime('%X', start_date_et)

			if (year_day_of_game < 1): #skip all spring training games
				continue

			full_game_insert_stmt(year_day_of_game, team_id_to_code[vis_id], team_id_to_code[home_id], start_time)

			
def full_game_insert_stmt(day_id, visitor_code, home_code, start_time):
	insert_stmt = "INSERT INTO {0}({1}, {2}, {3}, {4}) VALUES ({5}, \"{6}\", \"{7}\", \"{8}\");".format(SCHEDULE_TABLE, 
		SCHEDULE_DAY_ID, SCHEDULE_AWAY_TEAM_SHORT, SCHEDULE_HOME_TEAM_SHORT, SCHEDULE_TIME_START, day_id, visitor_code, home_code, start_time)
	all_insert_statements.append(insert_stmt)

def create_index_on_day_id():
	all_insert_statements.append("CREATE INDEX day_id_index ON {0} ({1});".format(SCHEDULE_TABLE, SCHEDULE_DAY_ID))

def write_insert_stmts():
	f = open('../insert_sql_scripts/insert_scheds.sql', 'w')
	for line in all_insert_statements:
		f.write(line + "\n")

create_table()
iterate_through_teams()
create_schedule_inserts_from_csv()
create_index_on_day_id()
write_insert_stmts()