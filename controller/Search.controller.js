sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/AnnotationHelper"
], function (Controller, MessageToast, Filter, FilterOperator, BindingMode, ODataModel, AnnotationHelper) {
	"use strict";

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.Search", {
		onBeforeRendering: function () {
			this.checkUserAuth();
		},
		checkUserAuth: function () {
			var oServiceModel = this.getOwnerComponent().getModel();
			var sPath = "/Ets_User_Auth('Default')";

			var mParameters = {
				method: "GET",
				//filters: f,
				async: false, //AND
				success: jQuery.proxy(function (oData) {
					if (oData.EXTENDED_MAINTENANCE === "") {
						this.getView().byId("id_btn_search_global_update").setVisible(false);
					} else {
						this.getView().byId("id_btn_search_global_update").setVisible(true);
					}
					/*soc szanzaney 05/07 - switch to enable only for ccb*/
					/*	var oModel = this.getView().getModel("VisibilityModel");
						if (oData.LINKED_SO_FLAG === "X") {
							var data = oModel.getData().Visibility;
							data.Linked_SO = true;
							oModel.refresh(true);
						} else {
							var data = oModel.getData().Visibility;
							data.Linked_SO = true;
							oModel.refresh(true);
						}*/
					/*eoc szanzaney 05/07 - switch to enable only for ccb*/
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
		onInit: function () {

			/*soc szanzaney 05/07 - switch to enable only for ccb*/
			/*	this.oViewModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(this.oViewModel, "VisibilityModel");
				var oModel = this.getView().getModel("VisibilityModel");
				var data = {
					"Visibility": {
						"Linked_SO": false
					}

				};
				oModel.setData(data);
				oModel.refresh(true);*/
			/*eoc szanzaney 05/07 - switch to enable only for ccb*/

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);

			//--Remove Filter Bar Buttons from All Filterbars
			this.FilterBarids = [
				"id_fb_main_selection",
				"id_fb_global_data",
				"id_fb_contract_data",
				"id_fb_partners",
				"id_fb_additional_data",
				"id_fb_ib_parameters",
				"id_fb_additional_filters"
			];
			var _vController = this;
			var id = _vController.FilterBarids;
			for (var i = 0; i < id.length; i++) {
				var fb = _vController.getView().byId(id[i]);
				fb.setUseToolbar(false);
				fb._oFiltersButton.setVisible(false);
			}

			this.Dynamic_hierarchy = "";

			//--Maintain all Id's in arrays to loop them at end during service call
			this.singleInputFields = [{
				"key": "View_Flag",
				"id": "id_inp_view_flag"
			}];
			this.booleanFields = [{
					"key": "Show_Expired_Contracts",
					"id": "id_inp_show_expired_contracts"
				}, {
					"key": "Exclude_Fully_Rejected",
					"id": "id_inp_exclude_fully_rejected"
				}, {
					"key": "Exclude_fully_referenced",
					"id": "id_inp_exclude_fully_referenced"
				}, {
					"key": "MV_Products_Only",
					"id": "id_inp_mv_products_only"
				},
				/*SOC szanzaney CCB488*/

				{
					"key": "IncludeLinkedSO",
					"id": "id_inp_include_linked_so"
				}
				/*EOC szanzaney CCB488*/
			];
			this.dateFields = [{
				"key": "Created_Date",
				"id": "id_inp_created_date"
			}, {
				"key": "Contract_Start_Date",
				"id": "id_inp_contract_start_date"
			}, {
				"key": "Contract_End_Date",
				"id": "id_inp_contract_end_date"
			}, {
				"key": "Action_Date",
				"id": "id_inp_action_date"
			}, {
				"key": "Valid_To",
				"id": "id_inp_valid_to"
			}];
			this.multiInputFields = [{
					"key": "Contract_Start_Date",
					"id": "id_inp_contract_start_date"
				}, {
					"key": "Contract_Number",
					"id": "id_inp_contract_number"
				}, {
					"key": "Sales_Order_Number",
					"id": "id_inp_sales_order_number"
				}, {
					"key": "AMP_ID",
					"id": "id_inp_amp_id"
				}, {
					"key": "RTM_FL",
					"id": "id_inp_rtm_fl"
				}, {
					"key": "Contract_Admin",
					"id": "id_inp_contract_admin"
				}, {
					"key": "Sold_To",
					"id": "id_inp_sold_to"
				}, {
					"key": "Tier_2_Reseller",
					"id": "id_inp_reseller"
				}, {
					"key": "End_Customer_ID",
					"id": "id_inp_end_customer_id" //moved this up for ER-1292(INC0168468) 08 April 2021 ++VSINGH39
				}, {
					"key": "Master_Contract",
					"id": "id_inp_master_contract"
				}, {
					"key": "Low_Level_Functional_Location",
					"id": "id_inp_llfl"
				}, {
					"key": "Sales_Organization",
					"id": "id_inp_sales_org"
				}, {
					"key": "Country",
					"id": "id_inp_country"
				}, {
					"key": "Region",
					"id": "id_inp_region"
				}, {
					"key": "SalesOffice",
					"id": "id_inp_salesOffice" // for ER 1294 INC0168697 08 April 2021 ++VSINGH39
				}, {
					"key": "Created_By",
					"id": "id_inp_created_by"
				}, {
					"key": "Action_Code",
					"id": "id_inp_action_code"
				}, {
					"key": "Usage_Indicator_C",
					"id": "id_inp_myAPO"
				}, {
					"key": "Quote_Status",
					"id": "id_inp_quote_status"
				}, {
					"key": "Quote",
					"id": "id_inp_quote_status"
				}, {
					"key": "Term",
					"id": "id_inp_term"
				}, {
					"key": "Contract_Status",
					"id": "id_inp_contract_status"
				}, {
					"key": "Document_Type",
					"id": "id_inp_document_type"
				}, {
					"key": "Ordering_Contact",
					"id": "id_inp_ordering_contact"
				}, {
					"key": "HPE_Sales_Rep",
					"id": "id_inp_hpe_sales_rep"
				}, {
					"key": "IB_Sales_Rep",
					"id": "id_inp_ib_sales_rep"
				}, {
					"key": "AOL_Account_Operational_Leads",
					"id": "id_inp_aol"
				}, {
					"key": "System_Manager",
					"id": "id_inp_system_manager"
				}, {
					"key": "HPE_Sales_Rep_Contact",
					"id": "id_inp_hpe_sales_rep_contact"
				}, // {
				// 	"key": "End_Customer_ID",
				// 	"id": "id_inp_end_customer_id" //commented for ER-1292(INC0168468) 08 April 2021 ++VSINGH39
				// }, 
				{
					"key": "Asset_Location",
					"id": "id_inp_asset_location"
				}, {
					"key": "Delivery_Contact",
					"id": "id_inp_delivery_contact"
				}, {
					"key": "Payer",
					"id": "id_inp_payer"
				}, {
					"key": "Bill_To",
					"id": "id_inp_bill_to"
				}, {
					"key": "Software_Delivery_Contact",
					"id": "id_inp_software_delivery_contact"
				}, {
					"key": "Invocing_Contact",
					"id": "id_inp_invoicing_contact"
				}, {
					"key": "PSP",
					"id": "id_inp_psp"
				}, {
					"key": "PSP_Contact",
					"id": "id_inp_psp_contact"
				}, {
					"key": "Entitled_Party",
					"id": "id_inp_entitled_party"
				}, {
					"key": "GBS_Admin",
					"id": "id_inp_gbs_admin"
				}, {
					"key": "PSP_Subcontractor", //Added as part of SRR071D enhancements- 11/09/2019
					"id": "id_inp_psp_subcntrct"
				}, {
					"key": "Install_Base_Sales_rep",
					"id": "id_inp_install_base_sales_rep"
				}, {
					"key": "Opportunity_ID",
					"id": "id_inp_opportunity_id"
				}, {
					"key": "Product_Number",
					"id": "id_inp_product_number"
				}, {
					"key": "Customer_PO_Number",
					"id": "id_inp_customer_po_number"
				}, {
					"key": "Customer_Ready",
					"id": "id_inp_customer_ready"
				}, {
					"key": "OEM_ODP",
					"id": "id_inp_oem_odp"
				}, {
					"key": "Route_to_Market",
					"id": "id_inp_route_to_market"
				}, {
					"key": "BRT",
					"id": "id_inp_brt"
				}, {
					"key": "Legacy_Document_Number",
					"id": "id_inp_legacy_document_number"
				}, {
					"key": "Deal_ID",
					"id": "id_inp_deal_id"
				}, {
					"key": "Purchase_Agreement_ID",
					"id": "id_inp_purchase_agreement_id"
				}, {
					"key": "Reseller_Po", //Added as part of SRR071D enhancements- 11/09/2019
					"id": "id_inp_reseller_PO"
				}, {
					"key": "Item_category", //Added as part of SRR071D enhancements- 11/09/2019
					"id": "id_inp_item_category"
				}, {
					"key": "Serial_Number",
					"id": "id_inp_serial_number"
				}, {
					"key": "TechIdentNo", //-INC0154688 ++VS
					"id": "id_inp_techidentNo"
				}, {
					"key": "Equipment_Number",
					"id": "id_inp_equipment_number"
				}, {
					"key": "PAC_Code",
					"id": "id_inp_pac_code"
				}, {
					"key": "Material_Number",
					"id": "id_inp_material_number"
				}, {
					"key": "GIDI"
				}, {
					"key": "Invoice_Methodology"
				}, {
					"key": "Business_Unit",
					"id": "id_inp_business_unit"
				}, {
					"key": "Profit_Center",
					"id": "id_inp_profit_center"
				}, /*SOC szanzaney SRE2524*/

				{
					"key": "AgentNumber",
					"id": "id_agt_no"
				}, {
					"key": "ExternalId",
					"id": "id_ext_no"
				}
				/*EOC szanzaney SRE2524*/
			];
		},
		_handleRouteMatched: function (event) {

			var oparameters = event.getParameter("name");
			var sParams = event.getParameter("arguments").Contracts;
			if (sParams !== undefined) {
				var items = sParams.split(",");
				var component = this.getOwnerComponent();
				component.items = items;
				this.onIntializeBar();
				var bar = this.getView().byId("id_fb_main_selection");
				bar.initialse();
			}

			if (oparameters !== "" && oparameters !== "home") {
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
			}
		},
		onIntializeBar: function (evemt) {
			var oSmartFilter = this.getView().byId("id_fb_main_selection");
			var items = this.getOwnerComponent().items;
			if (items !== undefined) {
				var oJSONData = [];
				oJSONData = {
					// Contract_Number: {
					// 	items: []

					// }
					// 121494 Property changed to Sales_Order_Number ++ VS 
					Sales_Order_Number: {
						items: []

					}
				};
				for (var y = 0; y < items.length; y++) {
					// 121494 Property changed to Sales_Order_Number ++ VS
					oJSONData.Sales_Order_Number.items.push({
						key: items[y],
						text: items[y]
					});

				}

				oSmartFilter.setFilterData(oJSONData); //Data will be updated with existing data in the SmartFilter                     
			}

		},

		handleChange: function (oEvent) {
			var bValid = oEvent.getParameter("valid");
			var oEventSource = oEvent.getSource();
			if (bValid) {
				oEventSource.setValueState(sap.ui.core.ValueState.None);
			} else {
				oEventSource.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		fetchFilters: function () {
			var controller = this;
			controller.count = 0;

			var f = [];
			var singleInputFields = this.singleInputFields;
			var dateFields = this.dateFields;
			var booleanFields = this.booleanFields;
			var sFilterArray = [];

			//---Fetch Filters For Single Input Fields
			for (var i = 0; i < singleInputFields.length; i++) {
				var _vPath = singleInputFields[i].key;
				var _vOperator = FilterOperator.EQ;
				var inputControl = controller.getView().byId(singleInputFields[i].id);
				if (inputControl !== undefined) {
					var _value = "";
					if (singleInputFields[i].key === "View_Flag") {
						_value = inputControl.getSelectedKey();
					} else {
						_value = inputControl.getValue();
					}
					if (_value !== "") {
						sFilterArray.push(new Filter({
							path: _vPath,
							operator: _vOperator,
							value1: _value
						}));
						controller.count = controller.count + 1;
					}
				}
			}

			//---Fetch Filters For Date Fields
			for (i = 0; i < dateFields.length; i++) {
				_vPath = dateFields[i].key;
				_vOperator = FilterOperator.BT;
				inputControl = controller.getView().byId(dateFields[i].id);
				if (inputControl !== undefined) {
					if (inputControl.getValueState() === sap.ui.core.ValueState.None && inputControl.getValue() !== "") {
						_value = inputControl.getValue().split(" - ");
						var _value1 = _value[0].substring(6) + _value[0].substring(3, 5) + _value[0].substring(0, 2);
						var _value2 = _value[1].substring(6) + _value[1].substring(3, 5) + _value[1].substring(0, 2);

						if (_value !== "") {
							sFilterArray.push(new Filter({
								path: _vPath,
								operator: _vOperator,
								value1: _value1,
								value2: _value2
							}));
							controller.count = controller.count + 1;
						}
					}
				}
			}

			//---Fetch Filters For Boolean Fields //Do not increment filter count here
			for (i = 0; i < booleanFields.length; i++) {
				_vPath = booleanFields[i].key;
				_vOperator = FilterOperator.EQ;
				inputControl = controller.getView().byId(booleanFields[i].id);
				if (inputControl !== undefined) {
					_value = inputControl.getSelected();
					if (_value === true) {
						_value = "X";
					} else if (_value === false) {
						_value = "";
					}

					sFilterArray.push(new Filter({
						path: _vPath,
						operator: _vOperator,
						value1: _value
					}));
				}
			}

			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var multiInputFields = this.multiInputFields;
			var filterBarId = this.FilterBarids;
			var mFilterArray = [];

			for (var j = 0; j < multiInputFields.length; j++) {
				for (var k = 0; k < filterBarId.length; k++) { //Check which filter bar has this control
					var smartFilterBar = controller.getView().byId(filterBarId[k]); // get the filter bar instance
					if (smartFilterBar.getFilterData()[multiInputFields[j].key] !== undefined) {
						var ranges = smartFilterBar.getFilterData()[multiInputFields[j].key].ranges;
						var items = smartFilterBar.getFilterData()[multiInputFields[j].key].items;
						//--Handle Range
						if (ranges !== undefined) {
							if (ranges.length === 1) {
								ranges.forEach(function (elem) {
									mFilterArray.push(new sap.ui.model.Filter(multiInputFields[j].key, elem.operation, elem.value1, elem.value2));
								});
								var mFF3 = new Filter({
									filters: mFilterArray,
									and: true
								});
								f.push(mFF3);
								mFilterArray = [];
								controller.count = controller.count + 1;

							} else if (ranges.length > 1) {
								ranges.forEach(function (elem) {
									mFilterArray.push(new sap.ui.model.Filter(multiInputFields[j].key, elem.operation, elem.value1, elem.value2));
								});
								var mFF4 = new Filter({
									filters: mFilterArray,
									and: false
								});
								f.push(mFF4);
								mFilterArray = [];
								controller.count = controller.count + 1;
							}
						}
						//--Handle Items
						if (items.length === 1) {
							items.forEach(function (elem) {
								mFilterArray.push(new sap.ui.model.Filter(multiInputFields[j].key, "EQ", elem.key));
							});
							var mFF1 = new Filter({
								filters: mFilterArray,
								and: true
							});
							f.push(mFF1);
							mFilterArray = [];
							controller.count = controller.count + 1;

						} else if (items.length > 1) {
							items.forEach(function (elem) {
								mFilterArray.push(new sap.ui.model.Filter(multiInputFields[j].key, "EQ", elem.key));
							});
							var mFF = new Filter({
								filters: mFilterArray,
								and: false
							});
							f.push(mFF);
							mFilterArray = [];
							controller.count = controller.count + 1;
						}
					}
				}
			}
			/**** BoC SRR071D Enhancement- 24/09/2019 ****/
			/*if (this.Dynamic_hierarchy !== "") {
				var Dynamic_Hierarchy = this.Dynamic_hierarchy;
				f.push(new sap.ui.model.Filter("Dynamic_hierarchy", "EQ", Dynamic_Hierarchy));
			}*/
			/**** EoC SRR071D Enhancement- 24/09/2019 ****/

			//---Fetch Filters For Multi Input Fields

			/*var multiInputFields = this.multiInputFields;
						var mFilterArray = [];
			
						for (var j = 0; j < multiInputFields.length; j++) {
							var _vPathM = multiInputFields[j].key;
							var _vOperatorM = FilterOperator.EQ;
							var inputControlM = controller.getView().byId(multiInputFields[j].id);
							if (inputControlM !== undefined) {
								var tokens = inputControlM.getTokens();
								if (tokens.length > 0) {
									mFilterArray = [];
									for (var k = 0; k < tokens.length; k++) {
										var _tokenValue = inputControlM.getTokens()[k].getProperty("key");
										if (_tokenValue !== "") {
											mFilterArray.push(new Filter({
												path: _vPathM,
												operator: _vOperatorM,
												value1: _tokenValue
											}));
										}
									}

									var mFF = new Filter({
										filters: mFilterArray,
										and: false
									});

									f.push(mFF);

									controller.count = controller.count + 1;
								}
							}

						}*/
			return f;
		},
		onPressGlobalUpdate: function (oEvent) {
			this.oRouter.navTo("GlobalUpdate", {});
		},
		onPressExecute: function (oEvent) {
			var f = this.fetchFilters(); //final array of filters

			if (f.length >= 2) {
				var aFilters = f[1].aFilters;
				var count = 0;
				for (var i = 0; i < aFilters.length; i++) {
					if (aFilters[i].sPath === "Contract_Number" ||
						aFilters[i].sPath === "Sales_Order_Number" ||
						aFilters[i].sPath === "AMP_ID" ||
						aFilters[i].sPath === "RTM_FL" ||
						aFilters[i].sPath === "Contract_Admin" ||
						aFilters[i].sPath === "Sold_To" ||
						aFilters[i].sPath === "Tier_2_Reseller" ||
						aFilters[i].sPath === "Master_Contract" ||
						aFilters[i].sPath === "Low_Level_Functional_Location" ||
						aFilters[i].sPath === "Serial_Number" ||
						aFilters[i].sPath === "PAC_Code" ||
						aFilters[i].sPath === "TechIdentNo" || ////-INC0154688 ++VS
						aFilters[i].sPath === "End_Customer_ID" ////for ER-1292(INC0168468) 08 April 2021 ++VSINGH39

					) {
						count = count + 1;
						break;
					}
				}
				if (count === 0) {
					sap.m.MessageBox.show(
						"Please Enter atleast 1 Field from Main Selection to Proceed...!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Enter Selection Criteria",
							actions: [sap.m.MessageBox.Action.OK]
						});
				} else {
					/*SOC szanzaney CCB488*/
					var linkedSO = this.getView().byId("id_inp_include_linked_so").getSelected();
					var smartFilterBar = this.getView().byId("id_fb_main_selection"); // get the filter bar instance
					var k = smartFilterBar.getFilterData();
					if (k.Sales_Order_Number === undefined && linkedSO === true) {

						sap.m.MessageBox.show(
							"Show Contracts for Linked SO’s is selected, Please enter at least 1 Sales Order to Proceed", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Enter Selection Criteria",
								actions: [sap.m.MessageBox.Action.OK]
							});

					}
					/*EOC szanzaney CCB488*/
					else {

						if (this.getView().byId("id_inp_view_flag").getSelectedKey() !== "6") { //Not Dynamic
							this.getReportData(f);
						} else {
							this.f = f;
							this.onHierarchyChange(oEvent);
						}
					}

				}
			} else {
				/*SOC szanzaney CCB488*/
				var linkedSO = this.getView().byId("id_inp_include_linked_so").getSelected();
				var smartFilterBar = this.getView().byId("id_fb_main_selection"); // get the filter bar instance
				var k = smartFilterBar.getFilterData();

				if (k.Sales_Order_Number.items.length === undefined && linkedSO === true) {

					sap.m.MessageBox.show(
						"Show Contracts for Linked SO’s is selected, Please enter at least 1 Sales Order to Proceed", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Enter Selection Criteria",
							actions: [sap.m.MessageBox.Action.OK]
						});

				}
				/*EOC szanzaney CCB488*/
				else {

					sap.m.MessageBox.show(
						"Please Enter atleast 1 Field from Main Selection to Proceed...!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Enter Selection Criteria",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
			}
			/*if (this.count < 3) {
				sap.m.MessageBox.show(
					"Please Enter atleast 2 Fields to Proceed...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Enter Selection Criteria",
						actions: [sap.m.MessageBox.Action.OK]
					});
			} else {
				this.getReportData(f);
			}*/
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
						component.hierarchySelectedKey = controller.getView().byId("id_inp_view_flag").getSelectedKey();
						controller.oRouter.navTo("Results", {});
						//controller.oRouter.navTo("EquipmentReport_Results", {});
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

		/****BoC for SRR071D Enhancements 19/09/2019****/
		onHierarchyChange: function (oEvent) {
			var controller = this;
			var selected = controller.getView().byId("id_inp_view_flag").getSelectedKey();

			if (selected === "6") {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment(
						"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.DynamicHierarchy", this);
					this.getView().addDependent(this._oDialog, this);

				}
				this._oDialog.open();
			}
		},
		handleClose: function (oEvent) {
			this._oDialog.close();
		},

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		afterClose: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null; // make it falsy so that it can be created next time
			}
		},
		onConfirm: function (oEvent) {

			var i;
			var oValue = [];
			for (i = 0; i < 6; i++) {
				/*var a = oEvent.getSource().getParent().getContent()[0].mAggregations.items[i].mAggregations.cells[1].mAggregations.items[0].getState();
				var t = oEvent.getSource().getParent().getContent()[0].mAggregations.items[i].mAggregations.cells[0].getText();*/
				var a = oEvent.getSource().getParent().getContent()[0].getAggregation("items")[i].getAggregation("cells")[1].getAggregation(
					"items")[0].getState();
				var t = oEvent.getSource().getParent().getContent()[0].getAggregation("items")[i].getAggregation("cells")[0].getText();
				if (a === true) {
					oValue.push(t);
					// this.Dynamic_hierarchy = oValue[i] + "||";
				}
			}
			this.Dynamic_hierarchy = oValue.join(' > ').toString();
			this.getOwnerComponent().Dynamic_hierarchy = this.Dynamic_hierarchy;
			this.handleClose();
			if (this.Dynamic_hierarchy !== "") {
				var Dynamic_Hierarchy = this.Dynamic_hierarchy;
				this.f.push(new sap.ui.model.Filter("Dynamic_hierarchy", "EQ", Dynamic_Hierarchy));
			}
			this.getReportData(this.f);
		},
		onPressEquipmentReport: function (evt) {
			this.oRouter.navTo("EquipmentReport_Search", {});
		},
		onMoveUp: function (evt) {
			var oContractText = sap.ui.getCore().byId("id_columnContract").getCells()[0].getText();
			var oLLFLText = sap.ui.getCore().byId("id_columnLLFL").getCells()[0].getText();

			if (oContractText === "(Contract / Quote)") {
				// sap.ui.getCore().byId("id_moveup").setVisible(false);
				// sap.ui.getCore().byId("id_movedown").setVisible(true);
				sap.ui.getCore().byId("id_columnLLFL").getCells()[0].setText("(Contract / Quote)");
				sap.ui.getCore().byId("id_columnContract").getCells()[0].setText("LLFL");
				sap.ui.getCore().byId("id_col_cq").setVisible(true);
				sap.ui.getCore().byId("id_col_llfl").setVisible(false);
			} else if (oContractText === "LLFL") {
				// sap.ui.getCore().byId("id_moveup").setVisible(true);
				// sap.ui.getCore().byId("id_movedown").setVisible(false);
				sap.ui.getCore().byId("id_columnLLFL").getCells()[0].setText("LLFL");
				sap.ui.getCore().byId("id_columnContract").getCells()[0].setText("(Contract / Quote)");
				sap.ui.getCore().byId("id_col_cq").setVisible(false);
				sap.ui.getCore().byId("id_col_llfl").setVisible(true);
			}
		},

		/****EoC for SRR071D Enhancements 19/09/2019****/
	});
});