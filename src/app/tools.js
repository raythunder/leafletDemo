var arr=[]
map.on('click',function(e){
    arr.push([e.latlng.lat,e.latlng.lng])
    console.log(String(arr))
    L.marker(e.latlng,{
        title:"MyPoint",alt:"The Big I",draggable:true
    }).addTo(map)
})