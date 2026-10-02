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

const analyticsOptions = [
  {value: "maintenance", label: "Maintenance Flags", Component: MaintenanceFlags},
  {value: "low-battery", label: "Low Battery Alert", Component: LowBatteryAlert},
  {value: "co-location", label: "Co-location Discrepancy", Component: CoLocationDiscrepancy},
  {value: "reliability", label: "Reliability Metrics", Component: ReliabilityMetrics},
  {value: "reporting-lines", label: "Reporting Lines", Component: ReportingLines},
]


function Dashboard(){
  const {user, logout} = useAuth()
  const [notification, setNotification] = useState(null)
  const [selectedAnalytics, setSelectedAnalytics] = useState("")
  const selectedOption = analyticsOptions.find((option) => option.value === selectedAnalytics)
  const SelectedAnalytics = selectedOption?.Component

  return(
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      backgroundImage: 'linear-gradient(180deg, rgba(180, 35, 50, 0.07), rgba(255, 248, 247, 0) 320px)',
    }}>
      <AppHeader
        username={user?.sub}
        role={user?.role}
        onLogout={logout}
        analyticsOptions={analyticsOptions}
        selectedAnalytics={selectedAnalytics}
        onSelectAnalytics={setSelectedAnalytics}
      />
      <Container maxWidth="lg" sx={{mt: 4}}>
        <Typography variant="h3" component="h2" gutterBottom>
          Equipment Operations Command Center
        </Typography>
        <Box sx={{mb: 4, minHeight: 180}}>
          {SelectedAnalytics ? (
            <SelectedAnalytics />
          ) : (
            <Alert severity="info" variant="outlined">Choose an analytics view from the menu.</Alert>
          )}
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
          <WorkOrderDataGrid onNotification={setNotification} />
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