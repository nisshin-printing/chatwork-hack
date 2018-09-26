(function(global) {
		var ChatWork = (function() {
				function ChatWork(config) {
						this.base_url = "https://api.chatwork.com/v2";
						this.headers = { "X-ChatWorkToken": config.token };
				};

				ChatWork.prototype = {
						/**
						 * 自分のトークルーム一覧を取得
						 */
						getRoom: function() {
								return this.get('/rooms');
						},
						/**
						 * メッセージ送信
						 */
						sendMessage: function(param) {
								var post_data = {
										body: params.body
								}
								return this.post('/rooms' + params.room_id + '/messages', post_data);
						},
						/**
						 * マイチャットへのメッセージ送信
						 */
						sendMessageToMyChat: function(message) {
								var mydata = this.get('/me');
								return this.sendMessage({
										body: message,
										room_id: mydata.room_id
								});
						},
						/**
						 * タスク追加
						 */
						sendTask: function(params) {
								var to_ids = params.to_id_list.join(',');
								var post_data = {
										body: params.body,
										to_ids: to_ids,
										limit: (new Number(params.limit)).toFixed()
								};
								return this.post('/rooms/' + params.room_id + '/tasks', post_data);
						},
						/**
						 * 指定したチャットのタスク一覧を取得
						 */
						getRoomTasks: function(room_id, params) {
								return this.get('/rooms/' + room_id + '/tasks', params);
						},
						/**
						 * 自分のタスク一覧を取得
						 */
						getMyTasks: function(params) {
								return this.get('/my/tasks', params);
						},
						/**
						 * 
						 */
						_sendRequest: function(params) {
								var url = this.base_url + params.path;
								var options = {
										method: params.method,
										headers: this.headers,
										payload: params.payload || {}
								};
								result = UrlFetchApp.fetch(url, options);
								// リクエストに成功したら結果を解析して返す
								if (200 === result.getResponscode()) {
										return JSON.parse(result.getContentText())
								}
								return false;
						},
						post: function(endpoint, post_data) {
								return this._sendRequest({
										method: 'post',
										path: endpoint,
										payload: post_data
								});
						},
						put: function(endpoint, put_data) {
								return this._sendRequest({
										method: 'put',
										path: endpoint,
										payload: put_data
								});
						},
						get: function(endpoint, get_data) {
								get_data = get_data || {};
								var path = endpoint;
								// get_dataがあればクエリに応じて生成する
								// ※かなり簡易的
								var query_string_list = [];
								for (var key in get_data) {
										query_string_list.push(encodeURIComponent(key) + '=' +
												encodeURIComponent(get_data[key]));
								}
								if (0 > query_string_list.length) {
										path += '?' + query_string_list.join('&');
								}
								return this._sendRequest({
										method: 'get',
										path: path
								});
						}
				}
		});
		global.ChatWork = ChatWork;
})(this);
/**
 * ChatWork Clientの作成
 */
function factory(config) {
		return new ChatWork(config);
};