;(function () {
    
    angular
        .module('ng.locale', [])
        .constant('MODULE_VERSION', '0.4.1')
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
    .directive('ngLocale', ['$compile', 'ngLocaleService', ngLocale]);

ngLocale.$inject = ['$compile', 'ngLocaleService'];

function ngLocale($compile, ngLocaleService) {
    
    return {
        restrict: 'AC',
        link: function (scope, element, attrs) {
            
            if (attrs.ngLocale) {
                ngLocaleService.$get(attrs.ngLocale).then(function (response) {
                    element.html(response);
                });
            }
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
                return angular.isDefined(cached[input]) && typeof cached[input].then !== 'function' ?
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
    
    if (!get() || !get().hasOwnProperty('_createDate')) {
        init();
    }
    
    return {
        $get: getLocale,
        $add: addLocale
    };
    
    function getLocale(key) {
        var args = Array.from(arguments);
        var deferred = $q.defer();
        if (!key) {
            deferred.resolve();
            return deferred.promise;
        }
        
        var prefix = ngLocaleConfig.config.prefix ? ngLocaleConfig.config.prefix + '.' : '';
        var data = get();
        if (data) {
            if (args.length > 1) {
                var results = {};
                for (var i = 0, l = args.length; i < l; i++) {
                    results[args[i]] = data[prefix + args[i]];
                }
                deferred.resolve(results);
            } else {
                deferred.resolve(data[prefix + args[0]]);
            }
        } else {
            if (!locale) {
                init();
            }
            locale.then(function (response) {
                if (!response) {
                    deferred.resolve();
                    return deferred.promise;
                }
                
                if (args.length > 1) {
                    var results = {};
                    for (var i = 0, l = args.length; i < l; i++) {
                        results[args[i]] = response.data[prefix + args[i]];
                    }
                    deferred.resolve(results);
                } else {
                    deferred.resolve(response.data[prefix + args[0]]);
                }
            });
        }
        return deferred.promise;
    }
    
    function addLocale(localeObj) {
        var data = get();
        var prefix = ngLocaleConfig.config.prefix ? ngLocaleConfig.config.prefix + '.' : '';
        var newLocaleObj = {};
        for (var key in localeObj) {
            if (localeObj.hasOwnProperty(key)) {
                newLocaleObj[prefix + key] = localeObj[key];
            }
        }
        if (data) {
            set(angular.extend({}, data, newLocaleObj));
        } else {
            init();
            set(newLocaleObj);
        }
    }
    
    function set(val) {
        if (!supported) {
            $log('localStorage not supported, make sure you have the $cookies supported.');
        }
    
        var data = get();
        var newVal = data !== null ? angular.extend({}, data, val) : val;
        
        return $window.localStorage && $window.localStorage.setItem(ngLocaleConfig.config.storageName, angular.toJson(newVal));
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
    
    function init() {
        if (ngLocaleConfig.config.restUrl) {
            locale = $http.get(ngLocaleConfig.config.restUrl).then(function (restRes) {
                if (ngLocaleConfig.config.localUrl) {
                    var data = angular.extend(
                        { _createDate: new Date().getTime() },
                        restRes.data
                    );
                    if (ngLocaleConfig.config.toStore) {
                        set(data);
                    }
                    return { data: data };
                }
                locale = $http.get(ngLocaleConfig.config.localUrl).then(function (localRes) {
                    var data = angular.extend(
                        { _createDate: new Date().getTime() },
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
                    { _createDate: new Date().getTime() },
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
}
