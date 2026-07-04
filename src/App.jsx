import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import PatientProfile from "./pages/profile/PatientProfile";
import DoctorProfile from "./pages/profile/DoctorProfile";
import PharmacistProfile from "./pages/profile/PharmacistProfile";
import Reimbursement from "./pages/Reimbursement";
import Reminders from "./pages/Reminders";
import HealthHistory from "./pages/HealthHistory";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import ServiceCart from "./pages/ServiceCart";
import Nurses from "./pages/Nurses";
import Doctors from "./pages/Doctors";
import PharmacyOrder from "./pages/PharmacyOrder";
import PharmacistHome from "./pages/PharmacistHome";
import PharmacistOrders from "./pages/PharmacistOrders";
import PharmacistDrugs from "./pages/PharmacistDrugs";
import PharmacistEarnings from "./pages/PharmacistEarnings";
import DoctorHome from "./pages/DoctorHome";
import DoctorOrders from "./pages/DoctorOrders";
import DoctorEarnings from "./pages/DoctorEarnings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuickSwitch from "./pages/QuickSwitch";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { CityProvider } from "./store/CityContext";
import { OrdersProvider } from "./store/OrdersContext";
import { PharmacyProvider } from "./store/PharmacyContext";
import { DoctorProvider } from "./store/DoctorContext";
import { ToastProvider } from "./store/ToastContext";
import { RemindersProvider } from "./store/RemindersContext";
import { NotificationsProvider } from "./store/NotificationsContext";
import { SettingsProvider } from "./store/SettingsContext";
import { ActivityLogProvider } from "./store/ActivityLogContext";
import { PatientHealthProvider } from "./store/PatientHealthContext";
import { ProviderProfileProvider } from "./store/ProviderProfileContext";

function Gate() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<QuickSwitch />} />
        <Route path="/kirish" element={<Login />} />
        <Route path="/royxatdan-otish" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === "aptekachi") {
    return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PharmacistHome />} />
          <Route path="/buyurtmalar" element={<PharmacistOrders />} />
          <Route path="/dorilar" element={<PharmacistDrugs />} />
          <Route path="/pul" element={<PharmacistEarnings />} />
          <Route path="/profil" element={<PharmacistProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === "doktor") {
    return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DoctorHome />} />
          <Route path="/buyurtmalar" element={<DoctorOrders />} />
          <Route path="/pul" element={<DoctorEarnings />} />
          <Route path="/profil" element={<DoctorProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/xizmatlar" element={<Services />} />
        <Route path="/band-qilish/:serviceId" element={<Booking />} />
        <Route path="/xizmat-savati" element={<ServiceCart />} />
        <Route path="/xizmat-savati/:providerType/:providerId" element={<ServiceCart />} />
        <Route path="/hamshiralar" element={<Nurses />} />
        <Route path="/doktorlar" element={<Doctors />} />
        <Route path="/dorixona" element={<PharmacyOrder />} />
        <Route path="/buyurtmalar" element={<Orders />} />
        <Route path="/profil" element={<PatientProfile />} />
        <Route path="/reimbursatsiya" element={<Reimbursement />} />
        <Route path="/eslatmalar" element={<Reminders />} />
        <Route path="/sogligim-tarixi" element={<HealthHistory />} />
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
          <PharmacyProvider>
            <DoctorProvider>
              <ToastProvider>
                <NotificationsProvider>
                  <SettingsProvider>
                    <ActivityLogProvider>
                      <PatientHealthProvider>
                        <ProviderProfileProvider>
                          <RemindersProvider>
                            <BrowserRouter>
                              <Gate />
                            </BrowserRouter>
                          </RemindersProvider>
                        </ProviderProfileProvider>
                      </PatientHealthProvider>
                    </ActivityLogProvider>
                  </SettingsProvider>
                </NotificationsProvider>
              </ToastProvider>
            </DoctorProvider>
          </PharmacyProvider>
        </OrdersProvider>
      </CityProvider>
    </AuthProvider>
  );
}
