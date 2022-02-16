import React from "react";
import "./styles.css";

import { WebSocketProvider } from "./websocket";
//import { AppStoreProvider } from "./stores";
import { RecoilRoot } from "recoil";
import { LayoutManager } from "./components/layout-manager";

const App = () => (
  // <AppStoreProvider>
  <RecoilRoot>
    <WebSocketProvider>
      <LayoutManager />
    </WebSocketProvider>
  </RecoilRoot>
  // </AppStoreProvider>
);

export default App;
