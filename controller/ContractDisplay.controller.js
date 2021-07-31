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

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.ContractDisplay", {
		_formatter: formatter,
		_JSONStructure: TreeJSONStructure,
		onInit: function () {
			this.customerDetails = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.CustomerDetails",
				this
			);
			this.getView().addDependent(this.customerDetails);
			//this._getContractDetails();
			this.item_partners = "";
			this.oViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oViewModel, "viewData");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
/******** Comment Begin SRE2483 ++VS***********/
			// var oTable = this.getView().byId("id_zcontract_db_items");
			// this._oTableColumns = oTable.getColumns(); //used for re-ordering later
/************ Comment End *****************/			
			this.settings = {
				"ColumnCollection": [],
				"SortItems": [],
				"FilterItems": []
			};

			var oJSONModel = new sap.ui.model.json.JSONModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);
			var oDataModel = this.getOwnerComponent().getModel();
			this.getView().byId("ST_Contract_items").setModel(oDataModel);
			oView.setModel(new JSONModel({
				globalFilter: "",
				availabilityFilterOn: false,
				cellFilterOn: false
			}), "ui");

			this._oGlobalFilter = null;
		},
		
/*****  SRE 2483 ++VS BOC *******/	

		onBfrBindTblCrItm: function(oEvent){
			// oEvent.getSource().setTableBindingPath("/Ets_ContractHeader");
		
			//oEvent.getSource().setTableBindingPath("/Ets_ContractItem");
			 var mBindingParams = oEvent.getParameter("bindingParams");
            if (!mBindingParams.filters.length){
               mBindingParams.filters.push(new Filter(this.filterForTabl));
           }
           	//oEvent.getSource().rebindTable();
			// mBindingParams.parameters["expand"] = "to_items";
			// mBindingParams.parameters["expand"] = "to_items,to_partners,to_attachments,to_relatedSO";
		},
		
