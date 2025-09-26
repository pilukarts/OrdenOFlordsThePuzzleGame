import React from 'react';

interface LordAvatarProps {
  name: string;
}

const LordAvatar: React.FC<LordAvatarProps> = ({ name }) => {
  const imagePath = require(`../../assets/lords/${name}.png`) || require('../../assets/lords/placeholder.png');
  return <img src={imagePath} alt={`Lord ${name}`} />;
};

export default LordAvatar;