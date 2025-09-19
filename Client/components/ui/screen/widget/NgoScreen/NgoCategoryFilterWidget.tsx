import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';

// @ts-ignore
const CategoryFilterWidget = ({ categories, selectedCategory, onCategorySelect }) => {
    // @ts-ignore
    const renderCategoryButton = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                (item === selectedCategory || (item === 'All' && !selectedCategory)) && styles.selectedCategory
            ]}
            onPress={() => onCategorySelect(item)}
        >
            <Text style={[
                styles.categoryButtonText,
                (item === selectedCategory || (item === 'All' && !selectedCategory)) && styles.selectedCategoryText
            ]}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.categoryContainer}>
            <FlatList
                data={categories}
                renderItem={renderCategoryButton}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    categoryContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    categoryList: {
        paddingHorizontal: 16,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedCategory: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },
});

export default CategoryFilterWidget;