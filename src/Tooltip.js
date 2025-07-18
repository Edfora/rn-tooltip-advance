//  @flow

import * as React from 'react';
import {
  TouchableOpacity,
  Modal,
  View
} from 'react-native';
import PropTypes from 'prop-types';

import Triangle from './Triangle';
import TraingleBorder from './TraingleBorder';
import { ScreenWidth, ScreenHeight, isIOS } from './helpers';
import getTooltipCoordinate from './getTooltipCoordinate';

type State = {
  isVisible: boolean,
  yOffset: number,
  xOffset: number,
  elementWidth: number,
  elementHeight: number,
};

type Props = {
  withPointer: boolean,
  popover: React.Element,
  toggleOnPress: boolean,
  height: number | string,
  width: number | string,
  containerStyle: any,
  pointerColor: string,
  pointerBorderColor: string,
  onClose: () => void,
  onOpen: () => void,
  withOverlay: boolean,
  overlayColor: string,
  backgroundColor: string,
  highlightColor: string,
  toggleWrapperProps: {},
  tooltipPosition: number, 
  useAsDropDownView?: boolean,
  toolTipContainerStyle?: ViewStyle
};

class Tooltip extends React.Component<Props, State> {
  state = {
    isVisible: false,
    yOffset: 0,
    xOffset: 0,
    elementWidth: 0,
    elementHeight: 0,
  };

  renderedElement;

  toggleTooltip = () => {
    const { onClose } = this.props;
    this.getElementPosition();
    this.setState(prevState => {
      if (prevState.isVisible && !isIOS) {
        onClose && onClose();
      }

      return { isVisible: !prevState.isVisible };
    });
  };

  wrapWithPress = (toggleOnPress, children) => {
    if (toggleOnPress) {
      return (
        <TouchableOpacity
          onPress={this.toggleTooltip}
          activeOpacity={1}
          {...this.props.toggleWrapperProps}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return children;
  };

  getTooltipStyle = () => {
    const { yOffset, xOffset, elementHeight, elementWidth } = this.state;
    const {
      height,
      backgroundColor,
      width,
      withPointer,
      containerStyle,
      tooltipPosition = -1
    } = this.props;

    const { x, y } = getTooltipCoordinate(
      xOffset,
      yOffset,
      elementWidth,
      elementHeight,
      ScreenWidth,
      ScreenHeight,
      width,
      height,
      withPointer,
      tooltipPosition
    );

    return {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      backgroundColor,
      // default styles
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      borderRadius: 10,
      padding: 10,
      ...containerStyle,
    };
  };

  renderPointer = tooltipY => {
    const { yOffset, xOffset, elementHeight, elementWidth } = this.state;
    const { backgroundColor, pointerColor } = this.props;
    const pastMiddleLine = yOffset > tooltipY;

    return (
      <View
        style={{
          position: 'absolute',
          top: pastMiddleLine ? yOffset - 12 : yOffset + elementHeight - 4,
          left: xOffset + elementWidth / 2 - 7.5,
          zIndex: 2
        }}
      >
        <Triangle
          style={{ borderBottomColor: pointerColor || backgroundColor }}
          isDown={pastMiddleLine}
        />
      </View>
    );
  };
  renderPointerBorder = tooltipY => {
    const { yOffset, xOffset, elementHeight, elementWidth } = this.state;
    const { backgroundColor, pointerBorderColor } = this.props;
    const pastMiddleLine = yOffset > tooltipY;

    return (
      <View
      style={{
        position: 'absolute',
        top: pastMiddleLine ? yOffset - 10 : yOffset + elementHeight - 6,
        left: xOffset + elementWidth / 2 - 7.5,
        zIndex: 1
      }}
    >
      <TraingleBorder
        style={{ borderBottomColor: pointerBorderColor || backgroundColor}}
        isDown={pastMiddleLine}
      />
    </View>
    );
  };
  renderContent = withTooltip => {
    const { popover, withPointer, toggleOnPress, highlightColor, useAsDropDownView } = this.props;

    if (!withTooltip)
      return this.wrapWithPress(toggleOnPress, this.props.children);

    const { yOffset, xOffset, elementWidth, elementHeight } = this.state;
    const tooltipStyle = this.getTooltipStyle();

    let popoverView = (<View style={tooltipStyle}>{popover}</View>)

    if(useAsDropDownView) {
      popoverView = (<TouchableOpacity
      style={tooltipStyle}
      activeOpacity = {1}
      >{popover}</TouchableOpacity>)
    }

    return (
      <View >
        <View
          style={{
            position: 'absolute',
            top: yOffset,
            left: xOffset,
            backgroundColor: highlightColor,
            overflow: 'visible',
            width: elementWidth,
            height: elementHeight,

          }}
        >
          {this.props.children}
        </View>
        {withPointer && this.renderPointer(tooltipStyle.top)}
        {withPointer && this.renderPointerBorder(tooltipStyle.top)}
        {popoverView}
      </View>
    );
  };

  componentDidMount() {
    // wait to compute onLayout values.
    setTimeout(this.getElementPosition, 500);
  }

  getElementPosition = () => {
    this.renderedElement &&
      this.renderedElement.measureInWindow(
        (pageOffsetX, pageOffsetY, width, height) => {
          this.setState({
            xOffset: pageOffsetX,
            yOffset: pageOffsetY,
            elementWidth: width,
            elementHeight: height,
          });
        },
      );
  };

  render() {
    const { isVisible } = this.state;
    const { onClose, withOverlay, onOpen, overlayColor, toolTipContainerStyle } = this.props;

    return (
      <View collapsable={false} style={toolTipContainerStyle} ref={e => (this.renderedElement = e)}>
        {this.renderContent(false)}
        <Modal
          animationType="fade"
          visible={isVisible}
          transparent
          onDismiss={onClose}
          onShow={onOpen}
          onRequestClose={onClose}
        >

          <TouchableOpacity
            style={[styles.container(withOverlay, overlayColor)]}
            onPress={this.toggleTooltip} // to do disable this on press event in order to protect from touches
            activeOpacity={1}
          >
            {this.renderContent(true)}
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

Tooltip.propTypes = {
  children: PropTypes.element,
  withPointer: PropTypes.bool,
  popover: PropTypes.element,
  toggleOnPress: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerStyle: PropTypes.style,
  pointerColor: PropTypes.string,
  pointerBorderColor: PropTypes.string,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  withOverlay: PropTypes.bool,
  toggleWrapperProps: PropTypes.object,
  overlayColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
  tooltipPosition: PropTypes.number,
  useAsDropDownView: PropTypes.bool,
};

Tooltip.defaultProps = {
  toggleWrapperProps: {},
  withOverlay: true,
  highlightColor: 'transparent',
  withPointer: true,
  toggleOnPress: true,
  height: 40,
  width: 150,
  containerStyle: {},
  backgroundColor: '#617080',
  onClose: () => {},
  onOpen: () => {},
  tooltipPosition: -1,
  useAsDropDownView: false
};

const styles = {
  container: (withOverlay, overlayColor) => ({
    backgroundColor: withOverlay
      ? overlayColor
        ? overlayColor
        : 'rgba(250, 250, 250, 0.70)'
      : 'transparent',
    flex: 1,
  }),
};

export default Tooltip;