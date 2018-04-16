var utilities = {
  teams: ["ANA", "ARI", "ATL", "BAL", "BOS", "CAL", "CHC", "CHW", "CIN", "CLE", "COL", "DET", "FLA", "HOU", "KCR", "LAA", "LAD", "MIA", "MIL", "MIN", "MON", "NYM", "NYY", "OAK", "PHI", "PIT", "SDP", "SEA", "SFG", "STL", "TBD", "TBR", "TEX", "TOR", "WSN"],

  cleanId: function(key_bbref){
    // remove dots from bbref keys for it to be valid css id
    return key_bbref.split('.').join('').split("'").join('');
  },

  formatSalary: function(n) {
    n = n.toString();
    segs = [];
    var i;
    for (i = n.length; i >= 3; i = i - 3) {
      segs.unshift(n.substring(i-3, i));
    }
    if (i > 0) {
      segs.unshift(n.substring(0, i));
    }
    return segs.join(',')

  },

  formatAVG: function(n) {
    // return '100';
    // if(n.charAt(0) === '0')
    // {
    //   n = n.substr(1);
    // }
    // return n;

  },

  Fstats_raw: ['AVG', 'HR', 'BB', 'SO', 'SB'],
  Pstats_raw: ['ERA', 'FIP', 'SO9', 'H9', 'BB9'],

  teamNameDict: {"TEX": {"name": "Texas Rangers", "teamIDESPN": "TEX"}, "SEA": {"name": "Seattle Mariners", "teamIDESPN": "SEA"}, "MIA": {"name": "Miami Marlins", "teamIDESPN": "MIA"}, "TBD": {"name": "Tampa Bay Devil Rays", "teamIDESPN": "TB"}, "DET": {"name": "Detroit Tigers", "teamIDESPN": "DET"}, "CHW": {"name": "Chicago White Sox", "teamIDESPN": "CHW"}, "HOU": {"name": "Houston Astros", "teamIDESPN": "HOU"}, "ANA": {"name": "Anaheim Angels", "teamIDESPN": "LAA"}, "FLA": {"name": "Florida Marlins", "teamIDESPN": "MIA"}, "MIL": {"name": "Milwaukee Brewers", "teamIDESPN": "MIL"}, "PHI": {"name": "Philadelphia Phillies", "teamIDESPN": "PHI"}, "ARI": {"name": "Arizona Diamondbacks", "teamIDESPN": "ARI"}, "BOS": {"name": "Boston Red Sox", "teamIDESPN": "BOS"}, "OAK": {"name": "Oakland Athletics", "teamIDESPN": "OAK"}, "TOR": {"name": "Toronto Blue Jays", "teamIDESPN": "TOR"}, "STL": {"name": "St. Louis Cardinals", "teamIDESPN": "STL"}, "CAL": {"name": "California Angels", "teamIDESPN": "LAA"}, "ATL": {"name": "Atlanta Braves", "teamIDESPN": "ATL"}, "PIT": {"name": "Pittsburgh Pirates", "teamIDESPN": "PIT"}, "SDP": {"name": "San Diego Padres", "teamIDESPN": "SD"}, "BAL": {"name": "Baltimore Orioles", "teamIDESPN": "BAL"}, "WSN": {"name": "Washington Nationals", "teamIDESPN": "WSH"}, "TBR": {"name": "Tampa Bay Rays", "teamIDESPN": "TB"}, "CHC": {"name": "Chicago Cubs", "teamIDESPN": "CHC"}, "MIN": {"name": "Minnesota Twins", "teamIDESPN": "MIN"}, "CIN": {"name": "Cincinnati Reds", "teamIDESPN": "CIN"}, "NYM": {"name": "New York Mets", "teamIDESPN": "NYM"}, "SFG": {"name": "San Francisco Giants", "teamIDESPN": "SF"}, "WSA": {"name": "Washington Senators", "teamIDESPN": "WSA"}, "LAD": {"name": "Los Angeles Dodgers", "teamIDESPN": "LAD"}, "NYY": {"name": "New York Yankees", "teamIDESPN": "NYY"}, "LAA": {"name": "Los Angeles Angels of Anaheim", "teamIDESPN": "LAA"}, "CLE": {"name": "Cleveland Indians", "teamIDESPN": "CLE"}, "KCR": {"name": "Kansas City Royals", "teamIDESPN": "KC"}, "COL": {"name": "Colorado Rockies", "teamIDESPN": "COL"}, "MON": {"name": "Montreal Expos", "teamIDESPN": "MON"}},

  nestPlayerDataByTeamYear: function(data) {
    var nested = this.nestPlayerDataByKeys(data, 'Team', 'Year');

    // filling empty years
    Object.keys(nested).forEach(function(team) {
      var d = nested[team];
      for (var year = 1970; year <= 2017; year++) {
        if (!d.hasOwnProperty(year))
        d[year] = [];
      }
    });
    // remove 'TOT'
    delete nested.TOT;
    return nested;
  },

  nestPlayerDataByPlayerYear: function(data) {
    var nested = this.nestPlayerDataByKeys(data, 'key_bbref', 'Year');

    // dealing with multiple data entry in the same year
    Object.keys(nested).forEach(function(key_bbref) {
      var d = nested[key_bbref];
      Object.keys(d).forEach(function(year) {
        var dy = d[year];
        if (dy.length > 1) {
          // multiple ds in one year, use 'TOT'
          d[year] = dy.filter(function(yearData) {
            return yearData['Team'] === 'TOT';
          });
        }
      });
    });
    // note missing years are allowed here
    return nested;
  },

  nestPlayerDataByKeys: function(data, keyName1, keyName2) {
    // 2-level nest: example: nestPlayerDataByKeys(data, 'Team', 'Year')
    var nested = {}
    // use plain loop for speed
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var key1 = d[keyName1];
      var key2 = d[keyName2];
      if (!nested.hasOwnProperty(key1))
      nested[key1] = {};
      if (!nested[key1].hasOwnProperty(key2))
      nested[key1][key2] = [];
      nested[key1][key2].push(d);
    }
    return nested;
  },

  formatRawDataFromCSV: function(raw) {

    // input is mutated in place

    var keys = Object.keys(raw[0]);
    // plain loops for speed
    for (var i = 0; i < raw.length; i++) {
      var d = raw[i];
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        var v = d[k];
        if (v === '' || isNaN(+v)) continue;
        d[k] = +v;
      }
    }
    // return self just in case
    return raw;
  }

}
