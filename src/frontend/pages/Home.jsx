import React, { useState, useEffect } from 'react';
import CareConnectLogo from '../components/CareConnectLogo';
import AvatarChat from '../components/AvatarChat';
import { COLORS, GRADIENTS, SHADOWS, BORDER_RADIUS, SPACING } from '../../shared/constants/colors';
import { COUNSELORS } from '../../shared/constants/counselors';

const Home = () => {
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    // Fetch counselors from API
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const response = await fetch('/api/avatars/counselors');
      const data = await response.json();
      setCounselors(data);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
      // Fallback to static data
      setCounselors(Object.values(COUNSELORS));
    }
  };

  const handleStartChat = (counselor) => {
    setSelectedCounselor(counselor);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedCounselor(null);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.background.primary
    },
    header: {
      backgroundColor: COLORS.background.primary,
      padding: `${SPACING.md} 0`,
      boxShadow: SHADOWS.small,
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    nav: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${SPACING.md}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.sm
    },
    navLinks: {
      display: 'flex',
      gap: SPACING.lg,
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: COLORS.text.primary,
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 0.3s ease',
      '&:hover': {
        color: COLORS.primary.main
      }
    },
    hero: {
      background: GRADIENTS.hero,
      padding: `${SPACING.xxxl} 0`,
      textAlign: 'center',
      color: COLORS.primary.contrast
    },
    heroContent: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: `0 ${SPACING.md}`
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 800,
      marginBottom: SPACING.lg,
      lineHeight: 1.2
    },
    heroSubtitle: {
      fontSize: '1.5rem',
      marginBottom: SPACING.xl,
      opacity: 0.9,
      lineHeight: 1.6
    },
    ctaButton: {
      backgroundColor: COLORS.accent.warm,
      color: COLORS.text.primary,
      padding: `${SPACING.md} ${SPACING.xl}`,
      border: 'none',
      borderRadius: BORDER_RADIUS.large,
      fontSize: '1.2rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: SHADOWS.large
      }
    },
    features: {
      padding: `${SPACING.xxxl} 0`,
      backgroundColor: COLORS.background.secondary
    },
    featuresContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${SPACING.md}`
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: SPACING.xxl,
      color: COLORS.text.primary
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: SPACING.xl
    },
    featureCard: {
      backgroundColor: COLORS.background.primary,
      padding: SPACING.xl,
      borderRadius: BORDER_RADIUS.large,
      boxShadow: SHADOWS.medium,
      textAlign: 'center',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)'
      }
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: SPACING.md
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: SPACING.md,
      color: COLORS.text.primary
    },
    featureDescription: {
      color: COLORS.text.secondary,
      lineHeight: 1.6
    },
    counselors: {
      padding: `${SPACING.xxxl} 0`,
      backgroundColor: COLORS.background.primary
    },
    counselorsContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${SPACING.md}`
    },
    counselorsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: SPACING.xl
    },
    counselorCard: {
      backgroundColor: COLORS.background.primary,
      borderRadius: BORDER_RADIUS.large,
      boxShadow: SHADOWS.medium,
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: SHADOWS.large
      }
    },
    counselorHeader: {
      background: GRADIENTS.primary,
      padding: SPACING.lg,
      color: COLORS.primary.contrast,
      textAlign: 'center'
    },
    counselorAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: COLORS.accent.warm,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2rem',
      marginBottom: SPACING.md
    },
    counselorName: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: SPACING.xs
    },
    counselorTitle: {
      fontSize: '1rem',
      opacity: 0.9
    },
    counselorBody: {
      padding: SPACING.lg
    },
    counselorSpecialization: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: COLORS.primary.main,
      marginBottom: SPACING.md
    },
    counselorExpertise: {
      marginBottom: SPACING.lg
    },
    expertiseList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    expertiseItem: {
      padding: `${SPACING.xs} 0`,
      color: COLORS.text.secondary,
      '&::before': {
        content: '"•"',
        color: COLORS.primary.main,
        fontWeight: 'bold',
        marginRight: SPACING.xs
      }
    },
    startChatButton: {
      width: '100%',
      backgroundColor: COLORS.primary.main,
      color: COLORS.primary.contrast,
      padding: SPACING.md,
      border: 'none',
      borderRadius: BORDER_RADIUS.medium,
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: COLORS.primary.dark
      }
    },
    footer: {
      backgroundColor: COLORS.background.dark,
      color: COLORS.text.inverse,
      padding: `${SPACING.xl} 0`,
      textAlign: 'center'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${SPACING.md}`
    }
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Avatars',
      description: 'Lifelike virtual counselors with natural conversations and emotional intelligence'
    },
    {
      icon: '🎭',
      title: 'Personalized Experience',
      description: 'Each counselor has unique expertise, personality, and communication style'
    },
    {
      icon: '🔒',
      title: 'Safe & Secure',
      description: 'Professional boundaries, crisis detection, and immediate support resources'
    },
    {
      icon: '🎯',
      title: 'Specialized Support',
      description: 'Expert counselors for anxiety, trauma, relationships, addiction, and more'
    },
    {
      icon: '💬',
      title: '24/7 Availability',
      description: 'Access to professional mental health support whenever you need it'
    },
    {
      icon: '📱',
      title: 'Easy Access',
      description: 'Simple, intuitive interface accessible from any device'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div style={styles.logo}>
            <CareConnectLogo size="medium" variant="icon" />
            <CareConnectLogo size="medium" variant="text" />
          </div>
          <ul style={styles.navLinks}>
            <li><a href="#features" style={styles.navLink}>Features</a></li>
            <li><a href="#counselors" style={styles.navLink}>Counselors</a></li>
            <li><a href="#about" style={styles.navLink}>About</a></li>
            <li><a href="#contact" style={styles.navLink}>Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            AI-Powered Mental Health Support
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with lifelike virtual counselors who provide professional, 
            empathetic support for your mental health journey. Available 24/7, 
            always here when you need someone to talk to.
          </p>
          <button 
            style={styles.ctaButton}
            onClick={() => document.getElementById('counselors').scrollIntoView({ behavior: 'smooth' })}
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.featuresContent}>
          <h2 style={styles.sectionTitle}>Why Choose CareConnect?</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counselors Section */}
      <section id="counselors" style={styles.counselors}>
        <div style={styles.counselorsContent}>
          <h2 style={styles.sectionTitle}>Meet Our Counselors</h2>
          <div style={styles.counselorsGrid}>
            {counselors.map((counselor) => (
              <div key={counselor.id} style={styles.counselorCard}>
                <div style={styles.counselorHeader}>
                  <div style={styles.counselorAvatar}>
                    {counselor.avatar?.personality === 'empathetic-professional' ? '😊' :
                     counselor.avatar?.personality === 'gentle-supportive' ? '🤗' :
                     counselor.avatar?.personality === 'supportive-encouraging' ? '👍' :
                     counselor.avatar?.personality === 'nurturing-educational' ? '📚' :
                     counselor.avatar?.personality === 'supportive-accountable' ? '💪' :
                     counselor.avatar?.personality === 'compassionate-understanding' ? '💝' : '👨‍⚕️'}
                  </div>
                  <h3 style={styles.counselorName}>{counselor.name}</h3>
                  <p style={styles.counselorTitle}>{counselor.title}</p>
                </div>
                <div style={styles.counselorBody}>
                  <p style={styles.counselorSpecialization}>
                    Specializing in {counselor.specialization}
                  </p>
                  <div style={styles.counselorExpertise}>
                    <strong>Expertise:</strong>
                    <ul style={styles.expertiseList}>
                      {counselor.expertise?.slice(0, 3).map((expertise, index) => (
                        <li key={index} style={styles.expertiseItem}>{expertise}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    style={styles.startChatButton}
                    onClick={() => handleStartChat(counselor)}
                  >
                    Start Chat with {counselor.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>&copy; 2024 CareConnect. All rights reserved.</p>
          <p>Professional AI-powered mental health support available 24/7</p>
        </div>
      </footer>

      {/* Avatar Chat Modal */}
      {showChat && selectedCounselor && (
        <AvatarChat
          counselor={selectedCounselor}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default Home; 