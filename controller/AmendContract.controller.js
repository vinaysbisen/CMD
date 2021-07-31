jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/AnnotationHelper",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/formatter"
], function (Controller, JSONModel, MessageToast, Token, Spreadsheet, Filter, FilterOperator, BindingMode, ODataModel, AnnotationHelper,
	formatter) {
	"use strict";

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.AmendContract", {

		formatter: formatter,
		onChange_SSN_START_DATE: function (evt) {
			var startDate = evt.getSource().getValue();
			if (this.CONTRACT_START_DATE > startDate || startDate > this.CONTRACT_END_DATE) {
				evt.getSource().setValueState("Error");
				sap.m.MessageBox.show(
					"Date is out of contract tenure.Please enter a valid date..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			} else {
				evt.getSource().setValueState("None");
			}
		},
		onChange_SSN_END_DATE: function (evt) {
			var endDate = evt.getSource().getValue();
			if (this.CONTRACT_END_DATE < endDate || endDate < this.CONTRACT_START_DATE) {
				evt.getSource().setValueState("Error");
				sap.m.MessageBox.show(
					"Date is out of contract tenure.Please enter a valid date..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			} else {
				evt.getSource().setValueState("None");
			}
		},
		onChange_SSN_AMT: function (evt) {
			evt.getSource().setValue(Number(evt.getSource().getValue()).toFixed(2));
			var controller = this;
			var ssn = controller.getView().getModel("viewData").getProperty("/Add_SSN");
			var amt = 0.00;
			for (var i = 0; i < ssn.length; i++) {
				amt = +Number(ssn[i].AMOUNT).toFixed(2) + amt;
			}
			controller.getView().getModel("viewData").setProperty("/TOTAL_SSN", Number(amt).toFixed(2));
			//+Number(object.zdisc_avail).toFixed(2)

		},
		onChange_SSN_AMT_UserDef: function (evt) {
			evt.getSource().setValue(Number(evt.getSource().getValue()).toFixed(2));
			var controller = this;
			var ssn = controller.getView().getModel("viewData").getProperty("/custBillingItem");
			var amt = 0.00;
			for (var i = 0; i < ssn.length; i++) {
				amt = +Number(ssn[i].AMOUNT_USER).toFixed(2) + amt;
			}
			controller.getView().getModel("viewData").setProperty("/TOTAL_SSN_UserDef", Number(amt).toFixed(2));
			//+Number(object.zdisc_avail).toFixed(2)

		},
		onPressAddSSN: function (evt) {
			var controller = this;
			var ssn = controller.getView().getModel("viewData").getProperty("/Add_SSN");
			var index = evt.getSource().getParent().getParent().getBindingContext("viewData").sPath.split("/")[2];
			var obj1 = {
				START_DATE: ssn[index].START_DATE,
				END_DATE: ssn[index].END_DATE,
				AMOUNT: "0.00",
				minus_visible: true
			};

			//ssn.push(obj1);
			ssn.splice(+Number(index) + 1, 0, obj1);
			if (ssn.length <= 10) {
				controller.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisibleRowCount(ssn.length);
			} else {
				controller.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisibleRowCount(10);
			}
			controller.getView().getModel("viewData").setProperty("/Add_SSN", ssn);
			//controller.getView().getModel("viewData").setProperty("/TOTAL_SSN", "0.00");

		},
		onPressRemoveSSN: function (evt) {
			var controller = this;
			var index = evt.getSource().getParent().getParent().getBindingContext("viewData").sPath.split("/")[2];
			var ssn = controller.getView().getModel("viewData").getProperty("/Add_SSN");
			var amt = ssn[index].AMOUNT;
			var total = controller.getView().getModel("viewData").getProperty("/TOTAL_SSN");
			total = +Number(total) - +Number(amt);
			total = Number(total).toFixed(2);
			controller.getView().getModel("viewData").setProperty("/TOTAL_SSN", total);

			ssn.splice(index, 1);
			if (ssn.length <= 10) {
				controller.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisibleRowCount(ssn.length);
			} else {
				controller.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisibleRowCount(10);
			}
			controller.getView().getModel("viewData").setProperty("/Add_SSN", ssn);
		},
		onPress_BILL_SCH_ADJ: function (evt) {
			//SRE 2483 All the Previous code is written in  onclose method
			//MessageBOx added ++VS
			var sText = this.getView().getModel("viewData").getProperty("/Warning_Add_SSN")
			sap.m.MessageBox.show(
				sText, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						if (sAction === "OK") {
							var controller = this;
							var ssn = controller.getView().getModel("viewData").getProperty("/Add_SSN");

							var error = false;
							var error_amt = false;
							var error_missing_dates = false;
							var requestBody = {
								Contract_Number: this.contract,
								to_ssn: [],
								to_messages: []
							};

							for (var i = 0; i < ssn.length; i++) {
								var startDate = ssn[i].START_DATE;
								var endDate = ssn[i].END_DATE;
								//--> Check for Dates

								//else{
								if (startDate !== "" && endDate !== "") {
									//Check For Amounts	
									if (+Number(ssn[i].AMOUNT) === 0) {
										error_amt = true;
										sap.m.MessageBox.show(
											"Enter Amount for all SSN(s)..!!", {
												icon: sap.m.MessageBox.Icon.ERROR,
												title: "Error",
												actions: [sap.m.MessageBox.Action.OK]
											});
									} else {
										if (controller.CONTRACT_START_DATE > startDate || startDate > controller.CONTRACT_END_DATE ||
											controller.CONTRACT_END_DATE < endDate || endDate < controller.CONTRACT_START_DATE) {
											error = true;
										} else {
											var obj = {
												START_DATE: startDate,
												END_DATE: endDate,
												AMOUNT: ssn[i].AMOUNT
											};
											requestBody.to_ssn.push(obj);
										}

									}
								}

								if ((startDate === "" || endDate === "") && +Number(ssn[i].AMOUNT) !== 0) {
									error_missing_dates = true;
								}
								//}
							}

							if (error) {
								sap.m.MessageBox.show(
									"Date is out of contract tenure.Please enter a valid date..!!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							} else if (error_missing_dates) {
								sap.m.MessageBox.show(
									"Enter Start and End Date for All SSN(s)..!!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							} else {
								//Check For Total of SSN
								var total = controller.getView().getModel("viewData").getProperty("/TOTAL_SSN");
								if (+Number(total) !== 0) {
									error = true;
									sap.m.MessageBox.show(
										"BIL_SCH_ADJ SSN Total should add upto 0..!!", {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: "Error",
											actions: [sap.m.MessageBox.Action.OK]
										});
								}
							}

							//Make Service call if no errors
							if (!error && !error_amt && !error_missing_dates) {
								if (requestBody.to_ssn.length > 0) {
									this.requestBody = requestBody;
									this.updateContract_Service_Call();
								} else {
									sap.m.MessageBox.show(
										"No Updates performed...!!", {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: "Error",
											actions: [sap.m.MessageBox.Action.OK]
										});
								}
							}
						}

					}.bind(this)
				});

		},
		onPress_BILL_SCH_userBilling: function (evt) {

			//SRE 2483 All the Previous code is written in  onclose method
			//MessageBOx added ++VS

			var sText = this.getView().getModel("viewData").getProperty("/Warning_Add_SSN")
			sap.m.MessageBox.show(
				sText, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						if (sAction === "OK") {
							var controller = this;
							var ssn = controller.getView().getModel("viewData").getProperty("/eqalBillingItem");
							var requestBody = {
								Contract_Number: this.contract,
								to_ssn: [],
								to_messages: []
							};

							for (var i = 0; i < ssn.length; i++) {
								if (ssn[i].AMOUNT !== "0 ") {
									var obj = {
										START_DATE: ssn[i].START_DATE,
										END_DATE: ssn[i].END_DATE,
										// AMOUNT: (Number(ssn[i].AMOUNT).toFixed(2)).toString(),
										AMOUNT: (ssn[i].AMOUNT).toString(),
										BILL_FLAG: "B"
									};
									requestBody.to_ssn.push(obj);
								}
							}
							//Make Service call if no errors

							if (requestBody.to_ssn.length > 0) {
								this.requestBody = requestBody;
								this.updateContract_Service_Call();
							} else {
								var sText;
								if (ssn.length > 0) { // INC0162703 copy complete method while retrofitting
									sText = "Billing for settlement period is already equal.No update performed...!!"
								} else {
									sText = "No Updates performed...!!"
								}
								sap.m.MessageBox.show(
									sText, {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							}
						}

					}.bind(this)
				});

		},

		onPressAdjBillingUserDef: function (evt) {
			var sText = this.getView().getModel("viewData").getProperty("/Warning_Add_SSN")
			sap.m.MessageBox.show(
				sText, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						if (sAction === "OK") {

							var controller = this;
							var ssn = controller.getView().getModel("viewData").getProperty("/custBillingItem");
							var requestBody = {
								Contract_Number: this.contract,
								to_ssn: [],
								to_messages: []
							};

							if (this.getView().getModel("viewData").getProperty("/TOTAL_SSN_UserDef") !==
								this.getView().getModel("viewData").getProperty("/TOTAL_SSN_UserDefSrv")) {
								sap.m.MessageBox.show(
									"Sum of customer requested billing should match with SAP calculated total billed amount.", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
								return;
							}

							for (var i = 0; i < ssn.length; i++) {
								if (+Number(ssn[i].AMOUNT_USER) === 0) {
									sap.m.MessageBox.show(
										"Enter Amount for all SSN(s)..!!", {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: "Error",
											actions: [sap.m.MessageBox.Action.OK]
										});
									return;
								}
								var obj = {
									START_DATE: ssn[i].START_DATE,
									END_DATE: ssn[i].END_DATE,
									AMOUNT: Number(ssn[i].AMOUNT_USER - ssn[i].AMOUNT_CUST).toFixed(2),
									BILL_FLAG: "C"
								};
								requestBody.to_ssn.push(obj);

							}
							//Make Service call if no errors

							if (requestBody.to_ssn.length > 0) {
								this.requestBody = requestBody;
								this.updateContract_Service_Call();
							} else {
								sap.m.MessageBox.show(
									"No Updates performed...!!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							}

						}

					}.bind(this)
				});
		},
		getContractDetails: function (hidebusyIndicator) {
			var ocontract = this.contract;
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "Contract_Number",
				operator: FilterOperator.EQ,
				value1: ocontract
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);
			var path = "/Ets_Amend_Contract";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			var controller = this;
			if (hidebusyIndicator !== true) {
				oGlobalBusyDialog.open();
			}
			var oModel1 = this.getOwnerComponent().getModel();
			oModel1.read(
				path, {
					urlParameters: {
						"$format": "json",
						"$expand": "to_reject_items,to_serial_numbers,to_settlement_header,to_settlement_item"
					},
					filters: f,
					success: function (data, response) {
						if (hidebusyIndicator !== true) {
							oGlobalBusyDialog.close();
						}
						var header = data.results[0];
						controller.Warning_msg_on_cancellation = header.Warning_msg_on_cancellation;
						controller.Relevant_For_1251 = header.Relevant_For_1251;
						controller.Response_For_1251 = "";
						if (header.Cancellation_Date !== "" && header.Cancellation_Date !== "00000000") {
							controller.getView().byId("id_inp_amend_c_cancellation_date").setValue(header.Cancellation_Date);
						}
						if (header.Receipt_Of_Cancellation !== "" && header.Receipt_Of_Cancellation !== "00000000") {
							controller.getView().byId("id_inp_amend_c_receipt_of_cancellation").setValue(header.Receipt_Of_Cancellation);
						}
						var startDate = header.Contract_Start_Date;
						var endDate = header.Contract_End_Date;

						if (startDate !== "" && startDate !== "00000000") {
							controller.getView().byId("id_inp_amend_c_coverage_period").setValue(startDate + " - " + endDate);
						}
						controller.CONTRACT_START_DATE = startDate;
						controller.CONTRACT_END_DATE = endDate;
						controller.getView().byId("id_inp_amend_c_coverage_period").setEditable(header.Coverage_Editable);
						controller.getView().byId("id_inp_amend_c_coverage_period").setEnabled(header.Coverage_Editable);
						if (header.Billing_Status === "B" || header.Billing_Status === "C") {
							controller.contract_invoiced = true;
						}
						var smartFilterBar = controller.getView().byId("id_fb_amend_contracts_header");
						var FilterData = smartFilterBar.getFilterData();
						FilterData.Cancellation_Code = header.Cancellation_Code;
						FilterData.Rejection_Code = header.Rejection_Code;
						FilterData.Group_Contract = header.Group_Contract;
						FilterData.Web_Enabled = header.Web_Enabled;
						FilterData.AltTaxClassification = header.AltTaxClassification;
						FilterData.Billing_Cycle = header.Billing_Cycle;
						FilterData.Reason_For_Date_Change = header.Reason_For_Date_Change;
						smartFilterBar.setFilterData(FilterData);

						//Defect 71173: spatsariya- 31/07/2019
						controller.getView().getModel("visibilityModel").setProperty("/Coverage_Editable", data.results[0].Coverage_Editable);
						controller.getView().getModel("visibilityModel").setProperty("/Reason_For_Date_Change_Visible", data.results[0].Reason_For_Date_Change_Visible);

						//1251 Data Prep
						var obj = {};
						obj.header = {
							Cancellation_Code: header.Cancellation_Code,
							Cancellation_Date: header.Cancellation_Date,
							Receipt_Of_Cancellation: header.Receipt_Of_Cancellation
						};

						obj.to_serial_numbers = [];
						obj.to_reject_items = [];
						obj.to_settlement_header = [];

						var reject_items = header.to_reject_items.results;
						for (var i = 0; i < reject_items.length; i++) {
							var item = {};
							item.Item = reject_items[i].Item;
							item.Rejection_Code = reject_items[i].Rejection_Code;
							obj.to_reject_items.push(item);
						}

						var serial_numbers = header.to_reject_items.results;
						for (var k = 0; i < serial_numbers.length; k++) {
							var eqp = {};
							eqp.Equipment = serial_numbers[i].Equipment;
							eqp.Exclusion_Date = serial_numbers[i].Exclusion_Date;
							obj.to_serial_numbers.push(eqp);
						}
						controller.old_values = obj;

						controller.getView().getModel("viewData").setProperty("/Reject_Items", header.to_reject_items.results);
						controller.getView().getModel("viewData").setProperty("/Billing_Header", header.to_settlement_header.results);
						controller.getView().getModel("viewData").setProperty("/Billing_Items", header.to_settlement_item.results);
						controller.getView().getModel("viewData").setProperty("/Serial_Numbers", header.to_serial_numbers.results);

						if (header.to_settlement_header.results.length <= 8) {
							controller.getView().byId("id_zcontract_db_tbl_amend_billing_header").setVisibleRowCount(header.to_settlement_header.results.length);
						}
						if (header.to_settlement_item.results.length <= 8) {
							controller.getView().byId("id_zcontract_db_tbl_amend_billing_items").setVisibleRowCount(header.to_settlement_item.results.length);
						}

						if (header.to_reject_items.results.length <= 8) {
							controller.getView().byId("id_zcontract_db_tbl_amend_reject_items").setVisibleRowCount(header.to_reject_items.results.length);
						}

						if (header.to_serial_numbers.results.length <= 8) {
							controller.getView().byId("id_zcontract_db_tbl_amend_serial_numbers").setVisibleRowCount(header.to_serial_numbers.results.length);
						}

						var obj1 = {
							START_DATE: "",
							END_DATE: "",
							AMOUNT: "0.00",
							minus_visible: false
						};
						var ssn = [];
						ssn.push(obj1);
						controller.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisibleRowCount(ssn.length);
						controller.getView().getModel("viewData").setProperty("/Add_SSN", ssn);
						controller.getView().getModel("viewData").setProperty("/TOTAL_SSN", "0.00");
						controller.getView().getModel("viewData").setProperty("/eqalBillingItem", undefined);
						controller.getView().getModel("viewData").setProperty("/custBillingItem", undefined);
						controller.onPressDefaultView();
						controller.getView().getModel("viewData").setProperty("/Warning_Add_SSN", data.results[1].Warning_Add_SSN);
						controller.getView().getModel("viewData").setProperty("/Billing_Status", data.results[1].Billing_Status);
					},
					error: function (error) {
						if (hidebusyIndicator !== true) {
							oGlobalBusyDialog.close();
						}
						sap.m.MessageBox.show(
							error.statusText, {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Service Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
					}
				});
		},
		onPressResizeHorizontal_Rej_Items: function (evt) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_reject_items");
			var cols = oTable.getColumns();
			for (var i = 0; i < cols.length; i++) {
				if (cols[i] !== undefined) {
					cols[i].setAutoResizable(true);
					oTable.autoResizeColumn(i);
				}
			}
		},
		onPressResizeHorizontal_Equip: function (evt) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_serial_numbers");
			var cols = oTable.getColumns();
			for (var i = 0; i < cols.length; i++) {
				if (cols[i] !== undefined) {
					cols[i].setAutoResizable(true);
					oTable.autoResizeColumn(i);
				}
			}
		},
		/*****BoC Defect 84492 spatsariya - 27/09/2019******/
		onPressApplyToAll_Exclusion_Date: function (evt) {
			var date = this.getView().byId("id_amend_excl_date").getValue();
			var items = this.getView().getModel("viewData").getProperty("/Serial_Numbers");
			for (var i = 0; i < items.length; i++) {
				items[i].Exclusion_Date = date;
			}
			this.getView().getModel("viewData").setProperty("/Serial_Numbers", items);
		},
		/*****EoC Defect 84492 spatsariya - 27/09/2019******/
		// BOC by Aniket For LR1
		onPressApplyToAll_Valid_From: function (evt) {
			var date = this.getView().byId("id_amend_valid_from").getValue();
			var items = this.getView().getModel("viewData").getProperty("/Serial_Numbers");
			for (var i = 0; i < items.length; i++) {
				items[i].Valid_From = date;
			}
			this.getView().getModel("viewData").setProperty("/Serial_Numbers", items);
		},
		onPressApplyToSelected_Valid_From: function (evt) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_serial_numbers");
			var items = oTable.getSelectedItems();
			var date = this.getView().byId("id_amend_valid_from").getValue();
			var sPath;
			var that = this;
			items.forEach(function (val) {
				sPath = val.getBindingContextPath();
				sPath = sPath + "/Valid_From";
				that.getView().getModel("viewData").setProperty(sPath, date);
			});
		},
		onPressApplyToAll_Target_LLFL: function (evt) {
			var llfl = this.getView().byId("id_amend_target_llfl").getValue();
			var items = this.getView().getModel("viewData").getProperty("/Serial_Numbers");
			for (var i = 0; i < items.length; i++) {
				items[i].Target_Llfl = llfl;
			}
			this.getView().getModel("viewData").setProperty("/Serial_Numbers", items);
		},
		onPressApplyToSelected_Target_LLFL: function (evt) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_serial_numbers");
			var items = oTable.getSelectedItems();
			var llfl = this.getView().byId("id_amend_target_llfl").getValue();
			var sPath;
			var that = this;
			items.forEach(function (val) {
				sPath = val.getBindingContextPath();
				sPath = sPath + "/Target_Llfl";
				that.getView().getModel("viewData").setProperty(sPath, llfl);
			});
		},
		handlePressApplyDialog_Rej_Items: function (evt) {
			this._AV_AC_Items.open();
		},
		handlePressApplyDialog_Rej_Equip: function (evt) {
			this._AV_AC_SN.open();
		},
		AV_onClose_I: function (evt) {
			this._AV_AC_Items.close();
		},
		AV_onClose_SN: function (evt) {
			this._AV_AC_SN.close();
		},
		handleChangeBillingDate_H: function (evt) {
			/*var path = evt.getSource().getParent().getBindingContext("viewData").getPath().split("/")[2];;
			
			var data = this.getView().getModel("viewData").getProperty("/Billing_Header");
			
			var fromDate = data[path].Settlement;
			var toDate = data[path].To;
			var new_inv_date = evt.getSource().getValue();
			if(new_inv_date >= fromDate && new_inv_date <= toDate){
				data[path].NewBillingDate = new_inv_date;                 
			}else{
				data[path].NewBillingDate = data[path].BillingDate;
				MessageToast.show("Billing Date should be within settlement period..!!");
			}*/
		},
		handleChangeBillingDate_I: function (evt) {
			// No validation required as per defect 108329
			/*var path = evt.getSource().getParent().getBindingContext("viewData").getPath().split("/")[2];;
			
			var data = this.getView().getModel("viewData").getProperty("/Billing_Items");
			
			var fromDate = data[path].Settlement;
			var toDate = data[path].To;
			var new_inv_date = evt.getSource().getValue();
			if(new_inv_date >= fromDate && new_inv_date <= toDate){
				data[path].NewBillingDate = new_inv_date;                 
			}else{
				data[path].NewBillingDate = data[path].BillingDate;
				MessageToast.show("Billing Date should be within settlement period..!!");
			}*/
		},
		// EOC by Aniket For LR1
		onValueHelpReplaceEqp: function (evt) {
			this.equipmentInput = evt.getSource();

			var path = evt.getSource().getParent().getBindingContext("viewData").getPath().split("/")[2];

			var data = this.getView().getModel("viewData").getProperty("/Serial_Numbers");

			var eqp = data[path].Equipment;
			var f = [];

			f.push(new Filter({
				path: "EQUNR",
				operator: FilterOperator.EQ,
				value1: eqp
			}));
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_VH_EquipmentSwap";
			var controller = this;
			var oModel2 = this.getOwnerComponent().getModel();
			oModel2.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					filters: f,
					success: function (data, response) {
						oGlobalBusyDialog.close();
						if (data.results.length > 0) {
							//controller.getView().getModel("viewData").setProperty("/RejectionCodesList", data.results);
							controller.swapEqp = data.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.swapEqp);
							controller.getView().getModel("viewData").setProperty("/swapEqp", controller.swapEqp);
							if (controller._oValueHelpDialog === undefined) {
								controller._oValueHelpDialog = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ValueHelpDialog_EQPSWAP",
									controller);
								controller.getView().addDependent(controller._oValueHelpDialog);
							}

							controller._oValueHelpDialog.setModel(oModel1);
							oModel1.refresh(true);
							controller._oValueHelpDialog.open();

						} else {
							MessageToast.show("Replacement Equipments not Available..!!");
						}
					},
					error: function (error) {
						oGlobalBusyDialog.close();
						MessageToast.show("Error..!!");
					}
				});
		},
		onPressCloseEqpSwap: function (event) {
			this._oValueHelpDialog.close();
		},
		handleValueHelpConfirm: function (oEvent) {
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var eqp = aContexts.map(function (oContext) {
					return oContext.getObject().EQUNR;
				}).join(", ");
			}
			this.equipmentInput.setValue(eqp);

			//this._oValueHelpDialog.close();
		},
		_handleRouteMatched: function (event) {

			var oparameters = event.getParameter("name");
			if (oparameters !== "AmendContract") {
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
				var ocontract = event.getParameter("arguments").Contract;
				this.contract = ocontract;
				this.getView().byId("id_amend_page").setTitle("Amend Contract# " + ocontract);

				this.getContractDetails();
				var path = "/Ets_VH_RejectionCodeItem";
				var controller = this;
				var oModel2 = this.getOwnerComponent().getModel();
				oModel2.read(
					path, {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/RejectionCodesList", data.results);
							}
						},
						error: function (error) {

						}
					});

				var oModel3 = this.getOwnerComponent().getModel();
				oModel3.read(
					"/Ets_VH_SMC", {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/SMCList", data.results);
							}
						},
						error: function (error) {

						}
					});

				var oModel4 = this.getOwnerComponent().getModel();
				oModel4.read(
					"/Ets_VH_ReasonForCancellation", {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/CancellationCodeList", data.results);
							}
						},
						error: function (error) {

						}
					});

				var oModel5 = this.getOwnerComponent().getModel();
				oModel5.read(
					"/Ets_VH_ReasonForDateChange", {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/Reason_For_Date_ChangeList", data.results);
							}
						},
						error: function (error) {

						}
					});
			}
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);

			//Defect 71173: spatsariya- 31/07/2019
			this.oVisibilityModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oVisibilityModel, "visibilityModel");
			// this.getView().getModel("visibilityModel").setProperty("/Coverage_Editable", true);
			// SRE2483 BOC ++VS
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleEqBilling", false);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleUserDefBilling", false);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleDefBilling", true);
			// EOC SRE2483

			this.oViewModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oViewModel, "viewData");

			this._AV_AC_Items = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_AC_Items",
				this
			);
			this.getView().addDependent(this._AV_AC_Items);
			this._AV_AC_Items.setModel(this.oVisibilityModel, "visibilityModel");

			this._AV_AC_SN = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_AC_SerialNumbers",
				this
			);
			this.getView().addDependent(this._AV_AC_SN);

			this._dialog_Response_For_1251 = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Response_For_1251",
				this
			);
			this.getView().addDependent(this._dialog_Response_For_1251);

			this._updateLog = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.UpdateLog_AC",
				this
			);
			this.getView().addDependent(this._updateLog);

			this.FilterBarids = [
				"id_fb_amend_contracts_header"
			];
			var _vController = this;
			var id = _vController.FilterBarids;
			for (var i = 0; i < id.length; i++) {
				var fb = _vController.getView().byId(id[i]);
				fb.setUseToolbar(false);
				fb._oFiltersButton.setVisible(false);
			}
		},
		AV_onApplyToSelected_SN: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_serial_numbers");

			var data = this.getView().getModel("viewData").getProperty("/Serial_Numbers");
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_ac_eq_apply");
			var llfl = smartFilterBar.getFilterData()["LLFL"];
			var excl_date = sap.ui.getCore().byId("id_fb_gu_ac_eq_apply_ExclusionDate").getValue();

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[2];
				if (llfl !== undefined) {
					data[path].Target_Llfl = llfl;
				}

				if (excl_date !== "") {
					data[path].Exclusion_Date = excl_date;
				}
			}
			this.getView().getModel("viewData").setProperty("/Serial_Numbers", data);

			this._AV_AC_SN.close();
		},
		AV_onApplyToAll_SN: function (event) {
			var data = this.getView().getModel("viewData").getProperty("/Serial_Numbers");

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_ac_eq_apply");
			var llfl = smartFilterBar.getFilterData()["LLFL"];
			var excl_date = sap.ui.getCore().byId("id_fb_gu_ac_eq_apply_ExclusionDate").getValue();

			for (var i = 0; i < data.length; i++) {
				var path = i;
				if (llfl !== undefined) {
					data[path].Target_Llfl = llfl;
				}

				if (excl_date !== "") {
					data[path].Exclusion_Date = excl_date;
				}
			}
			this.getView().getModel("viewData").setProperty("/Serial_Numbers", data);

			this._AV_AC_SN.close();
		},
		AV_onApplyToSelected_I: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_reject_items");

			var data = this.getView().getModel("viewData").getProperty("/Reject_Items");
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_ac_items_apply");
			var canc_code = smartFilterBar.getFilterData()["Cancellation_Code"];
			var canc_date = sap.ui.getCore().byId("id_inp_amend_c_f_cancellation_date").getValue();
			var canc_recp = sap.ui.getCore().byId("id_inp_amend_c_f_receipt_of_cancellation").getValue();
			var rej_code = smartFilterBar.getFilterData()["Rejection_Code_Items"];
			var smc = smartFilterBar.getFilterData()["SMC"];
			var psp = smartFilterBar.getFilterData()["PSP_Partner"];
			var reason_for_date_change = smartFilterBar.getFilterData()["Reason_For_Date_Change"];

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[2];
				if (canc_code !== undefined) {
					data[path].Cancellation_Code = canc_code;
				}

				if (psp !== undefined && data[path].PSP_Editable === true) {
					data[path].PSP = psp;
				}

				if (canc_date !== "") {
					data[path].Cancellation_Date = canc_date;
				}

				if (canc_recp !== "") {
					data[path].Receipt_Of_Cancellation = canc_recp;
				}

				if (smc !== undefined) {
					data[path].SMC = smc;
				}

				if (rej_code !== "") {
					data[path].Rejection_Code = rej_code;
				}

				if (reason_for_date_change !== "") {
					data[path].Reason_For_Date_Change = reason_for_date_change;
				}

			}
			this.getView().getModel("viewData").setProperty("/Reject_Items", data);

			this._AV_AC_Items.close();
		},
		AV_onApplyToAll_I: function (event) {

			var data = this.getView().getModel("viewData").getProperty("/Reject_Items");

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_ac_items_apply");
			var canc_code = smartFilterBar.getFilterData()["Cancellation_Code"];
			var canc_date = sap.ui.getCore().byId("id_inp_amend_c_f_cancellation_date").getValue();
			var canc_recp = sap.ui.getCore().byId("id_inp_amend_c_f_receipt_of_cancellation").getValue();
			var rej_code = smartFilterBar.getFilterData()["Rejection_Code_Items"];
			var smc = smartFilterBar.getFilterData()["SMC"];
			var psp = smartFilterBar.getFilterData()["PSP_Partner"];
			var reason_for_date_change = smartFilterBar.getFilterData()["Reason_For_Date_Change"];

			for (var i = 0; i < data.length; i++) {
				var path = i;
				if (canc_code !== undefined) {
					data[path].Cancellation_Code = canc_code;
				}

				if (psp !== undefined && data[path].PSP_Editable === true) {
					data[path].PSP = psp;
				}

				if (canc_date !== "") {
					data[path].Cancellation_Date = canc_date;
				}

				if (canc_recp !== "") {
					data[path].Receipt_Of_Cancellation = canc_recp;
				}

				if (smc !== undefined) {
					data[path].SMC = smc;
				}

				if (rej_code !== "") {
					data[path].Rejection_Code = rej_code;
				}

				if (reason_for_date_change !== "") {
					data[path].Reason_For_Date_Change = reason_for_date_change;
				}

			}
			this.getView().getModel("viewData").setProperty("/Reject_Items", data);
			this._AV_AC_Items.close();
		},
		getRequestBody: function () {

			var requestBody = {
				Contract_Number: this.contract,
				Cancellation_Code: "",
				Cancellation_Date: this.getView().byId("id_inp_amend_c_cancellation_date").getValue() === "" ? "00000000" : this.getView().byId(
					"id_inp_amend_c_cancellation_date").getValue(),
				Receipt_Of_Cancellation: this.getView().byId("id_inp_amend_c_receipt_of_cancellation").getValue() === "" ? "00000000" : this.getView()
					.byId("id_inp_amend_c_receipt_of_cancellation").getValue(),
				Rejection_Code: "",
				Group_Contract: "",
				Contract_Start_Date: "",
				Contract_End_Date: "",
				Relevant_For_1251: this.Relevant_For_1251,
				Response_For_1251: "",
				Reason_For_Date_Change: "",

				to_reject_items: [],
				to_serial_numbers: [],
				to_settlement_header: [],
				to_messages: []
			};
			//Fetch Header Fields
			var smartFilterBar = this.getView().byId("id_fb_amend_contracts_header");
			for (var key in smartFilterBar.getFilterData()) {
				requestBody[key] = smartFilterBar.getFilterData()[key];
			}

			if (this.getView().byId("id_inp_amend_c_coverage_period").getValue() !== "") {
				requestBody.Contract_Start_Date = this.getView().byId("id_inp_amend_c_coverage_period").getValue().split(" - ")[0];
				if (requestBody.Contract_Start_Date.indexOf(".") > -1) {
					requestBody.Contract_Start_Date = requestBody.Contract_Start_Date.substring(6) + requestBody.Contract_Start_Date.substring(3, 5) +
						requestBody.Contract_Start_Date.substring(0, 2);
				}

				requestBody.Contract_End_Date = this.getView().byId("id_inp_amend_c_coverage_period").getValue().split(" - ")[1];
				if (requestBody.Contract_End_Date.indexOf(".") > -1) {
					requestBody.Contract_End_Date = requestBody.Contract_End_Date.substring(6) + requestBody.Contract_End_Date.substring(3, 5) +
						requestBody.Contract_End_Date.substring(0, 2);
				}
			}
			/*
			// //BOC By Aniket LR1
			var oTable = this.getView().byId("id_zcontract_db_tbl_amend_serial_numbers");
			var items = oTable.getSelectedItems();
			var serial_numbers = [];
			// //EOC By Aniket LR1
			//Fetch all reject Items
			requestBody.to_reject_items = this.getView().getModel("viewData").getData().Reject_Items;
			if (items.length > 0) {
				items.forEach(function (val, index) {
					serial_numbers.push(items[index].getBindingContext("viewData").getObject());
				});
				requestBody.to_serial_numbers = serial_numbers;
			} else {
				requestBody.to_serial_numbers = this.getView().getModel("viewData").getData().Serial_Numbers;
			}*/
			requestBody.to_serial_numbers = this.getView().getModel("viewData").getData().Serial_Numbers;
			for (var i = 0; i < requestBody.to_serial_numbers.length; i++) {
				delete requestBody.to_serial_numbers[i].__metadata;
			}

			requestBody.to_reject_items = this.getView().getModel("viewData").getData().Reject_Items;
			for (var j = 0; j < requestBody.to_reject_items.length; j++) {
				delete requestBody.to_reject_items[j].__metadata;
			}

			requestBody.to_settlement_header = this.getView().getModel("viewData").getData().Billing_Header;
			for (var k = 0; k < requestBody.to_settlement_header.length; k++) {
				delete requestBody.to_settlement_header[k].__metadata;
			}

			requestBody.to_settlement_item = this.getView().getModel("viewData").getData().Billing_Items;
			for (var l = 0; l < requestBody.to_settlement_item.length; l++) {
				delete requestBody.to_settlement_item[l].__metadata;
			}
			this.requestBody = requestBody;
		},
		updateContract_Service_Call: function () {

			var controller = this;
			var oModel = this.getOwnerComponent().getModel();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Amend_Contract";
			oModel.create(path,
				controller.requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						controller.updateLogData = data.to_messages.results;
						var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
						controller._updateLog.setModel(oModel1);

						if (data.to_messages.results.length < 7) {
							sap.ui.getCore().byId("id_ac_cmd_updateLog").setVisibleRowCount(data.to_messages.results.length);
						} else {
							sap.ui.getCore().byId("id_ac_cmd_updateLog").setVisibleRowCount(7);
						}
						controller.getContractDetails();
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
		},
		updateContract: function () {
			var controller = this;
			if (controller.requestBody.Cancellation_Code !== "" && controller.Warning_msg_on_cancellation) {
				sap.m.MessageBox.warning(
					"Contract is invoiced. You may need to create a credit note!", {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function (sAction) {
							if (sAction === "OK") {
								controller.updateContract_Service_Call();
							}

						}
					}
				);
			} else {
				controller.updateContract_Service_Call();
			}

		},
		onProceed_1251: function () {
			var index = this._dialog_Response_For_1251.getContent()[1].getAggregation("items")[0].getSelectedIndex();
			if (index === 0) {
				this.requestBody.Response_For_1251 = "TRIGGER_CREATE_CASE_ID";
			} else if (index === 1) {
				this.requestBody.Response_For_1251 = "TRIGGER_REJECT_QUOTE";
			} else if (index === 2) {
				this.requestBody.Response_For_1251 = "TRIGGER_RETAIN_QUOTE";
			}
			this.updateContract();
			this._dialog_Response_For_1251.close();
		},
		onCancel_1251: function () {
			this._dialog_Response_For_1251.close();
		},
		validateInput: function () {
			var error = false;
			//If Either of them is Blank
			if (this.requestBody.Cancellation_Date === "00000000" ||
				this.requestBody.Receipt_Of_Cancellation === "00000000" ||
				this.requestBody.Cancellation_Code === "") {
				//Then all should be blank -->Else give error
				if (this.requestBody.Cancellation_Date === "00000000" &&
					this.requestBody.Receipt_Of_Cancellation === "00000000" &&
					this.requestBody.Cancellation_Code === "") {
					error = false;
				} else {
					error = true;
					sap.m.MessageBox.show(
						"All Field(s) should have value - Cancellation Reason, Cancellation Date, Receipt Of Cancellation", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Cancellation Update Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
			}
			return error;

		},
		onPressAmendContract: function () {
			/*SOC szanzaney SRE2524*/

			/*	var smartFilterBar = controller.getView().byId("id_fb_amend_contracts_header");
				var FilterData = smartFilterBar.getFilterData();
				if (salesOder && FilterData.Web_Enabled) {
					sap.m.MessageBox.show(
						"Web Enable Flag cannot be selected in this scenario", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}*/

			/*EOC szanzaney SRE2524*/
			/*	else {*/
			this.getRequestBody();
			var error = this.validateInput();
			if (!error) {
				if (this.Relevant_For_1251 === "X") {
					//Check if changes are made to scenario's applicable for 1251
					var old_values = this.old_values;
					var new_values = this.requestBody;
					var Valid_For_1251 = false;
					//check for Cancellation at Header
					if (old_values.header.Cancellation_Date !== new_values.Cancellation_Date ||
						old_values.header.Receipt_Of_Cancellation !== new_values.Receipt_Of_Cancellation ||
						old_values.header.Cancellation_Code !== new_values.Cancellation_Code
					) {
						Valid_For_1251 = true;
					}

					//Check for Rejection at item
					if (!Valid_For_1251) { //If already valid then skip :P
						for (var i = 0; i < old_values.to_reject_items.length; i++) {
							if (old_values.to_reject_items[i].Item === new_values.to_reject_items[i].Item &&
								old_values.to_reject_items[i].Rejection_Code !== new_values.to_reject_items[i].Rejection_Code) {
								Valid_For_1251 = true;
								break;
							}
						}
					}

					//Check for Exclusion date Updates
					if (!Valid_For_1251) { //If already valid then skip :P
						for (i = 0; i < old_values.to_serial_numbers.length; i++) {
							if (old_values.to_serial_numbers[i].Equipment === new_values.to_serial_numbers[i].Equipment &&
								old_values.to_serial_numbers[i].Exclusion_Date !== new_values.to_serial_numbers[i].Exclusion_Date) {
								Valid_For_1251 = true;
								break;
							}
						}
					}

					if (Valid_For_1251) {
						this._dialog_Response_For_1251.open();
					} else {
						this.updateContract();
					}
				} else {
					this.updateContract();
				}

			}
		},
		onPressApplyToAll_SMC: function () {
			var key = this.getView().byId("id_amend_c_smc_for_all").getSelectedKey();
			//var items = this.getView().getModel("viewData").getProperty("/Reject_Items", header.to_reject_items.results);
			var items = this.getView().getModel("viewData").getProperty("/Reject_Items");
			for (var i = 0; i < items.length; i++) {
				items[i].SMC = key;
			}
			this.getView().getModel("viewData").setProperty("/Reject_Items", items);
		},
		onPressApplyToAll_Rejection_Code: function () {
			var key = this.getView().byId("id_amend_c_rej_reason_for_all").getSelectedKey();
			//var items = this.getView().getModel("viewData").getProperty("/Reject_Items", header.to_reject_items.results);
			var items = this.getView().getModel("viewData").getProperty("/Reject_Items");
			for (var i = 0; i < items.length; i++) {
				if (items[i].Rejection_Editable) {
					items[i].Rejection_Code = key;
				}
			}
			this.getView().getModel("viewData").setProperty("/Reject_Items", items);
		},
		onUpdateLogClose: function (oEvent) {
			this._updateLog.close();
		},
		onExportUpdateLog: function (oEvent) {
			var oTable = sap.ui.getCore().byId("id_ac_cmd_updateLog");

			var aCols = [{
				label: "Doc / Equip",
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

		},
		/****************
		 * SRE 2483 Code for Billing Table data dispaly ++ VS
		 ****************/
		onPressDefaultView: function () {
			// this.getView().byId("id_zcontract_db_tbl_equalBilling").setVisible(false);
			// this.getView().byId("id_zcontract_db_tbl_UserDefBilling").setVisible();
			// this.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisible(true);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleEqBilling", false);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleUserDefBilling", false);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleDefBilling", true);

		},
		onPressEqualBilling: function () {
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleEqBilling", true);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleUserDefBilling", false);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleDefBilling", false);
			var sPath = '/Ets_Add_SSN';
			var ocontract = this.contract;
			var aFilters = [];
			aFilters.push(new Filter("VBELN", "EQ", ocontract));
			aFilters.push(new Filter("BILL_FLAG", "EQ", 'B'));
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			var oModel1 = this.getOwnerComponent().getModel();
			if (this.getView().getModel("viewData").getProperty("/eqalBillingItem") === undefined) {
				oGlobalBusyDialog.open();
				oModel1.read(
					sPath, {
						filters: aFilters,
						success: function (data, response) {
							oGlobalBusyDialog.close();
							this.getView().getModel("viewData").setProperty("/eqalBillingItem", data.results);
							if (data.results.length <= 7) {
								this.getView().byId("id_zcontract_db_tbl_equalBilling").setVisibleRowCount(data.results.length);
							}
							if (data.results[0].MESSAGE !== "") {
								sap.m.MessageBox.show(
									data.results[0].MESSAGE, {
										icon: sap.m.MessageBox.Icon.INFORMATION,
										title: "Message",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (sAction) {}.bind(this)
									});
							}

							// this.getView().getModel("viewData").setProperty("/eqalBillingItem/0/VBELN",1);
							// this.getView().getModel("viewData").setProperty("/eqalBillingItem/1/VBELN",2);
							// this.getView().getModel("viewData").setProperty("/eqalBillingItem/2/VBELN",3);
							// this.getView().getModel("viewData").setProperty("/eqalBillingItem/3/VBELN",4);
						}.bind(this)
					});
			}
		},
		onPressCustomerBilling: function () {
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleEqBilling", false);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleUserDefBilling", true);
			this.getView().getModel("visibilityModel").setProperty("/IsVisibleDefBilling", false);
			var sPath = '/Ets_Add_SSN';
			var ocontract = this.contract;
			let aFilters = [];
			aFilters.push(new Filter("VBELN", "EQ", ocontract));
			aFilters.push(new Filter("BILL_FLAG", "EQ", 'C'));
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			var oModel1 = this.getOwnerComponent().getModel();
			if (this.getView().getModel("viewData").getProperty("/custBillingItem") === undefined) {
				oGlobalBusyDialog.open();
				oModel1.read(
					sPath, {
						filters: aFilters,
						success: function (data, response) {
							oGlobalBusyDialog.close();
							this.getView().getModel("viewData").setProperty("/custBillingItem", data.results);
							if (data.results.length <= 7) {
								this.getView().byId("id_zcontract_db_tbl_UserDefBilling").setVisibleRowCount(data.results.length);
							}
							var amt = 0.00;
							for (var i = 0; i < data.results.length; i++) {
								amt = +Number(data.results[i].AMOUNT_CUST).toFixed(2) + amt;
							}
							this.getView().getModel("viewData").setProperty("/TOTAL_SSN_UserDefSrv", Number(amt).toFixed(2));
						}.bind(this)
					});
			}
		},
		validateNumber: function (oEvent) {
			var enteredvalue = oEvent.getParameters().value;
			var numericvalue = Number(enteredvalue);
			if (!(!(isNaN(numericvalue)) && (numericvalue > 0))) {
				oEvent.getSource().setValue(enteredvalue.substr(0, enteredvalue.length - 1));
			}
		}

	});

});