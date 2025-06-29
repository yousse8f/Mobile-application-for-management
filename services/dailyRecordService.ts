import Parse from '../config/parse';

export interface DailyRecord {
    id: string;
    date: string;
    cages: number;
    customerId: string;
    customerName: string;
    grossWeight: number;
    emptyWeight: number;
    netWeight: number;
    pricePerKg: number;
    total: number;
    paid: number;
    remaining: number;
    oldBalance: number;
    totalBalance: number;
    createdAt: string;
}

export class DailyRecordService {
    // إضافة سجل جديد
    static async addRecord(recordData: Omit<DailyRecord, 'id' | 'createdAt'>): Promise<DailyRecord> {
        try {
            const DailyRecord = Parse.Object.extend('DailyRecord');
            const record = new DailyRecord();

            record.set('date', recordData.date);
            record.set('cages', recordData.cages);
            record.set('customerId', recordData.customerId);
            record.set('customerName', recordData.customerName);
            record.set('grossWeight', recordData.grossWeight);
            record.set('emptyWeight', recordData.emptyWeight);
            record.set('netWeight', recordData.netWeight);
            record.set('pricePerKg', recordData.pricePerKg);
            record.set('total', recordData.total);
            record.set('paid', recordData.paid);
            record.set('remaining', recordData.remaining);
            record.set('oldBalance', recordData.oldBalance);
            record.set('totalBalance', recordData.totalBalance);

            const savedRecord = await record.save();

            return {
                id: savedRecord.id,
                date: savedRecord.get('date'),
                cages: savedRecord.get('cages'),
                customerId: savedRecord.get('customerId'),
                customerName: savedRecord.get('customerName'),
                grossWeight: savedRecord.get('grossWeight'),
                emptyWeight: savedRecord.get('emptyWeight'),
                netWeight: savedRecord.get('netWeight'),
                pricePerKg: savedRecord.get('pricePerKg'),
                total: savedRecord.get('total'),
                paid: savedRecord.get('paid'),
                remaining: savedRecord.get('remaining'),
                oldBalance: savedRecord.get('oldBalance'),
                totalBalance: savedRecord.get('totalBalance'),
                createdAt: savedRecord.createdAt?.toISOString() || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error adding record:', error);
            throw error;
        }
    }

    // جلب سجلات يوم معين
    static async getRecordsByDate(date: string): Promise<DailyRecord[]> {
        try {
            const query = new Parse.Query('DailyRecord');
            query.equalTo('date', date);
            query.descending('createdAt');
            const results = await query.find();

            return results.map((obj: any) => ({
                id: obj.id,
                date: obj.get('date'),
                cages: obj.get('cages'),
                customerId: obj.get('customerId'),
                customerName: obj.get('customerName'),
                grossWeight: obj.get('grossWeight'),
                emptyWeight: obj.get('emptyWeight'),
                netWeight: obj.get('netWeight'),
                pricePerKg: obj.get('pricePerKg'),
                total: obj.get('total'),
                paid: obj.get('paid'),
                remaining: obj.get('remaining'),
                oldBalance: obj.get('oldBalance'),
                totalBalance: obj.get('totalBalance'),
                createdAt: obj.createdAt?.toISOString() || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching records:', error);
            throw error;
        }
    }

    // جلب جميع السجلات
    static async getAllRecords(): Promise<DailyRecord[]> {
        try {
            const query = new Parse.Query('DailyRecord');
            query.descending('createdAt');
            const results = await query.find();

            return results.map((obj: any) => ({
                id: obj.id,
                date: obj.get('date'),
                cages: obj.get('cages'),
                customerId: obj.get('customerId'),
                customerName: obj.get('customerName'),
                grossWeight: obj.get('grossWeight'),
                emptyWeight: obj.get('emptyWeight'),
                netWeight: obj.get('netWeight'),
                pricePerKg: obj.get('pricePerKg'),
                total: obj.get('total'),
                paid: obj.get('paid'),
                remaining: obj.get('remaining'),
                oldBalance: obj.get('oldBalance'),
                totalBalance: obj.get('totalBalance'),
                createdAt: obj.createdAt?.toISOString() || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching all records:', error);
            throw error;
        }
    }

    // حذف سجل
    static async deleteRecord(id: string): Promise<void> {
        try {
            const query = new Parse.Query('DailyRecord');
            const record = await query.get(id);
            await record.destroy();
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    }

    // حساب الرصيد القديم للعميل
    static async calculateOldBalance(customerId: string, currentDate: string): Promise<number> {
        try {
            const query = new Parse.Query('DailyRecord');
            query.equalTo('customerId', customerId);
            query.lessThan('date', currentDate);
            const results = await query.find();

            return results.reduce((total: number, obj: any) => {
                return total + (obj.get('remaining') || 0);
            }, 0);
        } catch (error) {
            console.error('Error calculating old balance:', error);
            return 0;
        }
    }
} 