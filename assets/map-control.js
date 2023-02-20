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

    $('input').on('change', function() {
      console.log($(this).data())
      console.log($(this).serialize())
    })
  })
