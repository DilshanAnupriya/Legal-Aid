import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BookingModalProps {
    visible: boolean;
    lawyer: any;
    onClose: () => void;
    onSubmit: (bookingData: BookingData) => void;
}

interface BookingData {
    lawyerId: string;
    date: Date;
    time: string;
    caseType: string;
    description: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    preferredMeetingType: 'in-person' | 'video' | 'phone';
}

const BookingModal: React.FC<BookingModalProps> = ({ visible, lawyer, onClose, onSubmit }) => {
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [time, setTime] = useState('09:00 AM');
    const [caseType, setCaseType] = useState('');
    const [description, setDescription] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [meetingType, setMeetingType] = useState<'in-person' | 'video' | 'phone'>('video');

    const caseTypes = [
        'Criminal Defense',
        'Civil Litigation',
        'Family Law',
        'Corporate Law',
        'Property Law',
        'Employment Law',
        'Immigration',
        'Other'
    ];

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleSubmit = () => {
        // Validation
        if (!caseType || !description || !contactName || !contactEmail || !contactPhone) {
            alert('Please fill in all required fields');
            return;
        }

        const bookingData: BookingData = {
            lawyerId: lawyer?.id,
            date,
            time,
            caseType,
            description,
            contactName,
            contactEmail,
            contactPhone,
            preferredMeetingType: meetingType,
        };

        onSubmit(bookingData);
        resetForm();
    };

    const resetForm = () => {
        setDate(new Date());
        setTime('09:00 AM');
        setCaseType('');
        setDescription('');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setMeetingType('video');
    };

    if (!lawyer) return null;

    const fullName = `${lawyer?.firstName || ''} ${lawyer?.lastName || ''}`.trim();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Book Appointment</Text>
                            <Text style={styles.headerSubtitle}>with {fullName}</Text>
                            <Text style={styles.lawyerSpecialization}>{lawyer?.specialization}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Date Selection */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Appointment Date *</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <MaterialIcons name="event" size={20} color="#007AFF" />
                                <Text style={styles.dateButtonText}>
                                    {date.toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    minimumDate={new Date()}
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>

                        {/* Time Selection */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Preferred Time *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotContainer}>
                                {timeSlots.map((slot) => (
                                    <TouchableOpacity
                                        key={slot}
                                        style={[
                                            styles.timeSlot,
                                            time === slot && styles.timeSlotSelected
                                        ]}
                                        onPress={() => setTime(slot)}
                                    >
                                        <Text style={[
                                            styles.timeSlotText,
                                            time === slot && styles.timeSlotTextSelected
                                        ]}>
                                            {slot}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Meeting Type */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Meeting Type *</Text>
                            <View style={styles.meetingTypeContainer}>
                                <TouchableOpacity
                                    style={[styles.meetingTypeButton, meetingType === 'video' && styles.meetingTypeSelected]}
                                    onPress={() => setMeetingType('video')}
                                >
                                    <Ionicons name="videocam" size={20} color={meetingType === 'video' ? '#fff' : '#007AFF'} />
                                    <Text style={[styles.meetingTypeText, meetingType === 'video' && styles.meetingTypeTextSelected]}>Video</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.meetingTypeButton, meetingType === 'in-person' && styles.meetingTypeSelected]}
                                    onPress={() => setMeetingType('in-person')}
                                >
                                    <Ionicons name="person" size={20} color={meetingType === 'in-person' ? '#fff' : '#007AFF'} />
                                    <Text style={[styles.meetingTypeText, meetingType === 'in-person' && styles.meetingTypeTextSelected]}>In-Person</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.meetingTypeButton, meetingType === 'phone' && styles.meetingTypeSelected]}
                                    onPress={() => setMeetingType('phone')}
                                >
                                    <Ionicons name="call" size={20} color={meetingType === 'phone' ? '#fff' : '#007AFF'} />
                                    <Text style={[styles.meetingTypeText, meetingType === 'phone' && styles.meetingTypeTextSelected]}>Phone</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Case Type */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Case Type *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.caseTypeContainer}>
                                {caseTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.caseTypeChip,
                                            caseType === type && styles.caseTypeChipSelected
                                        ]}
                                        onPress={() => setCaseType(type)}
                                    >
                                        <Text style={[
                                            styles.caseTypeText,
                                            caseType === type && styles.caseTypeTextSelected
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Description */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Case Description *</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Please describe your legal matter..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        {/* Contact Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                                value={contactName}
                                onChangeText={setContactName}
                            />

                            <Text style={styles.label}>Email Address *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={contactEmail}
                                onChangeText={setContactEmail}
                            />

                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                value={contactPhone}
                                onChangeText={setContactPhone}
                            />
                        </View>

                        {/* Note */}
                        <View style={styles.noteContainer}>
                            <Ionicons name="information-circle" size={20} color="#007AFF" />
                            <Text style={styles.noteText}>
                                Your appointment request will be reviewed by the lawyer. You'll receive a confirmation via email.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <MaterialIcons name="event-available" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>Book Appointment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    lawyerSpecialization: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 2,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateButtonText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    timeSlotContainer: {
        flexDirection: 'row',
    },
    timeSlot: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 8,
    },
    timeSlotSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    timeSlotText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    timeSlotTextSelected: {
        color: '#FFFFFF',
    },
    meetingTypeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    meetingTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    meetingTypeSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    meetingTypeText: {
        fontSize: 13,
        color: '#007AFF',
        marginLeft: 6,
        fontWeight: '600',
    },
    meetingTypeTextSelected: {
        color: '#FFFFFF',
    },
    caseTypeContainer: {
        flexDirection: 'row',
    },
    caseTypeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 8,
    },
    caseTypeChipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    caseTypeText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    caseTypeTextSelected: {
        color: '#FFFFFF',
    },
    input: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 16,
    },
    textArea: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        fontSize: 15,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    noteContainer: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    noteText: {
        fontSize: 13,
        color: '#1976D2',
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        flex: 2,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default BookingModal;