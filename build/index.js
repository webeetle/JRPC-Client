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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isJsonFile = (file) => file.endsWith('.json');
(() => __awaiter(void 0, void 0, void 0, function* () {
    const args = process.argv.slice(2);
    const [file, exportPath, ...rest] = args;
    if (!file) {
        console.log('Please provide a file');
        return;
    }
    else if (!isJsonFile(file)) {
        console.log('Please provide a json file');
        return;
    }
    else {
        const completeFilePath = path_1.default.resolve(process.cwd(), file);
        const completeExportPath = path_1.default.resolve(process.cwd(), exportPath);
        const fileContent = fs_1.default.readFileSync(completeFilePath, 'utf-8');
        const result = generateRpcInterface(fileContent);
        console.log(result);
    }
}))();
function generateRpcInterface(json) {
    const rpcServer = JSON.parse(json);
    const interfaces = [];
    for (const method of rpcServer.methods) {
        const methodName = toCamelCase(method.name);
        const params = method.params
            .map((p) => `${p.name}: ${generateSchemaInterface(p.schema)}`)
            .join(", ");
        const resultType = generateSchemaInterface(method.result.schema);
        const methodSignature = `(${params}): Promise<${resultType}>`;
        const methodDescription = method.description ? `/**\n * ${method.description}\n */\n` : "";
        const methodInterface = `${methodDescription}  ${methodName}${methodSignature};\n`;
        interfaces.push(methodInterface);
    }
    const result = `export interface ${toCamelCase(rpcServer.info.name)}RpcMethods {\n${interfaces.join("\n")}}`;
    return result;
}
function generateSchemaInterface(schema) {
    const typeMap = {
        string: "string",
        number: "number",
        boolean: "boolean",
        null: "null",
        array: "any[]",
        object: "Record<string, any>",
        "date-time": "Date",
        // ...
    };
    const type = typeMap[schema.type];
    if (schema.type === "object") {
        const props = Object.keys(schema.properties)
            .map((k) => `${k}: ${generateSchemaInterface(schema.properties[k])}`)
            .join(", ");
        return `{ ${props} }`;
    }
    else if (schema.type === "array") {
        const itemSchema = generateSchemaInterface(schema.items);
        return `${itemSchema}[]`;
    }
    else {
        return type !== null && type !== void 0 ? type : schema.type;
    }
}
function toCamelCase(str) {
    return str.replace(/-\w/g, (m) => m[1].toUpperCase());
}
