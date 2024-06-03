import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { imageState, clicksState, maskImgState} from "../../services/state";
import * as _ from "underscore";

const Tool = ({ handleMouseMove }) => {
  const image = useRecoilValue(imageState);
  const [maskImg, setMaskImg] = useRecoilState(maskImgState);
  const [clicks, setClicks] = useRecoilState(clicksState); 

  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });
  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);

  const deleteClick = (index) => {
    setClicks(prevClicks => prevClicks.filter((_, i) => i !== index));
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }} >
      {image && (
        <img
          onClick={handleMouseMove}
          onMouseOut={() => {}}
          onTouchStart={handleMouseMove}
          src={image.src}
          style={{
            objectFit: 'cover',
            position: 'relative',
            height: shouldFitToWidth ? 'auto' : '100%',
            width: shouldFitToWidth ? '100%' : 'auto'
          }}
        />
      )}
      {maskImg && (
        <img
          src={maskImg.src}
          style={{
            objectFit: 'cover',
            position: 'absolute',
            opacity: 0.6,
            height: shouldFitToWidth ? 'auto' : '100%',
            width: shouldFitToWidth ? '100%' : 'auto',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        />
      )}
      {clicks && clicks.map((click, index) => (
        <div 
          key={index}
          onClick={() => deleteClick(index)} // Assign delete function
          style={{
            position: 'absolute',
            top: `${click.y}px`,
            left: `${click.x}px`,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: click.clickType == 1 ? 'green' : 'red',
            pointerEvents: 'auto' // Allow pointer events
          }}
        />
      ))}
  </div>
  );
};

export default Tool;
