import { createMachine, assign, EventObject } from "xstate";
import { Command } from "@L3S/model";

type CommandExecutorContext = {
  componentName: string;
  animationTypeIn: string;
  animationTypeOut: string;
  animationType?: string;
};

type CommandExecutorEventWithCommand = EventObject & {
  command: Command;
};

type CommandExecutorEvent =
  | { type: "showComponent"; command: Command }
  | { type: "hideComponent"; command: Command }
  | { type: "hideAllComponents"; command: Command }
  | { type: "animateComponent"; command: Command }
  | { type: "transitionInEnd" }
  | { type: "transitionOutEnd" }
  | { type: "animationEnd" };

type CommandExecutorTypestate =
  | {
      value: "hidden";
      context: CommandExecutorContext;
    }
  | {
      value: "transitionIn";
      context: CommandExecutorContext;
    }
  | {
      value: "transitionOut";
      context: CommandExecutorContext;
    }
  | {
      value: "visible";
      context: CommandExecutorContext;
    }
  | {
      value: "animation";
      context: CommandExecutorContext;
    };

const checkCommand = (
  context: CommandExecutorContext,
  event: CommandExecutorEvent
) => {
  const command = (event as CommandExecutorEventWithCommand).command;
  return command.params?.name === context.componentName;
};

const checkCommandWithAnimation = (
  context: CommandExecutorContext,
  event: CommandExecutorEvent
) => {
  return checkCommand(context, event) && context.animationType !== undefined;
};

const updateAnimationTypeIn = assign<
  CommandExecutorContext,
  CommandExecutorEvent
>({
  animationType: (context, event) => {
    const command = (event as CommandExecutorEventWithCommand).command;
    return (command.params?.animation as string) || context.animationTypeIn;
  },
});

const updateAnimationTypeOut = assign<
  CommandExecutorContext,
  CommandExecutorEvent
>({
  animationType: (context, event) => {
    const command = (event as CommandExecutorEventWithCommand).command;
    return (command.params?.animation as string) || context.animationTypeOut;
  },
});

const updateAnimationType = assign<
  CommandExecutorContext,
  CommandExecutorEvent
>({
  animationType: (context, event) => {
    const command = (event as CommandExecutorEventWithCommand).command;
    return command.params?.animation as string;
  },
});

const clearAnimationType = assign<CommandExecutorContext, CommandExecutorEvent>(
  {
    animationType: () => undefined,
  }
);

export const commandExecutor = createMachine<
  CommandExecutorContext,
  CommandExecutorEvent,
  CommandExecutorTypestate
>(
  {
    id: "commandExecutor",
    initial: "hidden",
    states: {
      hidden: {
        on: {
          showComponent: {
            cond: checkCommand,
            actions: "updateAnimationTypeIn",
            target: "transitionIn",
          },
        },
      },
      transitionIn: {
        on: {
          transitionInEnd: { target: "visible" },
          hideComponent: {
            cond: checkCommand,
            actions: "updateAnimationTypeOut",
            target: "transitionOut",
          },
          hideAllComponents: {
            cond: checkCommand,
            actions: "updateAnimationTypeOut",
            target: "transitionOut",
          },
          animateComponent: {
            cond: checkCommandWithAnimation,
            actions: "updateAnimationType",
            target: "animation",
          },
        },
      },
      transitionOut: {
        on: {
          showComponent: {
            cond: checkCommand,
            actions: "updateAnimationTypeIn",
            target: "transitionIn",
          },
          transitionOutEnd: {
            target: "hidden",
          },
          animateComponent: {
            cond: checkCommandWithAnimation,
            actions: "updateAnimationType",
            target: "animation",
          },
        },
      },
      visible: {
        on: {
          hideComponent: {
            cond: checkCommand,
            actions: "updateAnimationTypeOut",
            target: "transitionOut",
          },
          hideAllComponents: {
            cond: checkCommand,
            actions: "updateAnimationTypeOut",
            target: "transitionOut",
          },
          animateComponent: {
            cond: checkCommandWithAnimation,
            actions: "updateAnimationType",
            target: "animation",
          },
        },
      },
      animation: {
        on: {
          showComponent: {
            cond: checkCommand,
            actions: "updateAnimationTypeIn",
            target: "transitionIn",
          },
          animationEnd: {
            target: "visible",
          },
          hideComponent: {
            cond: checkCommand,
            actions: "updateAnimationTypeOut",
            target: "transitionOut",
          },
          hideAllComponents: {
            cond: "checkCommand",
            actions: "updateAnimationTypeOut",
            target: "transitionOut",
          },
        },
      },
    },
  },
  {
    actions: {
      updateAnimationType,
      updateAnimationTypeIn,
      updateAnimationTypeOut,
      clearAnimationType,
    },
    guards: { checkCommand, checkCommandWithAnimation },
  }
);
