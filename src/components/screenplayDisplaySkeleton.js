import React, { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

function TabPanelSkeleton(props) {
    const { index, ...other } = props;

    return (
        <div
            role="tabpanel"
            id={`scene-tabpanel-${index}`}
            aria-labelledby={`scene-tab-${index}`}
            {...other}
        >
            <Box p={3} >
                <Typography>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton width="60%" />
                </Typography>
            </Box>
        </div>
    );
}

const ScreenplayDisplaySkeleton = ({ sceneCount = 1 }) => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{
                    style: {
                        backgroundColor: "#000",
                    },
                }}
                sx={{
                    marginLeft: '1.5rem',
                    '.MuiTab-root': {
                        border: '1px solid #ddd',
                        mx: '2px',
                        '&.Mui-selected': {
                            color: 'secondary',
                        }
                    },
                }}
            >
                {Array(sceneCount).fill().map((_, index) => (
                    <Tab
                        component={Skeleton}
                        id={`scene-tab-${index}`}
                        key={index}
                    />
                ))}
            </Tabs>
            {Array(sceneCount).fill().map((_, index) =>
                <TabPanelSkeleton index={index} key={index} />
            )}
        </div>
    );
};

export default ScreenplayDisplaySkeleton;
