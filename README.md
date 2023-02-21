# Tesla Race ([based on teslamate](https://github.com/adriankumpf/teslamate))

The project is using to animate the trajectories of tesla trip to compare each trajectory with time dimension. For example, you can do such a kind of race between two point to find out a best path from origin to destination.

# Usage

1. Signup to MapBox for a access token at https://account.mapbox.com/
1. Download project and execute command in the root directory
`MAPBOX_TOKEN=token node main.js`
1. Access http://localhost:3000/

# Database

The protect using postgres provided by teslamate.

To configurate the database connection by set env var like PG_PORT, PG_HOST,... find more in lib/postgres.js

# 

# Todo
[x] Autocomlete search for OD.
[] Enhance OD searching by street addresses.
[] Support long range travel.
[] Custom replay speed
[] Give charts for speed, AP status,...
[] Drop icons to the map when meet red lights.
[] Cluster by different trajectory and give different color to their marker.
[] Date Picker

# Contributes
Welcome to contributes, you can either add on framework or implement features, pls fork and make pull request. 
