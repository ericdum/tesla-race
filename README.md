# Tesla Race ([based on teslamate](https://github.com/adriankumpf/teslamate))

The project is use to animate the trajectories of tesla trip to compare each trajectory with time dimension. For example, you can do such a kind of race between two point to find out a best path from origin to destination.

![20230223155759](https://user-images.githubusercontent.com/690825/220850761-cbd92afd-90f2-4f4e-985b-c28ced8c3dc6.jpg)

https://user-images.githubusercontent.com/690825/220274451-5a001fcd-f9f0-4aa8-8a8a-cecd0f428adf.mp4

# Usage

## Local
1. Signup to MapBox for a access token at https://account.mapbox.com/ for free.
1. Download project and execute command in the root directory
`MAPBOX_TOKEN=token node main.js`
1. Access http://localhost:3000/

## Docker
1. Signup to MapBox for a access token at https://account.mapbox.com/ for free.
2. `docker pull ericdum/tesla-race:latest`
3. `docker run -p 3000:3000 -e PG_PORT=... -e PG_HOST=... -e MAPBOX_TOKEN=your_token ericdum/tesla-race`

# Database

The protect using postgres provided by teslamate.

To configurate the database connection by set env var like PG_PORT, PG_HOST,... find more in lib/postgres.js

# Privacy protect

If you want to show the page to anyothers but want to hide your home or your work place, you can add a polygon area into `main.js`.

FYI, you can easily gernerate the polygon by https://geojson.io/

# Todo
- [x] Autocomlete search for OD.
- [x] Add a Timer.
- [x] Give a Classifier for different type of route.
- [ ] Enhance OD searching by street addresses.
- [ ] Support long range travel.
- [ ] Custom replay speed
- [ ] Give charts for speed, AP status,...
- [ ] Drop icons to the map when meet red lights.
- [ ] Cluster by different trajectory and give different color to their marker.
- [ ] Date Picker

# Contributes
Welcome to contributes, you can either add on framework or implement features, pls fork and make pull request. 
