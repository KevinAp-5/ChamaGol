import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const SIZE = 7;
const MARGIN = 5;
const BG = 'rgb(172, 172, 172)';
const ACTIVE_BG = '#808184';
const dots = [1, 2, 3];
const INTERVAL = 400;
const ANIMATION_DURATION = 400;
const ANIMATION_SCALE = 1.4;

interface DotProps {
  active: boolean;
  size?: number;
  background?: string;
  activeBackground?: string;
  dotMargin?: number;
  animationDuration?: number;
  animationScale?: number;
  color?: string;
}

interface ThreeDotsState {
  active: number;
}

interface ThreeDotsProps {
  color?: string;
}

export default class ThreeDots extends React.Component<ThreeDotsProps, ThreeDotsState> {
  interval: NodeJS.Timeout | undefined;

  state = {
    active: 1,
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      const active = this.state.active;
      this.setState({ active: active > 2 ? 1 : active + 1 });
    }, INTERVAL);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const active = this.state.active;
    const { color } = this.props;
    return (
      <View>
        <View style={styles.main}>
          {dots.map((i) => (
            <Dot key={i} active={i === active} color={color} />
          ))}
        </View>
      </View>
    );
  }
}

class Dot extends React.Component<DotProps> {
  static defaultProps = {
    size: SIZE,
    background: BG,
    activeBackground: ACTIVE_BG,
    dotMargin: MARGIN,
    animationDuration: ANIMATION_DURATION,
    animationScale: ANIMATION_SCALE,
  };

  scale = new Animated.Value(1);

  componentDidMount() {
    if (this.props.active) this.scaleUp();
  }

  componentDidUpdate(prevProps: DotProps) {
    if (prevProps.active && !this.props.active) {
      this.scaleDown();
    }
    if (!prevProps.active && this.props.active) {
      this.scaleUp();
    }
  }

  scaleDown = () => {
    Animated.timing(this.scale, {
      toValue: 1,
      duration: this.props.animationDuration,
      useNativeDriver: true,
    }).start();
  };

  scaleUp = () => {
    Animated.timing(this.scale, {
      toValue: this.props.animationScale,
      duration: this.props.animationDuration,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const { active, size, background, activeBackground, dotMargin, color } = this.props;
    const style = {
      height: size,
      width: size,
      borderRadius: size / 2,
      marginHorizontal: dotMargin,
      backgroundColor: color
        ? (active ? color : `${color}55`)
        : active
        ? activeBackground
        : background,
    };
    return <Animated.View style={[style, { transform: [{ scale: this.scale }] }]} />;
  }
}

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});