import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Modal,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLOR } from '@/constants/ColorPallet';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_URL = 'http://localhost:3000';

// @ts-ignore
const DocumentGeneratorScreen = ({ navigation }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [generatedDocument, setGeneratedDocument] = useState(null);

    // Template field configurations
    const TEMPLATE_FIELDS = {
        'complaint_letter': [
            { key: 'name', label: 'Your Name', placeholder: 'John Doe', required: true },
            { key: 'address', label: 'Your Address', placeholder: 'Street, City, Postal Code', multiline: true, required: true },
            { key: 'issue', label: 'Issue/Complaint', placeholder: 'Describe your complaint', multiline: true, required: true },
            { key: 'respondent', label: 'Respondent/Company', placeholder: 'Who are you complaining against?', required: true },
            { key: 'incidentDate', label: 'Date of Incident', placeholder: 'YYYY-MM-DD', required: true },
            { key: 'demands', label: 'Your Demands', placeholder: 'What resolution do you seek?', multiline: true, required: true }
        ],
        'affidavit': [
            { key: 'name', label: 'Full Name', placeholder: 'John Doe', required: true },
            { key: 'age', label: 'Age', placeholder: '25', keyboardType: 'numeric', required: true },
            { key: 'occupation', label: 'Occupation', placeholder: 'Software Engineer', required: true },
            { key: 'address', label: 'Address', placeholder: 'Complete address', multiline: true, required: true },
            { key: 'facts', label: 'Facts to State', placeholder: 'State the facts clearly', multiline: true, required: true },
            { key: 'purpose', label: 'Purpose', placeholder: 'Why is this affidavit needed?', multiline: true, required: true }
        ],
        'notice': [
            { key: 'name', label: 'Your Name', placeholder: 'John Doe', required: true },
            { key: 'recipient', label: 'Recipient Name', placeholder: 'Jane Smith', required: true },
            { key: 'subject', label: 'Subject', placeholder: 'Notice regarding...', required: true },
            { key: 'facts', label: 'Facts', placeholder: 'State relevant facts', multiline: true, required: true },
            { key: 'legalBasis', label: 'Legal Basis', placeholder: 'Cite relevant laws/sections', multiline: true, required: false },
            { key: 'demands', label: 'Demands', placeholder: 'What action do you require?', multiline: true, required: true },
            { key: 'timeline', label: 'Response Timeline', placeholder: '15 days from receipt', required: true }
        ],
        'petition': [
            { key: 'name', label: 'Petitioner Name', placeholder: 'John Doe', required: true },
            { key: 'against', label: 'Against (Respondent)', placeholder: 'XYZ Company', required: true },
            { key: 'matter', label: 'Matter/Subject', placeholder: 'Brief subject of petition', required: true },
            { key: 'facts', label: 'Facts of the Case', placeholder: 'Detailed facts', multiline: true, required: true },
            { key: 'relief', label: 'Relief Sought', placeholder: 'What relief do you seek?', multiline: true, required: true }
        ],
        'authorization_letter': [
            { key: 'name', label: 'Your Name', placeholder: 'John Doe', required: true },
            { key: 'authorizedPerson', label: 'Authorized Person', placeholder: 'Jane Smith', required: true },
            { key: 'purpose', label: 'Purpose', placeholder: 'To collect documents on my behalf', multiline: true, required: true },
            { key: 'duration', label: 'Duration', placeholder: '30 days from date', required: true },
            { key: 'scope', label: 'Scope of Authority', placeholder: 'Specific tasks authorized', multiline: true, required: true }
        ],
        'rental_agreement': [
            { key: 'landlord', label: 'Landlord Name', placeholder: 'John Doe', required: true },
            { key: 'tenant', label: 'Tenant Name', placeholder: 'Jane Smith', required: true },
            { key: 'property', label: 'Property Address', placeholder: 'Complete property address', multiline: true, required: true },
            { key: 'rent', label: 'Monthly Rent', placeholder: '50000 LKR', required: true },
            { key: 'duration', label: 'Lease Duration', placeholder: '1 year', required: true },
            { key: 'terms', label: 'Additional Terms', placeholder: 'Special conditions, if any', multiline: true, required: false }
        ]
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${API_URL}/api/documents/generate/templates`);
            const data = await response.json();

            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            Alert.alert('Error', 'Failed to load templates');
        }
    };

    const handleTemplateSelect = (template:any) => {
        setSelectedTemplate(template);
        setFormData({});
        setGeneratedDocument(null);
        setPreviewContent('');
    };

    const handleFieldChange = (key:any, value:any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        // @ts-ignore
        const fields = TEMPLATE_FIELDS[selectedTemplate.id] || [];
       //@ts-ignore
        const requiredFields = fields.filter(f => f.required);

        for (const field of requiredFields) {
            // @ts-ignore
            if (!formData[field.key] || formData[field.key].trim() === '') {
                Alert.alert('Validation Error', `${field.label} is required`);
                return false;
            }
        }
        return true;
    };

    const handlePreview = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {

            const response = await fetch(`${API_URL}/api/documents/generate/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // @ts-ignore
                    templateType: selectedTemplate.id,
                    details: formData
                })
            });

            const data = await response.json();

            if (data.success) {
                setPreviewContent(data.preview);
                setShowPreview(true);
            } else {
                Alert.alert('Error', data.error || 'Failed to generate preview');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate preview');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/documents/generate/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // @ts-ignore
                    templateType: selectedTemplate.id,
                    details: formData,
                    format: 'pdf'
                })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedDocument(data);
                Alert.alert(
                    'Success!',
                    'Document generated successfully!',
                    [
                        { text: 'View', onPress: () => handleDownload(data) },
                        { text: 'OK', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Error', data.error || 'Failed to generate document');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate document');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (document:any) => {
        try {
            // @ts-ignore
            const fileUri = FileSystem.documentDirectory + document.filename;
            const downloadUrl = `${API_URL}${document.downloadUrl}`;

            await FileSystem.downloadAsync(downloadUrl, fileUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Success', 'Document saved to device');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download document');
        }
    };

    const renderTemplateCard = (template:any) => (
        <TouchableOpacity
            key={template.id}
            style={[
                styles.templateCard,
                // @ts-ignore
                selectedTemplate?.id === template.id && styles.selectedCard
            ]}
            onPress={() => handleTemplateSelect(template)}
            activeOpacity={0.7}
        >
            <View style={styles.templateIcon}>
                <Ionicons name="document-text" size={32} color={COLOR.light.primary} />
            </View>
            <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDesc}>{template.description}</Text>
            </View>
            {/*// @ts-ignore*/}
            {selectedTemplate?.id === template.id && (
                <Ionicons name="checkmark-circle" size={24} color={COLOR.light.primary} />
            )}
        </TouchableOpacity>
    );

    const renderFormFields = () => {
        // @ts-ignore
        const fields = TEMPLATE_FIELDS[selectedTemplate.id] || [];
        // @ts-ignore
        return fields.map(field => (
            <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                    {field.label}
                    {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        field.multiline && styles.multilineInput
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9CA3AF"
                    // @ts-ignore
                    value={formData[field.key] || ''}
                    onChangeText={(value) => handleFieldChange(field.key, value)}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 4 : 1}
                    keyboardType={field.keyboardType || 'default'}
                />
            </View>
        ));
    };



    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLOR.light.primary, COLOR.light.secondary]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Document Generator</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={20} color={COLOR.light.primary} />
                    <Text style={styles.infoText}>
                        AI-generated documents should be reviewed by a legal professional before use
                    </Text>
                </View>

                {/* Templates Section */}
                {!selectedTemplate && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Choose Document Type</Text>
                        {templates.map(renderTemplateCard)}
                    </View>
                )}
                {/* Form Section */}
                {selectedTemplate && (
                    <View style={styles.section}>
                        <View style={styles.selectedHeader}>
                            <Text style={styles.sectionTitle}>
                                {/* @ts-ignore */}
                                {selectedTemplate.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setSelectedTemplate(null)}
                                style={styles.changeButton}
                            >
                                <Text style={styles.changeButtonText}>Change</Text>
                            </TouchableOpacity>
                        </View>

                        {renderFormFields()}

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.previewButton}
                                onPress={handlePreview}
                                disabled={isLoading}
                            >
                                <Text style={styles.previewButtonText}>Preview</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.generateButton}
                                onPress={handleGenerate}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="download" size={20} color="#fff" />
                                        <Text style={styles.generateButtonText}>Generate PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Generated Document Info */}
                        {generatedDocument && (
                            <View style={styles.successCard}>
                                <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                                <Text style={styles.successTitle}>Document Ready!</Text>
                                <TouchableOpacity
                                    style={styles.downloadAgainButton}
                                    onPress={() => handleDownload(generatedDocument)}
                                >
                                    <Text style={styles.downloadAgainText}>Download Again</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Preview Modal */}
            <Modal
                visible={showPreview}
                animationType="slide"
                onRequestClose={() => setShowPreview(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Document Preview</Text>
                        <TouchableOpacity onPress={() => setShowPreview(false)}>
                            <Ionicons name="close" size={28} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.previewContent}>
                        <Text style={styles.previewText}>{previewContent}</Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.modalGenerateButton}
                        onPress={() => {
                            setShowPreview(false);
                            handleGenerate();
                        }}
                    >
                        <LinearGradient
                            colors={[COLOR.light.primary, COLOR.light.secondary]}
                            style={styles.modalGenerateGradient}
                        >
                            <Text style={styles.modalGenerateText}>Generate PDF</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        elevation: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        padding: 12,
        margin: 16,
        borderRadius: 12,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#4338CA',
        lineHeight: 18,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    selectedCard: {
        borderColor: COLOR.light.primary,
        backgroundColor: '#EEF2FF',
    },
    templateIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateInfo: {
        flex: 1,
    },
    templateName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    templateDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
    selectedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    changeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLOR.light.primary,
    },
    changeButtonText: {
        color: COLOR.light.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1F2937',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    previewButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLOR.light.primary,
        alignItems: 'center',
    },
    previewButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLOR.light.primary,
    },
    generateButton: {
        flex: 1,
        backgroundColor: COLOR.light.primary,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    successCard: {
        backgroundColor: '#D1FAE5',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 2,
        borderColor: '#10B981',
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#059669',
        marginTop: 12,
        marginBottom: 16,
    },
    downloadAgainButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    downloadAgainText: {
        color: '#fff',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    previewContent: {
        flex: 1,
        padding: 16,
    },
    previewText: {
        fontSize: 14,
        lineHeight: 24,
        color: '#374151',
    },
    modalGenerateButton: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
    },
    modalGenerateGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalGenerateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default DocumentGeneratorScreen;