/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["ZSA_CONTRACT_DB/ZSA_CONTRACT_DB/libs/base/util/now"], function (n) {
	"use strict";
	var L = {};
	L.Level = {
		NONE: -1,
		FATAL: 0,
		ERROR: 1,
		WARNING: 2,
		INFO: 3,
		DEBUG: 4,
		TRACE: 5,
		ALL: (5 + 1)
	};
	var d, l = [],
		m = {
			'': L.Level.ERROR
		},
		o = null,
		b = false;

	function p(i, w) {
		return ("000" + String(i)).slice(-w);
	}

	function a(C) {
		return (!C || isNaN(m[C])) ? m[''] : m[C];
	}

	function g() {
		if (!o) {
			o = {
				listeners: [],
				onLogEntry: function (f) {
					for (var i = 0; i < o.listeners.length; i++) {
						if (o.listeners[i].onLogEntry) {
							o.listeners[i].onLogEntry(f);
						}
					}
				},
				attach: function (f, h) {
					if (h) {
						o.listeners.push(h);
						if (h.onAttachToLog) {
							h.onAttachToLog(f);
						}
					}
				},
				detach: function (f, h) {
					for (var i = 0; i < o.listeners.length; i++) {
						if (o.listeners[i] === h) {
							if (h.onDetachFromLog) {
								h.onDetachFromLog(f);
							}
							o.listeners.splice(i, 1);
							return;
						}
					}
				}
			};
		}
		return o;
	}
	L.fatal = function (M, D, C, s) {
		c(L.Level.FATAL, M, D, C, s);
	};
	L.error = function (M, D, C, s) {
		c(L.Level.ERROR, M, D, C, s);
	};
	L.warning = function (M, D, C, s) {
		c(L.Level.WARNING, M, D, C, s);
	};
	L.info = function (M, D, C, s) {
		c(L.Level.INFO, M, D, C, s);
	};
	L.debug = function (M, D, C, s) {
		c(L.Level.DEBUG, M, D, C, s);
	};
	L.trace = function (M, D, C, s) {
		c(L.Level.TRACE, M, D, C, s);
	};
	L.setLevel = function (i, C, _) {
		C = C || d || '';
		if (!_ || m[C] == null) {
			m[C] = i;
			var s;
			Object.keys(L.Level).forEach(function (f) {
				if (L.Level[f] === i) {
					s = f;
				}
			});
			c(L.Level.INFO, "Changing log level " + (C ? "for '" + C + "' " : "") + "to " + s, "", "sap.base.log");
		}
	};
	L.getLevel = function (C) {
		return a(C || d);
	};
	L.isLoggable = function (i, C) {
		return (i == null ? L.Level.DEBUG : i) <= a(C || d);
	};
	L.logSupportInfo = function (E) {
		b = E;
	};

	function c(i, M, D, C, s) {
		if (b) {
			if (!s && !C && typeof D === "function") {
				s = D;
				D = "";
			}
			if (!s && typeof C === "function") {
				s = C;
				C = "";
			}
		}
		C = C || d;
		if (i <= a(C)) {
			var N = n(),
				f = new Date(N),
				h = Math.floor((N - Math.floor(N)) * 1000),
				j = {
					time: p(f.getHours(), 2) + ":" + p(f.getMinutes(), 2) + ":" + p(f.getSeconds(), 2) + "." + p(f.getMilliseconds(), 3) + p(h, 3),
					date: p(f.getFullYear(), 4) + "-" + p(f.getMonth() + 1, 2) + "-" + p(f.getDate(), 2),
					timestamp: N,
					level: i,
					message: String(M || ""),
					details: String(D || ""),
					component: String(C || "")
				};
			if (b && typeof s === "function") {
				j.supportInfo = s();
			}
			l.push(j);
			if (o) {
				o.onLogEntry(j);
			}
			if (console) {
				var k = j.date + " " + j.time + " " + j.message + " - " + j.details + " " + j.component;
				switch (i) {
				case L.Level.FATAL:
				case L.Level.ERROR:
					//console.error(k);
					break;
				case L.Level.WARNING:
					//console.warn(k);
					break;
				case L.Level.INFO:
					//console.info ? console.info(k) : console.log(k);
					break;
				case L.Level.DEBUG:
					//console.debug ? console.debug(k) : console.log(k);
					break;
				case L.Level.TRACE:
					//console.trace ? console.trace(k) : console.log(k);
					break;
				}
				//if (console.info && j.supportInfo) {
				//	console.info(j.supportInfo);
				//}
			}
			return j;
		}
	}
	L.getLogEntries = function () {
		return l.slice();
	};
	L.addLogListener = function (o) {
		g().attach(this, o);
	};
	L.removeLogListener = function (o) {
		g().detach(this, o);
	};

	function e(C) {
		this.fatal = function (f, h, i, s) {
			L.fatal(f, h, i || C, s);
			return this;
		};
		this.error = function (f, h, i, s) {
			L.error(f, h, i || C, s);
			return this;
		};
		this.warning = function (f, h, i, s) {
			L.warning(f, h, i || C, s);
			return this;
		};
		this.info = function (f, h, i, s) {
			L.info(f, h, i || C, s);
			return this;
		};
		this.debug = function (f, h, i, s) {
			L.debug(f, h, i || C, s);
			return this;
		};
		this.trace = function (f, h, i, s) {
			L.trace(f, h, i || C, s);
			return this;
		};
		this.setLevel = function (a, f) {
			L.setLevel(a, f || C);
			return this;
		};
		this.getLevel = function (f) {
			return L.getLevel(f || C);
		};
		this.isLoggable = function (a, f) {
			return L.isLoggable(a, f || C);
		};
	}
	L.getLogger = function (C, D) {
		if (!isNaN(D) && m[C] == null) {
			m[C] = D;
		}
		return new e(C);
	};
	return L;
});