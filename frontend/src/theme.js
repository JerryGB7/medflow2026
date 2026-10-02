/*

*/

import {createTheme} from '@mui/material/styles'

const theme = createTheme({
    palette: {
        mode: 'light',
        primary:{
            main: '#b42332',
            light: '#d94b57',
            dark: '#821b28',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffffff',
        },
        background: {
            default: '#fff8f7',
            paper: '#ffffff',
        },
        text: {
            primary: '#2d2324',
            secondary: '#655457',
        },
        divider: '#eadadb',
    },
    shape: {
        borderRadius: 8,
    },
});

export default theme;