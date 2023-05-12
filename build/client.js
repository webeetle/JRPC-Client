"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class RpcClient {
    constructor(url, resolver) {
        this.url = url;
        this.resolver = resolver;
    }
    createProxy() {
        const proxy = new Proxy({}, {
            get: (target, property) => {
                return (...args) => {
                    // @ts-ignore   
                    return this.sendRequest(property, args);
                };
            }
        });
        return proxy;
    }
    // @ts-ignore
    sendRequest(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                jsonrpc: "2.0",
                method: method.toString(),
                params: params,
                id: (0, uuid_1.v4)(),
            };
            return new Promise((resolve) => {
                this.resolver(this.url, JSON.stringify(data), resolve);
            });
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const resolver = (url, data, resolve) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`send to ${url} data ${data}`);
        resolve('peppe');
    });
    const client = new RpcClient("http://localhost:3000/rpc", resolver);
    const proxy = client.createProxy();
    const result = yield proxy.hi({ name: "John", bithday: new Date() });
    console.log('result', result);
}))();
