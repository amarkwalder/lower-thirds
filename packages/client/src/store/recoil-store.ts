import { Layout, Component, Command } from "@l3s/model";
import { atom, selectorFamily } from "recoil";

// const fetchData =
//   <T>(resource: string) =>
//   async (id?: string) => {
//     let url = `http://localhost:4000/${resource}`;
//     if (id) {
//       url = `${url}?id=${id}`;
//     }
//     console.log("Fetch Data - START", url);
//     const result = await fetch(url).then((res) => res.json() as Promise<T[]>);
//     console.log("Fetch Data - DONE", result);
//     return result.length > 0 ? result[0] : undefined;
//   };

// -----------------------------------------------------------------------------------------------------------------
// Layout

export const layoutsAtom = atom<Layout[]>({
  key: "layoutsAtom",
  default: [],
});

export const layoutSelector = selectorFamily<Layout | undefined, string>({
  key: `layoutSelector`,
  get:
    (id) =>
    ({ get }) =>
      get(layoutsAtom).find((layout) => layout.id === id),
});

// -----------------------------------------------------------------------------------------------------------------
// Component

export const componentsAtom = atom<Component[]>({
  key: "componentsAtom",
  default: [],
});

export const componentSelector = selectorFamily<Component | undefined, string>({
  key: `componentSelector`,
  get:
    (id) =>
    ({ get }) =>
      get(componentsAtom).find((component) => component.id === id),
});

// -----------------------------------------------------------------------------------------------------------------
// Command

export const commandsAtom = atom<Command[]>({
  key: "commandsAtom",
  default: [],
});

export const commandsExecAtom = atom<Command | undefined>({
  key: "commandsExecAtom",
  default: undefined,
});

export const commandSelector = selectorFamily<Command | undefined, string>({
  key: `commandSelector`,
  get:
    (id) =>
    ({ get }) =>
      get(commandsAtom).find((command) => command.id === id),
});

// const fetchCommand = fetchData<Command>("commands");

// export const commandAtom = atomFamily<Command | undefined, string>({
//   key: "command",
//   default: undefined,
// });

// export const commandIds = atom<string[]>({
//   key: `commandIds`,
//   default: [],
// });

// export const commandSelector = selectorFamily<Command | undefined, string>({
//   key: `coommandSelector`,
//   get: (id) => () => fetchCommand(id),
//   set:
//     (id) =>
//     ({ set, reset }, newValue) => {
//       if (newValue instanceof DefaultValue) {
//         reset(commandAtom(id));
//         set(commandIds, (prevIds) => prevIds.filter((prevId) => prevId !== id));
//       } else {
//         set(commandAtom(id), newValue);
//         set(commandIds, (prevIds) => [...prevIds, id]);
//       }
//     },
// });

// export const commandAllSelector = selector({
//   key: `commandAllSelector`,
//   get: ({ get }) => get(commandIds).map((id) => get(commandSelector(id))),
// });
