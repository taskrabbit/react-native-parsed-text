declare module 'react-native-parsed-text' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  interface BaseParseShape extends Pick<TextProps, Exclude<keyof TextProps, 'onPress' | 'onLongPress' >> {
      renderText?: (matchingString: string) => string;
      onPress?: (text: string, index: number) => void;
      onLongPress?: (text: string, index: number) => void;
  }

  interface DefaultParseShape extends BaseParseShape {
      type: 'url' | 'phone' | 'email';
  }

  interface CustomParseShape extends BaseParseShape {
      pattern: string | RegExp;
  }

  type ParseShape = DefaultParseShape | CustomParseShape;

  export interface ParsedTextProps extends TextProps {
      parse?: ParseShape[];
      childrenProps?: TextProps;
  }

  export default class ParsedText extends Component<ParsedTextProps> {}
}
