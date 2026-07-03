import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Reimbursement from "./pages/Reimbursement";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { CityProvider } from "./store/CityContext";
import { OrdersProvider } from "./store/OrdersContext";
import { ToastProvider } from "./store/ToastContext";

function Gate() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/kirish" element={<Login />} />
        <Route path="/royxatdan-otish" element={<Register />} />
        <Route path="*" element={<Navigate to="/kirish" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/xizmatlar" element={<Services />} />
        <Route path="/band-qilish/:serviceId" element={<Booking />} />
        <Route path="/buyurtmalar" element={<Orders />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/reimbursatsiya" element={<Reimbursement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <OrdersProvider>
          <ToastProvider>
            <BrowserRouter>
              <Gate />
            </BrowserRouter>
          </ToastProvider>
        </OrdersProvider>
      </CityProvider>
    </AuthProvider>
  );
}
