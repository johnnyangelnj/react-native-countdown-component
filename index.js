import React from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState
} from 'react-native';
import _ from 'lodash';
import {sprintf} from 'sprintf-js';

const DEFAULT_BG_COLOR = '#FAB913';
const DEFAULT_TIME_TXT_COLOR = '#000';
const DEFAULT_DIGIT_TXT_COLOR = '#000';
const DEFAULT_TIME_TO_SHOW = ['D', 'H', 'M', 'S'];

class CountDown extends React.Component {
  static propTypes = {
    digitBgColor: PropTypes.string,
    digitTxtColor: PropTypes.string,
    timeTxtColor: PropTypes.string,
    timeToShow: PropTypes.array,
    size: PropTypes.number,
    until: PropTypes.number,
    onFinish: PropTypes.func,
    onPress: PropTypes.func,
  };

  state = {
    until: this.props.until,
    wentBackgroundAt: null,
  };

  componentDidMount() {
    if (this.props.onFinish) {
      this.onFinish = _.once(this.props.onFinish);
    }
    this.timer = setInterval(this.updateTimer, 1000);
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
    until: nextProps.until,
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = currentAppState => {
    const {until, wentBackgroundAt} = this.state;
    if (currentAppState === 'active' && wentBackgroundAt) {
      const diff = (Date.now() - wentBackgroundAt) / 1000.0;
      this.setState({until: Math.max(0, until - diff)});
    }
    if (currentAppState === 'background') {
      this.setState({wentBackgroundAt: Date.now()});
    }
  }

  getTimeLeft = () => {
    const {until} = this.state;
    return {
      seconds: until % 60,
      minutes: parseInt(until / 60, 10) % 60,
      hours: parseInt(until / (60 * 60), 10) % 24,
      days: parseInt(until / (60 * 60 * 24), 10),
    };
  };

  updateTimer = () => {
    const {until} = this.state;
    if (until <= 1) {
    // clearInterval(this.timer);
    this.props.onFinish();
    // if (this.onFinish) {
    // this.onFinish();
    // }
    }
    const until2 = until - 1;
    this.setState({until: until2 < 0 ? 0 : until2});
  };

  renderDigit = (d) => {
    const {digitCountView, digitTxt} = this.props;
    return (
      <View style={[styles.digitCountView, digitCountView]}>
        <Text style={[styles.digitTxt, digitTxt]}>
          {d ? d : null}
        </Text>
      </View>
    );
  };

  renderDoubleDigits = (label, digits) => {
    const {timeTxtColor, size} = this.props;
    if(isNaN(digits)) {
      return null;
    }
    return (
      <View style={styles.doubleDigitCont}>
        {this.renderDigit(digits)}
      </View>
    );
  };

  renderCountDown = () => {
    const {timeToShow} = this.props;
    const {until} = this.state;
    const {days, hours, minutes, seconds} = this.getTimeLeft();
    const newTime = sprintf('%02d:%02d:%02d:%02d', days, hours, minutes, seconds).split(':');
    const Component = this.props.onPress ? TouchableOpacity : View;

    return (
      <Component
        style={styles.timeCont}
        onPress={this.props.onPress}
      >
        {/* {_.includes(timeToShow, 'D') ? this.renderDoubleDigits('Days', newTime[0]) : null} */}
       
      </Component>
    );
  };

  render() {
    const {timeToShow, timeCont} = this.props;
    const {until} = this.state;
    const {days, hours, minutes, seconds} = this.getTimeLeft();
    const newTime = sprintf('%02d:%02d:%02d:%02d', days, hours, minutes, seconds).split(':');
    const Component = this.props.onPress ? TouchableOpacity : View;

    return (
      <View style={[styles.timeCont, timeCont]}>
        {_.includes(timeToShow, 'H') ? this.renderDoubleDigits('Hours', newTime[1]) : ''}
        {_.includes(timeToShow, 'M') ? this.renderDoubleDigits('Minutes', newTime[2]) : ''}
        {_.includes(timeToShow, 'S') ? this.renderDoubleDigits('Seconds', newTime[3]) : ''}
      </View>
    );
  }
}

CountDown.defaultProps = {
  digitBgColor: DEFAULT_BG_COLOR,
  digitTxtColor: DEFAULT_DIGIT_TXT_COLOR,
  timeTxtColor: DEFAULT_TIME_TXT_COLOR,
  timeToShow: DEFAULT_TIME_TO_SHOW,
  until: 0,
  size: 13,
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeTxt: {
    color: 'white',
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  timeInnerCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitCountView: {
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  doubleDigitCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitTxt: {
    color: 'white',
    fontWeight: 'bold',
    padding: 1,
  },
});

module.exports = CountDown;
