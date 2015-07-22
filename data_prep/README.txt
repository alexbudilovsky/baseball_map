This folder contains all tools used to prep the data (schedule and team data).  Files here are not actually used for rendering the website and scripts

1. 2015 schedule and team data is downloaded to schedule_data (thanks to reddit user lemcoe9 - http://www.reddit.com/r/baseball/comments/32gemp/sql_database_of_entire_2015_mlb_schedule_for_all/)

2. generate_sql_scripts/ contains python scripts which read provided data and write sqlite3 insert statements to insert_sql_scripts/

3. inserts for teams and games are run and mlb_schedule_2015 sqlite3 database is generated

4. generate_js_array_schedules.py is run to generate the javascript file containing data needed for the app - this way, no server side database access is required and javascript does not need to read sqlite3 data.  The generated file is called ../schedule_arrays.js