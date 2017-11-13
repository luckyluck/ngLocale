angular.module('ng.locale')
    .factory('ngLocaleService', ngLocaleService);

ngLocaleService.$inject = ['$http', '$q', '$window', '$log', 'ngLocaleConfig'];

function ngLocaleService($http, $q, $window, $log, ngLocaleConfig) {

    var locale;
    var supported = !(angular.isUndefined(window.localStorage) || angular.isUndefined(window.JSON));

    if (!get()) {
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
            set(newLocaleObj);
        }
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
