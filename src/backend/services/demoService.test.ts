import assert from "node:assert/strict";
import test from "node:test";
import {
  getMetrics,
  listContainers,
  listPods,
  parseEnvironment,
  scaleDeployment,
  updateContainer,
} from "./demoService";

test("les métriques contiennent exactement 24 heures et restent bornées", () => {
  for (const environment of ["dev", "prod"] as const) {
    const metrics = getMetrics(environment);
    assert.equal(metrics.length, 24);
    assert.ok(metrics.every((item) => item.cpu >= 0 && item.cpu <= 100 && item.memory >= 0 && item.memory <= 100));
  }
});

test("les actions de conteneur sont isolées par environnement", () => {
  const before = listContainers("prod").find((item) => item.id === "c1");
  updateContainer("c1", "stop", "dev");
  assert.equal(listContainers("dev").find((item) => item.id === "c1")?.status, "stopped");
  assert.equal(listContainers("prod").find((item) => item.id === "c1")?.status, before?.status);
  updateContainer("c1", "start", "dev");
});

test("le scaling accepte zéro à dix réplicas et isole les environnements", () => {
  const initialProdCount = listPods("prod").filter((pod) => pod.deployment === "api").length;
  assert.equal(scaleDeployment("api", 0, "dev"), 0);
  assert.equal(listPods("dev").filter((pod) => pod.deployment === "api").length, 0);
  assert.equal(listPods("prod").filter((pod) => pod.deployment === "api").length, initialProdCount);
  assert.throws(() => scaleDeployment("api", 11, "dev"), /compris entre 0 et 10/);
  scaleDeployment("api", 3, "dev");
});

test("l’environnement accepte uniquement dev et prod", () => {
  assert.equal(parseEnvironment(undefined), "dev");
  assert.equal(parseEnvironment("prod"), "prod");
  assert.throws(() => parseEnvironment("staging"), /doit être « dev » ou « prod »/);
});
