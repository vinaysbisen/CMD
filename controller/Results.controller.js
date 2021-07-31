jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/table/TablePersoController",
	"sap/ui/export/Spreadsheet",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/TreeJSONStructure",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/formatter",
	"sap/m/UploadCollectionParameter"
], function (Controller, MessageToast, MessageBox, Fragment, Filter, FilterOperator, TablePersoController, Spreadsheet, TreeJSONStructure,
	formatter, UploadCollectionParameter) {
	"use strict";

	//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

	var url_pass;

	//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.Results", {
		formatter: formatter,
		_JSONStructure: TreeJSONStructure,
		onBeforeRendering: function () {
			this.checkUserAuth();
		},
		checkUserAuth: function () {
			var oServiceModel = this.getOwnerComponent().getModel();
			var sPath = "/Ets_User_Auth('Default')";
			var controller = this;
			var mParameters = {
				method: "GET",
				//filters: f,
				async: false, //AND
				success: jQuery.proxy(function (oData) {
					if (oData.EXTENDED_MAINTENANCE === "") {
						this.getView().byId("id_btn_results_global_update").setVisible(false);
					} else {
						this.getView().byId("id_btn_results_global_update").setVisible(true);
					}
					if (oData.EXTENDED_MAINTENANCE === "X" || oData.CHANGE === "X") {
						controller.change = true;
					} else {
						controller.change = false;
					}
					if (oData.EXTENDED_MAINTENANCE === "X") { /*Defects 75080 , 75082 - 31/07/2019*/
						controller.oAttachDelete = true;
					}
					//Begin Of June
					if (oData.CHANGE_FEDERAL === "X") {
						controller.changeFederal = true;
					} else {
						controller.changeFederal = false;
					}
					//End Of June
					controller.HybrisLink = oData.HYBRIS_LINK;
						var oModel = this.getView().getModel("UI");
					/*soc szanzaney INC0289066 15/04 - auth object check - hide create/delete button and enable only for ADMIN*/
					if (oData.SEMI_AUTO === "X") {
						/*	this.SEMI_AUTO = "X";*/
						var data = oModel.getData().Visibility;
						data.Delete = true;
						data.CreateForm = true;
						oModel.refresh(true);
					} else {
						/*	this.SEMI_AUTO = "";*/
						var data = oModel.getData().Visibility;
						data.Delete = false;
						data.CreateForm = false;
						oModel.refresh(true);
					}
					/*eoc szanzaney INC0289066 15/04 - auth object check - hide create/delete button and enable only for ADMIN*/
				}, this),

				error: jQuery.proxy(function (oError) {
					//this._oProductCategory.setBusy(false);
					var k = JSON.parse(oError.responseText);
					var msg = k.error.message.value;
					MessageToast.show(msg);
				}, this)
			};

			oServiceModel.read(sPath, mParameters);
		},
		loadVariants: function () {
			var f = [];
			f.push(new sap.ui.model.Filter("VAR_NAME", "EQ", "Default"));
			f.push(new sap.ui.model.Filter("VAR_VIEW", "EQ", "CMD"));
			var oServiceModel = this.getOwnerComponent().getModel();
			var sPath = "/Ets_ColumnLayout";
			var selectedHierarchy = this.getOwnerComponent().hierarchySelectedKey;
			var mParameters = {
				method: "GET",
				urlParameters: {
					"$top": "100000"
				},
				filters: f,
				async: false, //AND
				success: jQuery.proxy(function (oData) {
					//this._oProductCategory.setBusy(false);
					//save the result in a node of the JSON Model

					var results = oData.results;

					// array to store the existing variants
					var Variants = [];
					var defaultVariantKey = "";
					for (var j = 0; j < results.length; j++) {

						var oVariantItemObject = {};

						oVariantItemObject.Key = results[j].ZKEY;
						oVariantItemObject.Name = results[j].VAR_NAME;
						oVariantItemObject.Columns = results[j].COLUMNS;
						oVariantItemObject.Default = results[j].ZDEFAULT;
						oVariantItemObject.ZDEFAULT1 = results[j].ZDEFAULT1;
						oVariantItemObject.ZDEFAULT2 = results[j].ZDEFAULT2;
						oVariantItemObject.ZDEFAULT3 = results[j].ZDEFAULT3;
						oVariantItemObject.ZDEFAULT4 = results[j].ZDEFAULT4;
						oVariantItemObject.ZDEFAULT5 = results[j].ZDEFAULT5;
						oVariantItemObject.ZDEFAULT6 = results[j].ZDEFAULT5;
						oVariantItemObject.ZDEFAULT7 = results[j].ZDEFAULT5;
						oVariantItemObject.ZDEFAULT8 = results[j].ZDEFAULT5;

						switch (selectedHierarchy) {
						case "1":
							oVariantItemObject.Default = results[j].ZDEFAULT1; //Default - will be used to bind model in variant control
							oVariantItemObject.ZDEFAULT1 = results[j].ZDEFAULT1; //ZDEFAULT1/2/3/45 - will be used to store old default values
							break;
						case "2":
							oVariantItemObject.Default = results[j].ZDEFAULT2;
							oVariantItemObject.ZDEFAULT2 = results[j].ZDEFAULT2;
							break;
						case "3":
							oVariantItemObject.Default = results[j].ZDEFAULT3;
							oVariantItemObject.ZDEFAULT3 = results[j].ZDEFAULT3;
							break;
						case "4":
							oVariantItemObject.Default = results[j].ZDEFAULT4;
							oVariantItemObject.ZDEFAULT4 = results[j].ZDEFAULT4;
							break;
						case "5":
							oVariantItemObject.Default = results[j].ZDEFAULT5;
							oVariantItemObject.ZDEFAULT5 = results[j].ZDEFAULT5;
							break;
						case "6":
							oVariantItemObject.Default = results[j].ZDEFAULT6;
							oVariantItemObject.ZDEFAULT6 = results[j].ZDEFAULT6;
							break;
						case "7":
							oVariantItemObject.Default = results[j].ZDEFAULT7;
							oVariantItemObject.ZDEFAULT7 = results[j].ZDEFAULT7;
							break;
						case "8":
							oVariantItemObject.Default = results[j].ZDEFAULT8;
							oVariantItemObject.ZDEFAULT8 = results[j].ZDEFAULT8;
							break;
						default:
							break;
						}
						if (oVariantItemObject.Default === "X") {
							defaultVariantKey = results[j].ZKEY;
						}

						Variants.push(oVariantItemObject);
					}

					// create JSON model and attach to the variant management UI control
					this.oVariantModel = new sap.ui.model.json.JSONModel();
					//this.oVariantModel.getData().Variants = Variants;
					this.oVariantModel.getData().Ets_ColumnLayout = Variants;
					this.getView().byId("Variants").destroyVariantItems();
					this.getView().byId("Variants").setModel(this.oVariantModel);
					if (defaultVariantKey !== "") {
						this.getView().byId("Variants").setDefaultVariantKey(defaultVariantKey);
						var mParameters_key = {
							key: defaultVariantKey
						};
						this.getView().byId("Variants").fireSelect(mParameters_key);
						this.getView().byId("Variants").setInitialSelectionKey(defaultVariantKey);
					}
				}, this),

				error: jQuery.proxy(function (oError) {
					//this._oProductCategory.setBusy(false);
					var k = JSON.parse(oError.responseText);
					var msg = k.error.message.value;
					MessageToast.show(msg);
				}, this)
			};

			oServiceModel.read(sPath, mParameters);
		},
		onSelectVariant: function (oevent) {
			var Key = oevent.getParameter("key");
			//loop at this.oVariantModel to get columns and set visibility
			if (this.oVariantModel !== undefined) {
				var variants = this.oVariantModel.getData().Ets_ColumnLayout;
				var variant = {};
				for (var i = 0; i < variants.length; i++) {
					if (variants[i].Key === Key) {
						variant = variants[i];
						break;
					}
				}
				var oTable = this.getView().byId("id_cntdb_tree1");
				var temp = this._oTableColumns;
				if (variant.Columns !== undefined) {
					var selectedColumns = (variant.Columns).split(",");
					oTable.removeAllColumns();
					for (i = 0; i < selectedColumns.length; i++) {
						for (var k = 0; k < temp.length; k++) {
							if (temp[k].getAggregation("template").getBindingInfo("text") !== undefined) {
								if (selectedColumns[i] === temp[k].getLabel().getText()) {
									oTable.insertColumn(temp[k], oTable.getColumns().length);
									var index = oTable.getColumns().length - 1;
									oTable.getColumns()[index].setVisible(true);
									break;
								}
							}
						}
					}
				} else {
					oTable.removeAllColumns();
					for (var l = 0; l < temp.length; l++) {
						if (temp[l].getVisible()) {
							oTable.insertColumn(temp[l], oTable.getColumns().length);
							var index1 = oTable.getColumns().length - 1;
							oTable.getColumns()[index1].setVisible(true);
						}
					}
				}
			}

		},
		onSaveAsVariant: function (oevent) {
			var name = oevent.getParameter("name");
			var key = oevent.getParameter("key");
			var isDefault = oevent.getParameter("def");
			if (isDefault) {
				isDefault = "X";
			} else {
				isDefault = "";
			}
			var columns = "";
			var otable = this.getView().byId("id_cntdb_tree1");
			var ocols = otable.getColumns();
			for (var i = 0; i < ocols.length; i++) {
				if (ocols[i].getVisible()) {
					columns = columns + "," + ocols[i].getLabel().getText();
				}
			}
			var selectedHierarchy = this.getOwnerComponent().hierarchySelectedKey;
			var oEntry = {
				UNAME: "",
				ZKEY: key,
				VAR_NAME: name,
				ZFAVORITE: "",
				//ZDEFAULT: isDefault,
				ZDEFAULT1: "",
				ZDEFAULT2: "",
				ZDEFAULT3: "",
				ZDEFAULT4: "",
				ZDEFAULT5: "",
				ZDEFAULT6: "",
				ZDEFAULT7: "",
				ZDEFAULT8: "",
				ZPRIVATE: "",
				COLUMNS: columns,
				OP_RENAME: "",
				OP_CHANGE_DEFAULT: "",
				VAR_VIEW: "CMD" //++ Vaiant incident  INC0151932
			};

			if (isDefault) {
				oEntry.OP_CHANGE_DEFAULT = selectedHierarchy;
				switch (selectedHierarchy) {
				case "1":
					oEntry.ZDEFAULT1 = "X";
					break;
				case "2":
					oEntry.ZDEFAULT2 = "X";
					break;
				case "3":
					oEntry.ZDEFAULT3 = "X";
					break;
				case "4":
					oEntry.ZDEFAULT4 = "X";
					break;
				case "5":
					oEntry.ZDEFAULT5 = "X";
					break;
				case "6":
					oEntry.ZDEFAULT6 = "X";
					break;
				case "7":
					oEntry.ZDEFAULT7 = "X";
					break;
				case "8":
					oEntry.ZDEFAULT8 = "X";
					break;
				default:
					break;
				}
			}

			this.getOwnerComponent().getModel().create("/Ets_ColumnLayout", oEntry, null, function () {
				sap.m.MessageBox.show(
					"Layout Saved!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Success",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}, function (error) {
				sap.m.MessageBox.show(
					error.statusText, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			});
			// calling load variants after saving variants
			this.loadVariants();
		},
		onManageVariant: function (oevent) {
			var oModel = this.getOwnerComponent().getModel();
			var del = oevent.getParameter("deleted");
			var controller = this;
			var variants = controller.oVariantModel.getData().Ets_ColumnLayout;
			if (del.length > 0) {
				for (var i = 0; i < del.length; i++) {
					oModel.remove("/Ets_ColumnLayout('" + del[i] + "')", {
						method: "DELETE",
						success: function (data) {
							//sap.m.MessageToast.show("Variant Deleted");
						},
						error: function (e) {
							//sap.m.MessageToast.show("Error Deleting Variant");
						}
					});
				}
			}
			var renamed = oevent.getParameter("renamed");
			if (renamed.length > 0) {
				for (var a = 0; a < renamed.length; a++) {
					var name = renamed[a].name;
					var key = renamed[a].key;
					/*var isDefault = "";
					if (controller.getView().byId("Variants").getDefaultVariantKey() === renamed[a].key) {
						isDefault = "X";
					}*/

					var oEntry = {
						UNAME: "",
						ZKEY: key,
						VAR_NAME: name,
						ZFAVORITE: "",
						ZDEFAULT1: "",
						ZDEFAULT2: "",
						ZDEFAULT3: "",
						ZDEFAULT4: "",
						ZDEFAULT5: "",
						ZPRIVATE: "",
						COLUMNS: "Hierarchy",
						OP_RENAME: "X",
						OP_CHANGE_DEFAULT: "",
						VAR_VIEW: "CMD" //++ Vaiant incident  INC0151932
					};

					for (var b = 0; b < variants.length; b++) {
						if (variants[b].Key === renamed[a].key) {
							oEntry.COLUMNS = variants[b].Columns;
							oEntry.ZDEFAULT1 = variants[b].ZDEFAULT1;
							oEntry.ZDEFAULT2 = variants[b].ZDEFAULT2;
							oEntry.ZDEFAULT3 = variants[b].ZDEFAULT3;
							oEntry.ZDEFAULT4 = variants[b].ZDEFAULT4;
							oEntry.ZDEFAULT5 = variants[b].ZDEFAULT5;
							break;
						}
					}
					oModel.create("/Ets_ColumnLayout", oEntry, null, function () {}, function (error) {});

				}
			}

			var def = oevent.getParameter("def");
			if (def !== "" && def !== undefined && def !== null) {

				var selectedHierarchy = this.getOwnerComponent().hierarchySelectedKey;
				var oEntry1 = {
					UNAME: "",
					ZKEY: def,
					VAR_NAME: "",
					ZFAVORITE: "",
					ZDEFAULT1: "",
					ZDEFAULT2: "",
					ZDEFAULT3: "",
					ZDEFAULT4: "",
					ZDEFAULT5: "",
					ZPRIVATE: "",
					COLUMNS: "",
					OP_RENAME: "",
					OP_CHANGE_DEFAULT: selectedHierarchy,
					VAR_VIEW: "CMD" //++ Vaiant incident  INC0151932
				};

				var defaultChanged = false;
				for (var b = 0; b < variants.length; b++) {
					if (variants[b].Key === def) {
						oEntry1.COLUMNS = variants[b].Columns;
						oEntry1.VAR_NAME = variants[b].Name;
						oEntry1.ZDEFAULT1 = variants[b].ZDEFAULT1;
						oEntry1.ZDEFAULT2 = variants[b].ZDEFAULT2;
						oEntry1.ZDEFAULT3 = variants[b].ZDEFAULT3;
						oEntry1.ZDEFAULT4 = variants[b].ZDEFAULT4;
						oEntry1.ZDEFAULT5 = variants[b].ZDEFAULT5;
						//oEntry1.ZDEFAULT = variants[b].Default;

						switch (selectedHierarchy) {
						case "1":
							if (oEntry1.ZDEFAULT1 !== "X") { //Check if this was not already default
								defaultChanged = true;
							}
							oEntry1.ZDEFAULT1 = "X";
							break;
						case "2":
							if (oEntry1.ZDEFAULT2 !== "X") { //Check if this was not already default
								defaultChanged = true;
							}
							oEntry1.ZDEFAULT2 = "X";
							break;
						case "3":
							if (oEntry1.ZDEFAULT3 !== "X") { //Check if this was not already default
								defaultChanged = true;
							}
							oEntry1.ZDEFAULT3 = "X";
							break;
						case "4":
							if (oEntry1.ZDEFAULT4 !== "X") { //Check if this was not already default
								defaultChanged = true;
							}
							oEntry1.ZDEFAULT4 = "X";
							break;
						case "5":
							if (oEntry1.ZDEFAULT5 !== "X") { //Check if this was not already default
								defaultChanged = true;
							}
							oEntry1.ZDEFAULT5 = "X";
							break;
						default:
							break;
						}
						break;
					}
				}
				if (defaultChanged) {
					oModel.create("/Ets_ColumnLayout", oEntry1, null, function () {}, function (error) {});
				}

			}
		},
		addDependents: function () {

			this.menuContract = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Menu_Contract",
				this
			);
			this.getView().addDependent(this.menuContract);

			this.menuQuote = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Menu_Quote",
				this
			);
			this.getView().addDependent(this.menuQuote);

			this.menuCustomer = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Menu_Customer",
				this
			);
			this.getView().addDependent(this.menuCustomer);

			this.menuEquipment = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Menu_Equipment",
				this
			);
			this.getView().addDependent(this.menuEquipment);

			this.menuFunctionalLocation = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Menu_FunctionalLocation",
				this
			);
			this.getView().addDependent(this.menuFunctionalLocation);

			this._attachments = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ManageAttachments",
				this
			);
			this.getView().addDependent(this._attachments);

			this._CustDocs = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.CustDocs",
				this
			);
			this.getView().addDependent(this._CustDocs);

		},
		onInit: function () {
			
				/*soc szanzaney INC0289066 15/04 - auth object check - hide create/delete button and enable only for ADMIN*/
			this.oViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oViewModel, "UI");
			var oModel = this.getView().getModel("UI");
			var data = {
				"Visibility": {
					"Delete": false,
					"CreateForm": false,
				}

			};
			oModel.setData(data);
			oModel.refresh(true);
			/*eoc szanzaney INC0289066 15/04 - auth object check - hide create/delete button and enable only for ADMIN*/
			this.addDependents();
			//this.initializeVariantManagement(); //Commented 14MAY2019-
			var oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(oModel);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
			var oTable = this.getView().byId("id_cntdb_tree1");
			this._oTableColumns = oTable.getColumns(); //used for re-ordering later
			this.settings = {
				"ColumnCollection": [],
				"SortItems": [],
				"FilterItems": []
			};

			var cols = oTable.getColumns();
			var controller = this;
			for (var k = 1; k < cols.length; k++) {
				var obj = {};
				obj.text = cols[k].getLabel().getText();
				obj.columnKey = cols[k].getAggregation("template").getBindingInfo("text").parts[0].path;
				obj.visible = cols[k].getVisible();
				controller.settings.ColumnCollection.push(obj);
			}

			this.byId("openMenu").attachBrowserEvent("tab keyup", function (oEvent) {
				this._bKeyboard = oEvent.type === "keyup";
			}, this);

			this.getAttachmentTypes_Contract();
			this.getAttachmentTypes_AMP();
			this.getAttachmentTypes_Quotes();
		},
		getAttachmentTypes_Contract: function () {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "ObjectType",
				operator: FilterOperator.EQ,
				value1: "BUS2034"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);
			var controller = this;
			var path = "/Ets_Attachment_Category";

			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: [new Filter(f, true)],
					success: function (data, response) {
						controller.AttachmentCategory_Contracts = data.results;
					},
					error: function (error) {}
				});
		},
		getAttachmentTypes_AMP: function () {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "ObjectType",
				operator: FilterOperator.EQ,
				value1: "BUS0010"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);
			var controller = this;
			var path = "/Ets_Attachment_Category";

			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: [new Filter(f, true)],
					success: function (data, response) {
						controller.AttachmentCategory_AMP = data.results;
					},
					error: function (error) {}
				});
		},
		getAttachmentTypes_Quotes: function () {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "ObjectType",
				operator: FilterOperator.EQ,
				value1: "BUS2031"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);
			var controller = this;
			var path = "/Ets_Attachment_Category";

			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: [new Filter(f, true)],
					success: function (data, response) {
						controller.AttachmentCategory_Quotes = data.results;
					},
					error: function (error) {}
				});
		},
		updateTableModel: function () {

			var component = this.getOwnerComponent();
			this.exportExcelData = component.results[0].Nav_Results.results;
			if (component.results !== undefined) {
				var results = component.results[0].Nav_Results.results;
				var navResults = [];
				if (results.length > 0) {
					navResults = this._JSONStructure._createD3Data(results);
				}
				var oTreeTable = this.getView().byId("id_cntdb_tree1");
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
				this.getView().byId("id_inp_expand_upto_level").setSelectedKey("10");
			}
		},
		_handleRouteMatched: function (event) {

			var oparameters = event.getParameter("name");
			if (oparameters !== "Results") {
				return;
			} else {
				//Set Title
				this.getOwnerComponent().getService("ShellUIService").then( // promise is returned
					function (oService) {
						/*var sTitle = that.getView().getModel("i18n").getResourceBundle().getText("appTitle");*/
						oService.setTitle("Contract Management Dashboard");
					},
					function (oError) {
						/*jQuery.sap.log.error("Cannot get ShellUIService", oError, "XXXXXXXXX.hr.MyTimesheet");*/
					}
				);
				//BOI LR1+
				if (this.getView().byId("id_inp_view_flag_results").getItems().length === 7) {
					this.getView().byId("id_inp_view_flag_results").removeItem(6);
				}
				if (this.getOwnerComponent().hierarchySelectedKey === "6") {
					var dyn_text = "Hierarchy 6 - Dynamic: " + this.getOwnerComponent().Dynamic_hierarchy; //LR1+
					var item = new sap.ui.core.Item({
						key: "6",
						text: dyn_text
					});
					this.getView().byId("id_inp_view_flag_results").addItem(item);
				}
				//EOI LR1+
				this.loadVariants();
				if (this.getOwnerComponent().fromView === "Search") {
					this.getOwnerComponent().fromView = "";
					this.getView().byId("id_inp_view_flag_results").setSelectedKey(this.getOwnerComponent().hierarchySelectedKey);
					this.updateTableModel();
				}
			}
			this.oEquips = {};
			this.oViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oViewModel, "viewData");
			if (this.getOwnerComponent().hierarchySelectedKey === "1") {
				this.getView().getModel("viewData").setProperty("/moveEtoF", true);
			} else {
				this.getView().getModel("viewData").setProperty("/moveEtoF", false);
			}
		},
		handlePressOpenMenu: function (oEvent) {
			var oButton = oEvent.getSource();

			// create menu only once
			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Menu",
					this
				);
				this.getView().addDependent(this._menu);
			}

			var eDock = sap.ui.core.Popup.Dock;
			this.mData = {
				"change": this.change
			};
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(this.mData);
			this._menu.setModel(oModel);
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},
		append0s: function (string, maxlength) {
			string = string.trim();
			var myString = "" + string;
			while (myString.length < maxlength) {
				myString = "0" + myString;
			}
			return myString;
		},
		//BOI AKADAM23FEB2020 LR1+ Cust Doc
		onPressProceed_Cust_Doc: function (oEvent) {
			var llfls = this.llfls;
			var oTreeTable = "";
			if (llfls.length > 0) {
				oTreeTable = sap.ui.getCore().byId("id_custdoc_table_llfl");
			} else {
				oTreeTable = sap.ui.getCore().byId("id_custdoc_table_amp");
			}

			var selectedIndices = oTreeTable.getSelectedIndices();
			var contracts = [];
			var quotes = [];
			var warning_partners = [];
			var error_partners = [];
			/*soc szanznaney SRF133 check on Business place*/
			var error_partners_brazil = [];
			/*eoc szanznaney SRF133 check on Business place*/

			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			var wp_names = [];
			var error_invoices = [];

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			if (selectedIndices.length === 0) {
				sap.m.MessageBox.show(
					"Select document(s) to proceed", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			} else {
				for (var i = 0; i < selectedIndices.length; i++) {
					var path = oTreeTable.getContextByIndex(selectedIndices[i]).sPath.split("/");
					path.splice(0, 1); //remove first element - ""
					var obj = oTreeTable.getModel().getData()[path[0]];
					if (obj.Object_Type === "Contract") {
						contracts.push(obj.Object.trim());
					}
					if (obj.Object_Type === "Quote") {
						quotes.push(obj.Object.trim());
					}

					var error_partner = {};

					error_partner.Sold_To_Party = obj.Sold_To_Party;
					error_partner.Sold_To_Contact = obj.Sold_To_Contact;
					error_partner.Bill_To_Party = obj.Bill_To_Party;

					/*soc szanznaney SRF133 check on Business place*/
					var error_partner_brazil = {};
					error_partner.Business_Place = obj.Business_Place;
					error_partners_brazil.push(error_partner_brazil);
					/*eoc szanznaney SRF133 check on Business place*/

					if (error_partners.length === 0) {
						error_partners.push(error_partner);
					} else {
						// if (error_partners[0].Sold_To_Party !== error_partner.Sold_To_Party ||
						// 	error_partners[0].Sold_To_Contact !== error_partner.Sold_To_Contact ||
						// 	error_partners[0].Bill_To_Party !== error_partner.Bill_To_Party) {
						// 	error_partners.push(error_partner);
						// }
						/***INC0131976 8/31 PN S4 - PF Inconsistency Check Issue in CMD for Cust Doc SOC MSA1*/
						var flag = false;
						var flagNull = false;
						if (error_partners[0].Sold_To_Party !== error_partner.Sold_To_Party ||
							error_partners[0].Sold_To_Contact !== error_partner.Sold_To_Contact ||
							error_partners[0].Bill_To_Party !== error_partner.Bill_To_Party) {
							//error_partners.push(error_partner);
							flag = true;
						}
						if (Number(error_partner.Sold_To_Party) === 0 || Number(error_partner.Sold_To_Contact) === 0 || Number(error_partner.Bill_To_Party) ===
							0) {
							flagNull = true;
						}
						if (flag || flagNull) {
							error_partners.push(error_partner);
						}
						/*INC0131976 8/31 PN S4 - PF Inconsistency Check Issue in CMD for Cust Doc EOC MSA1***/
					}

					//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

					var error_invoice = {};

					error_invoice.Local_Invoicing = obj.data.Local_Invoicing;
					error_invoice.Central_Invoicing = obj.data.Central_Invoicing;
					if (error_invoices.length === 0) {
						error_invoices.push(error_invoice);
					} else {
						if (error_invoices[0].Local_Invoicing !== error_invoice.Local_Invoicing ||
							error_invoices[0].Central_Invoicing !== error_invoice.Central_Invoicing) {
							error_invoices.push(error_invoice);
						}
					}

					//same code as previously, but correction made : obj.data.Bill_To_Contact corrected to obj.data.Bill_to_Contact
					var warning_partner = {};
					warning_partner.Bill_To_Contact = obj.Bill_to_Contact;
					warning_partner.Contract_Admin = obj.Contract_Admin_Contact;
					warning_partner.AOL = obj.Account_Ops_Lead;
					warning_partner.Sales_Rep = obj.Sales_Rep;
					if (warning_partners.length === 0) {
						warning_partners.push(warning_partner);
					} else {
						if (warning_partners[0].Bill_To_Contact !== warning_partner.Bill_To_Contact ||
							warning_partners[0].Contract_Admin !== warning_partner.Contract_Admin ||
							warning_partners[0].AOL !== warning_partner.AOL ||
							warning_partners[0].Sales_Rep !== warning_partner.Sales_Rep) {
							warning_partners.push(warning_partner);
						}
					}

					var wp_name = {};
					wp_name.Bill_to_Contact_Name = obj.Bill_to_Contact_Name;
					wp_name.Contract_Admin_Contact_Name = obj.Contract_Admin_Contact_Name;
					wp_name.Account_Ops_Lead_Name = obj.Account_Ops_Lead_Name;
					wp_name.Sales_Rep_Name = obj.Sales_Rep_Name;
					if (wp_names.length === 0) {
						wp_names.push(wp_name);
					} else {
						if (wp_names[0].Bill_to_Contact_Name !== wp_name.Bill_to_Contact_Name ||
							wp_names[0].Contract_Admin_Contact_Name !== wp_name.Contract_Admin_Contact_Name ||
							wp_names[0].Account_Ops_Lead_Name !== wp_name.Account_Ops_Lead_Name ||
							wp_names[0].Sales_Rep_Name !== wp_name.Sales_Rep_Name) {
							wp_names.push(wp_name);
						}
					}

					//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				}

				this.contracts = contracts;
				this.quotes = quotes;
				this.error_partners = error_partners;
				/*soc szanznaney SRF133 check on Business place*/
				this.error_partners_brazil = error_partners_brazil;
				/*eoc szanznaney SRF133 check on Business place*/

				this.warning_partners = warning_partners;
				//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				this.error_invoices = error_invoices;
				this.wp_names = wp_names;

				//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				//Check 2 --> Check if Selected Document(s) contain both - Contract(s) AND Quote(s) --> Error "Cannot Proceed with Contract(s) and Quote(s) at same time..!!"
				//Check 3 --> Check if Selected Document(s) are from multiple AMP ID --> Error "Document(s) for More than 1 AMP ID Selected..!!"
				//Check 4 --> Document should have have AMP(amp) Information OR allowed for UPFRONT(Nav_To_Cust_Docs === "X") --> Error "Navigation to Cust Docs not supported for Selected Document(s) - (i.e. Without AMP ID)"
				//Check 5 --> Sold To, Sold To Contact, Bill To Party if not in sync --> Error "Sold To Party, Sold To Contact and Bill to Party are not consistent in selected documents..!!"
				//Check 6 --> "Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?"
				/*soc szanznaney SRF133 check on Business place*/
				//Check 7 --> check if business places are same -->If all the Business Places for selected contracts is different, raise error
				/*eoc szanznaney SRF133 check on Business place*/
				//Step 7 --> Proceed to Cust Docs :)

				//Begin of Code for Above Steps:
				var error = false;
				//Check 2 --> Check if Selected Document(s) contain both - Contract(s) AND Quote(s) --> Error "Cannot Proceed with Contract(s) and Quote(s) at same time..!!"
				if (!error) {
					error = this.CustDoc_Check2(error);
				}

				//Check 5 --> Sold To, Sold To Contact, Bill To Party if not in sync --> Error "Sold To Party, Sold To Contact and Bill to Party are not consistent in selected documents..!!"
				if (!error) {
					error = this.CustDoc_Check5(error);
				}

				/*soc szanznaney SRF133 check on Business place*/
				//Check 7 --> check if business places are same -->If all the Business Places for selected contracts is different, raise error
				if (!error) {
					error = this.CustDoc_Check7(error);
				}
				/*eoc szanznaney SRF133 check on Business place*/

				//Check 6 --> "Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?"
				if (!error) {
					var amp = this.amps[0];
					var type = "G";
					var documents = this.contracts;

					if (this.quotes.length > 0) {
						type = "B";
						documents = this.quotes;
					}
					var controller = this;
					var document = "";
					for (i = 0; i < documents.length; i++) {
						var doc = controller.append0s(documents[i].trim(), 10);
						if (i > 0) {
							document = document + "," + doc;
						} else {
							document = doc;
						}
					}
					var url = window.location.href;
					url = url.substring(0, url.lastIndexOf("#"));
					if (url.lastIndexOf("?") === -1) {
						url = url + "?";
					} else {
						url = url + "&";
					}

					url = url + "#zcust_doc-manage&/Dashboard/" + document + "/" + amp + "/" + type;
					var controller = this;
					if (this.warning_partners.length === 1) {
						sap.m.URLHelper.redirect(url, true);
						controller._CustDocs.close();
					} else {
						sap.m.MessageBox.show(
							"Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?", {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Partner Function(s) Inconsistent!",
								actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
								onClose: function (sAction1) {
									if (sAction1 === "OK") {
										sap.m.URLHelper.redirect(url, true);
										controller._CustDocs.close();
									}

								}
							});
					}

				}

			}

		},
		onClose_Cust_Doc: function (oEvent) {
			this._CustDocs.close();
		},
		CustDoc_Check1_1_getDocs_Based_on_LLFL_or_AMP: function () {

			var error = false;
			var llfls = this.llfls;
			var amps = this.amps;
			var temp = [];
			var data = [];
			var controller = this;

			//Set Model Based on Selection
			if (llfls.length > 0) {

				sap.ui.getCore().byId("id_custdoc_table_amp").setVisible(false);
				sap.ui.getCore().byId("id_custdoc_table_llfl").setVisible(true);
				temp = this.getOwnerComponent().results[0].to_cust_doc_llfl.results;
				for (var j = 0; j < llfls.length; j++) {
					for (var i = 0; i < temp.length; i++) {
						if (temp[i].LLFL === llfls[j]) {
							data.push(temp[i]);
						}
					}
				}
			} else {
				sap.ui.getCore().byId("id_custdoc_table_amp").setVisible(true);
				sap.ui.getCore().byId("id_custdoc_table_llfl").setVisible(false);
				temp = this.getOwnerComponent().results[0].to_cust_doc_amp.results;
				for (var k = 0; k < temp.length; k++) {
					if (temp[k].AMP === amps[0]) {
						data.push(temp[k]);
					}
				}

			}
			var oModel = new sap.ui.model.json.JSONModel(data);
			controller._CustDocs.setModel(oModel);

			//Call Fragment with LLFL Filter
			controller._CustDocs.open();
			//Provide Option to Filter Docs 

			//if documents found, return false and set a flag --> this.docs_found_based_on_LLFL_or_AMP
			error = false;
			return error; //technically no significance for this value, further structure is controlled by this.docs_found_based_on_LLFL_or_AMP
		},
		CustDoc_Check1: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}

			var oTreeTable = this.getView().byId("id_cntdb_tree1");
			var selectedIndices = oTreeTable.getSelectedIndices();
			var documents = [];
			var contracts = [];
			var quotes = [];
			var amps = [];
			var llfls = [];
			var warning_partners = [];
			var error_partners = [];
			/*soc szanznaney SRF133 check on Business place*/
			var error_partners_brazil = [];
			/*eoc szanznaney SRF133 check on Business place*/

			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			var error_invoices = [];
			var wp_names = [];

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			if (selectedIndices.length > 0) {

				for (var i = 0; i < selectedIndices.length; i++) {
					var path = oTreeTable.getContextByIndex(selectedIndices[i]).sPath.split("/");
					path.splice(0, 1); //remove first element - ""
					var obj = oTreeTable.getModel().getData()[path[0]];
					for (var j = 1; j < path.length; j++) {
						obj = obj[path[j]];
					}
					// BOC SDAS52 ER-1036 11/10/2020
					if (i == 0) {
						this.SignatureFlag = obj.data.SignatureFlag;
					}
					// EOC SDAS52 ER-1036 11/10/2020
					var contract = obj.data.Contract.trim();
					var quote = obj.data.Quote.trim();
					var amp = obj.data.AMP.trim();
					var llfl = obj.data.LLFL.trim();
					if (llfl !== "") {
						var found_llfl = false;
						for (var k = 0; k < llfls.length; k++) {
							if (llfls[k] === obj.data.Object) {
								found_llfl = true;
							}
						}
						if (!found_llfl) {
							llfls.push(obj.data.Object);
						}
					}
					if (contract !== "") {
						documents.push(contract);
					} else if (quote !== "") {
						documents.push(quote);
					}

					if (amp !== "" || obj.data.Nav_To_Cust_Docs === "X") { //Only add Data that have AMP Information OR allowed for UPFRONT
						if (amp === "") {
							amp = "null";
						}

						//Step1: Push AMPS
						if (amps.length > 0) {
							if (amp !== amps[0]) {
								amps.push(amp);
							}
						} else {
							amps.push(amp);
						}

						//Step2: Push Contracts for same AMPS
						/*if (contract !== "") {
									contracts.push(contract);
								}
						
								//Step3: Push Quotes for same AMPS
								if (quote !== "") {
									quotes.push(quote);
								}*/
						if (obj.data.Object_Type === "Contract") {
							contracts.push(contract);
						}

						//Step3: Push Quotes for same AMPS
						if (obj.data.Object_Type === "Quote") {
							quotes.push(quote);
						}

						if (contract !== "" || quote !== "") {
							var error_partner = {};

							error_partner.Sold_To_Party = obj.data.Sold_To_Party;
							error_partner.Sold_To_Contact = obj.data.Sold_To_Contact;
							error_partner.Bill_To_Party = obj.data.Bill_To_Party;

							/*soc szanznaney SRF133 check on Business place*/
							var error_partner_brazil = {};
							error_partners_brazil.Business_Place = obj.Business_Place;
							error_partners_brazil.push(error_partner_brazil);
							/*eoc szanznaney SRF133 check on Business place*/

							if (error_partners.length === 0) {
								error_partners.push(error_partner);
							} else {
								if (error_partners[0].Sold_To_Party !== error_partner.Sold_To_Party ||
									error_partners[0].Sold_To_Contact !== error_partner.Sold_To_Contact ||
									error_partners[0].Bill_To_Party !== error_partner.Bill_To_Party) {
									error_partners.push(error_partner);
								}
							}

							//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

							var error_invoice = {};

							error_invoice.Local_Invoicing = obj.data.Local_Invoicing;
							error_invoice.Central_Invoicing = obj.data.Central_Invoicing;
							if (error_invoices.length === 0) {
								error_invoices.push(error_invoice);
							} else {
								if (error_invoices[0].Local_Invoicing !== error_invoice.Local_Invoicing ||
									error_invoices[0].Central_Invoicing !== error_invoice.Central_Invoicing) {
									error_invoices.push(error_invoice);
								}
							}

							//same code as previously, but correction made : obj.data.Bill_To_Contact corrected to obj.data.Bill_to_Contact
							var warning_partner = {};
							warning_partner.Bill_To_Contact = obj.data.Bill_to_Contact;
							warning_partner.Contract_Admin = obj.data.Contract_Admin_Contact;
							warning_partner.AOL = obj.data.Account_Ops_Lead;
							warning_partner.Sales_Rep = obj.data.Sales_Rep;
							// BOC SDAS52 ER-1036 11/10/2020
							warning_partner.Admin_Signer = obj.data.Admin_Signer;
							// EOC SDAS52 ER-1036 11/10/2020
							if (warning_partners.length === 0) {
								warning_partners.push(warning_partner);
							} else {
								if (warning_partners[0].Bill_To_Contact !== warning_partner.Bill_To_Contact ||
									warning_partners[0].Contract_Admin !== warning_partner.Contract_Admin ||
									warning_partners[0].AOL !== warning_partner.AOL ||
									warning_partners[0].Sales_Rep !== warning_partner.Sales_Rep ||
									// BOC SDAS52 ER-1036 11/10/2020
									warning_partners[0].Admin_Signer !== warning_partner.Admin_Signer
									// EOC SDAS52 ER-1036 11/10/2020
								) {
									warning_partners.push(warning_partner);
								}
							}

							var wp_name = {};
							wp_name.Bill_to_Contact_Name = obj.data.Bill_to_Contact_Name;
							wp_name.Contract_Admin_Contact_Name = obj.data.Contract_Admin_Contact_Name;
							wp_name.Account_Ops_Lead_Name = obj.data.Account_Ops_Lead_Name;
							wp_name.Sales_Rep_Name = obj.data.Sales_Rep_Name;
							// BOC SDAS52 ER-1036 11/10/2020
							wp_name.Admin_Signer_Name = obj.data.Admin_Signer_Name;
							// EOC SDAS52 ER-1036 11/10/2020
							if (wp_names.length === 0) {
								wp_names.push(wp_name);
							} else {
								if (wp_names[0].Bill_to_Contact_Name !== wp_name.Bill_to_Contact_Name ||
									wp_names[0].Contract_Admin_Contact_Name !== wp_name.Contract_Admin_Contact_Name ||
									wp_names[0].Account_Ops_Lead_Name !== wp_name.Account_Ops_Lead_Name ||
									wp_names[0].Sales_Rep_Name !== wp_name.Sales_Rep_Name ||
									// BOC SDAS52 ER-1036 11/10/2020
									wp_names[0].Admin_Signer_name !== wp_name.Admin_Signer_Name
									// EOC SDAS52 ER-1036 11/10/2020
								) {
									wp_names.push(wp_name);
								}
							}

							//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

						}

					} else if (obj.data.Object_Type === "Functional Location (AMP)" || obj.data.Object_Type === "Functional Location (LLFL)") {
						//Selected row is of type AMP OR LLFL
						if (obj.data.Object_Type === "Functional Location (AMP)") {

							var found_amp = false;
							for (var k = 0; k < amps.length; k++) {
								if (amps[k] === obj.data.Object) {
									found_amp = true;
								}
							}
							if (!found_amp) {
								amps.push(obj.data.Object);
							}
						} else {
							var found_llfl = false;
							for (var k = 0; k < llfls.length; k++) {
								if (llfls[k] === obj.data.Object) {
									found_llfl = true;
								}
							}
							if (!found_llfl) {
								llfls.push(obj.data.Object);
							}

						}

					}
				}
				if (contracts.length === 0 && quotes.length === 0 && documents.length === 0 && llfls.length === 0 && amps.length === 0) {
					//Nothing is selected
					sap.m.MessageBox.show(
						"Select document(s) / AMP / LLFL(s) to proceed", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});

				} else if (contracts.length === 0 && quotes.length === 0 && documents.length === 0 && (llfls.length === 0 || amps.length > 0)) { //no document selected but AMP/ LLFL selected
					//Only LLFL / AMP are selected
					this.docs_found_based_on_LLFL_or_AMP = true;
					this.amps = amps;
					this.llfls = llfls;
					error = false;
					error = this.CustDoc_Check3(error); //Check for multiple AMPS
					if (!error) {
						error = this.CustDoc_Check1_1_getDocs_Based_on_LLFL_or_AMP();
					}
				}
			} else {
				error = true;
				sap.m.MessageBox.show(
					"Select document(s) / AMP / LLFL(s) to proceed", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}

			if (this.docs_found_based_on_LLFL_or_AMP === false) {
				this.contracts = contracts;
				this.quotes = quotes;
				this.amps = amps;
				this.llfls = llfls;
				this.documents = documents;
				this.warning_partners = warning_partners;
				this.error_partners = error_partners;
				/*soc szanznaney SRF133 check on Business place*/
				this.error_partners_brazil = error_partners_brazil;
				/*eoc szanznaney SRF133 check on Business place*/
				//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				this.error_invoices = error_invoices;
				this.wp_names = wp_names;

				//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
			}
			return error;
		},
		CustDoc_Check2: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}
			if (this.contracts.length > 0 && this.quotes.length > 0) {
				sap.m.MessageBox.show(
					"Cannot Proceed with Contract(s) and Quote(s) at same time..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				error = true;
			}

			return error;
		},
		CustDoc_Check3: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}
			if (this.amps.length > 1) {
				error = true;
				sap.m.MessageBox.show(
					"Document(s) for More than 1 AMP ID Selected..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});

			}

			return error;
		},
		CustDoc_Check4: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}
			if (this.documents.length > 1 && this.contracts.length === 0 && this.quotes.length === 0) {
				error = true;
				sap.m.MessageBox.show(
					"Navigation to Cust Docs not supported for Selected Document(s) - (i.e. Without AMP ID)", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
			return error;
		},
		CustDoc_Check5: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}
			if (this.error_partners.length > 1) {
				error = true;
				sap.m.MessageBox.show(
					"Sold To Party, Sold To Contact and Bill to Party are not consistent in selected documents..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
			else if (this.error_invoices > 1) {
				error = true;
				sap.m.MessageBox.show(
					"Local Invoicing and Central Invoicing are not consistent in selected documents..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
			return error;
		},
		CustDoc_Check6: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}
			if (this.warning_partners.length > 1) {
				error = true;
				sap.m.MessageBox.show(
					"Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}

			return error;
		},

		/*soc szanznaney SRF133 check on Business place*/
		CustDoc_Check7: function (error_flag) {
			var error = false;
			if (error_flag) {
				error = error_flag;
			}
			if (this.error_partners_brazil.length > 1) {
				if (this.error_partners_brazil.every((val, i, arr) => val === arr[0])) {
					error = true;
					sap.m.MessageBox.show(
						"Multiple Business Place found, please check!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
			}
			return error;
		},
		/*Eoc szanznaney SRF133 check on Business place*/

		//EOI AKADAM23FEB2020 LR1+ Cust Doc
		handleMenuItemPress: function (oEvent) {
			var sCreateActionSelected = oEvent.getSource().getProperty("text");
			var sSemanticObj, sAction;
			//this.mData.title = "";
			this.mData = {
				"title": "",
				"change": this.change
			};
			// Selection of Semantic Object & Action pair
			switch (sCreateActionSelected) {
			case "Link to Hybris":
				var url = this.HybrisLink;
				//Navigate to Hybris
				sap.m.URLHelper.redirect(url, true);
				break;
			case "Move Equipment(s) to Functional Location":
				var oTreeTable = this.getView().byId("id_cntdb_tree1");
				var selectedIndices = oTreeTable.getSelectedIndices();
				var equipments = [];
				var controller = this;
				if (selectedIndices.length > 0) {
					for (var i = 0; i < selectedIndices.length; i++) {
						var path = oTreeTable.getContextByIndex(selectedIndices[i]).sPath.split("/");
						path.splice(0, 1); //remove first element - ""
						var obj = oTreeTable.getModel().getData()[path[0]];
						for (var j = 1; j < path.length; j++) {
							obj = obj[path[j]];
						}
						var equipment = obj.data.Equipment_Number.trim();

						if (equipment !== "") { //Only add Data that have Equipment Information
							equipments.push(equipment);
						}
					}
					if (equipments.length > 0) {
						var final_equi = equipments.sort().slice();
						var selectedObject = "";
						if (final_equi.length > 0) {
							var results = [];
							for (i = 0; i < final_equi.length; i++) {
								if (!(results.indexOf(final_equi[i]) > -1)) {
									results.push(final_equi[i]);
								}
							}
							final_equi = results;

							selectedObject = controller.append0s(final_equi[0], 18);
							for (var k = 1; k < final_equi.length; k++) {
								selectedObject = selectedObject + "," + controller.append0s(final_equi[k], 18);
							}
						}

						var url = window.location.href;
						if (selectedObject !== "") {
							url = url.substring(0, url.lastIndexOf("/")) + "/MoveEquipment/" + selectedObject;
							//Navigate to second app
							sap.m.URLHelper.redirect(url, true);
						} else {
							sap.m.MessageBox.show(
								"Selected Row(s) do not have Equipment Information..!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}

					} else {
						sap.m.MessageBox.show(
							"Selected Row(s) do not have Equipment Information..!!", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
					}

				} else {
					sap.m.MessageBox.show(
						"Select Rows to Proceed..!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}

				break;
			case "Generate/ Email Cust Docs":
				//BOI AKADAM23FEB2020+ LR1+
				//Check 1 --> Check if Document(s) are NOT selected --> Error "Select document(s) to proceed OR Use Popover Menu on AMP/LLFL Menu to Filter Document(s)"
				//Check 2 --> Check if Selected Document(s) contain both - Contract(s) AND Quote(s) --> Error "Cannot Proceed with Contract(s) and Quote(s) at same time..!!"
				//Check 3 --> Check if Selected Document(s) are from multiple AMP ID --> Error "Document(s) for More than 1 AMP ID Selected..!!"
				//Check 4 --> Document should have have AMP(amp) Information OR allowed for UPFRONT(Nav_To_Cust_Docs === "X") --> Error "Navigation to Cust Docs not supported for Selected Document(s) - (i.e. Without AMP ID)"
				//Check 5 --> Sold To, Sold To Contact, Bill To Party if not in sync --> Error "Sold To Party, Sold To Contact and Bill to Party are not consistent in selected documents..!!"
				//Check 6 --> "Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?"
				/*soc szanznaney SRF133 check on Business place*/
				//Check 7 --> check if business places are same -->If all the Business Places for selected contracts is different, raise error
				/*eoc szanznaney SRF133 check on Business place*/
				//Step 7 --> Proceed to Cust Docs :)

				//Begin of Code for Above Steps:
				//Check 1 --> Check if Document(s) / AMP / LLFL(s) are NOT selected --> Error "Select document(s)/ AMP / LLFL(s) to proceed"
				this.docs_found_based_on_LLFL_or_AMP = false;
				var error = false;
				if (!error) {
					error = this.CustDoc_Check1(error);
				}
				if (this.docs_found_based_on_LLFL_or_AMP === false) {
					//Check 2 --> Check if Selected Document(s) contain both - Contract(s) AND Quote(s) --> Error "Cannot Proceed with Contract(s) and Quote(s) at same time..!!"
					if (!error) {
						error = this.CustDoc_Check2(error);
					}
					//Check 3 --> Check if Selected Document(s) are from multiple AMP ID --> Error "Document(s) for More than 1 AMP ID Selected..!!"
					if (!error) {
						error = this.CustDoc_Check3(error);
					}
					//Check 4 --> Document should have have AMP(amp) Information OR allowed for UPFRONT(Nav_To_Cust_Docs === "X") --> Error "Navigation to Cust Docs not supported for Selected Document(s) - (i.e. Without AMP ID)"
					if (!error) {
						error = this.CustDoc_Check4(error);
					}
					//Check 5 --> Sold To, Sold To Contact, Bill To Party if not in sync --> Error "Sold To Party, Sold To Contact and Bill to Party are not consistent in selected documents..!!"
					if (!error) {
						error = this.CustDoc_Check5(error);
					}

					/*soc szanznaney SRF133 check on Business place*/
					//Check 7 --> check if business places are same -->If all the Business Places for selected contracts is different, raise error
					if (!error) {
						error = this.CustDoc_Check7(error);
					}
					/*eoc szanznaney SRF133 check on Business place*/

					//Check 6 --> "Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?"
					if (!error) {
						var amp = this.amps[0];
						var type = "G";
						var documents = this.contracts;

						if (this.quotes.length > 0) {
							type = "B";
							documents = this.quotes;
						}
						var controller = this;
						var document = "";
						for (i = 0; i < documents.length; i++) {
							var doc = controller.append0s(documents[i].trim(), 10);
							if (i > 0) {
								document = document + "," + doc;
							} else {
								document = doc;
							}
						}
						var url = window.location.href;
						url = url.substring(0, url.lastIndexOf("#"));
						if (url.lastIndexOf("?") === -1) {
							url = url + "?";
						} else {
							url = url + "&";
						}

						url = url + "#zcust_doc-manage&/Dashboard/" + document + "/" + amp + "/" + type;
						// BOC SDAS52 ER-1036 11/11/2020
						if (this.SignatureFlag == "X") {
							var overrideData1 = "/" + this.SignatureFlag;
							var sUrl = url + "/" + "null" + "/" + "null" + "/" + this.SignatureFlag;
						} else {
							sUrl = url;
						}
						if (this.warning_partners.length === 1) {
							sap.m.URLHelper.redirect(sUrl, true);

							// if (this.warning_partners.length === 1) {
							// 	sap.m.URLHelper.redirect(url, true);
							// EOC SDAS52 ER-1036 11/11/2020
						} else {
							// BOC SDAS52 ER-1036 11/10/2020
							if (this.SignatureFlag && this.SignatureFlag === 'X') {
								var sMsg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MultipleContractPopupMsgSignature");
							} else {
								sMsg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MultipleContractPopupMsg");
							}
							// EOC SDAS52 ER-1036 11/10/2020
							sap.m.MessageBox.show(
								// BOC SDAS52 ER-1036 11/10/2020
								// "Bill To Contact, Contract Admin, AOL and Sales Rep are not consistent in selected documents..!! \n Do you wish to proceed?", {
								sMsg, {
									// EOC SDAS52 ER-1036 11/10/2020
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Partner Function(s) Inconsistent!",
									actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
									onClose: function (sAction1) {
										if (sAction1 === "OK") {

											//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

											//start of comment out from original code
											// sap.m.URLHelper.redirect(url, true);
											//end of comment out from original code

											//ADDITIONALLY: Subview_Results_PrintOptionsDialog created

											// sending URL to global variable
											url_pass = url;

											//create new JSON Model
											var newJSONModel = new sap.ui.model.json.JSONModel();

											//no duplicates should be present in dropdown
											var duplicate_removal_wp = this.warning_partners;
											var duplicate_removal_wp_names = this.wp_names;

											//unique arrays for duplicates check
											var unique_AOL = [];
											var unique_Contract_Admin = [];
											var unique_Bill_To_Contact = [];
											var unique_Sales_Rep = [];
											var unique_AOL_names = [];
											var unique_Contract_Admin_names = [];
											var unique_Bill_To_Contact_names = [];
											var unique_Sales_Rep_names = [];
											// BOC SDAS52 ER-1036 11/10/2020
											var unique_Admin_Signer = [];
											var unique_Admin_Signer_names = [];
											// EOC SDAS52 ER-1036 11/10/2020
											//loop through array
											for (i = 0; i < duplicate_removal_wp.length; i++) {

												//if unique, push into temp array
												if (unique_AOL.indexOf(duplicate_removal_wp[i].AOL) === -1) {
													unique_AOL.push(duplicate_removal_wp[i].AOL);
													// unique_AOL_names.push(duplicate_removal_wp_names[i].Account_Ops_Lead_Name);
													/***INC0131976 8/31/2020 PN S4 - PF Inconsistency Check Issue in CMD for Cust Doc SOC-MSA1 breaking when wp_names are less than wp*/
													if (duplicate_removal_wp_names[i]) {
														unique_AOL_names.push(duplicate_removal_wp_names[i].Account_Ops_Lead_Name);
													}
													/*INC0131976 8/31/2020 PN S4 - PF Inconsistency Check Issue in CMD for Cust Doc SOC-MSA1 breaking when wp_names are less than wp***/
												}

												//if unique, push into temp array
												if (unique_Sales_Rep.indexOf(duplicate_removal_wp[i].Sales_Rep) === -1) {
													unique_Sales_Rep.push(duplicate_removal_wp[i].Sales_Rep);
													// unique_Sales_Rep_names.push(duplicate_removal_wp_names[i].Sales_Rep_Name);
													/***INC0131976 8/31/2020 PN S4 - PF Inconsistency Check Issue in CMD for Cust Doc SOC-MSA1 breaking when wp_names are less than wp*/
													if (duplicate_removal_wp_names[i]) {
														unique_Sales_Rep_names.push(duplicate_removal_wp_names[i].Sales_Rep_Name);
													}
													/*INC0131976 8/31/2020 PN S4 - PF Inconsistency Check Issue in CMD for Cust Doc SOC-MSA1 breaking when wp_names are less than wp***/
												}
												// BOC SDAS52 ER-1036 11/10/2020
												if (unique_Admin_Signer.indexOf(duplicate_removal_wp[i].Admin_Signer) === -1) {
													unique_Admin_Signer.push(duplicate_removal_wp[i].Admin_Signer);
													if (duplicate_removal_wp_names[i]) {
														unique_Admin_Signer_names.push(duplicate_removal_wp_names[i].Admin_Signer_Name);
													}
												}
												// EOC SDAS52 ER-1036 11/10/2020

												//if unique, push into temp array
												if (unique_Bill_To_Contact.indexOf(duplicate_removal_wp[i].Bill_To_Contact) === -1) {
													unique_Bill_To_Contact.push(duplicate_removal_wp[i].Bill_To_Contact);
													unique_Bill_To_Contact_names.push(duplicate_removal_wp_names[i].Bill_to_Contact_Name);
												}

												//if unique, push into temp array
												if (unique_Contract_Admin.indexOf(duplicate_removal_wp[i].Contract_Admin) === -1) {
													unique_Contract_Admin.push(duplicate_removal_wp[i].Contract_Admin);
													unique_Contract_Admin_names.push(duplicate_removal_wp_names[i].Contract_Admin_Contact_Name);
												}
											}

											//character in between ID and name
											var concatChar;

											//converting from array to array of objects
											var AOL = [];
											for (i = 0; i < unique_AOL.length; i++) {

												//between ID and name
												concatChar = " : ";

												//if both are empty, then don't do anything
												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	if (!(unique_AOL[i] === "" && unique_AOL_names[i] === "")) {
												/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/

												//no concatenation ":" if one of them is empty
												if (unique_AOL[i] === "" || unique_AOL_names[i] === "") {
													concatChar = "";
												}
												AOL.push({
													AOL: unique_AOL[i] + concatChar + unique_AOL_names[i],
													AOL_key: unique_AOL[i]
												});
												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	}	/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/
											}

											var Contract_Admin = [];
											for (i = 0; i < unique_Contract_Admin.length; i++) {

												//between ID and name
												concatChar = " : ";

												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//if both are empty, then don't do anything
												//	if (!(unique_Contract_Admin[i] === "" && unique_Contract_Admin_names[i] === "")) {
												/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/

												//no concatenation if one of them is empty
												if (unique_Contract_Admin[i] === "" || unique_Contract_Admin_names[i] === "") {
													concatChar = "";
												}
												Contract_Admin.push({
													Contract_Admin: unique_Contract_Admin[i] + concatChar + unique_Contract_Admin_names[i],
													Contract_Admin_key: unique_Contract_Admin[i]
												});
												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	}	/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/
											}

											var Bill_To_Contact = [];
											for (i = 0; i < unique_Bill_To_Contact.length; i++) {

												//between ID and name
												concatChar = " : ";

												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	if (!(unique_Bill_To_Contact[i] === "" && unique_Bill_To_Contact_names[i] === "")) {
												/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/

												//no concatenation if one of them is empty
												if (unique_Bill_To_Contact[i] === "" || unique_Bill_To_Contact_names[i] === "") {
													concatChar = "";
												}
												Bill_To_Contact.push({
													Bill_To_Contact: unique_Bill_To_Contact[i] + concatChar + unique_Bill_To_Contact_names[i],
													Bill_To_Contact_key: unique_Bill_To_Contact[i]
												});
												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	}	/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/
											}

											var Sales_Rep = [];
											for (i = 0; i < unique_Sales_Rep.length; i++) {

												//between ID and name
												concatChar = " : ";

												//if both are empty, then don't do anything
												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	if (!(unique_Sales_Rep[i] === "" && unique_Sales_Rep_names[i] === "")) {
												/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/

												//no concatenation if one of them is empty
												if (unique_Sales_Rep[i] === "" || unique_Sales_Rep_names[i] === "") {
													concatChar = "";
												}
												Sales_Rep.push({
													Sales_Rep: unique_Sales_Rep[i] + concatChar + unique_Sales_Rep_names[i],
													Sales_Rep_key: unique_Sales_Rep[i]
												});
												/***INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well SOC*/
												//	}	/*INC0131976 MSA1 9/17 Commenting the if condition because user wants blank value as well EOC***/
											}
											// BOC SDAS52 ER-1036 11/10/2020
											var Admin_Signer = [];
											for (i = 0; i < unique_Admin_Signer.length; i++) {

												//between ID and name
												concatChar = " : ";
												if (unique_Admin_Signer[i] === "" || unique_Admin_Signer_names[i] === "") {
													concatChar = "";
												}
												Admin_Signer.push({
													Admin_Signer: unique_Admin_Signer[i] + concatChar + unique_Admin_Signer_names[i],
													Admin_Signer_key: unique_Admin_Signer[i]
												});
											}
											newJSONModel.setProperty("/idAdminSignerEnabled", false);
											newJSONModel.setProperty("/idAdminSignerVisible", false);

											newJSONModel.setProperty("/Admin_Signer", Admin_Signer);

											if (this.SignatureFlag && this.SignatureFlag === 'X') {
												newJSONModel.setProperty("/idAdminSignerVisible", true);
												if (Admin_Signer.length > 0) {
													newJSONModel.setProperty("/idAdminSignerEnabled", true);
												}
											}
											// EOC SDAS52 ER-1036 11/10/2020
											//initially set visibility to false
											newJSONModel.setProperty("/idSalesRepEnabled", false);
											newJSONModel.setProperty("/idContractAdminContactEnabled", false);
											newJSONModel.setProperty("/idAccountOpsLeadEnabled", false);
											newJSONModel.setProperty("/idBillToContactEnabled", false);

											//make override dropdowns enabled only if more than one option available
											if (Sales_Rep.length > 1) {
												newJSONModel.setProperty("/idSalesRepEnabled", true);
											}
											if (Contract_Admin.length > 1) {
												newJSONModel.setProperty("/idContractAdminContactEnabled", true);
											}
											if (AOL.length > 1) {
												newJSONModel.setProperty("/idAccountOpsLeadEnabled", true);
											}
											if (Bill_To_Contact.length > 1) {
												newJSONModel.setProperty("/idBillToContactEnabled", true);
											}

											//setting the binding properties
											newJSONModel.setProperty("/AOL", AOL);
											newJSONModel.setProperty("/Contract_Admin", Contract_Admin);
											newJSONModel.setProperty("/Bill_To_Contact", Bill_To_Contact);
											newJSONModel.setProperty("/Sales_Rep", Sales_Rep);

											//create dialog with fragment
											this._oDialogBox = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.Subview_Results_PrintOptionsDialog",
												this);

											//adding dependent
											this.getView().addDependent(this._oDialogBox);

											//open dialog
											this._oDialogBox.open();

											//setting the model to the view
											this.getView().setModel(newJSONModel, "viewData");

											//ADDITIONALLY: '.bind(this)' statement added to onClose() function of warning message

											//ADDITIONALLY: methods have been added at the end for dialog box functioning

											//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
										}

									}.bind(this)
								});
						}
					}

				}
				break;
			case "Create Group Contract":
				// sSemanticObj = "Contract";
				// sAction = "create";
				// this.navigateTo(sSemanticObj, sAction);

				/****BoC for Defect 75135: 01/08/2019- Changes to include parameters during cross app navigation ****/
				sSemanticObj = "Contract";
				var oTreeTable = this.getView().byId("id_cntdb_tree1");
				var selectedIndices = oTreeTable.getSelectedIndices();
				var equipments = [];
				var controller = this;
				if (selectedIndices.length > 0) {
					for (var i = 0; i < selectedIndices.length; i++) {
						var path = oTreeTable.getContextByIndex(selectedIndices[i]).sPath.split("/");
						path.splice(0, 1); //remove first element - ""
						var obj = oTreeTable.getModel().getData()[path[0]];
						for (var j = 1; j < path.length; j++) {
							obj = obj[path[j]];
						}
						var url = window.location.href;
						url = url.substring(0, url.lastIndexOf("#"));
						// if (url.lastIndexOf("?") === -1) {
						// 	url = url + "?";
						// } else {
						// 	url = url + "&";
						// }
						var oSalesorg = obj.data.Sales_Org;
						var oContractType = "ZGRP";
						var oDisChannel = obj.data.VTWEG;
						var oDivision = obj.data.SPART;
						sSemanticObj = "SalesDocument";
						sAction = "createContract";
						url = url + "#Contract-create?" + "AAT=" + oContractType + "&VKO=" + oSalesorg + "&VTW=" + oDisChannel + "&SPA=" + oDivision;
						sap.m.URLHelper.redirect(url, true);
					}
				} else {
					// sap.m.MessageBox.show(
					// 	"Select Rows to Proceed..!!", {
					// 		icon: sap.m.MessageBox.Icon.ERROR,
					// 		title: "Error",
					// 		actions: [sap.m.MessageBox.Action.OK]
					// 	});
					var url = window.location.href;
					url = url.substring(0, url.lastIndexOf("#"));
					url = url + "#Contract-create?";
					sap.m.URLHelper.redirect(url, true);
				}
				/****EoC for Defect 75135: 01/08/2019 ****/
				break;
			case "Create Functional Location":
				sSemanticObj = "MaintenanceObject";
				sAction = "createFLOC";
				this.navigateTo(sSemanticObj, sAction);
				break;

				/*****BoC for SRR071D enhancements- 13/09/2019*****/
			case "Credit Memo Request":
				sSemanticObj = "CreditMemoRequest";
				sAction = "create";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Standalone Credit":
				sSemanticObj = "SalesOrder";
				sAction = "create";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Debit Memo Request":
				sSemanticObj = "DebitMemoRequest";
				sAction = "create";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Swap Equipments":
				this.oRouter.navTo("SwapEquipments", {});
				/*****EoC for SRR071D enhancements- 13/09/2019*****/

				//*******START OF SRF106D_4 Sprint 1.7 September Release CHANGES BY ARJUN*********//

				break;

				//new cases for semi-automation menu items

				//Add to Holding Area
			case "Add to Holding Area":

				//Check 1 --> Check if Document(s) / AMP / LLFL(s) are NOT selected --> Error "Select document(s)/ AMP / LLFL(s) to proceed"
				this.docs_found_based_on_LLFL_or_AMP = false;
				error = false;
				if (!error) {
					error = this.CustDoc_Check1(error);
				}

				//if check 1 does not fail
				if (!error) {

					//create dialog with fragment
					this._oDialogAddToHA = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.Subview_Results_AddToHADialog",
						this);

					/*szanzaney*/

					var oJSONHoldingArea = new sap.ui.model.json.JSONModel();

					this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");

					this.getOwnerComponent().getModel().read("/ETY_HOLDING_AREASet", {
						method: "GET",
						success: function (oDataRefresh) {

							//json model
							var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

							// var rbData = [];
							for (var i = 0; i < oDataRefresh.results.length; i++) {

								oJSONHoldingArea.setProperty("/rbData", oDataRefresh.results);
								oJSONHoldingArea.setProperty("/numberOfSharedAreas", oDataRefresh.results.length);

							}
							//GET call for holding area data
							this._semiAutomationCalls("ViewHoldingArea");
						}.bind(this),

						error: function (oError) {

							//error message
							var responseText = JSON.parse(oError.responseText);
							var msg = responseText.error.message.value;
							MessageBox.error(msg);
						}
					});

					/*szanzaney*/

					//adding dependent
					this.getView().addDependent(this._oDialogAddToHA);

					//open dialog
					this._oDialogAddToHA.open();

					// //set busy indicator as true
					// this.getView().setBusy(true);

					// //holding areas of both types
					// var arraySD = [];
					// var arrayCS = [];
					// var arraySH = [];

					// //GET call with entity set ETS_CHANGELOGSet
					// this.getOwnerComponent().getModel().read("/Ety_Add_Holding_AreaSet", {
					// 	method: "GET",
					// 	success: function (oData) {

					// 		//loop through results
					// 		for (i = 0; i < oData.results.length; i++) {

					// 			//if sales doc record
					// 			if (oData.results[i].HoldingType === "S") {

					// 				arraySD.push(oData.results[i]);
					// 			}

					// 			//if channeling spreadsheet record
					// 			else if (oData.results[i].HoldingType === "C") {

					// 				arrayCS.push(oData.results[i]);
					// 			}
					// 			//if shared record
					// 			else if (oData.results[i].HoldingType === "H") {

					// 				arraySH.push(oData.results[i]);
					// 			}
					// 		}

					// 		var flagSD = 0;

					// 		//loop through selected contracts
					// 		for (i = 0; i < this.contracts.length; i++) {

					// 			for (j = 0; j < arraySD.length; j++) {

					// 				if (arraySD[j].Document === this.contracts[i]) {
					// 					flagSD++;
					// 					continue;
					// 				}
					// 			}
					// 		}

					// 		if (flagSD === this.contracts.length) {
					// 			sap.ui.getCore().byId("idSalesDocRB").setEnabled(false);
					// 			sap.ui.getCore().byId("idMsgStrip2").setVisible(true);
					// 		} else if (flagSD !== 0) {
					// 			sap.ui.getCore().byId("idMsgStrip1").setVisible(true);
					// 		}

					// 		var flagCS = 0;

					// 		//loop through selected contracts
					// 		for (i = 0; i < this.contracts.length; i++) {

					// 			for (j = 0; j < arrayCS.length; j++) {

					// 				if (arrayCS[j].Document === this.contracts[i]) {
					// 					flagCS++;
					// 					continue;
					// 				}
					// 			}
					// 		}

					// 		if (flagCS === this.contracts.length) {
					// 			sap.ui.getCore().byId("idChanSpreadRB").setEnabled(false);
					// 			sap.ui.getCore().byId("idMsgStrip2").setVisible(true);
					// 		} else if (flagCS !== 0) {
					// 			sap.ui.getCore().byId("idMsgStrip1").setVisible(true);
					// 		}

					// 		var flagSH = 0;

					// 		//loop through selected contracts
					// 		for (i = 0; i < this.contracts.length; i++) {

					// 			for (j = 0; j < arraySH.length; j++) {

					// 				if (arraySH[j].Document === this.contracts[i]) {
					// 					flagSH++;
					// 					continue;
					// 				}
					// 			}
					// 		}

					// 		if (flagSH === this.contracts.length) {
					// 			sap.ui.getCore().byId("idSharedRB").setEnabled(false);
					// 			sap.ui.getCore().byId("idMsgStrip2").setVisible(true);
					// 		} else if (flagSH !== 0) {
					// 			sap.ui.getCore().byId("idMsgStrip1").setVisible(true);
					// 		}

					// 		if (!sap.ui.getCore().byId("idSharedRB").getEnabled() && !sap.ui.getCore().byId("idChanSpreadRB").getEnabled() && !sap.ui.getCore()
					// 			.byId("idSalesDocRB").getEnabled()) {
					// 			sap.ui.getCore().byId("idBothRB").setEnabled(false);
					// 		}

					// 		//releasing busy indicator
					// 		this.getView().setBusy(false);
					// 	}.bind(this),
					// 	error: function (oError) {

					// 		//display reason for error in GET call to user
					// 		var responseText = JSON.parse(oError.responseText);
					// 		var msg = responseText.error.message.value;
					// 		MessageBox.error(msg);

					// 		//releasing busy indicator
					// 		this.getView().setBusy(false);
					// 	}.bind(this)
					// });
				}

				break;

				//View Holding Area
			case "View Holding Area":

				var oJSONHoldingArea = new sap.ui.model.json.JSONModel();

				oJSONHoldingArea.setProperty("/tableSalesDocVisible", true);
				oJSONHoldingArea.setProperty("/tableChanSpreadVisible", false);
				oJSONHoldingArea.setProperty("/tableSharedVisible", false);
				oJSONHoldingArea.setProperty("/rowCountSalesDoc", 0);
				oJSONHoldingArea.setProperty("/rowCountChanSpread", 0);
				oJSONHoldingArea.setProperty("/rowCountShared", 0);
				oJSONHoldingArea.setProperty("/tableDataSalesDoc", []);
				oJSONHoldingArea.setProperty("/tableDataChanSpread", []);
				oJSONHoldingArea.setProperty("/tableDataShared", []);
				oJSONHoldingArea.setProperty("/enableButtonsSD", false);
				oJSONHoldingArea.setProperty("/enableButtonsCS", false);
				oJSONHoldingArea.setProperty("/enableButtonsSH", false);

				//Seperating download flags	
				oJSONHoldingArea.setProperty("/enableButtonsSD_DW", false);
				oJSONHoldingArea.setProperty("/enableButtonsCS_DW", false);
				oJSONHoldingArea.setProperty("/enableButtonsSH_DW", false);

				this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");

				//create dialog with fragment
				this._oDialogViewHA = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.Subview_Results_ViewHADialog",
					this);

				this.getOwnerComponent().getModel().read("/ETY_HOLDING_AREASet", {
					method: "GET",
					success: function (oDataRefresh) {

						//json model
						var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

						// var rbData = [];
						for (var i = 0; i < oDataRefresh.results.length; i++) {

							oJSONHoldingArea.setProperty("/rbData", oDataRefresh.results);
							oJSONHoldingArea.setProperty("/numberOfSharedAreas", oDataRefresh.results.length);

						}
						//GET call for holding area data
						this._semiAutomationCalls("ViewHoldingArea");
					}.bind(this),

					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});

				//adding dependent
				this.getView().addDependent(this._oDialogViewHA);

				//open dialog
				this._oDialogViewHA.open();

				break;

				//Sales Document Upload
			case "Sales Document Upload":

				//cross app navigation to sales doc upload screen of cust doc app
				this._crossAppNavToCustDoc("S");

				break;

				//Channeling Spreadsheet Upload
			case "Channels Spreadsheet Upload":

				//cross app navigation to channeling spreadsheet upload screen of cust doc app
				this._crossAppNavToCustDoc("C");

				break;

				//*******END OF SRF106D_4 Sprint 1.7 September Release CHANGES BY ARJUN*********//

			default:
				break;
			}
		},
		onPressDeleteAttachment: function (oEvent) {
			var array = oEvent.getSource().getParent().getBindingContext().getPath().split("/");
			var index = array[array.length - 1];
			var row = this._attachments.getModel().getData()[index];
			var tableModel = this._attachments.getModel();

			var queryString = "(ARCHIV_ID='" + row.ARCHIV_ID +
				"',ARC_DOC_ID='" + row.ARC_DOC_ID +
				"',AR_OBJECT='" + row.AR_OBJECT +
				"',OBJECT_ID='" + row.OBJECT_ID +
				"',SAP_OBJECT='" + row.SAP_OBJECT + "')";

			var oModel = this.getOwnerComponent().getModel();
			oModel.remove("/Ets_Manage_Attach" + queryString, {
				method: "DELETE",
				success: function (data) {
					sap.m.MessageToast.show("Attachment Deleted");
					var results = tableModel.getData();
					for (var i = 0; i < results.length; i++) {
						if (results[i].ARCHIV_ID === row.ARCHIV_ID &&
							results[i].ARC_DOC_ID === row.ARC_DOC_ID &&
							results[i].AR_OBJECT === row.AR_OBJECT &&
							results[i].OBJECT_ID === row.OBJECT_ID &&
							results[i].SAP_OBJECT === row.SAP_OBJECT) {
							results.splice(i, 1);
							break;
						}
					}
					tableModel.setData(results);
					tableModel.refresh(true);
				},
				error: function (e) {
					//sap.m.MessageToast.show("Error Deleting Variant");
				}
			});
		},
		onPressAttachment: function (oEvent) {
			var array = oEvent.getSource().getParent().getBindingContext().getPath().split("/");
			var index = array[array.length - 1];
			var row = this._attachments.getModel().getData()[index];

			var queryString = "(CONTREP='" + row.CONTREP + "'," +
				"BDS_DOCID='" + row.BDS_DOCID + "'," +
				"TITLE='" + row.Title + "'," +
				"DOCUCLASS='" + row.DOCUCLASS + "')/$value";
			var sPath = "/sap/opu/odata/sap/ZSA_GW_CONTRACT_DB_SRV/Ets_File" + queryString;
			this.myWindow = window.open(sPath, "_blank");

		},

		onPressDownload: function (oEvent) {
			//var index = oEvent.getSource().getParent().getParent().getBindingContextPath().split("/")[1];
			var index = oEvent.getSource().getParent().getBindingContextPath().split("/")[1];
			var row = this._attachments.getModel().getData()[index];
			var queryString = "(CONTREP='" + row.CONTREP + "'," +
				"BDS_DOCID='" + row.BDS_DOCID + "'," +
				"TITLE='" + row.Title + "'," +
				"DOCUCLASS='" + row.DOCUCLASS + "')/$value";
			var sPath = "/sap/opu/odata/sap/ZSA_GW_CONTRACT_DB_SRV/Ets_File" + queryString;
			this.myWindow = window.open(sPath, "_blank");
		},
		onChangeExpandUptoLevel: function (oEvent) {
			var level = Number(oEvent.getSource().getSelectedKey());
			this.getView().byId("id_cntdb_tree1").collapseAll();
			this.getView().byId("id_cntdb_tree1").expandToLevel(level);
		},
		onPressResizeHorizontal: function (oEvent) {
			var oTreeTable = this.getView().byId("id_cntdb_tree1");
			var cols = oTreeTable.getColumns();
			for (var i = 0; i < cols.length; i++) {
				if (cols[i] !== undefined) {
					cols[i].setAutoResizable(true);
					oTreeTable.autoResizeColumn(i);
				}
			}
		},
		handlePressCollapseAll: function (oEvent) {
			this.getView().byId("id_inp_expand_upto_level").setSelectedKey("0");
			this.getView().byId("id_cntdb_tree1").collapseAll();

		},
		handlePressExpandAll: function (oEvent) {
			this.getView().byId("id_inp_expand_upto_level").setSelectedKey("10");
			this.getView().byId("id_cntdb_tree1").expandToLevel(10);

			var oTreeTable = this.getView().byId("id_cntdb_tree1");
			var cols = oTreeTable.getColumns();
			for (var i = 0; i < cols.length; i++) {
				if (cols[i] !== undefined) {
					cols[i].setAutoResizable(true);
					oTreeTable.autoResizeColumn(i);
				}
			}
		},
		onChangeHierarchy: function (oEvent) {
			var hierarchy = oEvent.getSource().getSelectedKey();
			var component = this.getOwnerComponent();
			var f = component.filters;

			var sFilters = component.filters[0].aFilters;
			for (var i = 0; i < sFilters.length; i++) {
				if (sFilters[i].sPath === "View_Flag") {
					sFilters[i].oValue1 = hierarchy;
					break;
				}
			}
			this.getOwnerComponent().hierarchySelectedKey = hierarchy;
			if (this.getOwnerComponent().hierarchySelectedKey === "1") {
				this.getView().getModel("viewData").setProperty("/moveEtoF", true);
			} else {
				this.getView().getModel("viewData").setProperty("/moveEtoF", false);
			}
			this.loadVariants();
			this.getReportData(f);
		},

		getReportData: function (f) {
			var controller = this;
			var component = this.getOwnerComponent();
			var path = "/Ets_Search";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json",
						"$expand": "Nav_Results,Nav_Excel_Output,to_cust_doc_amp,to_cust_doc_llfl"
					},
					filters: [new Filter(f, true)],
					success: function (data, response) {
						component.filters = f;
						component.results = data.results;
						component.fromView = "Search";
						controller.updateTableModel();
						oGlobalBusyDialog.close();
					},
					error: function (error) {
						oGlobalBusyDialog.close();
						var lv_msg_raised = false;
						if (error.responseText !== "" && error.responseText !== undefined) {
							if (error.responseText.includes("DBSQL_SQL_INTERNAL_DB_ERROR")) {
								sap.m.MessageBox.show(
									"Please narrow down the search criteria by entering additional parameters to main selection!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Service Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
								lv_msg_raised = true;
							}
						}
						if (!lv_msg_raised) {
							sap.m.MessageBox.show(
								error.statusText, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Service Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
					}
				});

		},
		onUploadFrag1: function (oevent) {
			var oUploadCollection = sap.ui.getCore().byId("id_upload_Attachment");
			//fU.setUploadUrl("/sap/opu/odata/sap/ZSA_GW_CONTRACT_DB_SRV_SRV/Ets_File");
			var sFileName = oUploadCollection.getItems();
			var that = this;
			var reader = new FileReader();
			var obj = {};
			that.batchChanges = [];

			function readFile(index) {
				if (index >= sFileName.length) {
					return;
				}
				var gfile = sFileName[index];
				reader.onload = function (e) {
					// get file content  
					var bin = e.target.result;
					// do sth with bin
					obj.VALUE = bin;
					obj.FILENAME = gfile.name;
					var mHeaders = {};
					mHeaders.slug = obj.FILENAME;
					that.oModel.setHeaders(mHeaders);
					that.batchChanges.push(that.getOwnerComponent().getModel().createBatchOperation(
						"Ets_File", "POST",
						obj));
					obj = {};
					readFile(index + 1);
				};
				reader.readAsBinaryString(gfile);
			}
			if (!sFileName) {
				sap.m.MessageBox.show(
					"Select a File First", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			} else {

				readFile(0);
				that.oModel.addBatchChangeOperations(that.batchChanges);
				that.oModel.submitBatch(function (data) {});
			}

		},
		onCancelFrag1: function (eve) {
			//var fU = sap.ui.getCore().byId("id_upload_Attachment");
			//fU.clear();
			this.uploadAttachment.close();

		},
		onAttachmentsUpload: function (oEvent) {
			if (!this.uploadAttachment) {
				this.uploadAttachment = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Upload_Attachment",
					this
				);

				this.getView().addDependent(this.uploadAttachment);
			}

			var comboBox = sap.ui.getCore().byId("id_comboBox_AttachmentCategory");
			var oModelJson = new sap.ui.model.json.JSONModel();

			oModelJson.setData(this.AttachmentCategory_Contracts);
			var oData = {
				DocumentCategories: [],
				selectedDocumentCategory: "ZSRMISC"
			};
			if (this._objectType === "Contract") {
				oData.DocumentCategories = this.AttachmentCategory_Contracts;
				//oModelJson.setData(this.AttachmentCategory_Contracts);
			} else if (this._objectType === "Functional Location (AMP)") {
				oData.DocumentCategories = this.AttachmentCategory_AMP;
				//oModelJson.setData(this.AttachmentCategory_AMP);
			} else if (this._objectType === "Quote") {
				oData.DocumentCategories = this.AttachmentCategory_Quotes;
				//oModelJson.setData(this.AttachmentCategory_Quotes);
			}
			var defCategory = "";
			for (var i = 0; i < oData.DocumentCategories.length; i++) {
				if (oData.DocumentCategories[i].DocumentCategory === "ZSRMISC") {
					defCategory = "ZSRMISC";
					break;
				}
			}
			if (defCategory === "") {
				if (oData.DocumentCategories.length > 0) {
					oData.selectedDocumentCategory = oData.DocumentCategories[0].DocumentCategory;
				}
			} else {
				oData.selectedDocumentCategory = defCategory;
			}
			oModelJson.setData(oData);
			comboBox.setModel(oModelJson);
			sap.ui.getCore().byId("UploadCollection").focus();
			var itemTemplate = new sap.ui.core.ListItem(); //  creating a ListItem object     
			itemTemplate.bindProperty("key", "DocumentCategory");
			itemTemplate.bindProperty("text", "Description");
			itemTemplate.bindProperty("additionalText", "DocumentType");

			comboBox.bindItems({
				path: "/DocumentCategories",
				template: itemTemplate,
				templateShareable: false
			});

			this.uploadAttachment.open();
			jQuery.sap.delayedCall(500, this, function () {
				sap.ui.getCore().byId("UploadCollection").focus();
			});
		},
		onAttachmentsClose: function (oEvent) {
			this._attachments.close();
		},
		onGlobalUpdateClose: function (oEvent) {
			this._globalUpdate.close();
		},
		handleTextFieldItemPress: function (oEvent) {
			var msg = "'" + oEvent.getParameter("item").getValue() + "' entered";
			MessageToast.show(msg);
		},
		onBack: function (oEvent) {
			this.oRouter.navTo("home", {});
		},
		onPressGlobalUpdate: function (oEvent) {
			this.oRouter.navTo("GlobalUpdate", {});
		},
		updateLayout: function (selectedColumns) {

			var oView = this.getView();
			var oTable = oView.byId("id_cntdb_tree1");

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
		onConfirm: function (oEvent) {

			var mParams = oEvent.getParameters();
			var selectedColumns = mParams.payload.columns.tableItems;
			this.layoutColumns = selectedColumns;
			this.updateLayout(this.layoutColumns);
			this.handleClose();
		},
		handleClose: function (oEvent) {
			this._oDialog.close();
		},
		handlePressPersonalize: function (oEvent) {

			// Open the Table Setting dialog
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.PersonalizationDialog", this);

				/*this._oSortPanel = this._oDialog.getAggregation("panels")[1];
				this._oFilterPanel = this._oDialog.getAggregation("panels")[2];

				this._oSortPanel.attachAddSortItem(this._onAddSortItem, this);
				this._oSortPanel.attachRemoveSortItem(this._onRemoveSortItem, this);
				this._oSortPanel.attachUpdateSortItem(this._onUpdateSortItem, this);

				this._oFilterPanel.attachAddFilterItem(this._onAddFilterItem, this);
				this._oFilterPanel.attachRemoveFilterItem(this._onRemoveFilterItem, this);
				this._oFilterPanel.attachUpdateFilterItem(this._onUpdateFilterItem, this);*/

				/*var oModelJson = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModelJson, "settings");
				this.getView().getModel("settings").setProperty("/ColumnCollection", this.settings.ColumnCollection);
				this.getView().getModel("settings").setProperty("/SortItems", this.settings.SortItems);
				this.getView().getModel("settings").setProperty("/FilterItems", this.settings.FilterItems);
				this._oDialog.setModel(this.getView().getModel("settings"));*/

				//this._aSortItems = [];
				//this._aFilterItems = [];
				//this._aGroupItems = [];
				this.getView().addDependent(this._oDialog, this);

			}
			var columnCollection = [];
			var cols = this._oTableColumns;
			var oTableCols = this.getView().byId("id_cntdb_tree1").getColumns();
			//First add existing columns from Table
			for (var a = 1; a < oTableCols.length; a++) {
				var obj = {};
				/***INC0167021 9/30/2020 MSA1 Admin is descoped hence hiding it, enter loop only if label has value SOC*/
				if (oTableCols[a].getAggregation("label").getProperty("text")) {
					obj.columnKey = oTableCols[a].getAggregation("template").getBindingInfo("text").parts[0].path;
					obj.text = oTableCols[a].getAggregation("label").getProperty("text");
					obj.visible = oTableCols[a].getVisible();
					columnCollection.push(obj);
				}
				/*INC0167021 9/30/2020 MSA1 Admin is descoped hence hiding it, enter loop only if label has value EOC***/
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
					/***INC0167021 9/30/2020 MSA1 Admin is descoped hence hiding it, enter loop only if label has value SOC*/
					if (cols[b].getAggregation("label").getProperty("text")) {
						obj1.columnKey = cols[b].getAggregation("template").getBindingInfo("text").parts[0].path;
						obj1.text = cols[b].getAggregation("label").getProperty("text");
						obj1.visible = false;
						columnCollection.push(obj1);
					}
					/*INC0167021 9/30/2020 MSA1 Admin is descoped hence hiding it, enter loop only if label has value EOC***/
				}
			}

			this.settings.ColumnCollection = columnCollection;

			var oModelJson = new sap.ui.model.json.JSONModel();
			oModelJson.setSizeLimit(1000);
			this.getView().setModel(oModelJson, "settings");
			this.getView().getModel("settings").setProperty("/ColumnCollection", this.settings.ColumnCollection);
			this.getView().getModel("settings").setProperty("/SortItems", this.settings.SortItems);
			this.getView().getModel("settings").setProperty("/FilterItems", this.settings.FilterItems);
			this._oDialog.setModel(this.getView().getModel("settings"));

			this._oDialog.open();

		},
		handleFilterPanel: function (oEvent, table) {
			var self = this;
			var aFilters = [];
			var filterItems = this._aFilterItems;

			for (var i = 0; i < filterItems.length; i++) {
				var filterItem = filterItems[i];
				var sPath1 = filterItem.getColumnKey();
				var vOperator = filterItem.getOperation();
				var vValue1 = filterItem.getProperty("value1");
				var vValue2 = filterItem.getProperty("value2");
				var oFilter = new sap.ui.model.Filter(sPath1, vOperator, vValue1, vValue2);
				if (vValue1 !== "") {
					aFilters.push(oFilter);
				}
			}

			if (aFilters.length > 0) {
				self.getView().byId(table).setModel(self.getView().getModel());
				self.getView().byId(table).getBinding("rows").filter(aFilters);
				aFilters = [];
			}
		},
		handleSortPanel: function (oEvent, table) {
			var self = this;
			var aSorters = [];
			var sortItems = this._aSortItems;
			for (var i = 0; i < sortItems.length; i++) {
				var sortItem = sortItems[i];
				if (sortItem.getOperation() === "Descending") {
					aSorters.push(new window.sap.ui.model.Sorter(sortItem.getProperty("columnKey"), true));
				}
				if (sortItem.getOperation() === "Ascending") {
					aSorters.push(new window.sap.ui.model.Sorter(sortItem.getProperty("columnKey"), false));
				}
			}
			if (aSorters.length > 0) {
				self.getView().byId(table).getBinding("rows").sort(aSorters);
				aSorters = [];
			}
		},
		_onAddFilterItem: function (oEvent) {
			var oFilterPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oFilterItem = oEvent.getParameter("filterItemData");
			oFilterPanel.addFilterItem(oFilterItem);
			var key = (oParameters.key).split("_");
			this._aFilterItems[key[key.length - 1]] = oFilterItem;
		},
		_onRemoveFilterItem: function (oEvent) {
			var oFilterPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters();
			var key = (oParameters.key).split("_");
			oFilterPanel.removeFilterItem(this._aFilterItems[key[key.length - 1]]);
			delete this._aFilterItems[oParameters.key];
		},
		_onUpdateFilterItem: function (oEvent) {
			var oFilterPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oFilterItem = oEvent.getParameter("filterItemData");
			var aFilterItems = oFilterPanel.getFilterItems();
			var key = (oParameters.key).split("_");
			for (var i = 0; i < aFilterItems.length; i++) {
				if (aFilterItems[i] === this._aFilterItems[key[key.length - 1]]) {
					break;
				}
			}
			oFilterPanel.removeFilterItem(this._aFilterItems[key[key.length - 1]]);
			oFilterPanel.insertFilterItem(oFilterItem, i);
			this._aFilterItems[key[key.length - 1]] = oFilterItem;
		},
		_onAddSortItem: function (oEvent) {
			var oSortPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oSortItem = oEvent.getParameter("sortItemData");
			var key = (oParameters.key).split("_");
			oSortPanel.addSortItem(oSortItem);
			this._aSortItems[key[key.length - 1]] = oSortItem;
		},
		_onRemoveSortItem: function (oEvent) {
			var oSortPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters();
			var key = (oParameters.key).split("_");
			oSortPanel.removeSortItem(this._aSortItems[key[key.length - 1]]);
			delete this._aSortItems[key[key.length - 1]];
		},
		_onUpdateSortItem: function (oEvent) {
			var oSortPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oSortItem = oEvent.getParameter("sortItemData");
			var key = (oParameters.key).split("_");
			var aSortItems = oSortPanel.getSortItems();
			for (var i = 0; i < aSortItems.length; i++) {
				if (aSortItems[i] === this._aSortItems[key[key.length - 1]]) {
					break;
				}
			}
			oSortPanel.removeSortItem(this._aSortItems[key[key.length - 1]]);
			oSortPanel.insertSortItem(oSortItem, i);
			this._aSortItems[key[key.length - 1]] = oSortItem;
		},
		_onAddGroupItem: function (oEvent) {
			/*var oGroupPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oGroupItem = oEvent.getParameter("groupItemData"),
				oList = oGroupPanel.getBinding("items").oList,
				sKey = oGroupItem.getColumnKey();
			oGroupItem.removeAllCustomData();
			for (var i = 0; i < oList.length; i++) {
				if (oList[i].sColumnKey === sKey) {
					if (oList[i].fnVGroup) {
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: oList[i].fnVGroup
						}));
					} else {
						var sText = oList[i].sColumnI18nKey;
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: function (oContext) {
								var sName = oContext.getProperty(sKey);
								return {
									key: sName,
									text: "{i18n>" + sText + "}: " + sName
								};
							}
						}));
					}
					break;
				}
			}
			oGroupPanel.addGroupItem(oGroupItem);
			this._aGroupItems[oParameters.key] = oGroupItem;*/
		},
		_onRemoveGroupItem: function (oEvent) {
			var oGroupPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters();
			oGroupPanel.removeGroupItem(this._aGroupItems[oParameters.key]);
			delete this._aGroupItems[oParameters.key];
		},
		_onUpdateGroupItem: function (oEvent) {
			/*var oGroupPanel = oEvent.getSource(),
				oParameters = oEvent.getParameters(),
				oGroupItem = oEvent.getParameter("groupItemData"),
				oList = oGroupPanel.getBinding("items").oList,
				sKey = oGroupItem.getColumnKey();
			oGroupItem.removeAllCustomData();
			for (var i = 0; i < oList.length; i++) {
				if (oList[i].sColumnKey === sKey) {
					if (oList[i].fnVGroup) {
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: oList[i].fnVGroup
						}));
					} else {
						var sText = oList[i].sColumnI18nKey;
						oGroupItem.addCustomData(new sap.ui.core.CustomData({
							key: "fnVGroup",
							value: function (oContext) {
								var sName = oContext.getProperty(sKey);
								return {
									key: sName,
									text: "{i18n>" + sText + "} : " + sName
								};
							}
						}));
					}
					break;
				}
			}
			var aGroupItems = oGroupPanel.getGroupItems();
			for (i = 0; i < aGroupItems.length; i++) {
				if (aGroupItems[i] === this._aGroupItems[oParameters.key]) {
					break;
				}
			}
			oGroupPanel.removeGroupItem(this._aGroupItems[oParameters.key]);
			oGroupPanel.insertGroupItem(oGroupItem, i);
			this._aGroupItems[oParameters.key] = oGroupItem;*/
		},
		onPressOAC: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContext().sPath;
			var array = sPath.split("/");
			var obj = this.getView().byId("id_cntdb_tree1").getModel().getData();
			for (var i = 1; i < array.length; i++) {
				obj = obj[array[i]];
			}
			obj = obj.data;
			var quote = obj.Quote;
			quote = quote.trim();
			var oServiceModel = this.getOwnerComponent().getModel();
			sPath = "/Ets_Read_Text(TEXT_NAME='" + quote + "',LANGUAGE='EN',TEXT_ID='ZOAC',TEXT_OBJECT='VBBK')";
			var controller = this;
			var mParameters = {
				method: "GET",
				async: false, //AND
				success: jQuery.proxy(function (oData) {
					//add dialog
					var dialog = new sap.m.Dialog({
						title: 'OAC Log - ' + quote,
						type: 'Message',
						content: new sap.m.FormattedText({
							htmlText: oData.TEXT
						}),
						beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();

				}, this),

				error: jQuery.proxy(function (oError) {
					var k = JSON.parse(oError.responseText);
					var msg = k.error.message.value;
					MessageToast.show(msg);
				}, this)
			};

			oServiceModel.read(sPath, mParameters);

		},
		handleObjectIDPress: function (oEvent) {
			this.node = oEvent.getSource().getParent()._oNodeState.groupID.split("/");
			this.node = this.node[(this.node.length - 2)];
			var sPath = oEvent.getSource().getParent().getBindingContext().sPath;
			var array = sPath.split("/");
			var obj = this.getView().byId("id_cntdb_tree1").getModel().getData();
			var oButton = oEvent.getSource();
			for (var i = 1; i < array.length; i++) {
				obj = obj[array[i]];
			}
			obj = obj.data;
			var text = obj.Object_Type;
			this._objectIdSelected = obj.Object;
			this._IsFederal = obj.IsFederal; //June
			this._objectType = obj.Object_Type;

			//Defect 75135
			this._salesorg = obj.Sales_Org;
			this._distChannel = obj.VTWEG;
			this._division = obj.SPART;

			if (this._objectType === "Functional Location (AMP)") {
				this.visibleifAMP = true;
			} else {
				this.visibleifAMP = false;
			}
			if (this._objectIdSelected !== "") {
				this.mData = {
					"title": this._objectIdSelected,
					"change": this.change,
					"visibleifAMP": this.visibleifAMP
				};

				//June
				if (this._IsFederal) {
					this.mData.change = this.changeFederal;
				}
				//June
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(this.mData);

				if (text === "Contract") {
					this.sap_object = "BUS2034";
					this.menuContract.setModel(oModel);
					jQuery.sap.delayedCall(
						0,
						this,
						function () {
							this.menuContract.openBy(oButton);
						}
					);
				} else if (text === "Functional Location" || text === "MLFL" || text === "LLFL" || text === "Functional Location (AMP)") {
					this.sap_object = "BUS0010";
					this.menuFunctionalLocation.setModel(oModel);
					jQuery.sap.delayedCall(
						0,
						this,
						function () {
							this.menuFunctionalLocation.openBy(oButton);
						}
					);
				} else if (text === "Sold To") {
					MessageToast.show("Navigation Links Not Available for Customer..!!");
					/*this.sap_object = "";
					this.menuCustomer.setModel(oModel);
					jQuery.sap.delayedCall(
						0,
						this,
						function () {
							this.menuCustomer.openBy(oButton);
						}
					);*/
				} else if (text === "Equipment") {
					this.sap_object = "";
					this.menuEquipment.setModel(oModel);
					jQuery.sap.delayedCall(
						0,
						this,
						function () {
							this.menuEquipment.openBy(oButton);
						}
					);
				} else if (text === "Renewal Quote" || text === "New Business Quote" || text === "Quote") {
					this.sap_object = "BUS2031";
					this.menuQuote.setModel(oModel);
					jQuery.sap.delayedCall(
						0,
						this,
						function () {
							this.menuQuote.openBy(oButton);
						}
					);

				}
			}
		},
		// Function to handle cross-app navigation from Create button
		navigateTo: function (sSemanticObj, sAction) {
			var selectedObject = this.mData.title;
			var xnavservice, href, url;
			xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
				"CrossApplicationNavigation");
			if (sSemanticObj === "MaintenanceObject" && selectedObject !== "") {

				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					},
					params: {
						"MaintenanceObject": selectedObject
					}
				})) || "";
			} else if (sSemanticObj === "zcust_doc" ||
				(sSemanticObj === "MaintenanceObject" && selectedObject === "") ||
				(sSemanticObj === "Contract" && selectedObject === "")) {
				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					}
				})) || "";
			} else if (sSemanticObj === "Contract" && selectedObject !== "") {
				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					},
					params: {
						"Contract": selectedObject
					}
				})) || "";
				/** BoC for SRR071D Enhancements - 13/09/2019**/
			} else if (sSemanticObj === "CreditMemoRequest") {
				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					},
					params: {
						"CreditMemoRequestType": "ZCR1"
					}
				})) || "";
			} else if (sSemanticObj === "SalesOrder") {
				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					},
					// params: {
					// 	"CreditMemoRequestType": "ZCR1"
					// }
				})) || "";
			} else if (sSemanticObj === "DebitMemoRequest") {
				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					},
					params: {
						"DebitMemoRequestType": "ZDR1"
					}
				})) || "";
				/** EoC for SRR071D Enhancements - 13/09/2019**/
			} else if (sSemanticObj === "Quotation" && selectedObject !== "") {
				href = (xnavservice && xnavservice.hrefForExternal({
					target: {
						semanticObject: sSemanticObj,
						action: sAction
					},
					params: {
						"Quotation": selectedObject
					}
				})) || "";
			}

			//Generate a  URL for the second application
			url = window.location.href.split("#")[0] + href;
			//Navigate to second app
			sap.m.URLHelper.redirect(url, true);
		},
		get_Attachments: function (selectedObject) {

			var filterArray = [];
			filterArray.push(new Filter({
				path: "OBJECT_ID",
				operator: FilterOperator.EQ,
				value1: selectedObject
			}));
			filterArray.push(new Filter({
				path: "SAP_OBJECT",
				operator: FilterOperator.EQ,
				value1: this.sap_object
			}));
			var f = [];
			f.push(filterArray);
			var path = "/Ets_Manage_Attach";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var controller = this;

			/* BoC for Defects 75080 , 75082 - 31/07/2019*/
			sap.ui.getCore().byId("idDeleteAttachment").setVisible(false);
			sap.ui.getCore().byId("idUploadAttachment").setVisible(false);
			sap.ui.getCore().byId("id_mA_OutputAndAttachments").getColumns()[4].setVisible(false);
			/* EoC for Defects 75080 , 75082 - 31/07/2019*/

			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: [new Filter(
						filterArray,
						true)],
					success: function (data, response) {
						controller.attachmentsData = data.results;
						var oModel1 = new sap.ui.model.json.JSONModel(controller.attachmentsData);
						controller._attachments.setModel(oModel1);

						/* BoC for Defects 75080 , 75082 - 31/07/2019*/
						if (controller.oAttachDelete === true) {
							sap.ui.getCore().byId("id_mA_OutputAndAttachments").getColumns()[4].setVisible(true);
							sap.ui.getCore().byId("idDeleteAttachment").setVisible(true);
						} else {
							sap.ui.getCore().byId("idDeleteAttachment").setVisible(false);
							sap.ui.getCore().byId("id_mA_OutputAndAttachments").getColumns()[4].setVisible(false);
						}
						if (controller.change === true) {
							sap.ui.getCore().byId("idUploadAttachment").setVisible(true);
						} else {
							sap.ui.getCore().byId("idUploadAttachment").setVisible(false);
						}
						/* EoC for Defects 75080 , 75082 - 31/07/2019*/

						controller._attachments.open();
						oGlobalBusyDialog.close();
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
		},
		onCrossAppNavigate: function (oEvent) {
			var object = this._objectIdSelected.replace(/\s/g, ""); //AKADAM16MAY2019+
			var selectedObject = this.mData.title;
			var sCreateActionSelected = oEvent.getSource().getText();
			var sSemanticObj, sAction;

			// Selection of Semantic Object & Action pair
			switch (sCreateActionSelected) {
			case "Link to Hybris":
				var url = this.HybrisLink;
				//Navigate to Hybris
				sap.m.URLHelper.redirect(url, true);
				break;
			case "Group Contract -	VA41":
				sSemanticObj = "SalesDocument";
				sAction = "createContract";
				break;
			case "Generate/ Email Cust Doc":
				var path = this.node.split("_");
				var oTreeTable = this.getView().byId("id_cntdb_tree1");
				var results = oTreeTable.getModel().getData();

				var obj = results[path[0]];
				for (var i = 1; i < path.length; i++) {
					obj = obj[path[i]];
				}
				obj = obj.data;
				var document = "null";
				if (obj.Contract.trim() !== "") {
					document = this.append0s(obj.Contract.trim(), 10);
				}

				var amp = obj.AMP.trim();
				if (amp === "" && obj.Nav_To_Cust_Docs === "X") {
					amp = "null";
				}
				var type = "G";
				//BOC by Aniket 23/12/2019 INC0061203
				if (obj.Object_Type === "Quote" || obj.Object_Type === "Inquiry") {
					if (selectedObject.trim() !== "") {
						document = this.append0s(selectedObject.trim(), 10);
					}
					if (obj.Object_Type === "Quote") {
						type = "B";
					} else if (obj.Object_Type === "Inquiry") {
						type = "A";
					}
				}
				//EOC by Aniket 23/12/2019 INC0061203
				var url = window.location.href;
				url = url.substring(0, url.lastIndexOf("#"));
				if (url.lastIndexOf("?") === -1) {
					url = url + "?";
				} else {
					url = url + "&";
				}
				//url = url + "contractID=" + document + "&ampID=" + amp + "&type=" + type + "#zcust_doc-manage";
				url = url + "#zcust_doc-manage&/Dashboard/" + document + "/" + amp + "/" + type;
				if (amp !== "") {
					sap.m.URLHelper.redirect(url, true);
				} else {
					sap.m.MessageBox.show(
						"AMP ID is mandatory to proceed..!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
				break;
			case "Display Equipment":
				sSemanticObj = "MaintenanceObject";
				sAction = "displayEquipment";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Change Equipment":
				sSemanticObj = "MaintenanceObject";
				sAction = "changeEquipment";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Move Equipment to Functional Location":
				var url = window.location.href;
				url = url.substring(0, url.lastIndexOf("/")) + "/MoveEquipment/" + object;
				// Defect 118001 Begin ++VS
				var oPath = this.node.split("_");
				var oTable = this.getView().byId("id_cntdb_tree1");
				var aData = oTable.getModel().getData();

				var oDobj = aData[oPath[0]];
				for (var i = 1; i < oPath.length; i++) {
					oDobj = oDobj[oPath[i]];
				}
				oDobj = oDobj.data;
				var sEqnr = oDobj.Equipment_Number.split(" ")[0];
				var sSupEqnr = oDobj.Superior_Equipment;
				if (sSupEqnr !== "") {
					if (sEqnr !== sSupEqnr) {
						MessageBox.show("Moving Child Equipments will break linkage with its Superior Equipment.Proceed?", {
							icon: MessageBox.Icon.WARNING,
							title: "Warning",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							onClose: function (sProceed) {
								if (sProceed === "YES") {
									//Navigate to second app
									sap.m.URLHelper.redirect(url, true);
								}
							}.bind(this)
						});
						return;
					}
				}
				// Defect 118001 End ++VS

				//Navigate to second app
				sap.m.URLHelper.redirect(url, true);
				break;
			case "Amend Functional Location":
				var url = window.location.href;
				url = url.substring(0, url.lastIndexOf("/")) + "/Amend/FL/" + object;
				//Navigate to second app
				sap.m.URLHelper.redirect(url, true);
				break;
			case "Amend Equipment":
				var url = window.location.href;
				url = url.substring(0, url.lastIndexOf("/")) + "/Amend/EQ/" + object;
				//Navigate to second app
				sap.m.URLHelper.redirect(url, true);
				break;
			case "Change Functional Location":
				sSemanticObj = "MaintenanceObject";
				sAction = "changeFLOC";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Display Functional Location":
				sSemanticObj = "MaintenanceObject";
				sAction = "displayFLOC";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Display Contract (VA43)":
				sSemanticObj = "Contract";
				sAction = "display";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Display Quote (VA23)":
				sSemanticObj = "Quotation";
				sAction = "display";
				this.navigateTo(sSemanticObj, sAction);
				break;
			case "Display Contract":
				/*szanzaney soc CR136303 02/23 - authorization */

				//GET call with entity set to check authorization and handle navigation to display contract based on auth objects
				var f = [];
				f.push(new sap.ui.model.Filter("Document", "EQ", selectedObject));
				this.getOwnerComponent().getModel().read("/Ety_Doc_AuthSet", {
					method: "GET",
					filters: f,
					success: function (oData) {

						if (oData.results[0].Auth === "X") {
							var url = window.location.href;
							url = url.substring(0, url.lastIndexOf("/")) + "/ContractDisplay/" + selectedObject;
							//Navigate to second app
							sap.m.URLHelper.redirect(url, true);
						} else {
							var msg = "No Authorization";
							MessageBox.error(msg);
						}

					}.bind(this),

					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});

				/*szanzaney eoc CR136303 02/23 - authorization check */

				break;
			case "Display Quote":

				/*szanzaney soc CR136303 02/23 - authorization */

				//GET call with entity set to check authorization and handle navigation to display contract based on auth objects
				var f = [];
				f.push(new sap.ui.model.Filter("Document", "EQ", selectedObject));
				this.getOwnerComponent().getModel().read("/Ety_Doc_AuthSet", {
					method: "GET",
					filters: f,
					success: function (oData) {

						if (oData.results[0].Auth === "X") {
							var url = window.location.href;
							url = url.substring(0, url.lastIndexOf("/")) + "/QuoteDisplay/" + selectedObject;
							//Navigate to second app
							sap.m.URLHelper.redirect(url, true);
						} else {
							var msg = "No Authorization";
							MessageBox.error(msg);
						}

					}.bind(this),

					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});

				/*szanzaney eoc CR136303 02/23 - authorization check */

				break;
			case "Amend Contract":
				var controller = this;
				if (controller.change) {
					var url2 = window.location.href;
					url2 = url2.substring(0, url2.lastIndexOf("/")) + "/AmendContract/" + selectedObject;
					//Navigate to second app
					sap.m.URLHelper.redirect(url2, true);
				} else {
					sap.m.MessageBox.show(
						"You are Not Authorized..!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
				break;

			case "Manage Attachments":
				this.get_Attachments(selectedObject);
				break;

				/***BoC for Defect 75135: 01/08/2019**/
			case "Create Group Contract":
				sSemanticObj = "Contract";
				sAction = "create";

				var url = window.location.href;
				url = url.substring(0, url.lastIndexOf("#"));
				var oSalesorg = this._salesorg;
				var oContractType = "ZGRP";
				var oDisChannel = this._distChannel;
				var oDivision = this._division;
				url = url + "#Contract-create?" + "AAT=" + oContractType + "&VKO=" + oSalesorg + "&VTW=" + oDisChannel + "&SPA=" + oDivision;
				sap.m.URLHelper.redirect(url, true);
				/****EoC for Defect 75135: 01/08/2019 ****/
			default:
				break;
			}
		},
		processObject: function (obj) {
			var keys = Object.keys(obj);
			var controller = this;
			this.exportData.push(obj);
			for (var i = 0; i < keys.length; i++) {
				if (!isNaN(keys[i])) {
					var nestedObject = keys[i];
					controller.processObject(obj[nestedObject]);
				}
			}
		},
		handlepressExport: function (oEvent) {
			var oTable = this.getView().byId("id_cntdb_tree1");
			//BEGIN OF COMMENT AKADAM21JUNE2019
			/*var oModel = oTable.getModel();
			this.exportData = [];
			this.processObject(oModel.getData());
			var oModelJson = new sap.ui.model.json.JSONModel();
			oModelJson.setData(this.exportData);*/
			//END OF COMMENT AKADAM21JUNE2019
			var oModelJson = new sap.ui.model.json.JSONModel();
			oModelJson.setData(this.getOwnerComponent().results[0].Nav_Excel_Output.results);
			this.exportToExcel(oTable, oModelJson);
		},
		exportToExcel: function (table, oModel) {
			var cols = table.getColumns();
			var itemsArray2 = [];
			for (var k = 0; k < cols.length; k++) {
				if (cols[k].getVisible()) {

					var obj = {};
					obj.name = cols[k].getAggregation("label").getProperty("text");
					obj.template = {};
					if (cols[k].getAggregation("template").getBindingInfo("text") !== undefined) {
						obj.template.content = "{" + cols[k].getAggregation("template").getBindingInfo("text").parts[0].path + "}";
						itemsArray2.push(obj);
					} else if (cols[k].getAggregation("template").getBindingInfo("selected") !== undefined) {
						obj.template.content = "{" + cols[k].getAggregation("template").getBindingInfo("selected").parts[0].path + "}";
						itemsArray2.push(obj);
					}

				}
				//obj.template.content = "{zcom_code}";

			}
			//export json array to csv file
			var oExport = new sap.ui.core.util.Export({
				// Type that will be used to generate the content. Own ExportType’s can be created to support other formats
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ","
				}),

				// Pass in the model created above
				models: oModel,
				// binding information for the rows aggregation
				rows: {
					path: "/Nav_Excel_Output"
				},
				columns: itemsArray2
			});
			oExport.saveFile().always(function () {
				this.destroy();
			});
		},
		initializeVariantManagement: function (oEvent) {
			// Peronalisation from ushell service to persist the settings
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {

				var oComponent = this.getOwnerComponent();
				this.oPersonalizationService = sap.ushell.Container.getService("Personalization");
				var oPersId = {
					container: "TablePersonalisation", //any
					item: "id_cntdb_tree1" //any- I have used the table name 
				};
				// define scope 
				var oScope = {
					keyCategory: this.oPersonalizationService.constants.keyCategory.FIXED_KEY,
					writeFrequency: this.oPersonalizationService.constants.writeFrequency.LOW,
					clientStorageAllowed: true
				};
				// Get a Personalizer
				var oPersonalizer = this.oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);
				this.oPersonalizationService.getContainer("TablePersonalisation", oScope, oComponent)
					.fail(function () {})
					.done(function (oContainer) {
						this.oContainer = oContainer;
						this.oVariantSetAdapter = new sap.ushell.services.Personalization.VariantSetAdapter(this.oContainer);
						// get variant set which is stored in backend
						this.oVariantSet = this.oVariantSetAdapter.getVariantSet("id_cntdb_tree1");
						if (!this.oVariantSet) { //if not in backend, then create one
							this.oVariantSet = this.oVariantSetAdapter.addVariantSet("id_cntdb_tree1");
						}
						// array to store the existing variants
						var Variants = [];
						// now get the existing variants from the backend to show as list
						for (var key in this.oVariantSet.getVariantNamesAndKeys()) {
							if (this.oVariantSet.getVariantNamesAndKeys().hasOwnProperty(key)) {
								var oVariantItemObject = {};
								oVariantItemObject.Key = this.oVariantSet.getVariantNamesAndKeys()[key];
								oVariantItemObject.Name = key;
								Variants.push(oVariantItemObject);
							}
						}
						// create JSON model and attach to the variant management UI control
						this.oVariantModel = new sap.ui.model.json.JSONModel();
						//this.oVariantModel.oData.Variants = Variants;
						this.oVariantModel.getData().Variants = Variants;
						this.getView().byId("Variants").setModel(this.oVariantModel);
					}.bind(this));
				// create table persco controller
				this.oTablepersoService = new TablePersoController({
					table: this.getView().byId("id_cntdb_tree1"),
					persoService: oPersonalizer
				});

			}
		},
		onPersoButtonPressed: function (oEvent) {
			this.oTablepersoService.openDialog({
				ok: "this.onPerscoDonePressed.bind(this)"
			});
		},
		onPerscoDonePressed: function (oEvent) {
			this.oTablepersoService.savePersonalizations();
		},
		onSaveAs: function (oEvent) {
			// get variant parameters:
			var VariantParam = oEvent.getParameters();
			// get columns data: 
			var aColumnsData = [];
			this.getView().byId("id_cntdb_tree1").getColumns().forEach(function (oColumn, index) {
				var aColumn = {};
				aColumn.fieldName = oColumn.getAggregation("template").getBindingInfo("text").parts[0].path;
				aColumn.Id = oColumn.getId();
				aColumn.index = index;
				aColumn.Visible = oColumn.getVisible();
				aColumnsData.push(aColumn);
			});

			this.oVariant = this.oVariantSet.addVariant(VariantParam.name);
			if (this.oVariant) {
				this.oVariant.setItemValue("ColumnsVal", JSON.stringify(aColumnsData));
				if (VariantParam.def === true) {
					this.oVariantSet.setCurrentVariantKey(this.oVariant.getVariantKey());
				}
				var controller = this;
				this.oContainer.save().done(function () {
					controller.initializeVariantManagement();
					sap.m.MessageBox.show("Layout Saved!", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						actions: [sap.m.MessageBox.Action.OK]
					});
				});
			}
		},
		onSelect: function (oEvent) {
			var selectedKey = oEvent.getParameters().key;
			for (var i = 0; i < oEvent.getSource().getVariantItems().length; i++) {
				if (oEvent.getSource().getVariantItems()[i].getProperty("key") === selectedKey) {
					var selectedVariant = oEvent.getSource().getVariantItems()[i].getProperty("text");
					break;
				}
			}
			this._setSelectedVariantToTable(selectedVariant);
		},

		_setSelectedVariantToTable: function (oSelectedVariant) {
			if (oSelectedVariant) {
				var sVariant = this.oVariantSet.getVariant(this.oVariantSet.getVariantKeyByName(oSelectedVariant));
				var aColumns = JSON.parse(sVariant.getItemValue("ColumnsVal"));

				// Hide all columns first
				this.getView().byId("id_cntdb_tree1").getColumns().forEach(function (oColumn) {
					oColumn.setVisible(false);
				});
				// re-arrange columns according to the saved variant

				aColumns.forEach(function (aColumn) {
					var aTableColumn = $.grep(this.getView().byId("id_cntdb_tree1").getColumns(), function (el, id) {
						//return el.getProperty("name") === aColumn.fieldName;
						return el.getAggregation("template").getBindingInfo("text").parts[0].path === aColumn.fieldName;
					});
					if (aTableColumn.length > 0) {
						aTableColumn[0].setVisible(aColumn.Visible);
						this.getView().byId("id_cntdb_tree1").removeColumn(aTableColumn[0]);
						this.getView().byId("id_cntdb_tree1").insertColumn(aTableColumn[0], aColumn.index);
					}
				}.bind(this));
			}
			// null means the standard variant is selected or the variant which is not available, then show all columns
			else {
				this.getView().byId("id_cntdb_tree1").getColumns().forEach(function (oColumn) {
					oColumn.setVisible(true);
				});
			}
		},
		onManage: function (oEvent) {
			var aParameters = oEvent.getParameters();
			// rename variants
			if (aParameters.renamed.length > 0) {
				aParameters.renamed.forEach(function (aRenamed) {
					var sVariant = this.oVariantSet.getVariant(aRenamed.key),
						sItemValue = sVariant.getItemValue("ColumnsVal");
					// delete the variant 
					this.oVariantSet.delVariant(aRenamed.key);
					// after delete, add a new variant
					var oNewVariant = this.oVariantSet.addVariant(aRenamed.name);
					oNewVariant.setItemValue("ColumnsVal", sItemValue);
				}.bind(this));
			}
			// default variant change
			if (aParameters.def !== "*standard*") {
				this.oVariantSet.setCurrentVariantKey(aParameters.def);
			} else {
				this.oVariantSet.setCurrentVariantKey(null);
			}
			// Delete variants
			if (aParameters.deleted.length > 0) {
				aParameters.deleted.forEach(function (aDelete) {
					this.oVariantSet.delVariant(aDelete);
				}.bind(this));
			}
			//  Save the Variant Container
			this.oContainer.save().done(function () {
				// Tell the user that the personalization data was saved
			});
		},
		createColumnConfig: function () {
			var aCols = [];

			var alwaysVisibleCols = [{
					label: "HLFL",
					property: "data/HLFL"
				}, {
					label: "HLFL Description",
					property: "data/HLFL_Desc"
				}, {
					label: "RTM FL",
					property: "data/RTM_FL"
				}, {
					label: "RTM FL Description",
					property: "data/RTM_FL_Desc"
				}, {
					label: "RTM FL Cat.",
					property: "data/RTM_FL_Category"
				}, {
					label: "MLFL1 (AMP ID)",
					property: "data/AMP"
				}, {
					label: "MLFL1 Description",
					property: "data/AMP_Desc"
				}, {
					label: "MLFL2",
					property: "data/MLFL1"
				}, {
					label: "MLFL2 Description",
					property: "data/MLFL1_Desc"
				}, {
					label: "MLFL3",
					property: "data/MLFL2"
				}, {
					label: "MLFL3 Description",
					property: "data/MLFL2_Desc"
				}
				/*, {
								label: "LLFL",
								property: "data/LLFL"
							}, {
								label: "LLFL Description",
								property: "data/LLFL_Desc"
							}*/
			];
			for (var j = 0; j < alwaysVisibleCols.length; j++) {
				aCols.push(alwaysVisibleCols[j]);
			}
			//var ignoreDuplicateCols = ["data/LLFL", "data/LLFL_Desc", "data/MLFL", "data/MLFL_Description"];
			var ignoreDuplicateCols = ["data/MLFL", "data/MLFL_Description"];
			var cols = this.getView().byId("id_cntdb_tree1").getColumns();
			//for (var k = 0; k < cols.length; k++) { //COMMENTAKADAM21JUNE2019
			for (var k = 1; k < cols.length; k++) { //InsertAKADAM21JUNE2019
				if (cols[k].getVisible()) {
					var obj = {};
					obj.label = cols[k].getAggregation("label").getProperty("text");
					obj.type = "string";
					if (cols[k].getAggregation("template").getBindingInfo("text") !== undefined) {
						obj.property = cols[k].getAggregation("template").getBindingInfo("text").parts[0].path;
					} else if (cols[k].getAggregation("template").getBindingInfo("selected") !== undefined) {
						obj.property = cols[k].getAggregation("template").getBindingInfo("selected").parts[0].path;
					}
					if (!(ignoreDuplicateCols.indexOf(obj.property) > -1)) {
						aCols.push(obj);
					}

				}
			}

			return aCols;
		},

		onExportToExcel: function () {
			var aCols, oSettings, oSheet;
			aCols = this.createColumnConfig();
			//Begin of Insert--->in Flat Model we have direct path so remove the path data
			for (var i = 0; i < aCols.length; i++) {
				aCols[i].property = aCols[i].property.split("data/")[1];
			}
			//End Of Insert
			//BEGIN OF INSERT AKADAM21JUNE2019
			var dataSource = this.getOwnerComponent().results[0].Nav_Excel_Output.results;

			//BEGIN OF INSERT AKADAM22JUL2019+ --> Defect 69533
			var selectedNodeIdArray = [];
			var oTreeTable = this.getView().byId("id_cntdb_tree1");
			var selectedIndices = oTreeTable.getSelectedIndices();
			if (selectedIndices.length > 0) {
				for (var i = 0; i < selectedIndices.length; i++) {
					var path = oTreeTable.getContextByIndex(selectedIndices[i]).sPath.split("/");
					path.splice(0, 1); //remove first element - ""
					var obj = oTreeTable.getModel().getData()[path[0]];
					for (var j = 1; j < path.length; j++) {
						obj = obj[path[j]];
					}
					var nodeID = obj.data.NodeID;

					if (nodeID !== "") {
						selectedNodeIdArray.push(nodeID);
					}
				}

				if (selectedNodeIdArray.length > 0) {
					var finalExportArray = [];
					for (i = 0; i < selectedNodeIdArray.length; i++) {
						for (j = 0; j < dataSource.length; j++) {
							if (dataSource[j].NodeID === selectedNodeIdArray[i]) {
								finalExportArray.push(dataSource[j]);
								break;
							}
						}
					}

					if (finalExportArray.length > 0) {
						dataSource = finalExportArray;
					} else {
						sap.m.MessageBox.show(
							"Select 'DATA' Rows to Proceed with Export..!!", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
						return;
					}
				}
			}

			//END OF INSERT AKADAM22JUL2019+

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: dataSource
			};
			//END OF INSERT AKADAM21JUNE2019

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},
		onChange: function (oEvent) {
			//Begin of test AKADAM16JUNE2019

			var oUploadCollection = oEvent.getSource();
			var _csrfToken = this.getOwnerComponent().getModel().getSecurityToken();
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: _csrfToken
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			//End Of test AKADAM16JUNE2019

			var reader = new FileReader();
			var file = oEvent.getParameter("files");
			var that = this;
			var obj = {};
			that.Files = [];

			function readFile(index) {
				if (index >= file.length) return;
				var gfile = file[index];
				//BOC AKADAM30JUL2019-
				/*				reader.onload = function (e) {
									// get file content  
									var bin = e.target.result;
									// do sth with bin
									obj.VALUE = bin; //FileContent
									obj.FILENAME = gfile.name; //Filename - slug
									obj.mHeaders = {};
									obj.mHeaders.slug = obj.FILENAME; //Req. Header - slug
									that.Files.push(obj);
									obj = {};
									readFile(index + 1);
								};
								reader.readAsBinaryString(gfile); */
				//EOC AKADAM30JUL2019-
				//BOI AKADAM30JUL2019+
				if (reader.readAsBinaryString) {
					reader.onload = function (e) {
						// get file content  
						var bin = e.target.result;
						// do sth with bin
						obj.VALUE = bin; //FileContent
						obj.FILENAME = gfile.name; //Filename - slug
						obj.mHeaders = {};
						obj.mHeaders.slug = obj.FILENAME; //Req. Header - slug
						that.Files.push(obj);
						obj = {};
						readFile(index + 1);
					};
					reader.readAsBinaryString(gfile);
				} else {
					//this._FlagIE = "X";
					reader.onload = function (e) {
						var bytes = new Uint8Array(e.target.result);
						//           var binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
						var length = bytes.byteLength;
						var binary = "";
						for (var i = 0; i < length; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						// do sth with bin
						obj.VALUE = binary; //FileContent
						obj.FILENAME = gfile.name; //Filename - slug
						obj.mHeaders = {};
						obj.mHeaders.slug = obj.FILENAME; //Req. Header - slug
						that.Files.push(obj);
						obj = {};
						readFile(index + 1);
					};
					reader.readAsArrayBuffer(gfile);
				}
				//EOI AKADAM30JUL2019+

			}
			readFile(0);

		},

		onFileDeleted: function (oEvent) {
			MessageToast.show("Event fileDeleted triggered");
		},

		onFilenameLengthExceed: function (oEvent) {
			MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileSizeExceed: function (oEvent) {
			MessageToast.show("File Size Exceeds 20MB ..!!");
		},

		onTypeMissmatch: function (oEvent) {
			MessageToast.show("Event typeMissmatch triggered");
		},

		onStartUpload: function (oEvent) {
			var oUploadCollection = sap.ui.getCore().byId("UploadCollection");
			var cFiles = oUploadCollection.getItems().length;

			if (cFiles === 0) {
				MessageToast.show("Select Files To Proceed...!!!");
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var selectedCategory = sap.ui.getCore().byId("id_comboBox_AttachmentCategory").getSelectedItem();
			var sap_object = this.sap_object; //BUS2034
			var object = this._objectIdSelected; //40001931
			var ar_object = selectedCategory.getProperty("key"); //ZSROPBUND
			var ar_desc = selectedCategory.getProperty("text"); //SAP Output Bundle
			var slug = oEvent.getParameter("fileName") + "|" + sap_object + "|" + object + "|" + ar_object + "|" + ar_desc;
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				// 1.7 2483 117453
				// value: slug 
				value: encodeURIComponent(slug)
					// 1.7 2483 117453
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onUploadComplete: function (oEvent) {
			this.uploadAttachment.close();

			var filterArray = [];
			filterArray.push(new Filter({
				path: "OBJECT_ID",
				operator: FilterOperator.EQ,
				value1: this._objectIdSelected
			}));
			filterArray.push(new Filter({
				path: "SAP_OBJECT",
				operator: FilterOperator.EQ,
				value1: this.sap_object
			}));
			var f = [];
			f.push(filterArray);
			var path = "/Ets_Manage_Attach";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var controller = this;

			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: [new Filter(
						filterArray,
						true)],
					success: function (data, response) {
						controller.attachmentsData = data.results;
						var oModel1 = new sap.ui.model.json.JSONModel(controller.attachmentsData);
						controller._attachments.setModel(oModel1);
						//controller._attachments.open();
						oGlobalBusyDialog.close();
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
		},

		onSelectChange: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},
		onDragStart: function (oEvent) {
			var oTree = this.byId("id_cntdb_tree1");
			var oBinding = oTree.getBinding("rows");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedItem = oEvent.getParameter("target");
			var iDraggedItemIndex = oTree.indexOfRow(oDraggedItem);
			var aSelectedIndices = oTree.getBinding("rows").getSelectedIndices();
			// var aSelectedItems = oTree.getSelectedItems();
			var aDraggedItemContexts = [];
			var data = oDraggedItem.getBindingContext().getProperty("data");
			if (data.Object_Type === "Equipment") {
				this.Equipment = data.Equipment_Number.toString();
				this.LLFL = data.LLFL.toString();
				if (aSelectedIndices.length > 0) {
					// If items are selected, do not allow to start dragging from a item which is not selected.
					if (aSelectedIndices.indexOf(iDraggedItemIndex) === -1) {
						oEvent.preventDefault();
					} else {
						for (var i = 0; i < aSelectedIndices.length; i++) {
							// aDraggedItemContexts.push(oBinding.getContextByIndex(aSelectedIndices[i]));
							aDraggedItemContexts.push(oDraggedItem.getBindingContext());
						}
					}
				} else {
					// aDraggedItemContexts.push(oBinding.getContextByIndex(iDraggedItemIndex));
					aDraggedItemContexts.push(oDraggedItem.getBindingContext());
				}

				oDragSession.setComplexData("hierarchymaintenance", {
					draggedItemContexts: aDraggedItemContexts
				});
			} else {
				sap.m.MessageBox.show(
					"Please select Equipment", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},

		onDrop: function (oEvent) {
			var obj = {};
			var main = {};
			var oTree = this.byId("id_cntdb_tree1");
			var oBinding = oTree.getBinding("rows");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedItem = oEvent.getParameter("droppedControl");
			var data = oDroppedItem.getBindingContext().getProperty("data");
			if (data.Object_Type === "Functional Location" && (oDragSession.getComplexData("hierarchymaintenance") !== undefined)) {
				obj.actualFloc = this.LLFL;
				obj.movetoFloc = data.LLFL;
				if (obj.actualFloc === obj.movetoFloc) {
					sap.m.MessageBox.show(
						"New FL is same as existing FL", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				} else {
					this.oEquips[this.Equipment] = obj;
					var aDraggedItemContexts = oDragSession.getComplexData("hierarchymaintenance").draggedItemContexts;
					var iDroppedIndex = oTree.indexOfRow(oDroppedItem);
					// var oNewParentContext = oBinding.getContextByIndex(iDroppedIndex);
					var oNewParentContext = oDroppedItem.getBindingContext();

					if (aDraggedItemContexts.length === 0 || !oNewParentContext) {
						return;
					}

					var oModel = oTree.getBinding("rows").getModel();
					var oNewParent = oNewParentContext.getProperty();

					// In the JSON data of this example the children of a node are inside an array with the name "categories".
					if (!oNewParent.children) {
						oNewParent.children = []; // Initialize the children array.
					}

					for (var i = 0; i < aDraggedItemContexts.length; i++) {
						if (oNewParentContext.getPath().indexOf(aDraggedItemContexts[i].getPath()) === 0) {
							// Avoid moving a node into one of its child nodes.
							continue;
						}

						// Copy the data to the new parent.
						oNewParent.children.push(aDraggedItemContexts[i].getProperty());

						// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
						oModel.setProperty(aDraggedItemContexts[i].getPath(), undefined, aDraggedItemContexts[i], true);
						// oModel.refresh(true);
					}
				}
			} else {
				sap.m.MessageBox.show(
					"Please drop Equipment to Functional Location", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onPressMoveEquipment: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var post_data = [];
			var that = this;
			Object.keys(this.oEquips).forEach(function (key) {
				// if (that.oEquips[key].movetoFloc !== that.oEquips[key].actualFloc) {
				var obj = {};
				obj.Msg = "";
				obj.OldFl = "";
				obj.NewFl = that.oEquips[key].movetoFloc;
				obj.Equipnum = key;
				post_data.push(obj);
				// }
			});

			var requestBody = {
				d: {
					"POST": "X",
					"POST_EQUIP_NAV": post_data
				}
			};
			var controller = this;
			var component = this.getOwnerComponent();
			var f = component.filters;
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Post_Swap";
			if (Object.keys(this.oEquips).length > 0) {
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
							that.getReportData(f);
							that.oEquips = {};
						},
						error: function (error) {
							oGlobalBusyDialog.close();
							// that.getReportData(f);
							that.updateTableModel();
							that.oEquips = {};
							sap.m.MessageBox.show(
								error.statusText, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Service Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
					});
			} else {
				oGlobalBusyDialog.close();
				sap.m.MessageBox.show(
					"Please Move atleast one Equipment to Functional Location", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},

		//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

		//on switching radio button
		onPress: function () {

			//to get the selected radio button
			var selectedRB = sap.ui.getCore().byId("idTog").getSelected() ? "idTog" : "idSep";

			//if Print Together is selected
			if (selectedRB === "idTog") {

				//intitially set as disabled
				sap.ui.getCore().byId("idSalesRep").setEnabled(false);
				sap.ui.getCore().byId("idContractAdminContact").setEnabled(false);
				sap.ui.getCore().byId("idAccountOpsLead").setEnabled(false);
				sap.ui.getCore().byId("idBillToContact").setEnabled(false);

				//make override dropdowns enabled if more than one option available
				if (sap.ui.getCore().byId("idSalesRep").getItems().length > 1) {
					sap.ui.getCore().byId("idSalesRep").setEnabled(true);
				}
				if (sap.ui.getCore().byId("idContractAdminContact").getItems().length > 1) {
					sap.ui.getCore().byId("idContractAdminContact").setEnabled(true);
				}
				if (sap.ui.getCore().byId("idAccountOpsLead").getItems().length > 1) {
					sap.ui.getCore().byId("idAccountOpsLead").setEnabled(true);
				}
				if (sap.ui.getCore().byId("idBillToContact").getItems().length > 1) {
					sap.ui.getCore().byId("idBillToContact").setEnabled(true);
				}
				// BOC SDAS52 ER-1036 11/10/2020
				if (sap.ui.getCore().byId("idAdminSigner").getItems().length > 0) {
					if (this.SignatureFlag && this.SignatureFlag === 'X') {
						sap.ui.getCore().byId("idAdminSigner").setEnabled(true);
					}
				}
				// BOC SDAS52 ER-1036 11/10/2020
			}

			//if Print Separately is selected
			else if (selectedRB === "idSep") {

				//make override dropdowns disabled
				sap.ui.getCore().byId("idSalesRep").setEnabled(false);
				sap.ui.getCore().byId("idContractAdminContact").setEnabled(false);
				sap.ui.getCore().byId("idAccountOpsLead").setEnabled(false);
				sap.ui.getCore().byId("idBillToContact").setEnabled(false);
				// BOC SDAS52 ER-1036 11/10/2020
				sap.ui.getCore().byId("idAdminSigner").setEnabled(false);
				// EOC SDAS52 ER-1036 11/10/2020
			}
		},

		//on pressing close
		onClosePress: function () {

			//close dialog box
			this._oDialogBox.close();

			//destroy dialog box
			this._oDialogBox.destroy();
		},

		//function to copy data input in fields of first column to all the selected columns
		onOKPress: function () {

			//getting print type
			var printType = sap.ui.getCore().byId("idTog").getSelected() ? "Together" : "Separate";

			//initially set to "" for 'Separate' case
			var overrideData = "";

			//if 'Together' case
			if (printType === "Together") {
				/***INC0131976 8/25 PN S4 - breaking when getSelectedKey was blank, added check SOC MSA1-*/
				var salesRep, contractAdmin, accountsTS, billToContract;
				//check if getselecteditem() is not null if it is null pass zero
				salesRep = sap.ui.getCore().byId("idSalesRep").getSelectedItem() ? sap.ui.getCore().byId("idSalesRep").getSelectedItem().getKey() :
					"0";
				contractAdmin = sap.ui.getCore().byId("idContractAdminContact").getSelectedItem() ? sap.ui.getCore().byId("idContractAdminContact")
					.getSelectedItem().getKey() : "0";
				accountsTS = sap.ui.getCore().byId("idAccountOpsLead").getSelectedItem() ? sap.ui.getCore().byId("idAccountOpsLead").getSelectedItem()
					.getKey() : "0";
				billToContract = sap.ui.getCore().byId("idBillToContact").getSelectedItem() ? sap.ui.getCore().byId("idBillToContact").getSelectedItem()
					.getKey() : "0";
				overrideData = salesRep + "-" + contractAdmin + "-" + accountsTS + "-" + billToContract + "-";
				// overrideData = sap.ui.getCore().byId("idSalesRep").getSelectedItem().getKey() + "-" + sap.ui.getCore().byId(
				// 		"idContractAdminContact").getSelectedItem().getKey() + "-" + sap.ui.getCore().byId("idAccountOpsLead").getSelectedItem()
				// 	.getKey() + "-" + sap.ui.getCore().byId("idBillToContact").getSelectedItem().getKey() + "-"; // commenting as it breaks when key is blank

				/*INC0131976 8/25 PN S4 - breaking when getSelectedKey was blank, added check EOC MSA1***/
				// BOC SDAS52 ER-1036 11/10/2020
				var adminSigner;
				adminSigner = sap.ui.getCore().byId("idAdminSigner").getSelectedItem() ? sap.ui.getCore().byId("idAdminSigner").getSelectedItem().getKey() :
					"0";
				overrideData = overrideData + adminSigner + "-";

				// EOC SDAS52 ER-1036 11/10/2020
			}
			// BOC SDAS52 ER-1036 11/10/2020
			//Signature Flag to be sent irrespective of printtype 
			if (this.SignatureFlag === 'X') {
				var url = url_pass + "/" + printType + "/" + overrideData + "/" + this.SignatureFlag;
			} else {
				var url = url_pass + "/" + printType + "/" + overrideData;
			}
			//URL creation
			//	var url = url_pass + "/" + printType + "/" + overrideData;
			// EOC SDAS52 ER-1036 11/10/2020

			//encoding the URL
			var encodedUrl = encodeURI(url);

			//URL call
			sap.m.URLHelper.redirect(encodedUrl, true);

			//close dialog box
			this._oDialogBox.close();

			//destroy dialog box
			this._oDialogBox.destroy();
		},

		//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

		//*******START OF SRF106D_4 Sprint 1.7 September Release CHANGES BY ARJUN*********//

		//function executed on Confirm press of Add to Holding Area dialog box
		//function executed on Confirm press of Add to Holding Area dialog box
		onAddToHAOKPress: function () {

			//flag to send to backend
			var flag = "";

			if (sap.ui.getCore().byId("idSalesDocRB").getSelected()) {

				//make flag S for saled document type
				flag = "S";
			} else if (sap.ui.getCore().byId("idChanSpreadRB").getSelected()) {

				//make flag C for channeling spreadsheet type
				flag = "C";
			}

			//*******START OF SRF106D_4 Sprint 2.1 Hypercare Release CHANGES BY ARJUN*********//

			//ADDITIONALLY: Subview_Results_AddToSharedDialog created
			else if (sap.ui.getCore().byId("idSharedRB").getSelected() || sap.ui.getCore().byId("idBothRB").getSelected()) {

				//make flag H for shared holding area type
				flag = "H";

				//make flag A for shared all type
				if (sap.ui.getCore().byId("idBothRB").getSelected()) {
					flag = "A";
				}

				//GET call with entity set ETY_HOLDING_AREASet
				this.getOwnerComponent().getModel().read("/ETY_HOLDING_AREASet", {
					method: "GET",
					success: function (oData) {

						//create dialog with fragment
						this._oDialogSharedHA = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.Subview_Results_AddToSharedDialog",
							this);

						//adding dependent
						this.getView().addDependent(this._oDialogSharedHA);

						//open dialog
						this._oDialogSharedHA.open();

						//placeholder to add radio buttons
						var oPanel = sap.ui.getCore().byId("idRadioButtonsLayout");

						//json model
						var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");
						if (oJSONHoldingArea === undefined) {
							var oJSONHoldingArea = new sap.ui.model.json.JSONModel();
						}

						// var rbData = [];
						for (var i = 0; i < oData.results.length; i++) {

							// rbData.push({
							//           "id": "id_rb_" + oData.results[i].HOLDING_AREA_ID,
							//           "text": oData.results[i].HOLDING_AREA
							// });

							// var rb = new sap.m.RadioButton({
							//           id: "id_rb_" + oData.results[i].HOLDING_AREA_ID,
							//           text: oData.results[i].HOLDING_AREA
							// });

							oJSONHoldingArea.setProperty("/rbData", oData.results);
							oJSONHoldingArea.setProperty("/numberOfSharedAreas", oData.results.length);

							//for use later
							oJSONHoldingArea.setProperty("/flag", flag);

							// oPanel.addContent(rb);
						}
					}.bind(this),

					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});

			}
			//close dialog box
			this._oDialogAddToHA.close();

			//destroy dialog box
			this._oDialogAddToHA.destroy();

			if (flag !== "" && flag !== "H" && flag !== "A") {

				//Batch POST call sending data to holding area
				this._semiAutomationCalls("AddHoldingArea", flag, "");
			}
			//	this.getView().setBusy(true);

			//*******END OF SRF106D_4 Sprint 2.1 Hypercare Release CHANGES BY ARJUN*********//
			//	this.onAddToHAClosePress();

		},

		//function executed on Cancel press of Add to Holding Area dialog box
		onAddToHAClosePress: function () {

			//close dialog box
			this._oDialogAddToHA.close();

			//destroy dialog box
			this._oDialogAddToHA.destroy();
		},

		//function executed on Cancel press of View Holding Area dialog box
		onViewHAClosePress: function () {

			//close dialog box
			this._oDialogViewHA.close();

			//destroy dialog box
			this._oDialogViewHA.destroy();
		},

		//function executed on toggling between viewing channeling spreadsheet and sales document holding areas

		onSelectionChangeHoldingArea: function () {

			//selected key
			var selKey = sap.ui.getCore().byId("idSegBut").getSelectedKey();

			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//if sales document holding area chosen
			if (selKey === "SD") {

				//make respective tables visible and invisible
				oJSONHoldingArea.setProperty("/tableSalesDocVisible", true);
				oJSONHoldingArea.setProperty("/tableChanSpreadVisible", false);
				oJSONHoldingArea.setProperty("/tableSharedVisible", false);
			}

			//if channeling spreadsheet holding area selected
			else if (selKey === "CS") {

				//make respective tables visible and invisible
				oJSONHoldingArea.setProperty("/tableSalesDocVisible", false);
				oJSONHoldingArea.setProperty("/tableChanSpreadVisible", true);
				oJSONHoldingArea.setProperty("/tableSharedVisible", false);
			}

			//if shared holding area is selected
			else {
				//make respective tables visible and invisible
				oJSONHoldingArea.setProperty("/tableSalesDocVisible", false);
				oJSONHoldingArea.setProperty("/tableChanSpreadVisible", false);
				oJSONHoldingArea.setProperty("/tableSharedVisible", true);

				/*add here*/
				this._semiAutomationCalls("ViewHoldingArea");
			}

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},

		//on selection or unselection of saled document holding area records
		onRowSelectionChangeSalesDoc: function () {

			//selected indeces of saled doc holding area
			var selectedIndeces = sap.ui.getCore().byId("idTableSalesDoc").getSelectedIndices();
			var already_downladed = "";
			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//if no records selected
			if (selectedIndeces.length === 0) {

				//disable delete button
				oJSONHoldingArea.setProperty("/enableButtonsSD", false);
				oJSONHoldingArea.setProperty("/enableButtonsSD_DW", false);
			}

			//if records selected
			else {

				//BOC by AVERMA1 on 25/7 for CR115776
				//IF selected document does not have status X only then download button should be enabled
				//records in table
				var tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataSalesDoc");
				//loop through selected records
				for (var i = 0; i < selectedIndeces.length; i++) {

					if (tableData[selectedIndeces[i]].Status == 'X') {
						already_downladed = "X";
					}

				}

				//enable delete button
				//If any of the selected documents is already downloaded, do not enable the download buttons
				if (already_downladed == 'X') {
					oJSONHoldingArea.setProperty("/enableButtonsSD_DW", false);
				} else {
					oJSONHoldingArea.setProperty("/enableButtonsSD_DW", true);
				}

				oJSONHoldingArea.setProperty("/enableButtonsSD", true);
			}

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},

		//on selection or unselection of channeling spreadsheet holding area records
		onRowSelectionChangeChanSpread: function () {

			//selected indeces of chan spreadsheet holding area
			var selectedIndeces = sap.ui.getCore().byId("idTableChanSpread").getSelectedIndices();
			var already_downladed = "";
			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//if no records selected
			if (selectedIndeces.length === 0) {

				//disable delete button
				oJSONHoldingArea.setProperty("/enableButtonsCS", false);
				oJSONHoldingArea.setProperty("/enableButtonsCS_DW", false);
			}

			//if records selected
			else {
				//BOC by AVERMA1 on 25/7 for CR115776
				//IF selected document does not have status X only then download button should be enabled
				//records in table
				var tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataChanSpread");
				//loop through selected records
				for (var i = 0; i < selectedIndeces.length; i++) {

					if (tableData[selectedIndeces[i]].Status == 'X') {
						already_downladed = "X";
					}

				}

				//enable delete button
				//If any of the selected documents is already downloaded, do not enable the download buttons
				if (already_downladed == 'X') {
					oJSONHoldingArea.setProperty("/enableButtonsCS_DW", false);
				} else {
					oJSONHoldingArea.setProperty("/enableButtonsCS_DW", true);
				}

				//enable delete button
				oJSONHoldingArea.setProperty("/enableButtonsCS", true);
			}

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},
		//on selection or unselection of shared holding area records
		onRowSelectionChangeShared: function () {
			/*soc szanzaney 4/20 CR139741*/

			var SelectableRowCount = sap.ui.getCore().byId("idTableShared")._getSelectableRowCount();
			var SelectedIndicesCount = sap.ui.getCore().byId("idTableShared")._getSelectedIndicesCount();

			if (SelectableRowCount === SelectedIndicesCount) {
				var that = this;
				sap.m.MessageBox.show(
					"You have selected all documents in this Holding Area.", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning!",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (sAction1) {
							if (sAction1 === "OK") {
								that.onRowSelectionChangeSharedConfirm();
							}

						}
					});
			} else {
				this.onRowSelectionChangeSharedConfirm();
			}
			/*eoc szanzaney 4/20 CR139741*/

		},

		//confirm deletion
		onRowSelectionChangeSharedConfirm: function () {
			//selected indeces of chan spreadsheet holding area
			var selectedIndeces = sap.ui.getCore().byId("idTableShared").getSelectedIndices();
			var already_downladed = "";
			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//if no records selected
			if (selectedIndeces.length === 0) {

				//disable delete button
				oJSONHoldingArea.setProperty("/enableButtonsSH", false);
				oJSONHoldingArea.setProperty("/enableButtonsSH_DW", false);
			}

			//if records selected
			else {
				//BOC by AVERMA1 on 25/7 for CR115776
				//IF selected document does not have status X only then download button should be enabled
				//records in table
				var tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataShared");
				//loop through selected records
				for (var i = 0; i < selectedIndeces.length; i++) {

					if (tableData[selectedIndeces[i]].Status == 'X') {
						already_downladed = "X";
					}

				}

				//enable delete button
				//If any of the selected documents is already downloaded, do not enable the download buttons
				if (already_downladed == 'X') {
					oJSONHoldingArea.setProperty("/enableButtonsSH_DW", false);
				} else {
					oJSONHoldingArea.setProperty("/enableButtonsSH_DW", true);
				}

				//enable delete button
				oJSONHoldingArea.setProperty("/enableButtonsSH", true);
			}

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},
		//on delete press, for sales doc records in holding area
		onSDDeletePress: function () {

			//batch delete call removing record(s) from holding area
			this._semiAutomationCalls("DeleteHoldingArea", "S");
		},

		//on delete press, for channeling spreadsheet records in holding area
		onCSDeletePress: function () {

			//batch delete call removing record(s) from holding area
			this._semiAutomationCalls("DeleteHoldingArea", "C");
		},
		onSHDeletePress: function () {
			/*soc szanzaney 4/12 CR139741*/

			//selected indeces of chan spreadsheet holding area
			var selectedIndeces = sap.ui.getCore().byId("idTableShared").getSelectedIndices();

			//records in table
			var tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataShared");

			if (selectedIndeces.length === tableData.length) {

				var that = this;
				sap.m.MessageBox.show(
					"Warning! Are you sure you want to delete ALL DOCUMENTS in this holding area?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Warning!",
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function (sAction1) {
							if (sAction1 === "OK") {
								that._semiAutomationCalls("DeleteHoldingArea", "H");
							}

						}
					});

			} else {

				/*eoc szanzaney 4/12 CR139741*/
				//batch delete call removing record(s) from holding area
				var that = this;
				sap.m.MessageBox.show(
					"Are you sure you want to delete selected records?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Holding Area not empty!",
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function (sAction1) {
							if (sAction1 === "OK") {
								that._semiAutomationCalls("DeleteHoldingArea", "H");
							}

						}
					});
			}
		},
		//on download press, for sales doc records in holding area
		onSDDownloadPress: function () {

			//download call exporting to excel
			this._semiAutomationCalls("DownloadHoldingArea", "S");

			sap.ui.core.BusyIndicator.show();

			setTimeout(function () {

				//Refresh the Table display
				this._semiAutomationCalls("ViewHoldingArea");

			}.bind(this), 2000);

			setTimeout(function () {

				sap.ui.core.BusyIndicator.hide();
			}.bind(this), 3000);

			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//set selected records as can't be downloaded
			oJSONHoldingArea.setProperty("/enableButtonsSD_DW", false);

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},

		onSHDownloadPress: function () {

			//download call exporting to excel
			this._semiAutomationCalls("DownloadHoldingArea", "H");

			sap.ui.core.BusyIndicator.show();

			setTimeout(function () {

				//Refresh the Table display
				this._semiAutomationCalls("ViewHoldingArea");

			}.bind(this), 2000);

			setTimeout(function () {

				sap.ui.core.BusyIndicator.hide();
			}.bind(this), 3000);

			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//set selected records as can't be downloaded
			oJSONHoldingArea.setProperty("/enableButtonsSH_DW", false);

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},

		//on download press, for channeling spreadsheet records in holding area
		onCSDownloadPress: function () {

			//download call exporting to excel
			this._semiAutomationCalls("DownloadHoldingArea", "C");

			sap.ui.core.BusyIndicator.show();

			setTimeout(function () {

				//Refresh the Table display
				this._semiAutomationCalls("ViewHoldingArea");

			}.bind(this), 2000);

			setTimeout(function () {

				sap.ui.core.BusyIndicator.hide();
			}.bind(this), 3000);

			//json model for tables
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

			//set selected records as can't be downloaded
			oJSONHoldingArea.setProperty("/enableButtonsCS_DW", false);

			//setting model back to the view
			this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
		},

		//*******START OF SRF106D_4 Sprint 2.1 Hypercare Release CHANGES BY ARJUN*********//

		//all semi-automation service calls are executed here
		_semiAutomationCalls: function (type, data, additionalData) {

			//batch post call for adding to holding area
			if (type === "AddHoldingArea") {

				//set busy indicator as true
				//this.getView().setBusy(true);

				var oModel = this.getOwnerComponent().getModel();

			/*	if (this.contracts === undefined) {
					var oTreeTable = this.getView().byId("id_cntdb_tree1");
					var selectedIndices = oTreeTable.getSelectedIndices();
					var contracts = [];

					for (var i = 0; i < selectedIndices.length; i++) {
						var path = oTreeTable.getContextByIndex(selectedIndices[i]).sPath.split("/");
						path.splice(0, 1); //remove first element - ""
						var obj = oTreeTable.getModel().getData()[path[0]];
						for (var j = 1; j < path.length; j++) {
							obj = obj[path[j]];
						}

						var k = obj.data.Contract.trim();
						contracts.push(k);

					}

					this.contracts = contracts;
				}*/ //add back if needed for all contracts to be included in semi automation

				//loop through selected contracts
				for (var i = 0; i < this.contracts.length; i++) {

					if (additionalData !== "") {

						//payload for post call with holding area type and document ID
						var payload = {
							HoldingType: data,
							Document: this.contracts[i],
							Holding_Area_Id: additionalData.id,
							Holding_Area: additionalData.name
						};
					} else {

						//payload for post call with holding area type and document ID
						var payload = {
							HoldingType: data,
							Document: this.contracts[i],
							Holding_Area_Id: "",
							Holding_Area: ""
						};
					}

					// post call to add to holding area
					oModel.create("/Ety_Add_Holding_AreaSet", payload, {
						async: true,
						method: 'POST',
						success: function (oData) {
							//	this.getView().setBusy(false);

						},
						error: function (oError) {
							//	this.getView().setBusy(false);
						}
					});
				}

				oModel.submitChanges({
					success: function (oData) {

						//success message
						var msg = "Successfully added record(s) to holding area!";
						MessageBox.success(msg);
					},
					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});

				//set busy indicator as false
				//	this.getView().setBusy(false);
			}

			//batch post call to delete a shared holding area
			if (type === "DeleteSharedHoldingArea") {

				//set busy indicator as true
				//this.getView().setBusy(true);

				var oModel = this.getOwnerComponent().getModel();

				//payload for post call with holding area type and document ID
				var payload = {

					Holding_Area_Id: additionalData.id,
					Holding_Area: additionalData.name
				};

				/*option 1*/

				// post call to remove to holding area
				/*	oModel.remove("/ETY_HOLDING_AREASet", payload, {
						async: true,
						method: 'POST',
						success: function (oData) {
							this.getOwnerComponent().getModel().read("/ETY_HOLDING_AREASet", {
								method: "GET",
								success: function (oDataRefresh) {

									//json model
									var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

									// var rbData = [];
									for (var i = 0; i < oDataRefresh.results.length; i++) {

										oJSONHoldingArea.setProperty("/rbData", oDataRefresh.results);
										oJSONHoldingArea.setProperty("/numberOfSharedAreas", oDataRefresh.results.length);

									}
									//GET call for holding area data
									this._semiAutomationCalls("ViewHoldingArea");
								}.bind(this),

								error: function (oError) {

									//error message
									var responseText = JSON.parse(oError.responseText);
									var msg = responseText.error.message.value;
									MessageBox.error(msg);
								}
							});

						}.bind(this),
						error: function (oError) {
							//	this.getView().setBusy(false);
						}
					});*/
				/*option 2*/

				// post call to add to holding area
				oModel.remove("/ETY_HOLDING_AREASet(HOLDING_AREA_ID='" + additionalData.id + "')", {
					async: true,
					method: 'POST',
					success: function (oDataRefresh) {
						var msg = "Successfully deleted record!";
						MessageBox.success(msg);

						/*szanzaney*/

						var oJSONHoldingArea = new sap.ui.model.json.JSONModel();

						this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");

						this.getOwnerComponent().getModel().read("/ETY_HOLDING_AREASet", {
							method: "GET",
							success: function (oDataRefresh) {

								//json model
								var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

								// var rbData = [];
								for (var i = 0; i < oDataRefresh.results.length; i++) {

									oJSONHoldingArea.setProperty("/rbData", oDataRefresh.results);
									oJSONHoldingArea.setProperty("/numberOfSharedAreas", oDataRefresh.results.length);

								}
								//GET call for holding area data
								this._semiAutomationCalls("ViewHoldingArea");
							}.bind(this),

							error: function (oError) {

								//error message
								var responseText = JSON.parse(oError.responseText);
								var msg = responseText.error.message.value;
								MessageBox.error(msg);
							}
						});

						/*szanzaney*/
					}.bind(this),
					error: function (oError) {}
				});

				/*	oModel.submitChanges({
					success: function (oData) {
							this._semiAutomationCalls("ViewHoldingArea");

						//success message
						var msg = "Successfully deleted record!";
						MessageBox.success(msg);
					}.bind(this),
					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});*/
			}

			//get call for holding area data
			else if (type === "ViewHoldingArea") {

				//set busy indicator as true
				//		this.getView().setBusy(true);

				//holding areas of both types
				var arraySD = [];
				var arrayCS = [];
				var arraySH = [];

				//filter for shared holding area
				var f = [];
				f.push(new sap.ui.model.Filter("Holding_Area_Id", "EQ", sap.ui.getCore().byId("idSharedHADropDown").getSelectedKey()));

				//GET call with entity set Ety_Add_Holding_AreaSet
				this.getOwnerComponent().getModel().read("/Ety_Add_Holding_AreaSet", {
					method: "GET",
					filters: f,
					success: function (oData) {

						//loop through results
						for (i = 0; i < oData.results.length; i++) {

							//if sales doc record
							if (oData.results[i].HoldingType === "S") {

								arraySD.push(oData.results[i]);
							}

							//if channeling spreadsheet record
							else if (oData.results[i].HoldingType === "C") {

								arrayCS.push(oData.results[i]);
							}
							//if shared record
							else if (oData.results[i].HoldingType === "H") {

								arraySH.push(oData.results[i]);
							}
							//if record is for both
							// else {

							// 	arrayCS.push(oData.results[i]);
							// 	arraySD.push(oData.results[i]);
							// }
						}

						//json model for tables
						var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

						//populate sales doc table
						oJSONHoldingArea.setProperty("/tableDataSalesDoc", arraySD);

						//set number of records in saled doc table
						oJSONHoldingArea.setProperty("/rowCountSalesDoc", arraySD.length);

						//populate chan spreadsheet table
						oJSONHoldingArea.setProperty("/tableDataChanSpread", arrayCS);

						//set number of records in chan spreadsheet table
						oJSONHoldingArea.setProperty("/rowCountChanSpread", arrayCS.length);

						//populate shared holding table
						oJSONHoldingArea.setProperty("/tableDataShared", arraySH);

						//set number of records in shared holding table
						oJSONHoldingArea.setProperty("/rowCountshared", arraySH.length);

						//setting model back to the view
						this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");

						//releasing busy indicator
						//	this.getView().setBusy(false);
					}.bind(this),
					error: function (oError) {

						//display reason for error in GET call to user
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);

						//releasing busy indicator
						//		this.getView().setBusy(false);
					}.bind(this)
				});
			}

			//*******END OF SRF106D_4 Sprint 2.1 Hypercare Release CHANGES BY ARJUN*********//

			//batch delete call for deleting from holding area
			else if (type === "DeleteHoldingArea") {

				//if sales document
				if (data === "S") {

					//selected indeces of saled doc holding area
					var selectedIndeces = sap.ui.getCore().byId("idTableSalesDoc").getSelectedIndices();

					//records in table
					var tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataSalesDoc");
				}

				//if channeling spreadsheet
				else if (data === "C") {

					//selected indeces of chan spreadsheet holding area
					selectedIndeces = sap.ui.getCore().byId("idTableChanSpread").getSelectedIndices();

					//records in table
					tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataChanSpread");
				}

				//if shared holding area
				else if (data === "H") {

					//selected indeces of chan spreadsheet holding area
					selectedIndeces = sap.ui.getCore().byId("idTableShared").getSelectedIndices();

					//records in table
					tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataShared");
				}

				//set busy indicator as true
				//this.getView().setBusy(true);

				oModel = this.getOwnerComponent().getModel();

				//loop through selected records
				for (i = 0; i < selectedIndeces.length; i++) {

					// post call to add to holding area
					oModel.remove("/Ety_Add_Holding_AreaSet(HoldingType='" + data + "',Document='" + tableData[selectedIndeces[i]].Document + "')", {
						async: true,
						method: 'POST',
						success: function (oData) {},
						error: function (oError) {}
					});
				}

				oModel.submitChanges({
					success: function (oData) {

						//success message
						var msg = "Successfully deleted record(s) from holding area!";
						MessageBox.success(msg);
					},
					error: function (oError) {

						//error message
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg);
					}
				});

				//set busy indicator as false
				//	this.getView().setBusy(false);

				//remove records from model
				for (i = selectedIndeces.length - 1; i >= 0; i--) {

					//index selectedIndeces[i], remove 1 record
					tableData.splice(selectedIndeces[i], 1);
				}

				//json model for tables
				var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

				//if sales document
				if (data === "S") {

					//populate sales doc table
					oJSONHoldingArea.setProperty("/tableDataSalesDoc", tableData);

					//set number of records in saled doc table
					oJSONHoldingArea.setProperty("/rowCountSalesDoc", tableData.length);

					//removing selections
					sap.ui.getCore().byId("idTableSalesDoc").clearSelection();
				}

				//if channeling spreadsheet
				else if (data === "C") {

					//populate chan spreadsheet table
					oJSONHoldingArea.setProperty("/tableDataChanSpread", tableData);

					//set number of records in chan spreadsheet table
					oJSONHoldingArea.setProperty("/rowCountChanSpread", tableData.length);

					//removing selections
					sap.ui.getCore().byId("idTableChanSpread").clearSelection();
				}

				//if shared holding area
				else if (data === "H") {

					//populate chan spreadsheet table
					oJSONHoldingArea.setProperty("/tableDataShared", tableData);

					//set number of records in chan spreadsheet table
					oJSONHoldingArea.setProperty("/rowCountShared", tableData.length);

					//removing selections
					sap.ui.getCore().byId("idTableShared").clearSelection();
				}

				//setting model back to the view
				this.getView().setModel(oJSONHoldingArea, "holdingAreaModel");
			}

			//get call for downloading from holding area
			else if (type === "DownloadHoldingArea") {

				//set busy indicator as true
				//this.getView().setBusy(true);

				//if sales document
				if (data === "S") {

					//selected indeces of saled doc holding area
					selectedIndeces = sap.ui.getCore().byId("idTableSalesDoc").getSelectedIndices();

					//records in table
					tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataSalesDoc");
				}

				//if channeling spreadsheet
				else if (data === "C") {

					//selected indeces of chan spreadsheet holding area
					selectedIndeces = sap.ui.getCore().byId("idTableChanSpread").getSelectedIndices();

					//records in table
					tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataChanSpread");
				}
				//if shared holding area
				else if (data === "H") {

					//selected indeces of chan spreadsheet holding area
					selectedIndeces = sap.ui.getCore().byId("idTableShared").getSelectedIndices();

					//records in table
					tableData = this.getView().getModel("holdingAreaModel").getProperty("/tableDataShared");
				}

				//string with all document IDs selected, seperated by comma
				var docs = tableData[selectedIndeces[0]].Document;

				//loop through selected records
				for (i = 1; i < selectedIndeces.length; i++) {

					//concat to string
					docs = docs + "," + tableData[selectedIndeces[i]].Document;
				}

				//service call to download
				var sPath = "/sap/opu/odata/sap/ZSA_GW_CONTRACT_DB_SRV/Ety_Download_TemplateSet(Document='" + docs + "',Type='" + data +
					"')/$value";
				this.myWindow = window.open(sPath, "_blank");

				//set busy indicator as false
				//	this.getView().setBusy(false);

			}
		},

		_crossAppNavToCustDoc: function (type) {

			//if nav to sales doc upload
			if (type === "S") {

				//view in cust doc to nav to
				var view = "/SalesDocument";
			}

			//if nav to channeling spreadsheet upload
			else if (type === "C") {

				//view in cust doc to nav to
				view = "/ChannelsSpreadsheet";
			}

			var url = window.location.href;
			url = url.substring(0, url.lastIndexOf("#"));
			if (url.lastIndexOf("?") === -1) {
				url = url + "?";
			} else {
				url = url + "&";
			}
			url = url + "#ZSR_SEMI_AUTO-manage&" + view;
			sap.m.URLHelper.redirect(url, true);
		},

		//*******END OF SRF106D_4 Sprint 1.7 September Release CHANGES BY ARJUN*********//

		//*******START OF SRF106D_4 Sprint 2.1 Hypercare Release CHANGES BY ARJUN*********//

		//function executed on Cancel press of Add to Shared holding area dialog box
		onAddToSharedOKPress: function (oEvent) {

			var sPath = oEvent.getSource().getBindingContext("holdingAreaModel").getPath();
			var selectedSharedArea = this.getView().getModel("holdingAreaModel").getProperty(sPath);

			//json model
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");
			// var rbData = oJSONHoldingArea.getProperty("/rbData");

			var flag = oJSONHoldingArea.getProperty("/flag");

			// for (var i = 0; i < rbData.length; i++) {

			// if (sap.ui.getCore().byId(rbData[i].id).getSelected()) {
			// 	var selectedRB = rbData[i];
			// }
			// }

			//Batch POST call sending data to holding area
			this._semiAutomationCalls("AddHoldingArea", flag, {
				"id": selectedSharedArea.HOLDING_AREA_ID,
				"name": selectedSharedArea.HOLDING_AREA
			});

			//close dialog box
			this._oDialogSharedHA.close();

			//destroy dialog box
			this._oDialogSharedHA.destroy();

			//avoid duplicates issue
			this._oDialogSharedHA = null;
		},

		//function executed on Delete press of Add to Shared holding area dialog box
		onDeletefromSharedPress: function (oEvent) {

			/*soc szanzaney 4/20 CR139741*/
			var sPath = oEvent.getSource().getBindingContext("holdingAreaModel").getPath();
			var selectedSharedArea = this.getView().getModel("holdingAreaModel").getProperty(sPath);

			//json model
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");
			// var rbData = oJSONHoldingArea.getProperty("/rbData");

			var flag = oJSONHoldingArea.getProperty("/flag");

			// for (var i = 0; i < rbData.length; i++) {

			// if (sap.ui.getCore().byId(rbData[i].id).getSelected()) {
			// 	var selectedRB = rbData[i];
			// }
			// }

			var f = [];
			f.push(new sap.ui.model.Filter("Holding_Area_Id", "EQ", selectedSharedArea.HOLDING_AREA_ID));
			var arraySH = [];
			var that = this;

			//GET call with entity set Ety_Add_Holding_AreaSet
			this.getOwnerComponent().getModel().read("/Ety_Add_Holding_AreaSet", {
				method: "GET",
				filters: f,
				success: function (oData) {
					arraySH.push(oData.results);
					if (arraySH.length > 0) {

						sap.m.MessageBox.show(
							"Holding Area is not empty, are you sure you want to delete?", {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Holding Area not empty!",
								actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
								onClose: function (sAction1) {
									if (sAction1 === "OK") {

										//Batch POST call sending data to holding area
										that._semiAutomationCalls("DeleteSharedHoldingArea", flag, {
											"id": selectedSharedArea.HOLDING_AREA_ID,
											"name": selectedSharedArea.HOLDING_AREA
										});

									}

								}
							});
						/*eoc szanzaney 4/20 CR139741*/
					}

				}.bind(this),
				error: function (oError) {

					//display reason for error in GET call to user
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					MessageBox.error(msg);

					//releasing busy indicator
					//		this.getView().setBusy(false);
				}.bind(this)
			});

		},

		onAcceptDeletefromSharedPress: function (oEvent) {},
		//function executed on Cancel press of Add to Shared holding area dialog box
		onAddToSharedClosePress: function () {

			//close dialog box
			this._oDialogSharedHA.close();

			//destroy dialog box
			this._oDialogSharedHA.destroy();

			//avoid duplicates issue
			this._oDialogSharedHA = null;
		},

		//function executed of user selects/unselects new shared holding area creation radio button
		onSelectInputForNew: function () {

			if (sap.ui.getCore().byId("idRBSharedTypeNew").getSelected()) {
				sap.ui.getCore().byId("idInputForNew").setEnabled(true);
			} else {
				sap.ui.getCore().byId("idInputForNew").setEnabled(false);
			}
		},

		onChangeSharedHoldingArea: function () {
			//GET call for holding area data
			/*soc szanzaney 4/26 CR139741*/
			this._semiAutomationCalls("ViewHoldingArea");
			sap.ui.getCore().byId("idTableShared").clearSelection();
			/*eoc szanzaney 4/36 CR139741*/
		},

		//on create new shared holding area
		onCreateSharedPress: function () {
			var newHoldingAreaName = sap.ui.getCore().byId("idInputForNew").getValue();
			var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");
			/*soc szanzaney 4/12 CR139741*/
			var _flagDuplicateHA = "";

			if (oJSONHoldingArea.oData.rbData !== undefined) {
				for (var i = 0; i < oJSONHoldingArea.oData.rbData.length; i++) {
					if (newHoldingAreaName === oJSONHoldingArea.oData.rbData[i].HOLDING_AREA) {
						_flagDuplicateHA = "X";
					}
				}
			}

			if (_flagDuplicateHA === "X") {
				var msg = "Holding Area with same name already exists. Please create a new Holding Area with an unique description";
				MessageBox.error(msg);
			} else {
				/*eoc szanzaney 4/12 CR139741*/

				var existingSharedArea = oJSONHoldingArea.getProperty("/rbData");
				var existingSharedAreaLength = oJSONHoldingArea.getProperty("/numberOfSharedAreas");
				var flag = oJSONHoldingArea.getProperty("/flag");

				if (newHoldingAreaName !== "" || newHoldingAreaName !== null || newHoldingAreaName !== undefined) {

					if (existingSharedArea) {
						/*if (existingSharedAreaLength === 10) {
							var msg = "You can only add upto 10 Shared Holding Areas";
							MessageBox.error(msg);
						} else {*/
						var holdingAreaID = (parseInt(existingSharedArea[existingSharedAreaLength - 1].HOLDING_AREA_ID) + 1).toString();

						var payload = {

							HOLDING_AREA_ID: holdingAreaID,
							HOLDING_AREA: newHoldingAreaName

						};
						/*	}*/
					} else {

						var payload = {

							HOLDING_AREA_ID: '0',
							HOLDING_AREA: newHoldingAreaName

						};
					}
					var oModel = this.getOwnerComponent().getModel();

					// post call to add to holding area
					oModel.create("/ETY_HOLDING_AREASet", payload, {
						async: true,
						method: 'POST',
						success: function (oData) {
							this.getOwnerComponent().getModel().read("/ETY_HOLDING_AREASet", {
								method: "GET",
								success: function (oDataRefresh) {

									//json model
									var oJSONHoldingArea = this.getView().getModel("holdingAreaModel");

									// var rbData = [];
									for (var i = 0; i < oDataRefresh.results.length; i++) {

										// rbData.push({
										// 	"id": "id_rb_" + oData.results[i].HOLDING_AREA_ID,
										// 	"text": oData.results[i].HOLDING_AREA
										// });

										// var rb = new sap.m.RadioButton({
										// 	id: "id_rb_" + oData.results[i].HOLDING_AREA_ID,
										// 	text: oData.results[i].HOLDING_AREA
										// });

										oJSONHoldingArea.setProperty("/rbData", oDataRefresh.results);
										oJSONHoldingArea.setProperty("/numberOfSharedAreas", oDataRefresh.results.length);

									}
									/*	//close dialog box
										this._oDialogSharedHA.close();

										//destroy dialog box
										this._oDialogSharedHA.destroy();

										//avoid duplicates issue
										this._oDialogSharedHA = null;*/
								}.bind(this),

								error: function (oError) {

									//error message
									var responseText = JSON.parse(oError.responseText);
									var msg = responseText.error.message.value;
									MessageBox.error(msg);
								}
							});
						}.bind(this),

						error: function (oError) {}
					});

				}

				//	this.getView().setBusy(true);
				this.onAddToSharedClosePress();

			}
		}

		//*******END OF SRF106D_4 Sprint 2.1 Hypercare Release CHANGES BY ARJUN*********//

	});

});