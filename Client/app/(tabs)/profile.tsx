import MenuScreen from "@/components/ui/screen/MenuScreen";
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  
  // Create a navigation-like object for compatibility
  const navigation = {
    navigate: (route: string) => router.push(route as any),
    replace: (route: string) => router.replace(route as any),
    goBack: () => router.back(),
  };

  return <MenuScreen navigation={navigation} />;
}
