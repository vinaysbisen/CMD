sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
				// <!--BOC for INC0302094 14 April 2021 ++VSINGH39 Putting property min date to current date-->
			this.getModel("dateModel").setProperty("/presentDate",new Date());
		}
	});
});