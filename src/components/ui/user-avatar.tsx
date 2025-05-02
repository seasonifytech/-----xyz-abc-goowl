import React from 'react';

const UserAvatar: React.FC = () => {
  return (
    <div className="relative">
      <img 
        src="/image-63.png" 
        alt="GOWL Mascot" 
        className="w-24 h-24 object-contain"
      />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center animate-pulse"></div>
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center animate-pulse"></div>
    </div>
  );
};

export default UserAvatar;