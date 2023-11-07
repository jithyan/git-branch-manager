import test from "ava";

import { cli } from "../index.js";

test("cli exists in native", (t) => {
  t.truthy(Boolean(cli));
});
