import ProfileScreen from "@/components/ui/screen/ProfileScreen";
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  
  // Create a navigation-like object for compatibility
  const navigation = {
    navigate: (route: string) => router.push(route as any),
    replace: (route: string) => router.replace(route as any),
    goBack: () => router.back(),
  };

  return <ProfileScreen navigation={navigation} />;
}
