import {Card, CardContent, Typography, Chip, Stack} from '@mui/material'


function WorkOrderCard({workOrder}){

    const isCritical = workOrder.priority == 'Critical'
    const isMedium = workOrder.priority == 'Medium'

    return(
        <Card variant='outlined' sx={{minWidth: 240}}>
            <CardContent>
                <Typography variant='h6' component="div">
                    {workOrder.id}:  {workOrder.title}
                </Typography>
                <Typography color='text.secondary' gutterBottom>
                    Equipment ID: {workOrder.equipmentId}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`${workOrder.priority}`} color={isCritical ? 'error' : 'success' && isMedium ? 'warning' : 'success'}></Chip>
                    <Chip label={`${workOrder.woStatus}`} variant='outlined' size='medium' color="primary"/>
                </Stack>
            </CardContent>
        </Card>
    )
};

export default WorkOrderCard;