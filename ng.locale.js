;(function () {


    angular
        .module('ng.locale', [])
        .factory('ngLocaleService', ngLocaleService)
        .directive('ngLocale', ['ngLocaleService', ngLocale])
        .filter('localize', localize);

    ngLocaleService.$inject = ['$http', '$q'];

    function ngLocaleService($http, $q) {
        var url = 'http://localhost:3004/locale';
        var locale = $http.get(url);

        return {
            getLocale: getLocale
        };

        function getLocale(key) {
            var deferred = $q.defer();
            locale.then(function (response) {
                deferred.resolve(response ? response.data[key] : '');
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
            // console.log('details for', input);
            if (input) {
                if (input in cached) {
                    // avoid returning a promise!
                    return typeof cached[input].then !== 'function' ?
                        cached[input] : undefined;
                } else {
                    ngLocaleService.getLocale(input).then(function (info) {
                        cached[input] = info;
                        // console.log('generated result for', info);
                    });
                }
            }
        }
        detailsFilter.$stateful = true;
        return detailsFilter;
    }

})();
