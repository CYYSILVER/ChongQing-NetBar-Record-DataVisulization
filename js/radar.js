
    radar(0,0,"50011310000099");

    function radar(mx,my,datajson,dx=485,dy=415) {
        var offset = 5;
        d3.selectAll('.radarSvg').remove();
        var SVG=d3.select('#radar')
            .append('svg')
            .attr('class','radarSvg')
            .attr('width',dx)
            .attr('height',dy);
        var flag=0;
        var svg_rader = SVG.append('svg')
        // .attr("id", "svg_py")
            .attr('width', dx)
            .attr('height', dy)
            .attr('x', mx)
            .attr('y', my)


        var colors =
            {
                line_color: '#000',
                data_line:'#43ee95',
                dataLine_change:'#ff4f4c',
                man_line:'#04ddca',
                woman_line:'#064bdd',
                mark:"#0508ee",
                radar_pathcssinner:'#ebeee650',
                radar_pathcssout:'#c6deee50'
            }
        var xy={
            xbdetail:0+50,
            ybdetail:0,
            xbwidth:20,
        }
        var weights = {
            line_weight: 2,
            inner: 30,
            d:(dy/2)-(dy/10)*2,
            q:dy/10,
            dataLine_change:3
        }
        var margin = {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
        var radar_line=[];
        for(var i=0;i<5;i++)
        {
            var p={};
            p.a=90-i*72;
            p.x0=weights.q*Math.cos(p.a*0.017453293);
            p.x0+=dx/2;
            p.y0=weights.q*Math.sin(p.a*0.017453293);
            p.y0+=dy/2;
            p.y0=dy-p.y0;

            p.x1=(weights.q+weights.d)*Math.cos(p.a*0.017453293);
            p.x1+=dx/2;
            p.y1=(weights.q+weights.d)*Math.sin(p.a*0.017453293);
            p.y1+=dy/2;
            p.y1=dy-p.y1;

            radar_line.push(p);
        }




        //画雷达图
        var title=["年龄","周末","时长","间隔","次数"];
        for (var i=0;i<5;i++)
        {
            var g_radar=svg_rader.append('g');
            g_radar.append('path')
                .attr('d','M'+radar_line[i].x0+','+radar_line[i].y0+'L'+radar_line[i].x1+','+radar_line[i].y1)
                .attr('stroke',colors.line_color)
                .attr('stroke-width',3)
            g_radar.append('text')
                .attr('x',radar_line[i].x1)
                .attr('y',radar_line[i].y1-30*Math.sin(radar_line[i].a*0.017453293)+5)
                .text(title[i])
        }

        svg_rader.append('rect')
            .attr('x',xy.xbdetail)
            .attr('y',xy.ybdetail+offset)
            .attr('width',xy.xbwidth)
            .attr('height',xy.xbwidth)
            .attr('fill',colors.man_line);
        svg_rader.append('text')
            .attr('x',xy.xbdetail+xy.xbwidth)
            .attr('y',xy.ybdetail+xy.xbwidth/1.5+offset)
            .text('男');
        svg_rader.append('rect')
            .attr('x',xy.xbdetail)
            .attr('y',xy.ybdetail+xy.xbwidth*2+offset)
            .attr('width',xy.xbwidth)
            .attr('height',xy.xbwidth)
            .attr('fill',colors.woman_line);
        svg_rader.append('text')
            .attr('x',xy.xbdetail+xy.xbwidth)
            .attr('y',xy.ybdetail+xy.xbwidth*2+xy.xbwidth/1.5+offset)
            .text('女');

        var inputchecknox=document.querySelectorAll("input");
        inputchecknox[0].style.left=mx/2+'px';
        inputchecknox[0].style.top=my/2+'px';
        inputchecknox[1].style.left=mx/2+'px';
        inputchecknox[1].style.top=my/2+xy.xbwidth+'px';

        d3.select(".manCheckbox").attr("checked",true)
            .on('click',function () {
                var man=d3.select(this)
                if(!this.checked)
                {
                    d3.selectAll(".man_path").attr('opacity',0)
                }
                else
                    d3.selectAll(".man_path").attr('opacity',1)
            })
        d3.select(".womanCheckbox").attr("checked",true)
            .on('click',function () {
                var woman=d3.select(this)
                if(!this.checked)
                {
                    d3.selectAll(".woman_path").attr('opacity',0)
                }
                else
                    d3.selectAll(".woman_path").attr('opacity',1)
            })


        //坐标转换

        var line = d3.line()
            .x(function (d,i) {
                return getx(d.x,d.y);
            })
            .y(function (d,i) {
                return gety(d.x,d.y);
            })
        function getx(i,d)
        {
            var x;
            x=(weights.q+(d*weights.d))*Math.cos(radar_line[i].a*0.017453293);
            x+=dx/2;
            return x;
        }
        function gety(i,d)
        {
            var y;
            y=(weights.q+(d*weights.d))*Math.sin(radar_line[i].a*0.017453293);
            y+=dy/2;
            y=dy-y;
            return y;
        }

        style_path=[{x:0,y:0.5},{x:1,y:0.5},{x:2,y:0.5},{x:3,y:0.5},{x:4,y:0.5},{x:0,y:0.5},]
        svg_rader.append('path')
            .attr('d',line(style_path))
            .attr('stroke',"#222222")
            .attr('stroke-width',0)
            .attr('fill',colors.radar_pathcssinner)
        style_path=[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1},{x:0,y:1},]
        svg_rader.append('path')
            .attr('d',line(style_path))
            .attr('stroke',"#222222")
            .attr('stroke-width',0)
            .attr('fill',colors.radar_pathcssinner)


        d3.json("./src/radarData.json").then((json)=>{
            dataone=json[datajson];
            work(dataone)
        })

        function work(data) {


            var line_alldata=[];
            //描直线
            for (var i=0;i<data.length;i++)
            {
                var line_data=[];
                for (var j=0;j<6;j++)
                {
                    var p={};
                    p.x=j%5;
                    p.y=(data[i][j%5]-d3.min(data, d => d[j%5]))/( d3.max(data, d => d[j%5])-d3.min(data, d => d[j%5]));

                    line_data.push(p)
                }
                line_alldata.push(line_data);
                svg_rader.append('path')
                    .attr('d',line(line_data))
                    .attr('key',i)
                    .attr('stroke',function () {
                        if(data[i][5]=='男')
                        {
                            d3.select(this).attr('class','man_path')
                            return colors.man_line;
                        }
                        else
                        {
                            d3.select(this).attr('class','woman_path')
                            return colors.woman_line
                        }
                    })
                    .attr('stroke-width',1)
                    .attr('fill','none')
                    .on('mouseover',function () {

                        var g_radar=svg_rader.append('g')
                            .attr('class','g_detail')
                        g_radar.append('path')
                            .attr('class','line_radar')
                            .attr('d',this.getAttribute('d'))
                            .attr('stroke',colors.dataLine_change)
                            .attr('stroke-width',weights.dataLine_change)
                            .attr('fill','none')
                            .style('pointer-events','none');

                        for (var j=0;j<5;j++)
                        {
                            g_radar.append('text')
                                .attr('class','radar_detail')
                                .attr('x',getx(j,line_alldata[this.getAttribute("key")][j].y))
                                .attr('y',gety(j,line_alldata[this.getAttribute("key")][j].y))
                                .text(data[this.getAttribute("key")][j].toFixed(1))
                                .style('pointer-events','none');
                        }
                    })
                    .on('mouseleave',function () {
                        d3.selectAll(".g_detail")
                            .remove();
                    })

            }
        }

    }