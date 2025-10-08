import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLOR } from '../../../constants/ColorPallet';

interface AdminNGOsScreenProps {
  navigation?: any;
}

interface NGO {
  _id: string;
  name: string;
  email: string;
  category: string;
  description: string;
  contact: string;
  status: string;
  logo?: string;
  rating: number;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
}

const AdminNGOsScreen: React.FC<AdminNGOsScreenProps> = ({ navigation }) => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNGO, setEditingNGO] = useState<NGO | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    contact: '',
    description: '',
    rating: 0,
  });
  
  // Confirmation modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Success/Error modal state
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Debounced search effect - triggers search automatically as user types
  useEffect(() => {
    console.log('Search text changed:', searchText);
    const delayDebounceFn = setTimeout(() => {
      console.log('Triggering search after delay');
      fetchNGOs();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  useEffect(() => {
    console.log('AdminNGOsScreen mounted or page/filter changed');
    fetchNGOs();
  }, [currentPage, statusFilter]);

  // Helper functions for modals
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmModalVisible(true);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalVisible(true);
  };

  const fetchNGOs = async () => {
    try {
      console.log('Fetching NGOs...');
      
      const token = await AsyncStorage.getItem('adminToken');
      const baseUrl = await AsyncStorage.getItem('adminApiUrl') || 'http://localhost:3000/api/admin';
      
      console.log('Token:', token ? 'exists' : 'missing');
      console.log('Base URL:', baseUrl);
      
      if (!token) {
        throw new Error('No admin token found');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
        search: searchText,
      });

      const url = `${baseUrl}/ngos?${params}`;
      console.log('Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('NGOs fetched successfully:', data.ngos?.length || 0);
        setNgos(data.ngos || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.error('Failed to fetch NGOs:', data.message);
        console.error('Error details:', data.error);
        setNgos([]);
        Alert.alert('Error', `Failed to load NGOs: ${data.message}\n${data.error || ''}`);
      }
    } catch (error: any) {
      console.error('Error fetching NGOs:', error);
      console.error('Error details:', error.message);
      setNgos([]);
      Alert.alert('Error', `Failed to load NGOs: ${error.message}`);
    } finally {
      console.log('Fetch complete, setting loading to false');
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    fetchNGOs();
  };

  const handleSearch = () => {
    console.log('Search triggered with text:', searchText);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchNGOs();
    }
  };

  const handleClearSearch = () => {
    console.log('Clearing search');
    setSearchText('');
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    // Reset to page 1 when searching
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleStatusChange = (ngoId: string, ngoName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    console.log('=== STATUS CHANGE INITIATED ===');
    console.log('NGO ID:', ngoId);
    console.log('NGO Name:', ngoName);
    console.log('Current Status:', currentStatus);
    console.log('New Status:', newStatus);
    
    showConfirm(
      'Change Status',
      `Are you sure you want to ${newStatus === 'active' ? 'ACTIVATE' : 'DEACTIVATE'} "${ngoName}"?`,
      async () => {
        console.log('User confirmed, proceeding with status change...');
        
        try {
          const baseUrl = 'http://localhost:3000/api';
          const url = `${baseUrl}/ngo/ngo/${ngoId}/status`;
          
          console.log('Calling API:', url);
          console.log('Request body:', { status: newStatus });
          
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          });

          console.log('Response received:', response.status, response.ok);
          
          const data = await response.json();
          console.log('Response data:', data);

          if (response.ok && data.message === 'status updated') {
            console.log('✅ Status updated successfully in database!');
            
            // Immediately update the UI
            setNgos(prevNgos => {
              const updated = prevNgos.map(n => 
                n._id === ngoId 
                  ? { ...n, status: newStatus } 
                  : n
              );
              console.log('Updated local state');
              return updated;
            });
            
            showAlert(
              'Success',
              `NGO "${ngoName}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
              'success'
            );
            
            // Refresh from server after a delay
            setTimeout(() => {
              console.log('Refreshing from server...');
              fetchNGOs();
            }, 1000);
          } else {
            console.error('❌ Status update failed:', data);
            throw new Error(data.error || data.message || 'Failed to update status');
          }
        } catch (error: any) {
          console.error('❌ ERROR:', error);
          showAlert('Error', `Failed to update NGO status: ${error.message}`, 'error');
        }
      }
    );
  };

  const handleDeleteNGO = (ngoId: string, ngoName: string) => {
    showConfirm(
      'Delete NGO',
      `Are you sure you want to delete "${ngoName}"? This action cannot be undone.`,
      async () => {
        try {
          const token = await AsyncStorage.getItem('adminToken');
          const baseUrl = 'http://localhost:3000/api';
          
          const response = await fetch(`${baseUrl}/ngo/ngo/${ngoId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (response.ok && data.message === 'deleted') {
            showAlert('Success', 'NGO deleted successfully', 'success');
            fetchNGOs();
          } else {
            throw new Error(data.message || 'Failed to delete NGO');
          }
        } catch (error: any) {
          console.error('Error deleting NGO:', error);
          showAlert('Error', `Failed to delete NGO: ${error.message}`, 'error');
        }
      }
    );
  };

  const handleEditNGO = (ngo: NGO) => {
    setEditingNGO(ngo);
    setEditForm({
      name: ngo.name,
      email: ngo.email,
      contact: ngo.contact,
      description: ngo.description,
      rating: ngo.rating,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingNGO) return;

    try {
      const token = await AsyncStorage.getItem('adminToken');
      const baseUrl = 'http://localhost:3000/api';
      
      const response = await fetch(`${baseUrl}/ngo/ngo/${editingNGO._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok && data.message === 'success') {
        Alert.alert('Success', 'NGO updated successfully');
        setEditModalVisible(false);
        setEditingNGO(null);
        fetchNGOs();
      } else {
        throw new Error(data.message || 'Failed to update NGO');
      }
    } catch (error: any) {
      console.error('Error updating NGO:', error);
      Alert.alert('Error', `Failed to update NGO: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingNGO(null);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#FFD700' : '#DDD'}
        />
      );
    }
    return stars;
  };

  const handleViewDetails = (ngo: NGO) => {
    console.log('View Details clicked for:', ngo.name);
    
    const details = `📧 Email: ${ngo.email}
📞 Contact: ${ngo.contact}
📂 Category: ${ngo.category}
⭐ Rating: ${ngo.rating}/5
📊 Status: ${ngo.status.toUpperCase()}
${ngo.images && ngo.images.length > 0 ? `🖼️ Images: ${ngo.images.length}` : ''}

📝 Description:
${ngo.description}

🆔 ID: ${ngo._id}
📅 Created: ${new Date(ngo.createdAt).toLocaleDateString()}`;

    showAlert(ngo.name, details, 'success');
  };

  const NGOCard: React.FC<{ 
    ngo: NGO;
    onViewDetails: (ngo: NGO) => void;
    onStatusChange: (id: string, name: string, status: string) => void;
    onEdit: (ngo: NGO) => void;
    onDelete: (id: string, name: string) => void;
    renderStars: (rating: number) => JSX.Element[];
  }> = ({ ngo, onViewDetails, onStatusChange, onEdit, onDelete, renderStars }) => {
    const [imageError, setImageError] = useState(false);
    
    // Validate image URL
    const isValidImageUrl = (url: string | undefined | null): boolean => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
      // Check if it's a valid URL (http or https)
      return trimmed.startsWith('http://') || trimmed.startsWith('https://');
    };

    const hasValidLogo = isValidImageUrl(ngo.logo);
    
    return (
      <View style={styles.ngoCard}>
        <View style={styles.ngoHeader}>
          {hasValidLogo && !imageError ? (
            <Image 
              source={{ uri: ngo.logo }} 
              style={styles.ngoLogo}
              onError={(e) => {
                console.log('Image load error for NGO:', ngo.name);
                setImageError(true);
              }}
            />
          ) : (
            <View style={styles.ngoLogoPlaceholder}>
              <Ionicons name="business" size={24} color="#666" />
            </View>
          )}
          <View style={styles.ngoHeaderInfo}>
            <Text style={styles.ngoName}>{ngo.name}</Text>
            <Text style={styles.ngoCategory}>{ngo.category}</Text>
            <View style={styles.ratingContainer}>
              {renderStars(ngo.rating || 0)}
              <Text style={styles.ratingValue}>({ngo.rating || 0})</Text>
            </View>
          </View>
          <View style={styles.cardHeaderActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('Edit button pressed for:', ngo.name);
                onEdit(ngo);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('Delete button pressed for:', ngo.name);
                onDelete(ngo._id, ngo.name);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>
        </View>
      
      <View style={[
        styles.statusBadge2,
        { backgroundColor: ngo.status === 'active' ? '#4CAF50' : '#FF5722' }
      ]}>
        <Text style={styles.statusText}>{ngo.status.toUpperCase()}</Text>
      </View>

      <View style={styles.ngoDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{ngo.email}</Text>
        </View>
        {ngo.contact && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{ngo.contact}</Text>
          </View>
        )}
        {ngo.description && (
          <Text style={styles.description} numberOfLines={3}>
            {ngo.description}
          </Text>
        )}
        {ngo.images && ngo.images.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="images-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{ngo.images.length} images</Text>
          </View>
        )}
      </View>

      <View style={styles.ngoActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => {
            console.log('View Details button pressed for:', ngo.name);
            onViewDetails(ngo);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn, 
            ngo.status === 'active' ? styles.deactivateBtn : styles.activateBtn
          ]}
          onPress={() => {
            console.log('Status change button pressed for:', ngo.name, 'Current status:', ngo.status);
            onStatusChange(ngo._id, ngo.name, ngo.status);
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={ngo.status === 'active' ? 'close-circle-outline' : 'checkmark-circle-outline'} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.actionBtnText}>
            {ngo.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR.light.orange} />
        <Text style={styles.loadingText}>Loading NGOs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage NGOs</Text>
        <View style={styles.headerRight}>
          <Text style={styles.totalCount}>{ngos.length} NGOs</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search NGOs by name, email, category..."
            value={searchText}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'active', 'inactive'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && styles.filterChipActive
              ]}
              onPress={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
            >
              <Text style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* NGOs List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {ngos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No NGOs found</Text>
          </View>
        ) : (
          ngos.map((ngo) => (
            <NGOCard 
              key={ngo._id} 
              ngo={ngo}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
              onEdit={handleEditNGO}
              onDelete={handleDeleteNGO}
              renderStars={renderStars}
            />
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#333'} />
            </TouchableOpacity>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#333'} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit NGO</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>NGO Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholder="Enter NGO name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.contact}
                  onChangeText={(text) => setEditForm({ ...editForm, contact: text })}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rating (0-5)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.rating.toString()}
                  onChangeText={(text) => {
                    const rating = parseFloat(text) || 0;
                    setEditForm({ ...editForm, rating: Math.min(5, Math.max(0, rating)) });
                  }}
                  placeholder="Enter rating"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.confirmModal]}>
            <View style={styles.confirmHeader}>
              <Ionicons name="help-circle-outline" size={48} color="#ff6b35" />
            </View>
            <Text style={styles.confirmTitle}>{confirmTitle}</Text>
            <Text style={styles.confirmMessage}>{confirmMessage}</Text>
            <View style={styles.confirmFooter}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.confirmCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmOkButton]}
                onPress={() => {
                  setConfirmModalVisible(false);
                  if (confirmAction) {
                    confirmAction();
                  }
                }}
              >
                <Text style={styles.confirmOkButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <Modal
        visible={alertModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.alertModal]}>
            <View style={styles.alertHeader}>
              <Ionicons 
                name={alertType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={48} 
                color={alertType === 'success' ? '#2ecc71' : '#e74c3c'} 
              />
            </View>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <ScrollView style={styles.alertMessageContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.alertMessage}>{alertMessage}</Text>
            </ScrollView>
            <View style={styles.alertFooter}>
              <TouchableOpacity
                style={[styles.alertButton, alertType === 'success' ? styles.alertSuccessButton : styles.alertErrorButton]}
                onPress={() => setAlertModalVisible(false)}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  totalCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  ngoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ngoHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  ngoLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
  },
  ngoLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ngoHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  ngoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ngoCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingValue: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  cardHeaderActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadge2: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ngoDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginTop: 4,
  },
  ngoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewBtn: {
    backgroundColor: '#007AFF',
  },
  activateBtn: {
    backgroundColor: '#2ecc71',
  },
  deactivateBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  pageButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Confirmation Modal Styles
  confirmModal: {
    width: '85%',
    maxWidth: 400,
  },
  confirmHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  confirmFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  confirmCancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmCancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmOkButton: {
    backgroundColor: COLOR.light.orange || '#ff6b35',
  },
  confirmOkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Alert Modal Styles
  alertModal: {
    width: '85%',
    maxWidth: 400,
  },
  alertHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  alertMessageContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  alertMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  alertFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  alertSuccessButton: {
    backgroundColor: '#2ecc71',
  },
  alertErrorButton: {
    backgroundColor: '#e74c3c',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminNGOsScreen;

