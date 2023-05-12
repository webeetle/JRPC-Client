# JRPC-Client


<p align="center">
    <a href="https://github.com/webeetle/JRPC-Client/actions/workflows/npm-publish-github-packages.yml" alt="Build Status">
        <img src="https://img.shields.io/github/actions/workflow/status/webeetle/JRPC-Client/npm-publish-github-packages.yml" alt="Build Status">
    </a>
    <!-- <a href="https://app.codacy.com/gh/webeetle/JRPC-Client/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade" alt="Codacy Badge">
        <img src="https://img.shields.io/codacy/grade/9769707d98ea442683e4bf1f70fbcf46" alt="Codacy Badge">
    </a> -->
    <!-- <a href="https://app.codecov.io/gh/webeetle/JRPC-Server" alt="Codecov">
        <img src="https://img.shields.io/codecov/c/gh/webeetle/JRPC-Server" alt="Codecov">
    </a> -->
    <img src="https://img.shields.io/github/languages/top/webeetle/JRPC-Client" alt="Language">
    <a href="https://github.com/webeetle/JRPC-Client/commits" alt="Last Commit">
        <img src="https://img.shields.io/github/last-commit/webeetle/JRPC-Client" alt="Last Commit">
    </a>
    <a href="https://www.npmjs.com/package/@habeetat/jrpc-client" alt="NPM Version">
        <img src="https://img.shields.io/npm/v/@habeetat/jrpc-client/latest" alt="NPM Version">
    </a>
    <a href="https://github.com/webeetle/JRPC-Client/blob/master/LICENSE.md" alt="License">
        <img src="https://img.shields.io/github/license/webeetle/JRPC-Client" alt="License">
    </a>
</p>

JRPC-Client is a simple JSON-RPC 2.0 client for node.js and browser, developed in typescript for work synergy with [JRPC-Server](https://github.com/webeetle/JRPC-Server).

## Install

```bash
npm i @habeetat/jrpc-client
```

## Todo

- [ ] Test
- [ ] Documentation
- [ ] Enable test in github action

## How to use

```typescript
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
```