/*****  SRE 2483 ++VS EOC *******/		

		onPressAttachment: function (oEvent) {
			var array = oEvent.getSource().getParent().getBindingContext().getPath().split("/");
			var index = array[array.length - 1];
			//var row = this.getView().getModel().getData().to_attachments.results[index];
			var row = this.getView().byId("id_zcontract_db_attachments").getModel().getData()[index];

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
						oService.setTitle("Display Contract");
					},
					function (oError) {
						/*jQuery.sap.log.error("Cannot get ShellUIService", oError, "XXXXXXXXX.hr.MyTimesheet");*/
					}
				);
				//var ocontract = event.getParameter("Contract");
				var ocontract = event.getParameter("arguments").Contract;

				if (ocontract === undefined) {
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
				// ++VS variant managment SRE2483
				this.filterForTabl = sFilterArray;
				var sFF = new Filter({
					filters: sFilterArray,
					and: true
				});
				this.getView().byId("ST_Contract_items").rebindTable();
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
/******** Commented below code as created new table for variant managment sre2483 ++VS Begin ****/							
							// if (data.results[0].to_items.results.length <= 10) {
							// 	controller.getView().byId("id_zcontract_db_items").setVisibleRowCount(data.results[0].to_items.results.length);
							// } else {
							// 	controller.getView().byId("id_zcontract_db_items").setVisibleRowCount(10);
							// }
/******   Comment End   *********/ 
							if (data.results[0].to_items.results.length <= 10) {
								controller.getView().byId("id_zcontract_db_items_new").setVisibleRowCount(data.results[0].to_items.results.length);
							} else {
								controller.getView().byId("id_zcontract_db_items_new").setVisibleRowCount(10);
							}
/**********  SRE2483 ++VS End  **********/							
							if (data.results[0].to_relatedSO.results.length <= 10) {
								controller.getView().byId("id_zcontract_db_relatedSO").setVisibleRowCount(data.results[0].to_relatedSO.results.length);
							} else {
								controller.getView().byId("id_zcontract_db_relatedSO").setVisibleRowCount(10);
							}

							//Related Sales Documents Tree
							var results = data.results[0].to_relatedSO.results;
							var navResults = [];
							if (results.length > 0) {
								navResults = controller._JSONStructure._createD3Data_ContractDisplay(results);
							}
							var oTreeTable = controller.getView().byId("id_zcontract_db_relatedSO");
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
/******** Commented below code SRE2483 *******/							
							// var itemsTable = controller.getView().byId("id_zcontract_db_items");
							// itemsTable.setModel(oModelJson_items);
							// itemsTable.bindRows({
							// 	path: "/"
							// });

							/****BoC SRR071D Enhancements 25/09/2019****/
							var navResults_partners = data.results[0].to_partners.results;
							// navResults_partners[0].Item = "000010";		//Hardcoded for Testing purpose
							// navResults_partners[2].Item = "000020";
							// navResults_partners[4].Item = "000040";
							var partners_array = [];
							for (var i = 0; i < navResults_partners.length; i++) {
								if (navResults_partners[i].Item !== "000000") {
									navResults_partners[i].Item = parseInt(navResults_partners[i].Item, [10]);
									var exists = false;
									for(var j=0; j < partners_array.length; j++){
										if(partners_array[j].Item === navResults_partners[i].Item){
											exists = true;
										}
									}
									if(!exists){
										partners_array.push(navResults_partners[i]);	
									}
									
									// console.log(navResults_partners[i]);
								}
							}
							//navResults_partners = partners_array;
							var oModelJson_partners = new sap.ui.model.json.JSONModel();
							//oModelJson_partners.setData(navResults_partners);
							oModelJson_partners.setData(partners_array);
							var oItemsComboBox = controller.getView().byId("id_selectItem");
							oItemsComboBox.setModel(oModelJson_partners);
							var itemTemplate = new sap.ui.core.ListItem(); //  creating a ListItem object     
							itemTemplate.bindProperty("key", "Item");
							itemTemplate.bindProperty("text", "Item");

							oItemsComboBox.bindItems({
								path: "/",
								template: itemTemplate,
								templateShareable: false
							});
							controller.item_partners = navResults_partners; //SRR071D Enhancement 25/09/2019
							/****EoC SRR071D Enhancements 25/09/2019****/

							//Handle Attachments table
							var navResults_attachments = data.results[0].to_attachments.results;
							var oModelJson_attachments = new sap.ui.model.json.JSONModel();
							oModelJson_attachments.setData(navResults_attachments);
							var attachmentsTable = controller.getView().byId("id_zcontract_db_attachments");
							attachmentsTable.setModel(oModelJson_attachments);
							attachmentsTable.bindRows({
								path: "/"
							});

							if (data.results[0].to_attachments.results.length <= 2) {
								controller.getView().byId("id_zcontract_db_attachments").setVisibleRowCount(2);
							} else {
								controller.getView().byId("id_zcontract_db_attachments").setVisibleRowCount("Auto");
							}

							if (data.results[0].to_items.results.length <= 2) {
								controller.getView().byId("id_zcontract_db_items_new").setVisibleRowCount(2);
							} else {
								controller.getView().byId("id_zcontract_db_items_new").setVisibleRowCount("Auto");
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
			var partnersContent = this.getView().byId("id_zcontract_db_partners_hbox");
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
		},

		/*****BoC SRR071D Enhancement - 18/09/2019*****/
		handlePressPersonalize: function (oEvent) {

			// Open the Table Setting dialog
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.PersonalizationDialog", this);
				this.getView().addDependent(this._oDialog, this);

			}
			var columnCollection = [];
			var cols = this._oTableColumns;
			var oTableCols = this.getView().byId("id_zcontract_db_items").getColumns();
			//First add existing columns from Table
			for (var a = 1; a < oTableCols.length; a++) {
				var obj = {};
				obj.columnKey = oTableCols[a].getAggregation("template").getBindingInfo("text").parts[0].path;
				obj.text = oTableCols[a].getAggregation("label").getProperty("text");
				obj.visible = oTableCols[a].getVisible();
				columnCollection.push(obj);
			}
			//Then add remaining columns
			for (var b = 1; b < cols.length; b++) {
				var already_added = false;
				for (a = 0; a < columnCollection.length; a++) {
					if (cols[b].getAggregation("label").getProperty("text") === columnCollection[a].text) {
						already_added = true;
						break;
					}
				}
				if (already_added === false) {
					var obj1 = {};
					obj1.columnKey = cols[b].getAggregation("template").getBindingInfo("text").parts[0].path;
					obj1.text = cols[b].getAggregation("label").getProperty("text");
					obj1.visible = false;
					columnCollection.push(obj1);
				}
			}

			this.settings.ColumnCollection = columnCollection;

			var oModelJson = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModelJson, "settings");
			this.getView().getModel("settings").setProperty("/ColumnCollection", this.settings.ColumnCollection);
			this._oDialog.setModel(this.getView().getModel("settings"));

			this._oDialog.open();

		},
		onConfirm: function (oEvent) {

			var mParams = oEvent.getParameters();
			var selectedColumns = mParams.payload.columns.tableItems;
			this.layoutColumns = selectedColumns;
			this.updateLayout(this.layoutColumns);
			this.handleClose();
		},
		updateLayout: function (selectedColumns) {

			var oView = this.getView();
			var oTable = oView.byId("id_zcontract_db_items");

			var temp = this._oTableColumns;
			oTable.removeAllColumns();
			oTable.addColumn(temp[0]);
			for (var i = 0; i < selectedColumns.length; i++) {
				for (var k = 1; k < temp.length; k++) {
					if (temp[k].getAggregation("template").getBindingInfo("text") !== undefined) {
						if ((selectedColumns[i].columnKey ===
								temp[k].getAggregation("template").getBindingInfo("text").parts[0].path)) {
							oTable.insertColumn(temp[k], oTable.getColumns().length);
							var index = oTable.getColumns().length - 1;
							oTable.getColumns()[index].setVisible(selectedColumns[i].visible);
							break;
						}

					} else if (temp[k].getAggregation("template").getBindingInfo("selected") !== undefined) {
						if ((selectedColumns[i].columnKey ===
								temp[k].getAggregation("template").getBindingInfo("selected").parts[0].path)) {
							oTable.insertColumn(temp[k], oTable.getColumns().length);
							//oTable.addColumn(temp[k]);
							index = oTable.getColumns().length - 1;
							oTable.getColumns()[index].setVisible(selectedColumns[i].visible);
							//temp[k].setVisible(selectedColumns[i].visible);
							//temp.splice(k);
							break;
						}
					}
				}
			}

		},
		handleClose: function (oEvent) {
			this._oDialog.close();
		},

		filterGlobally: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("Item_Number", FilterOperator.Contains, sQuery),
					new Filter("Material", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
		},
		_filter: function () {
			var oFilter = null;
			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}
			this.byId("id_zcontract_db_items").getBinding("rows").filter(oFilter, "Application");
		},
		clearAllFilters: function (oEvent) {
			var oTable = this.byId("id_zcontract_db_items");

			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			oUiModel.setProperty("/availabilityFilterOn", false);

			this._oGlobalFilter = null;
			this._oPriceFilter = null;
			this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},

		addItemPartners: function (partners, selectedItem) {
			this.partners = partners;
			this.selectedItem = selectedItem;
			var partnersContent = this.getView().byId("id_zcontract_db_itempartners_hbox");
			partnersContent.destroyItems();
			var controller = this;
			for (var i = 0; i < partners.length; i++) {
				if (partners[i].Item === parseInt(this.selectedItem)) {
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
				// else {
				// 	MessageToast.show("No Records Found!!");
				// }
			}
		},
		onPressResizeHorizontal: function (oEvent) {
			var oTable = this.getView().byId("id_zcontract_db_items_new");
			var cols = oTable.getColumns();
			for (var i = 0; i < cols.length; i++) {
				if (cols[i] !== undefined) {
					cols[i].setAutoResizable(true);
					oTable.autoResizeColumn(i);
				}
			}
		},
		onItemChange: function (evt) {
				var controller = this;
				var items = controller.item_partners;
				var selectedKey= evt.getSource().getSelectedKey();
				controller.addItemPartners(items,selectedKey);
			}
			/*****EoC SRR071D Enhancement - 18/09/2019*****/
	});
});