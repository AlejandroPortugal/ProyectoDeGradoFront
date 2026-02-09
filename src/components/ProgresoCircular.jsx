import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import './ProgresoCircular.css';

const FullScreenLoader = () => {
  return (
    <div className="fullscreen-loader">
      <Stack direction="row" justifyContent="center" alignItems="center">
        <CircularProgress style={{ color: '#009929' }} size={80} />
      </Stack>
    </div>
  );
};

export default FullScreenLoader;
