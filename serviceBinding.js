function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZSA_GW_CONTRACT_DB_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}