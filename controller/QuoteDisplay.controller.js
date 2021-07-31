sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/m/Tokenizer",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/export/Spreadsheet",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/TreeJSONStructure",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/formatter"
], function (Controller, JSONModel, MessageToast, Token, Tokenizer, Filter, FilterOperator, Spreadsheet, TreeJSONStructure, formatter) {
	"use strict";

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.QuoteDisplay", {
		_formatter: formatter,
		_JSONStructure: TreeJSONStructure,
		onInit: function () {
			this.customerDetails = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.CustomerDetails",
				this
			);
			this.getView().addDependent(this.customerDetails);
			//this._getContractDetails();
			
			this.oViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oViewModel, "viewData");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
			var odataModel = this.getOwnerComponent().getModel();
			this.getView().byId("id_q_zcontract_db_items").setModel(odataModel);
		},
			onBfrBindTblCrItm: function(oEvent){
			
			 var mBindingParams = oEvent.getParameter("bindingParams");
            if (!mBindingParams.filters.length){
               mBindingParams.filters.push(new Filter(this.filterForTabl));
           }
          
		},
		onPressAttachment: function (oEvent) {
			var array = oEvent.getSource().getParent().getBindingContext().getPath().split("/");
			var index = array[array.length - 1];
			//var row = this.getView().getModel().getData().to_attachments.results[index];
			var row = this.getView().byId("id_q_zcontract_db_attachments").getModel().getData()[index];

			var queryString = "(CONTREP='" + row.CONTREP + "'," +
				"BDS_DOCID='" + row.BDS_DOCID + "'," +
				"TITLE='" + row.Title + "'," +
				"DOCUCLASS='" + row.DOCUCLASS + "')/$value";
			var sPath = "/sap/opu/odata/sap/ZSA_GW_CONTRACT_DB_SRV/Ets_File" + queryString;
			this.myWindow = window.open(sPath, "_blank");

		},
		handleObjectIDPress: function (oEvent) {
			var oButton = oEvent.getSource();
			var controller = this.controller;

			var data = {};
			//data.title = this.Partner;
			data.title = this.title;
			data.Partner = this.Partner;
			if (this.Partner === "") {
				data.visible = false;
			} else {
				data.visible = true;
			}
			data.Customer = this.Customer;
			data.Partner = this.Partner;
			data.Name1 = this.Name1;
			data.Name2 = this.Name2;
			data.Name3 = this.Name3;
			data.Name4 = this.Name4;
			data.Street = this.Street;
			data.City = this.City;
			data.Region = this.Region;
			data.PostalCode = this.PostalCode;
			data.Country = this.Country;
			data.Email = this.Email;
			data.Phone = this.Phone;
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);
			controller.customerDetails.setModel(oModel);
			jQuery.sap.delayedCall(
				0,
				controller,
				function () {
					controller.customerDetails.openBy(oButton);
				}
			);
		},
		onSoldToPress: function (event) {
			var oButton = event.getSource();
			this.customerDetails.setModel(this.SoldToModel);
			jQuery.sap.delayedCall(
				0,
				this,
				function () {
					this.customerDetails.openBy(oButton);
				}
			);
		},
		_handleRouteMatched: function (event) {
			
			var oparameters = event.getParameter("name");
			if (oparameters !== "ContractDisplay" && oparameters !== "QuoteDisplay") {
				return;
			} else {
				//Set Title
				this.getOwnerComponent().getService("ShellUIService").then( // promise is returned
					function (oService) {					
						/*var sTitle = that.getView().getModel("i18n").getResourceBundle().getText("appTitle");*/
						oService.setTitle("Display Quote");
					},
					function (oError) {
						/*jQuery.sap.log.error("Cannot get ShellUIService", oError, "XXXXXXXXX.hr.MyTimesheet");*/
					}
				);
				//var ocontract = event.getParameter("Contract");
				var ocontract = event.getParameter("arguments").Contract;
				
				if(ocontract === undefined){
					ocontract = event.getParameter("arguments").Quote;
				}
				//begin of test call
				var f = [];
				var sFilterArray = [];
				sFilterArray.push(new Filter({
					path: "Contract",
					operator: FilterOperator.EQ,
					value1: ocontract
				}));
					// ++VS variant managment
				this.filterForTabl = sFilterArray;
				var sFF = new Filter({
					filters: sFilterArray,
					and: true
				});
				//++ VS SRE2483 
				this.getView().byId("ST_q_quote_items").rebindTable();
				f.push(sFF);
				//var component = this.getOwnerComponent();
				var path = "/Ets_ContractHeader";
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				var controller = this;
				oGlobalBusyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				//var expand = "to_items,to_partners,to_attachments,to_relatedSO";
				//var expand = "to_items,to_attachments";
				var expand = "to_items";
				oModel.read(
					path, {
						urlParameters: {
							"$format": "json",
							"$expand": "to_items,to_partners,to_attachments,to_relatedSO"
						},
						//filters: f,
						filters: [new Filter(f, true)],
						success: function (data, response) {
							oGlobalBusyDialog.close();
							/*var oModel1 = new sap.ui.model.json.JSONModel();
							oModel1.setData(data.results[0]);*/
							controller.getView().getModel("viewData").setProperty("/", data.results[0]);
							//controller.getView().setModel(oModel1);
							if (data.results[0].to_items.results.length <= 10) {
								controller.getView().byId("id_q_zcontract_db_items").setVisibleRowCount(data.results[0].to_items.results.length);
							} else {
								controller.getView().byId("id_q_zcontract_db_items").setVisibleRowCount(10);
							}

							if (data.results[0].to_relatedSO.results.length <= 10) {
								controller.getView().byId("id_q_zcontract_db_relatedSO").setVisibleRowCount(data.results[0].to_relatedSO.results.length);
							} else {
								controller.getView().byId("id_q_zcontract_db_relatedSO").setVisibleRowCount(10);
							}

							//Related Sales Documents Tree
							var results = data.results[0].to_relatedSO.results;
							var navResults = [];
							if (results.length > 0) {
								navResults = controller._JSONStructure._createD3Data_ContractDisplay(results);
							}
							var oTreeTable = controller.getView().byId("id_q_zcontract_db_relatedSO");
							var oModelJson = new sap.ui.model.json.JSONModel();
							oModelJson.setData(navResults);
							oTreeTable.setModel(oModelJson);
							oTreeTable.bindRows({
								path: "/",
								parameters: {
									arrayNames: ['children']

								}
							});
							oTreeTable.setFixedColumnCount(1); // Freeze first column
							oTreeTable.expandToLevel(10);

							//handle Items Table
							var navResults_items = data.results[0].to_items.results;
							var oModelJson_items = new sap.ui.model.json.JSONModel();
							oModelJson_items.setData(navResults_items);
							// var itemsTable = controller.getView().byId("id_q_zcontract_db_items");
							// itemsTable.setModel(oModelJson_items);
							// itemsTable.bindRows({
							// 	path: "/"
							// });
							
							//Handle Attachments table
							var navResults_attachments = data.results[0].to_attachments.results;
							var oModelJson_attachments = new sap.ui.model.json.JSONModel();
							oModelJson_attachments.setData(navResults_attachments);
							var attachmentsTable = controller.getView().byId("id_q_zcontract_db_attachments");
							attachmentsTable.setModel(oModelJson_attachments);
							attachmentsTable.bindRows({
								path: "/"
							});
							
							if (data.results[0].to_attachments.results.length <= 2) {
								controller.getView().byId("id_q_zcontract_db_attachments").setVisibleRowCount(2);
							} else {
								controller.getView().byId("id_q_zcontract_db_attachments").setVisibleRowCount("Auto");
							}

							if (data.results[0].to_items.results.length <= 2) {
								controller.getView().byId("id_q_zcontract_db_items").setVisibleRowCount(2);
							} else {
								controller.getView().byId("id_q_zcontract_db_items").setVisibleRowCount("Auto");
							}
							controller.addPartners(data.results[0].to_partners.results);
							var partners = data.results[0].to_partners.results;
							for (var i = 0; i < partners.length; i++) {
								if (partners[i].Partner_Function === "AG") {
									var data1 = {};
									data1.title = partners[i].Partner_Function_Desc;
									data1.Partner = partners[i].Partner;
									data1.Name = partners[i].Name1;
									data1.Customer = partners[i].Customer;
									data1.Partner = partners[i].Partner;
									data1.Name1 = partners[i].Name1;
									data1.Name2 = partners[i].Name2;
									data1.Name3 = partners[i].Name3;
									data1.Name4 = partners[i].Name4;
									data1.Street = partners[i].Street;
									data1.City = partners[i].City;
									data1.Region = partners[i].Region;
									data1.PostalCode = partners[i].PostalCode;
									data1.Country = partners[i].Country;
									data1.Email = partners[i].Email;
									data1.Phone = partners[i].Phone;
									//data.title = this.Partner;
									/*data1.title = partners[i].Partner_Function_Desc;
									data1.Partner = partners[i].Partner;
									if(partners[i].Partner === ""){
										data1.visible = false;
									}
									else{
										data1.visible = true;
									}
									data1.Name = partners[i].Name;
									data1.Email = partners[i].Email;
									data1.Phone = partners[i].Telephone;*/
									var oSoldToModel = new sap.ui.model.json.JSONModel();
									oSoldToModel.setData(data1);
									controller.SoldToModel = oSoldToModel;
									break;
								}
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

				//end of test call
			}
		},
		addPartners: function (partners) {
			this.partners = partners;
			var partnersContent = this.getView().byId("id_q_zcontract_db_partners_hbox");
			partnersContent.destroyItems();
			var controller = this;
			for (var i = 0; i < partners.length; i++) {
				var Partner = new sap.m.VBox();
				var name = new sap.m.Link({
					text: partners[i].Name1
				});
				var obj = {};
				obj.controller = controller;
				obj.title = partners[i].Partner_Function_Desc;
				obj.Partner = partners[i].Partner;
				obj.Name = partners[i].Name1;
				obj.Customer = partners[i].Customer;
				obj.Partner = partners[i].Partner;
				obj.Name1 = partners[i].Name1;
				obj.Name2 = partners[i].Name2;
				obj.Name3 = partners[i].Name3;
				obj.Name4 = partners[i].Name4;
				obj.Street = partners[i].Street;
				obj.City = partners[i].City;
				obj.Region = partners[i].Region;
				obj.PostalCode = partners[i].PostalCode;
				obj.Country = partners[i].Country;
				obj.Email = partners[i].Email;
				obj.Phone = partners[i].Phone;

				name.attachPress(controller.handleObjectIDPress, obj);
				name.addStyleClass("zcontract_db_partners_link");
				name.setWrapping(true);
				var partner_function = new sap.m.Label({
					text: partners[i].Partner_Function_Desc
				});
				Partner.addItem(name);
				Partner.addItem(partner_function);
				Partner.addStyleClass("zcontract_db_partners_vBox");
				//Partner.addStyleClass("zcontract_db_display_general_info");
				Partner.addStyleClass("zcontract_db_wrap");
				partnersContent.addItem(Partner);
			}
		},
		//on attachement selection
		onItemSelectionOutputAndAttachments: function () {
			var oModel = this.getModel("viewData");
			var outputAndAttachments = this.getView().byId("idOutputAndAttachments");
			var selectedAttachment = [];
			selectedAttachment = outputAndAttachments.getSelectedContextPaths();

			var oPathDetails = oModel.getProperty(selectedAttachment[0]);
			var attachmentSelected = oPathDetails.DOCUMENT_NO;
			oModel.setProperty("/AttachmentSelected", attachmentSelected);
			this.getView().byId("idAttachmentSave").setEnabled(true);
			this.getView().byId("idAttachmentCancel").setEnabled(true);

		},

		//handle save of attachment
		handleAttachmentSave: function () {

		},

		//get contract details
		_getContractDetails: function () {
			var oModel = this.getModel("viewData");

			oModel.setProperty("/ContractDetails", []);
			var contractNumber = oModel.getProperty("/DocumentSelected");

			this.getView().setBusy(true);
			var f = [];

			// Set the filter if any

			f.push(new sap.ui.model.Filter("Date", "EQ", contractNumber));

			var oServiceModel = this._getODataModel();

			var sPath = "/ContractDetails";

			var mParameters = {
				method: "GET",
				filters: f,
				success: jQuery.proxy(function (oData) {
					this.getView().setBusy(false);
					this.getView().getModel("viewData").setProperty("/ContractDetails", oData.results);
					this.getModel().refresh(true);

				}, this),

				error: jQuery.proxy(function (oError) {
					this.getView().setBusy(false);
					MessageToast.show(oError.responseText);
				}, this)
			};

			oServiceModel.read(sPath, mParameters);
		},

		//get oData model
		_getODataModel: function () {
			return this.getOwnerComponent().getModel();
		},

		//nav back to main screen
		onNavBack: function () {

			this.getOwnerComponent().fromView = "ContractDisplay";
			this.oRouter.navTo("Results");
			//history.go(-1);
		}
	});
});