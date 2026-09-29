const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { join } = require("node:path")
const { test } = require("node:test")
const vm = require("node:vm")

const script = readFileSync(join(__dirname, "../Workflow/models"), "utf8")

function context(variables = {}) {
  const scope = {
    $: {
      NSProcessInfo: {
        processInfo: {
          environment: { objectForKey: name => ({ js: variables[name] || "" }) }
        }
      }
    }
  }
  vm.runInNewContext(script, scope)
  return scope
}

test("model list endpoints match selected providers", () => {
  const scope = context()
  assert.equal(scope.modelEndpoint("deepseek"), "https://api.deepseek.com/models")
  assert.equal(scope.modelEndpoint("perplexity"), "https://api.perplexity.ai/router/v1/models")
  assert.equal(context({ chat_api_endpoint: "https://example.com/v1/chat/completions" }).modelEndpoint("custom"),
    "https://example.com/v1/models")
  assert.equal(context({ chat_api_endpoint: "https://example.com/api" }).modelEndpoint("custom"),
    "https://example.com/api/models")
})

test("model picker parses standard model lists and filters by name or ID", () => {
  const scope = context()
  const models = scope.modelList({ data: [
    { id: "org/model-a", name: "Model A" },
    { id: "org/model-b", name: "Model B" },
    { id: "org/image-only", output_modalities: ["image"] },
    { name: "No ID" }
  ] })
  assert.equal(models.length, 2)
  const items = scope.modelItems(models, "model b", "org/model-a")
  assert.equal(items[0].arg, "org/model-b")
  assert.equal(items.length, 1)
})

test("manual model ID remains available when no list matches", () => {
  const items = context().modelItems([], "provider/custom-model", "")
  assert.equal(items[0].arg, "provider/custom-model")
})
