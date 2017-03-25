;(function () {


    angular
        .module('ng.locale', [])
        .constant('MODULE_VERSION', '0.1.0')
        .value('ngLocaleConfig', {
            config: {
                localUrl: null,
                restUrl: null,
                prefix: null,
                toStore: false,
                storageName: 'localeStorage'
            },
            setConfig: function (config) {
                this.config = Object.assign({}, this.config, config);
                console.log('this.config - ', this.config);
            }
        })
        .factory('ngLocaleService', ngLocaleService)
        .directive('ngLocale', ['ngLocaleService', ngLocale])
        .filter('localize', localize);

    ngLocaleService.$inject = ['$http', '$q', '$window', 'ngLocaleConfig'];

    function ngLocaleService($http, $q, ngLocaleConfig, $window) {
        var locale;
        var storage = (typeof window.localStorage === 'undefined') ? undefined : window.localStorage,
            supported = !(typeof storage === undefined || typeof window.JSON === undefined);

        if (!get()) {
            if (ngLocaleConfig.config.restUrl) {
                locale = $http.get(ngLocaleConfig.config.restUrl).then(function (restRes) {
                    if (ngLocaleConfig.config.localUrl) {
                        return $http.get(ngLocaleConfig.config.localUrl).then(function (localRes) {
                            var data = Object.assign({}, localRes.data, restRes.data);
                            if (ngLocaleConfig.config.toStore) {
                                set(null, data);
                            }
                            return {data: data};
                        });
                    } else {
                        return restRes;
                    }
                });
            } else if (ngLocaleConfig.config.localUrl) {
                locale = $http.get(ngLocaleConfig.config.localUrl);
            } else {
                console.log("Make sure  you correctly configured ngLocale");
            }
        }

        return {
            $$getLocale: getLocale
        };

        function getLocale(key) {
            var deferred = $q.defer();

            var newKey = ngLocaleConfig.config.prefix ? ngLocaleConfig.config.prefix + '.' + key : key;
            var data = get();
            if (data) {
                deferred.resolve(data ? data[newKey] : '');
            } else {
                locale.then(function (response) {
                    deferred.resolve(response ? response.data[newKey] : '');
                });
            }

            return deferred.promise;
        }

        function set(name, val) {
            if (!supported) {
                console.log('localStorage not supported, make sure you have the $cookies supported.');
            }

            var storageName = name || ngLocaleConfig.config.storageName;
            return $window.localStorage && $window.localStorage.setItem(storageName, angular.toJson(val));
        }

        function get(name) {
            if (!supported) {
                console.log('localStorage not supported, make sure you have the $cookies supported.');
            }

            var storageName = name || ngLocaleConfig.config.storageName;
            return $window.localStorage && angular.fromJson($window.localStorage.getItem(storageName));
        }
    }

    ngLocale.$inject = ['ngLocaleService'];

    function ngLocale(ngLocaleService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                ngLocaleService.$$getLocale(attrs.ngLocale).then(function (response) {
                    element.html(response);
                });
            }
        };
    }

    localize.$inject = ['ngLocaleService'];

    function localize (ngLocaleService) {
        var cached = {};
        function detailsFilter(input) {
            if (input) {
                if (input in cached) {
                    // avoid returning a promise!
                    return typeof cached[input].then !== 'function' ?
                        cached[input] : undefined;
                } else {
                    ngLocaleService.$$getLocale(input).then(function (info) {
                        cached[input] = info;
                    });
                }
            }
        }
        detailsFilter.$stateful = true;
        return detailsFilter;
    }

})();
