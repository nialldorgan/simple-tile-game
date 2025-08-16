import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {Picker} from '@react-native-picker/picker'

const SelectorComponent = ({ options = [], onValueChange, selectedValue }) => {
    return (
        <View style={styles.container}>        
            <Picker
                selectedValue={selectedValue}
                style={styles.picker}
                onValueChange={onValueChange}
            >
                {options.map((option) => (
                    <Picker.Item label={option.label} value={option.value} key={option.value} />
                ))}
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        margin: 2,        
    },
    label: { 
        fontSize: 16 
    },
    picker: { 
        height: 200, 
        width: 200,
        borderRadius: 5
    },
});

export default SelectorComponent;