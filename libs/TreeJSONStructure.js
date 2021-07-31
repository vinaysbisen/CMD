sap.ui.define(function () {
	"use strict";
	return {

		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Creates a JSON Structure using the data that is passed
		*
		* @param       
		-------------------------------------------------------*/
		_createD3Data: function (data) {
			var dictionary = this._readDictionary(data);
			var treeDetails = this._readTree(data);
			return this._generateTree(treeDetails, dictionary);
		},
		_createD3Data_ContractDisplay: function (data) {
			var dictionary = this._readDictionary_ContractDisplay(data);
			var treeDetails = this._readTree(data);
			return this._generateTree(treeDetails, dictionary);
		},
		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Creates a dictionary using the data that is passed
		*
		* @param       
		-------------------------------------------------------*/
		_readDictionary_ContractDisplay: function (dictionaryResponseData) {
			var dictionary = {};
			for (var counter = 0; counter < dictionaryResponseData.length; counter++) {
				var detail = dictionaryResponseData[counter];
				dictionary[parseInt(detail['NodeID']).toString()] = {

					NodeID: detail['NodeID'],
					ParentNodeID: detail['ParentNodeID'],
					DrillState: detail['DrillState'],
					HierarchyLevel: detail['HierarchyLevel'],
					Document: detail['Document'],
					Document_Date: detail['Document_Date'],
					User_Status: detail['User_Status'],
					Sales_Document_Type: detail['Sales_Document_Type'],
					Net_Value: detail['Net_Value'],
					Currency: detail['Currency']

				};
			}
			return dictionary;
		},
		_readDictionary: function (dictionaryResponseData) {
			var dictionary = {};
			for (var counter = 0; counter < dictionaryResponseData.length; counter++) {
				var detail = dictionaryResponseData[counter];
				switch (detail.Object_Type) {
				case "New Business Quote":
					detail.Icon = "sap-icon://document-text";
					detail.OAC_Log = "View Text";
					break;
				case "Renewal Quote":
					detail.Icon = "sap-icon://create";
					detail.OAC_Log = "View Text";
					break;
				case "Quote":
					detail.Icon = "sap-icon://create";
					detail.OAC_Log = "View Text";
					break;
				case "Sold To":
					//detail.Object = "Sold To - " + detail.Object;
					detail.Icon = "sap-icon://customer";
					break;
				case "Reseller":
					//detail.Object = "Sold To - " + detail.Object;
					detail.Icon = "sap-icon://customer";
					break;
				case "Functional Location":
					//detail.Object = "LLFL - " + detail.Object;
					detail.Icon = "sap-icon://functional-location";
					break;
				case "Functional Location (AMP)":
					//detail.Object = "LLFL - " + detail.Object;
					detail.Icon = "sap-icon://functional-location";
					break;
				case "MLFL":
					detail.Icon = "sap-icon://functional-location";
					//detail.Object = "MLFL - " + detail.Object;
					break;
				case "Contract":
					detail.Icon = "sap-icon://sales-order";
					//detail.Object = "C - " + detail.Object;
					break;
				case "Master Contract":
					detail.Icon = "sap-icon://expense-report";
					//detail.Object = "MC - " + detail.Object;
					break;
				case "Equipment":
					//detail.Object = "E - " + detail.Object;
					detail.Icon = "sap-icon://add-equipment";
					break;
				default:
					detail.Icon = "";
				}
				dictionary[parseInt(detail['NodeID']).toString()] = {
					Icon: detail['Icon'],
					Object_Type: detail['Object_Type'],
					Object: detail['Object'],
					NodeID: detail['NodeID'],
					ParentNodeID: detail['ParentNodeID'],
					HierarchyLevel: detail['HierarchyLevel'],
					DrillState: detail['DrillState'],
					Account_Ops_Lead: detail['Account_Ops_Lead'],
					Action_Code: detail['Action_Code'],
					Action_Date: detail['Action_Date'],
					Asset_Location: detail['Asset_Location'],
					Attachment_Indicator: detail['Attachment_Indicator'],
					Bill_To_Party: detail['Bill_To_Party'],
					Billing_Block: detail['Billing_Block'],
					Billing_Cycle: detail['Billing_Cycle'],
					BRT: detail['BRT'],
					Business_Area: detail['Business_Area'],
					Contract: detail['Contract'],
					Contract_Admin_Contact: detail['Contract_Admin_Contact'],
					Contract_End_Date: detail['Contract_End_Date'],
					Contract_Item: detail['Contract_Item'],
					Contract_Start_Date: detail['Contract_Start_Date'],
					Country: detail['Country'],
					Created_By: detail['Created_By'],
					Credit_Status: detail['Credit_Status'],
					CSSA_Number: detail['CSSA_Number'],
					Currency: detail['Currency'],
					Customer_PO_Number: detail['Customer_PO_Number'],
					Deal_Discount_Percentage: detail['Deal_Discount_Percentage'],
					Deal_Discount_Value: detail['Deal_Discount_Value'],
					Deal_ID: detail['Deal_ID'],
					Document_Type: detail['Document_Type'],
					End_Customer: detail['End_Customer'],
					Entitled_Party: detail['Entitled_Party'],
					Equipment_Number: detail['Equipment_Number'],
					Federal_Indicator: detail['Federal_Indicator'],
					GBS_Admin: detail['GBS_Admin'],
					Hpe_Net_Value: detail['Hpe_Net_Value'],
					Legacy_Doc: detail['Legacy_Doc'],
					LLFL: detail['LLFL'],
					LLFL_Desc: detail['LLFL_Desc'],
					Group_Contract: detail['Group_Contract'],
					Material: detail['Material'],
					Material_Description: detail['Material_Description'],
					MLFL: detail['MLFL'],
					MLFL_Description: detail['MLFL_Description'],
					Offer: detail['Offer'],
					Offer_Description: detail['Offer_Description'],
					Opportunity_ID: detail['Opportunity_ID'],
					Overall_Blocked_Status: detail['Overall_Blocked_Status'],
					Package: detail['Package'],
					Package_Description: detail['Package_Description'],
					Payment_Term: detail['Payment_Term'],
					PO_Value: detail['PO_Value'],
					Prefered_Service_Provider: detail['Prefered_Service_Provider'],
					Product_Number: detail['Product_Number'],
					Purchase_Agreement_ID: detail['Purchase_Agreement_ID'],
					Quote: detail['Quote'],
					Quote_Amount: detail['Quote_Amount'],
					Reason_For_Cancellation: detail['Reason_For_Cancellation'],
					Rejection_Status: detail['Rejection_Status'],
					Reseller_PO_Number: detail['Reseller_PO_Number'],
					Route_To_Market: detail['Route_To_Market'],
					Sales_Document_Status: detail['Sales_Document_Status'],
					Sales_Metric_Code: detail['Sales_Metric_Code'],
					Sales_Order_Number: detail['Sales_Order_Number'],
					Sales_Org: detail['Sales_Org'],
					Sales_Rep: detail['Sales_Rep'],
					// BOC SDAS52 ER-1036 11/10/2020
					SignatureFlag: detail['SignatureFlag'],
					// EOC SDAS52 ER-1036 11/10/2020
					Serial_Number: detail['Serial_Number'],
					TechIdentNo: detail['TechIdentNo'], //INC0154688 ++VS
					Service_Level: detail['Service_Level'],
					SLED_Indicator: detail['SLED_Indicator'],
					Sold_To_Company_Name: detail['Sold_To_Company_Name'],
					T2_Reseller: detail['T2_Reseller'],
					Usage_Indicator: detail['Usage_Indicator'],
					Valid_To: detail['Valid_To'],
					Version_Description: detail['Version_Description'],
					Warranty_End_Date: detail['Warranty_End_Date'],
					Warranty_Id: detail['Warranty_Id'],
					Warranty_Start_Date: detail['Warranty_Start_Date'],
					Web_Status: detail['Web_Status'],
					Nav_To_Cust_Docs: detail['Nav_To_Cust_Docs'],
					Sold_To_Party: detail['Sold_To_Party'],
					Sold_To_Name: detail['Sold_To_Name'],
					Sold_to_LLFL: detail['Sold_to_LLFL'],
					Sold_to_LLFL_Name: detail['Sold_to_LLFL_Name'],
					HLFL: detail['HLFL'],
					HLFL_Desc: detail['HLFL_Desc'],
					RTM_FL: detail['RTM_FL'],
					RTM_FL_Category: detail['RTM_FL_Category'],
					RTM_FL_Desc: detail['RTM_FL_Desc'],
					AMP: detail['AMP'],
					AMP_Desc: detail['AMP_Desc'],
					MLFL1: detail['MLFL1'],
					MLFL1_Desc: detail['MLFL1_Desc'],
					MLFL2: detail['MLFL2'],
					MLFL2_Desc: detail['MLFL2_Desc'],
					VTWEG: detail['VTWEG'],
					SPART: detail['SPART'],
					Region: detail['Region'],
					Created_By_Group: detail['Created_By_Group'],
					PO_End_Date: detail['PO_End_Date'],
					Master_Contract_ID: detail['Master_Contract_ID'],
					Commerciality_Code: detail['Commerciality_Code'],
					Price_List_Type: detail['Price_List_Type'],
					Invoice_Spreadsheet_Flag: detail['Invoice_Spreadsheet_Flag'],
					Third_Party_Info: detail['Third_Party_Info'],
					Equipment_not_linked_to_Contract: detail['Equipment_not_linked_to_Contract'],
					Equipment_not_linked_to_Quote: detail['Equipment_not_linked_to_Quote'],
					PSP_SubContractor: detail['PSP_SubContractor'],
					PSP_SubContractor_name1: detail['PSP_SubContractor_name1'],
					GDI: detail['GDI'],
					Local_Invoicing: detail['Local_Invoicing'],
					Central_Invoicing: detail['Central_Invoicing'],
					LLFL_Status: detail['LLFL_Status'],
					Equipment_Qty: detail['Equipment_Qty'],
					Missing_Billing_Amt: detail['Missing_Billing_Amt'],
					End_Customer_Name: detail['End_Customer_Name'],
					Channel_Reseller_Name: detail['Channel_Reseller_Name'],
					Sales_Rep_Name: detail['Sales_Rep_Name'],
					Sales_Rep_Email: detail['Sales_Rep_Email'], //++ VS SR 1.7 DVNK9A24K2
					Entitled_Party_Name: detail['Entitled_Party_Name'],
					Bill_To_Party_Name: detail['Bill_To_Party_Name'],
					Contract_Admin_Contact_Name: detail['Contract_Admin_Contact_Name'],
					Contract_Admin_Contact_Email: detail['Contract_Admin_Contact_Email'], //++ VS SR 1.7 DVNK9A24K2
					Global_Operations_Name: detail['Global_Operations_Name'],
					Account_Ops_Lead_Name: detail['Account_Ops_Lead_Name'],
					Account_Ops_Lead_Email: detail['Account_Ops_Lead_Email'], //++ VS SR 1.7 DVNK9A24K2
					LID_Code: detail['LID_Code'],
					PAC_Code: detail['PAC_Code'],
					Exclusion_Date: detail['Exclusion_Date'],
					Equipment_Status: detail['Equipment_Status'],
					HW_SW_JW: detail['HW_SW_JW'],
					E_Not_Linked_To_Contract: detail['E_Not_Linked_To_Contract'],
					E_Not_Linked_To_Quote: detail['E_Not_Linked_To_Quote'],
					Asset_Location_Address: detail['Asset_Location_Address'],
					Asset_Location_Name: detail['Asset_Location_Name'],
					PSP_Name: detail['PSP_Name'],
					Payer: detail['Payer'],
					Payer_Name: detail['Payer_Name'],
					System_Manager_Contact: detail['System_Manager_Contact'],
					System_Manager_Contact_Name: detail['System_Manager_Contact_Name'],
					SM_Backup_Contact: detail['SM_Backup_Contact'],
					SM_Backup_Contact_Name: detail['SM_Backup_Contact_Name'],
					Software_delivery_contact: detail['Software_delivery_contact'],
					Software_delivery_contact_Name: detail['Software_delivery_contact_Name'],
					Invoicing_Contact: detail['Invoicing_Contact'],
					Invoicing_Contact_Name: detail['Invoicing_Contact_Name'],
					Sold_To_Contact: detail['Sold_To_Contact'],
					Sold_To_Contact_Name: detail['Sold_To_Contact_Name'],
					Reseller_Contact: detail['Reseller_Contact'],
					Reseller_Contact_Name: detail['Reseller_Contact_Name'],
					Entitled_Party_Contact: detail['Entitled_Party_Contact'],
					Entitled_Party_Contact_Name: detail['Entitled_Party_Contact_Name'],
					Delivery_Contact: detail['Delivery_Contact'],
					Delivery_Contact_Name: detail['Delivery_Contact_Name'],
					Backup_Delivery_Contact: detail['Backup_Delivery_Contact'],
					Backup_Delivery_Contact_Name: detail['Backup_Delivery_Contact_Name'],
					Bill_to_Contact: detail['Bill_to_Contact'],
					Bill_to_Contact_Name: detail['Bill_to_Contact_Name'],
					Install_Base_Sales_Rep: detail['Install_Base_Sales_Rep'],
					Install_Base_Sales_Rep_Name: detail['Install_Base_Sales_Rep_Name'],
					Install_Base_Sales_Rep_Email: detail['Install_Base_Sales_Rep_Email'], //++ VS SR 1.7 DVNK9A24K2
					PSDM: detail['PSDM'],
					PSDM_Name: detail['PSDM_Name'],
					Admin_Signer: detail['Admin_Signer'],
					Admin_Signer_Name: detail['Admin_Signer_Name'],
					Admin_Supervisor_Email: detail['Admin_Supervisor_Email'], //++ VS SR 1.7 DVNK9A24K2
					Admin_Supervisor: detail['Admin_Supervisor'],
					Admin_Supervisor_Name: detail['Admin_Supervisor_Name'],
					Global_Deal_Specialist: detail['Global_Deal_Specialist'],
					Global_Deal_Specialist_Name: detail['Global_Deal_Specialist_Name'],
					Global_Deal_Specialist_Email: detail['Global_Deal_Specialist_Email'], //++ VS SR 1.7 DVNK9A24K2
					Distribution_Channel: detail['Distribution_Channel'],
					Division: detail['Division'],
					InAdvance_Flag: detail['InAdvance_Flag'],
					Rule_for_Det_Of_a_Deviating_Invoice_Dat: detail['Rule_for_Det_Of_a_Deviating_Invoice_Dat'],
					Rule_for_Origin_Of_Next_Invoice_Date: detail['Rule_for_Origin_Of_Next_Invoice_Date'],
					Alt_Tax_Classification: detail['Alt_Tax_Classification'],
					Sales_Document_Description: detail['Sales_Document_Description'],
					Equipment_Type: detail['Equipment_Type'],
					Profit_Center: detail['Profit_Center'],
					QuoteStartDate: detail['QuoteStartDate'],
					QuoteEndDate: detail['QuoteEndDate'],
					CreationDate: detail['CreationDate'],
					QuoteStartDateItem: detail['QuoteStartDateItem'], //ER2955 VSINGH39 28 Apr 2021 DEVK9A0SNM
					QuoteEndDateItem: detail['QuoteEndDateItem'], //ER2955 VSINGH39 28 Apr 2021 DEVK9A0SNM
					IsFederal: detail['IsFederal'],
					Superior_Equipment: detail['Superior_Equipment'],
					//SRE2523 VSINGH BOC
					Delivery_Block: detail['Delivery_Block'],
					Status_without_statusno: detail['Status_without_statusno'],
					Invoicing_Contact_Email: detail['Invoicing_Contact_Email'],
					Bill_To_contact_Email: detail['Bill_To_contact_Email'],
					//SRE2523 VSINGH EOC
					//SOC szanzaney SRE2524
					Agent_Number: detail['Agent_Number'],
					Agent_Number_Name: detail['Agent_Number_Name'],
					General_Manager: detail['General_Manager'],
					General_Manager_Name: detail['General_Manager_Name'],
					Chief_Accountant: detail['Chief_Accountant'],
					Chief_Accountant_Name: detail['Chief_Accountant_Name'],
					Service_Rendered_Date: detail['Service_Rendered_Date'],
					SupplyTypeCode: detail['SupplyTypeCode'],
					ListPrice: detail['ListPrice'],
					ExternalID: detail['ExternalID'],
					Bill_From: detail['Bill_From'],
					Bill_From_Name: detail['Bill_From_Name'],
					//EOC szanzaney SRE2524
					//SOC szanzaney SRE2487_2
					Business_Place: detail['Business_Place'],
					Business_Place_Name: detail['Business_Place_Name'],
					//EOC szanzaney SRE2487_2
					//SOC szanzaney CCB488
					Linked_SO: detail['Linked_SO'],
					//EOC szanzaney CCB488
					//soc szanzaney 4/12 CR143712 and CR143970
					PIBillRule: detail['PIBillRule'],
					PaymentDue: detail['PaymentDue'],
					PaymentCurrency: detail['PaymentCurrency'],
					//eoc szanzaney 4/12 CR143712 and CR143970
					Virtual_AMP: detail['Virtual_AMP'], //Competitive Quote Requirement
					Agreement_Id: detail['Agreement_Id'], //SRI3197 Defect 124973
					Sales_Office: detail['Sales_Office'], //ER 1294 ++VSINGH39 DEVK9A0O6C 13 Apr 2021
					SalesOffice_Eq: detail['SalesOffice_Eq'] //ER 1294 ++VSINGH39 DEVK9A0O6C 13 Apr 2021
				};

			}
			return dictionary;
		},

		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Creates a common structure for parent and children data and creates a create a hierarchy by comparing nodes.
		*
		* @param       
		-------------------------------------------------------*/
		_readTree: function (responseData) {
			var data = [];
			var len = responseData.length;
			var reverseLength = len - 1;
			for (var counter = 0; counter < len; counter++) {
				var detail = responseData[counter];

				data.push({
					parentNode: parseInt(detail['ParentNodeID']),
					node: parseInt(detail['NodeID']),
					root: 0,
					level: parseInt(detail['HierarchyLevel'])
				});

			}

			data.sort(this._compareNodeByLevel);
			return data;
		},

		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Compares nodes based on level to create a hierarchy 
		*
		* @param       
		-------------------------------------------------------*/
		_compareNodeByLevel: function (a, b) {
			if (a.level > b.level)
				return -1;
			if (a.level < b.level)
				return 1;
			return 0;
		},

		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Gets the children by comparing the parent node ID of each of the nodes with the node IDs at the previous level 
		*
		* @param       
		-------------------------------------------------------*/
		_getChildren: function (parentNode, probableChildren) {
			var children = [];
			//console.log("Seraching for children for :",parentNode);
			//console.log("Seraching for children in :",probableChildren);
			for (var counter = 0; counter < probableChildren.length; counter++) {
				var treeNode = probableChildren[counter];
				if (treeNode.parentNode === parentNode) {
					children.push(treeNode);
				}
			}
			return children;
		},

		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Gets the nodes at each level
		*
		* @param       
		-------------------------------------------------------*/
		_getNodesAtLevel: function (nodes, level) {
			var nodesAtLevel = [];
			for (var counter = 0; counter < nodes.length; counter++) {
				var detail = nodes[counter];
				if (detail.level === level) {
					nodesAtLevel.push(detail);
				}
			}
			return nodesAtLevel;
		},

		/*-------------------------------------------------------
		* @author		Deloitte
		* @category		UI5
		* @date			
		*
		* @describe		Generate the nested JSON structure by creating parent child relationships based on the hierarchy
		*
		* @param       
		-------------------------------------------------------*/
		_generateTree: function (data, dictionary) {
			var maxLevel = data[0].level;
			var currentLevel = maxLevel;
			var treeNodesAtPreviousLevel = [];
			var treeNodesAtCurrentLevel = [];

			while (currentLevel >= 0) {
				//console.log("--------------------------Level:",currentLevel);
				treeNodesAtCurrentLevel = [];
				var nodesAtCurrentLevel = this._getNodesAtLevel(data, currentLevel);
				//console.log("nodesAtCurrentLevel:",nodesAtCurrentLevel);
				//console.log("treeNodesAtPreviousLevel",treeNodesAtPreviousLevel);
				if (treeNodesAtPreviousLevel.length === 0) {
					for (var counter = 0; counter < nodesAtCurrentLevel.length; counter++) {
						var node = nodesAtCurrentLevel[counter];
						var treeNode = {
							name: node.node.toString(),
							size: Math.floor(Math.random() * 1000000000),
							parentNode: node.parentNode.toString()
						};
						treeNode.data = dictionary[treeNode.name];
						treeNodesAtCurrentLevel.push(treeNode);
						//console.log("Pushing without children",treeNode);
					}
				} else {
					for (var counter = 0; counter < nodesAtCurrentLevel.length; counter++) {
						//console.log("Getting details for:",node.node);
						var node = nodesAtCurrentLevel[counter];
						var treeNode = {
							name: node.node.toString(),
							parentNode: node.parentNode.toString()
						};
						var children = this._getChildren(treeNode.name, treeNodesAtPreviousLevel);
						//console.log("Found Children:",children);
						if (children.length > 0) {
							treeNode.children = children;
						} else {
							treeNode.size = Math.floor(Math.random() * 1000000000);
						}
						treeNode.data = dictionary[treeNode.name];
						treeNodesAtCurrentLevel.push(treeNode);
						//console.log("Pushing node with children",treeNode);
					}
				}
				treeNodesAtPreviousLevel = treeNodesAtCurrentLevel;
				currentLevel--;
			}
			// //console.log(JSON.stringify(treeNodesAtCurrentLevel, null, 4));
			var a = treeNodesAtCurrentLevel;

			return a;
			//this.getView().getModel("viewData").setProperty("/TreeDataSet", a);
			//return treeNodesAtCurrentLevel[0];

		}
	};
});