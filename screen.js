define(['jquery', 'boards/data-loader', 'require', './admin'], function ($, dataLoader, require) {
  'use strict';
  var plugin = require('./admin'),
      getViewData = function (loader, data) {
        if (!data) {
          return;
        }
        var mydata = {
          projectId: 'PP',
          projectTitle: 'Public Pages',
          status: 'failure',
          configs: [
            {status: 'success', id: '123'},
            {status: 'success', id: '124'},
            {status: 'success', id: '125'},
            {status: 'success', id: '126'},
            {status: 'failure', id: '127'},
          ]
        };

        return $.when(mydata);
      },
      teamcityScreen = function () {
        var self = this;
        return {
          getViewData: function () {
            return getViewData(dataLoader, self.props.data);
          },
          preShow: function () {
            self.maximizeTextSize();
          }
        };
      };

  teamcityScreen.config = plugin.config;
  return teamcityScreen;
});