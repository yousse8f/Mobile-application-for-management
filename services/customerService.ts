import Parse from '../config/parse';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    createdAt: string;
}

export class CustomerService {
    // إضافة عميل جديد
    static async addCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        try {
            const Customer = Parse.Object.extend('Customer');
            const customer = new Customer();

            customer.set('name', customerData.name);
            customer.set('phone', customerData.phone);
            customer.set('address', customerData.address);

            const savedCustomer = await customer.save();

            return {
                id: savedCustomer.id,
                name: savedCustomer.get('name'),
                phone: savedCustomer.get('phone'),
                address: savedCustomer.get('address'),
                createdAt: savedCustomer.createdAt?.toISOString() || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    }

    // جلب جميع العملاء
    static async getAllCustomers(): Promise<Customer[]> {
        try {
            const query = new Parse.Query('Customer');
            query.descending('createdAt');
            const results = await query.find();

            return results.map((obj: any) => ({
                id: obj.id,
                name: obj.get('name'),
                phone: obj.get('phone') || '',
                address: obj.get('address') || '',
                createdAt: obj.createdAt?.toISOString() || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    // تحديث عميل
    static async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
        try {
            const query = new Parse.Query('Customer');
            const customer = await query.get(id);

            if (customerData.name) customer.set('name', customerData.name);
            if (customerData.phone !== undefined) customer.set('phone', customerData.phone);
            if (customerData.address !== undefined) customer.set('address', customerData.address);

            const updatedCustomer = await customer.save();

            return {
                id: updatedCustomer.id,
                name: updatedCustomer.get('name'),
                phone: updatedCustomer.get('phone') || '',
                address: updatedCustomer.get('address') || '',
                createdAt: updatedCustomer.createdAt?.toISOString() || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    // حذف عميل
    static async deleteCustomer(id: string): Promise<void> {
        try {
            const query = new Parse.Query('Customer');
            const customer = await query.get(id);
            await customer.destroy();
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }
} 