
(function(){

    var pieChart = {
        height: 240,
        width:350,
        offsetLeft:55,
        left:20,
        startRadius:25,
        // interval:(pieChart.height/2 - pieChart.startRadius - pieChart.top)/5,
        weight:14, /*厚度*/
        space:5,   /*间隔*/
        /*总半径 = 20 +  (space + weight) * number   (height/2 - startRadius - top)/5*/
    };

    var formatter = d3.format(".2%");

    var svg1 = d3.select("#pieChart1")
        .append("svg")
        .attr("height",pieChart.height)
        .attr("width",pieChart.width);
    
    var svg2 = d3.select("#pieChart2")
        .append("svg")
        .attr("id","svgPieChart1")
        .attr("height",pieChart.height)
        .attr("width",pieChart.width);

 
    /* 填充所有圆弧 */
    var arcAll = d3.arc()
        .startAngle(0)
        .endAngle(1.5 * Math.PI)
        .innerRadius(function (d, i) {
            return pieChart.startRadius + i * (pieChart.space + pieChart.weight);
        })
        .outerRadius(function (d, i) {
            return pieChart.startRadius + i * (pieChart.space + pieChart.weight) + pieChart.weight;
        });
    /*圆弧生成*/
    var arc = d3.arc()
        .startAngle(0)
        .endAngle(function (d, i) {
            return 1.5 * Math.PI * d.percentage;
        })
        .innerRadius(function (d, i) {
            return pieChart.startRadius + i * (pieChart.space + pieChart.weight);
        })
        .outerRadius(function (d, i) {
            return pieChart.startRadius + i * (pieChart.space + pieChart.weight) + pieChart.weight;
        });
        
       


    var color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(0,50%,50%)", "hsl(50,50%,50%)"])
        .interpolate(d3.interpolateHsl);

    d3.json("./src/age.json").then(function(dataset){
        var data = dataset['all']

        /*读取到数据后开始绘图*/
        drawPie_callback(data, svg1, "重庆市上网人群年龄分布");
        drawPie_callback([0,0,0,0,0], svg2, "鼠标指向一个地区查看分布");
        
        drawRect_callback();
    })


    function drawPie_callback(dataset, svg, text){
        var sum = dataset.join('+');
        sum = eval(sum);
        if (sum == 0) sum = 1;
        var data = [];
        var ageSeg = ["< 18   岁", "18-25 岁", "26-34 岁", "35-42 岁", "≥ 43   岁"];
        dataset.forEach(function(d, i){
            data.push({
                percentage:d/sum,
                value:d,
                age:ageSeg[i],
            })
        });


        /* 标题 */
        svg.append("text")
            .attr("y",pieChart.height/2)
            .attr("x",pieChart.left)
            .attr("dy","-0.5em")
            .text(text)
            .style("stroke","#777")
            .style("stroke-width",0.5)
            .style("fill","#777");
        
        if (svg.node().getAttribute("id") == "svgPieChart1") {
            svg.append("text")
                .attr("id","pieHot")
                .attr("transform","translate("+ (pieChart.left) +","+ (pieChart.height - 90) +")")
                .text("热度:")
                .style("font-size",18)
                .style("stroke","#777")
                .style("stroke-width",0)
                .style("fill","#777");
    
            svg.append("text")
                .attr("id","pieRank")
                .attr("transform","translate("+ (pieChart.left) +","+ (pieChart.height - 60) +")")
                .text("排名:")
                .style("font-size",22)
                .style("stroke","#777")
                .style("stroke-width",0.5)
                .style("fill","#777");
        }
       
            

        var g = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform","translate("+(pieChart.width/2+pieChart.offsetLeft)+","+ pieChart.height/2+")")
            .attr("class","pieChartBar");
            


        g.append("path")
            .attr("class","arcall")
            .attr("d",arcAll)
            .style("fill",function(d, i){
                return color(i);
            })
            .style("fill-opacity",0.2);

        /* 绘制圆弧 */
        g.append("path")
            .attr("class","arcPercentage")
            .attr("d",arc)
            .style("fill",function (d, i) {
                return color(i);
            });

        /* 绘制正方形 */
        g.append("rect")
            .attr("y",function(d, i){
                return -(pieChart.startRadius+pieChart.weight + i * (pieChart.space + pieChart.weight));
            })
            .attr("x",-pieChart.width/2+pieChart.left-pieChart.offsetLeft)
            .attr("height", pieChart.weight)
            .attr("width", pieChart.width/2-pieChart.left+pieChart.offsetLeft)
            .style("fill",function (d, i) {
                return color(i);
            })
            .style("opacity",0.7);

        /* 添加文字 */
        g.append("text")
            .attr("xml:space","preserve")
            .attr("y",function(d, i){
                return -(pieChart.startRadius+pieChart.weight + i * (pieChart.space + pieChart.weight));
            })
            .attr("x",-pieChart.width/2+pieChart.left-pieChart.offsetLeft)
            .attr("dx","1em")
            .attr("dy","0.9em")
            .text(function(d){
                return d.age + "    "+formatter(d.percentage);
            })
            .style("fill",function (d, i) {
                return "white";
            })
            .style("font-size",12);


    }

    function updatePie(ID, name, rank, hot){
       
        d3.select("#title").text(name);
        d3.json("./src/age.json").then(function(datasets){
            var dataset = datasets[ID];
            var sum = dataset.join('+');
            sum = eval(sum);
            var data = [];
            var ageSeg = ["< 18   岁", "18-25 岁", "26-34 岁", "35-42 岁", "≥ 43   岁"];
            dataset.forEach(function(d, i){
                data.push({
                    percentage:d/sum,
                    value:d,
                    age:ageSeg[i],
                })
            });
            svg2.select("text")
                .text(name);
            
            svg2.select("#pieHot")
                .text("热度:"+hot);
            svg2.select("#pieRank")
                .text("排名:"+rank);

            var g = svg2.selectAll("g")
                .data(data);

            /* 更新数据 */
            g.select("path.arcPercentage")
                .attr("d",arc)
                .style("fill",function (d, i) {
                    return color(i);
                });

            g.select("rect")
                .attr("y",function(d, i){
                    return -(pieChart.startRadius+pieChart.weight + i * (pieChart.space + pieChart.weight));
                })
                .attr("x",-pieChart.width/2+pieChart.left-pieChart.offsetLeft)
                .attr("height", pieChart.weight)
                .attr("width", pieChart.width/2-pieChart.left+pieChart.offsetLeft)
                .style("fill",function (d, i) {
                    return color(i);
                })
                .style("opacity",0.7);


            g.select("text")
                .text(function(d){
                    return d.age + "    "+formatter(d.percentage);
                })
        })
    }
    window.updatePie = updatePie;
    /* ---------------------------------------  */
    
   
})();
