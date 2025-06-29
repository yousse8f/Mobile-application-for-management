import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { CustomerService, Customer } from '../../services/customerService';
import { DailyRecordService, DailyRecord } from '../../services/dailyRecordService';

export default function DailyRecordsScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cages: '',
    customerId: '',
    grossWeight: '',
    emptyWeight: '',
    pricePerKg: '',
    paid: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRecordsForDate(currentDate);
  }, [currentDate]);

  const loadData = async () => {
    try {
      const customersData = await CustomerService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('خطأ', 'فشل في تحميل بيانات العملاء');
    }
  };

  const loadRecordsForDate = async (date: string) => {
    try {
      setLoading(true);
      const recordsData = await DailyRecordService.getRecordsByDate(date);
      setRecords(recordsData);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('خطأ', 'فشل في تحميل السجلات');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetWeight = (gross: number, empty: number) => gross - empty;
  const calculateTotal = (netWeight: number, price: number) => netWeight * price;
  const calculateRemaining = (total: number, paid: number) => total - paid;

  const handleAddRecord = async () => {
    if (!formData.cages || !formData.customerId) {
      Alert.alert('خطأ', 'يرجى إدخال عدد الأقفاص واختيار العميل');
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    try {
      const grossWeight = parseFloat(formData.grossWeight) || 0;
      const emptyWeight = parseFloat(formData.emptyWeight) || 0;
      const netWeight = calculateNetWeight(grossWeight, emptyWeight);
      const pricePerKg = parseFloat(formData.pricePerKg) || 0;
      const total = calculateTotal(netWeight, pricePerKg);
      const paid = parseFloat(formData.paid) || 0;
      const remaining = calculateRemaining(total, paid);

      // حساب الرصيد القديم
      const oldBalance = await DailyRecordService.calculateOldBalance(formData.customerId, currentDate);
      const totalBalance = remaining + oldBalance;

      const newRecord = await DailyRecordService.addRecord({
        date: currentDate,
        cages: parseInt(formData.cages),
        customerId: formData.customerId,
        customerName: customer.name,
        grossWeight,
        emptyWeight,
        netWeight,
        pricePerKg,
        total,
        paid,
        remaining,
        oldBalance,
        totalBalance
      });

      setRecords([newRecord, ...records]);
      resetForm();
      setModalVisible(false);
      Alert.alert('نجح', 'تم إضافة السجل بنجاح');
    } catch (error) {
      console.error('Error adding record:', error);
      Alert.alert('خطأ', 'فشل في إضافة السجل');
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا السجل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await DailyRecordService.deleteRecord(recordId);
              setRecords(records.filter(record => record.id !== recordId));
              Alert.alert('نجح', 'تم حذف السجل بنجاح');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('خطأ', 'فشل في حذف السجل');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      cages: '',
      customerId: '',
      grossWeight: '',
      emptyWeight: '',
      pricePerKg: '',
      paid: ''
    });
    setEditingRecord(null);
  };

  const getDailySummary = () => {
    const summary = records.reduce(
      (acc, record) => ({
        totalCages: acc.totalCages + record.cages,
        totalWeight: acc.totalWeight + record.netWeight,
        totalAmount: acc.totalAmount + record.total,
        totalPaid: acc.totalPaid + record.paid,
        totalRemaining: acc.totalRemaining + record.remaining
      }),
      {
        totalCages: 0,
        totalWeight: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalRemaining: 0
      }
    );
    return summary;
  };

  const renderRecordItem = ({ item }: { item: DailyRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecord(item.id)}
        >
          <Ionicons name="trash" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>الأقفاص:</Text>
          <Text style={styles.detailValue}>{item.cages}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>الوزن الصافي:</Text>
          <Text style={styles.detailValue}>{item.netWeight.toFixed(2)} كجم</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>السعر:</Text>
          <Text style={styles.detailValue}>{item.pricePerKg.toFixed(2)} جنيه</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>الإجمالي:</Text>
          <Text style={styles.detailValue}>{item.total.toFixed(2)} جنيه</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>المدفوع:</Text>
          <Text style={styles.detailValue}>{item.paid.toFixed(2)} جنيه</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>المتبقي:</Text>
          <Text style={[styles.detailValue, styles.remainingValue]}>
            {item.remaining.toFixed(2)} جنيه
          </Text>
        </View>
      </View>
    </View>
  );

  const summary = getDailySummary();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>السجلات اليومية</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateSelector}>
        <Text style={styles.dateLabel}>التاريخ: {currentDate}</Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>الملخص اليومي</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalCages}</Text>
            <Text style={styles.summaryLabel}>الأقفاص</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalWeight.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>كجم</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalAmount.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>جنيه</Text>
          </View>
        </View>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>لا توجد سجلات لهذا اليوم</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.id}
          style={styles.recordsList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => loadRecordsForDate(currentDate)}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة سجل جديد</Text>

            <TextInput
              style={styles.input}
              placeholder="عدد الأقفاص *"
              value={formData.cages}
              onChangeText={(text) => setFormData({ ...formData, cages: text })}
              keyboardType="numeric"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>اختر العميل *</Text>
              <Picker
                selectedValue={formData.customerId}
                onValueChange={(value: string) => setFormData({ ...formData, customerId: value })}
                style={styles.picker}
              >
                <Picker.Item label="اختر العميل" value="" />
                {customers.map(customer => (
                  <Picker.Item key={customer.id} label={customer.name} value={customer.id} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="الوزن القايم (كجم)"
              value={formData.grossWeight}
              onChangeText={(text) => setFormData({ ...formData, grossWeight: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="الوزن الفارغ (كجم)"
              value={formData.emptyWeight}
              onChangeText={(text) => setFormData({ ...formData, emptyWeight: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="السعر (جنيه/كجم)"
              value={formData.pricePerKg}
              onChangeText={(text) => setFormData({ ...formData, pricePerKg: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="المدفوع (جنيه)"
              value={formData.paid}
              onChangeText={(text) => setFormData({ ...formData, paid: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddRecord}
              >
                <Text style={styles.saveButtonText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryCard: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
  },
  recordsList: {
    flex: 1,
    padding: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  remainingValue: {
    color: '#e74c3c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
