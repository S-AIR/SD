/*global QUnit*/

sap.ui.define([
	"sync6cl1/occu_by_flightid/controller/OccurateByFlightId.controller"
], function (Controller) {
	"use strict";

	QUnit.module("OccurateByFlightId Controller");

	QUnit.test("I should test the OccurateByFlightId controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
