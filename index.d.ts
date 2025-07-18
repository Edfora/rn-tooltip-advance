import * as React from 'react';
import { StyleProp, ViewStyle, TouchableOpacityProps } from 'react-native';

type Props = {
  popover?: React.ReactElement<{}>;
  withPointer?: boolean,
  toggleOnPress?: boolean,
  height?: number | string,
  width?: number | string,
  containerStyle?: StyleProp<ViewStyle>;
  pointerColor?: string,
  pointerBorderColor?: string,
  onClose?: () => void,
  onOpen?: () => void,
  withOverlay?: boolean,
  overlayColor?: string,
  backgroundColor?: string,
  highlightColor?: string,
  toggleWrapperProps?: TouchableOpacityProps,
  tooltipPosition?: number
  useAsDropDownView?: boolean
  children?: any
};

export default class Tooltip extends React.Component<Props, any> {
  toggleTooltip: () => void;
}
