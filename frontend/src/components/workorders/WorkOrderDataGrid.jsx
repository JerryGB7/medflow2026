import {useEffect, useState} from "react"
import {DataGrid} from "@mui/x-data-grid"
import {Alert, Box, Chip, CircularProgress, Typography} from "@mui/material"
import apiClient from "../../api/client"    

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

function WorkOrderDataGrid(){
    const [workOrders, setWorkOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updateError, setUpdateError] = useState(null)


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
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5}}>
                <Box>
                    <Typography variant="h6" sx={{color: '#fff', fontWeight: 700, letterSpacing: 1.2}}>
                        Operations queue
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {workOrders.length} {workOrders.length === 1 ? 'order' : 'orders'}
                </Typography>
            </Box>
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
        </Box>

    )
}

export default WorkOrderDataGrid;