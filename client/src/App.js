import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage/HomePage';
import Login from './Authentication/Login';
import Register from './Authentication/RegisterFarmer';
import FarmerDashboard from './FarmerDashboard/FarmerDashboard';
import PlantingApplicationForm from './FarmerDashboard/PlantingApplicationForm ';
import WeatherPage from './FarmerDashboard/WeatherPage';
import ViewProtectionPage from './FarmerDashboard/ViewProtectionPage';
import AgroAdvisoryPage from './FarmerDashboard/AgroAdvisoryPage';
import MakeCallPage from './FarmerDashboard/MakeCallPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/planting-application" element={<PlantingApplicationForm />} />
          <Route path="/weather" element={<WeatherPage/>} />
          <Route path="/plant-protection" element={<ViewProtectionPage />} />
          <Route path="/agro-advisory" element={<AgroAdvisoryPage />} />
          <Route path="/make-a-call" element={<MakeCallPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;