import {useEffect, useState} from "react"
import {Alert, Box, Card, CardContent, CircularProgress, Divider, Stack, Typography} from "@mui/material"
import apiClient from "../../api/client"

const MAINTENANCE_THRESHOLD = 30

function MaintenanceFlags(){
	const [hospitals, setHospitals] = useState([])
	const [equipments, setEquipments] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		let isMounted = true

		async function fetchMaintenanceData(){
			try {
				const [hospitalResponse, equipmentResponse] = await Promise.all([
					apiClient.get("/hospitals"),
					apiClient.get("/equipments"),
				])
				if (isMounted) {
					setHospitals(hospitalResponse.data)
					setEquipments(equipmentResponse.data)
				}
			} catch {
				if (isMounted) setError("Unable to load maintenance flags.")
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		fetchMaintenanceData()
		return () => {
			isMounted = false
		}
	}, [])

	const flaggedHospitals = hospitals.map((hospital) => {
		const hospitalEquipment = equipments.filter((equipment) => equipment.hospital_id === hospital.id)
		const maintenanceCount = hospitalEquipment.filter((equipment) => equipment.status === "Maintenance").length
		const percentage = hospitalEquipment.length ? (maintenanceCount / hospitalEquipment.length) * 100 : 0

		return {
			...hospital,
			totalEquipments: hospitalEquipment.length,
			maintenanceCount,
			percentage,
		}
	}).filter((hospital) => hospital.percentage > MAINTENANCE_THRESHOLD)
		.sort((left, right) => right.percentage - left.percentage)

	if (loading) return <CircularProgress aria-label="Loading maintenance flags" />
	if (error) return <Alert severity="error">{error}</Alert>

	return (
		<Card variant="outlined" sx={{borderColor: "#d7dee8", textAlign: "left"}}>
			<CardContent sx={{p: {xs: 2, sm: 3}}}>
				<Stack direction={{xs: "column", sm: "row"}} justifyContent="space-between" gap={2} mb={2}>
					<Box>
						<Stack direction="row" spacing={1} alignItems="center">
							
							<Typography variant="h6" component="h3" fontWeight={700}>
								Maintenance Flags
							</Typography>
						</Stack>
						<Typography variant="body2" color="text.secondary" mt={0.5}>
							Hospitals with more than {MAINTENANCE_THRESHOLD}% of active equipment flagged for maintenance
						</Typography>
					</Box>
					<Box sx={{backgroundColor: "#fff4e5", color: "#8a4b08", px: 1.5, py: 1, borderRadius: 1, alignSelf: {xs: "flex-start", sm: "center"}}}>
						<Typography variant="subtitle2" fontWeight={700}>
							{flaggedHospitals.length} {flaggedHospitals.length === 1 ? "hospital" : "hospitals"} flagged
						</Typography>
					</Box>
				</Stack>

				{flaggedHospitals.length === 0 ? (
					<Alert severity="success" variant="outlined">
						No hospitals currently exceed the {MAINTENANCE_THRESHOLD}% maintenance threshold.
					</Alert>
				) : (
					<Stack divider={<Divider flexItem />}>
						{flaggedHospitals.map((hospital) => (
							<Box key={hospital.id} sx={{py: 1.5, display: "grid", gridTemplateColumns: {xs: "1fr", sm: "minmax(0, 1fr) auto"}, gap: 1.5, alignItems: "center"}}>
								<Box>
									<Typography fontWeight={700}>{hospital.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										{hospital.location_region || "Location not provided"}
									</Typography>
								</Box>
								<Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
									<Typography variant="body2" color="text.secondary">
										{hospital.maintenanceCount} of {hospital.totalEquipments} Equipments
									</Typography>
									<Typography variant="h6" color="warning.main" fontWeight={800}>
										{hospital.percentage.toFixed(0)}%
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

export default MaintenanceFlags
