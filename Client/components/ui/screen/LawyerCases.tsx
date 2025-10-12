import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';

const LawyerCases = () => {
  const [search, setSearch] = useState('');

  const dummyCases = [
    {
      id: '1',
      title: 'Property Dispute - Silva vs. Perera',
      client: 'Mr. Silva',
      category: 'Property Law',
      status: 'Ongoing',
      date: '2025-10-10',
    },
    {
      id: '2',
      title: 'Divorce Settlement - Fernando Family',
      client: 'Mrs. Fernando',
      category: 'Family Law',
      status: 'Closed',
      date: '2025-09-20',
    },
    {
      id: '3',
      title: 'Employment Contract Issue - Jayawardena',
      client: 'Ms. Jayawardena',
      category: 'Employment Law',
      status: 'Pending',
      date: '2025-10-14',
    },
  ];

  // Filter cases based on search
  const filteredCases = dummyCases.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase())
  );

  const renderCase = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.caseTitle}>{item.title}</Text>
      <Text style={styles.caseDetail}>Client: {item.client}</Text>
      <Text style={styles.caseDetail}>Category: {item.category}</Text>
      <Text
        style={[
          styles.status,
          item.status === 'Ongoing'
            ? styles.ongoing
            : item.status === 'Pending'
            ? styles.pending
            : styles.closed,
        ]}
      >
        {item.status}
      </Text>
      <Text style={styles.caseDetail}>Next Hearing: {item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Cases</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by client or case title..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredCases}
        renderItem={renderCase}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No cases found.</Text>
        }
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Case</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LawyerCases;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  caseDetail: {
    fontSize: 14,
    color: '#4B5563',
  },
  status: {
    fontWeight: 'bold',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  ongoing: { color: '#16A34A' },
  pending: { color: '#D97706' },
  closed: { color: '#DC2626' },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    fontSize: 15,
  },
});
