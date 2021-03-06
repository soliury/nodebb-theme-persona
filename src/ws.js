const WebSocket = require('ws');

function WebSocketClient() {
    this.number = 0;	// Message number
    this.autoReconnectInterval = 5 * 1000;	// ms
}

WebSocketClient.prototype.open = function (url) {
    this.url = url;
    this.instance = new WebSocket(this.url);
    this.active = false;
    this.instance.on('open', () => {
        this.active = true;
        this.onopen();
    });
    this.instance.on('message', (data, flags) => {
        this.number++;
        this.onmessage(data, flags, this.number);
    });
    this.instance.on('close', (e) => {
        switch (e.code) {
            case 1000:	// CLOSE_NORMAL
                console.log("WebSocket: closed");
                break;
            default:	// Abnormal closure
                this.reconnect(e);
                break;
        }
        this.active = false;
        this.onclose(e);
    });
    this.instance.on('error', (e) => {
        switch (e.code) {
            case 'ECONNREFUSED':
                this.reconnect(e);
                this.active = false;
                break;
            default:
                this.onerror(e);
                break;
        }
    });
};

WebSocketClient.prototype.send = function (data, option) {
    try {
        this.instance.send(data, option);
    } catch (e) {
        this.instance.emit('error', e);
    }
};

WebSocketClient.prototype.reconnect = function (e) {
    console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
    this.instance.removeAllListeners();
    var that = this;
    setTimeout(function () {
        console.log("WebSocketClient: reconnecting...");
        that.open(that.url);
    }, this.autoReconnectInterval);
};

WebSocketClient.prototype.onopen = function (e) {
    console.log("WebSocketClient: open", e);
};

WebSocketClient.prototype.onmessage = function (data, flags, number) {
    console.log("WebSocketClient: message", data);
};

WebSocketClient.prototype.onerror = function (e) {
    console.log("WebSocketClient: error", e);
};

WebSocketClient.prototype.onclose = function (e) {
    console.log("WebSocketClient: closed", e);
};

module.exports = WebSocketClient;


