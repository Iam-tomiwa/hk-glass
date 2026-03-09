const fs = require("fs");
const path = require("path");

const openapiPath = path.join(__dirname, "openapi.json");
const openapi = JSON.parse(fs.readFileSync(openapiPath, "utf8"));

// We will map schema refs to actual TypeScript types.
function typeMap(schema) {
  if (!schema) return "any";
  if (schema.$ref) {
    return schema.$ref.split("/").pop();
  }
  if (schema.type === "string") {
    return "string";
  }
  if (schema.type === "integer" || schema.type === "number") {
    return "number";
  }
  if (schema.type === "boolean") {
    return "boolean";
  }
  if (schema.type === "array") {
    return `${typeMap(schema.items)}[]`;
  }
  if (schema.anyOf) {
    const types = schema.anyOf
      .map((s) => typeMap(s))
      .filter((t) => t !== "null" && t !== "undefined");
    if (types.length === 1) return types[0] + " | null";
    return types.join(" | ") + " | null";
  }
  return "any";
}

function convertName(name) {
  // Try to remove fastAPI auto-generated path suffixes
  // e.g. "list_admin_devices_api_admin_devices_get" -> "list_admin_devices"
  if (name.includes("_api_")) {
    name = name.split("_api_")[0];
  } else if (name.includes("_setup_device")) {
    name = name.split("_setup_device")[0];
  } else if (name.includes("_health")) {
    name = name.split("_health")[0];
  }

  // convert snake_case or kebab-case to PascalCase
  return name.replace(/(^|[_-])([a-z])/g, (_, a, b) => b.toUpperCase());
}

const schemas = {};
for (const [name, schema] of Object.entries(openapi.components.schemas)) {
  if (name === "HTTPValidationError" || name === "ValidationError") continue;

  let fields = [];
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required && schema.required.includes(propName);
      const isNullable =
        propSchema.anyOf && propSchema.anyOf.some((s) => s.type === "null");
      fields.push(
        `  ${propName}${isRequired && !isNullable ? "" : "?"}: ${typeMap(propSchema)};`,
      );
    }
  }
  schemas[name] = `export interface ${name} {\n${fields.join("\n")}\n}`;
}

const tags = {};

for (const [pathStr, pathObj] of Object.entries(openapi.paths)) {
  for (const [method, operation] of Object.entries(pathObj)) {
    let tag = operation.tags ? operation.tags[0] : "default";
    if (!tags[tag]) tags[tag] = { imports: new Set(), endpoints: [] };

    let requestBodyType = "any";
    if (
      operation.requestBody &&
      operation.requestBody.content["application/json"]
    ) {
      requestBodyType = typeMap(
        operation.requestBody.content["application/json"].schema,
      );
      if (requestBodyType && requestBodyType !== "any") {
        const baseType = requestBodyType.replace("[]", "");
        tags[tag].imports.add(baseType);
      }
    }

    let responseType = "any";
    if (
      operation.responses["200"] &&
      operation.responses["200"].content &&
      operation.responses["200"].content["application/json"]
    ) {
      responseType = typeMap(
        operation.responses["200"].content["application/json"].schema,
      );
      if (responseType && responseType !== "any") {
        const baseTypes = responseType.replace("[]", "").split(" | ");
        for (let bt of baseTypes) {
          bt = bt.trim().replace(" | null", "");
          if (
            bt !== "null" &&
            bt !== "undefined" &&
            openapi.components.schemas[bt]
          ) {
            tags[tag].imports.add(bt);
          }
        }
      }
    }

    const pathParams = [];
    const queryParams = [];

    if (operation.parameters) {
      for (const param of operation.parameters) {
        if (param.in === "path") {
          const pt = typeMap(param.schema);
          pathParams.push({ name: param.name, type: pt });
          if (pt && pt !== "any" && openapi.components.schemas[pt]) {
            tags[tag].imports.add(pt);
          }
        } else if (param.in === "query") {
          const pt = typeMap(param.schema);
          queryParams.push({
            name: param.name,
            type: pt,
            required: param.required,
          });
          if (pt && pt !== "any") {
            pt.split(" | ").forEach((x) => {
              const b = x.trim().replace(" | null", "");
              if (b && openapi.components.schemas[b]) tags[tag].imports.add(b);
            });
          }
        }
      }
    }

    const funcName = convertName(operation.operationId).replace(/^[A-Z]/, (c) =>
      c.toLowerCase(),
    );
    const isMutation =
      method === "post" ||
      method === "put" ||
      method === "patch" ||
      method === "delete";

    tags[tag].endpoints.push({
      path: pathStr,
      method,
      funcName,
      isMutation,
      requestBodyType,
      responseType,
      pathParams,
      queryParams,
      summary: operation.summary,
    });
  }
}

