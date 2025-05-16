import React from 'react';
import Navbar from './Navbar'; 

const ConvoyeurBar = ({ alias, jour, data }) => {
  const segments = data?.segments || [];

  const getAdjustedData = (segments) => {
    // Logic for adjusting data as in the original function
    // Filter, sort, and adjust the data based on the state and time
    return segments; // for simplicity, returning raw segments
  };

  const adjustedData = getAdjustedData(segments);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div className="barre" id={`barre-${alias}`} style={{ width: '100%', height: '30px', display: 'flex' }}>
        {adjustedData.map((segment, index) => (
          <div
            key={index}
            className={`segment ${segment.etat}`}
            style={{ width: `${(segment.fin - segment.debut) / 86400 * 100}%`, height: '100%' }}
            title={`${segment.etat} de ${new Date(segment.debut).toLocaleTimeString()} à ${new Date(segment.fin).toLocaleTimeString()}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ConvoyeurBar;
