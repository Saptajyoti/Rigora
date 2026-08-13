import { transitions } from './transitions';

const createVariants = (reduceMotion) => {
  const y = (value) => (reduceMotion ? 0 : value);
  const scale = (value) => (reduceMotion ? 1 : value);
  const horizontal = (value) => (reduceMotion ? 0 : value);

  return {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: transitions.standard },
      exit: { opacity: 0, transition: transitions.fast },
    },
    fadeUp: {
      hidden: { opacity: 0, y: y(16) },
      visible: { opacity: 1, y: 0, transition: transitions.page },
      exit: { opacity: 0, y: y(-4), transition: transitions.fast },
    },
    fadeDown: {
      hidden: { opacity: 0, y: y(-12) },
      visible: { opacity: 1, y: 0, transition: transitions.standard },
      exit: { opacity: 0, y: y(-4), transition: transitions.fast },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: scale(0.98) },
      visible: { opacity: 1, scale: 1, transition: transitions.standard },
      exit: { opacity: 0, scale: scale(0.985), transition: transitions.fast },
    },
    staggerContainer: {
      hidden: {},
      visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
    },
    staggerItem: {
      hidden: { opacity: 0, y: y(12) },
      visible: { opacity: 1, y: 0, transition: transitions.standard },
    },
    drawer: {
      hidden: { opacity: 0, x: horizontal('100%') },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: horizontal('100%') },
    },
    heroMedia: {
      hidden: { opacity: 0, x: horizontal(15), scale: scale(1.03) },
      visible: { opacity: 1, x: 0, scale: 1, transition: transitions.page },
    },
    modal: {
      hidden: { opacity: 0, y: y(-5), scale: scale(0.98) },
      visible: { opacity: 1, y: 0, scale: 1, transition: transitions.fast },
      exit: {
        opacity: 0,
        y: y(-4),
        scale: scale(0.985),
        transition: transitions.fast,
      },
    },
    pageTransition: {
      hidden: { opacity: 0, y: y(12) },
      visible: { opacity: 1, y: 0, transition: transitions.page },
      exit: { opacity: 0, transition: transitions.fast },
    },
  };
};

export const motionVariants = createVariants(false);
export const reducedMotionVariants = createVariants(true);
export const getMotionVariants = (reduceMotion) =>
  reduceMotion ? reducedMotionVariants : motionVariants;

export const viewportOptions = { once: true, amount: 0.2 };
export const headingViewportOptions = { once: true, amount: 0.35 };

export const {
  fadeIn,
  fadeUp,
  fadeDown,
  scaleIn,
  staggerContainer,
  staggerItem,
  drawer,
  heroMedia,
  modal,
  pageTransition,
} = motionVariants;
