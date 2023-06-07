steal('jquery/class',
	'jquery/model',
	'jquery/view/ejs',
	'jquery/controller',
	'jquery/controller/route',
	function($) {

		$.Model('HelperModel', {

			getPasswordStrength: function(success, error) {
				return $.ajax({
					url: baseURL + 'system/account/password/strength' + addToURL,
					dataType: 'json',
					type: "GET",
					xhrFields: { withCredentials: true},
					success: success,
					error: error
				});
			}

		}, {});


		$.Controller("Helper", {
			calendarLocale: function() {
				return {
					'en': {
						days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
						daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
						daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
						months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
						monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
						weekMin: 'wk'
					},
					'pl': {
						days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
						daysShort: ['Nie', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'],
						daysMin: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
						months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
						monthsShort: ['Sty', 'Lu', 'Mar', 'Kw', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Pa', 'Lis', 'Gru'],
						weekMin: 'Tydz'
					},
					'be': {
						months: ['Студзень', 'Люты', 'Сакавік', 'Красавік', 'Травень', 'Чэрвень', 'Ліпень', 'Жнівень', 'Верасень', 'Кастрычнік', 'Лістапад', 'Сьнежань'],
						monthsShort: ['Сту', 'Лют', 'Сак', 'Кра', 'Тра', 'Чэр', 'Ліп', 'Жні', 'Вер', 'Кас', 'Ліс', 'Сьн'],
						days: ['нядзеля', 'панядзелак', 'аўторак', 'серада', 'чацьвер', 'пятніца', 'субота'],
						daysShort: ['ндз', 'пнд', 'аўт', 'срд', 'чцв', 'птн', 'сбт'],
						daysMin: ['Нд', 'Пн', 'Аў', 'Ср', 'Чц', 'Пт', 'Сб'],
						weekMin: 'Тд'
					},
					'de': {
						months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
							'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
						monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
							'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
						days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
						daysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
						daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
						weekMin: 'KW'
					},
					'et': {
						months: ['Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni',
							'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
						monthsShort: ['Jaan', 'Veebr', 'Märts', 'Apr', 'Mai', 'Juuni',
							'Juuli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dets'],
						days: ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
						daysShort: ['Pühap', 'Esmasp', 'Teisip', 'Kolmap', 'Neljap', 'Reede', 'Laup'],
						daysMin: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
						weekMin: 'näd'
					},
					'en-us': {
						days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
						daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
						daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
						months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
						monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
						weekMin: 'wk'
					},
					'es': {
						months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
							'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
						monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
							'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
						days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
						daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'],
						daysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
						weekMin: 'Sm'
					},
					'fr': {
						months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
							'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
						monthsShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
							'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
						days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
						daysShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
						daysMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
						weekMin: 'Sem.'
					},
					'it': {
						months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
							'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
						monthsShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
							'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
						days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
						daysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
						daysMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
						weekMin: 'Sm'
					},
					'lv': {
						months: ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
							'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'],
						monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jūn',
							'Jūl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
						days: ['svētdiena', 'pirmdiena', 'otrdiena', 'trešdiena', 'ceturtdiena', 'piektdiena', 'sestdiena'],
						daysShort: ['svt', 'prm', 'otr', 'tre', 'ctr', 'pkt', 'sst'],
						daysMin: ['Sv', 'Pr', 'Ot', 'Tr', 'Ct', 'Pk', 'Ss'],
						weekMin: 'Nav'
					},
					'hu': {
						months: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
							'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
						monthsShort: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún',
							'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'],
						days: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'],
						daysShort: ['Vas', 'Hét', 'Ked', 'Sze', 'Csü', 'Pén', 'Szo'],
						daysMin: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
						weekMin: 'Hét'
					},
					'pt-br': {
						months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
							'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
						monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
							'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
						days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
						daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
						daysMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
						weekMin: 'Sm'
					},
					'ro': {
						months: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
							'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'],
						monthsShort: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
							'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
						days: ['Duminică', 'Luni', 'Marţi', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'],
						daysShort: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
						daysMin: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
						weekMin: 'Săpt'
					},
					'ru': {
						months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
							'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
						monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
							'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
						days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
						daysShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
						daysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
						weekMin: 'Нед'
					},
					'tr': {
						months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
							'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
						monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
							'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
						days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
						daysShort: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
						daysMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
						weekMin: 'Hf'
					},
					'uk': {
						months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
							'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
						monthsShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
							'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
						days: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота'],
						daysShort: ['нед', 'пнд', 'вів', 'срд', 'чтв', 'птн', 'сбт'],
						daysMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
						weekMin: 'Тиж'
					},
					'zh-cn': {
						months: ['一月', '二月', '三月', '四月', '五月', '六月',
							'七月', '八月', '九月', '十月', '十一月', '十二月'],
						monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月',
							'七月', '八月', '九月', '十月', '十一月', '十二月'],
						days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
						daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
						daysMin: ['日', '一', '二', '三', '四', '五', '六'],
						weekMin: '周'
					},
					'no': {
						months: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
						monthsShort: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
						days: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'],
						daysShort: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
						daysMin: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
						weekMin: 'Uke'
					},
					'sv': {
						months: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
							'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
						monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
							'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
						daysShort: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
						days: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
						daysMin: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
						weekMin: 'Ve'
					}

				};
			},
			updateSalesData: function(salesData) {

				try {
					salesData.pmResponsible.avatar = baseURL + 'users/' + salesData.pmResponsible.id + '/image?width=63&height=63&crop=true';
					salesData.salesPerson.avatar = baseURL + 'users/' + salesData.salesPerson.id + '/image?width=63&height=63&crop=true';

					if (salesData.additionalResponsibles != null)
						$.each(salesData.additionalResponsibles, function(index, value) {
							salesData.additionalResponsibles[index].avatar = baseURL + 'users/' + salesData.additionalResponsibles[index].id + '/image?width=63&height=63&crop=true';
						});
					$("#contacts-list").html("templates/layouts/layout_sales_data.ejs", {salesData: salesData});
				} catch (err) {
				}

			},


			stripTags: function(input) {
			    var allowed = ['<div>','<del>','<br />', '<br/>','<table>','<tbody>','<tr>','<td>','<b>','<strong>','<i>','<font>','<br>','<h1>',
			    '<h2>','<h3>','<h4>','<h5>','<h6>', '<li>', '<ol>', '<ul>', '<em>', '<span>'];
			    allowed = allowed.join("");
				if (input == null) return null;
				allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
				var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
					commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
				return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {				
					return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ?
						$0.replace(new RegExp("(<" + $1 + ")[^<>]*", "gi"), "$1") : '';
				});
			},
			html_entity_decode: function(string, quote_style) {
				var hash_map = {},
					symbol = '',
					tmp_str = '',
					entity = '';
				tmp_str = string.toString();

				if (false === (hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
					return false;
				}

				// fix &amp; problem
				// http://phpjs.org/functions/get_html_translation_table:416#comment_97660
				delete(hash_map['&']);
				hash_map['&'] = '&amp;';

				for (symbol in hash_map) {
					entity = hash_map[symbol];
					tmp_str = tmp_str.split(entity).join(symbol);
				}
				tmp_str = tmp_str.split('&#039;').join("'");

				return tmp_str;
			},
			get_html_translation_table: function(table, quote_style) {
				var entities = {},
					hash_map = {},
					decimal;
				var constMappingTable = {},
					constMappingQuoteStyle = {};
				var useTable = {},
					useQuoteStyle = {};

				// Translate arguments
				constMappingTable[0] = 'HTML_SPECIALCHARS';
				constMappingTable[1] = 'HTML_ENTITIES';
				constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
				constMappingQuoteStyle[2] = 'ENT_COMPAT';
				constMappingQuoteStyle[3] = 'ENT_QUOTES';

				useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
				useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

				if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
					throw new Error("Table: " + useTable + ' not supported');
					// return false;
				}

				entities['38'] = '&amp;';
				if (useTable === 'HTML_ENTITIES') {
					entities['160'] = '&nbsp;';
					entities['161'] = '&iexcl;';
					entities['162'] = '&cent;';
					entities['163'] = '&pound;';
					entities['164'] = '&curren;';
					entities['165'] = '&yen;';
					entities['166'] = '&brvbar;';
					entities['167'] = '&sect;';
					entities['168'] = '&uml;';
					entities['169'] = '&copy;';
					entities['170'] = '&ordf;';
					entities['171'] = '&laquo;';
					entities['172'] = '&not;';
					entities['173'] = '&shy;';
					entities['174'] = '&reg;';
					entities['175'] = '&macr;';
					entities['176'] = '&deg;';
					entities['177'] = '&plusmn;';
					entities['178'] = '&sup2;';
					entities['179'] = '&sup3;';
					entities['180'] = '&acute;';
					entities['181'] = '&micro;';
					entities['182'] = '&para;';
					entities['183'] = '&middot;';
					entities['184'] = '&cedil;';
					entities['185'] = '&sup1;';
					entities['186'] = '&ordm;';
					entities['187'] = '&raquo;';
					entities['188'] = '&frac14;';
					entities['189'] = '&frac12;';
					entities['190'] = '&frac34;';
					entities['191'] = '&iquest;';
					entities['192'] = '&Agrave;';
					entities['193'] = '&Aacute;';
					entities['194'] = '&Acirc;';
					entities['195'] = '&Atilde;';
					entities['196'] = '&Auml;';
					entities['197'] = '&Aring;';
					entities['198'] = '&AElig;';
					entities['199'] = '&Ccedil;';
					entities['200'] = '&Egrave;';
					entities['201'] = '&Eacute;';
					entities['202'] = '&Ecirc;';
					entities['203'] = '&Euml;';
					entities['204'] = '&Igrave;';
					entities['205'] = '&Iacute;';
					entities['206'] = '&Icirc;';
					entities['207'] = '&Iuml;';
					entities['208'] = '&ETH;';
					entities['209'] = '&Ntilde;';
					entities['210'] = '&Ograve;';
					entities['211'] = '&Oacute;';
					entities['212'] = '&Ocirc;';
					entities['213'] = '&Otilde;';
					entities['214'] = '&Ouml;';
					entities['215'] = '&times;';
					entities['216'] = '&Oslash;';
					entities['217'] = '&Ugrave;';
					entities['218'] = '&Uacute;';
					entities['219'] = '&Ucirc;';
					entities['220'] = '&Uuml;';
					entities['221'] = '&Yacute;';
					entities['222'] = '&THORN;';
					entities['223'] = '&szlig;';
					entities['224'] = '&agrave;';
					entities['225'] = '&aacute;';
					entities['226'] = '&acirc;';
					entities['227'] = '&atilde;';
					entities['228'] = '&auml;';
					entities['229'] = '&aring;';
					entities['230'] = '&aelig;';
					entities['231'] = '&ccedil;';
					entities['232'] = '&egrave;';
					entities['233'] = '&eacute;';
					entities['234'] = '&ecirc;';
					entities['235'] = '&euml;';
					entities['236'] = '&igrave;';
					entities['237'] = '&iacute;';
					entities['238'] = '&icirc;';
					entities['239'] = '&iuml;';
					entities['240'] = '&eth;';
					entities['241'] = '&ntilde;';
					entities['242'] = '&ograve;';
					entities['243'] = '&oacute;';
					entities['244'] = '&ocirc;';
					entities['245'] = '&otilde;';
					entities['246'] = '&ouml;';
					entities['247'] = '&divide;';
					entities['248'] = '&oslash;';
					entities['249'] = '&ugrave;';
					entities['250'] = '&uacute;';
					entities['251'] = '&ucirc;';
					entities['252'] = '&uuml;';
					entities['253'] = '&yacute;';
					entities['254'] = '&thorn;';
					entities['255'] = '&yuml;';
				}

				if (useQuoteStyle !== 'ENT_NOQUOTES') {
					entities['34'] = '&quot;';
				}
				if (useQuoteStyle === 'ENT_QUOTES') {
					entities['39'] = '&#39;';
				}
				entities['60'] = '&lt;';
				entities['62'] = '&gt;';


				// ascii decimals to real symbols
				for (decimal in entities) {
					if (entities.hasOwnProperty(decimal)) {
						hash_map[String.fromCharCode(decimal)] = entities[decimal];
					}
				}

				return hash_map;
			},
			validateNewPassword: function(element, passwordStrength, passButton, element2) {

				var self = this;


				if (element.val() != "" || element2.val() != "") {
					$(".password-hints").css('display', 'block');
					$(".password-hints").css('opacity', '1');
				} else {
					$(".password-hints").css('display', 'none');
					$(".password-hints").css('opacity', '0');
				}

				var passwordValidated = true;

				function addError(inSelector) {
					if (!inSelector.hasClass('alert-error')) {
						inSelector.removeClass('alert-success').addClass('alert-error');
						inSelector.find(".icon-success").addClass('icon-error').removeClass('icon-success');
					}
					passwordValidated = false;
				}

				function removeError(inSelector) {
					if (inSelector.hasClass('alert-error')) {
						inSelector.addClass('alert-success').removeClass('alert-error');
						inSelector.find(".icon-error").addClass('icon-success').removeClass('icon-error');
					}
				}


				pswd = element.val();
				pswd2 = element2.val();

				if (pswd.length < passwordStrength.minLength) {

					addError($(".pass-length"));
				} else {
					removeError($(".pass-length"));
				}

				if (pswd.match(/[a-z]/) || passwordStrength.lowerLetter == false) {

					removeError($(".pass-l-letter"));
				} else {

					addError($(".pass-l-letter"));
					//$('#letter').removeClass('valid').addClass('invalid');
				}

				if (pswd.match(/[A-Z]/) || passwordStrength.upperLetter == false) {

					removeError($(".pass-u-letter"));
				} else {

					addError($(".pass-u-letter"));
				}

				if (pswd.match(/[0-9]/) || passwordStrength.digit == false) {

					removeError($(".pass-numeral"));
				} else {

					addError($(".pass-numeral"));
				}

				if (pswd.match(/[\W\_]/) || passwordStrength.specialChar == false) {

					removeError($(".pass-special"));
				} else {

					addError($(".pass-special"));
				}

				if (passwordStrength.notContainLogin == false || pswd != sessionObject.login) {

					removeError($(".pass-not-login"));
				} else {

					addError($(".pass-not-login"));
				}

				if (pswd != pswd2) {

					addError($(".pass-matches"));
				} else {
					removeError($(".pass-matches"));

				}

				if (passwordValidated) {
					passButton.removeClass('disabled');
				} else {
					passButton.addClass('disabled');
				}

			},
			is24hour: function(element) {
				if (sessionObject.dateAndHourFormat.indexOf('H') >= 0 || sessionObject.dateAndHourFormat.indexOf('k') >= 0) return true;
				return false;
			},
			getLanguageCombinationsString: function(languageCombinations) {

				return languageCombinations
					.filter(notAny)
					.filter(withAssociatedTask)
					.map(toSymbolString).join(", ");

				function toSymbolString(languageCombination) {
					return languageCombination.sourceLanguage.symbol + " » " + languageCombination.targetLanguage.symbol;
				}

				function notAny(languageCombination) {
					return languageCombination.sourceLanguage.symbol !== "Any" && languageCombination.targetLanguage.symbol !== "Any";
				}

				function withAssociatedTask(languageCombination) {
					return languageCombination.hasAssociatedTask;
				}

			}

		});


	});