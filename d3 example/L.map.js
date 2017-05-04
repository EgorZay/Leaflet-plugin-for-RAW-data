/**
 * Created by EvgenySH on 03.05.17.
 */
var xhr = new XMLHttpRequest();
xhr.open('GET', '/vardah.tiff', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {

    var tiff = GeoTIFF.parse(this.response);
    var image = tiff.getImage();
    var tiffWidth = image.getWidth();
    var tiffHeight = image.getHeight();
    var rasters = image.readRasters();
    var tiepoint = image.getTiePoints()[0];
    var pixelScale = image.getFileDirectory().ModelPixelScale;
    var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1*pixelScale[1]];


    var pressData = new Array(tiffHeight);
    var tempData = new Array(tiffHeight);
    var uData = new Array(tiffHeight);
    var vData = new Array(tiffHeight);
    var spdData = new Array(tiffHeight);
    for (var j = 0; j<tiffHeight; j++){
        pressData[j] = new Array(tiffWidth);
        tempData[j] = new Array(tiffWidth);
        uData[j] = new Array(tiffWidth);
        vData[j] = new Array(tiffWidth);
        spdData[j] = new Array(tiffWidth);
        for (var i = 0; i<tiffWidth; i++){
            pressData[j][i] = rasters[0][i + j*tiffWidth];
            tempData[j][i] = rasters[1][i + j*tiffWidth];
            uData[j][i] = rasters[2][i + j*tiffWidth];
            vData[j][i] = rasters[3][i + j*tiffWidth];
            spdData[j][i] = 1.943844492 * Math.sqrt(uData[j][i]*uData[j][i] + vData[j][i]*vData[j][i]);

        }
    }

    var intervalsSpd = [0, 8, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42,
        44, 46, 48, 50, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96 ];
    var bandsWind = rastertools.isobands(spdData, geoTransform, intervalsSpd);

    function getColor(d) {
        return d > 92   ? '#643c32' :
            d > 88   ? '#643c32' :
                d > 84   ? '#a50000' :
                    d > 80   ? '#c10000' :
                        d > 76   ? '#e11400' :
                            d > 72   ? '#ff3200' :
                                d > 68   ? '#ff6000' :
                                    d > 64   ? '#ffa100' :
                                        d > 60   ? '#ffc13c' :
                                            d > 56   ? '#ffe978' :
                                                d > 52   ? '#c9ffbf' :
                                                    d > 50   ? '#b5fbab' :
                                                        d > 48   ? '#97f58d' :
                                                            d > 46   ? '#78f572' :
                                                                d > 44   ? '#50ef50' :
                                                                    d > 42   ? '#36d33c' :
                                                                        d > 40   ? '#1eb31e' :
                                                                            d > 38   ? '#0ea10e' :
                                                                                d > 36   ? '#e1ffff' :
                                                                                    d > 34   ? '#b5f1fb' :
                                                                                        d > 32   ? '#97d3fb' :
                                                                                            d > 30   ? '#78b9fb' :
                                                                                                d > 28   ? '#50a5f5' :
                                                                                                    d > 26   ? '#3c97f5' :
                                                                                                        d > 24   ? '#2883f1' :
                                                                                                            d > 22   ? '#1e6eeb' :
                                                                                                                d > 20   ? '#1464d3' :
                                                                                                                    d > 18   ? '#646464' :
                                                                                                                        d > 16   ? '#979797' :
                                                                                                                            d > 14   ? '#bababa' :
                                                                                                                                d > 12   ? '#d1d1d1' :
                                                                                                                                    d > 8    ? '#e5e5e6' :
                                                                                                                                        d > 0   ? '#ffffff' :
                                                                                                                                            '#ffffff';
    }


    function style(feature) {
        return {
            fillColor: getColor(feature.properties[0].lowerValue),
            weight: 2,
            opacity: 1,
            color: getColor(feature.properties[0].lowerValue),
            dashArray: '3',
            fillOpacity: 0.5
        };
    }

    var bandsWindLayer = L.geoJson(bandsWind, {
        style: style
    });


    var intervalsPress = [970, 972, 974, 976, 978, 980, 982, 984, 986, 988, 990, 992, 994, 996, 998,
        1000, 1002, 1004, 1006, 1008, 1010, 1012, 1014, 1016, 1018, 1020, 1022, 1024, 1026, 1028];
    var isobars = rastertools.isolines(pressData, geoTransform, intervalsPress);

    var isobarsLayer = L.geoJSON(isobars, {
        style: {
            "color": "#333",
            "weight": 2,
            "opacity": 0.65
        }
    });

    //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
    var cs_def = {positions:[0.0,0.030303030303,0.0606060606061,0.0909090909091,0.121212121212,0.151515151515,0.181818181818,0.212121212121,0.242424242424,0.272727272727,0.30303030303,0.333333333333,0.363636363636,0.393939393939,0.424242424242,0.454545454545,0.484848484848,0.515151515152,0.545454545455,0.575757575758,0.606060606061,0.636363636364,0.666666666667,0.69696969697,0.727272727273,0.757575757576,0.787878787879,0.818181818182,0.848484848485,0.878787878788,0.909090909091,0.939393939394,0.969696969697,1.0],
        colors:["#ffffff", "#e5e5e6" , "#d1d1d1", "#bababa", "#979797", "#646464",
            "#1464d3", "#1e6eeb", "#2883f1", "#3c97f5", "#50a5f5", "#78b9fb", "#97d3fb", "#b5f1fb", "#e1ffff",
            "#0ea10e", "#1eb31e", "#36d33c", "#50ef50", "#78f572", "#97f58d", "#b5fbab", "#c9ffbf",
            "#ffe978", "#ffc13c", "#ffa100", "#ff6000", "#ff3200", "#e11400", "#c10000", "#a50000",
            "#643c32", "#785046", "#8d645a"]};
    var scaleWidth = 256;
    var canvasColorScale = document.createElement('canvas');
    canvasColorScale.width = scaleWidth;
    canvasColorScale.height = 1;
    canvasColorScale.style.display = "none";

    document.body.appendChild(canvasColorScale);

    var contextColorScale = canvasColorScale.getContext("2d");
    var gradient = contextColorScale.createLinearGradient(0, 0, scaleWidth, 1);

    for (var i = 0; i < cs_def.colors.length; ++i) {
        gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
    }
    contextColorScale.fillStyle = gradient;
    contextColorScale.fillRect(0, 0, scaleWidth, 1);

    var csImageData = contextColorScale.getImageData(0, 0, scaleWidth-1, 1).data;

    //Calculating the image
    var width = 680,
        height = 500;

    var canvasRaster = document.createElement('canvas');
    canvasRaster.width = width;
    canvasRaster.height = height;
    canvasRaster.style.display = "none";

    document.body.appendChild(canvasRaster);

    var contextRaster = canvasRaster.getContext("2d");

    var id = contextRaster.createImageData(width,height);
    var data = id.data;
    var pos = 0;
    var invGeoTransform = [-geoTransform[0]/geoTransform[1], 1/geoTransform[1],0,-geoTransform[3]/geoTransform[5],0,1/geoTransform[5]];
    for(var j = 0; j<height; j++){
        for(var i = 0; i<width; i++){
            var pointCoordsX = geoTransform[0] + i*tiffWidth*geoTransform[1]/width;
            var pointCoordsY = geoTransform[3] + j*tiffHeight*geoTransform[5]/height;


            var px = invGeoTransform[0] + pointCoordsX * invGeoTransform[1];
            var py = invGeoTransform[3] + pointCoordsY * invGeoTransform[5];

            var value;
            if(Math.floor(px) >= 0 && Math.ceil(px) < image.getWidth() && Math.floor(py) >= 0 && Math.ceil(py) < image.getHeight()){
                var dist1 = (Math.ceil(px)-px)*(Math.ceil(py)-py);
                var dist2 = (px-Math.floor(px))*(Math.ceil(py)-py);
                var dist3 = (Math.ceil(px)-px)*(py-Math.floor(py));
                var dist4 = (px-Math.floor(px))*(py-Math.floor(py));
                if (dist1 != 0 || dist2!=0 || dist3!=0 || dist4!=0){
                    value = spdData[Math.floor(py)][Math.floor(px)]*dist1+
                        spdData[Math.floor(py)][Math.ceil(px)]*dist2 +
                        spdData[Math.ceil(py)][Math.floor(px)]*dist3 +
                        spdData[Math.ceil(py)][Math.ceil(px)]*dist4;
                } else {
                    value = spdData[Math.floor(py)][Math.floor(px)];
                }
            } else {
                value = -999;
            }
            var c = Math.round((scaleWidth-1) * ((value - 8)/88));
            var alpha = 200;
            if (c<0 || c > (scaleWidth-1)){
                alpha = 0;
            }
            data[pos]   = csImageData[c*4];;
            data[pos+1]   = csImageData[c*4+1];
            data[pos+2]   = csImageData[c*4+2];
            data[pos+3]   = alpha;
            pos = pos + 4

        }
    }
    contextRaster.putImageData( id, 0, 0);
    var imageBounds = [[geoTransform[3], geoTransform[0]], [geoTransform[3] + tiffHeight*geoTransform[5], geoTransform[0] + tiffWidth*geoTransform[1]]];

    var imageLayer = L.imageOverlay(canvasRaster.toDataURL(), imageBounds,{
        opacity: 0.5
    });

    var baseLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    });

    var map = L.map('map', {
        layers: [baseLayer, bandsWindLayer]
    }).setView([13, 81], 6);


    L.control.layers(null, {
        "Wind speed": bandsWindLayer,
        "Pressure": isobarsLayer,
        "Image": imageLayer
    }).addTo(map);


    map.on('click', function(e) {
        var xTiff = (e.latlng.lng - geoTransform[0])/geoTransform[1];
        var yTiff = ( e.latlng.lat - geoTransform[3])/geoTransform[5];
        var temp = tempData[Math.round(yTiff)][Math.round(xTiff)];
        var press = pressData[Math.round(yTiff)][Math.round(xTiff)];
        var uValue = uData[Math.round(yTiff)][Math.round(xTiff)];
        var vValue = vData[Math.round(yTiff)][Math.round(xTiff)];
        var spd = Math.sqrt(uValue*uValue + vValue*vValue);
        var dir = 270 + (Math.atan2(-vValue,uValue)*180/Math.PI);
        if(dir<0){dir = dir + 360;}
        if(dir>360){dir = dir - 360;}

        L.popup()
            .setLatLng(e.latlng)
            .setContent("Wind speed: " + spd.toFixed(1) + " kt <br/>Wind dir: " + dir.toFixed(0) +"º <br/>Temp: " + temp.toFixed(1) + " C<br/>Pressure: " + press.toFixed(0) + " hPa")
            .openOn(map);
    });
};
xhr.send();