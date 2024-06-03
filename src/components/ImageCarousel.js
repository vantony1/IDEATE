import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ imagePaths }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [imagePaths]);

  return (
    <div>
      <img src={imagePaths[currentIndex]} alt="carousel" />
    </div>
  );
};

export default ImageCarousel;