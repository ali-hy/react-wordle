import { StyleSheet } from 'aphrodite';

const vFlip = {
  //vertical flip keyframes
  '0%': {
    transform: 'scaleY(1)',
  },
  '50%': {
    transform: 'scaleY(0)',
  },
  '100%': {
    transform: 'scaleY(1)',
  },
};

const motion = StyleSheet.create({
  //Animation Classes
  vFlip: {
    animationName: vFlip,
    animationDuration: '0.3s',
    animationTimingFunction: 'linear',
    // animationDelay: '1s',
  },
});

export default { vFlip, motion };
