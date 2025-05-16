import React from 'react';

const Legend = () => {
  return (
    <div style={{ marginTop: '20px', fontSize: '12px', textAlign: 'left', maxWidth: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div><span className="segment vidange" style={{ display: 'inline-block', width: '12px', height: '12px' }}></span> Vidange</div>
        <div><span className="segment sous_vitesse" style={{ display: 'inline-block', width: '12px', height: '12px' }}></span> Sous vitesse</div>
        <div><span className="segment nominal" style={{ display: 'inline-block', width: '12px', height: '12px' }}></span> Nominal</div>
        <div><span className="segment arret" style={{ display: 'inline-block', width: '12px', height: '12px' }}></span> Arrêt</div>
      </div>
    </div>
  );
};

export default Legend;
