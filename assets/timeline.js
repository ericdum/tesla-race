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
