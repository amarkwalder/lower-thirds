import React, { useEffect, useState, lazy, Suspense } from "react";
import { ErrorBoundary } from "../../ErrorBoundary";
import { selector, useRecoilValue } from "recoil";

import { layoutsAtom } from "../../store/recoil-store";

const activeLayoutSelector = selector({
  key: "activeLayout",
  get: ({ get }) => get(layoutsAtom).find((layout) => layout.active),
});

export const LayoutManager = () => {
  const [LayoutComponent, setLayoutComponent] = useState<React.FC>();
  const activeLayout = useRecoilValue(activeLayoutSelector);

  useEffect(() => {
    const layoutComponent = lazy(
      () => import(`../${activeLayout?.config?.type || "empty"}`)
    );
    setLayoutComponent(layoutComponent);
  }, [activeLayout]);

  console.log("LayoutManager", activeLayout);

  if (!LayoutComponent) return null;

  return (
    <Suspense fallback="Loading view...">
      <ErrorBoundary>
        <LayoutComponent />
      </ErrorBoundary>
    </Suspense>
  );
};

export default LayoutManager;
