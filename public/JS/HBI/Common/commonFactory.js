// #region Ajax
var PostDataAjax = function (url, data, callBack, timeout) {
	var tokenString = "";
	var uuid = "";
	var storeID = 0;

	$.ajax({
		url: url,
		type: "POST",
		headers: {
			"Token-String": tokenString,
			"Device-UUID": uuid,
		},

		cache: true,
		dataType: "json",
		data: data,
		processData: true,
		beforeSend: function () { },
		async: true,
		tryCount: 0,
		retryLimit: 3,

		success: function (response) {
			if (response) {
				setTimeout(function () {
					callBack(response);
				}, 10);
			} else {
				setTimeout(callBack, 10);
			}
		},

		error: function (error) {
			LoadingHide();
			// toastr.error(error.statusText);
		}
	});
};

var GetDataAjax = function (url, callBack, timeout) {
	var tokenString = "";
	var uuid = "";
	var storeID = 0;

	$.ajax({
		url: url,
		type: "GET",
		headers: {
			"Token-String": tokenString,
			"Device-UUID": uuid,
		},

		cache: true,
		dataType: "json",
		processData: true,
		beforeSend: function () { },
		async: true,
		tryCount: 0,
		retryLimit: 3,

		success: function (response) {
			if (response) {
				setTimeout(function () {
					callBack(response);
				}, 10);
			} else {
				setTimeout(callBack, 10);
			}
		},

		error: function (error) {
			LoadingHide();
			// toastr.error(error.statusText);
		}
	});
};

(function (window, undefined) {
	'$:nomunge'; // Used by YUI compressor.

	var $ = window.jQuery || window.Cowboy || (window.Cowboy = {}),

		jq_throttle;

	$.throttle = jq_throttle = function (delay, no_trailing, callback, debounce_mode) {
		var timeout_id,

			last_exec = 0;

		if (typeof no_trailing !== 'boolean') {
			debounce_mode = callback;
			callback = no_trailing;
			no_trailing = undefined;
		}

		function wrapper() {
			var that = this,
				elapsed = +new Date() - last_exec,
				args = arguments;

			function exec() {
				last_exec = +new Date();
				callback.apply(that, args);
			};

			function clear() {
				timeout_id = undefined;
			};

			if (debounce_mode && !timeout_id) {
				exec();
			}

			timeout_id && clearTimeout(timeout_id);

			if (debounce_mode === undefined && elapsed > delay) {
				exec();

			} else if (no_trailing !== true) {

				timeout_id = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay);
			}
		};

		if ($.guid) {
			wrapper.guid = callback.guid = callback.guid || $.guid++;
		}

		return wrapper;
	};

	$.debounce = function (delay, at_begin, callback) {
		return callback === undefined
			? jq_throttle(delay, at_begin, false)
			: jq_throttle(delay, callback, at_begin !== false);
	};

})(this);

// #endregion


function LoadingShow() {
	$('.full-overlay').css({ 'z-index': 1000000, 'opacity': .5 });
	$('#mainLoadingSVG').show();
}

function LoadingHide() {
	$('.full-overlay').css({ 'z-index': -1, 'opacity': 0 });
	$('#mainLoadingSVG').hide();
}

function CheckNullOrEmpty(input, strError) {
	if (input === undefined || input.val() == null || input.val().trim() === "" || input.val().trim() == "") {
		toastr.error(strError);
		input.focus();
		return false;
	}
	return true;
}

function GetTodayDate() {
	let date = new Date().toLocaleDateString("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return date.replaceAll("/", "_")
}


// #region DateTime
var now = new Date();
var firstDay = new Date();
var lastDay = new Date();
var currentDay = now.getDay();

// Sunday - Saturday : 0 - 6
//This week
firstDay.setDate(now.getDate() - currentDay);
lastDay.setDate(firstDay.getDate() + 6);
var thisWeek = firstDay.getDate().toString().padStart(2, "0") + '/' + (firstDay.getMonth() + 1).toString().padStart(2, "0") + '/' + firstDay.getFullYear() + ';' + lastDay.getDate().toString().padStart(2, "0") + '/' + (lastDay.getMonth() + 1).toString().padStart(2, "0") + '/' + lastDay.getFullYear();

//Last week
firstDay.setDate(firstDay.getDate() - 7);
lastDay.setDate(lastDay.getDate() - 7);
var lastWeek = firstDay.getDate().toString().padStart(2, "0") + '/' + (firstDay.getMonth() + 1).toString().padStart(2, "0") + '/' + firstDay.getFullYear() + ';' + lastDay.getDate().toString().padStart(2, "0") + '/' + (lastDay.getMonth() + 1).toString().padStart(2, "0") + '/' + lastDay.getFullYear();

//This month
var dayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
lastDay = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
var thisMonth = firstDay.getDate().toString().padStart(2, "0") + '/' + (firstDay.getMonth() + 1).toString().padStart(2, "0") + '/' + firstDay.getFullYear() + ';' + lastDay.getDate().toString().padStart(2, "0") + '/' + (lastDay.getMonth() + 1).toString().padStart(2, "0") + '/' + lastDay.getFullYear();

//Last month
lastDay.setDate(firstDay.getDate() - 1);
firstDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), 1);
var lastMonth = firstDay.getDate().toString().padStart(2, "0") + '/' + (firstDay.getMonth() + 1).toString().padStart(2, "0") + '/' + firstDay.getFullYear() + ';' + lastDay.getDate().toString().padStart(2, "0") + '/' + (lastDay.getMonth() + 1).toString().padStart(2, "0") + '/' + lastDay.getFullYear();

