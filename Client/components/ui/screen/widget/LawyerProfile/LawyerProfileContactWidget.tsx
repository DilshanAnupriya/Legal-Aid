import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LawyerProfileContactWidget({ contactInfo }) {
  const contactItems = [
    {
      icon: '📧',
      type: 'Secure Email',
      detail: contactInfo.email
    },
    {
      icon: '📞',
      type: 'Call',
      detail: contactInfo.phone
    },
    {
      icon: '📍',
      type: 'Office Location',
      detail: contactInfo.officeLocation
    },
    {
      icon: '🌐',
      type: 'Languages',
      detail: contactInfo.languages
    }
  ];

  return (
    <View style={styles.contactSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📞</Text>
        <Text style={styles.sectionTitle}>Contact Information</Text>
      </View>
      
      {contactItems.map((item, index) => (
        <View key={index} style={styles.contactItem}>
          <Text style={styles.contactIcon}>{item.icon}</Text>
          <View>
            <Text style={styles.contactType}>{item.type}</Text>
            <Text style={styles.contactDetail}>{item.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contactSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 15,
    width: 20,
  },
  contactType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  contactDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});