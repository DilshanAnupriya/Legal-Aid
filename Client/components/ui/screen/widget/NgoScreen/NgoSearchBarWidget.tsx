import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DisplayTypeWidget from "@/components/ui/screen/share/DisplayTypeWidget";

// @ts-ignore
const NgoSearchBar = ({
                            // @ts-ignore
                          searchText,
                          // @ts-ignore
                          onSearchChange,
                          // @ts-ignore
                          onClearSearch,
                          // @ts-ignore
                          isGridView,
                          // @ts-ignore
                          onViewChange
                      }) => {
    return (
        <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search NGOs..."
                value={searchText}
                onChangeText={onSearchChange}
                placeholderTextColor="#999"
            />
            {searchText.length > 0 && (
                <TouchableOpacity onPress={onClearSearch}>
                    <Ionicons name="close-circle-outline" size={20} color="#666" />
                </TouchableOpacity>
            )}
            <View>
                <DisplayTypeWidget
                    onViewChange={onViewChange}
                    initialGridState={isGridView}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin:8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
});

export default NgoSearchBar;