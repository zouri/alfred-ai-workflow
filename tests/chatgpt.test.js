const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { join } = require("node:path")
const { test } = require("node:test")
const vm = require("node:vm")

const script = readFileSync(join(__dirname, "../Workflow/chatgpt"), "utf8")

function configuration(variables, selections) {
  const context = {
    $: {
      NSFileManager: {
        defaultManager: {
          fileExistsAtPath: () => selections !== undefined
        }
      },
      NSString: {
        stringWithContentsOfFileEncodingError: () => ({ js: JSON.stringify(selections) })
      },
      NSUTF8StringEncoding: 4,
      NSProcessInfo: {
        processInfo: {
          environment: {
            objectForKey: name => ({ js: variables[name] || "" })
          }
        }
      }
    }
  }
  vm.runInNewContext(script, context)
  return context.chatConfiguration()
}

test("existing OpenAI settings remain the default", () => {
  const config = configuration({ openai_api_key: "openai-key", gpt_model: "gpt-4o", openai_org_id: "org-id" })
  assert.equal(config.endpoint, "https://api.openai.com/v1/chat/completions")
  assert.equal(config.model, "gpt-4o")
  assert.deepEqual(Array.from(config.headers), ["--header", "OpenAI-Organization: org-id"])
})

test("DeepSeek uses its own key, endpoint, and default model", () => {
  const config = configuration({ chat_provider: "deepseek", chat_api_key: "deepseek-key", openai_org_id: "org-id" })
  assert.equal(config.key, "deepseek-key")
  assert.equal(config.endpoint, "https://api.deepseek.com/chat/completions")
  assert.equal(config.model, "deepseek-flash")
  assert.equal(config.headers.length, 0)
})

test("provider presets use their Chat Completions endpoints", () => {
  const endpoints = {
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    moonshot: "https://api.moonshot.cn/v1/chat/completions",
    siliconflow: "https://api.siliconflow.cn/v1/chat/completions",
    xai: "https://api.x.ai/v1/chat/completions",
    mistral: "https://api.mistral.ai/v1/chat/completions",
    perplexity: "https://api.perplexity.ai/router/v1/chat/completions",
    glm: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    doubao: "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
  }

  for (const [provider, endpoint] of Object.entries(endpoints)) {
    const config = configuration({ chat_provider: provider, chat_api_key: "provider-key" }, { [provider]: "model-id" })
    assert.equal(config.endpoint, endpoint, provider)
    assert.equal(config.model, "model-id", provider)
    assert.equal(config.key, "provider-key", provider)
    assert.equal(config.headers.length, 0, provider)
    assert.match(configuration({ chat_provider: provider, chat_api_key: "provider-key", chat_model: "old-model" }).error,
      /askmodel/, provider)
  }
})

test("switching providers uses each provider's saved model", () => {
  const selections = { qwen: "qwen-plus", openrouter: "openai/gpt-4o" }
  assert.equal(configuration({ chat_provider: "qwen", chat_api_key: "key" }, selections).model, "qwen-plus")
  assert.equal(configuration({ chat_provider: "openrouter", chat_api_key: "key" }, selections).model, "openai/gpt-4o")
  assert.equal(configuration({ chat_provider: "deepseek", chat_api_key: "key" }, selections).model, "deepseek-flash")
})

test("custom model selections are scoped to the endpoint", () => {
  const variables = { chat_provider: "custom", chat_api_key: "key", chat_api_endpoint: "https://one.example/v1" }
  const selections = { "custom:https://one.example/v1": "model-one" }
  assert.equal(configuration(variables, selections).model, "model-one")
  assert.match(configuration({ ...variables, chat_api_endpoint: "https://two.example/v1" }, selections).error,
    /askmodel/)
})

test("custom provider accepts a base URL or a complete endpoint", () => {
  const base = { chat_provider: "custom", chat_api_key: "custom-key", chat_model: "model-a" }
  assert.equal(configuration({ ...base, chat_api_endpoint: "https://example.com/v1/" }).endpoint,
    "https://example.com/v1/chat/completions")
  assert.equal(configuration({ ...base, chat_api_endpoint: "https://example.com/api/chat/completions" }).endpoint,
    "https://example.com/api/chat/completions")
})

test("missing settings fail before starting a request", () => {
  assert.match(configuration({ chat_provider: "deepseek" }).error, /Chat API Key/)
  assert.match(configuration({ chat_provider: "custom", chat_api_key: "key" }).error, /askmodel/)
  assert.match(configuration({ chat_provider: "custom", chat_api_key: "key", chat_model: "model" }).error, /Chat API Endpoint/)
  assert.match(configuration({ chat_provider: "custom", chat_api_key: "key", chat_model: "model", chat_api_endpoint: "http://example.com" }).error, /HTTPS/)
})
