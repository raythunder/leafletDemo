// 高德地图
var normalm = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
    maxZoom: 18,
    minZoom: 15
});
var normal = L.layerGroup([normalm])

// var layer = {
//     imageUrl: 'src/images/map2.png',
//     imageBounds: [
//         [28.710463073923, 120.621643066406],
//         [28.668901074144, 120.590744018555]
//     ]
// }
// var imageLayer = L.imageOverlay(layer.imageUrl, layer.imageBounds, {
//     zIndex: 0,
//     className: ' base-map'
// })

// var map = L.map('map').setView([35.10418, -106.62987],10);
var map = L.map('map', {
    center: [28.6896820740335, 120.6061935424805],
    zoom: 12,
    layers: [normal],  // 图层
    zoomControl: false
});
