
// define module
// define routes
angular.module('website', []).config(function($routeProvider){ //inject routeProvider
  $routeProvider.
  when('/about', {template:'partials/about.html'}).
  when('/portfolio', {template:'partials/portfolio.html'}).
  otherwise({redirectTo:'/home', template:'partials/home.html'});

});

function MainCtrl($scope){

}
