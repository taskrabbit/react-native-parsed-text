# React Native Parsed Text

This library allows you to parse a text and extract parts using a `RegExp` or predefined patterns.
Currently there are 3 predefined types: `url`, `phone` and `email`.

All the props are passed down to a new `Text` Component if there is a matching text. If those are functions they will receive as param the value of the text.

## Install

`npm install --save react-native-parsed-text`


## Proptypes

`ParsedText` can receive [Text PropTypes](https://facebook.github.io/react-native/docs/text.html).

`parse`: Array of parsed text.
* to use the predefined type: `{type: 'url'}`.
* to use your own `RegExp`: `{pattern: /something/}`.

`renderText`: Function called to change the displayed children.

`childrenProps` : Properties to pass to the children elements generated by react-native-parsed-text.

eg:
Your str is ```'Mention [@michel:5455345]'``` where 5455345 is ID of this user and @michel the value to display on interface.
Your pattern for ID & username extraction : ```/\[(@[^:]+):([^\]]+)\]/i```
Your renderText method :
```
renderText(matchingString, matches) {
  // matches => ["[@michel:5455345]", "@michel", "5455345"]
  let pattern = /\[(@[^:]+):([^\]]+)\]/i;
  let match = matchingString.match(pattern);
  return `^^${match[1]}^^`;
}
```
Displayed text will be : ```Mention ^^@michel^^```

## Example

```javascript
import ParsedText from 'react-native-parsed-text';

class Example extends React.Component {
  static displayName = 'Example';

  handleUrlPress(url, matchIndex /*: number*/) {
    LinkingIOS.openURL(url);
  }

  handlePhonePress(phone, matchIndex /*: number*/) {
    AlertIOS.alert(`${phone} has been pressed!`);
  }

  handleNamePress(name, matchIndex /*: number*/) {
    AlertIOS.alert(`Hello ${name}`);
  }

  handleEmailPress(email, matchIndex /*: number*/) {
    AlertIOS.alert(`send email to ${email}`);
  }

  renderText(matchingString, matches) {
    // matches => ["[@michel:5455345]", "@michel", "5455345"]
    let pattern = /\[(@[^:]+):([^\]]+)\]/i;
    let match = matchingString.match(pattern);
    return `^^${match[1]}^^`;
  }

  render() {
    return (
      <View style={styles.container}>
        <ParsedText
          style={styles.text}
          parse={
            [
              {type: 'url',                       style: styles.url, onPress: this.handleUrlPress},
              {type: 'phone',                     style: styles.phone, onPress: this.handlePhonePress},
              {type: 'email',                     style: styles.email, onPress: this.handleEmailPress},
              {pattern: /Bob|David/,              style: styles.name, onPress: this.handleNamePress},
              {pattern: /\[(@[^:]+):([^\]]+)\]/i, style: styles.username, onPress: this.handleNamePress, renderText: this.renderText},
              {pattern: /42/,                     style: styles.magicNumber},
              {pattern: /#(\w+)/,                 style: styles.hashTag},
            ]
          }
          childrenProps={{allowFontScaling: false}}
        >
          Hello this is an example of the ParsedText, links like http://www.google.com or http://www.facebook.com are clickable and phone number 444-555-6666 can call too.
          But you can also do more with this package, for example Bob will change style and David too. foo@gmail.com
          And the magic number is 42!
          #react #react-native
        </ParsedText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

  url: {
    color: 'red',
    textDecorationLine: 'underline',
  },

  email: {
    textDecorationLine: 'underline',
  },

  text: {
    color: 'black',
    fontSize: 15,
  },

  phone: {
    color: 'blue',
    textDecorationLine: 'underline',
  },

  name: {
    color: 'red',
  },

  username: {
    color: 'green',
    fontWeight: 'bold'
  },

  magicNumber: {
    fontSize: 42,
    color: 'pink',
  },

  hashTag: {
    fontStyle: 'italic',
  },

});
```

![](https://cloud.githubusercontent.com/assets/159813/11152673/d5fe86f0-89e8-11e5-8b5e-f3c06bdc1b6b.gif)

## TODO

* Add nested text parsing
