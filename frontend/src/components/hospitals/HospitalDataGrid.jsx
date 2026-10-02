import {useEffect, useState} from "react"
import {DataGrid} from "@mui/x-data-grid"
import {Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material"
import apiClient from "../../api/client"
import {useAuth} from "../../context/AuthContext"

const emptyForm = {
    name: "",
    location_region: "",
    capacity: "",
    supervisor_id: "",
}

function HospitalDataGrid({onNotification = () => {}}){
    const {user} = useAuth()
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [createError, setCreateError] = useState(null)
    const [creating, setCreating] = useState(false)

    const canCreate = user?.role === "Clinical-Admin"
    const columns = [
        {field: 'id', headerName: 'ID', width: 70},
        {field: 'name', headerName: 'Hospital Name', width: 180},
        {field: 'location_region', headerName: "Location", width: 160},
        {field: 'capacity', headerName: "Capacity", width: 120, type: "number"},
        {field: 'supervisor_id', headerName: "Supervisor ID", width: 120, type: "number"},
    ]

    function updateForm(event){
        setForm((current) => ({...current, [event.target.name]: event.target.value}))
    }

    function closeCreateDialog(){
        if (!creating) {
            setCreateOpen(false)
            setCreateError(null)
            setForm(emptyForm)
        }
    }

    async function handleCreate(event){
        event.preventDefault()
        setCreateError(null)

        const capacity = Number(form.capacity)
        const supervisorId = Number(form.supervisor_id)
        if (!form.name.trim() || !form.location_region.trim() ||
            !Number.isInteger(capacity) || capacity < 1 ||
            !Number.isInteger(supervisorId) || supervisorId < 1) {
            setCreateError("Enter a hospital name, location, positive capacity, and supervisor ID.")
            return
        }

        setCreating(true)
        try {
            const response = await apiClient.post("/hospitals", {
                name: form.name.trim(),
                location_region: form.location_region.trim(),
                capacity,
                supervisor_id: supervisorId,
            })
            setHospitals((current) => [...current, response.data])
            setCreateOpen(false)
            setForm(emptyForm)
            onNotification({severity: "success", message: "Hospital created successfully."})
        } catch (requestError) {
            const detail = requestError.response?.data?.detail
            const message = typeof detail === "string" ? detail : "The hospital could not be created."
            setCreateError(message)
            onNotification({severity: "error", message})
        } finally {
            setCreating(false)
        }
    }

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

    if (loading) return <CircularProgress />

    if (error) return <Alert severity="error">{error}</Alert>

    return(
        <>
            {canCreate && (
                <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                    <Button variant="contained" onClick={() => setCreateOpen(true)}>
                        Create Hospital
                    </Button>
                </Box>
            )}
            <Box sx={{height: 400, width: '100%'}}>
                <DataGrid sx={{width: '100%'}} rows={hospitals} columns={columns} getRowId={(row) => row.id}/>
            </Box>
            <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create Hospital</DialogTitle>
                <Box component="form" onSubmit={handleCreate}>
                    <DialogContent sx={{display: "grid", gap: 2}}>
                        <TextField name="name" label="Hospital name" value={form.name} onChange={updateForm} required />
                        <TextField name="location_region" label="Location" value={form.location_region} onChange={updateForm} required />
                        <TextField name="capacity" label="Capacity" type="number" inputProps={{min: 1, step: 1}} value={form.capacity} onChange={updateForm} required />
                        <TextField name="supervisor_id" label="Supervisor ID" type="number" inputProps={{min: 1, step: 1}} value={form.supervisor_id} onChange={updateForm} required />
                        {createError && <Alert severity="error">{createError}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeCreateDialog} disabled={creating}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={creating}>
                            {creating ? "Creating..." : "Create Hospital"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    )
}

export default HospitalDataGrid;