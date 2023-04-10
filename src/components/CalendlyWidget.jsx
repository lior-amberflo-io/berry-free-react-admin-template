import React, { useEffect } from 'react';

const CalendlyWidget = ({ url, styles }) => {
  useEffect(() => {
    // Load the Calendly script
    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.setAttribute('src', 'https://assets.calendly.com/assets/external/widget.js');
    head.appendChild(script);
  }, []);

  return (
    <div>
      <div
        className="calendly-inline-widget"
        data-url={url}
        style={styles}
      ></div>
    </div>
  );
};

export default CalendlyWidget;
