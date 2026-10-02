import {useEffect, useState} from "react"
import {DataGrid} from "@mui/x-data-grid"
import {Alert, Box, CircularProgress} from "@mui/material"
import apiClient from "../../api/client"    


const columns = [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'name', headerName: 'Model', width: 150},
    {field: 'location_region', headerName: "Location", width: 160},
    {field: 'capacity', headerName: "Capacity", width: 120, type: "number"},
    {field: 'supervisor_id', headerName: "Supervisor ID", width: 120, type: "number"},
];

function HospitalDataGrid(){
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    useEffect(() => {

        let isMounted = true;

        async function fetchHospitals(){
            try{
                const response = await apiClient.get('/hospitals')
                if(isMounted) setHospitals(response.data)
            } catch {
                if (isMounted) setError('error in this')
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchHospitals();
        return () => {
            isMounted = false
        }
    }, []);

    // fun spinning progress indicator if loading data
    if (loading) return <CircularProgress />

    if (error) return <Alert severity="error">{error}</Alert>

    return(
        <Box sx={{height: 400, width: '100%'}}>
            <DataGrid sx={{width: '100%'}} rows={hospitals} columns={columns} getRowId={(row) => row.id}/>
        </Box>
    )
}

export default HospitalDataGrid;