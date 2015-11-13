# React Native Parsed Text

This library allows you to parse a text and extract parts using a `RegExp` or predefined patterns.
Currently there is 2 predefined types: `url` and `phone`.

All the props are passed down to a new `Text` Component if there is a matching text. If those are functions they will receive as param the value of the text.

## Install

`npm install --save react-native-parsed-text`

## Example

```javascript
class Example extends React.Component {
  static displayName = 'Example';

  handleUrlPress(url) {
    LinkingIOS.openURL(url);
  }

  handlePhonePress(phone) {
    AlertIOS.alert(`${phone} has been pressed!`);
  }

  handleNamePress(name) {
    AlertIOS.alert(`Hello ${name}`);
  }

  render() {
    return (
      <View style={styles.container}>
        <ParsedText
          style={styles.text}
          parse={
            [
              {type: 'url',          style: styles.url, onPress: this.handleUrlPress},
              {type: 'phone',        style: styles.phone, onPress: this.handlePhonePress},
              {pattern: /Bob|David/, style: styles.name, onPress: this.handleNamePress},
              {pattern: /42/,        style: styles.magicNumber},
              {pattern: /#(\w+)/,    style: styles.hashTag},
            ]
          }
        >
          Hello this is an example of the ParsedText, links like http://www.google.com or http://www.facebook.com are clickable and phone number 444-555-6666 can call too.
          But you can also do more with this package, for example Bob will change style and David too.
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

  magicNumber: {
    fontSize: 42,
    color: 'pink',
  },

  hashTag: {
    fontStyle: 'italic',
  },

});
```

![](/https://github.com/taskrabbit/react-native-parsed-text/tree/master/assets/recording.gif)

## TODO

* README
* Add nested text parsing
