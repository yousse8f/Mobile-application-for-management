import 'react-native-get-random-values';
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// إعدادات Back4App - تم تحديثها بالمفاتيح الحقيقية
const PARSE_APPLICATION_ID = 'oR9fDmXFttnCxSxdlvRgwM8YWEZGXxbqtJMzt07V';
const PARSE_JAVASCRIPT_KEY = 'y11dHE6lMjWBeGeIy6xZFAbSuUnc415gFkf2o2Mc';
const PARSE_REST_API_KEY = 'y11dHE6lMjWBeGeIy6xZFAbSuUnc415gFkf2o2Mc'; // نفس المفتاح
const PARSE_SERVER_URL = 'https://parseapi.back4app.com/';

// تهيئة Parse
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_SERVER_URL;

// إعداد headers إضافية للتوافق مع Back4App REST API
Parse.CoreManager.set('REQUEST_HEADERS', {
    'X-Parse-Application-Id': PARSE_APPLICATION_ID,
    'X-Parse-REST-API-Key': PARSE_REST_API_KEY,
    'Content-Type': 'application/json'
});

export default Parse; 