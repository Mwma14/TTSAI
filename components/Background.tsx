import React, { useEffect, useRef } from 'react';

export const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Dynamic import for the ThreeJS Tubes Cursor script
    // This script is pre-bundled and should work without external three.js dependency in typical usage,
    // or it bundles its own.
    // @ts-ignore
    import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')
      .then((mod) => {
        const TubesCursor = mod.default;
        if (canvasRef.current) {
             const cursor = TubesCursor(canvasRef.current, {
                tubes: {
                    colors: ["#f967fb", "#53bc28", "#6958d5"],
                    lights: {
                    intensity: 200,
                    colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
                    }
                }
            });
            
            // Add click interaction
            const handleClick = () => {
                if (cursor && cursor.tubes) {
                   // Randomize colors slightly on click
                   const randomColor = () => "#" + Math.floor(Math.random()*16777215).toString(16);
                   cursor.tubes.setColors([randomColor(), randomColor(), randomColor()]);
                }
            };
            
            document.body.addEventListener('click', handleClick);
            
            return () => {
                document.body.removeEventListener('click', handleClick);
            };
        }
      })
      .catch(err => console.error("Failed to load background script", err));
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        id="canvas"
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} 
    />
  );
};
