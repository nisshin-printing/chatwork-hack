/**
 * イベント通知用のオブジェクト生成
 */
function factory(api_token) {
		return new EventNotifier(api_token);
}

/**
 * 指定カレンダーの予定をチャットワークへ通知
 */
function notify(calendar_id, room_id, option) {};

(function(global) {
		var EventNotifier = (function() {
				function EventNotifier(api_token) {
						this.api_token = api_token;
				}
				EventNotifier.prototype = {
						/**
						 * 指定カレンダーの予定を、指定チåャットへ通知する
						 */
						notify: function(calendar_id, room_id, option) {
								// 通知メッセージ取得
								var message = this.getNotifyMessage(calendar_id, option);

								// チャットワークAPIで送信
								var cw = ChatWorkClient.factory({ token: this.api_token });
								cw.sendMessage({ room_id: room_id, body: message });
						},
						/**
						 * 指定カレンダーの予定をチャットワークのメッセージの形式で取得する
						 */
						getNotifyMessage: function(calendar_id, option) {
								option = option || {};
								var event_date = option.date || (new Date());
								var events_header = option.header || '';
								var events_header_no_event = option.header_no_event || '';
								var target_calendar = CalendarApp.getCalendarById(calendar_id);
								var calendar_name = target_calendar.getName();
								var event_list = target_calendar.getEventsForDay(event_date);
								var tpl, message_list = [];
								for (var i = 0, len = event_list.length; i < len; i++) {
										tpl = HtmlService.createTemplateFromFile('event');

										var all_day_event = event_list[i].isAllDayEvent();

										/**
										 * 終日イベントの場合、開始日とチェックしている予定日の日付が一致しているか確認
										 * 終日イベントは 2013-11-11 00-00-00 - 2013-11-12 00-00-00 というように次の日の0時までという扱いなので、
										 * 11月12日の予定を取得した時に、前日の終日イベントが紛れ込む
										 */
										if (all_day_event) {
												if (event_list[i].getStartTime().getDate() != event_date.getDate()) {
														continue;
												}
										}
										tpl.title = event_list[i].getTitle();
										tpl.all_day_event = all_day_event;
										tpl.start_date = this.dateFormat(event_list[i].getStartTime());
										tpl.end_date = this.dateFormat(event_list[i].getEndTime());
										tpl.guest_list = this.getGuestList(event_list[i]);
										message_list.push(tpl.evaluate().getContent());
								}
								// 送信メッセージ作成
								var message_tpl = HtmlService.createTemplateFromFile('events');
								message_tpl.calendar_name = calendar_name;
								message_tpl.message_list = message_list;
								message_tpl.title = events_header;
								message_tpl.title_no_event = events_header_no_event;
								return message_tpl.evaluate().getContent();
						},
						/**
						 * 通知が必要かチェック
						 */
						needNotify: function() {
								var day = (new Date()).getDay();
								if (0 === day || 6 === day) {
										return false;
								}
								return true;
						},
				};

				// 参加者一覧を取得
				EventNotifier.prototype.getGuestList = function(event) {
						var guest_list = event.getGuestList();
						var guest_name_list = [];
						// 参加者名取得
						for (var i = 0, len = guest_list.length; i < len; i++) {
								guest_name_list.push(guest_list[i].getName());
						}

						return guest_name_list;
				};

				// dateFormat 関数の定義
				EventNotifier.prototype.dateFormat = function(date) {
						var month = date.getMonth() + 1;
						var day = date.getDate();
						var hour = date.getHours();
						var minutes = date.getMinutes();

						month = ('0' + month).slice(-2);
						day = ('0' + day).slice(-2);
						minutes = ('0' + minutes).slice(-2);
						hour = ('0' + hour).slice(-2);

						// フォーマット整形済みの文字列を戻り値にする
						return month + '月' + day + '日' + hour + '時' + minutes + '分';
				};

				return EventNotifier;

		})();

		global.EventNotifier = EventNotifier;

})(this);