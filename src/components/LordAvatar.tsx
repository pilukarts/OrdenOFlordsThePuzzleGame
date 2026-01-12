import React from 'react';

// Define las props que el componente aceptará
interface LordAvatarProps {
  lordName: string;
  imagePath: string;
}

// El componente recibe lordName y imagePath y los usa para renderizar el avatar
const LordAvatar: React.FC<LordAvatarProps> = ({ lordName, imagePath }) => {
  return (
    <div className="lord-avatar">
      <img src={imagePath} alt={lordName} className="lord-avatar-image" />
      <p className="lord-avatar-name">{lordName}</p>
    </div>
  );
};

export default LordAvatar;
