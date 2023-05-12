import fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import path from 'path';

const isJsonFile = (file: string) => file.endsWith('.json');

(async () => {
    const args = process.argv.slice(2);
    const [file, exportPath, ...rest] = args;
    if (!file) {
        console.log('Please provide a file');
        return;
    } else if (!isJsonFile(file)) {
        console.log('Please provide a json file');
        return;
    } else {
        const completeFilePath = path.resolve(process.cwd(), file);
        const completeExportPath = path.resolve(process.cwd(), exportPath);
        const fileContent = fs.readFileSync(completeFilePath, 'utf-8');

        const result = generateRpcInterface(fileContent);

        console.log(result);

    }
})();

interface RpcMethodParam {
    name: string;
    description: string;
    schema: JSONSchema4;
}

interface RpcMethodResult {
    name: string;
    description: string;
    schema: JSONSchema4;
}

interface RpcMethod {
    name: string;
    description: string;
    params: RpcMethodParam[];
    result: RpcMethodResult;
}

interface RpcServerInfo {
    name: string;
    description: string;
    version: string;
}

interface RpcServer {
    version: string;
    info: RpcServerInfo;
    methods: RpcMethod[];
}

function generateRpcInterface(json: string): string {
    const rpcServer: RpcServer = JSON.parse(json);
  
    const interfaces: string[] = [];
  
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
  
    const result = `export interface ${toCamelCase(rpcServer.info.name)}RpcMethods {\n${interfaces.join(
      "\n"
    )}}`;
  
    return result;
  }
  

function generateSchemaInterface(schema: any): string {
    const typeMap: Record<string, string> = {
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
    } else if (schema.type === "array") {
      const itemSchema = generateSchemaInterface(schema.items);
      return `${itemSchema}[]`;
    } else {
      return type ?? schema.type;
    }
  }
  


function toCamelCase(str: string): string {
    return str.replace(/-\w/g, (m) => m[1].toUpperCase());
}
