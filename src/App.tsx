import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StreetCustomers from './pages/StreetCustomers';
import AreaStreets from './pages/AreaStreets';
import AddEditStreet from './pages/AddEditStreet';
import CustomerDetail from './pages/CustomerDetail';
import CreateOrder from './pages/CreateOrder';
import ItemsManagement from './pages/ItemsManagement';
import Reports from './pages/Reports';
import AddArea from './pages/AddArea';
import AddCustomer from './pages/AddCustomer';
import Header from './components/Header';
import OrderDetail from './pages/OrderDetail';
import Expenses from './pages/Expenses';
import Orders from './pages/Orders';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen pb-16">
        <Header />
        <main className="flex-1 p-4 space-y-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/areas/add" element={<AddArea />} />
            <Route path="/areas/:areaId/streets" element={<AreaStreets />} />
            <Route path="/areas/:areaId/streets/add" element={<AddEditStreet />} />
            <Route path="/streets/:streetId/edit" element={<AddEditStreet />} />
            <Route path="/streets/:streetId/customers" element={<StreetCustomers />} />
            <Route path="/streets/:streetId/customers/add" element={<AddCustomer />} />
            <Route path="/customers/:customerId" element={<CustomerDetail />} />
            <Route path="/customers/:customerId/order" element={<CreateOrder />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/items" element={<ItemsManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 w-full bg-[#1A1A1A] border-t border-[#333] p-3 flex justify-around">
          <a href="/" className="text-gray-400 hover:text-[#10b981] flex flex-col items-center">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="/items" className="text-gray-400 hover:text-[#10b981] flex flex-col items-center">
            <span className="text-xl">📦</span>
            <span className="text-xs mt-1">Items</span>
          </a>
          <a href="/orders" className="text-gray-400 hover:text-[#10b981] flex flex-col items-center">
            <span className="text-xl">📋</span>
            <span className="text-xs mt-1">Orders</span>
          </a>
          <a href="/expenses" className="text-gray-400 hover:text-[#10b981] flex flex-col items-center">
            <span className="text-xl">💸</span>
            <span className="text-xs mt-1">Expenses</span>
          </a>
          <a href="/reports" className="text-gray-400 hover:text-[#10b981] flex flex-col items-center">
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Reports</span>
          </a>
        </nav>
      </div>
    </Router>
  );
}

export default App;
