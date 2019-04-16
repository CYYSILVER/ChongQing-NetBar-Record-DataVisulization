

drawMap();

function drawMap(){
    //创建地图， 使用mapbox的title
    var map = L.map('mapid').setView([29.779472,107.656929], 7);
   
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=sk.eyJ1IjoiY3lzaWx2ZXIiLCJhIjoiY2pwN3Vud3p5MGNydTNra2prcTA2YXF1dCJ9.VF3CJRbg2Q8HjoT9RZ2bdg', {
        attribution: '重庆网吧数据可视化 &nbsp;Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom:4,
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: 'sk.eyJ1IjoiY3lzaWx2ZXIiLCJhIjoiY2pwN3Vud3p5MGNydTNra2prcTA2YXF1dCJ9.VF3CJRbg2Q8HjoT9RZ2bdg',
    }).addTo(map);



    //重庆地图边框
    d3.json("src/ChongQing.geojson").then(function(ChongQingJson){
        L.geoJSON(ChongQingJson, {
            style:{
                fill:false,
                fillColor:'red',
                color:'#FEB24C',
            }
        }).addTo(map);
    });
    
    d3.json("src/age.json").then(function(dataAge){
        //在地图上绘制数据
        d3.json("src/dataProcessed.json").then(function(dataset){
            circleStyle = {
                fillTop:'orange',
                strokeTop:'white',
                fillOther:'grey',
                strokeOther:'white',
                mouseOn:'blue',
                top:25,
            };
            data = [];
            for (k in dataset){
                data.push({
                    name:k,
                    value:[dataset[k].lng, dataset[k].lat, dataset[k].value],
                    title:dataset[k].name,
                })
            };
        
          
    
            data.sort(function (a, b) {
                return  a.value[2] - b.value[2];
            });
            for (var i=0; i<data.length; i++){
                data[i].rank = data.length-i;
            }
            
            //在地图上绘制
            drawData(0, data, dataAge);
            
            
            //添加切换布局按钮
            var legendData = ['大小编码', '颜色编码'];
            
            var legend = d3.select("#mapid").append("div")
                .attr("class","legend");
                
            
            
            legend.selectAll("button")
                .data(legendData)
                .enter()
                .append("button")
                .text(d=>d)
                .on("click",function(d, i){
                    
                    drawData(i,data, dataAge);
                });

            
            //添加legend
    
            // //信息显示控制
            // var info = L.control(opts= {
            //     position:'topleft'
            // });
            // info.onAdd = function(map) {
            //     this._div = L.DomUtil.create('div','info');
            //     this.update();
            //     return this._div;
            // }
            //
            // info.update = function(props){
            //     console.debug(props);
            //
            //     this._div.innerHTML = '<h4>网吧热门程度</h4><br/>'+(props?'<b>'+props.description.title+'</b><br/>排名:'+props.description.rank+'<br/>热度:'+props.description.value[2]+'':'<b>Hover a place</b>');
            //
            //
            // }
            // info.addTo(map);
        });
    });
    var myrenderer = L.canvas();
    
    var others;
    var tops;
    var leftBottomLayers;
    var legendBottom = L.control({position: "bottomleft"});
   
    
    function drawData(mode, data, dataAge) {
        var maxVal = d3.max(data, function (d) {
            return d.value[2];
        });
        var minVal = d3.min(data, function (d) {
            return d.value[2];
        });
        var scale = d3.scalePow().domain([minVal, maxVal]).range([4, 30]).exponent(0.9);
        //颜色渐变
        var colorScale = d3.scaleLinear().domain([minVal, maxVal]).range(['hsl(210,100%,85%)', 'hsl(0,75%,50%)']).interpolate(d3.interpolateHslLong);
        if(mode == 1){
            legendBottom.onAdd = function(map){
                var div = L.DomUtil.create('div','info legendbl'),
                    grades = [0,1000,2000,3000,4000,5000,6000]
                for (var i = 0; i < grades.length; i++){
                    div.innerHTML += '<i style="background:'+colorScale(grades[i])+'"></i>' +
                        grades[i] + (grades[i+1]? '-'+grades[i+1]+'<br>':'+');
                }
                div.innerHTML += "<br>热门程度";
                return div;
            };
            legendBottom.addTo(map);
        }else{
            legendBottom.remove();
        }
        
    
        if (others) {
            others.clearLayers();
        }
        if (tops) {
            tops.clearLayers()
        }
        if (leftBottomLayers) {
            leftBottomLayers.remove();
        }
    
        var radiusInMode1 = 10;
        /*绘制后面的数据*/
        var markerTop = [];
        var markerOther = [];
        var markerHasTeen = [];
        var markerSus = [];
        for (var i = 0; i < data.length - circleStyle.top; i++) {
        
            var latlng = new L.latLng(data[i].value[1], data[i].value[0]);
            var color = colorScale(data[i].value[2]);
            var radius = scale(data[i].value[2]);
            var marker = L.circleMarker(latlng, {
                color: circleStyle.strokeOther,
                weight: 0.5,
                stroke: false,
                fillOpacity: 0.7,
                fillColor: mode === 1 ? color : circleStyle.fillOther,
                renderer: myrenderer,
                radius: mode === 1 ? radiusInMode1 : radius,
                description: data[i],
            }).on({
                mouseover: Lmouseover,
                mouseout: Lmouseout,
                click:clicked,
            }).bindTooltip(function (e) {
                var props = e.options
                var innerHTML = (props ? '<b>' + props.description.title + '</b><br/>排名:' + props.description.rank + '<br/>热度:' + props.description.value[2] + '' : '<b>Hover a place</b>');
                return innerHTML;
            }, {
                direction: 'right',
                offset: [radius * 0.9, radius * 0.1],
            });
    
            markerOther.push(marker);
            if(dataAge[data[i].name][0] >= 1){
                markerHasTeen.push(marker);
            }
            if(dataAge[data[i].name][4] >= dataAge[data[i].name][3] && dataAge[data[i].name][3] >= dataAge[data[i].name][2]){
                markerSus.push(marker);
            }
           
        }
    
    
        /*绘制前25的数据*/
        for (var i = data.length - circleStyle.top; i < data.length; i++) {
        
            var latlng = new L.latLng(data[i].value[1], data[i].value[0]);
            var color = colorScale(data[i].value[2]);
            var radius = scale(data[i].value[2]);
            var marker = L.circleMarker(latlng, {
                color: circleStyle.strokeTop,
                weight: 1,
                fillOpacity: 0.9,
                fillColor: mode === 1 ? color : circleStyle.fillTop,
                renderer: myrenderer,
                radius: mode === 1 ? radiusInMode1 : radius,
                description: data[i],
                zIndexOffset: 20,
            }).on({
                mouseover: Lmouseover,
                mouseout: Lmouseout,
                click:clicked,
            }).bindTooltip(function (e) {
                var props = e.options
                var innerHTML = (props ? '<b>' + props.description.title + '</b><br/>排名:' + props.description.rank + '<br/>热度:' + props.description.value[2] + '' : '<b>Hover a place</b>');
                return innerHTML;
            }, {
                direction: 'right',
                offset: [radius * 0.9, radius * 0.1],
            });
    
            markerTop.push(marker);
            if(dataAge[data[i].name][0] >= 1){
                markerHasTeen.push(marker);
            }
            if(dataAge[data[i].name][4] >= dataAge[data[i].name][3] && dataAge[data[i].name][3] >= dataAge[data[i].name][2]){
                markerSus.push(marker);
            }
        }
        others = L.layerGroup(markerOther).addTo(map);
        tops = L.layerGroup(markerTop).addTo(map);
        hasTeens = L.layerGroup(markerHasTeen);
        suspects = L.layerGroup(markerSus);
        
 
        leftBottomLayers = L.control.layers({}, {
            "其他": others,
            "热度前25": tops,
            "有未成年人接纳":hasTeens,
            "黑网吧嫌疑":suspects,
        }, {
            position: 'bottomleft',
            collapsed: false,
        }).addTo(map);
    
        var timer = null;
        
        function clicked(e) {
            var layer = e.target;
            // radar(0,0,layer.options.description.name);
            
        }
        function Lmouseover(e) {
            var layer = e.target;
        
            //将图层置顶
            // layer.bringToFront();
            layer.setStyle({
                fillColor: circleStyle.mouseOn
            });
            timer = d3.timeout(function () {
                console.debug(layer);
                //更新饼图
                updatePie(layer.options.description.name, layer.options.description.title, layer.options.description.rank, layer.options.description.value[2]);
                //更新折线图
                zxt.update(0, 0, layer.options.description.name);
                update_Rect(layer.options.description.name);
                //
                
                // console.debug(data);
            }, 250);
        }
    
        function Lmouseout(e) {
            timer.stop();
            var layer = e.target;
            var data = layer.options.description;
            var color = colorScale(data.value[2]);
            if (layer.options.description.rank >= circleStyle.top) {
                layer.setStyle({
                
                    fillColor: mode === 1 ? color : circleStyle.fillOther
                })
            }
            else {
                layer.setStyle({
                    fillColor: mode === 1 ? color : circleStyle.fillTop
                })
            }
        }
       
        
        
        /*标记当前点*/
        var preMarker;
        var preColor;
       function Lmaphighlight(target) {
            if (preMarker) {
                preMarker.setStyle({
                    fillColor:preColor,
                })
            }
            var index = -1;
            for (var i in tops._layers) {
                if (tops._layers[i].options.description.name == target) {
                    index = i;
                    var layers = tops._layers[i];
                    preMarker = layers;
                    preColor = layers.options.fillColor;
                    layers.setStyle({
                        fillColor: circleStyle.mouseOn,
                    });
                    d3.timeout(function() {
                        map.flyTo(layers._latlng, 15);
                    },200);
                    
                    break;
                }
            }
            
            if (index == -1) {
                for (var i in others._layers) {
                    if (others._layers[i].options.description.name == target) {
                        index = i;
                        var layers = others._layers[i];
                        preMarker = layers;
                        preColor = layers.options.fillColor;
                        layers.setStyle({
                            fillColor: circleStyle.mouseOn,
                        });
                        d3.timeout(function() {
                            map.flyTo(layers._latlng, 15);
                        },200);
                        break;
                    }
                }
                
            }
           
          
        }
        window.Lmaphighlight = Lmaphighlight;
    
    }
    
}

