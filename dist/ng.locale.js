;(function () {

    angular
        .module('ng.locale', [])
        .constant('MODULE_VERSION', '0.4.0')
        .value('ngLocaleConfig', {
            config: {
                localUrl: null,
                restUrl: null,
                prefix: null,
                toStore: false,
                storageName: 'localeStorage',
                storeTime: 1800000 // default store time 30 minutes. set to zero if want it forever
            },
            setConfig: function (config) {
                this.config = angular.extend({}, this.config, config);
            }
        })
        .run(['ngLocaleService', function (ngLocaleService) {
        }]);

})();
