
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
