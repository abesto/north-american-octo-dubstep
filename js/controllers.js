/* global angular */
// rewrite using bacon.js?
(function () {
    "use strict";

    function Measurement(name, description, defaultValue) {
        this.name = name;
        this.description = description;
        this.value = defaultValue;
    }

    function Expression(tooltip, compute) {
        this.tooltip = tooltip;
        this.compute = compute;
    }

    function cmToInch(n) {
        return n / 2.5;
    }

    function toNearestDivisibleBy(n, k) {
        var i;
        n = Math.round(n);
        k = Math.round(k);
        for (i = 0; i < n; i++) {
            if ((n + i) % k === 0) {
                return n + i;
            } else if ((n - i) % k === 0) {
                return n - i;
            }
        }
    }

    // TODO: name
    var app = angular.module("naod.controllers", []);

    app.controller("MainController", function ($scope) {
        var i, sweaterSizeMeasurements = "abcdefghjk",
            sweaterSizeDefaultsCm = [47, 40, 47, 32, 43.5, 10, 15, 50, 30, 20],
            sweaterSizeNames = [
                "The width of the cast-on edge, laid flat",
                "The width of the torso at the NARROWEST point (the waist)",
                "The width of the sweater from armpit to armpit. (the chest)",
                "The length from the cast on edge to the narrowest part of the torso (the waist)",
                "The length of the torso, from cast on edge to armpit.",
                "F", "G", "H", "J", "K"
            ];
        for (i = 0; i < sweaterSizeMeasurements.length; i++) {
            var name = sweaterSizeMeasurements[i];
            $scope[name] = new Measurement(name.toUpperCase(), sweaterSizeNames[i], cmToInch(sweaterSizeDefaultsCm[i]));
        }

        $scope.x = new Measurement("X", "Stitches in 4 inches", 30);
        $scope.y = new Measurement("Y", "Rows in 4 inches", 30);
        $scope.repeat = new Measurement("Repeat", "Stitches repeat in the border treatment", 6);
        $scope.lesson3_hem = new Measurement("Bottom hem", "Length of the bottom hem", 1);

        $scope.s = new Expression("Stitches in an inch (X / 4)", function () { return $scope.x.value / 4; });
        $scope.r = new Expression("Rows in an inch (Y / 4)", function () { return $scope.y.value / 4; });
        $scope.a2 = new Expression("A * 2", function () { return $scope.a.value * 2; });
        $scope.b2 = new Expression("B * 2", function () { return $scope.b.value * 2; });
        $scope.c2 = new Expression("C * 2", function () { return $scope.c.value * 2; });
        $scope.a2s = new Expression("A * 2 * S", function () { return $scope.a.value * 2 * $scope.s.compute(); });
        $scope.a2sr = new Expression("A * 2 * S rounded to a whole number", function () { return Math.round($scope.a2s.compute()); });
        $scope.cast = new Expression("Cast number", function () {
            return toNearestDivisibleBy($scope.a2sr.compute(), $scope.repeat.value);
        });
        $scope.a2_b2 = new Expression("inches to DECREASE from hem to waist", function () {
            return $scope.a2.compute() - $scope.b2.compute();
        });
        $scope.c2_b2 = new Expression("inches to INCREASE from waist to armpit", function () {
            return $scope.c2.compute() - $scope.b2.compute();
        });
        $scope.stitches_increase_hem_to_waist = new Expression("stitches to DECREASE from hem to waist", function () {
            return toNearestDivisibleBy($scope.a2_b2.compute() * $scope.s.compute(), 4);
        });
        $scope.stitches_decrease_hem_to_waist = new Expression("stitches to INCREASE from hem to waist", function () {
            return toNearestDivisibleBy($scope.c2_b2.compute() * $scope.s.compute(), 4);
        });
        $scope.decrease_rounds_hem_to_waist = new Expression("DECREASE rounds between hem and waist (1)", function () {
            return $scope.stitches_decrease_hem_to_waist.compute() / 4;
        });
        $scope.increase_rounds_hem_to_waist = new Expression("INCREASE rounds between waist and armpit (2)", function () {
            return $scope.stitches_increase_hem_to_waist.compute() / 4;
        });
        $scope.d_hem = new Expression("D - Hem", function () {
            return $scope.d.value - $scope.lesson3_hem.value;
        });
        $scope.rows_to_waist = new Expression("Rows to waist", function () {
            return $scope.r.compute() * $scope.d_hem.compute();
        });
        $scope.rounds_to_waist = new Expression("Rounds to waist", function () {
            return toNearestDivisibleBy($scope.rows_to_waist.compute(), $scope.decrease_rounds_hem_to_waist.compute());
        });
        $scope.lesson3_3 = new Expression("(3)", function () {
            return $scope.rounds_to_waist.compute() / $scope.decrease_rounds_hem_to_waist.compute();
        });
        $scope.plain_rounds_between_decrease = new Expression("Plain rounds between decrease rounds", function () {
            return $scope.lesson3_3.compute() - 1;
        });
        $scope.e_d = new Expression("E - D", function () { return $scope.e.value - $scope.d.value; });
        $scope.rounds_waist_to_armpit_raw = new Expression("R * (E - D)", function () {
            return $scope.e_d.compute() * $scope.r.compute();
        });
        $scope.rounds_waist_to_armpit = new Expression("Rounds from waist to armpit", function () {
            return toNearestDivisibleBy(
                $scope.rounds_waist_to_armpit_raw.compute(),
                $scope.increase_rounds_hem_to_waist.compute()
            );
        });
        $scope.lesson3_4 = new Expression("(4)", function () {
            return $scope.rounds_waist_to_armpit.compute() / $scope.increase_rounds_hem_to_waist.compute();
        });
        $scope.plain_rounds_between_increase = new Expression("Plain rounds between increase rounds", function () {
           return $scope.lesson3_4.compute() - 1;
        });
    });
}());
