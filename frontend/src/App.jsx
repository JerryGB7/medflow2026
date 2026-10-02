import { useState } from "react"
import { Container, Typography, Box, Snackbar, Alert } from "@mui/material"

import AppHeader from "./components/layout/AppHeader"
import EquipmentDataGrid from "./components/equipments/EquipmentDataGrid.jsx"
import HospitalDataGrid from "./components/hospitals/HospitalDataGrid.jsx"
import WorkOrderDataGrid from "./components/workorders/WorkOrderDataGrid.jsx"
import MaintenanceFlags from "./components/analytics/MaintenanceFlags.jsx"
import LowBatteryAlert from "./components/analytics/LowBatteryAlert.jsx"
import CoLocationDiscrepancy from "./components/analytics/CoLocationDiscrepancy.jsx"
import ReliabilityMetrics from "./components/analytics/ReliabilityMetrics.jsx"
import ReportingLines from "./components/analytics/ReportingLines.jsx"


import LoginForm from "./components/auth/LoginForm"
import { AuthProvider, useAuth } from "./context/AuthContext"
import darkBlueBackground from "./assets/OIP.png"



function Dashboard(){
  const {user, logout} = useAuth()
  const [notification, setNotification] = useState(null)

  return(
    <Box sx={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(7, 22, 42, 0.3), rgba(7, 22, 42, 0.3)), url(${darkBlueBackground})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      '& h1, & h2, & h3': {
        textShadow: '1px 0 #fff, -1px 0 #fff, 0 1px #fff, 0 -1px #fff',
      },
    }}>
      <AppHeader username={user?.sub} role={user?.role} onLogout={logout} />
      <Container maxWidth="lg" sx={{mt: 4}}>
        <Typography variant="h3" component="h2" gutterBottom>
          Equipment Operations Command Center
        </Typography>
        <Box sx={{mb: 4}}>
          <MaintenanceFlags />
        </Box>
        <Box sx={{mb: 4}}>
          <LowBatteryAlert />
        </Box>
        <Box sx={{mb: 4}}>
          <CoLocationDiscrepancy />
        </Box>
        <Box sx={{mb: 4}}>
          <ReliabilityMetrics />
        </Box>
        <Box sx={{mb: 4}}>
          <ReportingLines />
        </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          All Hospitals
        </Typography>
        <Box sx={{mb: 4}}>
          <HospitalDataGrid />
        </Box> 
        <Typography variant="h5" component="h2" gutterBottom>
          List of Equipment
        </Typography>
          <Box sx={{mb: 4}}>
            <EquipmentDataGrid onNotification={setNotification} />
          </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Current Work Orders
        </Typography>
        <Box sx={{mb: 4}}>
          <WorkOrderDataGrid />
        </Box>
      </Container>
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        <Alert severity={notification?.severity ?? "success"} onClose={() => setNotification(null)}>
          {notification?.message ?? notification}
        </Alert>
      </Snackbar>
    </Box>
  )
};

function AppContent() {
  const {isAuthenticated} = useAuth()
  return isAuthenticated ? <Dashboard /> : <LoginForm />
}


function App(){

  return(
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  )
};

export default App;