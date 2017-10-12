angular.module('ng.locale')
    .directive('ngLocale', ['$compile', 'ngLocaleService', ngLocale]);

ngLocale.$inject = ['$compile', 'ngLocaleService'];

function ngLocale($compile, ngLocaleService) {
    return {
        restrict: 'AC',
        /*link: function (scope, element, attrs) {
            
            // if (attrs.ngLocale) {
            //     ngLocaleService.$get(attrs.ngLocale).then(function (response) {
            //         element.textContent = stringify(response);
            //     });
            // }
    
            scope.$watch(attr.ngLocale, function ngLocaleWatchAction(value) {
                ngLocaleService.$get(value).then(function (response) {
                    element.textContent = stringify(response);
                });
            });
        }*/
        compile: function ngLocaleCompile(templateElement) {
            $compile.$$addBindingClass(templateElement);
            return function ngLocaleLink(scope, element, attr) {
                $compile.$$addBindingInfo(element, attr.ngLocale);
                element = element[0];
                scope.$watch(attr.ngLocale, function ngBindWatchAction(value) {
                    ngLocaleService.$get(value).then(function (response) {
                        element.textContent = stringify(response);
                    });
                });
            };
        }
    };
}
