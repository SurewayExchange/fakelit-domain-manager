import React from 'react';
import { COLORS, GRADIENTS } from '../../shared/constants/colors';

const CareConnectLogo = ({ size = 'medium', variant = 'full', color = 'primary' }) => {
  const sizes = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 64, height: 64, fontSize: 20 },
    xlarge: { width: 96, height: 96, fontSize: 28 }
  };

  const currentSize = sizes[size];

  const logoStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 700,
      fontSize: currentSize.fontSize,
      color: color === 'primary' ? COLORS.primary.main : COLORS.text.primary,
      textDecoration: 'none'
    },
    icon: {
      width: currentSize.width,
      height: currentSize.height,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    heart: {
      width: '60%',
      height: '60%',
      position: 'relative',
      transform: 'rotate(-45deg)',
      background: GRADIENTS.primary,
      borderRadius: '50% 50% 0 0',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'inherit',
        borderRadius: '50% 50% 0 0'
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '-50%',
        width: '100%',
        height: '100%',
        background: 'inherit',
        borderRadius: '50% 50% 0 0'
      }
    },
    pulse: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: GRADIENTS.primary,
      opacity: 0.3,
      animation: 'pulse 2s infinite'
    },
    text: {
      fontWeight: 700,
      background: GRADIENTS.primary,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    tagline: {
      fontSize: `${currentSize.fontSize * 0.4}px`,
      fontWeight: 400,
      color: COLORS.text.secondary,
      marginTop: '2px'
    }
  };

  const HeartIcon = () => (
    <div style={logoStyles.icon}>
      <div style={logoStyles.pulse}></div>
      <div style={logoStyles.heart}></div>
    </div>
  );

  const TextLogo = () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={logoStyles.text}>
        Care<span style={{ color: COLORS.accent.warm }}>Connect</span>
      </div>
      {variant === 'full' && (
        <div style={logoStyles.tagline}>
          AI-Powered Mental Health Support
        </div>
      )}
    </div>
  );

  const IconOnly = () => <HeartIcon />;

  const IconWithText = () => (
    <div style={logoStyles.container}>
      <HeartIcon />
      <TextLogo />
    </div>
  );

  // Add CSS animation for pulse effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.3;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.1;
        }
        100% {
          transform: scale(1);
          opacity: 0.3;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  switch (variant) {
    case 'icon':
      return <IconOnly />;
    case 'text':
      return <TextLogo />;
    case 'full':
    default:
      return <IconWithText />;
  }
};

export default CareConnectLogo; 