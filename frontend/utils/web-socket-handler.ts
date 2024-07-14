import SockJS from "sockjs-client";
import webstomp, {Client, type ExtendedHeaders, Frame, type Message, type Subscription, type SubscriptionsMap} from "webstomp-client";


/**
 * WebSocket Wrapper class
 */

export type WebSocketEventHandler = (message: any) => void
export type SubscribeHandler = (message: any) => void

export interface TopicSubscriber {
    topic: string,
    listeners: SubscribeHandler[]
    subscribe?: Subscription
}

export interface EventListener {
    count: number
    funcs: { [key: number] : WebSocketEventHandler }
}

export default class WebSocketHandler {

    enableReconnect: boolean;
    connecting: boolean;
    disconnecting: boolean;
    sessionId: string;
    private _client?: Client;
    private _topicSubscribers: { [topic: string]: TopicSubscriber };
    private _url: string;
    private _headers: {}
    private _eventListeners: { [event: string]: EventListener };


    /**
     * Constructor
     * @param host
     */
    constructor(host: string) {
        this.connecting = false
        this.disconnecting = false
        this._topicSubscribers = {}
        this._url = host;
        this._headers = {}
        this._eventListeners = {}
        this.enableReconnect = true;
        this.sessionId = '';
    }

    connected(): boolean {
        return !!(this._client && this._client.connected);
    }


    // initialize async socket
    open(sessionId: string) {

        this.connecting = true;
        this.sessionId = sessionId;


        if (this.connected()) {
            this.close();
        }

        let socket = new SockJS(this._url, [], {
            sessionId: ()=>{return sessionId}
        });

        this._client = webstomp.over(socket);
        this._client.debug = () => {

        };

        this._client.connect(this._headers, this.onOpened.bind(this), this.onError.bind(this))
    }

    reopen() {
        if (this.connecting) {
            console.log('Already try to connect....')
        } else {
            this.close();
            this.open(this.sessionId);
        }
    }

// close async socket
    close() {
        this.unsubscribeAll();
        this.enableReconnect = false;
        if (this.connected()) {
            this._client?.disconnect(this.onClosed.bind(this));
            this._client = undefined;
            this.disconnecting = true;
        }
    }

// send request
    send(destination: string, body?: string, headers?: ExtendedHeaders) {
        if (this.connected()) {
            this._client?.send(destination, body, headers);
        } else {
            console.warn("client not connected. send(destination=" + destination + ",body=" + body + ",headers=" + headers + ")");
        }

    }

// subscribe
    subscribe(topic: string, callback: SubscribeHandler): {
        topic?: string,
        subscriber?: SubscribeHandler,
        unsubscribe?: () => void
    } {
        const self = this;
        console.debug("subscribe:" + topic);
        if (this._topicSubscribers[topic]) {

            if (callback) {
                for (let i = 0; i < this._topicSubscribers[topic].listeners.length; i++) {
                    if (this._topicSubscribers[topic].listeners[i] === callback) {
                        return {};
                    }
                }
                this._topicSubscribers[topic].listeners.push(callback);
            }
        } else {
            let topicSubscriber: TopicSubscriber = {topic: topic, listeners: [callback]};
            this._topicSubscribers[topic] = topicSubscriber;
            if (this.connected()) {
                // @ts-ignore
                topicSubscriber.subscribe = this._client?.subscribe(topic, async function (frame: any) {
                    topicSubscriber.listeners.forEach(function (listener) {
                        self._notifyToListener(listener, frame)
                    })
                })
            }
        }

        return {
            topic: topic,
            subscriber: callback,
            unsubscribe: () => {
                this.unsubscribe(topic, callback)
            }
        };
    }

    unsubscribe(topic: string, callback: SubscribeHandler) {
        console.log('unsubscribe', topic)

        let topicSubscriber: TopicSubscriber = this._topicSubscribers[topic];
        if (topicSubscriber) {

            // @ts-ignore
            const idx = topicSubscriber.listeners.findIndex(function (item) {
                return item === callback
            })
            if (idx > -1) topicSubscriber.listeners.splice(idx, 1)

            /** OnMessage 만 남은 경우 **/
            if (topicSubscriber.listeners.length === 0) {
                topicSubscriber.subscribe?.unsubscribe();
                delete this._topicSubscribers[topic];
            }
        }

    }

    unsubscribeInClient(client: Client) {
        if (!client) return;

        let subs: SubscriptionsMap = {};
        for (let i in client.subscriptions) {
            subs[i] = client.subscriptions[i];
        }

        for (let id in subs) {
            this._client?.unsubscribe(id);
        }
    }


    unsubscribeAll() {
        if (this._client) {
            this.unsubscribeInClient(this._client)
        }

        for (let topic in this._topicSubscribers) {
            delete this._topicSubscribers[topic]
        }
    }

    private _notifyToListener(listener: SubscribeHandler, socketData: Message) {
        let body = socketData.body;
        body = JSON.parse(body);
        this.onReceive(body)
        listener(body)
    }

    resubscribeAll() {
        const self = this
        if (this.connected()) {
            for (let topic in this._topicSubscribers) {
                let topicSubscriber: TopicSubscriber = this._topicSubscribers[topic];
                if (topicSubscriber.listeners) {
                    topicSubscriber.subscribe = this._client?.subscribe(topicSubscriber.topic, function (frame: any) {
                        topicSubscriber.listeners.forEach(function (listener) {
                            self._notifyToListener(listener, frame)
                        })
                    })
                } else {
                    delete this._topicSubscribers[topic]
                }
            }
        }
    }


    onReceive(msg?: any) {
        this.callEvent("onReceive", msg);
    }


    onOpened(frame?: Frame) {
        this.connecting = false;
        this.resubscribeAll();
        this.callEvent("onOpened", [frame]);
    }

    onError(frame: CloseEvent|Frame) {
        console.error('WebSocketHandler:onError', frame)
        this.connecting = false;
        this.callEvent("onError", [frame]);
    }

    onClosed() {
        this.connecting = false;
        this.disconnecting = false;
        this.callEvent("onClosed", []);

        if (this.enableReconnect) {
            //TODO: try reconnect
        }

    }


    callEvent(eventName: string, args: any) {
        if (this._eventListeners[eventName]) {
            for (let func in this._eventListeners[eventName].funcs) {
                this._eventListeners[eventName].funcs[func] && this._eventListeners[eventName].funcs[func](args);
            }
        }
    }

    addEventListener(eventName: string, handler: WebSocketEventHandler): () => void {
        let self = this;
        if (!self._eventListeners[eventName]) {
            self._eventListeners[eventName] = {count: 0, funcs: {}};
        }

        const key = self._eventListeners[eventName].count++;
        self._eventListeners[eventName].funcs[key] = handler;
        return function () {
            delete self._eventListeners[eventName].funcs[key];
        };
    }

    addEventListenerOnce(eventName: string, handler: WebSocketEventHandler): () => void {
        let unsubscribe = this.addEventListener(eventName, function () {
            handler(undefined);
            unsubscribe();
        });
        return unsubscribe;
    }


    removeEventListener(eventName: string, handler?: WebSocketEventHandler) {
        if (handler)
            for (const key in this._eventListeners[eventName].funcs) {
                if (this._eventListeners[eventName].funcs[key] === handler)
                    delete this._eventListeners[eventName].funcs[key];
            }
        else delete this._eventListeners[eventName];
    }

    removeEventListenerAll(eventName: string) {
        this._eventListeners[eventName];
    }
}


