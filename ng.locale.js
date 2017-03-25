;(function () {


    angular
        .module('ng.locale', [])
        .value('ngLocaleLocal', {
            url: null,
            setUrl: function (url) {
                this.url = url;
            }
        })
        .value('ngLocaleRest', {
            url: null,
            setUrl: function (url) {
                this.url = url;
            }
        })
        .value('ngLocaleStorage', {
            isLocalStorage: false,
            setLocalStorage: function (bool) {
                this.isLocalStorage = bool;
            }
        })
        .value('ngLocalePrefix', {
            prefix: null,
            setPrefix: function (prefix) {
                this.prefix = prefix;
            }
        })
        .factory('ngLocaleService', ngLocaleService)
        .directive('ngLocale', ['ngLocaleService', ngLocale])
        .filter('localize', localize);

    ngLocaleService.$inject = ['$http', '$q', 'ngLocaleLocal', 'ngLocaleRest', 'ngLocalePrefix'];

    function ngLocaleService($http, $q, ngLocaleLocal, ngLocaleRest, ngLocalePrefix) {
        var locale;
        if (ngLocaleRest.url) {
            locale = $http.get(ngLocaleRest.url).then(function (restRes) {
                if (ngLocaleLocal.url) {
                    return $http.get(ngLocaleLocal.url).then(function (localRes) {
                        var data = Object.assign({}, localRes.data, restRes.data);
                        return {data: data};
                    });
                } else {
                    return restRes;
                }
            });
        } else if (ngLocaleLocal.url) {
            locale = $http.get(ngLocaleLocal.url);
        } else {
            throw "Can't find locale url's configuration";
        }

        return {
            getLocale: getLocale
        };

        function getLocale(key) {
            var deferred = $q.defer();
            locale.then(function (response) {
                var newKey = ngLocalePrefix.prefix ? ngLocalePrefix.prefix + '.' + key : key;
                deferred.resolve(response ? response.data[newKey] : '');
            });

            return deferred.promise;
        }
    }

    ngLocale.$inject = ['ngLocaleService'];

    function ngLocale(ngLocaleService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                ngLocaleService.getLocale(attrs.ngLocale).then(function (response) {
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
                    ngLocaleService.getLocale(input).then(function (info) {
                        cached[input] = info;
                    });
                }
            }
        }
        detailsFilter.$stateful = true;
        return detailsFilter;
    }

})();
