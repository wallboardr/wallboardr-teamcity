define(['jquery', 'boards/data-loader', 'require', './admin', './teamcity-api'], function ($, dataLoader, require) {
  'use strict';
  var plugin = require('./admin'),
      Teamcity = require('./teamcity-api'),
      tcApi,
      initApi = function (url) {
        if (!tcApi || tcApi.baseUrl !== url) {
          tcApi = new Teamcity(url, dataLoader);
        }
      },
      getUrl = function (repo) {
        var url, creds, uparts;
        if (repo && repo.url) {
          url = repo.url;
          if (repo.username) {
            creds = repo.username;
            if (repo.password) {
              creds = creds + ':' + repo.password;
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
      getStatuses = function (loader, data) {
        if (!data) {
          return;
        }
        var url = getUrl(data),
            mydata = {
              title: data.projectName,
              identifier: data.projectId,
              status: 'success',
              configs: data.configs
            };


        initApi(url);
        return $.when.apply($, $.map(data.configs, function (conf) {
          return tcApi.getLatestBuild(conf.id);
        })).then(function () {
          var res = Array.prototype.slice.call(arguments), rr, cStat;
          for (rr = 0; rr < res.length; rr += 1) {
            cStat = res[rr].status.toLowerCase();
            mydata.configs[rr].status = cStat;
            if (cStat !== 'success') {
              mydata.status = 'failure';
            }
          }
          return mydata;
        });


        //   projectId: 'PP',
        //   projectTitle: 'Public Pages',
        //   status: 'failure',
        //   configs: [
        //     {status: 'success', id: '123'},
        //     {status: 'success', id: '124'},
        //     {status: 'success', id: '125'},
        //     {status: 'success', id: '126'},
        //     {status: 'failure', id: '127'},
        //   ]
        // };
      },
      teamcityScreen = function () {
        var self = this;
        return {
          getViewData: function () {
            return getStatuses(dataLoader, self.props.data);
          },
          preShow: function () {
            self.$screen.css({'height': 'auto'});
            self.maximizeTextSize();
            self.$screen.css({'height': '100%'});
          }
        };
      };

  teamcityScreen.config = plugin.config;
  return teamcityScreen;
});