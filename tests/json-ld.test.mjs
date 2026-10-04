// Aufruf: npm test (Node 22, --experimental-strip-types für den TypeScript-Import)
import assert from "node:assert/strict";
import { test } from "node:test";

import { serializeJsonLd } from "../lib/json-ld.ts";

const schema = {
  "@context": "https://schema.org",
  "@graph": [{ "@type": "BlogPosting", headline: 'Märkte </script><script>alert("x")</script> in Krefeld' }],
};

test("ein Titel mit </script> beendet das Script-Element nicht", () => {
  const json = serializeJsonLd(schema);
  assert.ok(!json.includes("<"), json);
  assert.ok(!/<\/script/i.test(json), json);
});

test("die Daten bleiben unverändert", () => {
  assert.deepEqual(JSON.parse(serializeJsonLd(schema)), schema);
});
