// this section will be for grabbing the ATMS that are operating below 20 cash_level across all branches
import {useEffect, useState} from "react"
import {Alert, Box, Card, CardContent, CircularProgress, Divider, Stack, Typography} from "@mui/material"
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined"
import apiClient from "../../api/client"

const LOW_BATTERY_THRESHOLD = 20

function LowBatteryAlert(){

	const [equipments, setEquipments] = useState([])
	const [hospitals, setHospitals] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)


	useEffect(() => {
		let isMounted = true

		async function fetchLowBatteryData(){
			try {
				const [equipmentResponse, hospitalResponse] = await Promise.all([
					apiClient.get(`/equipments/low_battery?low_battery_threshold=${LOW_BATTERY_THRESHOLD}`),
					apiClient.get("/hospitals"),
				])
				if (isMounted) {
					setEquipments(equipmentResponse.data)
					setHospitals(hospitalResponse.data)
				}
			} catch {
				if (isMounted) setError("Unable to load maintenance flags.")
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		fetchLowBatteryData()
		return () => {
			isMounted = false
		}
	}, [])


	const lowBattery = equipments
		.filter((equipment) => equipment.status !== "Offline")
		.map((equipment) => ({
			...equipment,
			hospital: hospitals.find((hospital) => hospital.id === equipment.hospital_id),
		}))
		.sort((left, right) => left.battery_level - right.battery_level)

	if (loading) return <CircularProgress aria-label="Loading low battery flags" />
	if (error) return <Alert severity="error">{error}</Alert>

	return (
		<Card variant="outlined" sx={{borderColor: "#d7dee8", textAlign: "left"}}>
			<CardContent sx={{p: {xs: 2, sm: 3}}}>
				<Stack direction={{xs: "column", sm: "row"}} justifyContent="space-between" gap={2} mb={2}>
					<Box>
						<Stack direction="row" spacing={1} alignItems="center">
							<Typography variant="h6" component="h3" fontWeight={700}>
								Low Battery Alert
							</Typography>
						</Stack>
						<Typography variant="body2" color="text.secondary" mt={0.5}>
							Hospitals with less than {LOW_BATTERY_THRESHOLD}% of active Equipments flagged for low-battery
						</Typography>
					</Box>
					<Box sx={{backgroundColor: "#fff4e5", color: "#8a4b08", px: 1.5, py: 1, borderRadius: 1, alignSelf: {xs: "flex-start", sm: "center"}}}>
								<Typography variant="subtitle2" fontWeight={700}>
									{lowBattery.length} {lowBattery.length === 1 ? "Equipment" : "Equipments"} flagged
						</Typography>
					</Box>
				</Stack>

				{lowBattery.length === 0 ? (
					<Alert severity="success" variant="outlined">
						No active equipments currently operate below the {LOW_BATTERY_THRESHOLD}% battery charge threshold.
					</Alert>
				) : (

					<Stack divider={<Divider flexItem />}>
						{lowBattery.map((equipment) => (
							<Box key={equipment.id} sx={{py: 1.5, display: "grid", gridTemplateColumns: {xs: "1fr", sm: "minmax(0, 1fr) auto"}, gap: 1.5, alignItems: "center"}}>
								<Box>
									<Typography fontWeight={700}>{equipment.serial_number}</Typography>
									<Typography variant="body2" color="text.secondary">
										{equipment.hospital?.name || `Hospital ${equipment.hospital_id}`}
									</Typography>
								</Box>
								<Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
									<Typography variant="body2" color="text.secondary">
										{equipment.model || "Equipment"}
									</Typography>
									<Typography variant="h6" color="warning.main" fontWeight={800}>
										{equipment.battery_level}%
									</Typography>
								</Stack>
							</Box>
						))}
					</Stack>
				)}
			</CardContent>
		</Card>
	)
}

export default LowBatteryAlert