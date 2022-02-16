import * as t from "io-ts";
import { GridLayoutConfigV } from "./grid-layout";
import { ThreeJsLayoutConfigV } from "./threejs-layout";

export const LayoutV = t.type({
  id: t.string,
  active: t.boolean,
  name: t.string,
  config: t.union([GridLayoutConfigV, ThreeJsLayoutConfigV]),
});
export type Layout = t.TypeOf<typeof LayoutV>;
