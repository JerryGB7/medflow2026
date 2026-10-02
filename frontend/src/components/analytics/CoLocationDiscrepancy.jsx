import {useEffect, useState} from "react"
import {Alert, Box, Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material"
import apiClient from "../../api/client"

function getField(record, snakeCaseName, camelCaseName){
	return record?.[snakeCaseName] ?? record?.[camelCaseName]
}

export function countCoLocationDiscrepancies(equipments = [], technicians = []){
	if (technicians.length === 0) {
		return equipments.filter((equipment) => (
			equipment.equipment_hospital_id != null &&
			equipment.technician_hospital_id != null &&
			equipment.equipment_hospital_id !== equipment.technician_hospital_id
		)).length
	}

	const technicianHospitalById = new Map(
		technicians.map((technician) => [
			getField(technician, "id", "id"),
			getField(technician, "hospital_id", "hospitalId"),
		]),
	)

	return equipments.filter((equipment) => {
		const technicianId = getField(equipment, "technician_id", "technicianId")
		const equipmentHospitalId = getField(equipment, "hospital_id", "hospitalId")
		const technicianHospitalId = technicianHospitalById.get(technicianId)

		return technicianId != null && technicianHospitalId != null && equipmentHospitalId !== technicianHospitalId
	}).length
}

function CoLocationDiscrepancy(){
	const [discrepancies, setDiscrepancies] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		let isMounted = true

		async function fetchDiscrepancyData(){
			try {
				const response = await apiClient.get("/equipments/discrepency")
				if (isMounted) {
					setDiscrepancies(response.data)
				}
			} catch {
				if (isMounted) setError("Unable to load co-location discrepancies.")
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		fetchDiscrepancyData()
		return () => {
			isMounted = false
		}
	}, [])

	if (loading) return <CircularProgress aria-label="Loading co-location discrepancies" />
	if (error) return <Alert severity="error">{error}</Alert>

	const discrepancyCount = countCoLocationDiscrepancies(discrepancies)

	return (
		<Card variant="outlined" sx={{borderColor: "#d7dee8", textAlign: "left"}}>
			<CardContent>
				<Stack direction="row" alignItems="center" gap={2} sx={{width: "100%"}}>
					<Box>
						<Typography variant="h6" component="h3" fontWeight={700}>
							Co-location Discrepancy
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Equipments assigned to technicians based at another hospital
						</Typography>
					</Box>
					<Typography variant="h4" color="warning.main" fontWeight={800} sx={{marginLeft: "auto"}}>
						{discrepancyCount}
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	)
}

export default CoLocationDiscrepancy
