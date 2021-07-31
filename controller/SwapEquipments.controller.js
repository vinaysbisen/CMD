jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/export/Spreadsheet",
], function (Controller, Spreadsheet) {
	"use strict";

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.SwapEquipments", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.SwapEquipments
		 */
		onInit: function () {

			this._updateLog = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.UpdateLog",
				this
			);
			this.getView().addDependent(this._updateLog);
		},
		onPressSwapEquipment: function () {
			// //BOC By Aniket LR1
			var oSmartTable = this.getView().byId("idSmartEquip");
			var requestBody = {
				CONTRACT: "",
				to_equipments: [],
				to_messages: []
			};

			var oTable = this.getView().byId("idTableSwap");
			var items = oTable.getSelectedItems();
			var equipments = [];
			if (items.length > 0) {
				items.forEach(function (val, index) {
					equipments.push(items[index].getBindingContext().getObject());
				});
				requestBody.to_equipments = equipments;

				var controller = this;
				var oModel = this.getOwnerComponent().getModel();
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var path = "/Ets_EquipmentSwap";
				oModel.create(path,
					requestBody, {
						success: function (data, response) {
							oGlobalBusyDialog.close();
							controller.updateLogData = data.to_messages.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog.setModel(oModel1);
							oSmartTable.rebindTable();
							if (data.to_messages.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(data.to_messages.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(7);
							}
							controller._updateLog.open();

						},
						error: function (error) {
							oGlobalBusyDialog.close();
							sap.m.MessageBox.show(
								error.statusText, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Service Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
					});

			} else {
				sap.m.MessageBox.error("Please select atleast one record to proceed.");
			}
		},
		onUpdateLogClose: function (oEvent) {
			this._updateLog.close();
		},
		onExportUpdateLog: function (oEvent) {
			var oTable = sap.ui.getCore().byId("id_cmd_updateLog");

			var aCols = [{
				label: "Document",
				property: "VBELN",
				type: "string"
			}, {
				label: "Type",
				property: "Message_Type",
				type: "string"
			}, {
				label: "Message",
				property: "Message_Text",
				type: "string"
			}, ];

			var oSettings, oSheet;

			var dataSource = oTable.getModel().getData();

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: dataSource
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.SwapEquipments
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.SwapEquipments
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.SwapEquipments
		 */
		//	onExit: function() {
		//
		//	}

	});

});