import React, { FC, useEffect, useState, lazy, Suspense } from "react";
import { ErrorBoundary } from "../../ErrorBoundary";

import { selector, selectorFamily, useRecoilValue } from "recoil";
import { componentSelector, componentsAtom } from "../../store/recoil-store";

import { GridComponentConfig, GridLayoutPosition, Component } from "@l3s/model";

import "./grid-layout.css";

import styled from "styled-components";

const Grid = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-columns: 33% 33% 33%;
  grid-template-rows: 33% 33% 33%;
  grid-template-areas:
    "TOP_LEFT TOP_CENTER TOP_RIGHT"
    "MIDDLE_LEFT MIDDLE_CENTER MIDDLE_RIGHT"
    "BOTTOM_LEFT BOTTOM_CENTER BOTTOM_RIGHT";
`;

const PositionAlign: { [pos: string]: string[] } = {};
PositionAlign[GridLayoutPosition.TOP_LEFT] = ["left", "start"];
PositionAlign[GridLayoutPosition.TOP_CENTER] = ["center", "start"];
PositionAlign[GridLayoutPosition.TOP_RIGHT] = ["right", "start"];
PositionAlign[GridLayoutPosition.MIDDLE_LEFT] = ["left", "center"];
PositionAlign[GridLayoutPosition.MIDDLE_CENTER] = ["center", "center"];
PositionAlign[GridLayoutPosition.MIDDLE_RIGHT] = ["right", "center"];
PositionAlign[GridLayoutPosition.BOTTOM_LEFT] = ["left", "end"];
PositionAlign[GridLayoutPosition.BOTTOM_CENTER] = ["center", "end"];
PositionAlign[GridLayoutPosition.BOTTOM_RIGHT] = ["right", "end"];

type GridItemProps = {
  pos: string;
};

const GridItem = styled.div.attrs((props: GridItemProps) => ({
  pos: props.pos,
}))<GridItemProps>`
  padding: 25px;
  color: white;
  grid-area: ${(props) => props.pos};
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: ${(props) => PositionAlign[props.pos][0]};
  align-items: ${(props) => PositionAlign[props.pos][1]};
`;

type DynamicGridComponentProps = {
  id: string;
};

const DynamicGridComponent: FC<DynamicGridComponentProps> = ({ id }) => {
  const [DynamicComponent, setDynamicComponent] =
    useState<React.FC<{ id: string }>>();

  const component = useRecoilValue(componentSelector(id));
  if (!component) return null;

  const { name } = component;
  const { type, gridPosition } = component.config as GridComponentConfig;

  useEffect(() => {
    const dynamicComponent = lazy(() => import(`../${type}`));
    setDynamicComponent(dynamicComponent);
  }, [type]);

  if (DynamicComponent) {
    return (
      <Suspense fallback={`Loading component ${name} at ${gridPosition}...`}>
        <ErrorBoundary>
          <DynamicComponent id={id} />
        </ErrorBoundary>
      </Suspense>
    );
  }

  return <div />;
};

const gridComps = selector<Component[]>({
  key: "gridComps",
  get: ({ get }) =>
    get(componentsAtom).filter(
      (comp) => comp.config?.compatibleWith.includes("grid-layout") || false
    ),
});

const gridCompsForPos = selectorFamily<Component[], string>({
  key: "gridCompsForPos",
  get:
    (pos) =>
    ({ get }) =>
      get(gridComps).filter(
        (comp) => (comp.config as GridComponentConfig).gridPosition === pos
      ),
});

export const GridLayout = () => {
  const getCompsForPos = (pos: string) => useRecoilValue(gridCompsForPos(pos));
  const DynamicGrid: React.FC = () => (
    <Grid>
      {Object.keys(GridLayoutPosition).map((pos) => (
        <GridItem key={pos} pos={pos}>
          {getCompsForPos(pos).map((comp) => (
            <DynamicGridComponent key={comp.name} id={comp.id} />
          ))}
        </GridItem>
      ))}
    </Grid>
  );

  return <DynamicGrid />;
};

export default GridLayout;
