import * as t from "io-ts";

export const ThreeJsLogoV = t.type({
  logo: t.string,
});
export type ThreeJsLogoV = t.TypeOf<typeof ThreeJsLogoV>;

export const ThreeJsLowerThirdV = t.type({
  name: t.string,
});
export type ThreeJsLowerThirdV = t.TypeOf<typeof ThreeJsLowerThirdV>;

export const ThreeJsComponentDataV = t.union([
  ThreeJsLogoV,
  ThreeJsLowerThirdV,
]);
export type ThreeJsComponentData = t.TypeOf<typeof ThreeJsComponentDataV>;

export const ThreeJsComponentConfigV = t.type({
  compatibleWith: t.array(t.string),
  type: t.string,
  data: ThreeJsComponentDataV,
});
export type ThreeJsComponentConfig = t.TypeOf<typeof ThreeJsComponentConfigV>;

export const ThreeJsLayoutConfigV = t.type({
  type: t.string,
});
export type ThreeJSLayoutConfig = t.TypeOf<typeof ThreeJsLayoutConfigV>;