// Generate the output files
const apiDir = path.join(__dirname, "services", "api");
const queriesDir = path.join(__dirname, "services", "queries");
const typesDir = path.join(__dirname, "services", "types");

// write schemas to types/openapi.ts
const typesOutput = Object.values(schemas).join("\n\n");
fs.writeFileSync(path.join(typesDir, "openapi.ts"), typesOutput);

const keysTs = `
export const queryKeys = {
  // auto-generated keys
${Object.keys(tags)
  .map(
    (tag) =>
      `  ${tag.replace(/-/g, "_")}: {\n    all: ['${tag}'] as const,\n    list: (params?: any) => [...queryKeys.${tag.replace(/-/g, "_")}.all, 'list', params] as const,\n    detail: (id: string | number) => [...queryKeys.${tag.replace(/-/g, "_")}.all, 'detail', id] as const,\n  }`,
  )
  .join(",\n")}
};
`;
fs.writeFileSync(path.join(queriesDir, "openapi-keys.ts"), keysTs);

for (const [tag, group] of Object.entries(tags)) {
  const importsArr = Array.from(group.imports).filter(
    (it) => it.indexOf("|") === -1 && it !== "any",
  );

  // API file
  let apiCode = `import { get, post, put, patch, del } from "@/lib/axios-setup";\n`;
  if (importsArr.length > 0) {
    apiCode += `import { ${importsArr.join(", ")} } from "../types/openapi";\n\n`;
  } else {
    apiCode += `\n`;
  }

  // Queries file
  let queryCode = `"use client";\n\nimport { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";\nimport { toast } from "sonner";\nimport { queryKeys } from "./openapi-keys";\nimport { getErrorMessage } from "@/lib/error-handler";\n`;
  const apiFuncs = group.endpoints.map((e) => e.funcName);
  if (apiFuncs.length > 0) {
    queryCode += `import {\n  ${apiFuncs.join(",\n  ")}\n} from "../api/${tag}";\n`;
  }

  if (importsArr.length > 0) {
    queryCode += `import { ${importsArr.join(", ")} } from "../types/openapi";\n\n`;
  } else {
    queryCode += `\n`;
  }

  for (const ep of group.endpoints) {
    // API logic
    const args = [];
    let url = ep.path;

    ep.pathParams.forEach((p) => {
      args.push(`${p.name}: ${p.type}`);
      url = url.replace(`{${p.name}}`, `\${${p.name}}`);
    });

    if (ep.requestBodyType !== "any") {
      args.push(`data: ${ep.requestBodyType}`);
    } else if (ep.isMutation && ep.method !== "delete") {
      args.push(`data?: any`);
    }

    if (ep.queryParams.length > 0) {
      const qParams = ep.queryParams
        .map((q) => `${q.name}${q.required ? "" : "?"}: ${q.type}`)
        .join("; ");
      args.push(`params?: { ${qParams} }`);
    }

    const argStr = args.length > 0 ? args.join(", ") : "";

    let axiosCall = "";
    const endpointArgs = [];
    if (ep.method === "get" || ep.method === "delete") {
      endpointArgs.push(`\`${url}\``);
      if (ep.queryParams.length > 0) endpointArgs.push(`{ params }`);
      axiosCall = `${ep.method === "delete" ? "del" : "get"}<${ep.responseType}>(${endpointArgs.join(", ")})`;
    } else {
      endpointArgs.push(`\`${url}\``);
      if (args.find((a) => a.startsWith("data"))) endpointArgs.push("data");
      else endpointArgs.push("{}");
      if (ep.queryParams.length > 0) endpointArgs.push(`{ params }`);
      axiosCall = `${ep.method}<${ep.responseType}>(${endpointArgs.join(", ")})`;
    }

    apiCode += `// ${ep.summary}\nexport async function ${ep.funcName}(${argStr}): Promise<${ep.responseType}> {\n  return await ${axiosCall};\n}\n\n`;

    // Query hooks logic
    const hookName = `use${ep.funcName.charAt(0).toUpperCase() + ep.funcName.slice(1)}`;
    if (ep.isMutation) {
      const mutArgs = [];
      const callArgs = [];

      ep.pathParams.forEach((p) => {
        mutArgs.push(`${p.name}: ${p.type}`);
        callArgs.push(p.name);
      });

      if (ep.requestBodyType !== "any") {
        mutArgs.push(`data: ${ep.requestBodyType}`);
        callArgs.push("data");
      } else if (ep.method !== "delete") {
        mutArgs.push(`data?: any`);
        callArgs.push("data");
      }

      if (ep.queryParams.length > 0) {
        const qz = ep.queryParams
          .map((q) => `${q.name}${q.required ? "" : "?"}: ${q.type}`)
          .join("; ");
        mutArgs.push(`params?: { ${qz} }`);
        callArgs.push("params");
      }

      const mutArgObj =
        mutArgs.length > 0
          ? `{ ${mutArgs.map((x) => x.split(":")[0].replace("?", "")).join(", ")} }: { ${mutArgs.join("; ")} }`
          : "()";
      const callArgsStr = callArgs.join(", ");

      queryCode += `export function ${hookName}() {\n  const queryClient = useQueryClient();\n  return useMutation({\n    mutationFn: (${mutArgObj}) => ${ep.funcName}(${callArgsStr}),\n    onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: queryKeys.${tag.replace(/-/g, "_")}.all });\n      toast.success("Action successful.");\n    },\n    onError: (error: any) => {\n      toast.error(getErrorMessage(error, "Failed. Please try again."));\n    },\n  });\n}\n\n`;
    } else {
      let qArgs = [];
      let callArgs = [];
      ep.pathParams.forEach((p) => {
        qArgs.push(`${p.name}: ${p.type}`);
        callArgs.push(p.name);
      });
      if (ep.queryParams.length > 0) {
        const qz = ep.queryParams
          .map((q) => `${q.name}${q.required ? "" : "?"}: ${q.type}`)
          .join("; ");
        qArgs.push(`params?: { ${qz} }`);
        callArgs.push("params");
      }
      const callArgsStr = callArgs.join(", ");
      const qArgsStr = qArgs.join(", ");

      const isList = ep.pathParams.length === 0;
      let qKeyParams = ep.queryParams.length > 0 ? "params" : "undefined";
      if (!isList) {
        qKeyParams = ep.pathParams[0].name;
      }

      // build dynamic query key
      const qKeyObj = `queryKeys.${tag.replace(/-/g, "_")}.${isList ? "list" : "detail"}(${qKeyParams})`;

      queryCode += `export function ${hookName}(${qArgsStr}) {\n  return useQuery<${ep.responseType}>({\n    queryKey: ${qKeyObj},\n    queryFn: () => ${ep.funcName}(${callArgsStr}),\n  });\n}\n\n`;
    }
  }

  fs.writeFileSync(path.join(apiDir, `${tag}.ts`), apiCode);
  fs.writeFileSync(path.join(queriesDir, `${tag}.ts`), queryCode);
  console.log(`Generated API and Queries for ${tag}`);
}
