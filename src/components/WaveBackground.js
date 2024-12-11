import React from 'react';
import Svg, { Path } from 'react-native-svg';

const WaveBackground = () => {
  return (
    <Svg
      height="160" // Adjusted height to align with the profile picture
      width="100%"
      viewBox="0 0 1440 320"
      style={{ position: 'absolute', top: 100 }}
    >
      <Path
        fill="#22c55e" // HouseTabz theme color
        d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,181.3C672,203,768,213,864,208C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </Svg>
  );
};

export default WaveBackground;
