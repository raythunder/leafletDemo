map.on('click',function(e){
    console.log([e.latlng.lat,e.latlng.lng])
    L.marker([e.latlng.lat,e.latlng.lng],{
        title:"MyPoint",alt:"The Big I",draggable:true
    }).addTo(map)
})