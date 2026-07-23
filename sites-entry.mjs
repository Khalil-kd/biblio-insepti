// Sites executes the packaged Worker directly, without Wrangler's bundling pass.
// OpenNext's server bundle expects a CommonJS-style `require` for Node built-ins,
// so expose the same synchronous module map before loading the Worker.
import * as asyncHooks from "node:async_hooks";
import * as buffer from "node:buffer";
import * as crypto from "node:crypto";
import * as events from "node:events";
import * as fs from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import * as path from "node:path";
import * as stream from "node:stream";
import * as streamWeb from "node:stream/web";
import * as url from "node:url";
import * as util from "node:util";
import * as vm from "node:vm";
import * as zlib from "node:zlib";

const builtins = new Map([
  ["async_hooks", asyncHooks],
  ["node:async_hooks", asyncHooks],
  ["buffer", buffer],
  ["node:buffer", buffer],
  ["crypto", crypto],
  ["node:crypto", crypto],
  ["events", events],
  ["node:events", events],
  ["fs", fs],
  ["node:fs", fs],
  ["http", http],
  ["node:http", http],
  ["https", https],
  ["node:https", https],
  ["path", path],
  ["node:path", path],
  ["stream", stream],
  ["node:stream", stream],
  ["node:stream/web", streamWeb],
  ["url", url],
  ["node:url", url],
  ["util", util],
  ["node:util", util],
  ["vm", vm],
  ["node:vm", vm],
  ["zlib", zlib],
  ["node:zlib", zlib],
]);

globalThis.require = (specifier) => {
  const module = builtins.get(specifier);
  if (module) return module;
  throw new Error(`Unsupported runtime module: ${specifier}`);
};

const workerModule = import("./worker.js");

export default {
  async fetch(request, env, context) {
    const worker = await workerModule;
    return worker.default.fetch(request, env, context);
  },
};
