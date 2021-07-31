sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast",
	"sap/ui/core/format/NumberFormat"
], function (DateFormat, MessageToast, NumberFormat) {
	"use strict";
	return {
		formatRowColor: function(value){
			if(value === "Functional Location (AMP)"){
			}	
		},
		formatDate: function (value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd-MM-YYYY"
				});
				return oDateFormat.format(value);
			} else {
				return value;
			}
		},
		formatIcon: function (value) {
			if (value === "E") {
				return "sap-icon://error";
			} else if (value === "W") {
				return "sap-icon://message-warning";
			} else if (value === "I"){
				return "sap-icon://message-information";
			} else if (value === "S"){
				return "sap-icon://message-success";
			}
		},
		formatIconColor: function (value) {
			if (value === "E") {
				return "#ed4866";
			} else if (value === "W") {
				return "#efe025";
			} else if (value === "I"){
				return "#4d25ef";
			} else if (value === "S"){
				return "#2b7d2b";
			}
		},
		visible: function (value){
			if(value === ""){
				return false;
			}
			else{
				return true;
			}
		}

	};
});