import { useState } from "react"
import { Container, Typography, Box, Snackbar, Alert } from "@mui/material"
import Battery20Icon from '@mui/icons-material/Battery20';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BiotechIcon from '@mui/icons-material/Biotech';
import GradingIcon from '@mui/icons-material/Grading';

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
  {value: "maintenance", label: "Maintenance Flags", Component: MaintenanceFlags, Icon: OutlinedFlagIcon},
  {value: "low-battery", label: "Low Battery Alert", Component: LowBatteryAlert, Icon: Battery20Icon},
  {value: "co-location", label: "Co-location Discrepancy", Component: CoLocationDiscrepancy, Icon: LocationOffIcon},
  {value: "reliability", label: "Reliability Metrics", Component: ReliabilityMetrics, Icon: AnalyticsIcon},
  {value: "reporting-lines", label: "Reporting Lines", Component: ReportingLines, Icon: GroupsIcon},
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
          <LocationCityIcon/> All Hospitals 
        </Typography>
        
        <Box sx={{mb: 4}}>
          <HospitalDataGrid onNotification={setNotification} />
        </Box> 
        <Typography variant="h5" component="h2" gutterBottom>
          <BiotechIcon/> List of Equipment
        </Typography>
          <Box sx={{mb: 4}}>
            <EquipmentDataGrid onNotification={setNotification} />
          </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          <GradingIcon/> Current Work Orders
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