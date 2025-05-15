import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Alerts from './pages/Alerts'
import Expenses from './pages/Expenses'
import PrivateRoute from './pages/PrivateRoute'
import Bills from './pages/Bills'
import Deposits from './pages/Deposits'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/bills" element={<Bills />} />
      </Route>
    </Routes>
  );
}

export default App
