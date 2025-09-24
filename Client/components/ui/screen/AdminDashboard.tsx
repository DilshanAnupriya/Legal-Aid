import {StyleSheet, Text, View} from "react-native";
import LawyersTableAdmin from "@/components/modals/lawyersTableAdmin";

export default function LawyerScreen(){
    return (
        <View style={styles.container}>
            <LawyersTableAdmin/>
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