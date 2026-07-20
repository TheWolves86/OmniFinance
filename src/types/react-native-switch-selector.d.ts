declare module "react-native-switch-selector" {
  import * as React from "react";

  export interface SwitchSelectorOption {
    label: string;
    value: string | number;
    testID?: string;
    accessibilityLabel?: string;
  }

  export interface SwitchSelectorProps {
    options: SwitchSelectorOption[];
    initial?: number;
    onPress?: (value: string | number, index: number) => void;
    [key: string]: any;
  }

  class SwitchSelector extends React.Component<SwitchSelectorProps> {}
  export default SwitchSelector;
}
