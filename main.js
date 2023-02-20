/*
import Koa from 'koa';
import KoaRouter from 'koa-router';
import pool from './lib/postgres.js';
import m from 'moment';
import * as turf from '@turf/turf';
import views from 'koa-views';
*/

const Koa = require('koa');
const KoaRouter = require('koa-router');
const pool = require('./lib/postgres');
const m = require('moment');
const turf = require('@turf/turf');
const views = require('koa-views');
const serve = require('koa-static');
const mount = require('koa-mount');

const app = new Koa();
const router = new KoaRouter();
const render = views(__dirname + '/views', {
  map: {
    html: 'underscore'
  }
})

const scretes = [
  turf.polygon([[
            [ 120.01460552215576, 30.244720694000176 ],
            [ 120.0094610452652, 30.244271173268597 ],
            [ 120.01019597053526, 30.240818600136528 ],
            [ 120.01443386077882, 30.240253200764027 ],
            [ 120.01501321792603, 30.24110593299739 ],
            [ 120.0147181749344, 30.24257039065589 ],
            [ 120.015007853508, 30.24282064389539 ],
            [ 120.01460552215576, 30.244720694000176 ]
  ]], { name: 'origin'}),
  turf.polygon([[
            [ 120.02803802490233, 30.318793979084276 ],
            [ 120.030859708786, 30.317821521665426 ],
            [ 120.03811240196227, 30.31900699227783 ],
            [ 120.03868103027342, 30.323156026462833 ],
            [ 120.0282633304596, 30.323628338410348 ],
            [ 120.02715826034544, 30.321618681609593 ],
            [ 120.02803802490233, 30.318793979084276 ]
  ]], { name: 'destination'}),
]

function inScretes(data) {
  var inside = false;
  scretes.forEach((area) => {
    if (turf.inside(turf.point(data), area)) {
      inside = true;
      return false;
    }
  })
  return inside
}

/*
 * origin: name of origin which could customized at http://your-teslamate:4000/geo-fences
 * destination: name of destination
 * timerange: [Date, Date] will select all the trajectories between timerange[0] and timerange[1]
 * car_id: default 1
 *
 */
async function fixedODName(origin, destination, timerange, car_id=1){
  let positions = await pool.query(`
    (SELECT
     start_date,
     positions.date AS "time", positions.latitude, positions.longitude, convert_km(positions.speed::numeric, 'km') AS speed_kmh
    FROM drives
     LEFT JOIN geofences start_geofence ON start_geofence_id = start_geofence.id
     LEFT JOIN geofences end_geofence ON end_geofence_id = end_geofence.id
     LEFT JOIN positions on date BETWEEN start_date AND end_date
    WHERE 
     drives.start_date BETWEEN $3 AND $4
     AND drives.car_id = $5
     AND start_geofence.name = $1 and end_geofence.name = $2
    ORDER BY positions.date asc)
  `, [origin, destination, m(timerange[0]).toISOString(), m(timerange[1]).toISOString(), car_id])

  return filter(positions);
}

function filter(positions) {
  let result = {}
  positions.rows.forEach(function(pos){
    let start = m(pos.start_date)*1;

    if ( ! result[start] ) {
      result[start] = [];
    }

    if ( ! inScretes([pos.longitude, pos.latitude]) ) {
      result[start].push([
        m(pos.time).unix(), 
        pos.longitude*1, 
        pos.latitude*1, 
        pos.speed_kmh*1
      ])
    }
  })

  return result;
}

/*
 * origin: name of origin which could customized at http://nas2.qqyj.org:4000/geo-fences
 * destination: name of destination
 * timerange: [Date, Date] will select all the trajectories between timerange[0] and timerange[1]
 *
 */
async function buzzODName(origin, destination, timerange){
  var res = await pool.query(`select 1`)
  await pool.query(`
    (SELECT
     start_date,
     positions.date AS "time", positions.latitude, positions.longitude, convert_km(positions.speed::numeric, 'km') AS speed_kmh
    FROM drives
     LEFT JOIN addresses start_address ON start_address_id = start_address.id
     LEFT JOIN addresses end_address ON end_address_id = end_address.id
     LEFT JOIN geofences start_geofence ON start_geofence_id = start_geofence.id
     LEFT JOIN geofences end_geofence ON end_geofence_id = end_geofence.id
     left join positions on date BETWEEN start_date AND end_date
     JOIN cars ON cars.id = drives.car_id
    WHERE 
     drives.start_date BETWEEN '2023-01-01T00:18:00Z' AND '2023-02-18T10:45:25Z'
     AND drives.car_id = '1'
     AND (
     (COALESCE(start_geofence.name, CONCAT_WS(', ', COALESCE(start_address.name, nullif(CONCAT_WS(' ', start_address.road, start_address.house_number), '')), start_address.city))::TEXT like '%%' or
     COALESCE(end_geofence.name, CONCAT_WS(', ', COALESCE(end_address.name, nullif(CONCAT_WS(' ', end_address.road, end_address.house_number), '')), end_address.city))::TEXT like '%%')
     and (start_geofence.name = '')
     and end_geofence.name = '')
    ORDER BY positions.date asc)
  `)
}

async function getCars() {
  return await pool.query(`select distinct car_id from drives;`)
}

async function getOD(timerange) {
  return await pool.query(`
    select cnt, sg.name as start_name, eg.name as end_name from
    (
      select count(1) as cnt, start_geofence_id, end_geofence_id
      from drives
      where 
        start_geofence_id is not null 
        and end_geofence_id is not null
        and start_date BETWEEN $3 AND $4
      group by start_geofence_id, end_geofence_id
      order by cnt desc
    ) d
    left join geofences sg on sg.id = d.start_geofence_id
    left join geofences eg on eg.id = d.end_geofence_id
  `, [m(timerange[0]).toISOString(), m(timerange[1]).toISOString()])
}

router.get('/', async (ctx) => {
  let data = ctx.request.query
  let origin = data.origin;
  let destination = data.destination; 
  let car = data.car || 1; 
  let timerange = [
    m(data['date-from']) || m().add(-30, 'd'), 
    m(data['data-to']) || m()
  ]

  await ctx.render('index', {
    mapbox_token: process.env.MAPBOX_TOKEN,
    data: await fixedODName(origin, destination, timerange, car),
    scretes: scretes,
    origin: origin,
    destination: destination,
    timerange: timerange,
    longitude: data.longitude,
    latitude: data.latitude,
    zoom: data.zoom,
    car: data.car,
  });
})

app.use(mount('/assets', serve('./assets')));
app.use(render);
app.use(router.routes());

app.listen(process.env.PORT || 3000);
