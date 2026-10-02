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
				{discrepancies.length > 0 && (
					<Stack spacing={1.5} sx={{mt: 2}}>
						{discrepancies.map((equipment) => (
							<Box key={equipment.equipment_id} sx={{pt: 1.5, borderTop: 1, borderColor: "divider"}}>
								<Typography fontWeight={700}>
									{equipment.model}{equipment.serial_number}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Equipment ID: {equipment.equipment_id} 
								</Typography>
								<Typography variant="body2" color="text.secondary">
									At {equipment.equipment_hospital_name}; assigned technician {equipment.technician_name} (ID {equipment.technician_id}) is based at Hospital ({equipment.technician_hospital_id}).
								</Typography>
							</Box>
						))}
					</Stack>
				)}
			</CardContent>
		</Card>
	)
}

export default CoLocationDiscrepancy
