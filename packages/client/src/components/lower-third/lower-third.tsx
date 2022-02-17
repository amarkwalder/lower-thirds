import React, { FC, useEffect, useState } from "react";
import styled, { keyframes, Keyframes } from "styled-components";
import { animated, useSpring } from "@react-spring/web";

import { useMachine } from "@xstate/react";
import { commandExecutor } from "./command-executor";

import { useRecoilValue, selector } from "recoil";
import { commandsExecAtom, componentSelector } from "../../store";

import {
  Command,
  GridComponentData,
  L3SComponentConfigBig,
  L3SComponentConfigSmall,
} from "@l3s/model";

import "./lower-third.css";

enum LowerThirdType {
  Small = "Small",
  Big = "Big",
}

const commandExecLowerThirdSelector = selector<Command | undefined>({
  key: "commandExecLowerthirdSelector",
  get: ({ get }) => {
    const command = get(commandsExecAtom);
    return command?.compatibleWith.includes("lower-third")
      ? command
      : undefined;
  },
});

export const LowerThird: React.FC<{ id: string }> = ({ id }) => {
  const comp = useRecoilValue(componentSelector(id));
  if (!comp) return null;

  const { name } = comp;
  const { type, animationTypeIn, animationTypeOut } = comp.config
    .data as GridComponentData;

  const [state, send] = useMachine(commandExecutor, {
    context: {
      componentName: name,
      animationTypeIn: animationTypeIn,
      animationTypeOut: animationTypeOut,
    },
  });

  const commandExec = useRecoilValue(commandExecLowerThirdSelector);
  useEffect(() => {
    if (commandExec?.name) {
      send({
        type: commandExec.name as
          | "showComponent"
          | "hideComponent"
          | "hideAllComponents"
          | "animateComponent",
        command: commandExec,
      });
    }
  }, [commandExec]);

  console.log("Render", name, state.value);

  const animationIn = rotateIn;
  const animationOut = rotateOut;
  const animation = { from: { scale: 1.0 }, to: { scale: 0.0 } };

  const springProps = (
    animationProps: object,
    animationType?: "transitionInEnd" | "transitionOutEnd" | "animationEnd"
  ) => {
    const result = animationType
      ? { onRest: () => send({ type: animationType }) }
      : {};
    return {
      ...animationProps,
      ...result,
    };
  };

  let props = {};
  switch (state.value) {
    case "transitionIn":
      props = springProps(animationIn, "transitionInEnd");
      break;

    case "transitionOut":
      props = springProps(animationOut, "transitionOutEnd");
      break;

    case "animation":
      props = springProps(animation, "animationEnd");
      break;

    case "hidden":
      props = springProps({ from: { opacity: 0.0 } });
      break;

    case "visible":
      break;

    default:
      return <div className="wrapper">{`ERROR: Unknown state ${state}`}</div>;
  }

  const style = useSpring(props);
  return (
    <animated.div className="wrapper" style={style}>
      {type === LowerThirdType.Big ? (
        <LowerThirdBig id={id} />
      ) : (
        <LowerThirdSmall id={id} />
      )}
    </animated.div>
  );
};

export default LowerThird;

const rotateIn = {
  from: {
    opacity: 0.0,
    transform: "scale(0.0) rotate(180deg)",
  },
  to: {
    opacity: 1.0,
    transform: `scale(1.0) rotate(0deg)`,
  },
};

const rotateOut = {
  from: {
    opacity: 1.0,
    transform: "scale(1.0) rotate(0deg)",
  },
  to: {
    opacity: 0.0,
    transform: `scale(0.0) rotate(180deg)`,
  },
};

const rotateInOut = (isVisible: boolean) => {
  return {
    from: {
      opacity: 0,
      transform: "scale(0) rotate(0deg)",
    },
    to: {
      opacity: isVisible ? 1.0 : 0,
      transform: `scale(${isVisible ? "1.0" : "0"}) rotate(${
        isVisible ? 0 : 180
      }deg)`,
    },
  };
};

const LowerThirdBig: FC<{ id: string }> = ({ id }) => {
  const data = useRecoilValue(componentSelector(id))?.config
    .data as L3SComponentConfigBig;
  if (!data) return null;

  return (
    <div className="animation-l3s-big">
      <div className="color2 animation-l3s-left">[</div>
      <div className="color1 bold arimo mask animation-l3s-line1">
        <div>{data.line1}</div>
      </div>
      <div className="color1 light mask animation-l3s-line2">
        <div>{data.line2}</div>
      </div>
      <div className="color2 mask animation-l3s-slash">/</div>
      <div className="color1 bold arimo mask animation-l3s-logo">
        {data.logo}
      </div>
      <div className="color2 animation-l3s-right">]</div>
    </div>
  );
};

const LowerThirdSmall: FC<{ id: string }> = ({ id }) => {
  const data = useRecoilValue(componentSelector(id))?.config
    .data as L3SComponentConfigSmall;
  if (!data) return null;

  return (
    <div className="animation-l3s-small">
      <div className="color2 animation-l3s-left">[</div>
      <div className="color1 bold arimo mask animation-l3s-line1">
        <div>{data.line1}</div>
      </div>
      <div className="color1 light mask animation-l3s-line2">
        <div>{data.line2}</div>
      </div>
      <div className="color2 animation-l3s-right">]</div>
    </div>
  );
};
