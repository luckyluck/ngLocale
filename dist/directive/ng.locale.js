angular.module('ng.locale')
    .directive('ngLocale', ['ngLocaleService', ngLocale]);

ngLocale.$inject = ['ngLocaleService'];

function ngLocale(ngLocaleService) {
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
