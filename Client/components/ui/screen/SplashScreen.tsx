import React, {useEffect, useRef} from 'react'
import {Text, StyleSheet, Animated, View, Image} from 'react-native'
import {COLOR} from "@/constants/ColorPallet";
import appJson  from "../../../app.json"

export default function SplashScreen({onFinish}:any) {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress,{
            toValue:100,
            duration:4000,
            useNativeDriver:false,
        }).start(()=>{
            onFinish();
        })
    }, [onFinish]);

    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image  style={styles.logo}
                        source={require('../../../assets/images/logo/Law Firm Logo Black and White (1).png')}
                        resizeMode={'contain'}/>
            </View>
            <Text>Your rights don't disappear just because you don't know them</Text>
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[styles.progressbar,
                        {width:progress.interpolate({inputRange:[0,100],outputRange:['0%','100%']})}]}
                />

            </View>
            <View style={styles.bottom}>
                <Text>Version : {appJson.expo.version}</Text>
                <Text>From : SLIIT</Text>
            </View>
        </View>
    )
}



const styles = StyleSheet.create({
    bottom:{
        width:'100%',
        height:50,
        position:"absolute",
        bottom:0,
        flexDirection:'row',
        padding:10,
        justifyContent:'space-between'
    },
    progressbar:{
        backgroundColor:COLOR.orange,
        borderRadius:5,
        height:'100%',
    },
    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    logo:{
        height:300
    },
    logoWrapper:{

    },
    progressContainer:{
        width:'60%',
        height:5,
        backgroundColor:COLOR.darkgray,
        overflow:'hidden',
        borderRadius:5,
        marginTop:30
    },
})