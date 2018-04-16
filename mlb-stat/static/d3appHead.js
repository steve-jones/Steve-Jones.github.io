var d3appHead = {

    data: {},
    dataForRadar: undefined,

    Flist: ['AVG', 'HRPA', 'BBPA', 'SOPA', 'SBPA'],
    Plist: ['ERA', 'FIP', 'SO9', 'H9', 'BB9'],

    curr_players: ['', ''], // currently selected players in the two windows

    canvas1: {},
    canvas2: {},
    canvas_radar: {},

    config: {
        w: 395,
        h: 150,
        bar_w: 120,
        bar_h: 16,
        xsp: 10,
        ysp: 4,

        barcolor: '#117a65',
        barcolor4: ['#7A2111', '#7A7511', '#247A11', '#117a65'],
        barbgcolor: '#111111',
    },

    run: function(data) {

        var c = d3appHead.config;

        d3appHead.data = data;

        // setting up bar charts
        d3appHead.canvas1 = d3.select('#statsbar1').append('svg')
            .attr('width', c.w)
            .attr('height', c.h)
            .append('g');
        d3appHead.canvas2 = d3.select('#statsbar2').append('svg')
            .attr('width', c.w)
            .attr('height', c.h)
            .append('g');

        // create the <g> elements cotaining each year's bars
        d3app.years.forEach( function(year) {
            var yi = year - 1970;

            d3appHead.canvas1.append('g')
                .attr('id', 'bar'+year)
                .attr('transform', 
                    'translate(' + (500 + yi*(c.bar_w+c.xsp)) + ',30)')
                    // by default all bars are hidden by being placed out of the svg
                .on('click', function(){
                    // console.log(bar clicked);
                    d3appHead.plotbars(d3appHead.curr_players[0], year, 1);
                    d3appHead.plotRadar(d3appHead.curr_players[0], year, 1);
                })
                .append('text')
                .attr('class', 'bartext_year')
                .text(year)
                .attr('transform', 'translate(45,-10)');

            d3appHead.canvas2.append('g')
                .attr('id', 'bar'+year)
                .attr('transform', 
                    'translate(' + (500 + yi*(c.bar_w+c.xsp)) + ',30)')
                    // by default all bars are hidden by being placed out of the svg
                .on('click', function(){
                    // console.log(bar clicked);
                    d3appHead.plotbars(d3appHead.curr_players[1], year, 2);
                    d3appHead.plotRadar(d3appHead.curr_players[1], year, 2);
                })
                .append('text')
                .attr('class', 'bartext_year')
                .text(year)
                .attr('transform', 'translate(45,-10)');
                
        });

        // setting up radar charts. Using 
        //  https://github.com/alangrafu/radar-chart-d3
        RadarChart.defaultConfig.color = function(){}; // will be styled by css
        RadarChart.defaultConfig.levels = 5;
        RadarChart.defaultConfig.radius = 0;
        RadarChart.defaultConfig.w = 130;
        RadarChart.defaultConfig.h = 130;
        RadarChart.defaultConfig.maxValue = 100;
        RadarChart.defaultConfig.minValue = 0;

        d3appHead.canvas_radar = d3.select('#radar_wrapper').append('svg')
            .attr('width', 150)
            .attr('height', 130)
            .style('fill', '#ffffff')
            .append('g')
            .attr('transform', 'translate(20,10)');


        var lb = document.getElementById('loaderbox');
        lb.parentNode.removeChild(lb);
    },

    plotbars: function(key_bbref, curryear, activeWindow) {

        if (!activeWindow || !key_bbref) { return; }
        var canvas = activeWindow === 1 ? d3appHead.canvas1 : d3appHead.canvas2;

        var c = d3appHead.config;

        var isSame = key_bbref === this.curr_players[activeWindow - 1];
        if (!isSame) this.curr_players[activeWindow - 1] = key_bbref;

        var pdata = d3appHead.data[key_bbref]; // use the player-nested data

        d3app.years.forEach(function(year) {
            // console.log(data[year][0]);
            
            var yi = year - curryear + 1; // the index with 0 at curryear

            // get the percentile data for the relevant stats
            var ydata_arr = [];
            if (pdata.hasOwnProperty(year)) {
                var ydata = pdata[year][0];
                var pos2 = ydata['Pos2']; // F/SP/RP
                var statlist = (pos2 === 'F') ? d3appHead.Flist : d3appHead.Plist;
                statlist.forEach(function(stat) {
                    if (ydata.hasOwnProperty(stat)) {
                        ydata_arr.push({
                            'stat': stat,
                            'value': ydata[stat+'_perc'],
                        });
                    }
                });
            } else {
                ydata_arr = [{},{},{},{},{}]
            }

            var g = canvas.select("#bar"+year);
            g.transition().duration(500)
                .attr('transform', 
                'translate(' + (5 + yi*(c.bar_w+c.xsp)) + ',30)');
            
            if (!isSame) {
                g.selectAll('rect').remove();
                g.selectAll('.bartext').remove();
                var up = g.selectAll('rect').data(ydata_arr);
                var et = up.enter();
                    
                    // background bars (this can be moved out of the loop)
                    et.append('rect')
                        .attr('width', c.bar_w)
                        .attr('height', c.bar_h)
                        .attr('y', function(d, i) {
                            return i * (c.bar_h + c.ysp);
                        })
                        .attr('x', 0)
                        .attr('fill', c.barbgcolor);
                    
                    // bluebars
                    et.append('rect')
                        .attr('class', 'bluebar')
                        .attr('width', function(d, i) {
                            if (d.value)
                                return d.value/100 * c.bar_w;
                            return 0;
                        })
                        .attr('height', c.bar_h)
                        .attr('y', function(d, i) {
                            return i * (c.bar_h + c.ysp);
                        })
                        .attr('x', 0)
                        .attr('fill', 
                            // c.barcolor);
                            function(d) {
                                return c.barcolor4[Math.floor(d.value/25)];
                            });

                    et.append('text')
                        .text(function(d) {
                            return d.value;
                        })
                        .attr('class', 'bartext')
                        .attr('y', function(d, i) {
                            return i * (c.bar_h + c.ysp);
                        })
                        .attr('transform', 'translate(5,13)');
            }
            g.selectAll('.bluebar')
                .transition().duration(500)
                .attr('opacity', function(d) {
                    return year == curryear ? 1 : 0.2;
                });
        })
    },

    plotRadar: function(key_bbref, curryear, activeWindow) {

        // Here we always update the data, but only show both on radar chart 
        // when the two players are of the same type

        // prepare data for radar chart
        this.dataForRadar = this.dataForRadar || 
                [{className:'player1', axes: [],}, {className: 'player2', axes: [],}];
        var indexToModify = activeWindow - 1;
        var dr = this.dataForRadar; // alias
        var playerData = []; // new player data

        // source data
        var pdata = d3appHead.data[key_bbref]; // use the player-nested data

        // get posistion from any year        
        var pos = Object.values(pdata)[0][0]['Position']; // F/P
        var statlist = (pos === 'F') ? d3appHead.Flist : d3appHead.Plist;

        statlist.forEach(function(stat, i) {
            var value;
            if (pdata.hasOwnProperty(curryear) && 
                    pdata[curryear][0].hasOwnProperty(stat)) {
                value = pdata[curryear][0][stat+'_perc'];
            } else {
                value = 0;
            }

            playerData.push({
                'axis': stat,
                'value': value,
                'pos': pos,
            });
        });
        dr[indexToModify].axes = playerData;
        // console.log(dr);


        // plotting
        var chart = RadarChart.chart();
        // var cfg = chart.config(); // retrieve default config

        // see if two players are of the same type, if not, plot the recently updated one
        if (!dr[1].axes[0] || dr[0].axes[0].pos === dr[1].axes[0].pos) {
            d3appHead.canvas_radar.datum(dr).call(chart);
        } else {
            console.log("Different player type");
            d3appHead.canvas_radar.datum([dr[indexToModify],]).call(chart);
        }

    },

    plot: function(key_bbref, curryear, activeWindow) {
        this.plotbars(key_bbref, curryear, activeWindow);
        this.plotRadar(key_bbref, curryear, activeWindow);
    },

}