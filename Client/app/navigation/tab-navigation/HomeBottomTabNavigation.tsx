import {Image, TouchableOpacity} from 'react-native'
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import ForumScreen from "@/components/ui/screen/ForumScreen";
import LawyerScreen from "@/components/ui/screen/LawyerScreen";
import ProfileScreen from "@/components/ui/screen/ProfileScreen";
import {Ionicons} from "@expo/vector-icons";
import {COLOR} from "@/constants/ColorPallet";
const logo = require('../../../assets/images/logo/Law Firm Logo Black and White (1).png')

const Tab = createBottomTabNavigator();
export default function HomeBottomTabNavigation({navigation}:any) {
    return (
        <Tab.Navigator
            initialRouteName={'Home'}
            screenOptions={({route, focused}:any)=>({
                tabBarIcon:({color, size})=>{
                    let iconName;
                    if(route.name === 'Home') iconName = focused? 'home':'home-outline';
                    else if(route.name === 'Forum') iconName = focused? 'earth':'earth-outline';
                    else if(route.name === 'Lawyer') iconName = focused? 'briefcase':'briefcase-outline';
                    else if(route.name === 'Profile') iconName = focused? 'person':'person-outline';

                    // @ts-ignore
                    return <Ionicons name={iconName} size={22} color={color}/>
                },
                tabBarActiveTintColor: COLOR.orange,
                tabBarInactiveTintColor:COLOR.black
            })}
        >
            <Tab.Screen name={'Home'}
                        component={HomePageScreen}
                        options={{
                            headerLeft:()=>(
                                <Image source={logo} resizeMode={'contain'}
                                       style={{width:130,height:80,marginLeft:10}}
                                />
                            ),
                            headerTitle:'',
                            headerRight:()=>(
                                <TouchableOpacity
                                    style={{
                                        marginRight:15,
                                        padding:8,
                                    }}
                                    onPress={() => {
                                        console.log('Hamburger menu pressed');
                                    }}
                                >
                                    <Ionicons
                                        name="menu"
                                        size={24}
                                        color={COLOR.black || '#333'}
                                    />
                                </TouchableOpacity>
                            )
                        }}
            />
            <Tab.Screen name={'Forum'} component={ForumScreen} />
            <Tab.Screen name={'Lawyer'} component={LawyerScreen} />
            <Tab.Screen name={'Profile'} component={ProfileScreen} />
        </Tab.Navigator>

    )
}