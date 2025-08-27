import {StyleSheet, Text, View} from "react-native";
import LawyerNetworkScreen from "@/components/modals/LawyerNetworkScreen";

export default function LawyerScreen(){
    return (
        <View style={styles.container}>
            <LawyerNetworkScreen/>
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