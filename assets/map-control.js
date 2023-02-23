
const origins = []
const destinations = []

$(()=>{
  $('.map-control').on('change', function(){
    map.flyTo({center: [$('#longitude').val()*1, $('#latitude').val()*1], zoom:$('#zoom').val()*1});
  })
  map.on('move', () => {
    let center = map.getCenter()
    $('#longitude').val(center.lng)
    $('#latitude').val(center.lat)
    $('#zoom').val(map.getZoom())
  });

  $('#submit').on('onclick', ()=>{
    $('form').href('/?'+$('form').serialize())
  })

  $('#origin, #destination').on('change', function() {
    //availableODs();
  })

  $('#origin').autocomplete({
    filterMinChars: -1,
    preProcess: (data) => {
      return data.origins;
    }
  }).on('change', () => {
    $('#destination').attr('data-filter', `/od_pairs?origin=${$("#origin").val()}&destination=#QUERY#`)
  })

  $('#destination').autocomplete({
    filterMinChars: -1,
    preProcess: (data) => {
      return data.destinations;
    }
  }).on('change', () => {
    $('#destination').attr('data-filter', `/od_pairs?destination=${$("#destination").val()}&origin=#QUERY#`)
  })

  //availableODs();
})


var timeline = (function(){
  var h = 0;
  var m = 0;
  var s = 0;

  var round = 0;
  var balance = {};
  return {
    load: function(name, callback) {
      if (!balance[name]) balance[name] = 1;
      else balance[name]++;
      if (balance[name] > round) {
        round++;
        this.updateTimer();
      }
      requestAnimationFrame(callback);
    },
    finish: function(name, color) {
      $('#timer .logs').append($("<p class=\"p-1\">").css({
        backgroundColor: color,
        color: "white",
        marginBottom: 0,
      }).text(`${name}: ${this.getTime()}`).hover(function(){
        map.setPaintProperty(name+'-animation', 'line-blur', 0);
      }, function(){
        map.setPaintProperty(name+'-animation', 'line-blur', 5);
      }))
    },
    updateTimer: function(){
      s += STEP
      if (s>=60) {
        m += Math.floor(s/60)
        s %= 60
      }
      if (m>=60) {
        h += Math.floor(m/60)
        m %= 60
      }

      $("#timer .remains").text(this.getTime())
    }, 
    getTime: function() {
      var th = h.toString(), tm = m.toString(), ts = s.toString();
      if (h < 10) th = "0" + h;
      if (m < 10) tm = "0" + m;
      if (s < 10) ts = "0" + s;

      if (h) {
        return th + ":" + tm + ":" + ts
      } else {
        return tm + ":" + ts
      }
    }
  }
})()

function classify(data) {
  var threshold = $('#threshold').val();
  var simplified = [];
  var origin = data[0][0];
  var dest = data[0][data[0].length-1];
  var resolution = 100;
  var types = 0;
  var size = [
    Math.ceil(Math.abs(origin[1] - dest[1])*resolution), 
    Math.ceil(Math.abs(origin[2] - dest[2])*resolution)
  ]

  function matrix(x, y) {
    return new Array(x*y).fill(0)
  }

  function simplify(traj) {
    var m = matrix(size[0], size[1])
    var c = 0;
    traj.forEach(function(p){
      var x = Math.ceil(Math.abs(p[1] - origin[1]) * resolution) 
      var y = Math.ceil(Math.abs(p[2] - origin[2]) * resolution) 
      if (!m[x*size[0]+y]) {
        m[x*size[0]+y] = 1
        c++;
      }
    })
    return [m, c];
  }

  function compare(a, b) {
    return a[0].map(function(p, i){
      return a[0][i] == b[0][i] ? 0 : 1
    }).reduce(function(a, b) {
      return a+b;
    }, 0) / Math.max(a[1], b[1])
  }

  var classified = []
  data.forEach(function(traj){
    var min = 1;
    var type = -1;

    var st = simplify(traj)
    var cost = simplified.map(function(base){
      return compare(st, base)
    }).forEach(function(c, i){
      if (c < min) {
        min = c;
        type = i;
      }
    })

    if (min > threshold) {
      traj.type = types++;
      simplified.push(st)
    } else {
      traj.type = type;
    }
  })

  return data;
}


/*
function availableODs() {
  let origin = $('#origin').val()
  let dest = $('#destination').val()

  origins.splice(0)
  destinations.splice(0)

  ods.forEach(function(od){
    if (od.start_name == origin) destinations.push(od.end_name)
    if (od.end_name == origin) origins.push(od.start_name)
  })
}
//*/
