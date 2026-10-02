import {useEffect, useState} from "react"
import {DataGrid} from "@mui/x-data-grid"
import {Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography} from "@mui/material"
import apiClient from "../../api/client"
import {useAuth} from "../../context/AuthContext"

const emptyForm = {
    title: "",
    priority: "Low",
    status: "Pending",
    equipment_id: "",
    technician_id: "",
}

const columns = [
    {field: 'id', headerName: 'ID', width: 70, type: 'number'},
    {field: 'title', headerName: 'Title', minWidth: 140, flex: 1},
    {
        field: 'priority',
        headerName: "Priority",
        width: 145,
        type: 'singleSelect',
        valueOptions: ['Low', 'Medium', 'Critical'],
        editable: true,
        renderCell: ({value}) => (
            <Chip
                label={value}
                size="small"
                color={value === 'Critical' ? 'error' : value === 'Medium' ? 'warning' : 'success'}
                variant="outlined"
            />
        ),
    },
    {
        field: 'status',
        headerName: "Order status",
        width: 145,
        type: 'singleSelect',
        valueOptions: ['Pending', 'In-Progress', 'Completed', 'Failed'],
        editable: true,
        renderCell: ({value}) => (
            <Chip
                label={value}
                size="small"
                color={value === 'Failed' ? 'error' : value === 'Completed' ? 'success' : 'info'}
                variant={value === 'In-Progress' ? 'filled' : 'outlined'}
            />
        ),
    },
    {field: 'equipment_id', headerName: "Equipment ID", width: 120, type: "number"},
    {field: 'technician_id', headerName: "Technician ID", width: 120, type: "number"},
];

function WorkOrderDataGrid({onNotification = () => {}}){
    const {user} = useAuth()
    const [workOrders, setWorkOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updateError, setUpdateError] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [createError, setCreateError] = useState(null)
    const [creating, setCreating] = useState(false)

    const canCreate = ["Clinical-Admin", "Operation-Manager"].includes(user?.role)

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

        const equipmentId = Number(form.equipment_id)
        const technicianId = Number(form.technician_id)
        if (!form.title.trim() || form.title.trim().length > 50 ||
            !Number.isInteger(equipmentId) || equipmentId < 1 ||
            !Number.isInteger(technicianId) || technicianId < 1) {
            setCreateError("Enter a title (up to 50 characters), equipment ID, and technician ID.")
            return
        }

        setCreating(true)
        try {
            const response = await apiClient.post("/work_orders", {
                title: form.title.trim(),
                priority: form.priority,
                status: form.status,
                equipment_id: equipmentId,
                technician_id: technicianId,
            })
            setWorkOrders((current) => [...current, response.data])
            setCreateOpen(false)
            setForm(emptyForm)
            onNotification({severity: "success", message: "Work order created successfully."})
        } catch (requestError) {
            const detail = requestError.response?.data?.detail
            const message = typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                    ? detail.map((issue) => issue.msg).join(" ")
                    : "The work order could not be created."
            setCreateError(message)
            onNotification({severity: "error", message})
        } finally {
            setCreating(false)
        }
    }

    useEffect(() => {

        let isMounted = true;

        async function fetchWorkOrders(){
            try{
                const response = await apiClient.get('/work_orders')
                if(isMounted) setWorkOrders(response.data)
            } catch {
                if (isMounted) setError('error in this')
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchWorkOrders();
        return () => {
            isMounted = false
        }
    }, []);

    async function processRowUpdate(updatedRow, originalRow){
        setUpdateError(null)

        if (updatedRow.priority !== originalRow.priority){
            const response = await apiClient.patch(
                `/work_orders/${updatedRow.id}/priority`,
                null,
                {params: {new_priority: updatedRow.priority}}
            )
            return response.data
        }

        if (updatedRow.status !== originalRow.status){
            const response = await apiClient.patch(
                `/work_orders/${updatedRow.id}/status`,
                null,
                {params: {new_status: updatedRow.status}}
            )
            return response.data
        }

        return updatedRow
    }

    function handleProcessRowUpdateError(updateError){
        setUpdateError(updateError.response?.data?.detail || 'Unable to update work order')
    }

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', py: 8}}>
                <CircularProgress size={30} />
            </Box>
        )
    }

    if (error) return <Alert severity="error">{error}</Alert>

    return(
        <Box sx={{width: '100%'}}>
            {updateError && (
                <Alert severity="error" sx={{mb: 2}} onClose={() => setUpdateError(null)}>
                    {updateError}
                </Alert>
            )}
            {canCreate && (
                <Box sx={{display: 'flex', justifyContent: 'center', mb: 1.5}}>
                    <Button variant="contained" onClick={() => setCreateOpen(true)}>
                        Create Work Order
                    </Button>
                </Box>
            )}
            <DataGrid
                rows={workOrders}
                columns={columns}
                getRowId={(row) => row.id}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: {paginationModel: {pageSize: 10, page: 0}},
                    sorting: {sortModel: [{field: 'id', sort: 'asc'}]},
                }}
                sx={{
                    minHeight: 390,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'grey.50',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {fontWeight: 700},
                    '& .MuiDataGrid-cell': {borderColor: 'grey.100'},
                    '& .MuiDataGrid-row:hover': {backgroundColor: 'action.hover'},
                    '& .MuiDataGrid-footerContainer': {borderTop: '1px solid', borderColor: 'divider'},
                    '& .MuiDataGrid-virtualScroller': {overflowX: 'auto'},
                }}
            />
            <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create Work Order</DialogTitle>
                <Box component="form" onSubmit={handleCreate}>
                    <DialogContent sx={{display: "grid", gap: 2}}>
                        <TextField
                            name="title"
                            label="Title"
                            value={form.title}
                            onChange={updateForm}
                            inputProps={{maxLength: 50}}
                            required
                        />
                        <TextField name="priority" label="Priority" select value={form.priority} onChange={updateForm}>
                            {["Low", "Medium", "Critical"].map((priority) => (
                                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                            ))}
                        </TextField>
                        <TextField name="status" label="Status" select value={form.status} onChange={updateForm}>
                            {["Pending", "In-Progress", "Completed", "Failed"].map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            name="equipment_id"
                            label="Equipment ID"
                            type="number"
                            value={form.equipment_id}
                            onChange={updateForm}
                            inputProps={{min: 1, step: 1}}
                            required
                        />
                        <TextField
                            name="technician_id"
                            label="Technician ID"
                            type="number"
                            value={form.technician_id}
                            onChange={updateForm}
                            inputProps={{min: 1, step: 1}}
                            required
                        />
                        {createError && <Alert severity="error">{createError}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeCreateDialog} disabled={creating}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={creating}>
                            {creating ? "Creating..." : "Create Work Order"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>

    )
}

export default WorkOrderDataGrid;