import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
const MyHouseScreen = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity>
                <Text>
                    Join A House
                </Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
});
export default MyHouseScreen;