import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentFilter, DocumentCategory } from '@/types/document';

interface DocumentSearchBarWidgetProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: DocumentFilter) => void;
  placeholder?: string;
  theme: string;
  colors: any;
}

const DocumentSearchBarWidget: React.FC<DocumentSearchBarWidgetProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Search documents...",
  theme,
  colors,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterApply = () => {
    const filter: DocumentFilter = {
      category: selectedCategory,
      search: searchQuery,
      startDate,
      endDate,
    };
    onFilterChange(filter);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({});
    setShowFilterModal(false);
  };

  const categories = [
    { key: DocumentCategory.LEGAL, label: 'Legal Documents' },
    { key: DocumentCategory.CONTRACTS, label: 'Contracts' },
    { key: DocumentCategory.IDENTIFICATION, label: 'Identification' },
    { key: DocumentCategory.FINANCIAL, label: 'Financial' },
    { key: DocumentCategory.PERSONAL, label: 'Personal' },
    { key: DocumentCategory.OTHER, label: 'Other' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.light }]}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={colors.darkgray} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.primary }]}
            placeholder={placeholder}
            placeholderTextColor={colors.darkgray}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            onSubmitEditing={() => onSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.darkgray} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>
                Filter Documents
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.primary }]}>
                  Category
                </Text>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryOption,
                      { 
                        backgroundColor: selectedCategory === category.key 
                          ? colors.accent + '20' 
                          : 'transparent',
                        borderColor: selectedCategory === category.key 
                          ? colors.accent 
                          : colors.darkgray + '30'
                      }
                    ]}
                    onPress={() => setSelectedCategory(
                      selectedCategory === category.key ? undefined : category.key
                    )}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      { 
                        color: selectedCategory === category.key 
                          ? colors.accent 
                          : colors.primary 
                      }
                    ]}>
                      {category.label}
                    </Text>
                    {selectedCategory === category.key && (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.clearFiltersButton, { borderColor: colors.darkgray }]}
                onPress={clearFilters}
              >
                <Text style={[styles.clearFiltersText, { color: colors.darkgray }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.accent }]}
                onPress={handleFilterApply}
              >
                <Text style={[styles.applyButtonText, { color: colors.white }]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentSearchBarWidget;