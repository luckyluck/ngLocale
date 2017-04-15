;(function () {

    angular
        .module('ng.locale', [])
        .constant('MODULE_VERSION', '0.2.3')
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

angular.module('ng.locale')
    .directive('ngLocale', ['ngLocaleService', ngLocale]);

ngLocale.$inject = ['ngLocaleService'];

function ngLocale(ngLocaleService) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            ngLocaleService.$get(attrs.ngLocale).then(function (response) {
                element.html(response);
            });
        }
    };
}

angular.module('ng.locale')
    .filter('localize', localize);

localize.$inject = ['ngLocaleService'];

function localize(ngLocaleService) {

    var cached = {};

    function detailsFilter(input) {
        if (input) {
            if (input in cached) {
                // avoid returning a promise!
                return typeof cached[input].then !== 'function' ?
                    cached[input] : undefined;
            } else {
                ngLocaleService.$get(input).then(function (info) {
                    cached[input] = info;
                });
            }
        }
    }

    detailsFilter.$stateful = true;
    return detailsFilter;
}

angular.module('ng.locale')
    .factory('ngLocaleService', ngLocaleService);

ngLocaleService.$inject = ['$http', '$q', '$window', '$log', 'ngLocaleConfig'];

function ngLocaleService($http, $q, $window, $log, ngLocaleConfig) {

    var locale;
    var supported = !(angular.isUndefined(window.localStorage) || angular.isUndefined(window.JSON));

    if (!get()) {
        if (ngLocaleConfig.config.restUrl) {
            locale = $http.get(ngLocaleConfig.config.restUrl).then(function (restRes) {
                if (ngLocaleConfig.config.localUrl) {
                    var data = angular.extend(
                        {_createDate: new Date().getTime()},
                        restRes.data
                    );
                    if (ngLocaleConfig.config.toStore) {
                        set(data);
                    }
                    return {data: data};
                }
                locale = $http.get(ngLocaleConfig.config.localUrl).then(function (localRes) {
                    var data = angular.extend(
                        {_createDate: new Date().getTime()},
                        localRes.data,
                        restRes.data
                    );
                    if (ngLocaleConfig.config.toStore) {
                        set(data);
                    }
                    return {data: data};
                });
            });
        } else if (ngLocaleConfig.config.localUrl) {
            locale = $http.get(ngLocaleConfig.config.localUrl).then(function (localRes) {
                var data = angular.extend(
                    {_createDate: new Date().getTime()},
                    localRes.data
                );
                if (ngLocaleConfig.config.toStore) {
                    set(data);
                }
                return {data: data};
            });
        } else {
            throw new Error("Make sure  you correctly configured ngLocale");
        }
    }

    return {
        $get: getLocale
    };

    function getLocale(key) {
        var deferred = $q.defer();

        var newKey = ngLocaleConfig.config.prefix ? ngLocaleConfig.config.prefix + '.' + key : key;
        var data = get();
        if (data) {
            deferred.resolve(data[newKey]);
        } else {
            locale.then(function (response) {
                deferred.resolve(response ? response.data[newKey] : '');
            });
        }

        return deferred.promise;
    }

    function set(val) {
        if (!supported) {
            $log('localStorage not supported, make sure you have the $cookies supported.');
        }

        return $window.localStorage && $window.localStorage.setItem(ngLocaleConfig.config.storageName, angular.toJson(val));
    }

    function get() {
        if (!supported) {
            $log('localStorage not supported, make sure you have the $cookies supported.');
        }

        var data = $window.localStorage && angular.fromJson($window.localStorage.getItem(ngLocaleConfig.config.storageName));
        if ((!data || isTimeExpired(data._createDate)) && ngLocaleConfig.config.storeTime > 0) {
            remove();
            return null;
        }
        return data;
    }

    function remove() {
        if (!supported) {
            $log('localStorage not supported, make sure you have the $cookies supported.');
        }

        return $window.localStorage && $window.localStorage.removeItem(ngLocaleConfig.config.storageName);
    }

    function isTimeExpired(createdDate) {
        var currentTime = new Date().getTime();

        return currentTime - createdDate >= ngLocaleConfig.config.storeTime;
    }
}
