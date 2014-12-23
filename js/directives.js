/* global angular */
(function () {
    "use strict";

    function generateDirective(templateName) {
        return function () {
            return {
                scope: {
                    name: "@",
                    ngModel: "=name"
                },
                templateUrl: "templates/" + templateName + ".html"
            };
        };
    }

    // TODO: name
    angular.module("naod.directives", [])
        .directive("expression", generateDirective("expression"))
        .directive("gaugeInput", generateDirective("gauge-input"))
        .directive("gauge", generateDirective("gauge"))
        .directive("measurement", generateDirective("measurement"))
        .directive("measurementInput", generateDirective("measurement-input"));
}());
