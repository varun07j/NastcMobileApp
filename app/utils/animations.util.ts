import { Animation, AnimationDefinition } from "tns-core-modules/ui/animation";
import { AnimationCurve } from "tns-core-modules/ui/enums";
import { screen } from "tns-core-modules/platform";
import { topmost } from "tns-core-modules/ui/frame";
import { View } from "tns-core-modules/ui/core/view";
import { Button } from "tns-core-modules/ui/button";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";

/**
 * Animate the hidden Route Planner form onto the main page layout.
 */
export function ShowRoutePlannerAnimation() {
  const hiddenRouteForm = topmost().currentPage.getViewById(
    "hiddenRouteForm"
  ) as View;
  const directionsFab = topmost().currentPage.getViewById(
    "directionsFab"
  ) as Button;
  const locationFab = topmost().currentPage.getViewById(
    "getLocationFab"
  ) as Button;
  const mapStyleButton = topmost().currentPage.getViewById(
    "mapStyleButton"
  ) as Button;

  const animationArray: AnimationDefinition[] = [
    {
      target: hiddenRouteForm,
      duration: 400,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      },
      curve: AnimationCurve.linear
    },
    {
      target: locationFab,
      duration: 500,
      delay: 100,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    },
    {
      target: directionsFab,
      duration: 500,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    },
    {
      target: mapStyleButton,
      duration: 500,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    }
  ];

  new Animation(animationArray).play();
}

export function CloseRouteFormAnimation() {
  const hiddenRouteForm = topmost().currentPage.getViewById(
    "hiddenRouteForm"
  ) as View;
  const directionsFab = topmost().currentPage.getViewById(
    "directionsFab"
  ) as Button;
  const locationFab = topmost().currentPage.getViewById(
    "getLocationFab"
  ) as Button;
  const mapStyleButton = topmost().currentPage.getViewById(
    "mapStyleButton"
  ) as Button;

  const animationArray: AnimationDefinition[] = [
    {
      target: hiddenRouteForm,
      duration: 400,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    },
    {
      target: locationFab,
      duration: 500,
      delay: 50,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      },
      curve: AnimationCurve.easeOut
    },
    {
      target: directionsFab,
      duration: 400,
      delay: 100,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      },
      curve: AnimationCurve.easeOut
    },
    {
      target: mapStyleButton,
      duration: 500,
      delay: 150,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      }
    }
  ];

  new Animation(animationArray).play();
}

export function ShowStopDetailLayoutAnimation() {
  const directionsFab = topmost().currentPage.getViewById(
    "directionsFab"
  ) as Button;
  const locationFab = topmost().currentPage.getViewById(
    "getLocationFab"
  ) as Button;
  const mapStyleButton = topmost().currentPage.getViewById(
    "mapStyleButton"
  ) as Button;
  const stopDetailLayout = topmost().currentPage.getViewById(
    "stopDetailLayout"
  ) as View;

  const animationArray: AnimationDefinition[] = [
    {
      target: stopDetailLayout,
      duration: 400,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      },
      curve: AnimationCurve.linear
    },
    {
      target: locationFab,
      duration: 475,
      delay: 150,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    },
    {
      target: directionsFab,
      duration: 500,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    },

    {
      target: mapStyleButton,
      duration: 500,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    }
  ];

  new Animation(animationArray).play();
}

export function CloseStopDetailLayoutAnimation() {
  const directionsFab = topmost().currentPage.getViewById(
    "directionsFab"
  ) as Button;
  const locationFab = topmost().currentPage.getViewById(
    "getLocationFab"
  ) as Button;
  const mapStyleButton = topmost().currentPage.getViewById(
    "mapStyleButton"
  ) as Button;
  const stopDetailLayout = topmost().currentPage.getViewById(
    "stopDetailLayout"
  ) as View;

  const animationArray: AnimationDefinition[] = [
    {
      target: stopDetailLayout,
      duration: 400,
      opacity: 0,
      translate: {
        x: 0,
        y: 1200
      },
      curve: AnimationCurve.easeIn
    },
    {
      target: locationFab,
      duration: 500,
      delay: 100,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      },
      curve: AnimationCurve.easeOut
    },
    {
      target: directionsFab,
      duration: 500,
      delay: 150,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      },
      curve: AnimationCurve.easeOut
    },
    {
      target: mapStyleButton,
      duration: 500,
      delay: 150,
      opacity: 1,
      translate: {
        x: 0,
        y: 0
      }
    }
  ];

  new Animation(animationArray).play();
}
