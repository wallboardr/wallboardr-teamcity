define(['require', './teamcity-api'], function (require) {
  'use strict';
  var Teamcity = require('./teamcity-api');
  var teamcityController = function ($scope, dataLoader) {
    var tcApi,
        initApi = function (url) {
          if (!tcApi || tcApi.baseUrl !== url) {
            tcApi = new Teamcity(url, dataLoader);
          }
        },
        getUrl = function (repo) {
          var url, creds, uparts;
          if (repo && repo.data && repo.data.url) {
            url = repo.data.url;
            if (repo.data.username) {
              creds = repo.data.username;
              if (repo.data.password) {
                creds = creds + ':' + repo.data.password;
              }
              uparts = url.split('://');
              if (uparts.length > 1) {
                url = uparts[0] + '://' + creds + '@' + uparts[1];
              } else {
                url = 'http://' + creds + '@' + uparts[0];
              }
            }
          }
          return url;
        },
        reduceConfigList = function (configList) {
          var chosen = [],
              cc;
          for (cc = 0; cc < configList.length; cc += 1) {
            if (configList[cc] && configList[cc].chosen) {
              chosen.push({id: configList[cc].id, name: configList[cc].name});
            }
          }
          return chosen;
        },
        hydrateConfigList = function (clean, reduced) {
          var outer, inner;
          for (outer = 0; outer < clean.length; outer += 1) {
            for (inner = 0; inner < reduced.length; inner += 1) {
              if (clean[outer].id === reduced[inner].id) {
                clean[outer].chosen = true;
                break;
              }
            }
          }
          return clean;
        };
    $scope.reset = function () {
      $scope.projects = [];
      $scope.configs = [];
      $scope.currentStep = 0;
    };
    $scope.showStep = function (step) {
      return step === $scope.currentStep;
    };
    $scope.backToProjs = function () {
      $scope.configs = [];
      $scope.currentStep = 1;
    };
    $scope.chooseProject = function (form, proj, active) {
      var dataLocation = active || form;
      if (form.$valid) {
        dataLocation.data.projectId = proj.id;
        dataLocation.data.projectName = proj.name;
        tcApi.getBuildConfigurations(proj).then(function (res) {
          if (dataLocation.data.configs && dataLocation.data.configs.length > 0) {
            $scope.configs = hydrateConfigList(res, dataLocation.data.configs);
          } else {
            $scope.configs = res;
          }
          $scope.currentStep = 2;
        });
      }
    };
    $scope.projStatus = function (proj) {
      var classes = [];
      if ($scope.activeScreenEdit && $scope.activeScreenEdit.data && proj.id === $scope.activeScreenEdit.data.projectId) {
        classes.push('is-active');
      }
      return classes;
    };
    $scope.saveConfigs = function (form, active) {
      var dataLocation = active || form;
      if (form.$valid) {
        dataLocation.data.configs = reduceConfigList($scope.configs);
        if (active) {
          $scope.updateActiveScreen(form);
        } else {
          $scope.addScreen(form);
        }
        $scope.reset();
      }
    };
    $scope.getTeamCityProjects = function (form, active) {
      var repo = active || form,
          url = getUrl(repo);

      if (form.$valid) {
        initApi(url);
        tcApi.getProjects().then(function(res){
          $scope.projects = res;
          $scope.currentStep = 1;
        });
      }
    };
    $scope.cancelEditScreen = function () {
      $scope.reset();
      $scope.$parent.cancelEditScreen();
    };
    $scope.reset();

  };
  teamcityController.$inject = ['$scope', 'dataLoader'];
  teamcityController.config = {
    name: 'teamcity',
    humanName: 'TeamCity',
    controller: 'TeamcityController',
    centered: true,
    pollInterval: 240
  };

  return teamcityController;
});