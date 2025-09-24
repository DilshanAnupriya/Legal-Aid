import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-paper";
import {COLOR} from "@/constants/ColorPallet";
import {useState, useEffect} from "react";
import { useTheme } from "../../../../context/ThemeContext"
// @ts-ignore
export default function DisplayTypeWidget({ onViewChange, initialGridState = true }) {
    const [gridStatus, setGridStatus] = useState(initialGridState);
    const { colors, theme } = useTheme();

    // Update parent component when view changes
    useEffect(() => {
        if (onViewChange) {
            onViewChange(gridStatus);
        }
    }, [gridStatus, onViewChange]);

    const handleGridPress = () => {
        setGridStatus(true);
    };

    const handleListPress = () => {
        setGridStatus(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {backgroundColor: gridStatus ? colors.accent: COLOR.light.white}
                ]}
                onPress={handleGridPress}
            >
                <Icon
                    size={20}
                    source={'grid'}
                    color={gridStatus ? COLOR.light.white : COLOR.light.black}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                    {backgroundColor: !gridStatus ? colors.accent : COLOR.light.white}
                ]}
                onPress={handleListPress}
            >
                <Icon
                    size={20}
                    source={'menu'}
                    color={gridStatus ? COLOR.light.black : COLOR.light.white}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        justifyContent:'flex-end',
        marginRight:-10
    },
    button:{
        width:40,
        height:35,
        borderRadius:4,
        justifyContent:"center",
        alignItems:"center",
    }
});