jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/Token",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/BindingMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/AnnotationHelper",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/formatter",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageBox",
	"ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/xls"
], function (Controller, MessageToast, JSONModel, Token, Spreadsheet, Filter, FilterOperator, BindingMode, ODataModel, AnnotationHelper,
	formatter, UploadCollectionParameter, MessageBox, xlsjs) {
	"use strict";

	return Controller.extend("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.controller.GlobalUpdate", {
		formatter: formatter,
		onBeforeRendering: function () {
			this.checkUserAuth();
		},
		//BOI For Create Copy
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
			var oUploadCollection = sap.ui.getCore().byId("UploadCollection_Copy_FL");
			var cFiles = oUploadCollection.getItems().length;

			if (cFiles === 0) {
				MessageToast.show("Select Files To Proceed...!!!");
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var slug = oEvent.getParameter("fileName");
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: slug
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onUploadComplete: function (oEvent) {
			this.uploadAttachment.close();

			var path = "/Ety_Llfl_LogSet";
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var controller = this;

			var oModel = this.getOwnerComponent().getModel();
			oModel.read(
				path, {
					urlParameters: {
						"$format": "json"
					},
					success: function (data, response) {
						controller._copy_fl_log = data.results;
						if (data !== null) {
							controller.updateLogData = data.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog_FL_Copy.setModel(oModel1);

							if (data.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog_FL_Copy").setVisibleRowCount(data.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog_FL_Copy").setVisibleRowCount(7);
							}
							controller._updateLog_FL_Copy.open();
						} else {
							sap.m.MessageBox.show(
								"No Updates performed...!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
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
		onPressCopy_Cancel: function (evt) {
			this.uploadAttachment.close();
		},
		onPressCreateCopy: function (oEvent) {
			if (!this.uploadAttachment) {
				this.uploadAttachment = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Copy_FL",
					this
				);

				this.getView().addDependent(this.uploadAttachment);
			}

			this.uploadAttachment.open();
			jQuery.sap.delayedCall(500, this, function () {
				sap.ui.getCore().byId("UploadCollection_Copy_FL").focus();
			});
		},
		onPressCopyClose: function (oEvent) {
			this._attachments.close();
		},
		//EOI For Create Copy
		checkUserAuth: function () {
			var oServiceModel = this.getOwnerComponent().getModel();
			var sPath = "/Ets_User_Auth('Default')";

			var mParameters = {
				method: "GET",
				//filters: f,
				async: false, //AND
				success: jQuery.proxy(function (oData) {
					this._DOC_LIMIT = oData.DOC_LIMIT;
					this._EMAIL = oData.EMAIL_REGISTERED;
					this.AUTH_BACKGROUND_JOB = oData.AUTH_BACKGROUND_JOB;
					if (oData.EXTENDED_MAINTENANCE === "") {
						sap.m.MessageBox.show(
							"You are not Authorized to use this transaction..!!", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Service Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
					} else {
						this.getView().byId("id_GU_IconTabBar").setVisible(true);
						this.getView().byId("id_zcontract_db_update").setVisible(true);

						this.getView().byId("id_gu_tb1").setEnabled(false);
						this.getView().byId("id_gu_tb2").setEnabled(false);
						this.getView().byId("id_zcontract_db_update").setEnabled(false);

						if (oData.EXTENDED_CONTRACTS === "X") {
							this.getView().byId("id_gu_tb1").setEnabled(true);
							this.getView().byId("id_zcontract_db_update").setEnabled(true);
						}

						if (oData.EXTENDED_QUOTES === "X") {
							this.getView().byId("id_gu_tb2").setEnabled(true);
							this.getView().byId("id_zcontract_db_update").setEnabled(true);
						}

						if (oData.EXTENDED_QUOTES === "X" && oData.EXTENDED_CONTRACTS === "") {
							this.getView().byId("id_GU_IconTabBar").setSelectedKey("Tab_Quotes");
						}
					}
					//BOI AKADAM16SEP2019+
					this.requestBody_CMR_DMR_initial = {
						Document: "9999999",
						Rejection_Code: "",
						Billing_Block: "",
						Remove_Billing_Block: "",
						Batch_Mode: this._Batch_Mode,
						Email: this._EMAIL,
						to_documents: [],
						to_messages: []
					};

					this.requestBody_ZONC_initial = {
						Document: "9999999",
						PO: "",
						Rejection_Code: "",
						SMC: "",
						Rejection_Code_Items: "",
						Billing_Block: "",
						Delivery_Block: "",
						Remove_Billing_Block: "",
						Remove_Delivery_Block: "",
						Purchase_Agrmnt_ID: "",
						PO_End_Date: "",
						Reseller_PO: "",
						Cust_Grp2: "",
						Cust_Grp3: "",
						Cust_Grp4: "",
						Bill_To: "",
						Payer: "",
						T2_Reseller: "",
						End_Customer: "",
						Entitled_Party: "",
						Asset_Location: "",
						Systems_Manager_Contact: "",
						Systems_Manager_Backup_Contact: "",
						Invoicing_Contact: "",
						Sold_To_Contact: "",
						Reseller_Contact: "",
						Entitled_Party_Contact: "",
						Bill_To_Contact: "",
						Contract_Admin_Contact: "",
						Global_Operations: "",
						HPE_Sales_Rep_Contact: "",
						Batch_Mode: this._Batch_Mode,
						Email: this._EMAIL,
						to_documents: [],
						to_messages: [],
						to_items: [] //LR1 changes by Aniket ,
					};

					this.requestBody_C_initial = {
						Contract_Number: "9999999",
						PO: "",
						Cancellation_Code: "",
						Cancellation_Date: "",
						Receipt_Of_Cancellation: "",
						Rejection_Code: "",
						Action_Code: "",
						Action_Date: "",
						SMC: "",
						Group_Contract: "",
						PO_Acceptance_Date: "",
						Payment_Terms: "",
						Billing_Block: "",
						Delivery_Block: "",
						Remove_Billing_Block: "",
						Remove_Delivery_Block: "",
						Clear_Action_Data: false,
						Billing_Cycle: "",
						Billing_Plan_Type: "",
						Contract_Status: "",
						Usage_Indicator: "",
						Renewal_Status: "",
						Header_Text: "",
						Bill_To: "",
						Payer: "",
						T2_Reseller: "",
						End_Customer: "",
						Entitled_Party: "",
						Asset_Location: "",
						PSP_Partner: "",
						Systems_Manager_Contact: "",
						Systems_Manager_Backup_Contact: "",
						Software_Delivery_Contact: "",
						Invoicing_Contact: "",
						Sold_To_Contact: "",
						Reseller_Contact: "",
						Entitled_Party_Contact: "",
						Delivery_Contact: "",
						Backup_Delivery_Contact: "",
						Batch_Mode: false,
						Email: this._EMAIL,
						Web_Enabled: "",

						to_contracts: [],
						to_messages: [],
						to_assetLocationChange: []
					};

					this.requestBody_Q_initial = {
						Quote: "9999999",
						PO: "",
						Fully_Reject_Quote: "",
						Group_Contract: "",
						Payment_Terms: "",
						Opportunity_ID: "",
						SMC: "",
						Header_Text: "",
						PO_Acceptance_Date: "",
						Billing_Cycle: "",
						Billing_Plan_Type: "",
						Bill_To: "",
						Payer: "",
						T2_Reseller: "",
						End_Customer: "",
						Entitled_Party: "",
						Asset_Location: "",
						PSP_Partner: "",
						Systems_Manager_Contact: "",
						Systems_Manager_Backup_Contact: "",
						Software_Delivery_Contact: "",
						Invoicing_Contact: "",
						Sold_To_Contact: "",
						Reseller_Contact: "",
						Entitled_Party_Contact: "",
						Delivery_Contact: "",
						Backup_Delivery_Contact: "",
						Batch_Mode: false,
						Email: this._EMAIL,
						Web_Enabled: "",
						MCID: "",
						InAdvanceFlag: "",

						to_quotes: [],
						to_messages: [],
						to_assetLocationChange: []
					};
					//EOI AKADAM16SEP2019+
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
		onPressApplyToAll_Rejection_Code: function () {
			var key = this.getView().byId("id_gu_c_rej_reason_for_all").getSelectedKey();
			//var items = this.getView().getModel("viewData").getProperty("/Reject_Items", header.to_reject_items.results);
			var items = this.getView().getModel("viewData").getProperty("/ContractPSP");
			for (var i = 0; i < items.length; i++) {
				if (items[i].Rejection_Editable) {
					items[i].Rejection_Code = key;
				}
			}
			this.getView().getModel("viewData").setProperty("/ContractPSP", items);
		},
		handlePressApplyDialog: function (event) {
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			if (key === "Tab_Equipments") {
				this._AV_EQ.open();
			} else if (key === "Tab_FL") {
				this._AV_FL.open();
			} else if (key === "Tab_Quotes") {
				this._AV_Q.open();
			} else if (key === "Tab_Contracts") {
				this._AV_C.open();
			} else if (key === "Tab_ZONC") {
				this._AV_ZONC.open();
			} else if (key === "Tab_CMR_DMR") {
				this._AV_CMR_DMR.open();
			}

		},
		handleChangeExclusionDate: function (evt) {
			var today = new Date();

			var dd = today.getDate();
			var mm = today.getMonth() + 1;

			var yyyy = today.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			var path = evt.getSource().getParent().getRowBindingContext().sPath.split("/")[1];

			var data = this.getView().byId("id_gu_equip_table").getModel().getData();
			var exclDate = data[path].NewExclusionDate;
			var todaysDate = yyyy + mm + dd;
			if (exclDate >= todaysDate) {
				data[path].NewExclusionDate = exclDate;
			} else {
				data[path].NewExclusionDate = data[path].ExclusionDate;
				MessageToast.show("Exclusion Date should be greater than/equal to today's date..!!");
			}
		},
		AV_onClose_ZONC: function (event) {
			this._AV_ZONC.close();
		},
		AV_onClose_CMR_DMR: function (event) {
			this._AV_CMR_DMR.close();
		},
		AV_onClose_Q: function (event) {
			this._AV_Q.close();
		},
		AV_onClose_C: function (event) {
			this._AV_C.close();
		},
		AV_onClose_EQ: function (event) {
			this._AV_EQ.close();
		},
		AV_onClose_FL: function (event) {
			this._AV_FL.close();
		},
		AV_onApplyToSelected_FL: function (event) {
			var oTable = this.getView().byId("id_gu_fl_table");
			var data = this.getView().byId("id_gu_fl_table").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_fl_apply");
			var endCustomer = smartFilterBar.getFilterData()["EndCustomer"];
			var reseller = smartFilterBar.getFilterData()["T2Reseller"];
			var superiorFL = smartFilterBar.getFilterData()["SuperiorFLOC"];

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[1];
				if (endCustomer !== undefined) {
					data[path].NewEndCustomer = endCustomer;
				}

				if (reseller !== undefined) {
					data[path].NewT2Reseller = reseller;
				}

				if (superiorFL !== undefined) {
					data[path].NewSuperiorFLOC = superiorFL;
				}

			}
			this.getView().byId("id_gu_fl_table").getModel().setData(data);
			this.getView().byId("id_gu_fl_table").getModel().refresh(true);

			this._AV_FL.close();
		},
		AV_onApplyToAll_FL: function (event) {
			var data = this.getView().byId("id_gu_fl_table").getModel().getData();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_fl_apply");
			var endCustomer = smartFilterBar.getFilterData()["EndCustomer"];
			var reseller = smartFilterBar.getFilterData()["T2Reseller"];
			var superiorFL = smartFilterBar.getFilterData()["SuperiorFLOC"];

			for (var i = 0; i < data.length; i++) {
				var path = i;
				if (endCustomer !== undefined) {
					data[path].NewEndCustomer = endCustomer;
				}

				if (reseller !== undefined) {
					data[path].NewT2Reseller = reseller;
				}

				if (superiorFL !== undefined) {
					data[path].NewSuperiorFLOC = superiorFL;
				}

			}
			this.getView().byId("id_gu_fl_table").getModel().setData(data);
			this.getView().byId("id_gu_fl_table").getModel().refresh(true);

			this._AV_FL.close();
		},
		AV_onApplyToSelected_Q: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_q_tbl_upf");
			var data = this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_q_apply");
			var assetLocation = smartFilterBar.getFilterData()["Asset_Location"];
			var sub_psp = smartFilterBar.getFilterData()["Subcontractor_PSP"];
			var smc = smartFilterBar.getFilterData()["SMC"]; //SRE2523 VSINGH

			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			//getting values for fields and respective clear fields
			var end_cust = smartFilterBar.getFilterData()["End_Customer"];
			var clear_end_cust = sap.ui.getCore().byId("id_fb_gu_q_Clr_End_Customer").getSelected();
			var soft_del_cont = smartFilterBar.getFilterData()["Software_Delivery_Contact"];
			var clear_soft_del_cont = sap.ui.getCore().byId("id_fb_gu_q_Clr_Software_Delivery_Contact").getSelected();
			var hard_del_cont = smartFilterBar.getFilterData()["Delivery_Contact"];
			var clear_hard_del_cont = sap.ui.getCore().byId("id_fb_gu_q_Clr_Delivery_Contact").getSelected();

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[1];
				if (sub_psp !== undefined && data[path].New_Sub_psp_Edit === true) {
					data[path].New_Sub_psp = sub_psp;
				}

				if (assetLocation !== undefined) {
					data[path].New_Asset_Loc = assetLocation;
				}

				//---SRE2523 VSINGH BOC

				if (smc !== undefined) {
					data[path].New_smc = smc;
				}

				//---SRE2523 VSINGH END

				//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				//equating data to new values entered by user
				if (end_cust !== undefined && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = end_cust;
				}
				if (soft_del_cont !== undefined && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = soft_del_cont;
				}
				if (hard_del_cont !== undefined && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = hard_del_cont;
				}
				if (clear_end_cust === true && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = "";
				}
				if (clear_soft_del_cont === true && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = "";
				}
				if (clear_hard_del_cont === true && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = "";
				}

				//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
			}
			this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().setData(data);
			this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().refresh(true);

			this._AV_Q.close();
		},
		AV_onApplyToAll_Q: function (event) {
			var data = this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().getData();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_q_apply");
			var assetLocation = smartFilterBar.getFilterData()["Asset_Location"];
			var sub_psp = smartFilterBar.getFilterData()["Subcontractor_PSP"];
			var smc = smartFilterBar.getFilterData()["SMC"]; //SRE2523 VSINGH

			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			//getting values for fields and respective clear fields
			var end_cust = smartFilterBar.getFilterData()["End_Customer"];
			var clear_end_cust = sap.ui.getCore().byId("id_fb_gu_q_Clr_End_Customer").getSelected();
			var soft_del_cont = smartFilterBar.getFilterData()["Software_Delivery_Contact"];
			var clear_soft_del_cont = sap.ui.getCore().byId("id_fb_gu_q_Clr_Software_Delivery_Contact").getSelected();
			var hard_del_cont = smartFilterBar.getFilterData()["Delivery_Contact"];
			var clear_hard_del_cont = sap.ui.getCore().byId("id_fb_gu_q_Clr_Delivery_Contact").getSelected();

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
			for (var i = 0; i < data.length; i++) {
				var path = i;
				if (sub_psp !== undefined && data[path].New_Sub_psp_Edit === true) {
					data[path].New_Sub_psp = sub_psp;
				}
				if (assetLocation !== undefined) {
					data[path].New_Asset_Loc = assetLocation;
				}
				//---SRE2523 SVERMA15

				if (smc !== undefined) {
					data[path].New_smc = smc;

				}
				//---SRE2523 SVERMA15

				//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				//equating data to new values entered by user
				if (end_cust !== undefined && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = end_cust;
				}
				if (soft_del_cont !== undefined && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = soft_del_cont;
				}
				if (hard_del_cont !== undefined && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = hard_del_cont;
				}
				if (clear_end_cust === true && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = "";
				}
				if (clear_soft_del_cont === true && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = "";
				}
				if (clear_hard_del_cont === true && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = "";
				}

				//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			}
			this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().setData(data);
			this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().refresh(true);

			this._AV_Q.close();
		},
		AV_onApplyToSelected_ZONC: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_zonc_tbl_upf");
			var data = this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_zonc_apply");
			var assetLocation = smartFilterBar.getFilterData()["Asset_Location"];

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[1];

				if (assetLocation !== undefined) {
					data[path].New_Asset_Loc = assetLocation;
				}

			}
			this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().setData(data);
			this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().refresh(true);

			this._AV_ZONC.close();
		},
		AV_onApplyToAll_ZONC: function (event) {
			var data = this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().getData();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_zonc_apply");
			var assetLocation = smartFilterBar.getFilterData()["Asset_Location"];

			for (var i = 0; i < data.length; i++) {
				var path = i;

				if (assetLocation !== undefined) {
					data[path].New_Asset_Loc = assetLocation;
				}

			}
			this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().setData(data);
			this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().refresh(true);

			this._AV_ZONC.close();
		},
		AV_onApplyToSelected_CMR_DMR: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_cmr_dmr");
			var data = this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_cmr_dmr_apply");
			var rej_code = smartFilterBar.getFilterData()["Rejection_Code"];

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[1];

				if (rej_code !== undefined && data[path].Rejection_Editable === true) {
					data[path].Rejection_Code = rej_code;
				}

			}
			this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().setData(data);
			this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().refresh(true);

			this._AV_CMR_DMR.close();
		},
		AV_onApplyToAll_CMR_DMR: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_cmr_dmr");
			var data = this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_cmr_dmr_apply");
			var rej_code = smartFilterBar.getFilterData()["Rejection_Code"];

			for (var i = 0; i < data.length; i++) {
				var path = i;

				if (rej_code !== undefined && data[path].Rejection_Editable === true) {
					data[path].Rejection_Code = rej_code;
				}
			}
			this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().setData(data);
			this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().refresh(true);

			this._AV_CMR_DMR.close();
		},
		AV_onApplyToSelected_C: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_upf");
			var data = this.getView().byId("id_zcontract_db_tbl_upf").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_c_apply");
			var clear_th_party = sap.ui.getCore().byId("id_fb_gu_c_Clr_third_party").getSelected();
			var clear_psp = sap.ui.getCore().byId("id_fb_gu_c_Clr_PSP").getSelected();
			var clear_sub_psp = sap.ui.getCore().byId("id_fb_gu_c_Clr_Subcontractor_PSP").getSelected();
			var assetLocation = smartFilterBar.getFilterData()["Asset_Location"];
			var psp = smartFilterBar.getFilterData()["PSP"];
			var sub_psp = smartFilterBar.getFilterData()["Subcontractor_PSP"];
			var rej_code = smartFilterBar.getFilterData()["Rejection_Code"];
			var th_party = smartFilterBar.getFilterData()["Third_Party_Info"];
			var smc = smartFilterBar.getFilterData()["SMC"]; //SRE2523 VSINGH

			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			//getting values for fields and respective clear fields
			var end_cust = smartFilterBar.getFilterData()["End_Customer"];
			var clear_end_cust = sap.ui.getCore().byId("id_fb_gu_c_Clr_End_Customer").getSelected();
			var soft_del_cont = smartFilterBar.getFilterData()["Software_Delivery_Contact"];
			var clear_soft_del_cont = sap.ui.getCore().byId("id_fb_gu_c_Clr_Software_Delivery_Contact").getSelected();
			var hard_del_cont = smartFilterBar.getFilterData()["Delivery_Contact"];
			var clear_hard_del_cont = sap.ui.getCore().byId("id_fb_gu_c_Clr_Delivery_Contact").getSelected();

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[1];
				if (psp !== undefined && data[path].Psp_Edit === true) {
					data[path].New_Psp = psp;
				}
				if (sub_psp !== undefined && data[path].New_Sub_psp_Edit === true) {
					data[path].New_Sub_psp = sub_psp;
				}

				if (clear_th_party === true && data[path].Third_Party_Edit === true) {
					data[path].New_Thrd_Party = "";
				}
				if (clear_psp === true && data[path].Psp_Edit === true) {
					data[path].New_Psp = "";
				}
				if (clear_sub_psp === true && data[path].New_Sub_psp_Edit === true) {
					data[path].New_Sub_psp = "";
				}
				if (th_party !== undefined && data[path].Third_Party_Edit === true) {
					data[path].New_Thrd_Party = th_party;
				}
				if (rej_code !== undefined && data[path].Rejection_Editable === true) {
					data[path].Rejection_Code = rej_code;
				}

				if (assetLocation !== undefined && data[path].AL_Edit === true) {
					data[path].New_Asset_Loc = assetLocation;
				}

				if (smc !== undefined) {
					data[path].New_smc = smc;
				}

				//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				//equating data to new values entered by user
				if (end_cust !== undefined && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = end_cust;
				}
				if (soft_del_cont !== undefined && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = soft_del_cont;
				}
				if (hard_del_cont !== undefined && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = hard_del_cont;
				}
				if (clear_end_cust === true && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = "";
				}
				if (clear_soft_del_cont === true && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = "";
				}
				if (clear_hard_del_cont === true && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = "";
				}

				//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			}
			this.getView().byId("id_zcontract_db_tbl_upf").getModel().setData(data);
			this.getView().byId("id_zcontract_db_tbl_upf").getModel().refresh(true);

			this._AV_C.close();
		},
		AV_onApplyToAll_C: function (event) {
			var oTable = this.getView().byId("id_zcontract_db_tbl_upf");
			var data = this.getView().byId("id_zcontract_db_tbl_upf").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_c_apply");
			var clear_th_party = sap.ui.getCore().byId("id_fb_gu_c_Clr_third_party").getSelected();
			var clear_psp = sap.ui.getCore().byId("id_fb_gu_c_Clr_PSP").getSelected();
			var clear_sub_psp = sap.ui.getCore().byId("id_fb_gu_c_Clr_Subcontractor_PSP").getSelected();
			var assetLocation = smartFilterBar.getFilterData()["Asset_Location"];
			var psp = smartFilterBar.getFilterData()["PSP"];
			var sub_psp = smartFilterBar.getFilterData()["Subcontractor_PSP"];
			var rej_code = smartFilterBar.getFilterData()["Rejection_Code"];
			var th_party = smartFilterBar.getFilterData()["Third_Party_Info"];
			var smc = smartFilterBar.getFilterData()["SMC"]; //SRE2523 VSINGH

			//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			//getting values for fields and respective clear fields
			var end_cust = smartFilterBar.getFilterData()["End_Customer"];
			var clear_end_cust = sap.ui.getCore().byId("id_fb_gu_c_Clr_End_Customer").getSelected();
			var soft_del_cont = smartFilterBar.getFilterData()["Software_Delivery_Contact"];
			var clear_soft_del_cont = sap.ui.getCore().byId("id_fb_gu_c_Clr_Software_Delivery_Contact").getSelected();
			var hard_del_cont = smartFilterBar.getFilterData()["Delivery_Contact"];
			var clear_hard_del_cont = sap.ui.getCore().byId("id_fb_gu_c_Clr_Delivery_Contact").getSelected();

			//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			for (var i = 0; i < data.length; i++) {
				var path = i;
				if (psp !== undefined && data[path].Psp_Edit === true) {
					data[path].New_Psp = psp;
				}
				if (sub_psp !== undefined && data[path].New_Sub_psp_Edit === true) {
					data[path].New_Sub_psp = sub_psp;
				}

				if (clear_th_party === true && data[path].Third_Party_Edit === true) {
					data[path].New_Thrd_Party = "";
				}
				if (clear_psp === true && data[path].Psp_Edit === true) {
					data[path].New_Psp = "";
				}
				if (clear_sub_psp === true && data[path].New_Sub_psp_Edit === true) {
					data[path].New_Sub_psp = "";
				}
				if (th_party !== undefined && data[path].Third_Party_Edit === true) {
					data[path].New_Thrd_Party = th_party;
				}
				if (rej_code !== undefined && data[path].Rejection_Editable === true) {
					data[path].Rejection_Code = rej_code;
				}

				if (assetLocation !== undefined && data[path].AL_Edit === true) {
					data[path].New_Asset_Loc = assetLocation;
				}
				//---SRE2523 SVERMA15
				if (smc !== undefined) {
					data[path].New_smc = smc;
				}
				//---SRE2523 SVERMA15
				//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

				//equating data to new values entered by user
				if (end_cust !== undefined && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = end_cust;
				}
				if (soft_del_cont !== undefined && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = soft_del_cont;
				}
				if (hard_del_cont !== undefined && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = hard_del_cont;
				}
				if (clear_end_cust === true && data[path].End_Cust_Edit === true) {
					data[path].New_End_Cust = "";
				}
				if (clear_soft_del_cont === true && data[path].SW_Del_Cnt_Edit === true) {
					data[path].New_SW_Del_Cnt = "";
				}
				if (clear_hard_del_cont === true && data[path].HW_Del_Cnt_Edit === true) {
					data[path].New_HW_Del_Cnt = "";
				}

				//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

			}
			this.getView().byId("id_zcontract_db_tbl_upf").getModel().setData(data);
			this.getView().byId("id_zcontract_db_tbl_upf").getModel().refresh(true);

			this._AV_C.close();
		},
		AV_onApplyToSelected_EQ: function (event) {
			var oTable = this.getView().byId("id_gu_equip_table");
			var data = this.getView().byId("id_gu_equip_table").getModel().getData();
			var selectedIndices = oTable.getSelectedIndices();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_eq_apply");
			var eqpStatus = sap.ui.getCore().byId("id_fb_gu_eq_apply_EqpStatus").getSelected();
			var exclusionDate = sap.ui.getCore().byId("id_fb_gu_eq_apply_ExclusionDate").getValue();
			var validFrom = sap.ui.getCore().byId("id_fb_gu_eq_apply_ValidFrom").getValue();
			var LLFL = smartFilterBar.getFilterData()["LLFL"];
			var supEqp = smartFilterBar.getFilterData()["SuperordEquip"];
			var salesOrg = smartFilterBar.getFilterData()["SalesOrg"];
			var company = smartFilterBar.getFilterData()["CompanyCode"];
			var salesOrder = smartFilterBar.getFilterData()["SalesOrder"];
			var ineligibilityCode = smartFilterBar.getFilterData()["IneligibilityCode"];
			var entitledParty = smartFilterBar.getFilterData()["EntitledParty"];
			var assetLocation = smartFilterBar.getFilterData()["AssetLocation"];
			var psp = smartFilterBar.getFilterData()["PSP"];
			var clear_psp = sap.ui.getCore().byId("id_fb_gu_eq_Clear_PSP").getSelected();
			var clear_ic = sap.ui.getCore().byId("id_fb_gu_eq_Clear_IC").getSelected();
			var clear_sup_eqp = sap.ui.getCore().byId("id_fb_gu_eq_Clear_Sup_Eqp").getSelected();

			for (var i = 0; i < selectedIndices.length; i++) {
				var path = oTable.getContextByIndex(selectedIndices[i]).sPath.split("/")[1];
				if (eqpStatus === true && data[path].EqpStatusEditable === true) {
					data[path].NewEqpStatus = eqpStatus;
				}

				if (validFrom !== "") {
					data[path].NewValidFrom = validFrom;
				}

				if (exclusionDate !== "" && data[path].ExclDateEditable === true) {
					data[path].NewExclusionDate = exclusionDate;
				}

				if (LLFL !== undefined && data[path].LLFLEditable === true) {
					data[path].NewLLFL = LLFL;
				}
				if (supEqp !== undefined && data[path].SuperordEquipEditable === true) {
					data[path].NewSuperordEquip = supEqp;
				}

				if (clear_sup_eqp && data[i].SuperordEquipEditable === true) {
					data[i].NewSuperordEquip = "";
				}
				if (salesOrg !== undefined) {
					data[path].NewSalesOrg = salesOrg;
				}
				if (company !== undefined) {
					data[path].NewCompanyCode = company;
				}
				if (salesOrder !== undefined) {
					data[path].NewSalesOrder = salesOrder;
				}
				if (ineligibilityCode !== undefined) {
					data[path].NewIneligibilityCode = ineligibilityCode;
				}

				if (clear_ic) {
					data[i].NewIneligibilityCode = "";
				}
				if (entitledParty !== undefined) {
					data[path].NewEntitledParty = entitledParty;
				}
				if (assetLocation !== undefined) {
					data[path].NewAssetLocation = assetLocation;
				}
				if (psp !== undefined) {
					data[path].NewPSP = psp;
				}
				if (clear_psp) {
					data[i].NewPSP = "";
				}

			}
			this.getView().byId("id_gu_equip_table").getModel().setData(data);
			this.getView().byId("id_gu_equip_table").getModel().refresh(true);

			this._AV_EQ.close();
		},
		AV_onApplyToAll_EQ: function (event) {
			var data = this.getView().byId("id_gu_equip_table").getModel().getData();

			var smartFilterBar = sap.ui.getCore().byId("id_fb_gu_eq_apply");
			var eqpStatus = sap.ui.getCore().byId("id_fb_gu_eq_apply_EqpStatus").getSelected();
			var exclusionDate = sap.ui.getCore().byId("id_fb_gu_eq_apply_ExclusionDate").getValue();
			var validFrom = sap.ui.getCore().byId("id_fb_gu_eq_apply_ValidFrom").getValue();
			var LLFL = smartFilterBar.getFilterData()["LLFL"];
			var supEqp = smartFilterBar.getFilterData()["SuperordEquip"];
			var salesOrg = smartFilterBar.getFilterData()["SalesOrg"];
			var company = smartFilterBar.getFilterData()["CompanyCode"];
			var salesOrder = smartFilterBar.getFilterData()["SalesOrder"];
			var ineligibilityCode = smartFilterBar.getFilterData()["IneligibilityCode"];
			var entitledParty = smartFilterBar.getFilterData()["EntitledParty"];
			var assetLocation = smartFilterBar.getFilterData()["AssetLocation"];
			var psp = smartFilterBar.getFilterData()["PSP"];
			var clear_psp = sap.ui.getCore().byId("id_fb_gu_eq_Clear_PSP").getSelected();
			var clear_ic = sap.ui.getCore().byId("id_fb_gu_eq_Clear_IC").getSelected();
			var clear_sup_eqp = sap.ui.getCore().byId("id_fb_gu_eq_Clear_Sup_Eqp").getSelected();

			for (var i = 0; i < data.length; i++) {
				if (eqpStatus === true && data[i].EqpStatusEditable === true) {
					data[i].NewEqpStatus = true;
				}

				if (validFrom !== "") {
					data[i].NewValidFrom = validFrom;
				}

				if (exclusionDate !== "" && data[i].ExclDateEditable === true) {
					data[i].NewExclusionDate = exclusionDate;
				}

				if (LLFL !== undefined && data[i].LLFLEditable === true) {
					data[i].NewLLFL = LLFL;
				}
				if (supEqp !== undefined && data[i].SuperordEquipEditable === true) {
					data[i].NewSuperordEquip = supEqp;
				}
				if (clear_sup_eqp && data[i].SuperordEquipEditable === true) {
					data[i].NewSuperordEquip = "";
				}

				if (salesOrg !== undefined) {
					data[i].NewSalesOrg = salesOrg;
				}
				if (company !== undefined) {
					data[i].NewCompanyCode = company;
				}
				if (salesOrder !== undefined) {
					data[i].NewSalesOrder = salesOrder;
				}
				if (ineligibilityCode !== undefined) {
					data[i].NewIneligibilityCode = ineligibilityCode;
				}

				if (clear_ic) {
					data[i].NewIneligibilityCode = "";
				}

				if (entitledParty !== undefined) {
					data[i].NewEntitledParty = entitledParty;
				}
				if (assetLocation !== undefined) {
					data[i].NewAssetLocation = assetLocation;
				}
				if (psp !== undefined) {
					data[i].NewPSP = psp;
				}
				if (clear_psp) {
					data[i].NewPSP = "";
				}

			}
			this.getView().byId("id_gu_equip_table").getModel().setData(data);
			this.getView().byId("id_gu_equip_table").getModel().refresh(true);

			this._AV_EQ.close();
		},
		_handleRouteMatched: function (event) {

			var oparameters = event.getParameter("name");
			if (oparameters !== "GlobalUpdate" && oparameters !== "Amend") {
				return;
			} else {
				if (oparameters === "Amend") {
					var tab = event.getParameter("arguments").TAB;
					var object = event.getParameter("arguments").OBJECT;

					if (tab === "EQ") {
						this.getView().byId("id_GU_IconTabBar").setSelectedKey("Tab_Equipments");
						this.AmendObject = object;
						this.onPressExecuteEquipments2();
					} else if (tab === "FL") {
						this.getView().byId("id_GU_IconTabBar").setSelectedKey("Tab_FL");
						this.AmendObject = object;
						this.onPressExecuteFL2();
					}
				}

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

				this.contracts_from_file = [];
				this.getView().byId("id_gu_c_list").setEnabled(false);

				var oModelJson = new sap.ui.model.json.JSONModel();
				var oData = [];
				oModelJson.setData(oData);
				this.getView().byId("id_zcontract_db_tbl_al").setModel(oModelJson);

				var oModelJson1 = new sap.ui.model.json.JSONModel();
				var oData1 = [];
				oModelJson1.setData(oData1);
				this.getView().byId("id_zcontract_db_tbl_AL_Quotes").setModel(oModelJson1);

				this.oViewModel = new sap.ui.model.json.JSONModel();
				this.oViewModel.setSizeLimit(100000);
				this.getView().setModel(this.oViewModel, "viewData");
				this.getView().getModel("viewData").setProperty("/SelectedZONC", []);
				this.getView().getModel("viewData").setProperty("/SelectedCMR_DMR", []);
				this.getView().getModel("viewData").setProperty("/SelectedContracts", []);
				this.getView().getModel("viewData").setProperty("/SelectedQuotes", []);
				//BOI AKADAM04NOV2019+

				// <!--SRE 2483 BOC ++VS -->
				var obj1 = {
					START_DATE: "",
					END_DATE: "",
					AMOUNT: "0.00",
					minus_visible: false
				};
				var ssn = [];
				ssn.push(obj1);
				this.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisibleRowCount(ssn.length);
				this.getView().getModel("viewData").setProperty("/Add_SSN", ssn);
				this.getView().getModel("viewData").setProperty("/TOTAL_SSN", "0.00");
				this.getView().getModel("viewData").setProperty("/eqalBillingItem", undefined);
				this.getView().getModel("viewData").setProperty("/custBillingItem", undefined);
				// SRE2483 BOC ++VS
				this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleEqBilling", false);
				this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleUserDefBilling", false);
				this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleDefBilling", false);
				// EOC SRE2483

				this._oDialogError = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importError",
					this
				);
				this.getView().addDependent(this._oDialogError);

				this._dialog_Response_For_1251 = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Response_For_1251_GU",
					this
				);
				this.getView().addDependent(this._dialog_Response_For_1251);
				//EOI AKADAM04NOV2019+
				//LR1 Changes by Aniket
				this.getView().getModel("viewData").setProperty("/UpdateHeadeText", [{
					Append: true
				}]);
				this.getView().getModel("viewData").setProperty("/UpdateHeadeText_q", [{
					Append: true
				}]); //LR1 AKADAM29FEB2020+
				var controller = this;
				var oModel = this.getOwnerComponent().getModel();
				//LR1 ValueHelp for Header Text by Aniket
				oModel.read(
					"/Ets_VH_HeaderText", {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/HeaderTextVH", data.results);
							}
						},
						error: function (error) {

						}
					});
				//LR1 ValueHelp for Language by Aniket
				oModel.read(
					"/Ets_VH_Language", {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/LanguageVH", data.results);
							}
							/*SOC szanzaney SRE2524*/
							var language = sap.ui.getCore().getConfiguration().getLanguage();
							controller.getView().getModel("viewData").setProperty("/LanguageLogon", language.toUpperCase());
							/*SOC szanzaney SRE2524*/
						},
						error: function (error) {

						}
					});

				oModel.read(
					"/Ets_VH_Inelig_Code", {
						urlParameters: {
							"$format": "json"
						},
						success: function (data, response) {
							if (data.results.length > 0) {
								controller.getView().getModel("viewData").setProperty("/IC_VH", data.results);
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
			this._oTableColumns_FL = this.getView().byId("id_gu_fl_table").getColumns();
			this._oTableColumns_FL.pop();
			this._oTableColumns_EQ = this.getView().byId("id_gu_equip_table").getColumns();
			this._oTableColumns_C = this.getView().byId("id_zcontract_db_tbl_upf").getColumns();
			this._oTableColumns_Q = this.getView().byId("id_zcontract_db_q_tbl_upf").getColumns();
			this._oTableColumns_ZONC = this.getView().byId("id_zcontract_db_zonc_tbl_upf").getColumns();
			this._oTableColumns_CMR_DMR = this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getColumns();
			// SRE2483 BOC ++VS
			this.oVisibilityModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oVisibilityModel, "visibilityModelGU");
			// EOC SRE2483

			this.settings = {
				"ColumnCollection": [],
				"SortItems": [],
				"FilterItems": []
			};

			this.FilterBarids = [
				"id_fb_gu_contracts_main",
				"id_fb_gu_contracts_header",
				"id_fb_gu_contracts_partners",
				"id_fb_gu_quotes_main",
				"id_fb_gu_quotes_header",
				"id_fb_gu_quotes_partners",
				"id_fb_gu_contracts_header_clear",
				"id_fb_gu_quotes_header_clear",
				"id_fb_gu_equipments_main",
				"id_fb_gu_fl_main",
				"id_fb_gu_zonc_main",
				"id_fb_gu_memos_main",
				"id_fb_gu_cmr_dmr_header",
				"id_fb_gu_zonc_partners",
				"id_fb_gu_zonc_header",
				"id_fb_gu_contracts_clr_partners",
				"id_fb_gu_quotes_clr_partners"
			];
			var _vController = this;
			var id = _vController.FilterBarids;
			for (var i = 0; i < id.length; i++) {
				var fb = _vController.getView().byId(id[i]);
				fb.setUseToolbar(false);
				fb._oFiltersButton.setVisible(false);
			}

			var oFilter = this.getView().byId("id_fb_gu_equipments_main");

			oFilter.addEventDelegate({
				"onAfterRendering": function (oEvent) {
					var oButton = oEvent.srcControl._oSearchButton;
					oButton.setText("Get Data");
				}
			});

			var oFilter1 = this.getView().byId("id_fb_gu_fl_main");

			oFilter1.addEventDelegate({
				"onAfterRendering": function (oEvent) {
					var oButton = oEvent.srcControl._oSearchButton;
					oButton.setText("Get Data");
				}
			});

			this._updateLog_EQ = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.UpdateLog_EQ",
				this
			);
			this.getView().addDependent(this._updateLog_EQ);

			this._updateLog_FL = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.UpdateLog_FL",
				this
			);
			this.getView().addDependent(this._updateLog_FL);

			this._updateLog_FL_Copy = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.UpdateLog_FL_Copy",
				this
			);
			this.getView().addDependent(this._updateLog_FL_Copy);

			this._updateLog = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.UpdateLog",
				this
			);
			this.getView().addDependent(this._updateLog);

			this._AV_EQ = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_EQ",
				this
			);
			this.getView().addDependent(this._AV_EQ);

			this._AV_FL = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_FL",
				this
			);
			this.getView().addDependent(this._AV_FL);

			this._AV_Q = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_Q",
				this
			);
			this.getView().addDependent(this._AV_Q);
			this._AV_ZONC = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_ZONC",
				this
			);
			this.getView().addDependent(this._AV_ZONC);

			this._AV_CMR_DMR = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_CMR_DMR",
				this
			);
			this.getView().addDependent(this._AV_CMR_DMR);

			this._AV_C = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ApplyValues_C",
				this
			);
			this.getView().addDependent(this._AV_C);
			this._jobConfirmation = sap.ui.xmlfragment(
				"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.Global_Update_Job_Confirmation",
				this
			);
			this.getView().addDependent(this._jobConfirmation);

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

			var path3 = "/Ets_VH_ZTPINFO";
			var oModel3 = this.getOwnerComponent().getModel();
			oModel3.read(
				path3, {
					urlParameters: {
						"$format": "json"
					},
					success: function (data, response) {
						if (data.results.length > 0) {
							controller.getView().getModel("viewData").setProperty("/ZTPINFOList", data.results);
						}
					},
					error: function (error) {

					}
				});

			//--SRE2523 BOC VSINGH
			var path = "/Ets_VH_SMC";
			var controller = this;
			var oModel2 = this.getOwnerComponent().getModel();
			oModel2.read(
				path, {
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
			//--SRE2523 EOC VSINGH
		},
		//SRE2438 Vsingh BOC
		onPressDefaultView: function () {
			// this.getView().byId("id_zcontract_db_tbl_equalBilling").setVisible(false);
			// this.getView().byId("id_zcontract_db_tbl_UserDefBilling").setVisible();
			// this.getView().byId("id_zcontract_db_tbl_amend_bil_sch_adj").setVisible(true);
			this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleEqBilling", false);
			this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleUserDefBilling", false);
			this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleDefBilling", true);

		},
		onPressEqualBilling: function () {
			this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleEqBilling", true);
			this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleUserDefBilling", false);
			this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleDefBilling", false);
			var sPath = '/Ets_Add_SSN';
			var aFilters = [];
			//var ocontract = this.contract;
			if (!this.contract) {
				MessageBox.show("Please select atleast one contract", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error",
					actions: [sap.m.MessageBox.Action.OK]
				});
				return;
			}

			//*******START OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//
			var contract = this.getView().getModel("viewData").getData().SelectedContracts;
			contract.forEach(function (obj) {
				aFilters.push(new Filter("VBELN", "EQ", obj.VBELN));
			})
			this.contract.forEach(function (obj) {
					aFilters.push(new Filter("VBELN", "EQ", obj));
				})
				//*******END OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//
			aFilters.push(new Filter("BILL_FLAG", "EQ", 'B'));
			var oGlobalBusyDialog = new sap.m.BusyDialog();

			var oModel1 = this.getOwnerComponent().getModel();
			// if (this.getView().getModel("viewData").getProperty("/eqalBillingItem") === undefined) {
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
						// this.getView().getModel("viewData").setProperty("/eqalBillingItem/0/VBELN",1);
						// this.getView().getModel("viewData").setProperty("/eqalBillingItem/1/VBELN",2);
						// this.getView().getModel("viewData").setProperty("/eqalBillingItem/2/VBELN",3);
						// this.getView().getModel("viewData").setProperty("/eqalBillingItem/3/VBELN",4);
					}.bind(this)
				});
			// }
		},
		onPressCustomerBilling: function () {
			// this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleEqBilling", false);
			// this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleUserDefBilling", true);
			// this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleDefBilling", false);
			// var sPath = '/Ets_Add_SSN';
			// var ocontract = this.contract;
			// let aFilters = [];
			// aFilters.push(new Filter("VBELN", "EQ", ocontract));
			// aFilters.push(new Filter("BILL_FLAG", "EQ", 'C'));
			// var oGlobalBusyDialog = new sap.m.BusyDialog();

			// var oModel1 = this.getOwnerComponent().getModel();
			// if (this.getView().getModel("viewData").getProperty("/custBillingItem") === undefined) {
			// 	oGlobalBusyDialog.open();
			// 	oModel1.read(
			// 		sPath, {
			// 			filters: aFilters,
			// 			success: function (data, response) {
			// 				oGlobalBusyDialog.close();
			// 				this.getView().getModel("viewData").setProperty("/custBillingItem", data.results);
			// 				if (data.results.length <= 7) {
			// 					this.getView().byId("id_zcontract_db_tbl_UserDefBilling").setVisibleRowCount(data.results.length);
			// 				}
			// 				var amt = 0.00;
			// 				for (var i = 0; i < data.results.length; i++) {
			// 					amt = +Number(data.results[i].AMOUNT_CUST).toFixed(2) + amt;
			// 				}
			// 			this.getView().getModel("viewData").setProperty("/TOTAL_SSN_UserDefSrv", Number(amt).toFixed(2));
			// 			}.bind(this)
			// 		});
			// }

			if (!this._oDialogGU_billingDoc) {
				this._oDialogGU_billingDoc = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.GU_Uploader_BillingDoc", this);
				this.getView().addDependent(this._oDialogGU_billingDoc);
			}
			this._oDialogGU_billingDoc.open();
		},
		handleUploadPress: function (oEvent) {
			var url = "https://myclassbook.org/wp-content/uploads/2017/12/Test.xlsx";
			var oReq = new XMLHttpRequest();
			oReq.open("GET", url, true);
			oReq.responseType = "arraybuffer";

			oReq.onload = function (e) {
				var arraybuffer = oReq.response;

				/* convert data to binary string */
				var data = new Uint8Array(arraybuffer);
				var arr = new Array();
				for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
				var bstr = arr.join("");

				/* Call XLSX */
				var workbook = XLSX.read(bstr, {
					type: "binary"
				});

				/* DO SOMETHING WITH workbook HERE */
				var first_sheet_name = workbook.SheetNames[0];
				/* Get worksheet */
				var worksheet = workbook.Sheets[first_sheet_name];
				console.log(XLSX.utils.sheet_to_json(worksheet, {
					raw: true
				}));
			};

			oReq.send();
			//oFileUploader.upload();
		},
		uploadFileGU_billingDoc: function (oEvent) {
			var file = oEvent.getParameter("files")[0];
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (evn) {
					var data = evn.target.result;
					data = new Uint8Array(data);
					var arr = new Array();
					for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
					var bstr = arr.join("");
					var workbook = XLSX.read(data, {
						type: 'array'
					});
					var first_sheet_name = workbook.SheetNames[0];
					var worksheet = workbook.Sheets[first_sheet_name];
					var obj = XLSX.utils.sheet_to_json(worksheet, {
						raw: true
					})
					var contract, startDate, endDate, amount, dataObject;
					var amt = 0;
					var arrayData = [];
					obj.forEach(function (oRows) {
						for (var i in oRows) {
							if (i.indexOf("Contract") !== -1) {
								contract = oRows[i];
							} else if (i.indexOf("Start") !== -1) {
								startDate = oRows[i];
							} else if (i.indexOf("End") !== -1) {
								endDate = oRows[i];
							} else if (i.indexOf("Amount") !== -1) {
								amount = oRows[i];
							}
						}
						dataObject = {
							"START_DATE": startDate,
							"END_DATE": endDate,
							"AMOUNT": amount,
							"VBELN": contract
						};
						//amt = amt + parseInt(amount).toFixed(2);
						amt = +Number(amount) + amt
						arrayData.push(dataObject);
					});
					this.getView().getModel("viewData").setProperty("/custBillingItem", arrayData);
					this.getView().getModel("viewData").setProperty("/TOTAL_SSN_UserDef", amt.toFixed(2));
					var fU = sap.ui.getCore().byId("fileUploader");
					fU.clear();
					this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleEqBilling", false);
					this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleUserDefBilling", true);
					this.getView().getModel("visibilityModelGU").setProperty("/IsVisibleDefBilling", false);
					if (arrayData.length <= 10) {
						this.getView().byId("id_zcontract_db_tbl_UserDefBilling").setVisibleRowCount(arrayData.length);
					}

					//var wb = XLS.parse_xlscfb(cfb);
					// this.csvJSON(strCSV);
				}.bind(this);
				// reader.readAsText(file);
				//reader.readAsBinaryString(file);
				reader.readAsArrayBuffer(file);

			}
			this._oDialogGU_billingDoc.close();
		},
		csvJSON: function (csv) {
			var lines = csv.split("\n");
			var result = [];
			var headers = lines[0].split(",");
			for (var i = 1; i < lines.length; i++) {
				var obj = {};
				var currentline = lines[i].split(",");
				for (var j = 0; j < headers.length; j++) {
					obj[headers[j]] = currentline[j];
				}
				result.push(obj);
			}
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			//return result; //JavaScript object
			sap.ui.getCore().getModel("viewData").setProperty("/custBillingItem", oFinalResult);
		},
		//SRE 2438 vsingh EOC
		onpressJobOpen: function (oEvent) {
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			if (this.AUTH_BACKGROUND_JOB === "X") {
				var obj = {
					"msg": "No. of Documents Selected - Exceeds the limit (" + this._DOC_LIMIT + ")",
					"email": this._EMAIL
				};
				if (key === "Tab_Equipments") {
					obj.msg = "No. of Equipments Selected - Exceeds the limit (" + this._DOC_LIMIT + ")";
				}

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(obj);
				this._jobConfirmation.setModel(oModel);

				if (this._EMAIL === "") {
					sap.ui.getCore().byId("id_btn_job_schedule").setEnabled(false);
				}
				this._jobConfirmation.open();
			} else {
				var msg = "";
				if (key === "Tab_Equipments") {
					msg = "No. of Equipments Selected - Exceeds the limit (" + this._DOC_LIMIT + "). You are not authorized to proceed.";
				} else {
					msg = "No. of Documents Selected - Exceeds the limit (" + this._DOC_LIMIT + "). You are not authorized to proceed.";
				}

				sap.m.MessageBox.show(
					msg, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}

		},
		onpressJobCancel: function (oEvent) {
			this._jobConfirmation.close();
		},
		onpressJobProceed: function (oEvent) {
			var controller = this;
			controller._Batch_Mode = true;
			if (controller.updateType === "Contracts") {
				controller.handle_Global_Update_Contracts();
			} else if (controller.updateType === "Quotes") {
				controller.handle_Global_Update_Quotes();
			} else if (controller.updateType === "Equipments") {
				controller.handle_Global_Update_Equipments();
			} else if (controller.updateType === "ZONC") {
				controller.handle_Global_Update_ZONC();
			}
			this._jobConfirmation.close();
		},
		onChangeEmail: function (oEvent) {
			if (this.validateEmail(oEvent.getSource().getValue())) {
				sap.ui.getCore().byId("id_btn_job_schedule").setEnabled(true);
				this._EMAIL = oEvent.getSource().getValue();
			} else {
				sap.ui.getCore().byId("id_btn_job_schedule").setEnabled(false);
			}
		},
		validateEmail: function (email) {
			var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			if (reg.test(email) === false) {
				return false;
			}
			return true;
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

		},
		onUpdateLogClose_EQ: function (oEvent) {
			this._updateLog_EQ.close();
		},
		onExportUpdateLog_EQ: function (oEvent) {
			var oTable = sap.ui.getCore().byId("id_cmd_updateLog_EQ");

			var aCols = [{
				label: "Equipment",
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
		onPressCopy_DownloadTemplate: function (oEvent) {
			var oTable = sap.ui.getCore().byId("id_cmd_updateLog_FL_Copy");

			var aCols = [{
				label: "Source LLFL",
				property: "SourceFl",
				type: "string"
			}, {
				label: "Target LLFL",
				property: "TargetFl",
				type: "string"
			}, {
				label: "Sold To",
				property: "SoldTo",
				type: "string"
			}, {
				label: "Reseller",
				property: "Reseller",
				type: "string"
			}];

			var oSettings, oSheet;

			var dataSource = [{

			}];

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

		_createColumnConfigExport: function () {
			return [{
				label: 'Contract', //INC0162703
				property: 'VBELN',
				width: '20'
			}, {
				label: 'Start Date',
				property: 'START_DATE',
				width: '20'
			}, {
				label: 'End Date',
				property: 'END_DATE',
				width: '20'
			}, {
				label: 'Amount',
				property: 'AMOUNT',
				width: '20'
			}];
		},

		onExportPress: function () {
			var aCols, aFields, oSettings;
			aCols = this._createColumnConfigExport();
			aFields = this.getView().getModel("viewData").getProperty("/eqalBillingItem");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aFields
			};
			new Spreadsheet(oSettings)
				.build()
				.then(function () {
					MessageToast.show("Downloaded spreadsheet!");
				});
		},

		onUpdateLogClose_FL_Copy: function (oEvent) {
			this._updateLog_FL_Copy.close();
		},
		onExportUpdateLog_FL_Copy: function (oEvent) {
			var oTable = sap.ui.getCore().byId("id_cmd_updateLog_FL_Copy");

			var aCols = [{
				label: "Source LLFL",
				property: "SourceFl",
				type: "string"
			}, {
				label: "Target LLFL",
				property: "TargetFl",
				type: "string"
			}, {
				label: "Sold To",
				property: "SoldTo",
				type: "string"
			}, {
				label: "Reseller",
				property: "Reseller",
				type: "string"
			}, {
				label: "Type",
				property: "MessageType",
				type: "string"
			}, {
				label: "Message",
				property: "MessageText",
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
		onUpdateLogClose_FL: function (oEvent) {
			this._updateLog_FL.close();
		},
		onExportUpdateLog_FL: function (oEvent) {
			var oTable = sap.ui.getCore().byId("id_cmd_updateLog_FL");

			var aCols = [{
				label: "Functional Location",
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
		onBack: function (oEvent) {
			//this.oRouter.navTo("home", {});
			history.go(-1);
		},
		onpressQRetrieve_MV: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Quote_PspSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedQuotes;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Quote_Num", "EQ", key.VBELN));
			});
			filter.push(new sap.ui.model.Filter("Multivendor_Flag", "EQ", true));
			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						var oTable = controller.getView().byId("id_zcontract_db_q_tbl_upf");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Quote", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},
		onpressQRetrieve: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Quote_PspSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedQuotes;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Quote_Num", "EQ", key.VBELN));
			});
			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						var oTable = controller.getView().byId("id_zcontract_db_q_tbl_upf");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Quote", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},
		onpressZONCRetrieve: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Contract_PspSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedZONC;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Contract_Num", "EQ", key.VBELN));
			});
			filter.push(new sap.ui.model.Filter("Tab_Key", "EQ", "Tab_ZONC"));

			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						//controller.getView().getModel("viewData").setProperty("/ContractPSP", oData.results);
						var oTable = controller.getView().byId("id_zcontract_db_zonc_tbl_upf");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Document", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},
		onpressCMR_DMRRetrieve: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Contract_PspSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedCMR_DMR;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Contract_Num", "EQ", key.VBELN));
			});
			filter.push(new sap.ui.model.Filter("Tab_Key", "EQ", "Tab_CMR_DMR"));

			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						//controller.getView().getModel("viewData").setProperty("/ContractPSP", oData.results);
						var oTable = controller.getView().byId("id_zcontract_db_tbl_cmr_dmr");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Contract", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},
		onpressCRetrieve: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Contract_PspSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedContracts;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Contract_Num", "EQ", key.VBELN));
			});
			filter.push(new sap.ui.model.Filter("Tab_Key", "EQ", "Tab_Contracts"));

			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						//controller.getView().getModel("viewData").setProperty("/ContractPSP", oData.results);
						var oTable = controller.getView().byId("id_zcontract_db_tbl_upf");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Contract", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},
		onpressCRetrieve_MV: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Contract_PspSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedContracts;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Contract_Num", "EQ", key.VBELN));
			});
			filter.push(new sap.ui.model.Filter("Multivendor_Flag", "EQ", true));
			filter.push(new sap.ui.model.Filter("Tab_Key", "EQ", "Tab_Contracts"));
			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						//controller.getView().getModel("viewData").setProperty("/ContractPSP", oData.results);
						var oTable = controller.getView().byId("id_zcontract_db_tbl_upf");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Contract", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},

		//********* Defect 99557	++ VS BEGIN

		onPressInvoiceRetrieve: function (oEvent) {
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var oServiceModel = this.getOwnerComponent().getModel();
			var filter = [];
			var sPath = "/Ets_Contract_InvoiceSet";
			var controller = this;
			var contract = this.getView().getModel("viewData").getData().SelectedContracts;
			contract.forEach(function (key) {
				filter.push(new sap.ui.model.Filter("Contract_num", "EQ", key.VBELN));
			});

			if (contract.length > 0) {
				var mParameters = {
					method: "GET",
					filters: filter,
					async: false, //AND
					success: jQuery.proxy(function (data) {
						//controller.getView().getModel("viewData").setProperty("/ContractPSP", oData.results);
						var oTable = controller.getView().byId("id_zinvoice_db_tbl_upf");
						var oModelJson = new sap.ui.model.json.JSONModel();

						if (data.results.length > 0) {
							oModelJson.setData(data.results);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						} else {
							sap.m.MessageBox.show(
								"No Data Found!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
							oModelJson.setData([]);
							oTable.setModel(oModelJson);
							oTable.bindRows({
								path: "/"
							});
						}
						oGlobalBusyDialog.close();
					}, this),

					error: jQuery.proxy(function (oError) {
						//this._oProductCategory.setBusy(false);
						oGlobalBusyDialog.close();
						var k = JSON.parse(oError.responseText);
						var msg = k.error.message.value;
						MessageToast.show(msg);
						oGlobalBusyDialog.close();
					}, this)
				};

				oServiceModel.read(sPath, mParameters);
			} else {
				sap.m.MessageBox.show(
					"Please Select a Contract", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Service Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				oGlobalBusyDialog.close();
			}
		},

		//********* Defect 99557	++ VS End
		validateUploadContracts: function (data) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "FromCSV",
				operator: FilterOperator.EQ,
				value1: "X"
			}));
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "G"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var mFilterArray = [];
			for (var i = 0; i < data.length; i++) {
				mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", data[i].VBELN));
			}
			var mFF = new Filter({
				filters: mFilterArray,
				and: false
			});
			f.push(mFF);
			var controller = this;
			var path = "/Ets_Documents";
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
						controller.Relevant_For_1251 = false; //AKADAM04NOV2019+ Defect 86920
						for (var j = 0; j < data1.results.length; j++) {
							var obj = {};
							if (data1.results[j].Message_Type === "E") {
								var error = {};
								error.VBELN = data1.results[j].VBELN;
								error.Message = data1.results[j].Message;
								errorTab.push(error);

							} else {
								obj.VBELN = data1.results[j].VBELN.trim();
								obj.Relevant_For_1251 = data1.results[j].Relevant_For_1251; //AKADAM04NOV2019+ Defect 86920
								resultFinal.push(obj);
								//BOI AKADAM04NOV2019+ Defect 86920
								if (data1.results[j].Relevant_For_1251 === true) {
									controller.Relevant_For_1251 = true;
								}
								//EOI AKADAM04NOV2019+ Defect 86920
							}
						}

						if (resultFinal.length > 0) {
							controller.getView().getModel("viewData").setProperty("/SelectedContracts", resultFinal);
							controller.getView().byId("id_gu_c_list").setText("Show Selected Contracts (" + resultFinal.length + ")");
							if (resultFinal.length > 0) {
								controller.getView().byId("id_gu_c_list").setEnabled(true);
							} else {
								controller.getView().byId("id_gu_c_list").setEnabled(false);
							}
						}
						if (errorTab.length > 0) {
							controller.getView().getModel("viewData").setProperty("/errorTab", errorTab);
							if (!controller._oDialogError) {
								controller._oDialogError = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importError", controller);
								controller.getView().addDependent(controller._oDialogError);
							}
							controller._oDialogError.open();
							/*if (!controller._oDialogError) {
								controller._oDialogError = new sap.m.Dialog({
									title: "Invalid Contracts (" + errorTab.length + ")",
									icon: "sap-icon://error",
									content: new sap.m.List({
										items: {
											path: 'viewData>/errorTab',
											template: new sap.m.StandardListItem({
												title: "{viewData>VBELN}"
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
							controller._oDialogError.open();*/
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

		},
		fetchFilters_gu_eq: function () {
			var controller = this;
			controller.count = 0;

			var f = [];

			var multiInputFields = [{
				"key": "Equipment_Number",
				"id": "id_inp_gu_equipment_number"
			}];
			var filterBarId = ["id_fb_gu_equipments_main"];
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
			// BOI 2483 1.7
			var childEqp = this.getView().byId("id_child_eqp");
			mFilterArray.push(new sap.ui.model.Filter("Child_equip", "EQ", childEqp.getSelected()));
			var mChldFF = new Filter({
				filters: mFilterArray,
				and: true
			});
			f.push(mChldFF);
			var mFilterArraySup = [];
			var supEqp = this.getView().byId("id_sup_eqp");
			mFilterArraySup.push(new sap.ui.model.Filter("Superior_equip", "EQ", supEqp.getSelected()));
			var mSupFF = new Filter({
				filters: mFilterArraySup,
				and: true
			});
			f.push(mSupFF);
			// EOI 2483 1.7
			return f;
		},
		fetchFilters_gu_fl: function () {
			var controller = this;
			controller.count = 0;

			var f = [];

			var multiInputFields = [{
				"key": "TPLNR",
				"id": "id_inp_gu_fl_number"
			}];
			var filterBarId = ["id_fb_gu_fl_main"];
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
			return f;
		},
		onPressExecuteEquipments: function (oEvent) {
			var f = this.fetchFilters_gu_eq(); //final array of filters

			if (f.length > 0) {
				var controller = this;
				var path = "/Ets_Modify_Equipment";
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				oModel.read(
					path, {
						urlParameters: {
							"$format": "json"
						},
						filters: [new Filter(f, true)],
						success: function (data, response) {
							var oTable = controller.getView().byId("id_gu_equip_table");
							var oModelJson = new sap.ui.model.json.JSONModel();

							if (data.results.length > 0) {
								oModelJson.setData(data.results);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							} else {
								sap.m.MessageBox.show(
									"No Data Found!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
								oModelJson.setData([]);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							}
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

			} else {
				sap.m.MessageBox.show(
					"Please Enter Equipment(s) to proceed...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Enter Selection Criteria",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onPressExecuteFL: function (oEvent) {
			var f = this.fetchFilters_gu_fl(); //final array of filters

			if (f.length > 0) {
				var controller = this;
				var path = "/Ets_Modify_FLOC";
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				oModel.read(
					path, {
						urlParameters: {
							"$format": "json"
						},
						filters: [new Filter(f, true)],
						success: function (data, response) {
							var oTable = controller.getView().byId("id_gu_fl_table");
							var oModelJson = new sap.ui.model.json.JSONModel();

							if (data.results.length > 0) {
								oModelJson.setData(data.results);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							} else {
								sap.m.MessageBox.show(
									"No Data Found!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
								oModelJson.setData([]);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							}
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

			} else {
				sap.m.MessageBox.show(
					"Please Enter Equipment(s) to proceed...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Enter Selection Criteria",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onPressExecuteEquipments2: function (oEvent) {
			//var f = this.fetchFilters_gu_eq(); //final array of filters
			var f = [];
			var object = this.AmendObject;
			f.push(new sap.ui.model.Filter("Equipment_Number", "EQ", object));

			if (f.length > 0) {
				var controller = this;
				var path = "/Ets_Modify_Equipment";
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				oModel.read(
					path, {
						urlParameters: {
							"$format": "json"
						},
						filters: [new Filter(f, true)],
						success: function (data, response) {
							var oTable = controller.getView().byId("id_gu_equip_table");
							var oModelJson = new sap.ui.model.json.JSONModel();

							if (data.results.length > 0) {
								oModelJson.setData(data.results);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							} else {
								sap.m.MessageBox.show(
									"No Data Found!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
								oModelJson.setData([]);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							}
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

			} else {
				sap.m.MessageBox.show(
					"Please Enter Equipment(s) to proceed...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Enter Selection Criteria",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onPressExecuteFL2: function (oEvent) {
			//var f = this.fetchFilters_gu_fl(); //final array of filters

			var f = [];
			var object = this.AmendObject;
			f.push(new sap.ui.model.Filter("TPLNR", "EQ", object));

			if (f.length > 0) {
				var controller = this;
				var path = "/Ets_Modify_FLOC";
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var oModel = this.getOwnerComponent().getModel();
				oModel.read(
					path, {
						urlParameters: {
							"$format": "json"
						},
						filters: [new Filter(f, true)],
						success: function (data, response) {
							var oTable = controller.getView().byId("id_gu_fl_table");
							var oModelJson = new sap.ui.model.json.JSONModel();

							if (data.results.length > 0) {
								oModelJson.setData(data.results);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							} else {
								sap.m.MessageBox.show(
									"No Data Found!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
								oModelJson.setData([]);
								oTable.setModel(oModelJson);
								oTable.bindRows({
									path: "/"
								});
							}
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

			} else {
				sap.m.MessageBox.show(
					"Please Enter Equipment(s) to proceed...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Enter Selection Criteria",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onSelectContracts: function (oEvent) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "FromCSV",
				operator: FilterOperator.EQ,
				value1: ""
			}));
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "G"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var controller = this;
			this.contract = []; //++VS SRE2438
			var smartFilterBar = this.getView().byId("id_fb_gu_contracts_main");
			if (smartFilterBar.getFilterData() !== null) {
				if (smartFilterBar.getFilterData()["Contract_Number"] !== undefined) {
					var items = smartFilterBar.getFilterData()["Contract_Number"].items;
					var ranges = smartFilterBar.getFilterData()["Contract_Number"].ranges;
					var mFilterArray = [];
					var mFilterArray = [];
					//--Handle Range
					if (ranges.length === 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
						});
						var mFF3 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF3);
						mFilterArray = [];

					} else if (ranges.length > 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
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
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
							this.contract.push(elem.key) //++VS SRE2438
						}.bind(this));
						var mFF1 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF1);
						mFilterArray = [];

					} else if (items.length > 1) {
						items.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
							this.contract.push(elem.key) //++VS SRE2438
						}.bind(this));
						var mFF = new Filter({
							filters: mFilterArray,
							and: false
						});
						f.push(mFF);
						mFilterArray = [];
					}
					if (f.length > 1) {
						var path = "/Ets_Documents";
						var oGlobalBusyDialog = new sap.m.BusyDialog();
						//oGlobalBusyDialog.open();
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
									controller.Relevant_For_1251 = false; //AKADAM04NOV2019+ Defect 86920
									for (var j = 0; j < data.results.length; j++) {
										var obj = {};
										if (data.results[j].Message_Type === "E") {
											var error = {};
											error.VBELN = data.results[j].VBELN;
											error.Message = data.results[j].Message;
											errorTab.push(error);

										} else {
											obj.VBELN = data.results[j].VBELN.trim();
											obj.Relevant_For_1251 = data.results[j].Relevant_For_1251; //AKADAM04NOV2019+ Defect 86920
											resultFinal.push(obj);
											//BOI AKADAM04NOV2019+ Defect 86920
											if (data.results[j].Relevant_For_1251 === true) {
												controller.Relevant_For_1251 = true;
											}
											//EOI AKADAM04NOV2019+ Defect 86920
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
										controller.getView().getModel("viewData").setProperty("/SelectedContracts", resultFinal);
										controller.getView().byId("id_gu_c_list").setText("Show Selected Contracts (" + resultFinal.length + ")");
										if (resultFinal.length > 0) {
											controller.getView().byId("id_gu_c_list").setEnabled(true);
										} else {
											controller.getView().byId("id_gu_c_list").setEnabled(false);
										}
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
					}
				} else {
					controller.getView().byId("id_gu_c_list").setText("Show Selected Contracts (0)");
					controller.getView().byId("id_gu_c_list").setEnabled(false);
				}
			} else {
				controller.getView().byId("id_gu_c_list").setText("Show Selected Contracts (0)");
				controller.getView().byId("id_gu_c_list").setEnabled(false);
			}
		},
		onSelectZONC: function (oEvent) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "C"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var controller = this;
			var smartFilterBar = this.getView().byId("id_fb_gu_zonc_main");
			if (smartFilterBar.getFilterData() !== null) {
				if (smartFilterBar.getFilterData()["Document"] !== undefined) {
					var items = smartFilterBar.getFilterData()["Document"].items;
					var ranges = smartFilterBar.getFilterData()["Document"].ranges;
					var mFilterArray = [];
					//--Handle Range
					if (ranges.length === 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
						});
						var mFF3 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF3);
						mFilterArray = [];

					} else if (ranges.length > 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
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
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
						});
						var mFF1 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF1);
						mFilterArray = [];

					} else if (items.length > 1) {
						items.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
						});
						var mFF = new Filter({
							filters: mFilterArray,
							and: false
						});
						f.push(mFF);
						mFilterArray = [];
					}
					if (f.length > 1) {
						var path = "/Ets_Documents";
						var oGlobalBusyDialog = new sap.m.BusyDialog();
						//oGlobalBusyDialog.open();
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
									controller.Relevant_For_1251 = false; //AKADAM04NOV2019+ Defect 86920
									for (var j = 0; j < data.results.length; j++) {
										var obj = {};
										if (data.results[j].Message_Type === "E") {
											var error = {};
											error.VBELN = data.results[j].VBELN;
											error.Message = data.results[j].Message;
											errorTab.push(error);

										} else {
											obj.VBELN = data.results[j].VBELN.trim();
											obj.Relevant_For_1251 = data.results[j].Relevant_For_1251; //AKADAM04NOV2019+ Defect 86920
											resultFinal.push(obj);
											//BOI AKADAM04NOV2019+ Defect 86920
											if (data.results[j].Relevant_For_1251 === true) {
												controller.Relevant_For_1251 = true;
											}
											//EOI AKADAM04NOV2019+ Defect 86920
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
										controller.getView().getModel("viewData").setProperty("/SelectedZONC", resultFinal);
										controller.getView().byId("id_gu_zonc_list").setText("Show Selected Documents (" + resultFinal.length + ")");
										if (resultFinal.length > 0) {
											controller.getView().byId("id_gu_zonc_list").setEnabled(true);
										} else {
											controller.getView().byId("id_gu_zonc_list").setEnabled(false);
										}
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
					}
				} else {
					controller.getView().byId("id_gu_zonc_list").setText("Show Selected Documents (0)");
					controller.getView().byId("id_gu_zonc_list").setEnabled(false);
				}
			} else {
				controller.getView().byId("id_gu_zonc_list").setText("Show Selected Dcouments (0)");
				controller.getView().byId("id_gu_zonc_list").setEnabled(false);
			}
		},
		onPressShowSelectedZONC: function (oEvent) {
			var length = this.getView().getModel("viewData").getData().SelectedZONC.length;
			if (!this._oDialogZONC) {
				this._oDialogZONC = new sap.m.Dialog({
					title: "Selected Documents (" + length + ")",
					icon: "sap-icon://complete",
					content: new sap.m.List({
						items: {
							path: 'viewData>/SelectedZONC',
							template: new sap.m.StandardListItem({
								title: "{viewData>VBELN}"
							})
						}
					}),
					beginButton: new sap.m.Button({
						text: 'Close',
						press: function () {
							this._oDialogZONC.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this._oDialogZONC);
			}
			this._oDialogZONC.setTitle("Selected Documents (" + length + ")");
			this._oDialogZONC.open();

		},
		onSelectCMR_DMR: function (oEvent) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "K"
			}));
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "L"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: false
			});

			f.push(sFF);

			var controller = this;
			var smartFilterBar = this.getView().byId("id_fb_gu_memos_main");
			if (smartFilterBar.getFilterData() !== null) {
				if (smartFilterBar.getFilterData()["Document"] !== undefined) {
					var items = smartFilterBar.getFilterData()["Document"].items;
					var ranges = smartFilterBar.getFilterData()["Document"].ranges;
					var mFilterArray = [];
					//--Handle Range
					if (ranges.length === 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
						});
						var mFF3 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF3);
						mFilterArray = [];

					} else if (ranges.length > 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
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
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
						});
						var mFF1 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF1);
						mFilterArray = [];

					} else if (items.length > 1) {
						items.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
						});
						var mFF = new Filter({
							filters: mFilterArray,
							and: false
						});
						f.push(mFF);
						mFilterArray = [];
					}
					if (f.length > 1) {
						var path = "/Ets_Documents";
						var oGlobalBusyDialog = new sap.m.BusyDialog();
						//oGlobalBusyDialog.open();
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
									controller.Relevant_For_1251 = false; //AKADAM04NOV2019+ Defect 86920
									for (var j = 0; j < data.results.length; j++) {
										var obj = {};
										if (data.results[j].Message_Type === "E") {
											var error = {};
											error.VBELN = data.results[j].VBELN;
											error.Message = data.results[j].Message;
											errorTab.push(error);

										} else {
											obj.VBELN = data.results[j].VBELN.trim();
											obj.Relevant_For_1251 = data.results[j].Relevant_For_1251; //AKADAM04NOV2019+ Defect 86920
											resultFinal.push(obj);
											//BOI AKADAM04NOV2019+ Defect 86920
											if (data.results[j].Relevant_For_1251 === true) {
												controller.Relevant_For_1251 = true;
											}
											//EOI AKADAM04NOV2019+ Defect 86920
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
										controller.getView().getModel("viewData").setProperty("/SelectedCMR_DMR", resultFinal);
										controller.getView().byId("id_gu_cmr_dmr_list").setText("Show Selected Documents (" + resultFinal.length + ")");
										if (resultFinal.length > 0) {
											controller.getView().byId("id_gu_cmr_dmr_list").setEnabled(true);
										} else {
											controller.getView().byId("id_gu_cmr_dmr_list").setEnabled(false);
										}
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
					}
				} else {
					controller.getView().byId("id_gu_cmr_dmr_list").setText("Show Selected Documents (0)");
					controller.getView().byId("id_gu_cmr_dmr_list").setEnabled(false);
				}
			} else {
				controller.getView().byId("id_gu_cmr_dmr_list").setText("Show Selected Dcouments (0)");
				controller.getView().byId("id_gu_cmr_dmr_list").setEnabled(false);
			}
		},
		onPressShowSelectedCMR_DMR: function (oEvent) {
			var length = this.getView().getModel("viewData").getData().SelectedCMR_DMR.length;
			if (!this._oDialogCMR_DMR) {
				this._oDialogCMR_DMR = new sap.m.Dialog({
					title: "Selected Documents (" + length + ")",
					icon: "sap-icon://complete",
					content: new sap.m.List({
						items: {
							path: 'viewData>/SelectedCMR_DMR',
							template: new sap.m.StandardListItem({
								title: "{viewData>VBELN}"
							})
						}
					}),
					beginButton: new sap.m.Button({
						text: 'Close',
						press: function () {
							this._oDialogCMR_DMR.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this._oDialogCMR_DMR);
			}
			this._oDialogCMR_DMR.setTitle("Selected Documents (" + length + ")");
			this._oDialogCMR_DMR.open();

		},
		onPressShowSelectedContracts: function (oEvent) {
			var length = this.getView().getModel("viewData").getData().SelectedContracts.length;
			if (!this._oDialogContracts) {
				this._oDialogContracts = new sap.m.Dialog({
					title: "Selected Contracts (" + length + ")",
					icon: "sap-icon://complete",
					content: new sap.m.List({
						items: {
							path: 'viewData>/SelectedContracts',
							template: new sap.m.StandardListItem({
								title: "{viewData>VBELN}"
							})
						}
					}),
					beginButton: new sap.m.Button({
						text: 'Close',
						press: function () {
							this._oDialogContracts.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this._oDialogContracts);
			}
			this._oDialogContracts.setTitle("Selected Contracts (" + length + ")");
			this._oDialogContracts.open();

			/*this.pressDialog.open();
			var controller = this;
			if (!controller._oDialogContracts) {
				controller._oDialogContracts = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ContractsList", controller);
				controller.getView().addDependent(controller._oDialogContracts);
			}
			controller._oDialogContracts.open();*/
		},
		onPressCloseContractsList: function (oEvent) {
			this._oDialogContracts.close();
		},
		onPressCloseError: function (oEvent) {
			this._oDialogError.close();
		},
		validateUploadQuotes: function (data) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "FromCSV",
				operator: FilterOperator.EQ,
				value1: "X"
			}));
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "B"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var mFilterArray = [];
			for (var i = 0; i < data.length; i++) {
				mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", data[i].VBELN));
			}
			var mFF = new Filter({
				filters: mFilterArray,
				and: false
			});
			f.push(mFF);
			var controller = this;
			var path = "/Ets_Documents";
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
								error.VBELN = data1.results[j].VBELN;
								error.Message = data1.results[j].Message;
								errorTab.push(error);

							} else {
								obj.VBELN = data1.results[j].VBELN;
								resultFinal.push(obj);
							}
						}
						if (errorTab.length > 0) {
							controller.getView().getModel("viewData").setProperty("/errorTab", errorTab);
							/*if (!controller._oDialogError) {
								controller._oDialogError = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importError", controller);
								controller.getView().addDependent(controller._oDialogError);
							}
							controller._oDialogError.open();*/
							if (!controller._oDialogErrorQuotes) {
								controller._oDialogErrorQuotes = new sap.m.Dialog({
									title: "Invalid Quotes (" + errorTab.length + ")",
									icon: "sap-icon://error",
									content: new sap.m.List({
										items: {
											path: 'viewData>/errorTab',
											template: new sap.m.StandardListItem({
												title: "{viewData>VBELN}"
											})
										}
									}),
									beginButton: new sap.m.Button({
										text: 'Close',
										press: function () {
											controller._oDialogErrorQuotes.close();
										}.bind(controller)
									})
								});

								//to get access to the global model
								controller.getView().addDependent(controller._oDialogErrorQuotes);
							}
							controller._oDialogErrorQuotes.open();
						}
						if (resultFinal.length > 0) {
							controller.getView().getModel("viewData").setProperty("/SelectedQuotes", resultFinal);
							controller.getView().byId("id_gu_q_list").setText("Show Selected Quotes (" + resultFinal.length + ")");
							if (resultFinal.length > 0) {
								controller.getView().byId("id_gu_q_list").setEnabled(true);
							} else {
								controller.getView().byId("id_gu_q_list").setEnabled(false);
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

		},
		onSelectQuotes: function (oEvent) {
			var f = [];
			var sFilterArray = [];
			sFilterArray.push(new Filter({
				path: "FromCSV",
				operator: FilterOperator.EQ,
				value1: ""
			}));
			sFilterArray.push(new Filter({
				path: "VBTYP",
				operator: FilterOperator.EQ,
				value1: "B"
			}));
			var sFF = new Filter({
				filters: sFilterArray,
				and: true
			});

			f.push(sFF);

			var controller = this;
			var smartFilterBar = this.getView().byId("id_fb_gu_quotes_main");
			if (smartFilterBar.getFilterData() !== null) {
				if (smartFilterBar.getFilterData()["Quote"] !== undefined) {
					var items = smartFilterBar.getFilterData()["Quote"].items;
					var ranges = smartFilterBar.getFilterData()["Quote"].ranges;
					var mFilterArray = [];
					var mFilterArray = [];
					//--Handle Range
					if (ranges.length === 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
						});
						var mFF3 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF3);
						mFilterArray = [];

					} else if (ranges.length > 1) {
						ranges.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", elem.operation, elem.value1, elem.value2));
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
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
						});
						var mFF1 = new Filter({
							filters: mFilterArray,
							and: true
						});
						f.push(mFF1);
						mFilterArray = [];

					} else if (items.length > 1) {
						items.forEach(function (elem) {
							mFilterArray.push(new sap.ui.model.Filter("VBELN", "EQ", elem.key));
						});
						var mFF = new Filter({
							filters: mFilterArray,
							and: false
						});
						f.push(mFF);
						mFilterArray = [];
					}
					if (f.length > 1) {
						var path = "/Ets_Documents";
						var oGlobalBusyDialog = new sap.m.BusyDialog();
						//oGlobalBusyDialog.open();
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
											error.VBELN = data.results[j].VBELN;
											error.Message = data.results[j].Message;
											errorTab.push(error);

										} else {
											obj.VBELN = data.results[j].VBELN;
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
										controller.getView().getModel("viewData").setProperty("/SelectedQuotes", resultFinal);
										controller.getView().byId("id_gu_q_list").setText("Show Selected Quotes (" + resultFinal.length + ")");
										controller.getView().byId("id_gu_q_list").setEnabled(true);
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
						controller.getView().byId("id_gu_q_list").setText("Show Selected Quotes (0)");
						controller.getView().byId("id_gu_q_list").setEnabled(false);
					}
				}
			} else {
				controller.getView().byId("id_gu_q_list").setText("Show Selected Quotes (0)");
				controller.getView().byId("id_gu_q_list").setEnabled(false);
			}
		},
		onPressShowSelectedQuotes: function (oEvent) {
			var length = this.getView().getModel("viewData").getData().SelectedQuotes.length;
			if (!this._oDialogQuotes) {
				this._oDialogQuotes = new sap.m.Dialog({
					title: "Selected Quotes (" + length + ")",
					icon: "sap-icon://complete",
					content: new sap.m.List({
						items: {
							path: 'viewData>/SelectedQuotes',
							template: new sap.m.StandardListItem({
								title: "{viewData>VBELN}"
							})
						}
					}),
					beginButton: new sap.m.Button({
						text: 'Export',
						press: function () {
							this.ExportQuotes();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: 'Close',
						press: function () {
							this._oDialogQuotes.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this._oDialogQuotes);
			}

			this._oDialogQuotes.setTitle("Selected Quotes (" + length + ")");
			this._oDialogQuotes.open();

			/*this.pressDialog.open();
			var controller = this;
			if (!controller._oDialogContracts) {
				controller._oDialogContracts = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.ContractsList", controller);
				controller.getView().addDependent(controller._oDialogContracts);
			}
			controller._oDialogContracts.open();*/
		},
		onPressCloseQuotesList: function (oEvent) {
			this._oDialogQuotes.close();
		},
		handleIconTabBarSelect: function (oEvent) {
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			if (key === "Tab_Equipments" || key === "Tab_Contracts" || key === "Tab_Quotes" || key === "Tab_FL" || key === "Tab_ZONC" || key ===
				"Tab_CMR_DMR") {
				this.getView().byId("id_cont_gu_eq_fl_personalize").setVisible(true);
				this.getView().byId("id_cont_gu_eq_fl_col_width").setVisible(true);
				this.getView().byId("id_cont_gu_eq_fl_excel").setVisible(true);
				this.getView().byId("id_cont_gu_eq_fl_apply").setVisible(true);
			} else {
				this.getView().byId("id_cont_gu_eq_fl_personalize").setVisible(false);
				this.getView().byId("id_cont_gu_eq_fl_col_width").setVisible(false);
				this.getView().byId("id_cont_gu_eq_fl_excel").setVisible(false);
				this.getView().byId("id_cont_gu_eq_fl_apply").setVisible(false);
			}
			if (key === "Tab_FL") {
				this.getView().byId("id_fl_create_copy").setVisible(true);
			} else {
				this.getView().byId("id_fl_create_copy").setVisible(false);
			}
		},

		createColumnConfig_eq: function () {
			var aCols = [];
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			var oTable = this.getView().byId("id_gu_equip_table");
			if (key === "Tab_Equipments") {
				oTable = this.getView().byId("id_gu_equip_table");
			} else if (key === "Tab_Contracts") {
				oTable = this.getView().byId("id_zcontract_db_tbl_upf");
			} else if (key === "Tab_Quotes") {
				oTable = this.getView().byId("id_zcontract_db_q_tbl_upf");
			} else if (key === "Tab_FL") {
				oTable = this.getView().byId("id_gu_fl_table");
			} else if (key === "Tab_ZONC") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_upf");
			}

			var cols = oTable.getColumns();
			if (key === "Tab_FL") {
				for (var k = 0; k < cols.length; k++) {
					if (cols[k].getVisible()) {
						var obj = {};
						obj.label = cols[k].getAggregation("label").getProperty("text");
						if (obj.label !== "Copy") {

							obj.type = "string";
							if (cols[k].getProperty("filterProperty") !== undefined) {
								obj.property = cols[k].getProperty("filterProperty");
							}
							aCols.push(obj);
						}
					}
				}
			} else {
				for (var k = 0; k < cols.length; k++) {
					if (cols[k].getVisible()) {
						var obj = {};
						obj.label = cols[k].getAggregation("label").getProperty("text");
						obj.type = "string";
						if (cols[k].getProperty("filterProperty") !== undefined) {
							obj.property = cols[k].getProperty("filterProperty");
						}
						aCols.push(obj);

					}
				}
			}

			return aCols;
		},
		onExportToExcel: function () {
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			var oTable = this.getView().byId("id_gu_equip_table");
			if (key === "Tab_Equipments") {
				oTable = this.getView().byId("id_gu_equip_table");
			} else if (key === "Tab_Contracts") {
				oTable = this.getView().byId("id_zcontract_db_tbl_upf");
			} else if (key === "Tab_Quotes") {
				oTable = this.getView().byId("id_zcontract_db_q_tbl_upf");
			} else if (key === "Tab_FL") {
				oTable = this.getView().byId("id_gu_fl_table");
			} else if (key === "Tab_ZONC") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_upf");
			} else if (key === "Tab_CMR_DMR") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_cmr_dmr");
			}
			var aCols, oSettings, oSheet;
			aCols = this.createColumnConfig_eq();
			var dataSource = oTable.getModel().getData();
			if (dataSource === null) {
				dataSource = [];
			}
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
		onPressResizeHorizontal: function (oEvent) {

			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			var oTable = this.getView().byId("id_gu_equip_table");
			if (key === "Tab_Equipments") {
				oTable = this.getView().byId("id_gu_equip_table");
			} else if (key === "Tab_Contracts") {
				oTable = this.getView().byId("id_zcontract_db_tbl_upf");
			} else if (key === "Tab_Quotes") {
				oTable = this.getView().byId("id_zcontract_db_q_tbl_upf");
			} else if (key === "Tab_FL") {
				oTable = this.getView().byId("id_gu_fl_table");
			} else if (key === "Tab_ZONC") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_upf");
			} else if (key === "Tab_CMR_DMR") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_cmr_dmr");
			}
			var cols = oTable.getColumns();
			for (var i = 0; i < cols.length; i++) {
				if (cols[i] !== undefined) {
					cols[i].setAutoResizable(true);
					oTable.autoResizeColumn(i);
				}
			}
		},
		handlePressPersonalize: function (oEvent) {

			// Open the Table Setting dialog
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(
					"ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.PersonalizationDialog", this);
				this.getView().addDependent(this._oDialog, this);

			}
			var columnCollection = [];
			var cols = this._oTableColumns_EQ;

			var oTableCols = this.getView().byId("id_gu_equip_table").getColumns();
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			if (key === "Tab_Equipments") {
				oTableCols = this.getView().byId("id_gu_equip_table").getColumns();
				cols = this._oTableColumns_EQ;
			} else if (key === "Tab_Contracts") {
				oTableCols = this.getView().byId("id_zcontract_db_tbl_upf").getColumns();
				cols = this._oTableColumns_C;
			} else if (key === "Tab_Quotes") {
				oTableCols = this.getView().byId("id_zcontract_db_q_tbl_upf").getColumns();
				cols = this._oTableColumns_Q;
			} else if (key === "Tab_FL") {
				oTableCols = this.getView().byId("id_gu_fl_table").getColumns();
				cols = this._oTableColumns_FL;
			} else if (key === "Tab_ZONC") {
				oTableCols = this.getView().byId("id_zcontract_db_zonc_tbl_upf").getColumns;
				cols = this._oTableColumns_ZONC;
			} else if (key === "Tab_CMR_DMR") {
				oTableCols = this.getView().byId("id_zcontract_db_zonc_tbl_dmr_dmr").getColumns;
				cols = this._oTableColumns_CMR_DMR;
			}
			//First add existing columns from Table
			for (var a = 1; a < oTableCols.length; a++) {
				var obj = {};
				//obj.columnKey = oTableCols[a].getAggregation("template").getBindingInfo("text").parts[0].path;
				obj.columnKey = oTableCols[a].getProperty("filterProperty");
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
					obj1.columnKey = cols[b].getProperty("filterProperty");
					obj1.text = cols[b].getAggregation("label").getProperty("text");
					obj1.visible = false;
					columnCollection.push(obj1);
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
		updateLayout: function (selectedColumns) {

			var oView = this.getView();
			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			var oTable = this.getView().byId("id_gu_equip_table");
			var temp = this._oTableColumns_EQ;
			if (key === "Tab_Equipments") {
				oTable = this.getView().byId("id_gu_equip_table");
				temp = this._oTableColumns_EQ;
			} else if (key === "Tab_Contracts") {
				oTable = this.getView().byId("id_zcontract_db_tbl_upf");
				temp = this._oTableColumns_C;
			} else if (key === "Tab_Quotes") {
				oTable = this.getView().byId("id_zcontract_db_q_tbl_upf");
				temp = this._oTableColumns_Q;
			} else if (key === "Tab_FL") {
				oTable = this.getView().byId("id_gu_fl_table");
				temp = this._oTableColumns_FL;
			} else if (key === "Tab_ZONC") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_upf");
				temp = this._oTableColumns_ZONC;
			} else if (key === "Tab_CMR_DMR") {
				oTable = this.getView().byId("id_zcontract_db_zonc_tbl_cmr_dmr");
				temp = this._oTableColumns_CMR_DMR;
			}

			oTable.removeAllColumns();
			oTable.addColumn(temp[0]);
			for (var i = 0; i < selectedColumns.length; i++) {
				for (var k = 1; k < temp.length; k++) {
					if (temp[k].getProperty("filterProperty") !== undefined) {
						if ((selectedColumns[i].columnKey ===
								temp[k].getProperty("filterProperty"))) {
							oTable.insertColumn(temp[k], oTable.getColumns().length);
							var index = oTable.getColumns().length - 1;
							oTable.getColumns()[index].setVisible(selectedColumns[i].visible);
							break;
						}

					} else if (temp[k].getAggregation("template").getBindingInfo("selected") !== undefined) {
						if ((selectedColumns[i].columnKey ===
								temp[k].getProperty("filterProperty"))) {
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
		onPressGlobalUpdate: function (oEvent) {

			var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
			var documents_count = 0;
			var controller = this;
			controller._Batch_Mode = false;
			var all_3_fields_true = 0;
			var smartFilterBarData = this.getView().byId("id_fb_gu_contracts_header").getFilterData();
			if (smartFilterBarData["Cancellation_Code"] === undefined) {
				all_3_fields_true = 1;
			}
			//Fetch date Fields
			var dateFields = [{
				key: "Cancellation_Date",
				id: "id_inp_gu_c_cancellation_date"
			}, {
				key: "Receipt_Of_Cancellation",
				id: "id_inp_gu_c_receipt_of_cancellation"
			}];
			for (var i = 0; i < dateFields.length; i++) {
				var value = controller.getView().byId(dateFields[i].id).getValue();
				if (value === "") {
					all_3_fields_true = all_3_fields_true + 1;
				}
			}

			if (key === "Tab_Contracts") {
				this.updateType = "Contracts";
				documents_count = this.getView().getModel("viewData").getData().SelectedContracts.length;
			} else if (key === "Tab_Quotes") {
				this.updateType = "Quotes";
				documents_count = this.getView().getModel("viewData").getData().SelectedQuotes.length;
			} else if (key === "Tab_ZONC") {
				this.updateType = "ZONC";
				documents_count = this.getView().getModel("viewData").getData().SelectedZONC.length;
			} else if (key === "Tab_CMR_DMR") {
				this.updateType = "CMR_DMR";
				documents_count = this.getView().getModel("viewData").getData().SelectedCMR_DMR.length;
			} else if (key === "Tab_Equipments") {
				var eqp_data = this.getView().byId("id_gu_equip_table").getModel().getData();
				var eqp_results = [];
				this.eqp_results = [];
				for (i = 0; i < eqp_data.length; i++) {
					if (eqp_data[i].ValidFrom !== eqp_data[i].NewValidFrom ||
						eqp_data[i].LLFL !== eqp_data[i].NewLLFL ||
						eqp_data[i].SuperordEquip !== eqp_data[i].NewSuperordEquip ||
						eqp_data[i].SalesOrg !== eqp_data[i].NewSalesOrg ||
						eqp_data[i].CompanyCode !== eqp_data[i].NewCompanyCode ||
						eqp_data[i].SalesOrder !== eqp_data[i].NewSalesOrder ||
						eqp_data[i].IneligibilityCode !== eqp_data[i].NewIneligibilityCode ||
						eqp_data[i].AssetLocation !== eqp_data[i].NewAssetLocation ||
						eqp_data[i].EntitledParty !== eqp_data[i].NewEntitledParty ||
						eqp_data[i].PSP !== eqp_data[i].NewPSP ||
						eqp_data[i].EqpStatus !== eqp_data[i].NewEqpStatus ||
						eqp_data[i].ExclusionDate !== eqp_data[i].NewExclusionDate
					) {
						delete eqp_data[i].__metadata;
						eqp_results.push(eqp_data[i]);
					}
				}
				documents_count = eqp_results.length;
				this.eqp_results = eqp_results;
			} else if (key === "Tab_FL") {
				var fl_data = this.getView().byId("id_gu_fl_table").getModel().getData();
				var fl_results = [];
				this.fl_results = [];
				for (i = 0; i < fl_data.length; i++) {
					if (fl_data[i].EndCustomer !== fl_data[i].NewEndCustomer ||
						fl_data[i].T2Reseller !== fl_data[i].NewT2Reseller ||
						fl_data[i].SuperiorFLOC !== fl_data[i].NewSuperiorFLOC ||
						fl_data[i].TPLNR_DESC !== fl_data[i].NewTPLNR_DESC ||
						fl_data[i].RenameFL !== "" ||
						/*SOC szanzaney SRE2524*/
						fl_data[i].Language !== fl_data[i].Language1
						/*EOC szanzaney SRE2524*/
					) {
						delete fl_data[i].__metadata;
						fl_results.push(fl_data[i]);
					}
				}
				documents_count = fl_results.length;
				this.fl_results = fl_results;
			}
			if (documents_count === 0) {
				if (key === "Tab_Contracts" || key === "Tab_Quotes" || key === "Tab_ZONC" || key === "Tab_CMR_DMR") {
					sap.m.MessageBox.show(
						"Select Documents To Proceed", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				} else if (key === "Tab_Equipments" || key === "Tab_FL") {
					sap.m.MessageBox.show(
						"No Changes Recorded on screen...!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
			} else {

				if (key === "Tab_Contracts" || key === "Tab_Quotes") {
					if (all_3_fields_true === 1 || all_3_fields_true === 2) {
						sap.m.MessageBox.show(
							"All Cancellation Reason/Cancellation Date/Receipt of Cancellation are required", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
					} else {
						if (all_3_fields_true === 0) {
							this.getView().byId("id_inp_gu_c_clear_action_data").setSelected(true);
						}
						//this._DOC_LIMIT = "0"; //testing
						if (documents_count > +Number(this._DOC_LIMIT)) {
							controller._Batch_Mode = true;
							controller.onpressJobOpen();
						} else {
							this._Batch_Mode = false;
							if (key === "Tab_Contracts") {
								this.handle_Global_Update_Contracts();
							} else if (key === "Tab_Quotes") {
								this.handle_Global_Update_Quotes();
							}
						}
					}
				} else if (key === "Tab_Equipments") {
					if (documents_count > +Number(this._DOC_LIMIT)) {
						controller._Batch_Mode = true;
						controller.onpressJobOpen();
					} else {
						this._Batch_Mode = false;
						this.handle_Global_Update_Equipments();
					}

				} else if (key === "Tab_FL") {
					/*SOC szanzaney SRE2524*/
					var fl_data = this.getView().byId("id_gu_fl_table").getModel().getData();
					/*	var LanguageLogon = controller.getView().getModel("viewData").getProperty("/LanguageLogon");*/
					this.BlankLanguage = [];
					for (i = 0; i < fl_data.length; i++) {

						if (fl_data[i].Language !== "E" && fl_data[i].Language !== fl_data[0].Language1) {
							this.BlankLanguage.push(fl_data[i].Language);

						}
					}
					if (this.BlankLanguage.length > 0) {
						sap.m.MessageBox.show(
							"Please ensure that all the Language fields are maintained as either E or local language", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK]
							});
					} else {
						/*EOC szanzaney SRE2524*/
						if (documents_count > +Number(this._DOC_LIMIT)) {
							controller._Batch_Mode = true;
							controller.onpressJobOpen();
						} else {
							this._Batch_Mode = false;
							this.handle_Global_Update_FL();
						}
					}

				} else if (key === "Tab_ZONC") {
					if (documents_count > +Number(this._DOC_LIMIT)) {
						controller._Batch_Mode = true;
						controller.onpressJobOpen();
					} else {
						this._Batch_Mode = false;
						this.handle_Global_Update_ZONC();
					}

				} else if (key === "Tab_CMR_DMR") {
					if (documents_count > +Number(this._DOC_LIMIT)) {
						controller._Batch_Mode = true;
						controller.onpressJobOpen();
					} else {
						this._Batch_Mode = false;
						this.handle_Global_Update_CMR_DMR();
					}

				}
			}
		},
		//BOI AKADAM04N2019+
		onProceed_1251: function () {
			var index = this._dialog_Response_For_1251.getContent()[1].getAggregation("items")[0].getSelectedIndex();
			var Response_For_1251 = "";
			if (index === 0) {
				Response_For_1251 = "TRIGGER_CREATE_CASE_ID";
			} else if (index === 1) {
				Response_For_1251 = "TRIGGER_REJECT_QUOTE";
			} else if (index === 2) {
				Response_For_1251 = "TRIGGER_RETAIN_QUOTE";
			}
			var contracts = this.requestBody.to_contracts;
			for (var i = 0; i < contracts.length; i++) {
				if (contracts[i].Relevant_For_1251 === true) {
					contracts[i].Response_For_1251 = Response_For_1251;
				}
			}
			this.requestBody.Relevant_For_1251 = this.Relevant_For_1251 ? "X" : "";
			this.requestBody.Response_For_1251 = Response_For_1251;
			this.call_service_update_contract();
			this._dialog_Response_For_1251.close();
		},
		onCancel_1251: function () {
			this._dialog_Response_For_1251.close();
		},
		call_service_update_CMR_DMR: function () {

			var oModel = this.getOwnerComponent().getModel();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Global_Update_CMR_DMR";
			var controller = this;
			oModel.create(path,
				this.requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						if (data.to_messages !== null) {
							controller.updateLogData = data.to_messages.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog.setModel(oModel1);

							if (data.to_messages.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(data.to_messages.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(7);
							}
							controller._updateLog.open();
						} else {
							sap.m.MessageBox.show(
								"No Updates Performed..!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
						//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
						controller.clrValues();
						if (controller.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().getData()) {
							controller.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().setData([]);
						}
						//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
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
		//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
		clrValues: function () {
			var id = ["id_fb_gu_contracts_header", "id_fb_gu_contracts_partners", "id_fb_gu_contracts_clr_partners",
				"id_fb_gu_contracts_header_clear", "id_fb_gu_quotes_header",
				"id_fb_gu_quotes_partners", "id_fb_gu_quotes_clr_partners", "id_fb_gu_quotes_header_clear",
				"id_fb_gu_zonc_header", "id_fb_gu_zonc_partners", "id_fb_gu_cmr_dmr_header", "id_fb_gu_memos_main", "id_fb_gu_zonc_main"
			];
			var key, configControl, smartFilter;
			for (var j = 0; j < id.length; j++) {
				smartFilter = this.getView().byId(id[j]);
				configControl = smartFilter.getControlConfiguration();
				for (var i = 0; i < configControl.length; i++) {
					key = configControl[i].getKey();
					smartFilter.clear();
					try {
						if (smartFilter.getControlByKey(key).getSelectedKey() !== "") {
							smartFilter.getControlByKey(key).setSelectedKey("1");
						} else {
							smartFilter.getControlByKey(key).setValue("");
						}
					} catch (err) {
						try {
							smartFilter.getControlByKey(key).setSelected(false);
						} catch (err) {
							smartFilter.getControlByKey(key).setValue("");
						}
					}

				};
			};
		},
		//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
		//MSA1 BOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
		comboEdit: function (smartFilter) {
			var key, configControl, msg;
			var values = [];
			this.comboMsg = false;
			configControl = smartFilter.getControlConfiguration();
			for (var i = 0; i < configControl.length; i++) {
				key = configControl[i].getKey();
				if (configControl[i].getControlType() === "dropDownList") {
					if (smartFilter.getControlByKey(key).getSelectedKey() === "" && smartFilter.getControlByKey(key).getValue() !== "") {
						var labels = smartFilter.getControlByKey(key).getLabels()[0].getTooltip();
						values.push(labels);
					}
				}
			};
			if (values.length > 0) {
				this.comboMsg = true;
				msg = values + " " + "Dropdown can't be edited, select any one value from the dropdown";
				sap.m.MessageBox.show(
					msg, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
		},
		//MSA1 EOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
		call_service_update_zonc: function () {

			var oModel = this.getOwnerComponent().getModel();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Global_Update_ZONC";
			var controller = this;
			oModel.create(path,
				this.requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						if (data.to_messages !== null) {
							controller.updateLogData = data.to_messages.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog.setModel(oModel1);

							if (data.to_messages.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(data.to_messages.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(7);
							}
							controller._updateLog.open();
						} else {
							sap.m.MessageBox.show(
								"No Updates Performed..!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
						//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
						controller.clrValues();
						if (controller.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().getData()) {
							controller.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().setData([]);
						}
						//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
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
		call_service_update_contract: function () {

			var oModel = this.getOwnerComponent().getModel();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Global_Update_Contracts";
			var controller = this;
			oModel.create(path,
				this.requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						if (data.to_messages !== null) {
							controller.updateLogData = data.to_messages.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog.setModel(oModel1);

							if (data.to_messages.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(data.to_messages.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(7);
							}
							controller._updateLog.open();
							controller.onpressCRetrieve();
						} else {
							sap.m.MessageBox.show(
								"No Updates Performed..!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
						//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
						controller.clrValues();
						controller.getView().byId("id_fb_gu_contracts_main").clear();
						controller.getView().getModel("viewData").setProperty("/UpdateHeadeText", [{
							Append: true
						}]);
						controller.getView().byId("id_zcontract_db_tbl_UPHT").removeSelections();
						if (controller.getView().byId("id_zcontract_db_tbl_upf").getModel().getData()) {
							controller.getView().byId("id_zcontract_db_tbl_upf").getModel().setData([]);
						}
						if (controller.getView().byId("id_zinvoice_db_tbl_upf").getModel().getData()) {
							controller.getView().byId("id_zinvoice_db_tbl_upf").getModel().setData([]);
						}
						if (controller.getView().byId("id_zcontract_db_tbl_equalBilling").getModel().getData()) {
							controller.getView().byId("id_zcontract_db_tbl_equalBilling").getModel().setData([]);
						}
						//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
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
		//EOI AKADAM04NOV2019+
		onpressAddNewRow_upht: function (oEvent) {
			var j = {
				Append: true
			};
			var k = this.getView().getModel("viewData").getProperty("/UpdateHeadeText");
			k.push(j);
			this.getView().getModel("viewData").setProperty("/UpdateHeadeText", k);
		},
		onpressAddNewRow_upht_q: function (oEvent) {
			var j = {
				Append: true
			};
			var k = this.getView().getModel("viewData").getProperty("/UpdateHeadeText_q");
			k.push(j);
			this.getView().getModel("viewData").setProperty("/UpdateHeadeText_q", k);
		},
		onSelectAction: function (oEvent) {

		},
		handle_Global_Update_FL: function (oEvent) {
			var requestBody = {
				TPLNR: "9999999999",
				Batch_Mode: this._Batch_Mode,
				Email: this._EMAIL,
				to_modify_floc: this.fl_results,
				to_messages: []
			};

			var oModel = this.getOwnerComponent().getModel();
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Global_Update_FL";
			var controller = this;
			oModel.create(path,
				requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						if (data.to_messages !== null) {
							controller.updateLogData = data.to_messages.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog_FL.setModel(oModel1);

							if (data.to_messages.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog_FL").setVisibleRowCount(data.to_messages.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog_FL").setVisibleRowCount(7);
							}
							controller._updateLog_FL.open();
						} else {
							sap.m.MessageBox.show(
								"No Updates performed...!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
						}
						//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
						controller.getView().byId("id_fb_gu_fl_main").clear();
						controller.getView().byId("id_gu_fl_table").getModel().setData([]);
						//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
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
		handle_Global_Update_Equipments: function (oEvent) {
			var requestBody = {
				Equipment_Number: "9999999999",
				Batch_Mode: this._Batch_Mode,
				Email: this._EMAIL,
				to_modify_eqp: this.eqp_results,
				to_messages: []
			};
			// BOI 2483 1.7
			var oModel = this.getOwnerComponent().getModel();
			sap.ui.getCore().setModel(oModel, "eqpUpdModel");
			var tabData = this.getView().byId("id_gu_equip_table").getSelectedIndices();
			var x;
			var vContinue = " ";
			// var tabAllData	= = this.getView().byId("id_gu_equip_table")
			var objData = [];
			var aRowsData = this.getView().byId("id_gu_equip_table").getModel().getData();
			for (var i = 0; i < aRowsData.length; i++) {

				var vNewLlfl = aRowsData[i].NewLLFL;
				var vLlfl = aRowsData[i].LLFL;
				var vNewSupEqp = aRowsData[i].NewSuperordEquip;
				var vSupEqp = aRowsData[i].SuperordEquip;
				if (vNewLlfl !== vLlfl && vNewSupEqp !== "" && vSupEqp !== "") {
					vContinue = "x";
					if (!this._oDialogUpEqW) {
						this._oDialogUpEqW = sap.ui.xmlfragment(
							"ZSA_CONTRACT_DB_V3.ZSA_CONTRACT_DB_V3.fragments.UpdateEqpWarning", this);
						this.getView().addDependent(this._oDialogUpEqW, this);
					}

					this._oDialogUpEqW.open();
					return;
				}
				if (vNewLlfl !== vLlfl && vNewSupEqp !== vSupEqp) {
					vContinue = "x";
					if (!this._oDialogUpdEQ) {
						this._oDialogUpdEQ = sap.ui.xmlfragment(
							"ZSA_CONTRACT_DB_V3.ZSA_CONTRACT_DB_V3.fragments.UpdateEqpError", this);
						this.getView().addDependent(this._oDialogUpdEQ, this);
					}
					this._oDialogUpdEQ.open();
					return;
				}
			}
			// EOI 2483 1.7
			if (vContinue !== "x") {
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var path = "/Ets_Global_Update_Equipment";
				var controller = this;
				oModel.create(path,
					requestBody, {
						success: function (data, response) {
							oGlobalBusyDialog.close();
							if (data.to_messages !== null) {
								controller.updateLogData = data.to_messages.results;
								var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
								controller._updateLog_EQ.setModel(oModel1);

								if (data.to_messages.results.length < 7) {
									sap.ui.getCore().byId("id_cmd_updateLog_EQ").setVisibleRowCount(data.to_messages.results.length);
								} else {
									sap.ui.getCore().byId("id_cmd_updateLog_EQ").setVisibleRowCount(7);
								}
								controller._updateLog_EQ.open();
							} else {
								sap.m.MessageBox.show(
									"No Updates performed...!!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							}
							//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
							controller.getView().byId("id_gu_equip_table").getModel().setData([]);
							controller.getView().byId("id_fb_gu_equipments_main").clear();
							controller.getView().byId("id_fb_gu_equipments_main").getControlByKey("Child_equip").setSelected(false);
							controller.getView().byId("id_fb_gu_equipments_main").getControlByKey("Superior_equip").setSelected(false);
							//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
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
		handle_Global_Update_CMR_DMR: function (oEvent) {
			//MSA1 BOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
			var smartFilter = this.getView().byId("id_fb_gu_cmr_dmr_header");
			this.comboEdit(smartFilter);
			if (!this.comboMsg) {
				//MSA1 EOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
				var requestBody = {
					Document: "9999999",
					Rejection_Code: "",
					Billing_Block: "",
					Remove_Billing_Block: this.getView().byId("id_inp_gu_cmr_dmr_remove_billing_block").getSelected() ? "X" : "",
					Batch_Mode: this._Batch_Mode,
					Email: this._EMAIL,
					to_documents: [],
					to_items: [],
					to_messages: []
				};

				if (this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().getData() !== null) {
					requestBody.to_items = this.getView().byId("id_zcontract_db_tbl_cmr_dmr").getModel().getData();
				} else {
					requestBody.to_items = [];
				}

				//Fetch all contracts First-
				requestBody.to_documents = this.getView().getModel("viewData").getData().SelectedCMR_DMR;

				//Fetch Header Fields
				var smartFilterBar = this.getView().byId("id_fb_gu_cmr_dmr_header");
				for (var key in smartFilterBar.getFilterData()) {
					requestBody[key] = smartFilterBar.getFilterData()[key];
				}

				var changes_made = false;
				if (JSON.stringify(requestBody) !== JSON.stringify(this.requestBody_CMR_DMR_initial)) {
					changes_made = true;
				}
				if (changes_made) {
					requestBody.to_documents = this.getView().getModel("viewData").getData().SelectedCMR_DMR;
					this.requestBody = requestBody;
					this.call_service_update_CMR_DMR();
				} else {
					sap.m.MessageBox.show(
						"No Changes Recorded on Screen..!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}

			} //MSA1  5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
		},
		handle_Global_Update_ZONC: function (oEvent) {
			//MSA1 BOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
			var smartFilter = this.getView().byId("id_fb_gu_zonc_header");
			this.comboEdit(smartFilter);
			if (!this.comboMsg) {
				//MSA1 EOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
				var requestBody = {
					Document: "9999999",
					PO: "",
					Rejection_Code: "",
					SMC: "",
					Rejection_Code_Items: "",
					Billing_Block: "",
					Delivery_Block: "",
					Remove_Billing_Block: this.getView().byId("id_inp_gu_zonc_remove_billing_block").getSelected() ? "X" : "",
					Remove_Delivery_Block: this.getView().byId("id_inp_gu_zonc_remove_delivery_block").getSelected() ? "X" : "",
					Purchase_Agrmnt_ID: "",
					PO_End_Date: "",
					Reseller_PO: "",
					Cust_Grp2: "",
					Cust_Grp3: "",
					Cust_Grp4: "",
					Bill_To: "",
					Payer: "",
					T2_Reseller: "",
					End_Customer: "",
					Entitled_Party: "",
					Asset_Location: "",
					Systems_Manager_Contact: "",
					Systems_Manager_Backup_Contact: "",
					Invoicing_Contact: "",
					Sold_To_Contact: "",
					Reseller_Contact: "",
					Entitled_Party_Contact: "",
					Bill_To_Contact: "",
					Contract_Admin_Contact: "",
					Global_Operations: "",
					HPE_Sales_Rep_Contact: "",
					/*SOC szanzaney SRE2524*/
					HPEBusInd: "",
					PaymentDue: "",
					/*EOC szanzaney SRE2524*/
					Batch_Mode: this._Batch_Mode,
					Email: this._EMAIL,
					to_documents: [],
					to_messages: [],
					to_items: [] //LR1 changes by Aniket ,
				};

				//Fetch all contracts First-
				requestBody.to_documents = this.getView().getModel("viewData").getData().SelectedZONC;

				//Fetch Header Fields
				var smartFilterBar = this.getView().byId("id_fb_gu_zonc_header");
				for (var key in smartFilterBar.getFilterData()) {
					requestBody[key] = smartFilterBar.getFilterData()[key];
				}

				//Fetch Partner Fields
				var smartFilterBar_partner = this.getView().byId("id_fb_gu_zonc_partners");
				for (key in smartFilterBar_partner.getFilterData()) {
					requestBody[key] = smartFilterBar_partner.getFilterData()[key];
				}
				//Fetch date Fields
				var dateFields = [{
					key: "PO_End_Date",
					id: "id_inp_gu_zonc_po_end_date"
				}];

				var controller = this;
				for (var i = 0; i < dateFields.length; i++) {
					var value = controller.getView().byId(dateFields[i].id).getValue();
					if (value !== "") {
						requestBody[dateFields[i].key] = value.substring(6) + value.substring(3, 5) + value.substring(0, 2);
					}

				}

				//Fetch Update Partner Function(Item)
				if (this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().getData() !== null) {
					requestBody.to_items = this.getView().byId("id_zcontract_db_zonc_tbl_upf").getModel().getData();
				} else {
					requestBody.to_items = [];
				}

				//BOI AKADAMSEP2019+
				var changes_made = false;
				if (JSON.stringify(requestBody) !== JSON.stringify(this.requestBody_ZONC_initial)) {
					changes_made = true;
				}
				if (changes_made) {
					requestBody.to_documents = this.getView().getModel("viewData").getData().SelectedZONC;
					this.requestBody = requestBody;
					this.call_service_update_zonc();
				} else {
					sap.m.MessageBox.show(
						"No Changes Recorded on Screen..!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
			} //MSA1  5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
		},
		handle_Global_Update_Contracts: function (oEvent) {
			//MSA1 BOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
			var smartFilter = this.getView().byId("id_fb_gu_contracts_header");
			this.comboEdit(smartFilter);
			if (!this.comboMsg) {
				//MSA1 EOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
				var requestBody = {
					Contract_Number: "9999999",
					// PO: "",
					PO: this.getView().byId("id_inp_gu_c_po").getValue(), //EOC INC0281308 restricting length to 35 char as per incident ++VSINGH
					Cancellation_Code: "",
					Cancellation_Date: "",
					Receipt_Of_Cancellation: "",
					Rejection_Code: "",
					Action_Code: "",
					Action_Date: "",
					SMC: "",
					Rejection_Code_Items: "",
					Group_Contract: "",
					PO_Acceptance_Date: "",
					Payment_Terms: "",
					Billing_Block: "",
					Delivery_Block: "",
					Remove_Billing_Block: this.getView().byId("id_inp_gu_c_remove_billing_block").getSelected() ? "X" : "",
					Remove_Delivery_Block: this.getView().byId("id_inp_gu_c_remove_delivery_block").getSelected() ? "X" : "",
					Clear_Action_Data: this.getView().byId("id_inp_gu_c_clear_action_data").getSelected() ? true : false,
					Billing_Cycle: "",
					Billing_Plan_Type: "",
					Contract_Status: "",
					Usage_Indicator: "",
					Renewal_Status: "",
					Header_Text: this.getView().byId("id_inp_gu_c_header_text").getValue(),
					Bill_To: "",
					Payer: "",
					T2_Reseller: "",
					End_Customer: "",
					Entitled_Party: "",
					Asset_Location: "",
					PSP_Partner: "",
					Systems_Manager_Contact: "",
					Systems_Manager_Backup_Contact: "",
					Software_Delivery_Contact: "",
					Invoicing_Contact: "",
					Sold_To_Contact: "",
					Reseller_Contact: "",
					Entitled_Party_Contact: "",
					Delivery_Contact: "",
					Backup_Delivery_Contact: "",
					Batch_Mode: this._Batch_Mode,
					Email: this._EMAIL,
					Web_Enabled: "",
					Relevant_For_1251: "", //AKADAM04NOV2019+
					Response_For_1251: "", //AKADAM04NOV2019+
					//	CSSA_Number: "", //BOC INC0309257 DEVK9A0SM7  26 Apr 2021  restricting length to 10 char as per incident ++VSINGH Comment it
					CSSA_Number: this.getView().byId("id_inp_gu_c_cssa_no").getValue(), //EOC INC0309257 DEVK9A0SM7  26 Apr 2021  restricting length to 10 char as per incident ++VSINGH
					Purchase_Agrmnt_ID: "",
					chanel_Agrmnt_ID: this.getView().byId("id_inp_gu_c_chanel_Agrmnt_ID").getValue(), //VSINGH SRI3197
					PO_End_Date: "",
					Reseller_PO: "",
					Cust_Grp2: "",
					Cust_Grp3: "",
					Cust_Grp4: "",
					Third_Party_Info: "",
					Clr_Cancellation_Reason: this.getView().byId("id_inp_gu_c_remove_canc_reasn").getSelected() ? true : false,
					//Clr_Cancellation_Date: this.getView().byId("id_inp_gu_c_remove_canc_date").getSelected() ? true : false,
					//Clr_Receipt_Cancel: this.getView().byId("id_inp_gu_c_remove_reciept_canc").getSelected() ? true : false,
					Clr_Group_Contract: this.getView().byId("id_inp_gu_c_remove_grp_contrct").getSelected() ? true : false,
					Clr_Po_Accept_Date: this.getView().byId("id_inp_gu_c_remove_po_accptnce_dt").getSelected() ? true : false,
					Clr_Po_End_Date: this.getView().byId("id_inp_gu_c_remove_po_end_dt").getSelected() ? true : false,
					Clr_Reseller_Po: this.getView().byId("id_inp_gu_c_remove_resllr_po").getSelected() ? true : false,
					Clr_Cust_Grp2: this.getView().byId("id_inp_gu_c_remove_cust_grp2").getSelected() ? true : false,
					Clr_Usage_Ind: this.getView().byId("id_inp_gu_c_remove_usage_ind").getSelected() ? true : false,
					Clr_Header_Txt: this.getView().byId("id_inp_gu_c_remove_header_txt").getSelected() ? true : false,
					Clr_Cssa: this.getView().byId("id_inp_gu_c_remove_cssa").getSelected() ? true : false,
					Clr_Third_Prt_Info: this.getView().byId("id_inp_gu_c_remove_third_prt_info").getSelected() ? true : false,
					Attachment_Flag: this.getView().byId("id_inp_gu_c_attachment_flag").getSelectedItem().getProperty("text"),
					Invoice_Flag: this.getView().byId("id_inp_gu_c_invoice_flag").getSelectedItem().getProperty("text"),
					Web_Ivc_Upld: this.getView().byId("id_inp_gu_c_web_ivc_upld").getSelectedItem().getProperty("text"),
					Clr_T2_Reseller: this.getView().byId("id_inp_c_Clr_T2_Reseller").getSelected() ? true : false,
					Clr_Systems_Manager_Contact: this.getView().byId("id_inp_c_Clr_Systems_Manager_Contact").getSelected() ? true : false,
					Clr_Systems_Manager_Backup_Contact: this.getView().byId("id_inp_c_Clr_Systems_Manager_Backup_Contact").getSelected() ? true : false,
					Clr_Software_Delivery_Contact: this.getView().byId("id_inp_c_Clr_Software_Delivery_Contact").getSelected() ? true : false,
					Clr_Invoicing_Contact: this.getView().byId("id_inp_c_Clr_Invoicing_Contact").getSelected() ? true : false,
					Clr_Reseller_Contact: this.getView().byId("id_inp_c_Clr_Reseller_Contact").getSelected() ? true : false,
					Clr_Backup_Delivery_Contact: this.getView().byId("id_inp_c_Clr_Backup_Delivery_Contact").getSelected() ? true : false,
					Clr_Bill_To_Contact: this.getView().byId("id_inp_c_Clr_Bill_To_Contact").getSelected() ? true : false,
					Clr_Global_Operations: this.getView().byId("id_inp_c_Clr_Global_Operations").getSelected() ? true : false,
					Clr_AOL_Contact: this.getView().byId("id_inp_c_Clr_AOL_Contact").getSelected() ? true : false,
					Clr_Install_Base_Sales_Rep: this.getView().byId("id_inp_c_Clr_Install_Base_Sales_Rep").getSelected() ? true : false,
					Clr_Partner_Service_Delivery_Manager: this.getView().byId("id_inp_c_Clr_Partner_Service_Delivery_Manager").getSelected() ? true : false,
					Clr_Global_Deals_Specialist: this.getView().byId("id_inp_c_Clr_Global_Deals_Specialist").getSelected() ? true : false,
					Clr_Admin_Signer: this.getView().byId("id_inp_c_Clr_Admin_Signer").getSelected() ? true : false,
					Clr_Response_Center_R1: this.getView().byId("id_inp_c_Clr_Response_Center_R1").getSelected() ? true : false,
					Clr_Response_Center_R2: this.getView().byId("id_inp_c_Clr_Response_Center_R2").getSelected() ? true : false,
					Clr_Response_Center_R3: this.getView().byId("id_inp_c_Clr_Response_Center_R3").getSelected() ? true : false,
					/*SOC szanzaney SRE2524*/
					Clr_Agent_Number: this.getView().byId("id_inp_c_Clr_Agent_Number").getSelected() ? true : false,
					/*EOC szanzaney SRE2524*/
					//Clr_Admin_Supervisor: this.getView().byId("id_inp_c_Clr_Admin_Supervisor").getSelected() ? true : false,
					Net_Value_Upgrade_Perc: this.getView().byId("id_inp_gu_c_Net_Value_Upgrade_Perc").getValue(), //SVERMA15 2522 20 July 2020
					to_contracts: [],
					to_messages: [],
					to_assetLocationChange: [],
					to_header_text: [], //LR1 changes by Aniket ,
					to_contract_psp: [], //LR1 changes by Aniket ,
					//*******START OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//
					to_contractbilling: []
						//*******END OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//
				};

				//*******START OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//

				var equalBillingTable = this.getView().byId("id_zcontract_db_tbl_equalBilling");
				var data = equalBillingTable.getModel("viewData").getProperty("/eqalBillingItem");
				var dataUserDefBilling = equalBillingTable.getModel("viewData").getProperty("/custBillingItem");
				var navBillingTable = [];
				var oUserDefBilling = this.getView().byId("id_zcontract_db_tbl_UserDefBilling");
				var oEqualBilling = this.getView().byId("id_zcontract_db_tbl_equalBilling");

				if (oEqualBilling.getVisible()) {

					//if records exist
					if (typeof data !== "undefined") {

						//get binding data
						for (var i = 0; i < data.length; i++) {

							//to prevert changing data with pass by ref
							const val = (typeof data[i] === 'object') ? Object.assign({}, data[i]) : data[i];

							//storing record in data to be passed to backend
							navBillingTable.push(val);
						}

						//remove unwanted fields
						for (var i = 0; i < navBillingTable.length; i++) {

							delete navBillingTable[i]["AMOUNT_CUST"];
							delete navBillingTable[i]["AMOUNT_USER"];
							//delete navBillingTable[i]["BILL_FLAG"];
							delete navBillingTable[i]["MESSAGE"];
							delete navBillingTable[i]["UIM_INFO"];
						}

						//add to nav property
						requestBody.to_contractbilling = navBillingTable;
					}
				} else if (oUserDefBilling.getVisible()) {

					//if records exist
					if (typeof dataUserDefBilling !== "undefined") {

						//get binding data
						for (var i = 0; i < dataUserDefBilling.length; i++) {

							//to prevert changing data with pass by ref
							const val = (typeof dataUserDefBilling[i] === 'object') ? Object.assign({}, dataUserDefBilling[i]) : dataUserDefBilling[i];

							//storing record in data to be passed to backend
							navBillingTable.push(val);
						}

						//check if for each contract, sum of billing amounts is 0
						var contractID = navBillingTable[0].VBELN;
						var sum = Number(navBillingTable[0].AMOUNT);
						var flagNotZero = 0;
						for (var i = 1; i < navBillingTable.length; i++) {
							if (navBillingTable[i].VBELN === contractID) {
								sum = sum + Number(navBillingTable[i].AMOUNT);
							} else {
								if (sum !== 0) {
									MessageBox.error("Sum of Billing Amounts for each contract should be 0!");
									return;
								} else {
									sum = sum + Number(navBillingTable[i].AMOUNT);
									contractID = navBillingTable[i].VBELN;
								}
							}
						}
						if (sum !== 0) {
							MessageBox.error("Sum of Billing Amounts for each contract should be 0!");
							return;
						}

						//make fields string
						for (var i = 0; i < navBillingTable.length; i++) {

							navBillingTable[i].AMOUNT = navBillingTable[i].AMOUNT.toString();
							navBillingTable[i].VBELN = navBillingTable[i].VBELN.toString();
							navBillingTable[i].BILL_FLAG = "C"; //navBillingTable[i].BILL_FLAG.toString();;
						}

						//add to nav property
						requestBody.to_contractbilling = navBillingTable;
					}
				}

				//*******END OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//

				//Fetch all contracts First-
				requestBody.to_contracts = this.getView().getModel("viewData").getData().SelectedContracts;

				//Fetch Header Fields
				var smartFilterBar = this.getView().byId("id_fb_gu_contracts_header");
				for (var key in smartFilterBar.getFilterData()) {
					requestBody[key] = smartFilterBar.getFilterData()[key];
				}

				//Fetch Partner Fields
				var smartFilterBar_partner = this.getView().byId("id_fb_gu_contracts_partners");
				for (key in smartFilterBar_partner.getFilterData()) {
					requestBody[key] = smartFilterBar_partner.getFilterData()[key];
				}
				//Fetch date Fields
				var dateFields = [{
					key: "Cancellation_Date",
					id: "id_inp_gu_c_cancellation_date"
				}, {
					key: "Receipt_Of_Cancellation",
					id: "id_inp_gu_c_receipt_of_cancellation"
				}, {
					key: "Action_Date",
					id: "id_inp_gu_c_action_date"
				}, {
					key: "PO_Acceptance_Date",
					id: "id_inp_gu_c_po_acceptance_date"
				}, {
					key: "PO_End_Date",
					id: "id_inp_gu_c_po_end_date"
				}];

				var controller = this;
				for (var i = 0; i < dateFields.length; i++) {
					var value = controller.getView().byId(dateFields[i].id).getValue();
					if (value !== "") {
						requestBody[dateFields[i].key] = value.substring(6) + value.substring(3, 5) + value.substring(0, 2);
					}

				}

				//Fetch Header Text Details
				var key = this.getView().byId("id_GU_IconTabBar").getSelectedKey();
				if (key === "Tab_Contracts") {
					var header_text = this.getView().getModel("viewData").getData().UpdateHeadeText;
					if (header_text !== undefined) {
						header_text.forEach(function (keys) {
							if (keys.Object_Id !== undefined) {
								keys.Obj_Id = keys.Object_Id.split("||")[0];
								keys.Text_Id = keys.Object_Id.split("||")[1];
							}
							delete keys.Object_Id;
						});
						requestBody.to_header_text = header_text;
					}
				}

				//Fetch Contract PSP (Update Partner Function(Item)
				this.item_partner_update = false;
				//if (this.getView().getModel("viewData").getData().ContractPSP !== undefined) {
				if (this.getView().byId("id_zcontract_db_tbl_upf").getModel().getData() !== null) {
					requestBody.to_contract_psp = this.getView().byId("id_zcontract_db_tbl_upf").getModel().getData();
					var item_partners = this.getView().byId("id_zcontract_db_tbl_upf").getModel().getData();
					for (var i = 0; i < item_partners.length; i++) {
						if (item_partners[i].Curr_Psp !== item_partners[i].New_Psp ||
							item_partners[i].Curr_Sub_Psp !== item_partners[i].New_Sub_psp ||
							item_partners[i].Curr_Asset_Loc !== item_partners[i].New_Asset_Loc) {
							this.item_partner_update = true;
						}
					}
				} else {
					requestBody.to_contract_psp = [];
				}

				//Fetch Asset Location Details
				var items = this.getView().byId("id_zcontract_db_tbl_al").getModel().getData();

				for (i = 0; i < items.length; i++) {
					var obj = {};
					obj.EntitySet = "Ets_Global_Update_Contracts";
					obj.VBELN = items[i].VBELN;
					obj.currentAssetLocation = items[i].currentAssetLocation;
					obj.newAssetLocation = items[i].newAssetLocation;

					obj.Index = i;
					obj.MessageType = "";
					obj.MessageText = "";
					requestBody.to_assetLocationChange.push(obj);
				}

				//BOI AKADAMSEP2019+
				var changes_made = false;
				if (JSON.stringify(requestBody) !== JSON.stringify(this.requestBody_C_initial)) {
					changes_made = true;
				}
				if (changes_made) {
					requestBody.to_contracts = this.getView().getModel("viewData").getData().SelectedContracts;
					//EOI AKADAM16SEP2019+ 

					//BOI AKADAM04NOV2019+
					this.requestBody = requestBody;
					if ((this.item_partner_update === true || smartFilterBar_partner.getFilterData() !== {}) && this.Relevant_For_1251 === true) {
						this._dialog_Response_For_1251.open();
					} else {
						this.call_service_update_contract();
					}
					//EOI AKADAM04NOV2019+

					//BOI AKADAM16SEP2019+
				} else {
					sap.m.MessageBox.show(
						"No Changes Recorded on Screen..!!", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
				//EOI AKADAM16SEP2019+
			} //MSA1  5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
		},
		handle_Global_Update_Quotes: function (oEvent) {
			//MSA1 BOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
			var smartFilter = this.getView().byId("id_fb_gu_quotes_header");
			this.comboEdit(smartFilter);
			if (!this.comboMsg) {
				//MSA1 EOC 5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
				var requestBody = {
					Quote: "9999999",
					//	PO: "",
					PO: this.getView().byId("id_inp_gu_q_po").getValue(), //EOC INC0281308 restricting length to 35 char as per incident ++VSINGH
					//Fully_Reject_Quote: this.getView().byId("id_inp_gu_q_fully_reject_quote").getSelected() ? "X" : "",
					Fully_Reject_Quote: "",
					Group_Contract: "",
					Payment_Terms: "",
					//	Opportunity_ID: "",//BOC INC0309257 DEVK9A0SM7  26 Apr 2021  restricting length to 15 char as per incident ++VSINGH Commenting it
					Opportunity_ID: this.getView().byId("id_inp_gu_q_opp_id").getValue(), //EOC INC0309257 DEVK9A0SM7  26 Apr 2021  restricting length to 15 char as per incident ++VSINGH
					SMC: "",
					Header_Text: this.getView().byId("id_inp_gu_q_header_text").getValue(),
					PO_Acceptance_Date: "",
					Billing_Cycle: "",
					Billing_Plan_Type: "",
					Bill_To: "",
					Payer: "",
					T2_Reseller: "",
					End_Customer: "",
					Entitled_Party: "",
					Asset_Location: "",
					PSP_Partner: "",
					Systems_Manager_Contact: "",
					Systems_Manager_Backup_Contact: "",
					Software_Delivery_Contact: "",
					Invoicing_Contact: "",
					Sold_To_Contact: "",
					Reseller_Contact: "",
					Entitled_Party_Contact: "",
					Delivery_Contact: "",
					Backup_Delivery_Contact: "",
					Batch_Mode: this._Batch_Mode,
					Email: this._EMAIL,
					Web_Enabled: "",
					GC: "",
					Remove_GC: this.getView().byId("id_inp_gu_q_remove_gc").getSelected() ? true : false, //AKADAM09OCT2019+
					Remove_Rejection: this.getView().byId("id_inp_gu_q_remove_rejection").getSelected() ? true : false, //GSINGH1NOV2019
					//	CSSA_Number: "", //BOC INC0309257 DEVK9A0SM7  26 Apr 2021  restricting length to 10 char as per incident ++VSINGH Commenting it
					CSSA_Number: this.getView().byId("id_inp_gu_q_cssa_no").getValue(), //EOC INC0309257 DEVK9A0SM7  26 Apr 2021  restricting length to 10 char as per incident ++VSINGH
					PO_End_Date: "",
					Reseller_PO: "",
					Price_List_Type: "",
					Commercial_Code: "",
					chanel_Agrmnt_ID: this.getView().byId("id_inp_gu_q_chanel_Agrmnt_ID").getValue(), //VSINGH SRI3197
					Attachment_Flag: this.getView().byId("id_inp_gu_q_attachment_flag").getSelectedItem().getProperty("text"),
					Invoice_Flag: this.getView().byId("id_inp_gu_q_invoice_flag").getSelectedItem().getProperty("text"),
					Web_Ivc_Upld: this.getView().byId("id_inp_gu_q_web_ivc_upld").getSelectedItem().getProperty("text"),
					InAdvanceFlag: this.getView().byId("id_inp_gu_q_InAdvanceFlag").getSelectedItem().getProperty("text"),
					Clr_Po_Accept_Date: this.getView().byId("id_inp_gu_q_remove_po_accptnce_dt").getSelected() ? true : false,
					Clr_Po_End_Date: this.getView().byId("id_inp_gu_q_remove_po_end_dt").getSelected() ? true : false,
					Clr_Reseller_Po: this.getView().byId("id_inp_gu_q_remove_resllr_po").getSelected() ? true : false,
					Clr_Cssa: this.getView().byId("id_inp_gu_q_remove_cssa").getSelected() ? true : false,
					Clr_Cust_Grp2: this.getView().byId("id_inp_gu_q_Clr_Cust_Grp2").getSelected() ? true : false,
					Clr_Usage_Ind: this.getView().byId("id_inp_gu_q_Clr_Usage_Ind").getSelected() ? true : false,
					Clr_T2_Reseller: this.getView().byId("id_inp_q_Clr_T2_Reseller").getSelected() ? true : false,
					Clr_Systems_Manager_Contact: this.getView().byId("id_inp_q_Clr_Systems_Manager_Contact").getSelected() ? true : false,
					Clr_Systems_Manager_Backup_Contact: this.getView().byId("id_inp_q_Clr_Systems_Manager_Backup_Contact").getSelected() ? true : false,
					Clr_Software_Delivery_Contact: this.getView().byId("id_inp_q_Clr_Software_Delivery_Contact").getSelected() ? true : false,
					Clr_Invoicing_Contact: this.getView().byId("id_inp_q_Clr_Invoicing_Contact").getSelected() ? true : false,
					Clr_Reseller_Contact: this.getView().byId("id_inp_q_Clr_Reseller_Contact").getSelected() ? true : false,
					Clr_Backup_Delivery_Contact: this.getView().byId("id_inp_q_Clr_Backup_Delivery_Contact").getSelected() ? true : false,
					Clr_Bill_To_Contact: this.getView().byId("id_inp_q_Clr_Bill_To_Contact").getSelected() ? true : false,
					Clr_Global_Operations: this.getView().byId("id_inp_q_Clr_Global_Operations").getSelected() ? true : false,
					Clr_AOL_Contact: this.getView().byId("id_inp_q_Clr_AOL_Contact").getSelected() ? true : false,
					Clr_Install_Base_Sales_Rep: this.getView().byId("id_inp_q_Clr_Install_Base_Sales_Rep").getSelected() ? true : false,
					Clr_Partner_Service_Delivery_Manager: this.getView().byId("id_inp_q_Clr_Partner_Service_Delivery_Manager").getSelected() ? true : false,
					Clr_Global_Deals_Specialist: this.getView().byId("id_inp_q_Clr_Global_Deals_Specialist").getSelected() ? true : false,
					Clr_Admin_Signer: this.getView().byId("id_inp_q_Clr_Admin_Signer").getSelected() ? true : false,
					Clr_Response_Center_R1: this.getView().byId("id_inp_q_Clr_Response_Center_R1").getSelected() ? true : false,
					Clr_Response_Center_R2: this.getView().byId("id_inp_q_Clr_Response_Center_R2").getSelected() ? true : false,
					Clr_Response_Center_R3: this.getView().byId("id_inp_q_Clr_Response_Center_R3").getSelected() ? true : false,
					/*SOC szanzaney SRE2524*/
					Clr_Agent_Number: this.getView().byId("id_inp_q_Clr_Agent_Number").getSelected() ? true : false,
					/*EOC szanzaney SRE2524*/
					//Clr_Admin_Supervisor: this.getView().byId("id_inp_q_Clr_Admin_Supervisor").getSelected() ? true : false,
					Net_Value_Upgrade_Perc: this.getView().byId("id_inp_gu_q_Net_Value_Upgrade_Perc").getValue(), //SRE2522 SVERMA15 20 July 2020
					Clr_Action: this.getView().byId("id_inp_gu_q_Clr_Action").getSelected() ? true : false, //SRE2523 VSINGH
					Clr_Action_Date: this.getView().byId("id_inp_gu_q_Clr_Action_Date").getSelected() ? true : false, //SRE2523 VSINGH
					Clr_Action_Rule: this.getView().byId("id_inp_gu_q_Clr_Action_Rule").getSelected() ? true : false, //SRE2523 VSINGH
					Billing_Block: "", //SRE2523 VSINGH
					Remove_Billing_Block: this.getView().byId("id_inp_gu_q_Remove_Billing_Block").getSelected() ? "X" : "", //SRE2523 VSINGH

					to_quotes: [],
					to_messages: [],
					to_assetLocationChange: [],
					to_header_text: [], //LR1 changes by Aniket ,
					to_quote_psp: [] //Added by Aniket
				};

				/*if (this.getView().byId("id_inp_gu_q_fully_reject_quote").getSelected()) {
					requestBody.Fully_Reject_Quote = "X";
				}*/

				//Fetch all contracts First-
				requestBody.to_quotes = this.getView().getModel("viewData").getData().SelectedQuotes;

				//Fetch Header Fields
				var smartFilterBar = this.getView().byId("id_fb_gu_quotes_header");
				for (var key in smartFilterBar.getFilterData()) {
					requestBody[key] = smartFilterBar.getFilterData()[key];
				}

				//Fetch Partner Fields
				smartFilterBar = this.getView().byId("id_fb_gu_quotes_partners");
				for (key in smartFilterBar.getFilterData()) {
					requestBody[key] = smartFilterBar.getFilterData()[key];
				}

				//Fetch Contract PSP (Update Partner Function(Item))
				//if (this.getView().getModel("viewData").getData().QuotePSP !== undefined) {
				if (this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().getData() !== null) {
					requestBody.to_quote_psp = this.getView().byId("id_zcontract_db_q_tbl_upf").getModel().getData();
				} else {
					requestBody.to_quote_psp = [];
				}
				//Fetch date Fields
				var dateFields = [{
					key: "PO_Acceptance_Date",
					id: "id_inp_gu_q_po_acceptance_date"
				}, {
					key: "PO_End_Date",
					id: "id_inp_gu_q_po_end_date"
				}];

				var controller = this;
				for (var i = 0; i < dateFields.length; i++) {
					var value = controller.getView().byId(dateFields[i].id).getValue();
					if (value !== "") {
						requestBody[dateFields[i].key] = value.substring(6) + value.substring(3, 5) + value.substring(0, 2);
					}

				}
				//fetch Valid to Date : gsingh SRI3197
				var dateFields = [{
					key: "QuoteValidTo",
					id: "id_inp_gu_q_valid_to"
				}];

				var controller = this;
				for (var i = 0; i < dateFields.length; i++) {
					var value = controller.getView().byId(dateFields[i].id).getValue();
					if (value !== "") {
						requestBody[dateFields[i].key] = value.substring(6) + value.substring(3, 5) + value.substring(0, 2);
					}

				}
				// fetch valid to Date : gsingh SRI3197

				//Fetch Asset Location Details
				var items = this.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel().getData();

				for (i = 0; i < items.length; i++) {
					var obj = {};
					obj.EntitySet = "Ets_Global_Update_Quotes";
					obj.VBELN = items[i].VBELN;
					obj.currentAssetLocation = items[i].currentAssetLocation;
					obj.newAssetLocation = items[i].newAssetLocation;

					obj.Index = i;
					obj.MessageType = "";
					obj.MessageText = "";
					requestBody.to_assetLocationChange.push(obj);
				}

				//Fetch Header Text Details
				var header_text_q = this.getView().getModel("viewData").getData().UpdateHeadeText_q;
				if (header_text_q !== undefined) {
					header_text_q.forEach(function (keys) {
						if (keys.Object_Id !== undefined) {
							keys.Obj_Id = keys.Object_Id.split("||")[0];
							keys.Text_Id = keys.Object_Id.split("||")[1];
						}
						delete keys.Object_Id;
					});
					requestBody.to_header_text = header_text_q;
				}

				var oModel = this.getOwnerComponent().getModel();
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				oGlobalBusyDialog.open();
				var path = "/Ets_Global_Update_Quotes";
				oModel.create(path,
					requestBody, {
						success: function (data, response) {
							oGlobalBusyDialog.close();
							if (data.to_messages !== null) {
								controller.updateLogData = data.to_messages.results;
								var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
								controller._updateLog.setModel(oModel1);

								if (data.to_messages.results.length < 7) {
									sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(data.to_messages.results.length);
								} else {
									sap.ui.getCore().byId("id_cmd_updateLog").setVisibleRowCount(7);
								}
								controller._updateLog.open();
							} else {
								sap.m.MessageBox.show(
									"No Updates Performed...!!", {
										icon: sap.m.MessageBox.Icon.ERROR,
										title: "Error",
										actions: [sap.m.MessageBox.Action.OK]
									});
							}
							//MSA1 BOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
							controller.clrValues();
							controller.getView().byId("id_fb_gu_quotes_main").clear();
							if (controller.getView().byId("id_zcontract_db_q_tbl_upf").getModel().getData()) {
								controller.getView().byId("id_zcontract_db_q_tbl_upf").getModel().setData([]);
							}
							controller.getView().getModel("viewData").setProperty("/UpdateHeadeText_q", [{
								Append: true
							}]);
							controller.getView().byId("id_zcontract_db_tbl_UPHT_q").removeSelections();
							//MSA1 EOC 5/26 INC0238719/4906603 - PN-Fiori-How to clear the fields after update done
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

			} //MSA1  5/28 INC0329303 when FIORI CMD GU Dropdown value can be changed, show prompt
		},
		onPressDelete_upht: function (oEvent) {
			var rows = this.getView().byId("id_zcontract_db_tbl_UPHT").getModel("viewData").getProperty("/UpdateHeadeText");
			var table = this.getView().byId("id_zcontract_db_tbl_UPHT");
			var items = table.getSelectedContextPaths();
			if (items.length === 0) {
				sap.m.MessageBox.show(
					"Select Row(s) to Delete...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			for (var j = items.length - 1; j >= 0; j--) {
				var ind = Number(items[j].split("/")[2]);
				rows.splice(ind, 1);
			}
			table.removeSelections();
			this.getView().byId("id_zcontract_db_tbl_UPHT").getModel("viewData").setProperty("/UpdateHeadeText", rows);
		},
		onPressDelete_upht_q: function (oEvent) {
			var rows = this.getView().byId("id_zcontract_db_tbl_UPHT_q").getModel("viewData").getProperty("/UpdateHeadeText_q");
			var table = this.getView().byId("id_zcontract_db_tbl_UPHT_q");
			var items = table.getSelectedContextPaths();
			if (items.length === 0) {
				sap.m.MessageBox.show(
					"Select Row(s) to Delete...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			for (var j = items.length - 1; j >= 0; j--) {
				var ind = Number(items[j].split("/")[2]);
				rows.splice(ind, 1);
			}
			table.removeSelections();
			this.getView().byId("id_zcontract_db_tbl_UPHT_q").getModel("viewData").setProperty("/UpdateHeadeText_q", rows);
		},
		onPressDelete_AL_Quotes: function (oEvent) {
			var rows = this.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel().getData();
			var table = this.getView().byId("id_zcontract_db_tbl_AL_Quotes");
			var items = table.getSelectedContextPaths();
			if (items.length === 0) {
				sap.m.MessageBox.show(
					"Select Row(s) to Delete...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			for (var j = items.length - 1; j >= 0; j--) {
				var ind = items[j].split("/")[1];
				rows.splice(ind, 1);
			}
			table.removeSelections();
			this.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel().setData(rows);
		},
		onPressApply_AL_Quotes: function (oEvent) {
			var table = this.getView().byId("id_zcontract_db_tbl_AL_Quotes");
			var oModel = this.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel();
			var rows = oModel.getData();
			if (rows.length === 0) {
				sap.m.MessageBox.show(
					"Add Quote(s) to Update...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			var cal = this.getView().byId("id_c_al_q").getValue();
			var nal = this.getView().byId("id_n_al_q").getValue();
			for (var i = 0; i < rows.length; i++) {
				rows[i].currentAssetLocation = cal;
				rows[i].newAssetLocation = nal;
			}
			oModel.setData(rows);
			table.setModel(oModel);

		},
		onPressCopy_AL_Quotes: function (oEvent) {
			var table = this.getView().byId("id_zcontract_db_tbl_AL_Quotes");
			var oModel = this.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel();
			var sPath = table.getSelectedContextPaths();
			if (sPath.length === 0) {
				sap.m.MessageBox.show(
					"Select Row(s) to Copy...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			//			var items =	this.getView().getModel("viewData").getProperty(sPath);
			var controller = this;
			for (var i = 0; i < sPath.length; i++) {
				var ind = sPath[i].split("/")[1];
				var item = oModel.getData()[Number(ind) + i];
				var obj = {};
				obj.VBELN = item.VBELN;
				obj.currentAssetLocation = "";
				obj.newAssetLocation = "";
				ind = sPath[i].split("/")[1];
				oModel.getData().splice(Number(ind) + i + 1, 0, obj);

			}
			table.getModel().refresh(true);
			//var results = controller.getView().getModel("viewData").getProperty("/Tab1");
			//oModel.setData(results);
			table.removeSelections();
		},
		onPressDelete: function (oEvent) {
			var rows = this.getView().byId("id_zcontract_db_tbl_al").getModel().getData();
			var table = this.getView().byId("id_zcontract_db_tbl_al");
			var items = table.getSelectedContextPaths();
			if (items.length === 0) {
				sap.m.MessageBox.show(
					"Select Row(s) to Delete...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			for (var j = items.length - 1; j >= 0; j--) {
				var ind = items[j].split("/")[1];
				rows.splice(ind, 1);
			}
			table.removeSelections();
			this.getView().byId("id_zcontract_db_tbl_al").getModel().setData(rows);
		},
		onPressApply: function (oEvent) {
			var table = this.getView().byId("id_zcontract_db_tbl_al");
			var oModel = this.getView().byId("id_zcontract_db_tbl_al").getModel();
			var rows = oModel.getData();
			if (rows.length === 0) {
				sap.m.MessageBox.show(
					"Add Contract(s) to Update...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			var cal = this.getView().byId("id_c_al").getValue();
			var nal = this.getView().byId("id_n_al").getValue();
			for (var i = 0; i < rows.length; i++) {
				rows[i].currentAssetLocation = cal;
				rows[i].newAssetLocation = nal;
			}
			oModel.setData(rows);
			table.setModel(oModel);

		},
		onpressAddSelectedContracts_AL: function (oEvent) {
			var selectedContracts = this.getView().getModel("viewData").getData().SelectedContracts;

			if (selectedContracts.length > 0) {
				var oData = [];
				for (var i = 0; i < selectedContracts.length; i++) {
					var obj = {};
					obj.VBELN = selectedContracts[i].VBELN;
					obj.currentAssetLocation = "";
					obj.newAssetLocation = "";
					oData.push(obj);
				}

				var oModelJson = new sap.ui.model.json.JSONModel();
				oModelJson.setData(oData);
				this.getView().byId("id_zcontract_db_tbl_al").setModel(oModelJson);

			} else {
				sap.m.MessageBox.show(
					"No Contract(s) Selected..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onpressAddSelectedQuotes_AL: function (oEvent) {
			var selectedQuotes = this.getView().getModel("viewData").getData().SelectedQuotes;

			if (selectedQuotes.length > 0) {
				var oData = [];
				for (var i = 0; i < selectedQuotes.length; i++) {
					var obj = {};
					obj.VBELN = selectedQuotes[i].VBELN;
					obj.currentAssetLocation = "";
					obj.newAssetLocation = "";
					oData.push(obj);
				}

				var oModelJson = new sap.ui.model.json.JSONModel();
				oModelJson.setData(oData);
				this.getView().byId("id_zcontract_db_tbl_AL_Quotes").setModel(oModelJson);

			} else {
				sap.m.MessageBox.show(
					"No Quote(s) Selected..!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
			}
		},
		onPressCopy: function (oEvent) {
			var table = this.getView().byId("id_zcontract_db_tbl_al");
			var oModel = this.getView().byId("id_zcontract_db_tbl_al").getModel();
			var sPath = table.getSelectedContextPaths();
			if (sPath.length === 0) {
				sap.m.MessageBox.show(
					"Select Row(s) to Copy...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			//			var items =	this.getView().getModel("viewData").getProperty(sPath);
			var controller = this;
			for (var i = 0; i < sPath.length; i++) {
				var ind = sPath[i].split("/")[1];
				var item = oModel.getData()[Number(ind) + i];
				var obj = {};
				obj.VBELN = item.VBELN;
				obj.currentAssetLocation = "";
				obj.newAssetLocation = "";
				ind = sPath[i].split("/")[1];
				oModel.getData().splice(Number(ind) + i + 1, 0, obj);

			}
			table.getModel().refresh(true);
			//var results = controller.getView().getModel("viewData").getProperty("/Tab1");
			//oModel.setData(results);
			table.removeSelections();
		},
		createColumnConfig: function () {
			return [{
				label: 'Contract',
				property: 'VBELN',
				width: '30'
			}, {
				label: 'Current Asset Location',
				property: 'currentAssetLocation',
				width: '50'
			}, {
				label: 'New Asset Location',
				property: 'newAssetLocation',
				width: '50'
			}];
		},
		ExportQuotes: function (oevent) {

			var aCols = [{
				label: "Quotes",
				property: "VBELN",
				type: "string"
			}];

			var oSettings, oSheet;

			var dataSource = this.getView().getModel("viewData").getData().SelectedQuotes;

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
		ExportContracts: function (oevent) {

			var aCols = [{
				label: "Contracts",
				property: "VBELN",
				type: "string"
			}];

			var oSettings, oSheet;

			var dataSource = this.getView().getModel("viewData").getData().SelectedContracts;

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
		onDataExportExcel: function (oEvent) {
			var aCols, aRows, oSettings;

			aCols = this.createColumnConfig();
			aRows = this.getView().byId("id_zcontract_db_tbl_al").getModel().getData();

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aRows
			};

			new Spreadsheet(oSettings).build().then(function () {
				//MessageToast.show("Data Exported To Spreadsheet!");
			});
		},
		onDataExportExcel_AL_Quotes: function (oEvent) {
			var aCols, aRows, oSettings;

			aCols = this.createColumnConfig();
			aRows = this.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel().getData();

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aRows
			};

			new Spreadsheet(oSettings).build().then(function () {
				//MessageToast.show("Data Exported To Spreadsheet!");
			});
		},
		onDataImport: function (oEvent) {
			if (!this._oDialogImport) {
				this._oDialogImport = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importExcel", this);
				this.getView().addDependent(this._oDialogImport);
			}

			this._oDialogImport.open();
		},
		onDataImport_AL_Quotes: function (oEvent) {
			if (!this._oDialogImport_AL_Quotes) {
				this._oDialogImport_AL_Quotes = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importExcel_AL_Quotes", this);
				this.getView().addDependent(this._oDialogImport_AL_Quotes);
			}

			this._oDialogImport_AL_Quotes.open();
		},
		onContractsImport: function () {
			if (!this._oDialogImportContracts) {
				this._oDialogImportContracts = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importContractsExcel", this);
				this.getView().addDependent(this._oDialogImportContracts);
			}

			this._oDialogImportContracts.open();
		},
		onUploadFragContracts: function (e, validateUploadContracts) {
			var smartFilterBar = this.getView().byId("id_fb_gu_contracts_main");
			smartFilterBar.clear();
			var fU = sap.ui.getCore().byId("idfileUploaderContracts");
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
				var hdrRow = arrCSV.splice(0, noOfCols);

				var dataUp = [];
				while (arrCSV.length > 0) {
					var obj = {};
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols);
					for (var i = 0; i < row.length; i++) {
						var property = "";
						if (i === 0) {
							property = "VBELN";
						}
						obj[property] = row[i].trim();
					}
					// push row to an array
					dataUp.push(obj);
				}
				t.validateUploadContracts(dataUp);
				//t.getView().byId("id_zcontract_db_tbl_al").getModel().setData(dataUp);
				t._oDialogImportContracts.close();
				fU.clear();
			};
			reader.readAsBinaryString(file);
		},
		//close upload fragment page1		
		onCancelFragContracts: function (eve) {
			var fU = sap.ui.getCore().byId("idfileUploaderContracts");
			fU.clear();
			this._oDialogImportContracts.close();

		},
		// On upload click on UPload Fragment
		onUploadFrag1: function (e, validateUpload) {
			var fU = sap.ui.getCore().byId("idfileUploader");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];

			// Create a File Reader object
			var reader = new FileReader();
			var t = this;

			reader.onload = function (ev) {
				var strCSV = ev.target.result;
				var arrCSV = strCSV.split(new RegExp([',', '\n'].join('|'), 'g'));
				var noOfCols = 3;
				arrCSV.pop();

				// To ignore the first row which is header
				var hdrRow = arrCSV.splice(0, noOfCols);

				var dataUp = [];
				while (arrCSV.length > 0) {
					var obj = {};
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols);
					for (var i = 0; i < row.length; i++) {
						var property = "";
						if (i === 0) {
							property = "VBELN";
						} else if (i === 1) {
							property = "currentAssetLocation";
						} else if (i === 2) {
							property = "newAssetLocation";
						}
						obj[property] = row[i].trim();
					}
					// push row to an array
					dataUp.push(obj);
				}
				//t.validateUpload(dataUp);
				t.getView().byId("id_zcontract_db_tbl_al").getModel().setData(dataUp);
				t._oDialogImport.close();
				fU.clear();
			};
			reader.readAsBinaryString(file);
		},
		// Validate the Material ID uploaded by User via CSV

		//close upload fragment page1		
		onCancelFrag1: function (eve) {
			var fU = sap.ui.getCore().byId("idfileUploader");
			fU.clear();
			this._oDialogImport.close();

		},
		// On upload click on UPload Fragment
		onUploadFrag_AL_Quotes: function (e, validateUpload) {
			var fU = sap.ui.getCore().byId("idfileUploader_AL_Quotes");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];

			// Create a File Reader object
			var reader = new FileReader();
			var t = this;

			reader.onload = function (ev) {
				var strCSV = ev.target.result;
				var arrCSV = strCSV.split(new RegExp([',', '\n'].join('|'), 'g'));
				var noOfCols = 3;
				arrCSV.pop();

				// To ignore the first row which is header
				var hdrRow = arrCSV.splice(0, noOfCols);

				var dataUp = [];
				while (arrCSV.length > 0) {
					var obj = {};
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols);
					for (var i = 0; i < row.length; i++) {
						var property = "";
						if (i === 0) {
							property = "VBELN";
						} else if (i === 1) {
							property = "currentAssetLocation";
						} else if (i === 2) {
							property = "newAssetLocation";
						}
						obj[property] = row[i].trim();
					}
					// push row to an array
					dataUp.push(obj);
				}
				//t.validateUpload(dataUp);
				t.getView().byId("id_zcontract_db_tbl_AL_Quotes").getModel().setData(dataUp);
				t._oDialogImport_AL_Quotes.close();
				fU.clear();
			};
			reader.readAsBinaryString(file);
		},
		// Validate the Material ID uploaded by User via CSV

		//close upload fragment page1		
		onCancelFrag_AL_Quotes: function (eve) {
			var fU = sap.ui.getCore().byId("idfileUploader_AL_Quotes");
			fU.clear();
			this._oDialogImport_AL_Quotes.close();

		},
		onQuotesImport: function () {
			if (!this._oDialogImportQuotes) {
				this._oDialogImportQuotes = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.fragments.importQuotesExcel", this);
				this.getView().addDependent(this._oDialogImportQuotes);
			}

			this._oDialogImportQuotes.open();
		},
		onUploadFragQuotes: function (e, validateUploadQuotes) {
			var smartFilterBar = this.getView().byId("id_fb_gu_quotes_main");
			smartFilterBar.clear();
			var fU = sap.ui.getCore().byId("idfileUploaderQuotes");
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
				var hdrRow = arrCSV.splice(0, noOfCols);

				var dataUp = [];
				while (arrCSV.length > 0) {
					var obj = {};
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols);
					for (var i = 0; i < row.length; i++) {
						var property = "";
						if (i === 0) {
							property = "VBELN";
						}
						obj[property] = row[i].trim();
					}
					// push row to an array
					dataUp.push(obj);
				}
				t.validateUploadQuotes(dataUp);
				//t.getView().byId("id_zcontract_db_tbl_al").getModel().setData(dataUp);
				t._oDialogImportQuotes.close();
				fU.clear();
			};
			reader.readAsBinaryString(file);
		},
		//close upload fragment page1		
		onCancelFragQuotes: function (eve) {
			var fU = sap.ui.getCore().byId("idfileUploaderQuotes");
			fU.clear();
			this._oDialogImportQuotes.close();

		},
		/*// On upload click on UPload Fragment
		onUploadFrag1: function (e, validateUpload) {
			var fU = sap.ui.getCore().byId("idfileUploader");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];

			// Create a File Reader object
			var reader = new FileReader();
			var t = this;

			reader.onload = function (ev) {
				var strCSV = ev.target.result;
				var arrCSV = strCSV.split(new RegExp([',', '\n'].join('|'), 'g'));
				var noOfCols = 3;
				arrCSV.pop();

				// To ignore the first row which is header
				var hdrRow = arrCSV.splice(0, noOfCols);

				var dataUp = [];
				while (arrCSV.length > 0) {
					var obj = {};
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols);
					for (var i = 0; i < row.length; i++) {
						var property = "";
						if (i === 0) {
							property = "Contract";
						} else if (i === 1) {
							property = "currentAssetLocation";
						} else if (i === 2) {
							property = "newAssetLocation";
						}
						obj[property] = row[i].trim();
					}
					// push row to an array
					dataUp.push(obj);
				}
				//t.validateUpload(dataUp);
				t.getView().byId("id_zcontract_db_tbl_al").getModel().setData(dataUp);
				t._oDialogImport.close();
				fU.clear();
			};
			reader.readAsBinaryString(file);
		},*/
		// Validate the Material ID uploaded by User via CSV

		//close upload fragment page1		
		/*onCancelFrag1: function (eve) {
			var fU = sap.ui.getCore().byId("idfileUploader");
			fU.clear();
			this._oDialogImport.close();

		},*/
		onPressAddContract: function () {
			var oView = this.getView();
			var oMultiInput1 = oView.byId("id_mi_al_contracts");
			var tokens = oMultiInput1.getTokens();

			var oModel = oView.byId("id_zcontract_db_tbl_al").getModel();
			var oData = oModel.getData();
			if (oData === null) {
				oData = [];
			}
			var obj = {};
			if (tokens.length === 0) {
				sap.m.MessageBox.show(
					"Enter Contract to Proceed...!!", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error!",
						actions: [sap.m.MessageBox.Action.OK]
					});
				return;
			}
			if (tokens.length > 0) {
				for (var i = 0; i < tokens.length; i++) {
					obj = {};
					obj.VBELN = tokens[i].getText();
					obj.currentAssetLocation = "";
					obj.newAssetLocation = "";
					oData.push(obj);
				}
			} else {
				obj = {};
				obj.VBELN = "";
				obj.currentAssetLocation = "";
				obj.newAssetLocation = "";
				oData.push(obj);
			}

			oModel.setData(oData);
			oView.byId("id_zcontract_db_tbl_al").setModel(oModel);

		},

		//*******START OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//

		onCancelInvoice: function () {

			//get selected records
			var selectedIndeces = this.getView().byId("id_zinvoice_db_tbl_upf").getSelectedIndices();

			//if none selected
			if (selectedIndeces.length === 0) {

				var msg = "Please select invoices to cancel!";
				MessageBox.error(msg);
				return;
			}

			//data to pass to backend
			var body = {
				// Ety_Contract_invoiceSet: [],
				to_contract_invoice: [],
				to_contracts: [],
				to_messages: [],
				to_assetLocationChange: [],
				to_header_text: [],
				to_contract_psp: []
			};

			//get all records in table
			var tableData = this.getView().byId("id_zinvoice_db_tbl_upf").getModel().getProperty("/");

			var temp = {};

			//loop through selected records
			for (var i = 0; i < selectedIndeces.length; i++) {

				temp["Contract_num"] = tableData[selectedIndeces[i]].Contract_num;
				temp["Invoice_doc"] = tableData[selectedIndeces[i]].Invoice_doc;
				temp["Invoice_cat"] = tableData[selectedIndeces[i]].Invoice_cat;
				temp["Net_value"] = tableData[selectedIndeces[i]].Net_value;
				temp["Currency"] = tableData[selectedIndeces[i]].Currency;

				body.to_contract_invoice.push(temp);
				temp = {};
			}

			//set busy as true
			this.getView().setBusy(true);

			//POST call
			this.getOwnerComponent().getModel().create("/Ets_Global_Update_Contracts", body, {
				method: "POST",
				success: function (oData) {

					//create new JSON Model
					var newJSONModel = new sap.ui.model.json.JSONModel();

					//all records
					var data = [];

					//each record
					var record = {};

					//logo and highlight types
					var logo = "";
					var highlight = "";

					//loop through results in oData.to_messages
					for (i = 0; i < oData.to_messages.results.length; i++) {

						//setting logo and highlight types
						if (oData.to_messages.results[i].Message_Type === "S") {
							logo = "sap-icon://message-success";
							highlight = "Success";
						} else if (oData.to_messages.results[i].Message_Type === "E") {
							logo = "sap-icon://message-error";
							highlight = "Error";
						} else {
							logo = "sap-icon://message-warning";
							highlight = "Warning";
						}

						record = {
							desc: oData.to_messages.results[i].VBELN,
							title: oData.to_messages.results[i].Message_Text,
							icon: logo,
							highlight: highlight
						};

						data.push(record);

						record = {};
						logo = "";
						highlight = "";
					}

					//initially set visibility to false
					newJSONModel.setProperty("/data", data);

					//display success messages in dialog box
					// if (!this._oDialogCancelInvoice) {

					//create dialog
					this._oDialogCancelInvoice = sap.ui.xmlfragment("ZSA_CONTRACT_DB.ZSA_CONTRACT_DB.view.Subview_GlobalUpdate_CancelStatus",
						this);

					//adding dependent
					this.getView().addDependent(this._oDialogCancelInvoice);

					//open dialog
					this._oDialogCancelInvoice.open();

					//setting the model to the view
					this.getView().setModel(newJSONModel, "cancelInvoice");
					// }

					//set busy as false
					this.getView().setBusy(false);
				}.bind(this),
				error: function (oError) {

					//display error message
					var responseText = JSON.parse(oError.responseText);
					msg = responseText.error.message.value;
					MessageBox.error(msg);

					//set busy as false
					this.getView().setBusy(false);
				}.bind(this)
			});
		},

		onCancelInvoiceClosePress: function () {

			//destroy dialog box
			this._oDialogCancelInvoice.destroy();
		},

		onCancelInvoiceSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("desc", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		//*******END OF SRR071D_3 Sprint 1.5 July Release CHANGES BY ARJUN*********//
		// BOI 2483 1.7
		onOk: function () {
			this._oDialogUpdEQ.close();
		},
		onCancel: function () {
			this._oDialogUpEqW.close();
		},
		onProceed: function () {
			var requestBody = {
				Equipment_Number: "9999999999",
				Batch_Mode: this._Batch_Mode,
				Email: this._EMAIL,
				to_modify_eqp: this.eqp_results,
				to_messages: []
			};
			this._oDialogUpEqW.close();
			var oModel = sap.ui.getCore().getModel("eqpUpdModel");
			//var oModel1 = thatOmodEqpUpd.getOwnerComponent().getModel();
			// var oGlobalBusyDialog = new sap.m.BusyDialog();
			// oGlobalBusyDialog.open();
			// var path = "/Ets_Global_Update_Equipment";
			// var controller = this;
			// var oModel = thatOmodEqpUpd.getOwnerComponent().getModel();
			// var thatOmodEqpUpd = oModel;	
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			oGlobalBusyDialog.open();
			var path = "/Ets_Global_Update_Equipment";
			var controller = this;
			oModel.create(path,
				requestBody, {
					success: function (data, response) {
						oGlobalBusyDialog.close();
						if (data.to_messages !== null) {
							controller.updateLogData = data.to_messages.results;
							var oModel1 = new sap.ui.model.json.JSONModel(controller.updateLogData);
							controller._updateLog_EQ.setModel(oModel1);
							if (data.to_messages.results.length < 7) {
								sap.ui.getCore().byId("id_cmd_updateLog_EQ").setVisibleRowCount(data.to_messages.results.length);
							} else {
								sap.ui.getCore().byId("id_cmd_updateLog_EQ").setVisibleRowCount(7);
							}
							controller._updateLog_EQ.open();
						} else {
							sap.m.MessageBox.show(
								"No Updates performed...!!", {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK]
								});
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
		},
		// EOI for 2483 1.7	
		//----Start of Changes for SRE2522 by SVERMA15 on 22th July 2020----
		// 	handleChangeNumeric: function (oEvent) {
		// 	var oSource = oEvent.getSource(),
		// 		oValue = oSource.getValue(),
		// 		oRegex = "^\\d+$";
		// 	if (oValue !== "") {
		// 		for (var i in oValue) {
		// 			if (oValue.substring(oValue.length, oValue.length - 1).match(oRegex)) {
		// 				break;
		// 			} else {
		// 				if (oValue.substring(oValue.length, oValue.length - 1) == ".") {
		// 					if (oValue.match(/\./g).length > 1) {
		// 						oValue = oValue.substring(0, oValue.length - i - 1);
		// 					} else {
		// 						break;
		// 					}
		// 				} else {
		// 					oValue = oValue.substring(0, oValue.length - i - 1);
		// 				}
		// 			}
		// 		}
		// 		oSource.setValue(oValue);
		// 	}
		// }
		//----End of Changes for SRE2522 by SVERMA15 on 22th July 2020----	

		//*******START OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//

		cancelUploadPress: function () {

			//close dialog box
			this._oDialogGU_billingDoc.close();

			//destroy dialog box
			// this._oDialogGU_billingDoc.destroy();
		},

		//*******END OF SRE2483 Sprint 1.7 September Release CHANGES BY ARJUN*********//
		/**********************************BOC for INC0302094 14 April 2021 ++VSINGH39 */
		handleChangeActionDate: function (oEvt) {
				var bValid = oEvt.getParameter("valid");
				if (!bValid) {
					oEvt.getSource().setValue();
					sap.m.MessageBox.show(
						"The action date must be in future", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						});
				}
			}
			/**********************************EOC for INC0302094 14 April 2021 ++VSINGH39 */

	});

});