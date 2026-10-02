import {Card, CardContent, Typography, Chip, Stack} from '@mui/material'

const UNDER_CHARGE = 1
const OVER_CHARGE = 100
const LOW_BATTERY_WARNING = 20

function EquipmentCard({equipment}){
    const chargeOverUnder = equipment.batteryLevel < UNDER_CHARGE ||  equipment.batteryLevel > OVER_CHARGE
    const lowBatteryWarning = equipment.batteryLevel < LOW_BATTERY_WARNING && equipment.batteryLevel > UNDER_CHARGE
    const inMaintenance = equipment.status == "Maintenance" || equipment.status == "Offline"

    return(
        <Card variant='outlined' sx={{minWidth: 240}}>
            <CardContent>
                <Typography variant='h6' component="div">
                    {equipment.serialNumber}
                </Typography>
                <Typography color='text.secondary' gutterBottom>
                   Model: '{equipment.model}' ID: {equipment.id}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`${equipment.batteryLevel}%`} 
                        color={lowBatteryWarning ? 'warning' : 'success' && chargeOverUnder ? 'error' : 'success'}>

                    </Chip>
                    <Chip label={equipment.status} variant='outlined' size='medium' color={inMaintenance ? 'error' : 'success'}/>
                </Stack>
            </CardContent>
        </Card>
    )
};

export default EquipmentCard;