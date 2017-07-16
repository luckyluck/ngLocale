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
