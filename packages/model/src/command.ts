import * as t from "io-ts";

export const CommandParamsV = t.record(
  t.string,
  t.union([t.string, t.boolean, t.number])
);
export type CommandParams = t.TypeOf<typeof CommandParamsV>;

export const CommandV = t.type({
  id: t.string,
  compatibleWith: t.array(t.string),
  name: t.string,
  params: CommandParamsV,
});
export type Command = t.TypeOf<typeof CommandV>;
