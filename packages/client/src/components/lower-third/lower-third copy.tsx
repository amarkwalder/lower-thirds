import React, { FC, useEffect, useState } from "react";
import styled, { keyframes, Keyframes } from "styled-components";
import { Animation } from "react-animations";

import { useRecoilValue, selector } from "recoil";
import { commandsExecAtom, componentSelector } from "../../store";

import {
  Command,
  GridComponentData,
  L3SComponentConfigBig,
  L3SComponentConfigSmall,
} from "@L3S/model";

import "./lower-third.css";

type AnimationProps = {
  duration: number;
  animation?: Keyframes;
};

const AnimationDiv = styled.div.attrs((props: AnimationProps) => ({
  duration: props.duration,
  animation: props.animation,
}))<AnimationProps>`
  animation: ${({ duration }) => duration}s ${({ animation }) => animation};
`;

enum State {
  VISIBLE = "visible",
  HIDDEN = "hidden",
  TRANSITION_IN = "transition-in",
  TRANSITION_OUT = "transition-out",
  ANIMATION = "animation",
}

enum LowerThirdType {
  Small = "Small",
  Big = "Big",
}

type L3SAnimationProps = {
  id: string;
};

const commandExecLowerThirdSelector = selector<Command | undefined>({
  key: "commandExecLowerthirdSelector",
  get: ({ get }) => {
    const command = get(commandsExecAtom);
    return command?.compatibleWith.includes("lower-third")
      ? command
      : undefined;
  },
});

export const L3SAnimation: React.FC<L3SAnimationProps> = ({ id }) => {
  const comp = useRecoilValue(componentSelector(id));
  if (!comp) return null;

  const { name } = comp;
  const { type, animationTypeIn, animationTypeOut } = comp.config
    .data as GridComponentData;

  const [state, setState] = useState<{ name: State; animation?: Animation }>({
    name: State.HIDDEN,
  });

  const commandExec = useRecoilValue(commandExecLowerThirdSelector);

  const check = (
    cmdName: string,
    ...p: { pName: string; pValue: string }[]
  ) => {
    if (!commandExec || commandExec.name !== cmdName) return false;
    return p.reduce(
      (acc, cur) => acc && commandExec.params[cur.pName] === cur.pValue,
      true
    );
  };

  const impAnim = async (animation: string) =>
    (await import(`react-animations/lib/${animation}`)) as Animation;
  useEffect(() => {
    if (check("showComponent", { pName: "name", pValue: name })) {
      console.log(`LowerThird(${name}): showComponent`);
      impAnim(animationTypeIn).then((anim) =>
        setState({ name: State.TRANSITION_IN, animation: anim })
      );
    }

    if (
      check("hideComponent", { pName: "name", pValue: name }) &&
      state.name !== State.HIDDEN
    ) {
      console.log(`LowerThird(${name}): hideComponent`);
      impAnim(animationTypeOut).then((anim) =>
        setState({ name: State.TRANSITION_OUT, animation: anim })
      );
    }

    if (check("hideAllComponents") && state.name !== State.HIDDEN) {
      console.log(`LowerThird(${name}): hideAllComponents`);
      impAnim(animationTypeOut).then((anim) =>
        setState({ name: State.TRANSITION_OUT, animation: anim })
      );
    }

    if (
      check("animateComponent", { pName: "name", pValue: name }) &&
      state.name === State.VISIBLE
    ) {
      console.log(`LowerThird(${name}): animateComponent`);
      impAnim(commandExec?.params["animation"] as string).then((anim) =>
        setState({ name: State.ANIMATION, animation: anim })
      );
    }
  }, [commandExec]);

  const onAnimationStart = () => {
    console.log("onAnimationStart");
  };
  const onAnimationEnd = () => {
    console.log("onAnimationEnd");
    if (state.name === "transition-in") setState({ name: State.VISIBLE });
    if (state.name === "transition-out") setState({ name: State.HIDDEN });
    if (state.name === "animation") setState({ name: State.VISIBLE });
  };

  const LowerThird =
    type === LowerThirdType.Big ? (
      <LowerThirdBig id={id} />
    ) : (
      <LowerThirdSmall id={id} />
    );

  const Hidden = <div />;
  const Visible = <div className="wrapper">{LowerThird}</div>;
  const Animation = (
    <AnimationDiv
      duration={2}
      animation={keyframes`${state.animation?.default}`}
      onAnimationStart={onAnimationStart}
      onAnimationEnd={onAnimationEnd}
      className="wrapper"
    >
      {LowerThird}
    </AnimationDiv>
  );

  switch (state.name) {
    case State.HIDDEN:
      return Hidden;

    case State.VISIBLE:
      return Visible;

    case State.TRANSITION_IN:
    case State.TRANSITION_OUT:
    case State.ANIMATION:
      return Animation;

    default:
      return <div>{`ERROR: Unknown state ${state}`}</div>;
  }

  // if (state.name === State.HIDDEN) {
  //   return Hidden;
  // } else if (state.name === State.VISIBLE) {
  //   return Visible;
  // } else if (state.name === State.TRANSITION_IN) {
  //   return Animation;
  // } else if (state.name === State.TRANSITION_OUT) {
  //   return Animation;
  // } else if (state.name === State.ANIMATION) {
  //   return Animation;
  // } else {
  //   return <div>{`ERROR: Unknown state ${state}`}</div>;
  // }
};

export default L3SAnimation;

export const LowerThirdBig: FC<{ id: string }> = ({ id }) => {
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

export const LowerThirdSmall: FC<{ id: string }> = ({ id }) => {
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
