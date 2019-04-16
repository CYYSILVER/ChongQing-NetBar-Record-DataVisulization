

zxt(0,0,"50011310000099");
function zxt(mx,my,jsondata,dx=1295,dy=400)
{
    var durtaion = 100;
    var colors={
        colorone:"#467aff",
        colorall:"#f05e1a"
    }
    
    var width=window.screen.width;
    var height=window.screen.height;
    var SVG=d3.select('#lineChart')
        .append('svg')
        .attr('width',dx)
        .attr('height',dy);
    
    var timeScale=20;
    var svg=SVG.append('svg')
        .attr('width',dx)
        .attr('height',dy)
        .attr('x',mx)
        .attr('y',my);
    svg.append('rect')
        .attr('x',100)
        .attr('y',15)
        .attr('width',20)
        .attr('height',20)
        .attr('fill',colors.colorone)
    svg.append('text')
        .attr('x',130)
        .attr('y',30)
        .text("当前网吧24小时平均在线人数")
    svg.append('rect')
        .attr('x',100)
        .attr('y',40)
        .attr('width',20)
        .attr('height',20)
        .attr('fill',colors.colorall)
    svg.append('text')
        .attr('x',130)
        .attr('y',55)
        .text("重庆市所有网吧24小时在线热度")
    
    var dataone = [],dataall = [];
    
    d3.json("./src/wbdata20.json").then((d)=>{
        dataall = d['all'];
        dataone = d[jsondata];
        if(d[jsondata])
            main(d[jsondata],"#00CDCD");
        else alert("数据不存在！");
        
    })
    function getLocalTime(nS) { //时间戳转日期  ！！精确度毫秒
        var date=new Date(nS);
        return date.getHours()+":"+date.getMinutes();
    }
    
    function main(datum,color)
    {
        var margin = ({top: 20, right: 80, bottom: 50, left: 50})
        var line = d3.line()
            .defined(d => !isNaN(d.value))
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveBasis)
        var xAxis = g => g
            .attr("transform", `translate(0,${dy - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(24).tickSizeOuter(0))
            .selectAll("text")
            .attr("transform", "rotate(-70)")
            .style("text-anchor", "end");
        
        //ticks刻度数
        var y = d3.scaleLinear()
            .domain([0, d3.max(datum, d => d.value)]).nice()
            .range([dy - margin.bottom,margin.top])
        var x = d3.scaleTime()
            .domain(d3.extent(datum, d => d.date))
            .range([margin.left, dx - margin.right])
    
        var yall = d3.scaleLinear()
            .domain([0, d3.max(dataall, d => d.value)]).nice()
            .range([dy - margin.bottom,margin.top]);
    
        var lineall = d3.line()
            .defined(d => !isNaN(d.value))
            .x(d => x(d.date))
            .y(d => yall(d.value))
            .curve(d3.curveBasis)
    
        var yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .attr('color',colors.colorone)
    
        var yAxisAll = g => g
            .attr("transform", `translate(${dx-margin.right},0)`)
            .call(d3.axisRight(yall))
            .attr('color',colors.colorall)
        // .call(g => g.select(".domain").remove())
        // .call(g => g.select(".tdomain ick:last-of-type text").clone()
        // .attr("x", 3)
        // .attr("text-anchor", "start")
        // .attr("font-weight", "bold")
        // .text(data.y));
        
        
        SVG.on("mousemove",function (d,i) {
            d3.selectAll('.circledetail')
            .remove()
            d3.selectAll('.linedetail')
            .remove()
            d3.selectAll('.textdetali')
            .remove()
            d3.selectAll('.rectdetail')
            .remove()
            var mouse = d3.mouse(this);
            if(mouse[0]<mx+margin.left || mouse[0]>mx+dx-margin.right-1 || mouse[1]<my+margin.top || mouse[1]>my+dy-margin.bottom)return;
            var k=((mouse[0]-margin.left-mx)/(dx - margin.right-margin.left))*24;
            var hour=parseInt(k);
            var min=parseInt((k-hour)*60)
            
            var datax=hour*(60/timeScale)+parseInt(min/timeScale);
            svg.append('circle')
                .attr('class','circledetail')
                .attr('cx',x(datum[datax].date))
                .attr('cy',y(datum[datax].value))
                .attr('r',5)
                .attr('fill',colors.colorone);
            var detailx=x(datum[datax].date)
                ,detaily=y(datum[datax].value);
            if(hour>12)detailx-=110;
            if(detaily<(margin.top+dy-margin.bottom)/2)detaily+=20;
            else detaily-=20;
            svg.append('rect')
                .attr('class','rectdetail')
                .attr('x',detailx+5)
                .attr('y',detaily-20)
                .attr('width',100)
                .attr('height',45)
                .attr('fill','#000')
                .style("opacity",0.3);
            svg.append('text')
                .attr('class','textdetali')
                .attr('x',detailx+15)
                .attr('y',detaily)
                .attr('fill',"#000")
                .text(" 时间: "+getLocalTime(datum[datax].date))
            svg.append('text')
                .attr('class','textdetali')
                .attr('x',detailx+15)
                .attr('y',detaily+20)
                .attr('fill',"#000")
                .text(" 人数: "+datum[datax].value)
            svg.append('path')
                .attr('class','linedetail')
                .attr('d','M'+margin.left+','+y(dataone[datax].value)+'L'+x(dataone[datax].date)+','+y(dataone[datax].value))
                .attr('stroke','#999')
                .attr('stroke-width',1)
            svg.append('path')
                .attr('class','linedetail')
                .attr('d','M'+x(dataone[datax].date)+','+y(dataone[datax].value)+'L'+x(dataone[datax].date)+','+(dy - margin.bottom))
                .attr('stroke','#999')
                .attr('stroke-width',1)
    
            svg.append('circle')
                .attr('class','circledetail')
                .attr('cx',x(dataall[datax].date))
                .attr('cy',yall(dataall[datax].value))
                .attr('r',5)
                .attr('fill',colors.colorall);
            
            svg.append('path')
                .attr('class','linedetail')
                .attr('d','M'+x(dataall[datax].date)+','+yall(dataall[datax].value)+'L'+(dx-margin.right)+','+yall(dataall[datax].value))
                .attr('stroke','#999')
                .attr('stroke-width',1)
            svg.append('path')
                .attr('class','linedetail')
                .attr('d','M'+x(dataall[datax].date)+','+yall(dataall[datax].value)+'L'+x(dataall[datax].date)+','+(dy - margin.bottom))
                .attr('stroke','#999')
                .attr('stroke-width',1)
        });
        
        svg.append("g").attr("class","xAxis")
         .call(xAxis);
        
        svg.append("g").attr("class","yAxis")
            .call(yAxis);
        svg.append("g")
            .call(yAxisAll);
    
        svg.append("path")
            .data(dataall)
            .attr("fill", "none")
            .attr("stroke", colors.colorall)
        
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineall(dataall))
    
    
        svg.append("path").attr("class","lineChartPath")
            .data(datum)
            .attr("fill", "none")
            .attr("stroke", colors.colorone)
   
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line(datum))
    
        zxt.update = function (mx,my,jsondata){
            var colors={
                colorone:"#467aff",
                colorall:"#f05e1a"
            }
            var timeScale=20;
            var SVG=d3.select("#lineChart").select("svg");
        
            svg = SVG.select("svg");
        
            d3.json("./src/wbdata20.json").then((d)=>{
                if(d[jsondata])
                    main(d[jsondata],"#00CDCD");
                else alert("数据不存在！");
            })
            function getLocalTime(nS) { //时间戳转日期  ！！精确度毫秒
                var date=new Date(nS);
                return date.getHours()+":"+date.getMinutes();
            }
        
            function main(data,color)
            {
                dataone = data;
                var margin = ({top: 20, right: 80, bottom: 50, left: 50})
                var line = d3.line()
                .defined(d => !isNaN(d.value))
                .x(d => x(d.date))
                .y(d => y(d.value))
                .curve(d3.curveBasis)
                var xAxis = g => g
                .attr("transform", `translate(0,${dy - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(24).tickSizeOuter(0))
                .selectAll("text")
                .attr("transform", "rotate(-70)")
                .style("text-anchor", "end");
    
                //ticks刻度数
                var y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)]).nice()
                .range([dy - margin.bottom,margin.top])
                var x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([margin.left, dx - margin.right])
    
                var yall = d3.scaleLinear()
                .domain([0, d3.max(dataall, d => d.value)]).nice()
                .range([dy - margin.bottom,margin.top]);
    
                var lineall = d3.line()
                .defined(d => !isNaN(d.value))
                .x(d => x(d.date))
                .y(d => yall(d.value))
                .curve(d3.curveBasis)
    
                var yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .attr('color',colors.colorone)
    
                var yAxisAll = g => g
                .attr("transform", `translate(${dx-margin.right},0)`)
                .call(d3.axisRight(yall))
                .attr('color',colors.colorall)
            
            
                SVG.on("mousemove",function (d,i) {
                    d3.selectAll('.circledetail')
                    .remove()
                    d3.selectAll('.linedetail')
                    .remove()
                    d3.selectAll('.textdetali')
                    .remove()
                    d3.selectAll('.rectdetail')
                    .remove()
                    var mouse = d3.mouse(this);
                    if(mouse[0]<mx+margin.left || mouse[0]>mx+dx-margin.right-1 || mouse[1]<my+margin.top || mouse[1]>my+dy-margin.bottom)return;
                    var k=((mouse[0]-margin.left-mx)/(dx - margin.right-margin.left))*24;
                    var hour=parseInt(k);
                    var min=parseInt((k-hour)*60)
                
                    var datax=hour*(60/timeScale)+parseInt(min/timeScale);
                    svg.append('circle')
                    .attr('class','circledetail')
                    .attr('cx',x(data[datax].date))
                    .attr('cy',y(data[datax].value))
                    .attr('r',5)
                    .attr('fill',colors.colorone);
                    var detailx=x(data[datax].date)
                        ,detaily=y(data[datax].value);
                    if(hour>12)detailx-=110;
                    if(detaily<(margin.top+dy-margin.bottom)/2)detaily+=20;
                    else detaily-=20;
                    svg.append('rect')
                    .attr('class','rectdetail')
                    .attr('x',detailx+5)
                    .attr('y',detaily-20)
                    .attr('width',100)
                    .attr('height',45)
                    .attr('fill','#000')
                    .style("opacity",0.3);
                    svg.append('text')
                    .attr('class','textdetali')
                    .attr('x',detailx+15)
                    .attr('y',detaily)
                    .attr('fill',"#000")
                    .text(" 时间: "+getLocalTime(data[datax].date))
                    svg.append('text')
                    .attr('class','textdetali')
                    .attr('x',detailx+15)
                    .attr('y',detaily+20)
                    .attr('fill',"#000")
                    .text(" 人数: "+data[datax].value)
                    svg.append('path')
                    .attr('class','linedetail')
                    .attr('d','M'+margin.left+','+y(dataone[datax].value)+'L'+x(dataone[datax].date)+','+y(dataone[datax].value))
                    .attr('stroke','#999')
                    .attr('stroke-width',1)
                    svg.append('path')
                    .attr('class','linedetail')
                    .attr('d','M'+x(dataone[datax].date)+','+y(dataone[datax].value)+'L'+x(dataone[datax].date)+','+(dy - margin.bottom))
                    .attr('stroke','#999')
                    .attr('stroke-width',1)
                
                    svg.append('circle')
                    .attr('class','circledetail')
                    .attr('cx',x(dataall[datax].date))
                    .attr('cy',yall(dataall[datax].value))
                    .attr('r',5)
                    .attr('fill',colors.colorall);
                
                    svg.append('path')
                    .attr('class','linedetail')
                    .attr('d','M'+x(dataall[datax].date)+','+yall(dataall[datax].value)+'L'+(dx-margin.right)+','+yall(dataall[datax].value))
                    .attr('stroke','#999')
                    .attr('stroke-width',1)
                    svg.append('path')
                    .attr('class','linedetail')
                    .attr('d','M'+x(dataall[datax].date)+','+yall(dataall[datax].value)+'L'+x(dataall[datax].date)+','+(dy - margin.bottom))
                    .attr('stroke','#999')
                    .attr('stroke-width',1)
                
                });
            
                svg.select(".xAxis")
                .call(xAxis);
            
                svg.select(".yAxis")
                .transition()
                .duration(durtaion)
                .call(yAxis);
            
            
                svg.select(".lineChartPath")
                .data(data)
                .transition()
                .duration(durtaion)
                .attr("fill", "none")
                .attr("stroke", colors.colorone)
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line(data))
            
            
            
            }
        }
    }
}

