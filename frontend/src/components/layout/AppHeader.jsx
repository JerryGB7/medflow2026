import {useState} from 'react'
import {AppBar, Toolbar, Typography, Box, Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';



function AppHeader({username, role, onLogout, analyticsOptions = [], selectedAnalytics, onSelectAnalytics}) {
    const [menuAnchorEl, setMenuAnchorEl] = useState(null)
    const menuOpen = Boolean(menuAnchorEl)

    return(
        <AppBar position='static'>
            <Toolbar sx={{justifyContent: 'space-between', width: '100%'}}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    {username && (
                        <>
                            <Tooltip title="Choose analytics view">
                                <IconButton
                                    id="analytics-menu-button"
                                    color="inherit"
                                    aria-label="Open analytics menu"
                                    aria-controls={menuOpen ? 'analytics-menu' : undefined}
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpen ? 'true' : undefined}
                                    onClick={(event) => setMenuAnchorEl(event.currentTarget)}
                                    sx={{mr: 1}}
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="analytics-menu"
                                anchorEl={menuAnchorEl}
                                open={menuOpen}
                                onClose={() => setMenuAnchorEl(null)}
                                MenuListProps={{'aria-labelledby': 'analytics-menu-button'}}
                            >
                                {analyticsOptions.map((option) => {
                                    const OptionIcon = option.Icon

                                    return (
                                        <MenuItem
                                            key={option.value}
                                            selected={selectedAnalytics === option.value}
                                            onClick={() => {
                                                onSelectAnalytics(option.value)
                                                setMenuAnchorEl(null)
                                            }}
                                        >
                                            {OptionIcon && (
                                                <ListItemIcon>
                                                    <OptionIcon fontSize="small" />
                                                </ListItemIcon>
                                            )}
                                            <ListItemText primary={option.label} />
                                        </MenuItem>
                                    )
                                })}
                            </Menu>
                        </>
                    )}
                    <MedicalServicesIcon sx={{mr : 2}}/>
                    <Typography variant='h4' component='h1' color='secondary'>
                        MedFlow Demo 
                    </Typography>
                </Box>
                {username && (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: {xs: 1, sm: 2}, ml: 'auto'}}>
                        <Typography variant='body2'>Welcome, {username} ({role})!</Typography>
                        <Button color='secondary' onClick={onLogout}>Log Out</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    )
};

export default AppHeader;