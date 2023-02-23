// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = MAPBOX_TOKEN
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/dark-v10',
  center: CENTER,
  zoom: ZOOM
});

// Create a GeoJSON source with an empty lineString.
let animation; // to store and cancel the animation
let startTime = 0;
let resetTime = false; // indicator of whether time reset is needed for the animation
const pauseButton = document.getElementById('pause');

map.on('load', () => {
  scretes = SECRETS
  scretes.forEach((data, i) => {
    let name = 'secret-' + i;
    map.addSource(name, {
      'type': 'geojson',
      'data': data
    });
    map.addLayer({
      'id': name,
      'type': 'fill',
      'source': name,
      'paint': {
        "fill-color": "#a1dab4",
        "fill-opacity": 0.4,
      }
    });
  })
  // reset startTime and progress once the tab loses or gains focus
  // requestAnimationFrame also pauses on hidden tabs by default
  document.addEventListener('visibilitychange', () => {
    resetTime = true;
  });

  const colors = [
//  '#a1dab4',
//  '#41b6c4',
//  '#2c7fb8',
//  '#253494',
//  '#feb24c',
//  '#fd8d3c',
//  '#f03b20',
//  '#bd0026'
    '#ff4747',
    '#dad623',
    '#2361da',
    '#4eda23',
  ];

  const markerColor = [
    '#a1dab4',
    '#2c7fb8',
    '#feb24c',
    '#f03b20',
    '#ff4747',
    '#dad623',
    '#2361da',
    '#4eda23',
  ];

  const windows = {
  }

  function average(name, value) {
    if ( ! windows[name]) windows[name] = [];
    if (windows[name].length > 60) windows[name].shift();
    windows[name].push(value);
    return windows[name].reduce((a, b)=> a+b, 0) / windows[name].length
  }

  function speedLevel(name, speed) {
    if (speed < 20) return 0; // red
    else if (speed < 40) return 1; // yellow
    else if (speed < 60) return 2; // blue
    else return 3;
  }

  function feature(level) {
      return {
          'properties': {
            'color': colors[level] // blue
          },
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        }
  }


  var ci = 0;
  // animated in a circle as a sine wave along the map.
  window.createLine = createLine;
  function createLine(name, data) {
    //TODO
    //if (data.length> 2000) return ;
    var i = 0;
    var curLevel;
    var curFeature;

    const geojson = {
      'type': 'FeatureCollection',
      'features': [
      ]
    };

    map.addSource(name, {
      'type': 'geojson',
      'data': geojson
    });
  
    // add the line which will be modified in the animation
    map.addLayer({
      'id': name + '-animation',
      'type': 'line',
      'source': name,
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        //'line-color': colors[ci++],
        'line-color': ['get', 'color'],
        'line-width': 10,
        'line-opacity': 0.8,
        'line-blur': 5
      }
    });

    const popup = new mapboxgl.Popup({ 
      closeOnClick: false,
      closeButton: false,
      closeOnMove: false,
      focusAfterOpen: false,
      maxWidth: '100px',
      offset: 25 
    }).setText(
      ''
    );

    data.color = markerColor[data.type%markerColor.length];
    const marker = new mapboxgl.Marker({
      color: data.color
    })
    .setLngLat([0, 0])
    //.setPopup(popup)
    .addTo(map)
    .togglePopup()
    ;

    var startTime = data[0][0];

    function animateLine(timestamp) {
      if (i == data.length) {
        return timeline.finish(name, data.color);//stop
        // restart if it finishes a loop
        i = 0;
        startTime = timestamp;
        geojson.features[0].geometry.coordinates = [];
      } else {
        var speed = Math.floor(average(name, data[i][3]));
        var level = speedLevel(name, speed);
        var pos = data[i].slice(1, 3);

        //popup.setText(moment((data[i][0] - startTime) * 1000).format("mm:ss"))
        popup.setText('速度：'+ speed)
        marker.setLngLat(pos);
        // append new coordinates to the lineString
        if (typeof curLevel == 'undefined' || curLevel != level) {
          curLevel = level;
          curFeature = feature(level);
          geojson.features.push(curFeature);
        }

        curFeature.geometry.coordinates.push(pos);
        // then update the map
        map.getSource(name).setData(geojson);
        marker.addTo(map);
        i++;
      }
      // Request the next frame of the animation.
      animation = timeline.load(name, animateLine);
    }

    return animateLine();
  };

  //map.setPitch(30);

  /*
  map.loadImage(
    'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
    (error, image) => {
      if (error) throw error;
      map.addImage('custom-marker', image);
      // Add a GeoJSON source with 2 points
      map.addSource('points', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
            // feature for Mapbox DC
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [
                  -77.03238901390978, 38.913188059745586
                ]
              },
              'properties': {
                'title': 'Mapbox DC'
              }
            },
            {
            // feature for Mapbox SF
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [-122.414, 37.776]
              },
              'properties': {
                'title': 'Mapbox SF'
              }
            }
          ]
        }
      });

      // Add a symbol layer
      map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
          'icon-image': 'custom-marker',
          // get the title name from the source's "title" property
          'text-field': ['get', 'title'],
          'text-font': [
            'Open Sans Semibold',
            'Arial Unicode MS Bold'
          ],
          'text-offset': [0, 1.25],
          'text-anchor': 'top'
        }
      });
    }
  );

  map.addSource('screte', {
    type: 'geojson',
    data: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  120.01454114913939,
                  30.245054357543466
                ],
                [
                  120.00917673110962,
                  30.244655814846315
                ],
                [
                  120.01014232635498,
                  30.239307771595985
                ],
                [
                  120.01561403274536,
                  30.239956596513824
                ],
                [
                  120.01454114913939,
                  30.245054357543466
                ]
              ]
            ]
          }
        }
      ]
    }
  })

  map.addLayer({
    'id': 'mask',
    'type': 'fill',
    'source': 'screte',
    'layout': {
    },
    'paint': {
      'fill-color': "#000000",
      //'line-color': colors[ci++],
    }
  });
  //*/

});

function parseData(data) {
  return Object.keys(data).map(function(key){
    return standarlize(data[key]);
  })
}

// linear standarlize to a fixed frequency to 1 Hz.
// data structure: [position1, position2, ...]
// position structre: [time, longitude, latitude, speed]
function standarlize(data) {
  var cur = data[0][0];
  var i = 0;
  var result = [data[i++]];
  while(i<data.length) {
    // time diff
    var diff = data[i][0] - result[result.length-1][0]
    if (diff < 0) throw new Error("数据异常")
    switch (diff) {
      case 0: break;;
      case 1: 
        result.push(data[i])
        break;
      default:
        var dx = (data[i][1] - result[result.length-1][1]) / diff
        var dy = (data[i][2] - result[result.length-1][2]) / diff
        var ds = (data[i][3] - result[result.length-1][3]) / diff
        var dt = 1;
        // insert frame
        for(var j=1; j<=diff; j++) {
          result.push([
            result[result.length-1][0]+dt,
            result[result.length-1][1]+dx,
            result[result.length-1][2]+dy,
            result[result.length-1][3]+ds,
          ])
        }
    };
    i++;
  }
  return result;
}
