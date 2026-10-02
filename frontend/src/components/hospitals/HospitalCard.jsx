import {Card, CardContent, Typography} from '@mui/material'


function HospitalCard({hospital}){


    return(
        <Card variant='outlined' sx={{minWidth: 240}}>
            <CardContent>
                <Typography variant='h6' component="div">
                    {hospital.id}:  {hospital.bName}
                </Typography>
                <Typography color='text.secondary' gutterBottom>
                    Hospital located in: {hospital.locationRegion}
                </Typography>
            </CardContent>
        </Card>
    )
};

export default HospitalCard;