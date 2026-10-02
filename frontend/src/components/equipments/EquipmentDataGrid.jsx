import {useEffect, useState} from "react"
import {DataGrid} from "@mui/x-data-grid"
import {Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Tooltip} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import apiClient from "../../api/client"
import {useAuth} from "../../context/AuthContext"

const emptyForm = {
    serial_number: "",
    model: "",
    status: "Available",
    battery_level: "100",
    hospital_id: "",
    technician_id: "",
}

function EquipmentDataGrid({onNotification = () => {}}){
    const {user} = useAuth()
    const [equipments, setEquipments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [createError, setCreateError] = useState(null)
    const [creating, setCreating] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const canCreate = user?.role === "Clinical-Admin"

    const columns = [
        {field: 'id', headerName: 'ID', width: 70},
        {field: 'serial_number', headerName: 'Serial Number', width: 150},
        {field: 'model', headerName: "Model", width: 160},
        {field: 'status', headerName: "Equipment status", width: 120},
        {field: 'battery_level', headerName: "Battery Level", width: 120, type: "number"},
        {field: 'hospital_id', headerName: "Hospital ID", width: 120, type: "number"},
        {field: 'technician_id', headerName: "Technician ID", width: 120, type: "number"},
        ...(canCreate ? [{
            field: "actions",
            headerName: "Delete",
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: ({row}) => (
                <Tooltip title="Delete Equipment">
                    <IconButton
                        aria-label={`Delete Equipment ${row.id}`}
                        color="error"
                        onClick={() => setDeleteTarget(row)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ),
        }] : []),
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

        const batteryLevel = Number(form.battery_level)
        if (!form.serial_number || !form.model.trim() || !form.hospital_id ||
            !Number.isInteger(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
            setCreateError("Enter a serial number, model, hospital ID, and battery level from 0 to 100.")
            return
        }

        setCreating(true)
        try {
            const response = await apiClient.post("/equipments", {
                serial_number: Number(form.serial_number),
                model: form.model.trim(),
                status: form.status,
                battery_level: batteryLevel,
                hospital_id: Number(form.hospital_id),
                technician_id: form.technician_id ? Number(form.technician_id) : null,
            })
            setATMS((current) => [...current, response.data])
            setCreateOpen(false)
            setForm(emptyForm)
            onNotification({severity: "success", message: "Equipment created successfully."})
        } catch (requestError) {
            const detail = requestError.response?.data?.detail
            setCreateError(typeof detail === "string" ? detail : "The Equipment could not be created.")
            onNotification({severity: "error", message: typeof detail === "string" ? detail : "The Equipment could not be created."})
        } finally {
            setCreating(false)
        }
    }

    async function handleDelete(){
        if (!deleteTarget) return

        setDeleting(true)
        try {
            await apiClient.delete(`/equipments/${deleteTarget.id}`)
            setEquipments((current) => current.filter((equipment) => equipment.id !== deleteTarget.id))
            setDeleteTarget(null)
            onNotification({severity: "success", message: "Equipment deleted successfully."})
        } catch (requestError) {
            const detail = requestError.response?.data?.detail
            onNotification({severity: "error", message: typeof detail === "string" ? detail : "The Equipment could not be deleted."})
        } finally {
            setDeleting(false)
        }
    }


    useEffect(() => {
        let isMounted = true;

        async function fetchEquipments(){
            try{
                const response = await apiClient.get('/equipments')
                if(isMounted) setEquipments(response.data)
            } catch {
                if (isMounted) setError('error showing atms')
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchEquipments();
        return () => {
            isMounted = false
        }
    }, []);

    // The loading guard ensures the user sees a spinner while the request is in flight.
    // This is important for good UX because it shows the app is actively working instead of
    // appearing blank or frozen during network latency.
    if (loading) return <CircularProgress />

    // If the request fails, we display an error alert with a clear message.
    // This is important because users need immediate feedback about problems with the backend.
    if (error) return <Alert severity="error">{error}</Alert>

    // Once the data is loaded, render the Material UI DataGrid inside a container.
    // The Box gives the grid a fixed height and full width so the table has a consistent layout.
    return(
        <>
        {canCreate && (
            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{mb: 2}}>
                Create Equipment
            </Button>
        )}
        <Box sx={{height: 400, width:'100%'}}>
            <DataGrid
                rows={equipments}
                columns={columns}
                getRowId={(row) => row.id}
            />
        </Box>
        <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
            <DialogTitle>Create Equipment</DialogTitle>
            <Box component="form" onSubmit={handleCreate}>
                <DialogContent sx={{display: "grid", gap: 2}}>
                    <TextField name="serial_number" label="Serial number" type="number" value={form.serial_number} onChange={updateForm} required />
                    <TextField name="model" label="Model" value={form.model} onChange={updateForm} required />
                    <TextField name="status" label="Status" select value={form.status} onChange={updateForm}>
                        {['Available','In-Use', 'Maintenance', 'Offline'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                    </TextField>
                    <TextField name="battery_level" label="Battery level (%)" type="number" inputProps={{min: 0, max: 100}} value={form.battery_level} onChange={updateForm} required />
                    <TextField name="hospital_id" label="Hospital ID" type="number" value={form.hospital_id} onChange={updateForm} required />
                    <TextField name="technician_id" label="Technician ID (optional)" type="number" value={form.technician_id} onChange={updateForm} />
                    {createError && <Alert severity="error">{createError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCreateDialog} disabled={creating}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={creating}>{creating ? "Creating..." : "Create Equipment"}</Button>
                </DialogActions>
            </Box>
        </Dialog>
        <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
            <DialogTitle>Delete Equipment?</DialogTitle>
            <DialogContent>
                Are you sure you want to delete Equipment {deleteTarget?.id}? This action cannot be undone.
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
                <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete Equipment"}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

export default EquipmentDataGrid;