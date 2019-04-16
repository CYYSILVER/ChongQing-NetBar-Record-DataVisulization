
d3.json("./src/dataProcessed.json").then(function(dataset){
    // console.debug(dataset);
    var dataSorted = [];
    for (var k in dataset){
        dataset[k].key = k;
        
        dataSorted.push(dataset[k]);
    }
    
    var dataUnsorted = [].concat(dataSorted);
    var data = dataUnsorted;
    dataSorted.sort(function(a, b){
        return b.value - a.value;
    });
    
  
    dataSorted.map(function(d, i){
        d.index = i;
        d.rank = i+1;
        return d;
    });
    
    var margin = {
        right:10,
        bottom:20,
        left:140,
        top:40,
    };
    var margin2 = {
        right:360,
        bottom:20,
        left:20,
        top:40,
    };
    
    var svgWidth = 480;
    var svgHeight = 1030;
    
    var svg = d3.select("#rankbar")
    .append("svg")
    .attr("width",svgWidth)
    .attr("height",svgHeight);
    
    
    
    
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var width = +svg.attr("width") - margin.left - margin.right;
    var width2 = +svg.attr("width") - margin2.left - margin2.right;
    
    
    
    
    
    
    
    
    var x = d3.scaleBand().range([0,height]).paddingInner(0.05).paddingOuter(0.1),
        x2 = d3.scaleBand().range([0, height]),
        y = d3.scaleLinear().range([0, width-60]),
        y2 = d3.scaleLinear().range([0, width2]);
    
    
    
    
    var xAxis = d3.axisLeft(x).tickValues([]),
        xAxis2 = d3.axisLeft(x2).tickValues([]),
        yAxis = d3.axisTop(y);
    
    
    
    x.domain(data.map(function(d, i){return i+1}));
    
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);
    x2.domain(x.domain());
    y2.domain(y.domain());
    
    
    
    
    /*刷子*/
    var brush = d3.brushY().extent([[0,0], [width2, height]]).on("brush", brushed);
    
    /*zoom*/
    var zoom = d3.zoom()
        .scaleExtent([1, 300 ])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);
    
    /*在这个矩形框内调用zoom*/
    svg.append("rect")
        .attr("class", "zooms")
        .attr("width", width+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(zoom);
    
    var focus = svg.append("g")
        .attr("class","focus")
        .attr("transform", "translate("+margin.left+","+margin.top+")");
    
    focus.append("g")
        .attr("class","xAxis")
        .call(xAxis);
    
    
    focus.append("g")
        .attr("class","yAxis")
        .call(yAxis)
        .selectAll("text")
        .attr("transform","rotate(30)");
       
    
    
    var context = svg.append("g")
        .attr("class","context")
        .attr("transform","translate("+margin2.left+","+margin2.top+")");
    
    var subBars = context.selectAll(".subBar").data(data);
    subBars.enter().append("rect")
        .classed("subBar", true)
        .attr("fill","grey")
        .attr("height",function(d){
            return x2.bandwidth();
        })
        .attr("width",function(d){
            return y2(d.value);
        })
        .attr("x",function(d, i){
            return 0;
        })
        .attr("y",function(d, i){
            return x2(i);
        });
    
    
    
    
   
    
    context.append("g")
        .attr("class", "xAxis")
        .call(xAxis2);
    
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());
    
    var switchBTN = d3.select("#rankbar")
        .append("button")
        .attr("class","switch BTN")
        // .attr("transform","translate("+ (margin.left+width-70) +","+margin.top+")")
        .style("right",-(margin.right-50)+"px")
        .style("top",-(height+margin.bottom-20)+"px")
        .text("排序")
        .on("click",sortChart);
    
    
    d3.select("#rankbarTooltip")
        .html("<p>移动到柱状图查看网吧信息</p></br>点击在右侧查看相关信息")
    
    

    function brushed(){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type == 'zooms') return;
        // var s = d3.event.selection;
        
        
        var s = d3.event.selection;

        var selected =  x2.domain()
            .filter(function(d){
                return (d3.event.selection[0] <= x2(d)) && (x2(d) <= d3.event.selection[1]);
            });
        var start;
        var end;
        
        if (d3.event.selection[0] != d3.event.selection[1]){
            start = selected[0]-1;
            end = selected[selected.length - 1];
            
        } else {
            start = 0;
            end = data.length;
        }
        
        var updatedData = data.slice(start, end);

        

        update(updatedData);
        enter(updatedData);
        exit(updatedData);
        updateScale(updatedData);
        svg.select(".zooms").call(zoom.transform, d3.zoomIdentity.scale(height / (s[1] - s[0])).translate(0, -s[0]));
    }
    
    
    var isSorted = false;
    
    
    function zoomed() {
        // console.debug(d3.event.transform);
        if (d3.event.sourceEvent && d3.event.sourceEvent.type == "brush") return; // ignore zoom-by-brush
        
        var t = d3.event.transform;
      
        context.select(".brush").call(brush.move,x2.range().map(function(d){
            return t.invertY(d);
        }))
    }
    
    function updateScale(data) {
        focus.select(".yAxis").call(yAxis).selectAll("text")
            .attr("transform","rotate(30)");
        if (isSorted){
            var scale = d3.scaleBand().range([0, height]).domain(data.map(function(d,i){
                return d.index+1;
            }));
            var xA = d3.axisLeft(scale).tickValues(data.filter(function(d,i){
                return i % Math.floor(data.length/7) == 0;
            }).map(function (d,i) {
                return d.index+1;
            }));
            focus.select(".xAxis")
                .call(xA);
        }
        else {
            focus.select(".xAxis")
             .call(xAxis);
        }
    }

    
    function update(data){
    
        var color = d3.scaleLinear().domain([0,data.length]).range(['hsl(120,40%,50%)', 'hsl(240,40%,50%)']).interpolate(d3.interpolateHsl);
        x.domain(data.map(function(d, i){
            return i;
        }));
        y.domain([0, d3.max(data,function(d){
            return d.value;
        })]);
        focus.selectAll(".bar")
            .data(data)
            .style("fill", function(d, i){
                return color(i);
            })
            .attr("height",function(d, i){
                return x.bandwidth();
            })
            .attr("width",function (d, i){
                return y(d.value);
            })
            .attr("x",function(d, i){
                return 0;
            })
            .attr("y",function(d, i){
                return x(i);
            })
            .style("cursor","pointer")
            .on("click",clicked)
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)
         
    
    }
    
    function exit(data) {
        
        var bars = focus.selectAll(".bar").data(data);
        bars.exit().remove();
    }
    
    function enter(data){
        var color = d3.scaleLinear().domain([0,data.length]).range(['hsl(120,40%,50%)', 'hsl(240,40%,50%)']).interpolate(d3.interpolateHsl);
        // console.debug(data);
        x.domain(data.map(function(d, i){
            return i;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.value;
        })]);
        
        
        var bars = focus.selectAll(".bar")
            .data(data);
        bars.enter().append("rect")
            .classed("bar", true)
            .style("fill",function(d,i){
                return color(i);
            })
            .attr("height",function(d, i){
                return x.bandwidth();
            })
            .attr("width",function (d, i){
                return y(d.value);
            })
            .attr("x",function(d, i){
                return 0;
            })
            .attr("y",function(d, i){
                return x(i);
            })
            .on("click",clicked);
        
    }
    
    function clicked(d, i){
        updatePie(d.key, d.name, d.rank, d.value);
        zxt.update(0,0,d.key);
        Lmaphighlight(d.key);
        // radar(0,0, d.key);
    }
    
    function mouseover(d, i){
//         console.debug(d);
        d3.select("#rankbarTooltip")
            .html(function(){
                
                return "<h3>"+d.name +"</h3><b>排名:" + d.rank + "</b></br>"
                + "经度:" + d.lat + "</br>"
                + "纬度:" + d.lng + "</br>"
                + "热度:" + d.value + "</br>"
            })
        
      
        
    }
    
    function mouseout(d, i){
    
    
        d3.select("#rankbarTooltip")
         .html("<p>移动到柱状图查看网吧信息</p></br>点击在右侧查看相关信息")
    }
    
    function sortChart(){
        if (!isSorted){
            data = dataSorted;
            d3.select(this).text("恢复")
        }
        else {
            data = dataUnsorted;
            d3.select(this).text("排序")
        }
     
        update(data);
        enter(data);
        exit(data);
        isSorted = !isSorted;
        context.select(".brush").call(brush.move,x2.range());
        context.selectAll(".subBar")
            .data(data)
            .attr("fill","grey")
            .attr("height",function(d){
                return x2.bandwidth();;
                
            })
            .attr("width",function(d){
                return y2(d.value);
            })
            .attr("x",function(d, i){
                return 0;
            })
            .attr("y",function(d, i){
                return x2(i);
            })
    }
});

