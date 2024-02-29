import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

export default function Btns({ text, onclick }: { text: string, onclick: () => void }) {
  return (
    <TouchableOpacity style={styles.roundButton2} onPress={onclick}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'darkred',
    fontWeight: 'bold',
    justifyContent: 'center',
    alignContent: 'center',
  },
  roundButton1: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: 'orange',
    borderBottomColor: 'red',
    borderWidth: StyleSheet.hairlineWidth,
  },
  roundButton2: {
    marginTop: 20,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: 'lightgray',
  },
});
