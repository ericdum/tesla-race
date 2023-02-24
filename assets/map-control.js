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
