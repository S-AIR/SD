/*global QUnit*/

sap.ui.define([
	"sync6cl1/seat-occupancy/controller/StatusSet.controller"
], function (Controller) {
	"use strict";

	QUnit.module("StatusSet Controller");

	QUnit.test("I should test the StatusSet controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
