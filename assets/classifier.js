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
