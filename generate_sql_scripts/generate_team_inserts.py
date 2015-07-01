import sys
import urllib.request
import re
from geopy.geocoders import GoogleV3
import csv

'''
USAGE:
python generate_time_inserts.py
sqlite3 <DB_NAME.db>
.read <SCRIPT-GENERATED SQLITE COMMANDS (insert_teams.sql)>
'''

DB_NAME = "baseball_schedule_215.db"

#table and column names
TEAMS_TABLE = "teams"
TEAM_ID = "id"
TEAM_NAME = "team_name" #ex: Giants
TEAM_NAME_SHORT = "team_name_short" #ex: SFG
TEAM_ADDRESS = "team_address" #ballpark address, for geopy
TEAM_LAT = "team_lat"
TEAM_LONG = "team_long"

geolocator = GoogleV3()


all_insert_statements = []

# teams && schedule
def create_table():
	all_insert_statements.append("CREATE TABLE " + TEAMS_TABLE + "(" 
	+ TEAM_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
	+ TEAM_NAME + " CHAR(50), "
	+ TEAM_NAME_SHORT + " CHAR(3), "
	+ TEAM_ADDRESS + " CHAR(100), "
	+ TEAM_LAT + " REAL, "
	+ TEAM_LONG + " REAL);");


def get_teams_from_raw_data():
	with open('../schedule_data/mlb_teams.csv') as csvfile:
		reader = csv.DictReader(csvfile)
		for row in reader:
			full_name = row['full_name']
			code = row['code']
			ballpark = row['ballpark_name']

			# for some reason geolocatior can't find these ballparks
			if re.match('.*Safeco.*', ballpark, re.IGNORECASE):
				ballpark = '1250 1st Avenue South, Seattle, WA 98134'
			elif re.match('.*Chase Field.*', ballpark, re.IGNORECASE):
				ballpark = '401 E Jefferson St, Phoenix, AZ 85004'
			elif re.match('.*Rangers Ballpark.*', ballpark, re.IGNORECASE):
				ballpark = '1000 Ballpark Way, Arlington, TX 76011'

			(addr, lat, lng) = get_ballpark_address(ballpark)

			full_team_insert_stmt(full_name, addr, lat, lng, code)

def get_ballpark_address(ballpark):
	full_addr = geolocator.geocode(ballpark)
	if (full_addr == None):
		return
	addr, (lat, lng) = full_addr
	return (addr, lat, lng)

def full_team_insert_stmt(team_name, team_address, latitude, longitude, short_name):
	insert_stmt = "INSERT INTO {0}({1}, {2}, {3}, {4}, {5}) VALUES (\"{6}\", \"{7}\", {8}, {9}, \"{10}\");".format(TEAMS_TABLE, 
		TEAM_NAME, TEAM_ADDRESS, TEAM_LAT, TEAM_LONG, TEAM_NAME_SHORT,
		team_name, team_address, latitude, longitude, short_name);
	all_insert_statements.append(insert_stmt)

def write_insert_stmts():
	f = open('../insert_sql_scripts/insert_teams.sql', 'w')
	for line in all_insert_statements:
		f.write(line + "\n")

create_table()
get_teams_from_raw_data()
write_insert_stmts()