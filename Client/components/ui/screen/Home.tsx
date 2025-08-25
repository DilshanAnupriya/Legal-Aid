import {Text,StyleSheet} from "react-native";

export default function Home() {
    return (
        <Text style={styles.homeText}>
            Home Page
        </Text>
    )
}

const styles = StyleSheet.create({
    homeText:{
        color:'red'
    }
})
