import * as t from "io-ts";
import { GridComponentConfigV } from "./grid-layout";
import { ThreeJsComponentConfigV } from "./threejs-layout";

export const ComponentV = t.type({
  id: t.string,
  name: t.string,
  config: t.union([GridComponentConfigV, ThreeJsComponentConfigV]),
});
export type Component = t.TypeOf<typeof ComponentV>;
