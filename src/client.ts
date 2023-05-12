import { v4 as uuidv4 } from "uuid";

type RpcMethod<T> = T extends (...args: any[]) => Promise<infer R> ? (...args: Parameters<T>) => Promise<R> : never;

type RpcClientProxy<T> = {
    [K in keyof T]: RpcMethod<T[K]>;
};

class RpcClient<T> {
    private readonly url: string;
    private readonly resolver: (url: string, data: string, resolve: (result: any) => void) => Promise<void>;

    constructor(url: string, resolver: (url: string, data: string, resolve: (result: any) => void) => Promise<void>) {
        this.url = url;
        this.resolver = resolver;
    }

    public createProxy(): RpcClientProxy<T> {
        const proxy = new Proxy({}, {
            get: (target, property) => {
                return (...args: any[]) => {
                    // @ts-ignore   
                    return this.sendRequest(property as keyof T, args);
                };
            }
        });

        return proxy as RpcClientProxy<T>;
    }

    // @ts-ignore
    private async sendRequest<K extends keyof T>(method: K, params: Parameters<T[K]>): Promise<ReturnType<T[K]>> {
        const data = {
            jsonrpc: "2.0",
            method: method.toString(),
            params: params,
            id: uuidv4(),
        };

        return new Promise((resolve) => {
            this.resolver(this.url, JSON.stringify(data), resolve);
        });
    }
}


export interface TestServerRpcMethods {
    /**
     * say hi
     */
    hi(person: { name: string, bithday: Date }): Promise<string>;

    /**
     * sum two numbers
     */
    sum(a: number, b: number): Promise<number>;

    /**
     * get all todos
     */
    getTodos(): Promise<{ id: number, text: string, completed: boolean }[]>;
}

(async () => {
    const resolver = async (url: string, data: string, resolve: (result: any) => void) => {
        console.log(`send to ${url} data ${data}`);
        resolve('peppe');
    };
    const client = new RpcClient<TestServerRpcMethods>("http://localhost:3000/rpc", resolver);
    const proxy = client.createProxy();
    const result = await proxy.hi({ name: "John", bithday: new Date() });
    console.log('result', result);
})();
