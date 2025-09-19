import {StyleSheet, Text, View} from "react-native";
import { Menu } from 'react-native-paper';
import {COLOR} from "@/constants/ColorPallet";

export default function ProfileScreen({navigation}: any){
    return (
        <View style={styles.container}>
            <Menu.Item leadingIcon="file-multiple-outline" onPress={() => {}} title="Document Orgernizer" />
            <Menu.Item leadingIcon="robot-outline" onPress={() => {}} title="AI ChatBot Assist" />
            <Menu.Item leadingIcon="translate" onPress={() => {}} title="Languages"  />
            <Menu.Item leadingIcon="charity" onPress={() => {navigation.navigate('Ngo')}} title="NGO"  />
            <Menu.Item leadingIcon="cog-outline" onPress={() => {}} title="Settings" />
            <Menu.Item leadingIcon="shield-account-outline" onPress={() => {}} title="About Us"  />
            <Menu.Item leadingIcon="account-voice" onPress={() => {}} title="Contact Us"  />
            <Menu.Item leadingIcon="exit-to-app" onPress={() => {}} title="Logout" />
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:COLOR.light.light,
    }
})