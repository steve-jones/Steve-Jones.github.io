var app = angular.module('MainApp', []);

app.controller('MainController', ['$scope','$http',
    function($scope, $http) {

        $scope.left = 'SAL';
        $scope.right = 'WAR';

        $scope.teams = utilities.teams;
        $scope.selectedTeam = d3app.default_team;
        $scope.sortBy1 = d3app.sortingKey1; // the salary view
        $scope.sortBy2 = d3app.sortingKey2; // the WAR view
        $scope.teamPerformance = {};

        $scope.selectedStat = d3app.current_stat;

        $scope.FstatNames = ['AVG', 'HR/PA', 'BB/PA', 'SO/PA', 'SB/PA'];
        $scope.PstatNames = ['ERA', 'FIP', 'SO9', 'H9', 'BB9'];

        $scope.stats_raw = utilities.Fstats_raw.concat(utilities.Pstats_raw);

        $scope.formatSalary = utilities.formatSalary;
        $scope.formatAVG = utilities.formatAVG;

        // selected player data
        $scope.year = '';
        $scope.player_hovered = {
            // bbref: '_',
            playerName: '',
            pos2: '',
            mlbam: undefined,
            salary: 0,
            WAR: 0.0,
            team: '',
            // statlist: [],
        };


        //player1
        $scope.player1 = {
            bbref: '',
            playerName: '',
            pos2: '',
            mlbam: undefined,
            statlist: [],
        };

        // player2
        $scope.player2 = {
            bbref: '',
            playerName: '',
            pos2: '',
            mlbam: undefined,
            statlist: [],
        };


        // the current active window to select player
        $scope.activeWindow = 1;


        $scope.rePlot = function(mode) {
            // 0 = team changed
            // 1 = salary view sort-by changed
            // 2 = WAR view sort-by changed
            // 3 = scatter plot stat changed
            if (mode === 0 || mode === 1) {
                d3app.plot($scope.selectedTeam, 'Salary_norm', $scope.sortBy1);
            }
            if (mode === 0 || mode === 2) {
                d3app.plot($scope.selectedTeam, 'WAR', $scope.sortBy2);
            }
            if (mode === 0 || mode === 3) {
                d3app.plotScatter($scope.selectedTeam, $scope.selectedStat);
            }
            if (mode === 0) {
                d3app.plotTeamPerformance($scope.selectedTeam);
            }
        };

        $scope.zoom = function(direction) {
            // if out of range, return
            // direction: 1 = zoom-in, -1 = zoom-out
            d3app.reScaleSalaryPlot(direction);
        }
        $scope.move = function(direction) {
            // direction: 1 = up, -1 = down
            d3app.moveSalaryPlot(direction);
        }

        $scope.posDict = {
            F: 'Hitter',
            SP: 'SP',
            RP: 'RP',
        };

        $scope.description = function(player) {
            // console.log(player)
            if (player.pos2)
                return ' (' + $scope.posDict[player.pos2] + ')';
            return '';
        };

        $scope.getTeamName = function(teamIDBR) {
            return utilities.teamNameDict[teamIDBR].name;
        };

        $scope.getStatName = function(statIDBR) {
            return utilities.teamNameDict[statIDBR].name;
        };

        $scope.getESPNID = function(teamIDBR) {
            return utilities.teamNameDict[teamIDBR].teamIDESPN;
        };

    }
]);
