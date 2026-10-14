// Aufruf: npm test (Node 22, --experimental-strip-types für den TypeScript-Import)
import assert from "node:assert/strict";
import { test } from "node:test";

import { decodeEntities } from "../lib/entities.ts";

test("Begriffsnamen aus WordPress werden dekodiert", () => {
  assert.equal(decodeEntities("Kinder &amp; Jugend"), "Kinder & Jugend");
  assert.equal(decodeEntities("Soziale Dienste &amp; Vereine"), "Soziale Dienste & Vereine");
  assert.equal(decodeEntities("&quot;Obdach&quot; &#039;x&#039; &#8211; &#x2013;"), "\"Obdach\" 'x' – –");
});

test("ein Durchlauf, unbekannte Entities bleiben", () => {
  assert.equal(decodeEntities("&amp;lt;b&amp;gt;"), "&lt;b&gt;");
  assert.equal(decodeEntities("A &foo; B & C"), "A &foo; B & C");
  assert.equal(decodeEntities("Süd"), "Süd");
});
