import sys
import urllib.request
import re
from geopy.geocoders import GoogleV3

'''
USAGE: 
sqlite3 <DB_NAME.db>
.read <SCRIPT-GENERATED SQLITE COMMANDS>
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

TABLE_SCHEDULE = "schedule"
SCHEDULE_ID = "id"
SCHEDULE_DAY_ID = "day_id" # Apr 5 = 1, etc
SCHEDULE_HOME_TEAM_ID = "home_team_id"
SCHEDULE_AWAY_TEAM_ID = "away_team_id"
SCHEDULE_TIME_START = "time_start"

geolocator = GoogleV3()


all_insert_statements = []

#unused
def create_db():
	print("sqlite3 " + DB_NAME);

# teams && schedule
def create_tables():
	all_insert_statements.append("CREATE TABLE " + TEAMS_TABLE + "(" 
	+ TEAM_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
	+ TEAM_NAME + " CHAR(50), "
	+ TEAM_NAME_SHORT + " CHAR(3), "
	+ TEAM_ADDRESS + " CHAR(100), "
	+ TEAM_LAT + " REAL, "
	+ TEAM_LONG + " REAL);");

def put_teams_into_table():
	all_teams_url = "http://baseballwise.com/club/mlbaddresses.html"
	response = urllib.request.urlopen(all_teams_url)
	html = str(response.read())

	teams = re.findall(r'<B><FONT FACE="Arial, Helvetica">([A-Z. ]+)<', html)
	addresses = re.findall(r'Mailing Address:([A-Za-z ,.0-9]+)', html)
	for index, team in enumerate(teams):
		address = addresses[index].strip()

		##address fixups
		if (re.match(".*MARLINS.*", team)): # marlins park outdated address from page
			team = "MIAMI MARLINS"
			address = "501 Marlins Way, Miami, FL 33125"
		if (re.match(".*RANGERS.*", team)): # all others have P.O. box listed instead of address
			address = "1000 Ballpark Way, Arlington, TX 76011"
		if (re.match(".*MARINERS.*", team)):
			address = "1250 1st Avenue South, Seattle, WA 98134"
		if (re.match(".*DIAMONDBACKS.*", team)):
			address = "401 East Jefferson Street, Phoenix, AZ 85004"
		if (re.match(".*BRAVES.*", team)): 
			address = "755 Hank Aaron Drive Southeast, Atlanta, GA 30315"
		if (re.match(".*PIRATES.*", team)):
			address = "115 Federal Street, Pittsburgh, PA 15212"
		if (re.match(".*ROYALS.*", team)):
			address = "115 Federal Street, Pittsburgh, PA 15212"

		(lat, lng) = get_ballpark_address_coords(address)		
		
		# 3 letters, to match baseball-reference.com. i.e. NYY
		short_name = input("Please enter short name for " + team + "\n").upper()

		full_team_insert_stmt(team, address, lat, lng, short_name)


def get_ballpark_address_coords(address):
	full_addr = geolocator.geocode(address)
	_, (lat, lng) = full_addr
	return (lat, lng)

def full_team_insert_stmt(team_name, team_address, latitude, longitude, short_name):
	insert_stmt = "INSERT INTO {0}({1}, {2}, {3}, {4}, {5}) VALUES (\"{6}\", \"{7}\", {8}, {9}, \"{10}\");".format(TEAMS_TABLE, 
		TEAM_NAME, TEAM_ADDRESS, TEAM_LAT, TEAM_LONG, TEAM_NAME_SHORT,
		team_name, team_address, latitude, longitude, short_name);
	all_insert_statements.append(insert_stmt)

def write_insert_stmts():
	f = open('insert_teams.sql', 'w')
	for line in all_insert_statements:
		f.write(line + "\n")

create_tables()
put_teams_into_table()
write_insert_stmts()