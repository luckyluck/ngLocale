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