var Timepickers = [
	{ id: 1, value: thisWeek, text: 'Tuần này', default: "" },
	{ id: 2, value: lastWeek, text: 'Tuần trước', default: "" },
	{ id: 3, value: thisMonth, text: 'Tháng này', default: "selected" },
	{ id: 4, value: lastMonth, text: 'Tháng trước', default: "" },
	{ id: 5, value: '5', text: 'Tùy chọn', default: "" }
]

Date.prototype.getWeekNumber = function () {
	var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
	var dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
}

Date.prototype.formatDateDDMMYYYY = function () {
	let date = this.toLocaleDateString("vi-VN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return date;
}

Date.prototype.formatDateMMDDYYYY = function () {
	var dd = String(this.getDate()).padStart(2, '0');
	var mm = String(this.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = this.getFullYear();

	return mm + '/' + dd + '/' + yyyy;
}

function getDateOfWeekVietNam(week) {
	var year = new Date().getFullYear();
	var d = new Date("Jan 01, " + year + " 01:00:00");
	var dayMs = (24 * 60 * 60 * 1000);
	var offSetTimeStart = dayMs * (d.getDay() - 1);
	var w = d.getTime() + 604800000 * (week - 1) - offSetTimeStart; //reducing the offset here
	var n1 = new Date(w);
	var n2 = new Date(w + 518400000);
	return {
		dateFrom: n1,
		dateTo: n2
	}
}

function getDateOfWeek(week) {
	var year = new Date().getFullYear();
	var d = new Date("Jan 01, " + year + " 01:00:00");
	var dayMs = (24 * 60 * 60 * 1000);
	var offSetTimeStart = dayMs * d.getDay();
	var w = d.getTime() + 604800000 * week - offSetTimeStart; //reducing the offset here
	var n1 = new Date(w);
	var n2 = new Date(w + 518400000);
	return {
		dateFrom: new Date(n1.formatDateMMDDYYYY()),
		dateTo: new Date(n2.formatDateMMDDYYYY())
	}
}

function formatDDMMYYHHMMSS(val) {
	var val = new Date(val);
	var dd = String(val.getDate()).padStart(2, '0');
	var mm = String(val.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = val.getFullYear();

	var hh = val.getHours();
	var MM = val.getMinutes();
	var ss = val.getSeconds();
	return dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + MM + ':' + ss;
}

function formatMMDDYYHHMMSS(val) {
	var val = new Date(val);
	var dd = String(val.getDate()).padStart(2, '0');
	var mm = String(val.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = val.getFullYear();

	var hh = val.getHours();
	var MM = val.getMinutes();
	var ss = val.getSeconds();
	return mm + '/' + dd + '/' + yyyy + ' ' + hh + ':' + MM + ':' + ss;
}

function dateSubtractDateReturnSecond(date1, date2){
	return Math.abs(date1 - date2) / 1000;
}

// #endregion

// #region Number
function number_format(number, decimals, dec_point, thousands_sep) {
	// *     example: number_format(1234.56, 2, ',', ' ');
	// *     return: '1 234,56'
	number = (number + '').replace(',', '').replace(' ', '');
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}

// #endregion

// #region String
function stringToSlug(str) {
	// remove accents
	var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
		to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(RegExp(from[i], "gi"), to[i]);
	}

	// str = str.toLowerCase()
	// 	  .trim()
	// 	  .replace(/[^a-z0-9\-]/g, '-')
	// 	  .replace(/-+/g, '-');
	str = str.toLowerCase()
		.trim()

	return str;
}

// #endregion

// #region Array
// get all duplicate property of objects in an array
function getDuplicatePropertyArray(arr, property) {
	const lookup = arr.reduce((a, e) => {
		a[e[property]] = ++a[e[property]] || 0;
		return a;
	}, {});

	return arr.filter(e => lookup[e[property]]);
}

/*
	Distinct duplicate object in array
	Ex: unique(array, ['class', 'fare'])
*/
function unique(arr, keyProps) {
	const kvArray = arr.map(entry => {
		const key = keyProps.map(k => entry[k]).join('|');
		return [key, entry];
	});
	const map = new Map(kvArray);
	return Array.from(map.values());
}

/*
	Sorting object in array by key
	Ex: sortArrayByKey(array, "key", true)
*/
function sortArrayByKey(listData, key, ascending) {
    if(ascending == true)
        return listData.sort((a, b) => (a[key] > b[key]) ? -1 : 1)
    return listData.sort((a, b) => (a[key] > b[key]) ? 1 : -1)
}

// #endregion

// #region Url
function getUrlVars(url) {
    var vars = [], hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[1]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
// #endregion

// #region Cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = 'expires=' + d.toGMTString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = document.cookie;
    try {
        decodedCookie = decodeURIComponent(document.cookie);
    } catch (error) {
        console.log(error);
    }
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
}

function Beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}

// #endregion