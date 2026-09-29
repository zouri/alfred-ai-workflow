const assert = require("node:assert/strict")
const { execFileSync } = require("node:child_process")
const { existsSync } = require("node:fs")
const { join } = require("node:path")
const { test } = require("node:test")

const workflowDir = join(__dirname, "../Workflow")
const workflow = JSON.parse(execFileSync("plutil", ["-convert", "json", "-o", "-", join(workflowDir, "info.plist")]))

test("model picker is connected to selection and notification actions", () => {
  const filter = workflow.objects.find(item => item.type === "alfred.workflow.input.scriptfilter" && item.config.keyword === "askmodel")
  assert.ok(filter)
  assert.equal(filter.config.scriptfile, "models")
  assert.ok(existsSync(join(workflowDir, filter.config.scriptfile)))

  const selectId = workflow.connections[filter.uid][0].destinationuid
  const select = workflow.objects.find(item => item.uid === selectId)
  assert.equal(select.type, "alfred.workflow.action.script")
  assert.equal(select.config.scriptfile, "select-model")
  assert.ok(existsSync(join(workflowDir, select.config.scriptfile)))

  const notificationId = workflow.connections[selectId][0].destinationuid
  assert.equal(workflow.objects.find(item => item.uid === notificationId).type,
    "alfred.workflow.output.notification")
})
