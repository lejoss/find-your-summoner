/**
 * Created by lejoss on 15/10/15.
 */
(function() {
    'use strict'

    angular
        .module('league-finder')
        .directive('userEnter', userEnter);

    userEnter.$inject = [];

    function userEnter() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.bind("keypress", function(event) {
                    if(event.which === 13) {
                        scope.$eval(attrs.userEnter);
                        event.preventDefault();
                    }
                })
            }
        }
    }
})();