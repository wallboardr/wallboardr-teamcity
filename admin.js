define(['require', './teamcity-api'], function (require) {
  'use strict';
  var Teamcity = require('./teamcity-api');
  var teamcityController = function ($scope, dataLoader) {
    var tcApi;
    $scope.reset = function () {
      $scope.projects = [];
      $scope.tcUrl = '';
    };
    $scope.connectToTeamcity = function () {
        if ($scope.url) {
            tcApi = new Teamcity($scope.url, dataLoader);
        }
    };
    $scope.reset();

  };
  teamcityController.$inject = ['$scope', 'dataLoader'];
  teamcityController.config = {
    name: 'teamcity',
    humanName: 'TeamCity',
    controller: 'TeamcityController'
  };

  return teamcityController;
});