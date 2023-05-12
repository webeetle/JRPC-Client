import { v4 as uuidv4 } from "uuid";

type JRPCMethod<T> = T extends (...args: any[]) => Promise<infer R> ? (...args: Parameters<T>) => Promise<R> : never;

type JRPCClientProxy<T> = {
    [K in keyof T]: JRPCMethod<T[K]>;
};

export class JRPCClient<T> {
    private readonly url: string;
    private readonly resolver: (url: string, data: string, resolve: (result: any) => void) => Promise<void>;

    constructor(url: string, resolver: (url: string, data: string, resolve: (result: any) => void) => Promise<void>) {
        this.url = url;
        this.resolver = resolver;
    }

    public createProxy(): JRPCClientProxy<T> {
        const proxy = new Proxy({}, {
            get: (target, property) => {
                return (...args: any[]) => {
                    // @ts-ignore   
                    return this.sendRequest(property as keyof T, args);
                };
            }
        });

        return proxy as JRPCClientProxy<T>;
    }

    // @ts-ignore
    private async sendRequest<K extends keyof T>(method: K, params: Parameters<T[K]>): Promise<ReturnType<T[K]>> {
        const data = {
            jsonJRPC: "2.0",
            method: method.toString(),
            params: params,
            id: uuidv4(),
        };

        return new Promise((resolve) => {
            this.resolver(this.url, JSON.stringify(data), resolve);
        });
    }
}