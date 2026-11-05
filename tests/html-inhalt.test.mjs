// Aufruf: npm test (Node 22, --experimental-strip-types für den TypeScript-Import)
import assert from "node:assert/strict";
import { test } from "node:test";

import { hatSichtbarenInhalt } from "../lib/html-inhalt.ts";

test("leerer Inhalt und leere Hüllen zählen nicht als Inhalt", () => {
  for (const html of ["", "   \n", "<p></p>", "<p>&nbsp;</p>", "<!-- wp:paragraph --><p> </p><!-- /wp:paragraph -->", "<h2></h2><ul><li></li></ul>"]) {
    assert.equal(hatSichtbarenInhalt(html), false, html);
  }
});

test("Text und Medien zählen als Inhalt", () => {
  for (const html of ["<p>Text</p>", "<h2>Für wen ist das?</h2>", '<p><img src="/a.webp" alt="" /></p>']) {
    assert.equal(hatSichtbarenInhalt(html), true, html);
  }
});
