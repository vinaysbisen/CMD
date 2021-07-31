/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/m/library", "sap/m/List", "sap/m/Popover", "sap/m/StandardListItem", 'sap/m/MultiInput',
	'sap/m/MultiComboBox', 'sap/m/Token', 'sap/m/Tokenizer', 'sap/ui/comp/smartfield/SmartField', 'sap/ui/comp/odata/MetadataAnalyser',
	"sap/ui/model/ParseException", "sap/ui/model/ValidateException", 'sap/ui/model/BindingMode', 'sap/ui/comp/odata/ODataType',
	'sap/ui/comp/providers/ValueHelpProvider', "sap/ui/comp/util/FormatUtil", "sap/ui/core/format/DateFormat",
	"sap/ui/comp/smartfilterbar/FilterProvider", "ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/base/Log", "sap/ui/comp/library", "sap/ui/core/library"
], function (q, M, L, P, S, a, b, T, c, d, e, f, V, B, O, g, F, D, h, j, l, k) {
	"use strict";
	var m = l.valuehelpdialog.ValueHelpRangeOperation;
	var n = l.smartfilterbar.DisplayBehaviour;
	var o = k.ValueState;
	var p = M.PlacementType;
	var I = "-mInput";
	var s = "-mInputTokenizer";
	var r = d.extend("sap.ui.comp.smartmultiinput.SmartMultiInput", {
		metadata: {
			library: "sap.ui.comp",
			properties: {
				supportRanges: {
					type: "boolean",
					defaultValue: false
				},
				supportMultiSelect: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				beforeCreate: {
					allowPreventDefault: true,
					parameters: {
						oData: {
							type: "object"
						},
						mParameters: {
							type: "object"
						}
					}
				},
				beforeRemove: {
					allowPreventDefault: true,
					parameters: {
						mParameters: {
							type: "object"
						}
					}
				},
				tokenUpdate: {
					parameters: {
						type: {
							type: "string"
						},
						addedTokens: {
							type: "sap.m.Token[]"
						},
						removedTokens: {
							type: "sap.m.Token[]"
						}
					}
				},
				selectionChange: {
					parameters: {
						changedItem: {
							type: "sap.ui.core.Item"
						},
						selected: {
							type: "boolean"
						}
					}
				}
			}
		},
		renderer: function (R, C) {
			d.getMetadata().getRenderer().render(R, C);
		}
	});
	r.prototype.getTokens = function () {
		if (this._oMultiComboBox) {
			return this._oMultiComboBox._oTokenizer.getTokens();
		} else if (this._oMultiInput) {
			return this._oMultiInput.getTokens();
		} else if (this._oTokenizer) {
			return this._oTokenizer.getTokens();
		}
	};
	r.prototype.getValue = function () {
		return this.getTokens();
	};
	r.prototype._createMultiInput = function () {
		var A = this._createAttributes();
		this._oMultiInput = new a(this.getId() + I, A);
		this._oMultiInput.attachChange(function (E) {
			this._validateValueOnChange(E.getParameter("value"));
		}, this);
		this._oMultiInput.attachSuggestionItemSelected(function (E) {
			this._validateValueOnChange(E.getSource().getValue());
		}, this);
		if (this.getBindingContext()) {
			this._bindMultiInput();
		}
		this._oMultiInput.attachTokenUpdate(function (E) {
			var u = E.getParameters();
			delete u.id;
			this.fireTokenUpdate(u);
		}, this);
		var i = {
			control: this._oMultiInput,
			onCreate: "_onMultiInputCreate",
			params: {
				type: {
					type: this._getType(),
					property: this._oFactory._oMetaData.property
				}
			}
		};
		this._initMultiInputValueHelp(i);
		return i;
	};
	r.prototype._createMultiComboBox = function () {
		var A = this._createAttributes();
		this._oMultiComboBox = new b(this.getId() + "mComboBox", A);
		if (this.getBindingContext()) {
			this._bindMultiComboBox();
		} else {
			this._oMultiInput = this._oMultiComboBox._oTokenizer;
			this._oMultiComboBox.attachSelectionChange(function (E) {
				var u = E.getParameters();
				delete u.id;
				this.fireSelectionChange(u);
			}, this);
		}
		var i = {
			control: this._oMultiComboBox,
			onCreate: "_onCreate",
			params: {
				type: {
					type: this._getType(),
					property: this._oFactory._oMetaData.property
				},
				valuehelp: {
					annotation: this._getValueListAnnotation(),
					aggregation: "items",
					noDialog: true,
					noTypeAhead: true
				}
			}
		};
		return i;
	};
	r.prototype._createAttributes = function () {
		var N = {
			width: true,
			textAlign: true,
			placeholder: true,
			tooltip: true,
			name: true,
			valueState: true,
			valueStateText: true
		};
		var A = this._oFactory.createAttributes(null, this._oFactory._oMetaData.property, N, {
			event: "change",
			parameter: "value"
		});
		return A;
	};

	function t(C) {
		var u = C.getParameter("tokens"),
			R, K, i = 0,
			v = [],
			w = null,
			x;
		this._onCancel();
		if (this.oControl instanceof sap.m.MultiInput) {
			this.oControl.setValue("");
			var y = this.oControl.getTokens();
			var A = [];
			var z = [];
			y.forEach(function (E) {
				var G = u.some(function (H) {
					return E.getKey() === H.getKey();
				});
				if (!G) {
					z.push(E);
				}
			});
			u.forEach(function (E) {
				var G = y.some(function (H) {
					return H.getKey() === E.getKey();
				});
				if (!G) {
					A.push(E);
				}
			});
			this.oControl.setTokens(u);
			this.oControl.fireTokenUpdate({
				type: "tokensChanged",
				removedTokens: z,
				addedTokens: A
			});
			i = u.length;
			while (i--) {
				w = u[i].data("row");
				if (w) {
					v.push(w);
				}
			}
		} else {
			if (u[0]) {
				if (this.bIsSingleIntervalRange) {
					R = u[0].data("range");
					if (R) {
						if (this._sType === "datetime") {
							x = D.getDateTimeInstance(q.extend({}, this._oDateFormatSettings, {
								UTC: false
							}));
							if (typeof R.value1 === "string") {
								R.value1 = new Date(R.value1);
							}
							if (R.operation === "BT") {
								if (typeof R.value2 === "string") {
									R.value2 = new Date(R.value2);
								}
								K = x.format(R.value1) + "-" + x.format(R.value2);
							} else {
								K = x.format(R.value1);
							}
						} else {
							if (R.operation === "BT") {
								K = R.value1 + "-" + R.value2;
							} else {
								K = R.value1;
							}
						}
					}
				} else {
					K = u[0].getKey();
				}
				w = u[0].data("row");
				if (w) {
					v.push(w);
				}
			}
			this.oControl.setValue(K);
			this.oControl.fireChange({
				value: K,
				validated: true
			});
		}
		this._calculateAndSetFilterOutputData(v);
	}
	r.prototype._initMultiInputValueHelp = function (i) {
		var u = this._getFilterType(this._oFactory._oMetaData.property.property),
			v = {},
			w = this._getDateFormatSettings(),
			x;
		this._oFactory._getValueHelpDialogTitle(v);
		if (this._getValueListAnnotation()) {
			i.params.valuehelp = {
				annotation: this._getValueListAnnotation(),
				aggregation: "suggestionRows",
				noDialog: false,
				noTypeAhead: false,
				supportMultiSelect: this.getSupportMultiSelect(),
				supportRanges: this.getBindingContext() ? false : this.getSupportRanges(),
				type: u
			};
		} else if (this.getSupportRanges() && !this.getBindingContext()) {
			x = new g({
				fieldName: this._getPropertyName(),
				preventInitialDataFetchInValueHelpDialog: true,
				model: this.getModel(),
				control: this._oMultiInput,
				title: v.dialogtitle,
				supportMultiSelect: this.getSupportMultiSelect(),
				supportRanges: true,
				type: u,
				dateFormatSettings: w,
				isUnrestrictedFilter: this._isTimeType(u),
				displayBehaviour: this._getDisplayBehaviour()
			});
			x._onOK = t;
			this._oMultiInput.addValidator(this._validateToken.bind(this));
		} else {
			this._oMultiInput.setShowValueHelp(false);
			this._oMultiInput.addValidator(this._validateToken.bind(this));
		}
	};
	r.prototype._bindMultiInput = function () {
		var i = this.getBinding("value").getBindingMode();
		switch (i) {
		case B.OneTime:
			this._bindMultiInputOneTime();
			break;
		case B.OneWay:
			this._bindMultiInputOneWay();
			break;
		case B.TwoWay:
		default:
			this._bindMultiInputTwoWay();
		}
	};
	r.prototype._bindMultiInputOneTime = function () {
		var i = this;
		this._readNavigationPropertySet().then(function (R) {
			R.results.forEach(function (u) {
				var K = u[i._getPropertyName()];
				var v = i._getDescriptionFieldName();
				var w = v ? u[v] : "";
				i._oMultiInput.addToken(i._createToken(K, w));
			});
		});
	};
	r.prototype._bindMultiInputOneWay = function () {
		this._bindMultiInputTokens();
	};
	r.prototype._bindMultiInputTwoWay = function () {
		this._bindMultiInputTokens();
		this._oMultiInput.attachTokenUpdate(function (E) {
			E.getParameter("addedTokens").forEach(this._addToken.bind(this));
			E.getParameter("removedTokens").forEach(this._removeToken.bind(this));
		}, this);
	};
	r.prototype._bindMultiInputTokens = function () {
		var N = this._getNavigationPath();
		this._oMultiInput.bindAggregation("tokens", {
			path: N,
			factory: this._tokensFactory.bind(this)
		});
	};
	r.prototype._bindMultiComboBox = function () {
		var i = this.getBinding("value").getBindingMode();
		switch (i) {
		case B.OneTime:
			this._bindMultiComboBoxOneTime();
			break;
		case B.OneWay:
			this._bindMultiComboBoxOneWay();
			break;
		case B.TwoWay:
		default:
			this._bindMultiComboBoxTwoWay();
		}
	};
	r.prototype._bindMultiComboBoxOneTime = function () {
		var i = this;
		this._readNavigationPropertySet().then(function (R) {
			var K = R.results.map(function (u) {
				return u[i._getPropertyName()];
			});
			i._oMultiComboBox.setSelectedKeys(K);
		});
	};
	r.prototype._bindMultiComboBoxOneWay = function () {
		this._createAndAttachHelperMultiInput();
	};
	r.prototype._bindMultiComboBoxTwoWay = function () {
		this._createAndAttachHelperMultiInput();
		this._oMultiComboBox.attachSelectionChange(function (E) {
			var i = E.getParameter("selected"),
				u = E.getParameter("changedItem"),
				v = u.getBindingContext().getProperty(),
				C = this.getBindingContext(),
				K = this._getEntityKeyProperties(C);
			Object.keys(K).forEach(function (w) {
				v[w] = K[w];
			});
			if (i) {
				this._createEntity(v);
			} else {
				this._removeEntity(v);
			}
		}, this);
	};
	r.prototype._readNavigationPropertySet = function () {
		var i = this;
		return new Promise(function (u, v) {
			var C = i.getBindingContext(),
				w = i._getModel(),
				N = i._getNavigationPath();
			w.read(N, {
				context: C,
				success: function (R) {
					u(R);
				},
				error: function (E) {
					i.setValueState(o.Error);
					i.setValueStateText(E.responseText);
					v(E);
				}
			});
		});
	};
	r.prototype._createAndAttachHelperMultiInput = function () {
		var N = this._getNavigationPath();
		this._oMultiInput = new a();
		this._oMultiInput.setBindingContext(this.getBindingContext());
		this._oMultiInput.setModel(this._getModel());
		this._oMultiInput.bindAggregation("tokens", {
			path: N,
			factory: this._tokensFactory.bind(this)
		});
		var i = this._oMultiInput.getBinding("tokens");
		i.attachChange(function () {
			var K = this._oMultiInput.getTokens().map(function (u) {
				return u.getKey();
			});
			this._oMultiComboBox.setSelectedKeys(K);
		}, this);
	};
	r.prototype._getReadTokenList = function () {
		if (!this.oReadTokenList) {
			this.oReadTokenList = new L();
			this.addDependent(this.oReadTokenList);
		}
		return this.oReadTokenList;
	};
	r.prototype._getReadTokenListPopover = function () {
		if (!this.oReadTokenListPopover) {
			this.oReadTokenListPopover = new P({
				showArrow: true,
				placement: p.Auto,
				showHeader: false,
				contentMinWidth: "auto",
				content: [this.oReadTokenList]
			});
			this.addDependent(this.oReadTokenListPopover);
		}
		return this.oReadTokenListPopover;
	};
	r.prototype._handleNMoreIndicatorPress = function () {
		var u = this.getTokens();
		if (!u) {
			return;
		}
		var v = this._getReadTokenList();
		var R = this._getReadTokenListPopover();
		v.removeAllItems();
		for (var i = 0, w = u.length; i < w; i++) {
			var x = u[i],
				y = new S({
					title: x.getText()
				});
			v.addItem(y);
		}
		if (this._oTokenizer._oIndicator && this._oTokenizer._oIndicator.length > 0) {
			R.openBy(this._oTokenizer._oIndicator[0]);
		}
	};
	r.prototype._initTokenizerCollapseMode = function () {
		this._oTokenizer._handleNMoreIndicatorPress(this._handleNMoreIndicatorPress.bind(this));
		this._oTokenizer._useCollapsedMode(true);
		this._oTokenizer.addEventDelegate({
			onAfterRendering: function () {
				this._oTokenizer.setMaxWidth(this.$().width() + "px");
				this._oTokenizer._useCollapsedMode(true);
				this._oTokenizer.scrollToEnd();
			}.bind(this)
		});
	};
	r.prototype._createTokenizer = function () {
		var N = this._getNavigationPath();
		this._oTokenizer = new c(this.getId() + s, {
			editable: false,
			width: "100%"
		});
		this._initTokenizerCollapseMode();
		if (this.getBindingContext()) {
			this._oTokenizer.bindAggregation("tokens", {
				path: N,
				factory: this._tokensFactory.bind(this)
			});
		} else {
			this.attachInnerControlsCreated(this._mirrorTokensToDisplayTokenizer, this);
		}
		return {
			control: this._oTokenizer,
			onCreate: "_onCreate"
		};
	};
	r.prototype._mirrorTokensToDisplayTokenizer = function () {
		if (this.getMode() === "display" && typeof this._oMultiInput !== "undefined") {
			this._oTokenizer.removeAllTokens();
			this._oMultiInput.getTokens().forEach(function (i) {
				var N = new T({
					text: i.getText(),
					key: i.getKey()
				});
				this._oTokenizer.addToken(N);
			}, this);
		}
	};
	r.prototype._tokensFactory = function (C, i) {
		var v = i.getProperty(this._getPropertyName());
		var K = this._formatValue(v);
		var u = this._getDescriptionFieldName();
		var w = u ? i.getProperty(u) : "";
		var x = this._createToken(K, w);
		return x;
	};
	r.prototype._createToken = function (K, i) {
		var u = this._getFormattedText(K, i);
		var v = new T();
		v.setKey(K);
		v.setText(u);
		return v;
	};
	r.prototype._addToken = function (i) {
		var u = {},
			R = i.data("row"),
			v = i.data("range"),
			C = this.getBindingContext(),
			K = this._getEntityKeyProperties(C);
		Object.keys(K).forEach(function (w) {
			u[w] = K[w];
		});
		if (R) {
			Object.keys(R).forEach(function (w) {
				if (w !== "__metadata") {
					u[w] = R[w];
				}
			});
		}
		if (v) {
			u["range"] = v;
		}
		this.setValueState(o.None);
		C = this._createEntity(u);
		i.setBindingContext(C);
	};
	r.prototype._createEntity = function (i) {
		var u = this._getModel(),
			A = this._getEntitySetName(),
			v = u._resolveGroup(A),
			w = this.getBindingContext().getPath() + "/" + this._getNavigationPath(),
			x = this.fireBeforeCreate({
				oData: i,
				mParameters: v
			});
		if (x) {
			v.properties = i;
			var C = u.createEntry(w, v);
			return C;
		}
	};
	r.prototype._removeToken = function (i) {
		var K = this._getEntityKeyProperties(i.getBindingContext());
		this._removeEntity(K);
	};
	r.prototype._removeEntity = function (K) {
		var i = this._getModel(),
			A = this._getEntitySetName(),
			u = i._resolveGroup(A),
			v = this.fireBeforeRemove({
				mParameters: u
			});
		if (v) {
			var w = "/" + i.createKey(A, K);
			i.remove(w, u);
		}
	};
	r.prototype._getEntityKeyProperties = function (C) {
		var i = this._getModel(),
			E = i.oMetadata._getEntityTypeByPath(C.getPath()),
			K = {};
		E.key.propertyRef.forEach(function (u) {
			var v = u.name;
			K[v] = C.getProperty(v);
		});
		return K;
	};
	r.prototype.checkClientError = function () {
		if (this.getMode() === "display") {
			return false;
		}
		return !this._validateMultiInput();
	};
	r.prototype.getRangeData = function () {
		var i = this.getTokens(),
			R = [];
		i.forEach(function (u) {
			var v;
			if (u.data("range")) {
				v = u.data("range");
			} else {
				v = this._getDefaultTokenRangeData(u);
			}
			R.push(v);
		}, this);
		return R;
	};
	r.prototype.setRangeData = function (R) {
		if (!this.getBindingContext()) {
			var i = Array.isArray(R) ? R : [R];
			if (!this._oMultiInput) {
				var E = this.getEditable(),
					u = this.getEnabled(),
					C = this.getContextEditable();
				this.setEditable(true);
				this.setEnabled(true);
				this.setContextEditable(true);
				this.setEditable(E);
				this.setEnabled(u);
				this.setContextEditable(C);
			}
			this._oMultiInput.removeAllTokens();
			i.forEach(function (v) {
				var w = this._getTokenTextFromRangeData(v);
				var x = new T({
					text: w,
					key: w
				});
				x.data("range", v);
				this._oMultiInput.addToken(x);
			}, this);
			this._mirrorTokensToDisplayTokenizer();
		} else {
			j.warning("setRangeData can only be used without property binding");
		}
	};
	r.prototype._getTokenTextFromRangeData = function (i) {
		var u = "";
		switch (i.operation) {
		case m.EQ:
			u = "=" + i.value1;
			break;
		case m.GT:
			u = ">" + i.value1;
			break;
		case m.GE:
			u = ">=" + i.value1;
			break;
		case m.LT:
			u = "<" + i.value1;
			break;
		case m.LE:
			u = "<=" + i.value1;
			break;
		case m.Contains:
			u = "*" + i.value1 + "*";
			break;
		case m.StartsWith:
			u = i.value1 + "*";
			break;
		case m.EndsWith:
			u = "*" + i.value1;
			break;
		case m.BT:
			u = i.value1 + "...";
			if (i.value2) {
				u += i.value2;
			}
			break;
		default:
			u = "";
		}
		if (i.exclude && u !== "") {
			u = "!(" + u + ")";
		}
		return u;
	};
	r.prototype.getFilter = function () {
		var i = [this._getPropertyName()],
			u = {},
			R = this.getRangeData(),
			v;
		u[this._getPropertyName()] = {
			ranges: R,
			items: []
		};
		v = h.generateFilters(i, u);
		return v && v.length === 1 && v[0];
	};
	r.prototype._getDefaultTokenRangeData = function (i) {
		var R = {
			exclude: false,
			operation: m.EQ,
			value1: this._parseValue(i.getKey()),
			value2: "",
			keyField: this._getPropertyName()
		};
		return R;
	};
	r.prototype._validateToken = function (A) {
		var i = A.text;
		var v = this._validateValue(i);
		if (v) {
			var u = new T({
				key: i,
				text: i
			});
			if (this.getBindingContext()) {
				var R = {};
				R[this._getPropertyName()] = this._parseValue(i);
				u.data("row", R);
			} else if (this.getSupportRanges()) {
				var w = this._getDefaultTokenRangeData(u);
				u.data("range", w);
				u.setText("=" + i);
			}
			return u;
		}
	};
	r.prototype._validateMultiInput = function () {
		if (this._oMultiInput.getValueState() !== o.None) {
			return false;
		}
		if (this.getRequired() && this.getTokens().length === 0) {
			this.setValueStateText(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("VALUEHELPVALDLG_FIELDMESSAGE"));
			this.setValueState(o.Error);
			return false;
		} else {
			this.setValueState(o.None);
			return true;
		}
	};
	r.prototype._validateValueOnChange = function (v) {
		if (v === "") {
			this.setValueState(o.None);
			this._validateMultiInput();
		} else {
			this._validateValue(v);
		}
	};
	r.prototype._parseValue = function (v) {
		return this._getType().parseValue(v, "string");
	};
	r.prototype._formatValue = function (v) {
		return this._getType().formatValue(v, "string");
	};
	r.prototype._validateValue = function (v) {
		try {
			var i = this._parseValue(v);
			this._getType().validateValue(i);
			this.setValueState(o.None);
			return true;
		} catch (E) {
			this.setValueState(o.Error);
			this.setValueStateText(E.message);
			var u = {
				element: this._oMultiInput,
				property: "value",
				type: this._getType(),
				newValue: v,
				oldValue: null,
				exception: E,
				message: E.message
			};
			if (E instanceof f) {
				this.fireParseError(u);
			} else if (E instanceof V) {
				this.fireValidationError(u);
			}
			return false;
		}
	};
	r.prototype._getModel = function () {
		if (this._oFactory) {
			return this._oFactory._oModel;
		}
	};
	r.prototype._getDateFormatSettings = function () {
		var i = this.data("dateFormatSettings");
		if (typeof i === "string") {
			try {
				i = JSON.parse(i);
			} catch (u) {}
		}
		return i;
	};
	r.prototype._getNavigationPath = function () {
		return this._oFactory._oMetaData.navigationPath;
	};
	r.prototype._getDescriptionFieldName = function () {
		var i = this._oFactory._oMetaData.annotations.text;
		if (i) {
			return i.property.property.name;
		}
	};
	r.prototype._getType = function () {
		if (!this._oType) {
			var i;
			if (this._isEdmTimeType()) {
				i = this._getDateFormatSettings();
			}
			this._oType = this._oFactory._oTypes.getType(this._oFactory._oMetaData.property, i);
		}
		return this._oType;
	};
	r.prototype._isEdmTimeType = function () {
		var i = ["Edm.DateTime", "Edm.DateTimeOffset", "Edm.Time"];
		return i.indexOf(this._oFactory._oMetaData.property.property.type) > -1;
	};
	r.prototype._isTimeType = function (i) {
		var u = ["date", "datetime", "time"];
		return u.indexOf(i) > -1;
	};
	r.prototype._getPropertyName = function () {
		return this._oFactory._oMetaData.property.property.name;
	};
	r.prototype._getEntitySetName = function () {
		return this._oFactory._oMetaData.entitySet.name;
	};
	r.prototype._getValueListAnnotation = function () {
		return this._oFactory._oMetaData.annotations.valuelist;
	};
	r.prototype._getDisplayBehaviour = function () {
		var i = this._oFactory._getDisplayBehaviourConfiguration("defaultDropDownDisplayBehaviour");
		if (!i || i === n.auto) {
			i = n.descriptionAndId;
		}
		return i;
	};
	r.prototype._getFormattedText = function (K, i) {
		var u = this._getDisplayBehaviour();
		return F.getFormattedExpressionFromDisplayBehaviour(u, K, i);
	};
	r.prototype._getFilterType = function (i) {
		if (O.isNumeric(i.type)) {
			return "numeric";
		} else if (i.type === "Edm.DateTime" && i["sap:display-format"] === "Date") {
			return "date";
		} else if (i.type === "Edm.String") {
			return "string";
		} else if (i.type === "Edm.Boolean") {
			return "boolean";
		} else if (i.type === "Edm.Time") {
			return "time";
		} else if (i.type === "Edm.DateTimeOffset") {
			return "datetime";
		}
		return undefined;
	};
	r.prototype.setEntitySet = function () {
		d.prototype.setEntitySet.apply(this, arguments);
		this.updateBindingContext(false, this._getModel());
		return this;
	};
	r.prototype.bindProperty = function (i, A) {
		d.prototype.bindProperty.apply(this, arguments);
		if (i === "value") {
			this.updateBindingContext(false, this._getModel());
		}
		return this;
	};
	r.prototype._checkComboBox = function () {
		var C = this._oFactory._oSelector.checkComboBox();
		return C && C.combobox;
	};

	function _() {
		this._onCreate.apply(this, arguments);
		if (this._aProviders.length > 0) {
			this._aProviders[0]._onOK = t;
		}
	}
	r.prototype._init = function () {
		var i = this;
		d.prototype._init.apply(this, arguments);
		if (this._oFactory) {
			this._oFactory._createMultiInput = this._createMultiInput.bind(this);
			this._oFactory._createMultiComboBox = this._createMultiComboBox.bind(this);
			this._oFactory._createTokenizer = this._createTokenizer.bind(this);
			this._oFactory._onMultiInputCreate = _;
			this._oFactory._oSelector.getCreator = function () {
				if (!i.getEditable() || !i.getEnabled() || !i.getContextEditable()) {
					return "_createTokenizer";
				} else if (i._checkComboBox()) {
					return "_createMultiComboBox";
				} else {
					return "_createMultiInput";
				}
			};
		}
	};
	return r;
}, true);