//
// d3.json("./src/dataProcessed.json").then(function(dataset){
//     dataSorted = [];
//     for (var k in dataset){
//         dataSorted.push(dataset[k]);
//     }
//
//     var dataUnsorted = [].concat(dataSorted);
//     var data =dataUnsorted;
//     dataSorted.sort(function(a, b){
//         return b.value - a.value;
//     });
//     dataSorted.map(function(d, i){
//         d.index = i;
//         return d;
//     });
//     var margin = {
//         top:10,
//         right:20,
//         bottom:125,
//         left:40,
//     };
//     var margin2 = {
//         top:380,
//         right:20,
//         bottom:20,
//         left:40,
//     };
//
//     svgWidth = 1200;
//     svgHeight = 500;
//
//     var svg = d3.select("#rankbar")
//     .append("svg")
//     .attr("width",svgWidth)
//     .attr("height",svgHeight)
//
//
//
//
//     width = +svg.attr("width") - margin.left - margin.right;
//     height = +svg.attr("height") - margin.top - margin.bottom;
//     height2 = +svg.attr("height") - margin2.top - margin2.bottom;
//
//
//
//
//
//
//
//
//     var x = d3.scaleBand().range([0,width]).paddingInner(0.05).paddingOuter(0.1),
//         x2 = d3.scaleBand().range([0, width]),
//         y = d3.scaleLinear().range([height, 0]),
//         y2 = d3.scaleLinear().range([height2, 0]);
//
//
//
//
//     var xAxis = d3.axisBottom(x).tickValues([]),
//         xAxis2 = d3.axisBottom(x2).tickValues([]),
//         yAxis = d3.axisLeft(y);
//
//
//
//     x.domain(data.map(function(d, i){return i+1}));
//
//     y.domain([0, d3.max(data, function (d) {
//         return d.value;
//     })]);
//     x2.domain(x.domain());
//     y2.domain(y.domain());
//
//
//
//
//     /*刷子*/
//     var brush = d3.brushX().extent([[0,0], [width, height2]]).on("brush", brushed);
//
//
//     var focus = svg.append("g")
//     .attr("class","focus")
//     .attr("transform", "translate("+margin.left+","+margin.top+")");
//
//     focus.append("g")
//     .attr("class","xAxis")
//     .attr("transform","translate(0,"+(svgHeight-margin.top-margin.bottom)+")")
//     .call(xAxis);
//
//
//     focus.append("g")
//     .attr("class","yAxis")
//     .call(yAxis);
//
//
//     var context = svg.append("g")
//     .attr("class","context")
//     .attr("transform","translate("+margin2.left+","+margin2.top+")");
//
//     var subBars = context.selectAll(".subBar").data(data);
//     subBars.enter().append("rect")
//     .classed("subBar", true)
//     .attr("fill","grey")
//     .attr("height",function(d){
//         return height2 - y2(d.value);
//     })
//     .attr("width",function(d){
//         return x2.bandwidth();
//     })
//     .attr("x",function(d, i){
//         return x2(i);
//     })
//     .attr("y",function(d){
//         return y2(d.value);
//     });
//
//
//     var zoom = d3.zoom()
//     .scaleExtent([1, 100])
//     .translateExtent([[0, 0], [width, height]])
//     .extent([[0, 0], [width, height]])
//     .on("zoom", zoomed);
//
//     /*在这个矩形框内调用zoom*/
//     svg.append("rect")
//     .attr("class", "zoom")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//     .call(zoom);
//
//     context.append("g")
//     .attr("class", "xAxis")
//     .attr("transform", "translate(0,"+ height2 + ")")
//     .call(xAxis2);
//
//     context.append("g")
//     .attr("class", "brush")
//     .call(brush)
//     .call(brush.move, x.range());
//
//     var switchBTN = d3.select("#rankbar")
//     .append("button")
//     .attr("class","switch BTN")
//     // .attr("transform","translate("+ (margin.left+width-70) +","+margin.top+")")
//     .style("right",-(margin.right-100)+"px")
//     .style("top",-(height+margin.bottom-20)+"px")
//     .text("排序")
//     .on("click",sortChart);
//
//
//
//
//     function brushed(){
//         // if (d3.event.sourceEvent && d3.event.sourceEvent.type == 'zoom') return;
//         // var s = d3.event.selection;
//         var s = d3.event.selection;
//         var selected =  x2.domain()
//         .filter(function(d){
//             return (d3.event.selection[0] <= x2(d)) && (x2(d) <= d3.event.selection[1]);
//         });
//         var start;
//         var end;
//
//         if (d3.event.selection[0] != d3.event.selection[1]){
//             start = selected[0];
//             end = selected[selected.length - 1]+1;
//         } else {
//             start = 0;
//             end = data.length;
//         }
//         var updatedData = data.slice(start, end);
//
//         //console.debug(d3.event.selection);
//
//         update(updatedData);
//         enter(updatedData);
//         exit(updatedData);
//         updateScale(updatedData);
//         svg.select(".zoom").call(zoom.transform, d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0));
//     }
//
//
//     var isSorted = false;
//
//
//     function zoomed() {
//         // console.debug(d3.event.transform);
//         if (d3.event.sourceEvent && d3.event.sourceEvent.type == "brush") return; // ignore zoom-by-brush
//
//         var t = d3.event.transform;
//
//         context.select(".brush").call(brush.move,x2.range().map(function(d){
//
//             return t.invertX(d);
//         }))
//     }
//
//     function updateScale(data) {
//         focus.select(".yAxis").call(yAxis);
//         if (isSorted){
//             var scale = d3.scaleBand().range([0, width]).domain(data.map(function(d,i){
//                 return d.index;
//             }))
//             var xA = d3.axisBottom(scale).tickValues(data.filter(function(d,i){
//                 return i % Math.floor(data.length/7) == 0;
//             }).map(function (d,i) {
//                 return d.index;
//             }));
//             focus.select(".xAxis")
//             .call(xA);
//         }
//         else {
//             focus.select(".xAxis")
//             .call(xAxis);
//         }
//     }
//
//     function update(data){
//         var color = d3.scaleLinear().domain([0,data.length]).range(['orange', 'steelblue']).interpolate(d3.interpolateHsl);
//
//         x.domain(data.map(function(d, i){
//             return i;
//         }));
//         y.domain([0, d3.max(data,function(d){
//             return d.value;
//         })]);
//         focus.selectAll(".bar")
//         .data(data)
//         .style("fill", function(d, i){
//             return color(i);
//         })
//         .attr("height",function(d, i){
//             return height - y(d.value);
//         })
//         .attr("width",function (d, i){
//             return x.bandwidth();
//         })
//         .attr("x",function(d, i){
//             return x(i);
//         })
//         .attr("y",function(d){
//             return y(d.value);
//         });
//     }
//
//     function exit(data) {
//
//         var bars = focus.selectAll(".bar").data(data);
//         bars.exit().remove();
//     }
//
//     function enter(data){
//         x.domain(data.map(function(d, i){
//             return i;
//         }));
//         y.domain([0, d3.max(data, function (d) {
//             return d.value;
//         })]);
//         var color = d3.scaleLinear().domain([0,data.length]).range(['orange', 'steelblue']).interpolate(d3.interpolateHsl);
//
//         var bars = focus.selectAll(".bar")
//         .data(data);
//         bars.enter().append("rect")
//         .classed("bar", true)
//         .style("fill",function(d,i){
//             return color(i);
//         })
//         .attr("height",function(d, i){
//             return height - y(d.value);
//         })
//         .attr("width",function (d, i){
//             return x.bandwidth();
//         })
//         .attr("x",function(d, i){
//             return x(i);
//         })
//         .attr("y",function(d){
//             return y(d.value);
//         });
//
//     }
//
//
//     function sortChart(){
//         if (!isSorted){
//             data = dataSorted;
//             d3.select(this).text("恢复")
//         }
//         else {
//             data = dataUnsorted;
//             d3.select(this).text("排序")
//         }
//         update(data);
//         enter(data);
//         exit(data);
//         isSorted = !isSorted;
//         context.select(".brush").call(brush.move,x2.range());
//         context.selectAll(".subBar")
//         .data(data)
//         .attr("fill","grey")
//         .attr("height",function(d){
//
//             return height2 - y2(d.value);
//
//         })
//         .attr("width",function(d){
//             return x2.bandwidth();
//         })
//         .attr("x",function(d, i){
//             return x2(i);
//         })
//         .attr("y",function(d){
//             return y2(d.value);
//         })
//     }
// });







