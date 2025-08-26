import {StyleSheet, Text, View} from "react-native";

export default function LawyerScreen(){
    return (
        <View style={styles.container}>
            <Text>Lawyers Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    }
})