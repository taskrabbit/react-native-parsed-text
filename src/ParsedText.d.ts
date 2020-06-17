declare module 'react-native-parsed-text' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  interface BaseParseShape
    extends Pick<
      TextProps,
      Exclude<keyof TextProps, 'onPress' | 'onLongPress'>
    > {
    /** arbitrary function to rewrite the matched string into something else */
    renderText?: (matchingString: string, matches: string[]) => string;
    onPress?: (text: string, index: number) => void;
    onLongPress?: (text: string, index: number) => void;
  }

  /**
   * This is for built-in-patterns already supported by this library
   */
  interface DefaultParseShape extends BaseParseShape {
    type: 'url' | 'phone' | 'email';
  }
  /**
   * If you want to provide a custom regexp, this is the configuration to use.
   * -- For historical reasons, all regexps are processed as if they have the global flag set.
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
