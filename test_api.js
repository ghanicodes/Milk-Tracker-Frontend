import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let cookieContext = '';
api.interceptors.response.use((response) => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    cookieContext = setCookie[0].split(';')[0];
  }
  return response;
});
api.interceptors.request.use((config) => {
  if (cookieContext) {
    config.headers.Cookie = cookieContext;
  }
  return config;
});

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  let farmerId, retailerId, customerId;

  try {
    // 1. Auth Tests
    console.log('Testing Admin Login...');
    const loginRes = await api.post('/api/admin/login', { email: 'admin@example.com', password: 'admin123' });
    console.log('✅ Login successful:', loginRes.data.message);

    console.log('Testing Dashboard Auth...');
    const dashRes = await api.get('/api/adminDashboard');
    console.log('✅ Dashboard access successful:', dashRes.data.message);

    // 2. Farmer
    console.log('Testing Add Farmer...');
    const farmerRes = await api.post('/api/addFarmer', {
      name: 'Test Farmer',
      phone: '1234567890',
      advance: 1000,
      defaultMilkType: 'Cow'
    });
    farmerId = farmerRes.data.newFarmer?._id;
    console.log('✅ Farmer added:', farmerId);

    // 3. Milk Collection
    if (farmerId) {
      console.log('Testing Add Milk Collection...');
      const milkRes = await api.post('/api/addMilk', {
        farmerId,
        date: new Date().toISOString(),
        morningAmount: 10,
        morningMilkType: 'Cow',
        eveningAmount: 12,
        eveningMilkType: 'Buffalo'
      });
      console.log('✅ Milk collection added for farmer');
    }

    // 4. Retailer
    console.log('Testing Add Retailer...');
    const retailerRes = await api.post('/api/addRetailer', {
      name: 'Test Retailer',
      phone: `98765${Math.floor(Math.random() * 10000)}`, // unique phone
      address: 'Test Addr',
      defaultMilkType: 'Buffalo',
      milkPrices: { cow: 50, buffalo: 60 }
    });
    retailerId = retailerRes.data.retailer?._id;
    console.log('✅ Retailer added:', retailerId);

    console.log('Testing Get Retailers...');
    const getRetRes = await api.get('/api/getRetailer');
    console.log(`✅ Got ${getRetRes.data.count} retailers`);

    // 5. Sale Milk Retailer
    if (retailerId) {
      console.log('Testing Add Sale Milk...');
      const saleRes = await api.post('/api/addSaleMilkRetailer', {
        retailerId,
        date: new Date().toISOString(),
        morning: { quantity: 20, milkType: 'Buffalo', pricePerLiter: 60 }
      });
      console.log('✅ Sale Milk added');
    }

    // 6. Home Delivery
    console.log('Testing Add Home Delivery Customer...');
    const hdRes = await api.post('/api/addHomeDelivery', {
      customerName: 'Test Customer',
      customerPhone: '9998887776',
      customerAddress: 'Home 1',
      area: 'North',
      milkType: 'cow',
      quantity: 2,
      pricePerLiter: 55,
      startDate: new Date().toISOString(),
      deliverySchedule: 'daily',
      paymentType: 'monthly'
    });
    customerId = hdRes.data.homeDelivery?._id;
    console.log('✅ Home Delivery Customer added:', customerId);

    if (customerId) {
      console.log('Testing Add Delivery Log...');
      const logRes = await api.post(`/api/addDelivery/${customerId}`, {
        deliveryDate: new Date().toISOString(),
        status: 'delivered',
        quantity: 2
      });
      console.log('✅ Delivery logged, new balance:', logRes.data.balance);
    }

    console.log('Testing Get All Home Deliveries...');
    const getAllHdRes = await api.get('/api/getAllHomeDeliveries');
    console.log(`✅ Got ${getAllHdRes.data.homeDeliveries?.length} home deliveries`);

    // 7. Open Rate Milk
    console.log('Testing Add Open Rate Milk...');
    const openRes = await api.post('/api/addOpenMilk', {
      name: 'Walk-in Customer',
      address: 'Local',
      quantity: 5,
      pricePerLiter: 60,
      date: new Date().toISOString(),
      shift: 'morning'
    });
    console.log('✅ Open Rate Milk added');

    console.log('--- All Tests Passed! ---');
  } catch (err) {
    console.error('❌ API Test Failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Message:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

runTests();
