jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Token",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/AnnotationHelper"
], function (Controller, JSONModel, Token, Spreadsheet, Filter, FilterOperator, BindingMode, ODataModel, AnnotationHelper) {
	"use strict";

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.MoveEquipmentToFLOC", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.MoveEquipmentToFLOC
		 */
		onInit: function () {
			this.oViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oViewModel, "viewData");
			
			this.getView().getModel("viewData").setProperty("/SelectedEquipments", []);
			
			this.FilterBarids = [
				"id_fb_move_equip",
				"id_fb_move_equip_floc"
			];
			var _vController = this;
			var id = _vController.FilterBarids;
			for (var i = 0; i < id.length; i++) {
				var fb = _vController.getView().byId(id[i]);
				fb.setUseToolbar(false);
				fb._oFiltersButton.setVisible(false);
			}
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
		},
		_handleRouteMatched: function (event) {
			
			var equipment = event.getParameter("arguments").Equipment;
			var equipments = equipment.split(",");
			var dataUp = [];
			for(var i = 0; i < equipments.length; i++){
				var obj = {};
				obj.EQUNR = equipments[i];
				dataUp.push(obj);
			}
			if(dataUp.length > 0){
				//sap.m.MessageToast.show("Equipments Selected From Previous Screen..!!");
				var fromPrevScreen = "X";
				this.validateUploadEquipments(dataUp, fromPrevScreen);
			}
		},
		onAfterRendering: function () {

			// Get reference to SmartFilterBar
			/*var oSmartFilter = this.getView().byId("id_fb_move_equip");
			var controller = this;
			//Create JSON data to be defaulted
			var filter = new sap.ui.model.Filter({
							path: "EQUNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: controller.oEquipment
						});

			//Default the Global filter values
			oSmartFilter.setFilterData(filter);*/
		},
		onPressShowSelectedEquipments: function(oevent){
			var length = this.getView().getModel("viewData").getData().SelectedEquipments.length;
			if (!this._oDialogEquipments) {
				this._oDialogEquipments = new sap.m.Dialog({
					title: "Selected Equipments (" + length + ")",
					icon: "sap-icon://complete",
					content: new sap.m.List({
						items: {
							path: 'viewData>/SelectedEquipments',
							template: new sap.m.StandardListItem({
								title: "{viewData>EQUNR}"
							})
						}
					}),
					beginButton: new sap.m.Button({
						text: 'Close',
						press: function () {
							this._oDialogEquipments.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this._oDialogEquipments);
			}
			this._oDialogEquipments.setTitle("Selected Equipments ("+length+")");
			this._oDialogEquipments.open();
		},
		onSelectEquipments: function(){
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "FromCSV",
				operator: FilterOperator.EQ,
				value1: ""
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var controller = this;
			var smartFilterBar = this.getView().byId("id_fb_move_equip");
			if (smartFilterBar.getFilterData() !== null) {
				if (smartFilterBar.getFilterData()["EQUNR"] !== undefined) {
					var items = smartFilterBar.getFilterData()["EQUNR"].items;
					var ranges = smartFilterBar.getFilterData()["EQUNR"].ranges;
					var mFilterArray = [];
					//--Handle Range
					if (ranges.length === 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("EQUNR", elem.operation, elem.value1, elem.value2));
						});
						var mFF3 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF3);
						mFilterArray = [];

					} else if (ranges.length > 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("EQUNR", elem.operation, elem.value1, elem.value2));
						});
						var mFF4 = new Filter({
							filters: mFilterArray,
							and: false
						});
						f.push(mFF4);
						mFilterArray = [];
					}
					//--Handle Items
					if (items.length === 1) {
						items.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("EQUNR", "EQ", elem.key));
						});
						var mFF1 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF1);
						mFilterArray = [];

					} else if (items.length > 1) {
						items.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("EQUNR", "EQ", elem.key));
						});
						var mFF = new Filter({
							filters: mFilterArray,
							and: false
						});
						f.push(mFF);
						mFilterArray = [];
					}

					var path = "/Ets_EquipmentsUpload";
					var oModel = this.getOwnerComponent().getModel();
					oModel.read(
						path, {
							urlParameters: {
								"$format": "json"
							},
							filters: [new Filter(f, true)],
							success: function (data, response) {
								//oGlobalBusyDialog.close();
								if (data.results.length === 0) {
									sap.m.MessageToast.show("No Records Found!");
								}
								var errorTab = [];
								var resultFinal = [];
								for (var j = 0; j < data.results.length; j++) {
									var obj = {};
									if (data.results[j].Message_Type === "E") {
										var error = {};
										error.EQUNR = data.results[j].EQUNR;
										error.Message = data.results[j].Message;
										errorTab.push(error);

									} else {
										obj.EQUNR = data.results[j].EQUNR.trim();
										resultFinal.push(obj);
									}
								}
								if (errorTab.length > 0) {
									controller.getView().getModel("viewData").setProperty("/errorTab", errorTab);
									if (!controller._oDialogError) {
										controller._oDialogError = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importError", controller);
										controller.getView().addDependent(controller._oDialogError);
									}
									controller._oDialogError.open();
								}
								if (resultFinal.length > 0) {
									controller.getView().getModel("viewData").setProperty("/SelectedEquipments", resultFinal);
									controller.getView().byId("id_move_e_list").setText("Show Selected Equipments (" + resultFinal.length + ")");
									controller.getView().byId("id_move_e_list").setEnabled(true);
								}

							},
							error: function (error) {
								//oGlobalBusyDialog.close();
								sap.m.MessageBox.show(
									error.statusText, {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Service Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							}
						});
				} else {
					controller.getView().byId("id_move_e_list").setText("Show Selected Equipments (0)");
					controller.getView().byId("id_move_e_list").setEnabled(false);
				}
			} else {
				controller.getView().byId("id_move_e_list").setText("Show Selected Equipments (0)");
				controller.getView().byId("id_move_e_list").setEnabled(false);
			}
		},
		onEquipmentsImport: function(){
			if (!this._oDialogImportEquipments) {
				this._oDialogImportEquipments = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importEquipmentsExcel", this);
				this.getView().addDependent(this._oDialogImportEquipments);
			}

			this._oDialogImportEquipments.open();	
		},
		onUploadFragEquipments: function (e, validateUploadEquipments) {
			var smartFilterBar = this.getView().byId("id_fb_move_equip");
			smartFilterBar.clear();
			var fU = sap.ui.getCore().byId("idfileUploaderEquipments");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];

			// Create a File Reader object
			var reader = new FileReader();
			var t = this;

			reader.onload = function (ev) {
				var strCSV = ev.target.result;
				var arrCSV = strCSV.split(new RegExp([',', '\n'].join('|'), 'g'));
				var noOfCols = 1;
				arrCSV.pop();

				// To ignore the first row which is header
				//var hdrRow = arrCSV.splice(0, noOfCols);

				var dataUp = [];
				while (arrCSV.length > 0) {
					var obj = {};
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols);
					for (var i = 0; i < row.length; i++) {
						var property = "";
						if (i === 0) {
							property = "EQUNR";
						}
						obj[property] = row[i].trim();
					}
					// push row to an array
					dataUp.push(obj);
				}
				t.validateUploadEquipments(dataUp);
				//t.getView().byId("id_zcontract_db_tbl_al").getModel().setData(dataUp);
				t._oDialogImportEquipments.close();
				fU.clear();
			};
			reader.readAsBinaryString(file);
		},
		onPressMoveEquipment: function(oevent){
			var equipments = this.getView().getModel("viewData").getProperty("/SelectedEquipments");
			var smartFilterBar = this.getView().byId("id_fb_move_equip_floc");
			var tplnr = smartFilterBar.getFilterData()["TPLNR"];
			if(tplnr === "" || tplnr === undefined){
				sap.m.MessageBox.show(
							"Enter Target Functional Location To Proceed..!!", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
			}
			else if(equipments.length === 0){
				sap.m.MessageBox.show(
							"Select Equipments To Be Moved..!!", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK]
							});	
			}else{
				var post_data = [];
				for(var i=0;i<equipments.length; i++){
					var obj = {};
					obj.Msg = "";
					obj.OldFl = "";
					obj.NewFl = tplnr;
					obj.Equipnum = equipments[i].EQUNR;
					post_data.push(obj);
				}
				var requestBody = {d: {
					"POST": "X",
					"POST_EQUIP_NAV": post_data
				}};
				
				var controller = this;
			var oModel = this.getOwnerComponent().getModel();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Post_Swap";
			oModel.create(path,
				requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						controller.getView().getModel("viewData").setProperty("/errorTab_equi_upload", data.POST_EQUIP_NAV.results);
						var oModelJson = new sap.ui.model.json.JSONModel();
						var oData = data.POST_EQUIP_NAV.results;
						oModelJson.setData(oData);
						if (!controller._oDialogError_equi_upload) {
							controller._oDialogError_equi_upload = new sap.m.TableSelectDialog({
								title: "Update Status",
								icon: "sap-icon://information",
								columns: [
									new sap.m.Column({
										header: new sap.m.Label({
											text: "Equipment"
										})
									}),
									new sap.m.Column({
										header: new sap.m.Label({
											text: "Message"
										})
									})
								],
								items: {
									path: 'viewData>/errorTab_equi_upload',
									template: new sap.m.ColumnListItem({
										cells: [
											new sap.m.Text({
												text: "{viewData>Equipnum}"
											}),
											new sap.m.Text({
												text: "{viewData>Msg}"
											})
										]
									})
								},
								endButton: new sap.m.Button({
									text: 'Close',
									press: function () {
										controller._oDialogError_equi_upload.close();
									}.bind(controller)
								})
							});

							//to get access to the global model
							controller.getView().addDependent(controller._oDialogError_equi_upload);
						}

						controller._oDialogError_equi_upload.setModel(oModelJson);
						controller._oDialogError_equi_upload.open();
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
				
			}
		},
		//close upload fragment page1		
		onCancelFragEquipments: function (eve) {
			var fU = sap.ui.getCore().byId("idfileUploaderEquipments");
			fU.clear();
			this._oDialogImportEquipments.close();

		},
		validateUploadEquipments: function (data, fromPrevScreen) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "FromCSV",
				operator: FilterOperator.EQ,
				value1: "X"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var mFilterArray = [];
			for (var i = 0; i < data.length; i++) {
				mFilterArray.push(new sap.ui.model.Filter("EQUNR", "EQ", data[i].EQUNR));
			}
			var mFF = new Filter({
				filters: mFilterArray,
				and: false
			});
			f.push(mFF);
			var controller = this;
			var path = "/Ets_EquipmentsUpload";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: [new Filter(f, true)],
					success: function (data1, response) {
						oGlobalBusyDialog.close();
						if (data1.results.length === 0) {
							sap.m.MessageToast.show("No Records Found!");
						}
						var errorTab = [];
						var resultFinal = [];
						for (var j = 0; j < data1.results.length; j++) {
							var obj = {};
							if (data1.results[j].Message_Type === "E") {
								var error = {};
								error.EQUNR = data1.results[j].EQUNR;
								error.Message = data1.results[j].Message;
								errorTab.push(error);

							} else {
								obj.EQUNR = data1.results[j].EQUNR.trim();
								resultFinal.push(obj);
							}
						}
						if(resultFinal.length > 0 && fromPrevScreen === "X"){
							sap.m.MessageBox.show(
							resultFinal.length + " Selected From Previous Screen...!!", {
								icon: sap.m.MessageBox.Icon.INFORMATION,
								title: "Selected Equipments",
								actions: [sap.m.MessageBox.Action.OK]
							});
						}
						if (errorTab.length > 0) {
							controller.getView().getModel("viewData").setProperty("/errorTab", errorTab);
							if (!controller._oDialogError) {
								controller._oDialogError = new sap.m.Dialog({
									title: "Invalid Equipments (" + errorTab.length + ")",
									icon: "sap-icon://error",
									content: new sap.m.List({
										items: {
											path: 'viewData>/errorTab',
											template: new sap.m.StandardListItem({
												title: "{viewData>EQUNR}"
											})
										}
									}),
									beginButton: new sap.m.Button({
										text: 'Close',
										press: function () {
											controller._oDialogError.close();
										}.bind(controller)
									})
								});

								//to get access to the global model
								controller.getView().addDependent(controller._oDialogError);
							}
							controller._oDialogError.open();
						}
						if (resultFinal.length > 0) {
							controller.getView().getModel("viewData").setProperty("/SelectedEquipments", resultFinal);
							controller.getView().byId("id_move_e_list").setText("Show Selected Equipments (" + resultFinal.length + ")");
							controller.getView().byId("id_move_e_list").setEnabled(true);
						}

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

		}
	});

});