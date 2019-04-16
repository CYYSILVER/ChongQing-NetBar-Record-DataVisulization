
function drawRect_callback(){
    var offset = {
        left:20,
        top:190,
    };
    
    var color = {
        local:"#ffa900",
        foreign:"#8893ff",
    }
    var format = d3.format(".0%");
    d3.json("./src/age2.json").then(function (dataset) {
        
        var datum=dataset['all'];
        var sum_number=0;
        var local_people_number=0;
        datum.forEach(function (d) {
            sum_number=sum_number+d[0]+d[1];
            local_people_number=local_people_number+d[0];
        })
        
  
        var peo_value=(local_people_number/sum_number)*100;
        var other_peo_value=((sum_number-local_people_number)/sum_number)*100;
       // console.debug(peo_value);
       // console.debug(other_peo_value);
        var Rect_Data=[
            {
                value:peo_value,
                text:peo_value+"%",
            },{
                value:other_peo_value,
                text:other_peo_value+"%",
            }
        ];
        drawRect("#pieChart1",Rect_Data,170,50)
    })

//drawRect
    
    function drawRect(id_selector,rect_data,width,height){
        
        var g_rect=d3.select(id_selector).select("svg")
        .append("g")
        .attr("transform","translate("+offset.left+","+offset.top+")");
        
        var rect1=g_rect.append("rect")
        .attr("width",rect_data[0].value)
        .attr("height",20)
        .attr("x",0)
        .attr("y",0)
        .style("fill",color.local);
        
        var rect2=g_rect.append("rect")
        .attr("width",rect_data[1].value)
        .attr("height",20)
        .attr("x",rect_data[0].value)
        .attr("y",0)
        .style("fill",color.foreign);
//text
        var g_text=g_rect.append("g")
        .attr("id","rect_text")
        .attr("transform","translate(0,"+(height-15)+")")
        
        var text1=g_text.append("text")
        .text("本地人口"+ format(rect_data[0].value/100))
        .style("font-size","13px")
        .attr("x",-15)
        .attr("y",0);
        
        var text1=g_text.append("text")
        .text("外来人口"+ format(rect_data[1].value/100))
        .style("font-size","13px")
        .attr("x",80)
        .attr("y",0);
        
    }
    var g_rect=d3.select("#pieChart2").select("svg")
    .append("g")
    .attr("transform","translate("+offset.left+","+offset.top+")");
    //
    var rect1=g_rect.append("rect")
    .attr("width",0)
    .attr("height",0)
    .attr("x",0)
    .attr("y",0)
    .style("fill",color.local)
    
    var rect2=g_rect.append("rect")
    .attr("width",0)
    .attr("height",0)
    .attr("x",0)
    .attr("y",0)
    .style("fill",color.foreign)
    
    //text
    var g_text=g_rect.append("g")
    .attr("id","rect_text")
    .attr("transform","translate(0,40)")
    
    var text1=g_text.append("text")
    .text("本地人口")
    .style("font-size","13px")
    .attr("x",-15)
    .attr("y",0);
    
    var text2=g_text.append("text")
    .text("外来人口")
    .style("font-size","13px")
    .attr("x",80)
    .attr("y",0);
    
    function update_Rect(ID) {
        
        d3.json("./src/age2.json").then(function (dataset) {
            var data=dataset[ID];
            
            var sum_number=0;
            var local_people_number=0;
            data.forEach(function (d) {
                sum_number=sum_number+d[0]+d[1];
                local_people_number=local_people_number+d[0];
            });
            
            var peo_value=(local_people_number/sum_number)*100;
            var other_peo_value=(sum_number-local_people_number)/sum_number*100;
    
            var Rect_Data=[
                {
                    value:peo_value,
                    text:peo_value+"%",
          
                },{
                    value:other_peo_value,
                    text:other_peo_value+"%",
            
                }
            ];
            
            update(Rect_Data);
        })
    }
    update([{
        value:100,
    },{
        value:0,
    }]);
    function update(rect_data) {
        rect1
        .attr("width",rect_data[0].value)
        .attr("height",20)
        .attr("x",0)
        .attr("y",0)
        .style("fill",color.local)
    
        text1.text("本地人口"+format(rect_data[0].value/100));
        text2.text("外来人口"+format(rect_data[1].value/100));
        
        rect2
        .attr("width",rect_data[1].value)
        .attr("height",20)
        .attr("x",rect_data[0].value)
        .attr("y",0)
        .style("fill",color.foreign)
    }
    
    
    window.update_Rect=update_Rect;
//set data

};

