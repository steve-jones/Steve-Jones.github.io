var d3app = {

  data: {},
  teamdata: {}, // performance data, nested by team
  teamdata_year: {}, // this one is further nested by year - note that year is string
  teamstatsrange: {}, // total stats ranges (of eligible players), for scaling the scatter plot
  salaries: {}, // league average salary data
  years: [],

  angularScope: angular.element(document.getElementById('body')).scope(),

  current_team: '',
  default_team: 'BOS', // both of these are used

  current_stat: 'AVG',

  activeWindow: 1,

  sortingKey1: 'Salary',
  sortingKey2: 'WAR',

  current_y_base: 0, // for readjust the position of plot after centered zooming
  // it's the (CARTESIAN) y coordinates the current chart bottom is at
  // this value is never made greater than zero
  shift: 100, // number of pixels shifted at scale 1.
  shiftActual: 100, // with min and max applied to shift
  current_grid_scale_sal: undefined,
  current_sal_zooming_scale: 1,

  config: {
    start_year: 1970,
    end_year: 2017,

    player_bar_w: 21,
    bar_w: 8,
    bar_sp: 2, // between-bar spacing
    grid_spacing: 1,
    grid_min_height: 2,

    zoomFactor: 1.5,

    grid_scale_sal: 3.5,
    grid_scale_war: 2.3,

    wl: 1240,
    hl: 220,
    wr: 1240,
    hrt: 220,
    hrb: 220,
    sideshift_left: 0,
    sideshift_right: 30,

    hyear: 12,

    hl_chart: 220, // this is within hl, right now equals hl because year svg is separated
    hrb_chart: 220,

    barbgcolor: '#ffffff',
    barbghigh: '#dadada',

    barcolors: {
      Salary_norm: {
        F: '#729472',
        P: '#97BB96',
      },
      WAR: {
        F: '#92859B',
        P: '#B3A3BF',
      },
    },

    sal_legend_scale: 5,
    war_legend_scale: 5,
  },

  init: function() {
    for (year = this.config.start_year; year <= this.config.end_year; year++)
    d3app.years.push(year);

    this.current_grid_scale_sal = this.config.grid_scale_sal;

    var angularScope = d3app.angularScope ||
    (d3app.angularScope = angular.element(document.getElementById('body')).scope());
    angularScope.$apply(function() {
      angularScope.teamPerformance = {};
    });
  },

  chartInit: function() {
    var c = d3app.config;

    // Team Salary Bars
    var svgTeamSalary = d3.select('#team-salary-timeline').append('svg')
    .attr('width', c.wl)
    .attr('height', c.hl)
    // Team Salary Years
    var canvasSalary = svgTeamSalary.append('g').attr('id', 'canvasTeamWar');
    // Team WAR Bars


    // Team Salary Years
    var svgTeamSalaryYear = d3.select('#team-salary-timeline-year').append('svg')
    .attr('width', c.wl)
    .attr('height', c.hyear)
    var canvasTeamSalaryYear = svgTeamSalaryYear.append('g').attr('id', 'canvasTeamSalaryYear');

    // Player Stats
    var svgPlayerTimeline = d3.select('#playerTimeline').append('svg')
    .attr('width', c.wr)
    .attr('height', c.hrt)
    var statTimeline = svgPlayerTimeline.append('g')
    .attr('id', 'statTimeline')
    .attr('transform', 'translate(' + (40) + ',' + (0) + ')');

    // Team WAR Bars
    var svgTeamWar = d3.select('#team-war-timeline').append('svg')
    .attr('width', c.wr)
    .attr('height', c.hrb)
    var canvasTeamWar = svgTeamWar.append('g').attr('id', 'canvasTeamWar');

    var svgTeamWar = d3.select('#team-war-timeline-year').append('svg')
    .attr('width', c.wr)
    .attr('height', c.hyear)
    var canvasTeamWarYear = svgTeamWar.append('g').attr('id', 'canvasTeamWarYear');

    // <g>s bound to years
    // left
    var gsTeamSalary = canvasSalary.append('g')
    .selectAll('g')
    .data(d3app.years)
    .enter()
    .append('g')
    .attr('class', 'g_year')
    .attr('transform', function(d, i) {
      var trs = 'translate(' +
      (i * (c.bar_w + c.bar_sp+15) + c.bar_sp + c.sideshift_left + 10) +
      ',' + 0 + ')';
      return trs;
    });
    // left years
    var gsTeamSalaryYear = canvasTeamSalaryYear.append('g')
    .selectAll('g')
    .data(d3app.years)
    .enter()
    .append('g')
    .attr('class', 'g_year')
    .attr('transform', function(d, i) {
      var trs = 'translate(' +
      (i * (c.bar_w + c.bar_sp+15) + c.bar_sp + c.sideshift_left) +
      ',' + 0 + ')';
      return trs;
    });
    // right bottom
    var gsTeamWar = canvasSalary.append('g')
    .selectAll('g')
    .data(d3app.years)
    .enter()
    .append('g')
    .attr('class', 'g_year')
    .attr('transform', function(d, i) {
      var trs = 'translate(' +
      (i * (c.bar_w + c.bar_sp+15) + c.bar_sp) +
      ',' + 0 + ')';
      return trs;
    });
    // player timeline
    var gsPlayerTimeline = statTimeline.append('g')
    .selectAll('g')
    .data(d3app.years)
    .enter()
    .append('g')
    .attr('class', 'g_year')
    .attr('transform', function(d, i) {
      var trs = 'translate(' +
      (i * (c.player_bar_w + c.bar_sp+2) + c.bar_sp) +
      ',' + 0 + ')';
      return trs;
    });
    // right years
    var gsRightYear = canvasTeamWarYear.append('g')
    .selectAll('g')
    .data(d3app.years)
    .enter()
    .append('g')
    .attr('class', 'g_year')
    .attr('transform', function(d, i) {
      var trs = 'translate(' +
      (i * (c.bar_w + c.bar_sp+15) + c.bar_sp) +
      ',' + 0 + ')';
      return trs;
    });

    // backround rects
    // left
    gsTeamSalary.append('rect')
    .attr('class', function(d) { return 'bg_year bg_year' + d})
    .attr('height', c.hl)
    // left years
    gsTeamSalaryYear.append('rect')
    .attr('class', function(d) { return 'bg_year bg_year' + d})
    .attr('height', c.hyear)
    // right bottom
    gsTeamWar.append('rect')
    .attr('class', function(d) { return 'bg_year bg_year' + d})
    .attr('height', c.hrb)
    // right top
    gsPlayerTimeline.append('rect')
    .attr('class', function(d) { return 'bg_year bg_year' + d})
    .attr('height', c.hrt)
    // right years
    gsRightYear.append('rect')
    .attr('class', function(d) { return 'bg_year bg_year' + d})
    .attr('height', c.hyear)
    // apply common atributes
    d3.selectAll('.bg_year')
    .attr('x', -1)
    .attr('y', 0)
    .attr('width', c.bar_w + c.bar_sp)
    .style('fill', c.barbgcolor);

    // mouseover highlight
    d3.selectAll('.g_year')
    .on('mouseover', function(d) {
      d3app.barMouseover(d, d3.select(this));
    }).on('mouseout', function(d) {
      d3app.barMouseout(d, d3.select(this));
    });

    // create data groups (the "bars" spaces)
    // left
    gsTeamSalary.append('g')
    .attr('id', function(d) { return 'grid_left'+d; })
    .attr('transform', function(d) {
      return 'translate(0,' + c.hl_chart + ')';
    })
    gsTeamSalaryYear.append('g')
    .attr('id', function(d) { return 'grid_left_year'+d; })
    .attr('transform', function(d) {
      return 'translate(0,' + c.hyear + ')';
    })
    .append('text')
    .attr('class', 'yearText')
    .text(function(d) { return d; });
    // right bottom
    gsTeamWar.append('g')
    .attr('id', function(d) { return 'grid_rightbottom'+d; })
    .attr('transform', function(d) {
      return 'translate(0,' + c.hrb_chart + ')';
    })
    gsRightYear.append('g')
    .attr('id', function(d) { return 'grid_right_year'+d; })
    .attr('transform', function(d) {
      return 'translate(0,' + c.hyear + ')';
    })
    .append('text')
    .attr('class', 'yearText')
    .text(function(d) { return d; });
    // right top
    gsPlayerTimeline.append('g')
    .attr('id', function(d) { return 'grid_player_timeline'+d; })
    .attr('transform', function(d) {
      return 'translate(0,' + c.hrt + ')';
    })
  },


  barMouseover: function(d, g) {
    d3.selectAll('.bg_year'+d)
    .style('fill', d3app.config.barbghigh);
    // console.log(d);

    var year_data = d3app.teamdata_year[d3app.current_team];

    if (year_data.hasOwnProperty(d)) {
      var year_data = year_data[d][0];

      var angularScope = d3app.angularScope ||
      (d3app.angularScope = angular.element(document.getElementById('body')).scope());
      angularScope.$apply(function() {
        var postSeasonText = '';
        if (year_data.WSWin === 1) {
          postSeasonText = 'Won World Series'
        } else if (year_data.LgWin === 1) {
          postSeasonText = 'Won League Championship'
        } else if (year_data.DivWin === 1) {
          postSeasonText = 'Won Division'
        } else if (year_data.WCWin === 1) {
          postSeasonText = 'Playoff Berth'
        }
        angularScope.teamPerformance = {
          season: d,
          w: year_data.W,
          l: year_data.L,
          wpct: year_data.wpct,
          postSeasonText: postSeasonText,
          hovered: true,
        }
      });
    }
    // add year details to legend text for salary
    d3.select("#sal_legend_svg_text")
    .text(d3app.getSalLegendText(d))
  },

  barMouseout: function(d, g) {
    d3.selectAll('.bg_year'+d)
    .style('fill', d3app.config.barbgcolor);

    var angularScope = d3app.angularScope ||
    (d3app.angularScope = angular.element(document.getElementById('body')).scope());
    angularScope.$apply(function() {
      angularScope.teamPerformance = {};
    });

    // remove detailed salary legend text
    d3.select("#sal_legend_svg_text")
    .text(d3app.getSalLegendText(-1));
  },

  plot: function(team, key, sortingKey) {
    // key is either Salary_norm or WAR

    var isSameTeam = this.current_team === team
    if (!isSameTeam) this.current_team = team;
    var isWAR = (key == 'WAR');

    // var rankingKey = 'Age';
    if (isWAR)
    d3app.sortingKey2 = sortingKey;
    else
    d3app.sortingKey1 = sortingKey;

    // reset the scaling parameters when we replot
    this.current_grid_scale_sal = this.config.grid_scale_sal;

    var data_years = this.data[team];

    var c = d3app.config;
    var bar_sp = c.bar_sp;
    var sp = c.grid_spacing;
    var sc = isWAR ? c.grid_scale_war : c.grid_scale_sal;
    var bar_w = c.bar_w;
    var minh = c.grid_min_height;

    this.years.forEach(function(year){

      var data_single_year = data_years[year];
      data_single_year.sort(function(p1, p2) {
        return p1[sortingKey] - p2[sortingKey];
      });

      var y = 0 + sp;
      var g = isWAR ? d3.select('#grid_rightbottom'+year) : d3.select('#grid_left'+year);

      g.selectAll('rect').remove();
      g.selectAll('rect').data(data_single_year)
      .enter().append('rect')
      .attr('id', function(d) { return utilities.cleanId(d.key_bbref); })
      .attr('class', 'grid')
      .attr('y', function(d) {
        var val = d[key];
        val = sp + (Math.max(Math.round(val * sc), minh) - sp);
        // the second term is bar height
        // we keep sp part of the linear scaling
        // so that the total bias is not accumulated
        y -= val;
        return y;
      })
      .attr('x', 0)
      .attr('width', bar_w)
      .attr('height', function(d) {
        var val = d[key];
        val = Math.max(Math.round(val * sc), minh) - sp;
        return val;
      })
      .attr('fill', function(d) {
        return d3app.config.barcolors[key][d.Position];
      })
      .on('click', function(d) {
        d3app.selectPlayer(d);
      })
      .on('mouseover', function(d) {
        d3app.highlight(d, 0, d3app.activeWindow);
      })
      .on('mouseout', function(d) {
        d3app.removeHighlight(d.key_bbref, 0, d3app.activeWindow);
      });
    });
  },


  selectPlayer: function(d) {

    var current_activeWindow = this.activeWindow;
    // we pass this into the event handlers, so that we KNOW explicitly if it is
    //      the updated value or not.

    var angularScope = d3app.angularScope ||
    (d3app.angularScope = angular.element(document.getElementById('body')).scope());
    angularScope.$apply(function() {
      // console.log(angularScope.bbref)

      var player = current_activeWindow === 1 ?
      angularScope.player1 : angularScope.player2;

      // reset
      d3app.removeHighlight(player.bbref, 1, current_activeWindow);

      player.bbref = d.key_bbref;

      angularScope.year = year;
      player.playerName = d.name_first + ' ' + d.name_last + ' ' + d.name_suffix;
      player.mlbam = d.key_mlbam;

      player.salary = d.Salary;
      player.WAR = d.WAR;
      player.AVG = d.AVG;
      player.HR = d.HR;
      player.OPS = d.OPS;
      player.ERA = d.ERA;
      player.WHIP = d.WHIP;
      player.FIP = d.FIP;
      player.team = d.Team;

      player.pos2 = d.Pos2;
      player.statlist = (d.Pos2 === 'F') ?
      angularScope.FstatNames : angularScope.PstatNames;

      // alternate between windows
      angularScope.activeWindow = 3 - current_activeWindow;
      // also keep a local copy of activeWindow
      d3app.activeWindow = 3 - current_activeWindow;

    });

    d3app.highlight(d, 1, current_activeWindow);

    d3appHead.plot(d.key_bbref, d.Year, current_activeWindow);

  },


  highlight: function(d, isSelect, current_activeWindow) {
    if (!d.key_bbref) { return; }
    var id = utilities.cleanId(d.key_bbref);
    // var current_activeWindow = this.activeWindow;
    d3.selectAll('#'+id)
    .classed((isSelect?'selected':'hovered')+current_activeWindow, true);



    // for dots, need to draw new ones at original position to put them on top
    var dots = d3.selectAll('#'+id+'_dot')[0];
    // console.log(dots);
    dots.forEach(function(dot) {
      d3.select(dot.parentNode).append('circle')
      .attr('class', (isSelect?'dot dot_selected':'dot dot_hovered')+current_activeWindow)
      .attr('r', 4)
      .attr('cx', d3app.config.bar_w/2)
      .attr('cy', function() {
        // get the parent circle's cy and draw on top of it
        return d3.select(dot).attr('cy');
      });
    });
    // dots.forEach(function(dot) {
    //   d3.select(dot.parentNode).append('circle')
    //   .attr('class', (isSelect?'dot dot_selected':'dot dot_hovered')+current_activeWindow)
    //   .attr('r', 4)
    //   .attr('cx', d3app.config.bar_w/2)
    //   .attr('cy', function() {
    //     // get the parent circle's cy and draw on top of it
    //     return d3.select(dot).attr('cy');
    //   });
    // });

    var angularScope = d3app.angularScope ||
    (d3app.angularScope = angular.element(document.getElementById('body')).scope());
    angularScope.$apply(function() {
      var player = angularScope.player_hovered;
      player.mlbam = d.key_mlbam;
      player.playerName = d.name_first + ' ' + d.name_last + ' ' + d.name_suffix;
      player.pos2 = d.Pos2;
      player.salary = d.Salary;
      player.WAR = d.WAR;
      player.AVG = d.AVG;
      player.HR = d.HR;
      player.OPS = d.OPS;
      player.ERA = d.ERA;
      player.WHIP = d.WHIP;
      player.FIP = d.FIP;
      player.team = d.Team;

    });
  },

  removeHighlight: function(key_bbref, isSelect, current_activeWindow) {
    if (!key_bbref) { return; }
    var id = utilities.cleanId(key_bbref);
    // var current_activeWindow = this.activeWindow;

    if (isSelect) {
      // a click event
      d3.selectAll('#'+id)
      .classed('selected'+current_activeWindow, false);
      d3.selectAll('.dot_selected'+current_activeWindow).remove();
    } else {
      // a mouseout event
      d3.selectAll('#'+id)
      .classed('hovered1', false)
      .classed('hovered2', false);
      d3.selectAll('.dot_hovered1').remove();
      d3.selectAll('.dot_hovered2').remove();
      var angularScope = d3app.angularScope ||
      (d3app.angularScope = angular.element(document.getElementById('body')).scope());
      angularScope.$apply(function() {
        var player = angularScope.player_hovered;
        player.mlbam = undefined;
        player.playerName = '';
        player.pos2 = '';
        player.salary = 0;
        player.WAR = 0.0;
        player.AVG = 0.0;
        player.HR = 0;
        player.OPS = 0.0;
        player.ERA = 0.0;
        player.WHIP = 0.0;
        player.FIP = 0.0;
        player.team = '';
      });
    }
  },

  reScaleSalaryPlot: function(direction) {

    var c = d3app.config;
    var f = (direction === 1) ? c.zoomFactor : (1/c.zoomFactor);
    // update the scale and adjust legend text now
    d3app.current_sal_zooming_scale *= f;
    d3.select("#sal_legend_svg_text")
    .text(d3app.getSalLegendText(-1));

    // calculate the new position after centered zoom
    var newsc = (d3app.current_grid_scale_sal *= f);
    d3app.shift *= f;
    d3app.shiftActual = Math.max(Math.min(d3app.shift, c.hl / 2), 50);

    // no change if base is at 0
    if (d3app.current_y_base < 0) {
      d3app.current_y_base = Math.min(c.hl/2 - (c.hl/2 - d3app.current_y_base) * f, 0);
    }

    var sp = c.grid_spacing;
    var minh = c.grid_min_height;

    this.years.forEach(function(year){

      var y = - d3app.current_y_base + sp;
      var g = d3.select('#grid_left'+year);

      g.selectAll('rect')
      .transition()
      .attr('y', function(d) {
        var val = d['Salary_norm'];
        val = sp + (Math.max(Math.round(val * newsc), minh) - sp);
        // we keep sp part of the linear scaling
        // so that the total bias is not accumulated
        y -= val;
        return y;
      })
      .attr('height', function(d) {
        var val = d['Salary_norm'];
        val = Math.max(Math.round(val * newsc), minh) - sp;
        return val;
      });
    });
  },

  moveSalaryPlot: function(direction) {
    // shift > 0 : chart moved up and "camera" moved down
    // click on "up" button calls move(-1)

    // calculate the new position first:
    var c = d3app.config;
    var shift_this = d3app.shiftActual * direction;
    console.log(d3app.shiftActual)
    console.log(direction)
    console.log(d3app.current_y_base)

    var new_y_base = Math.min(d3app.current_y_base + shift_this, 0);
    shift_this = new_y_base - d3app.current_y_base;
    d3app.current_y_base = new_y_base;

    var sc = d3app.current_grid_scale_sal;
    var sp = c.grid_spacing;
    var minh = c.grid_min_height;

    console.log(shift_this)
    console.log(sc)

    this.years.forEach(function(year){

      var y = - new_y_base + sp; // note that d3 y is the negation of Catesian y
      var g = d3.select('#grid_left'+year);

      g.selectAll('rect')
      .transition().duration(1000)
      .attr('y', function(d) {
        var val = d['Salary_norm'];
        val = sp + (Math.max(Math.round(val * sc), minh) - sp);
        // we keep sp part of the linear scaling
        // so that the total bias is not accumulated
        y -= val;
        return y;
      })
    });

  },

  plotScatter: function(team, stat) {

    if (!team || !stat) { return; }
    if (stat != this.current_stat) {
      this.current_stat = stat;
    }

    var data_years = this.data[team];

    var c = d3app.config;

    var statsrange = d3app.teamstatsrange[team][stat];
    // console.log()
    var yscale = d3.scale.linear()
    .domain([statsrange.min, statsrange.max*1.05])
    .range([0, -c.hrt]);



    this.years.forEach(function(year){
      data_single_year = data_years[year];

      var g = d3.select('#grid_player_timeline'+year);
      g.selectAll('circle').remove();
      g.selectAll('circle')
      .data(data_single_year.filter(function(row){
        // only show eligible players
        return utilities.Fstats_raw.includes(stat) && row['PA'] > 50 && row['Position'] === 'F' ||
        utilities.Pstats_raw.includes(stat) && row['IP'] > 20 && row['Position'] === 'P';
      }))
      .enter().append('circle')
      .attr('id', function(d) { return utilities.cleanId(d.key_bbref)+'_dot'; })
      .attr('class', 'dot')
      .attr('cy', function(d) {
        return yscale(d[stat]);
      })
      .attr('cx', function() {
        return c.bar_w / 2
        // return 3 + Math.random() * (bar_w - 6);
      })
      .attr('r', 2)
      .on('click', function(d) {
        d3app.selectPlayer(d);
      })
      .on('mouseover', function(d) {
        d3app.highlight(d, 0, d3app.activeWindow);
      })
      .on('mouseout', function(d) {
        d3app.removeHighlight(d.key_bbref, 0, d3app.activeWindow);
      });
    });


    // axis to the right
    var yAxis = d3.svg.axis().scale(yscale).orient('right')
    .ticks(4)
    .outerTickSize(0)
    .innerTickSize(1200)
    .tickPadding(-1220);

    var crt = d3.select('#statTimeline');
    crt.selectAll('#yaxis_stat').remove();
    var statAxis = crt.append('g').attr('id', 'yaxis_stat')
    .attr('class', 'yaxis')
    .attr('transform', 'translate(' + (0) + ',' + c.hrt + ')')
    .attr('class', 'axis')
    .call(yAxis);

    // statAxis.append('text').text(stat)
    // .attr('id', 'axisTextMain')
    // .style('text-anchor', 'end')
    // .attr('transform', 'translate(-10,' + ( - c.hrt + 15) + ')');
  },


  plotTeamPerformance: function(team) {

    var c = d3app.config

    var scale = 95;

    var warscale = d3.scale.linear()
    .domain([0, c.hrb_chart / c.grid_scale_war])
    .range([c.hrb_chart, 0]);

    var g = d3.select('#canvasTeamWar');
    g.selectAll('path').remove();
    g.selectAll('line').remove();

    // if (d3app.teamdata.hasOwnProperty(team)) {
    //     var data = d3app.teamdata[team];
    //
    //     var lineFunc = d3.svg.line()
    //         .y(function(d) {
    //             return warscale(d.wpct * scale);
    //         })
    //         .x(function(d) {
    //             return (d.yearID - c.start_year) * (c.bar_w + 2) +
    //                 c.bar_w / 2;
    //         })
    //         .interpolate('cardinal');
    //
    //     g.append('path')
    //         .attr('d', lineFunc(data))
    //         .attr('class', 'chartline');
    //
    //     // add a 0.500 / 81win baseline
    //     g.append('line')
    //         .attr('class', 'chartbaseline')
    //         .attr('x1', 0)
    //         .attr('x2', c.wr - c.sideshift_right - 10 + 10)
    //         .attr('y1', warscale(0.5 * scale))
    //         .attr('y2', warscale(0.5 * scale));
    // }

    var yAxis = d3.svg.axis().scale(warscale).orient('right')
    .ticks(10)
    .outerTickSize(0);
    g.selectAll('#yaxis_war').remove();
    var gaxis = g.append('g').attr('id', 'yaxis_war')
    .attr('class', 'yaxis')
    .attr('transform', 'translate(' + (c.wr - c.sideshift_right) + ',' + 0 + ')')
    .attr('class', 'axis')
    .call(yAxis);
    gaxis.append('text').text('Total WAR')
    .attr('id', 'axisTextMain')
    .style('text-anchor', 'end')
    .attr('transform', 'translate(-10,20)');


    g.selectAll('.linelegend').remove();
    var lg = g.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class','linelegend');

    lg.append('line')
    .attr('x1', 15)
    .attr('x2', 15)
    .attr('y1', 12)
    .attr('y2', warscale(0.5 * scale))
    .attr('stroke-dasharray', '4,2');
    lg.append('text').text('0.500 win pct. line')
    .attr('transform', 'translate(15, 10)');

    if (data.length >= 5) {
      var y0 = warscale(data[4].wpct * scale);
      lg.append('line')
      .attr('x1', 58)
      .attr('x2', 58)
      .attr('y1', 27)
      .attr('y2', y0);
      lg.append('text').text('actual win percentage.')
      .attr('transform', 'translate(58, 25)');
    }

  },


  plotBarLegend: function() {

    var c = d3app.config;
    var w = 25,
    h_sal = c.sal_legend_scale * c.grid_scale_sal,
    h_war = c.war_legend_scale * c.grid_scale_war,
    h_sal_text = 350,
    h_war_text = 70;


    var sal_legend_g = d3.select('#sal_legend')
    .append('svg')
    .attr('width', w).attr('height', h_sal)
    .append('g');
    var war_legend_g = d3.select('#war_legend')
    .append('svg')
    .attr('width', w).attr('height', h_war)
    .append('g');
    var sal_legend_text_g = d3.select('#sal_legend_text')
    .append('svg')
    .attr('width', w).attr('height', h_sal_text)
    .append('g');
    var war_legend_text_g = d3.select('#war_legend_text')
    .append('svg')
    .attr('width', w).attr('height', h_war_text)
    .append('g');

    sal_legend_g.append('rect')
    .attr('width', c.bar_w)
    .attr('height', h_sal)
    .attr('x', (w - c.bar_w)/2)
    .attr('y', 0)
    .attr('fill', c.barcolors.Salary_norm.F);

    war_legend_g.append('rect')
    .attr('width', c.bar_w)
    .attr('height', h_war)
    .attr('x', (w - c.bar_w)/2)
    .attr('y', 0)
    .attr('fill', c.barcolors.WAR.F);

    sal_legend_text_g.append('text')
    .attr('id', 'sal_legend_svg_text')
    .text(d3app.getSalLegendText(-1));

    war_legend_text_g.append('text')
    .attr('id', 'war_legend_svg_text')
    .text(' = ' + c.war_legend_scale + ' WAR');

  },


  run: function() {

    this.init(); // whatever needs to be initialized

    this.chartInit(); // whatever that does not need the data

    d3.queue()
    .defer(d3.csv, 'data/playerdata_final.csv')
    .defer(d3.json, 'data/Teams_nested.json')
    .defer(d3.json, 'data/Teams_nested_year.json')
    .defer(d3.json, 'data/team_stats_range.json')
    .defer(d3.json, 'data/salaries.json')
    .await(function(err, data1, data2, data3, data4, data5) {

      document.getElementById('loader_text').textContent = 'Initializing ...';

      // seems ok without coverting str value to number but we'll be safe here
      utilities.formatRawDataFromCSV(data1);

      console.log(data1);

      d3app.data = utilities.nestPlayerDataByTeamYear(data1);
      // console.log(d3app.data);
      d3app.teamdata = data2;
      d3app.teamdata_year = data3;
      d3app.teamstatsrange = data4;
      d3app.salaries = data5;

      d3app.plot(d3app.default_team, 'Salary_norm', d3app.sortingKey1);
      d3app.plot(d3app.default_team, 'WAR', d3app.sortingKey2);

      // d3app.plotTeamPerformance(d3app.current_team);

      d3app.plotScatter(d3app.current_team, d3app.current_stat);

      d3app.plotBarLegend();

      d3appHead.run(utilities.nestPlayerDataByPlayerYear(data1));
      // laoding spinner is removed when d3appHead.run() finishes

    });
  },

  getSalLegendText: function(year) {
    var toAppend = '';
    var sc = d3app.config.sal_legend_scale / d3app.current_sal_zooming_scale;
    if (year != -1) {
      // only query data in this case
      var sal = Math.round(d3app.salaries[year].avg_750 * sc / 1000) * 1000;
      toAppend = '  (~ $' + utilities.formatSalary(sal) + ' in ' + year + ')'
    }
    return ' = ' + sc.toFixed(1) + ' times of league average' + toAppend;
  },

}
