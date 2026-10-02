import {Grid} from '@mui/material'
import WorkOrderCard from './WorkOrderCard'

function WorkOrderList({workOrders}){
    return (
        <Grid container spacing={2}>
            {workOrders.map((workOrder)=>
                <Grid item key={workOrder.id}>
                    <WorkOrderCard workOrder={workOrder}/>
                </Grid>)}
        </Grid>
    )
};

export default WorkOrderList;