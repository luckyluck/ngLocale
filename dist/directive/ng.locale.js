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
