import LawyerNetworkScreen from "@/components/modals/LawyerNetworkScreen";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../context/ThemeContext";

//import custom components
import { getAllLawyers } from "../../../service/lawyerService";
import LawyerHeader from "@/components/ui/screen/widget/LawyerScreen/LawyerHeaderWidget";
import LawyerSearchBar from "@/components/ui/screen/widget/LawyerScreen/LawyerSearchBarWidget";
import CategoryFilter from "@/components/ui/screen/widget/NgoScreen/NgoCategoryFilterWidget";
import LawyerList from "@/components/ui/screen/widget/LawyerScreen/LawyerListWidget";
import LoadingOverlay from "@/components/ui/screen/widget/NgoScreen/LoadingOverlayWidget";

export default function LawyerScreen() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const navigation = useNavigation();

  const { colors, theme } = useTheme();

  const categories = [
    "All",
    "Human Rights & Civil Liberties",
    "Women's Rights & Gender Justice",
    "Criminal Law",
  ];

  // Effects
  useEffect(() => {
    fetchLawyers();
  }, [searchText, selectedCategory, page]);

  // Fetch Lawyers
  const fetchLawyers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoading(true);
    }

    try {
      console.log("fetch lawyers called");
      const categoryParam =
        selectedCategory && selectedCategory !== "All" ? selectedCategory : "";
      const currentPage = isRefresh ? 1 : page;

      console.log("search text : ", searchText);
      // Axios request
      const response = await getAllLawyers(
        searchText,
        currentPage,
        10,
        categoryParam
      );
      const data = response.data; // Axios automatically parses JSON
      console.log("dataaaaa:", data);

      if (data.message === "list" && data.data) {
        if (isRefresh || currentPage === 1) {
          setLawyers(data.data);
        } else {
          setLawyers((prev) => [...prev, ...data.data]);
        }

        setTotalPages(data.pagination?.totalPages || 1);
        setHasNext(data.pagination?.hasNext || false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch lawyers. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Event Handlers
  const handleRefresh = () => {
    fetchLawyers(true);
  };
  const handleLoadMore = () => {
    if (hasNext && !loading) {
      setPage((prev) => prev + 1);
    }
  };
  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category === "All" ? "" : category);
    setPage(1);
    setLawyers([]);
  };

  const handleSearch = (text: any) => {
    setSearchText(text);
    setPage(1);
    setLawyers([]);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setPage(1);
    setLawyers([]);
  };

  const handleViewChange = (gridView: any) => {
    setIsGridView(gridView);
  };

  // @ts-ignore
  const handleCardPress = (item) => {
    navigation.navigate("LawyerProfile", {
      lawyerId: item.id, // or item.id depending on your backend
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.light }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Component */}
      <LawyerHeader />

      {/* Search Bar Component */}
      <LawyerSearchBar
        searchText={searchText}
        onSearchChange={handleSearch}
        onClearSearch={handleClearSearch}
        isGridView={isGridView}
        onViewChange={handleViewChange}
      />

      {/* Category Filter Component */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Lawyer List Component */}
      <LawyerList
        data={lawyers}
        isGridView={isGridView}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onCardPress={handleCardPress}
      />

      {/* Loading Overlay Component */}
      <LoadingOverlay
        visible={loading && page === 1}
        message="Loading Lawyers..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
