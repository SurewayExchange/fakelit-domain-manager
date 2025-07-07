const axios = require('axios');

class AvatarService {
  constructor() {
    this.avatarProviders = {
      dicebear: 'https://api.dicebear.com/7.x',
      unsplash: 'https://images.unsplash.com',
      thispersondoesnotexist: 'https://thispersondoesnotexist.com'
    };
    
    this.avatarStyles = {
      avataaars: 'avataaars',
      personas: 'personas',
      bottts: 'bottts',
      identicon: 'identicon',
      initials: 'initials'
    };
  }

  // Generate avatar URL for a counselor
  generateAvatarUrl(counselorName, style = 'avataaars', options = {}) {
    const seed = this.generateSeed(counselorName);
    const baseUrl = `${this.avatarProviders.dicebear}/${style}/svg`;
    
    const params = new URLSearchParams({
      seed,
      backgroundColor: options.backgroundColor || 'b6e3f4',
      mouth: options.mouth || 'smile',
      style: options.style || 'circle',
      radius: options.radius || '50',
      size: options.size || '300'
    });

    // Add additional customization options
    if (options.hair) params.append('hair', options.hair);
    if (options.hairColor) params.append('hairColor', options.hairColor);
    if (options.accessories) params.append('accessories', options.accessories);
    if (options.accessoriesColor) params.append('accessoriesColor', options.accessoriesColor);
    if (options.clothing) params.append('clothing', options.clothing);
    if (options.clothingColor) params.append('clothingColor', options.clothingColor);
    if (options.eyes) params.append('eyes', options.eyes);
    if (options.eyebrow) params.append('eyebrow', options.eyebrow);
    if (options.facialHair) params.append('facialHair', options.facialHair);
    if (options.facialHairColor) params.append('facialHairColor', options.facialHairColor);
    if (options.skinColor) params.append('skinColor', options.skinColor);

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate seed from counselor name
  generateSeed(name) {
    return name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  }

  // Get counselor-specific avatar configuration
  getCounselorAvatarConfig(counselorId) {
    const configs = {
      'dr-sarah-mitchell': {
        style: 'avataaars',
        backgroundColor: 'b6e3f4',
        hair: 'long',
        hairColor: 'brown',
        accessories: 'round',
        clothing: 'shirtCrewNeck',
        clothingColor: 'blue',
        eyes: 'happy',
        mouth: 'smile',
        skinColor: 'light'
      },
      'michael-rodriguez': {
        style: 'avataaars',
        backgroundColor: 'ffdfbf',
        hair: 'short',
        hairColor: 'black',
        accessories: 'round',
        clothing: 'shirtCrewNeck',
        clothingColor: 'green',
        eyes: 'happy',
        mouth: 'smile',
        skinColor: 'brown'
      },
      'dr-emily-chen': {
        style: 'avataaars',
        backgroundColor: 'f0f8ff',
        hair: 'long',
        hairColor: 'black',
        accessories: 'round',
        clothing: 'shirtCrewNeck',
        clothingColor: 'purple',
        eyes: 'happy',
        mouth: 'smile',
        skinColor: 'light'
      },
      'james-williams': {
        style: 'avataaars',
        backgroundColor: 'e6f3ff',
        hair: 'short',
        hairColor: 'brown',
        accessories: 'round',
        clothing: 'shirtCrewNeck',
        clothingColor: 'navy',
        eyes: 'happy',
        mouth: 'smile',
        skinColor: 'light'
      },
      'dr-maria-garcia': {
        style: 'avataaars',
        backgroundColor: 'ffe6e6',
        hair: 'long',
        hairColor: 'brown',
        accessories: 'round',
        clothing: 'shirtCrewNeck',
        clothingColor: 'red',
        eyes: 'happy',
        mouth: 'smile',
        skinColor: 'brown'
      },
      'lisa-thompson': {
        style: 'avataaars',
        backgroundColor: 'f0fff0',
        hair: 'long',
        hairColor: 'blonde',
        accessories: 'round',
        clothing: 'shirtCrewNeck',
        clothingColor: 'pink',
        eyes: 'happy',
        mouth: 'smile',
        skinColor: 'light'
      }
    };

    return configs[counselorId] || configs['dr-sarah-mitchell'];
  }

  // Generate complete avatar object for a counselor
  generateCounselorAvatar(counselorId, counselorName) {
    const config = this.getCounselorAvatarConfig(counselorId);
    
    return {
      image: this.generateAvatarUrl(counselorName, config.style, config),
      thumbnail: this.generateAvatarUrl(counselorName, config.style, { ...config, size: '150' }),
      animated: this.generateAvatarUrl(counselorName, config.style, { ...config, animated: true }),
      description: this.generateAvatarDescription(counselorName, config),
      config: config
    };
  }

  // Generate avatar description
  generateAvatarDescription(counselorName, config) {
    const descriptions = {
      'dr-sarah-mitchell': 'Professional headshot of Dr. Sarah Mitchell, a warm and empathetic clinical psychologist with kind eyes and a gentle smile',
      'michael-rodriguez': 'Professional photo of Michael Rodriguez, a supportive substance abuse counselor with a compassionate expression and approachable demeanor',
      'dr-emily-chen': 'Professional headshot of Dr. Emily Chen, a compassionate marriage and family therapist with a warm smile and understanding expression',
      'james-williams': 'Professional photo of James Williams, a practical career and life coach with a confident and encouraging expression',
      'dr-maria-garcia': 'Professional headshot of Dr. Maria Garcia, a calm and stabilizing crisis intervention specialist with a reassuring presence',
      'lisa-thompson': 'Professional photo of Lisa Thompson, a welcoming onboarding specialist with a friendly and informative demeanor'
    };

    const counselorKey = counselorName.toLowerCase().replace(/\s+/g, '-');
    return descriptions[counselorKey] || `Professional photo of ${counselorName} with a warm and approachable expression`;
  }

  // Get avatar with different expressions
  getAvatarWithExpression(counselorId, counselorName, expression = 'smile') {
    const config = this.getCounselorAvatarConfig(counselorId);
    const expressionConfig = {
      ...config,
      mouth: expression,
      eyes: expression === 'smile' ? 'happy' : expression === 'concerned' ? 'concerned' : 'normal'
    };

    return {
      image: this.generateAvatarUrl(counselorName, config.style, expressionConfig),
      thumbnail: this.generateAvatarUrl(counselorName, config.style, { ...expressionConfig, size: '150' }),
      expression: expression
    };
  }

  // Get avatar with different moods
  getAvatarWithMood(counselorId, counselorName, mood = 'neutral') {
    const moodConfigs = {
      happy: { mouth: 'smile', eyes: 'happy' },
      concerned: { mouth: 'concerned', eyes: 'concerned' },
      listening: { mouth: 'neutral', eyes: 'attentive' },
      supportive: { mouth: 'smile', eyes: 'caring' },
      professional: { mouth: 'neutral', eyes: 'focused' }
    };

    const config = this.getCounselorAvatarConfig(counselorId);
    const moodConfig = { ...config, ...moodConfigs[mood] };

    return {
      image: this.generateAvatarUrl(counselorName, config.style, moodConfig),
      thumbnail: this.generateAvatarUrl(counselorName, config.style, { ...moodConfig, size: '150' }),
      mood: mood
    };
  }

  // Generate animated avatar (GIF-like effect with multiple frames)
  generateAnimatedAvatar(counselorId, counselorName) {
    const config = this.getCounselorAvatarConfig(counselorId);
    const frames = [];

    // Generate different expressions for animation
    const expressions = ['smile', 'neutral', 'concerned', 'smile'];
    
    expressions.forEach((expression, index) => {
      const frameConfig = {
        ...config,
        mouth: expression,
        eyes: expression === 'smile' ? 'happy' : expression === 'concerned' ? 'concerned' : 'normal',
        delay: index * 1000 // 1 second delay between frames
      };
      
      frames.push({
        url: this.generateAvatarUrl(counselorName, config.style, frameConfig),
        expression: expression,
        delay: frameConfig.delay
      });
    });

    return {
      frames,
      duration: frames.length * 1000,
      loop: true
    };
  }

  // Get avatar for different contexts
  getContextualAvatar(counselorId, counselorName, context = 'general') {
    const contextConfigs = {
      greeting: { mouth: 'smile', eyes: 'happy', accessories: 'round' },
      listening: { mouth: 'neutral', eyes: 'attentive', accessories: 'round' },
      crisis: { mouth: 'concerned', eyes: 'concerned', accessories: 'round' },
      professional: { mouth: 'neutral', eyes: 'focused', accessories: 'round' },
      supportive: { mouth: 'smile', eyes: 'caring', accessories: 'round' }
    };

    const config = this.getCounselorAvatarConfig(counselorId);
    const contextConfig = { ...config, ...contextConfigs[context] };

    return {
      image: this.generateAvatarUrl(counselorName, config.style, contextConfig),
      thumbnail: this.generateAvatarUrl(counselorName, config.style, { ...contextConfig, size: '150' }),
      context: context
    };
  }

  // Validate avatar URL
  async validateAvatarUrl(url) {
    try {
      const response = await axios.head(url);
      return response.status === 200;
    } catch (error) {
      console.error('Avatar URL validation failed:', error.message);
      return false;
    }
  }

  // Get fallback avatar if main avatar fails
  getFallbackAvatar(counselorName) {
    const seed = this.generateSeed(counselorName);
    return {
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4&textColor=ffffff&size=300`,
      thumbnail: `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4&textColor=ffffff&size=150`,
      animated: `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4&textColor=ffffff&size=300`,
      description: `Initials avatar for ${counselorName}`,
      isFallback: true
    };
  }

  // Generate avatar for new counselor
  generateNewCounselorAvatar(counselorName, specialization, options = {}) {
    const defaultConfig = {
      style: 'avataaars',
      backgroundColor: 'b6e3f4',
      hair: 'short',
      hairColor: 'brown',
      accessories: 'round',
      clothing: 'shirtCrewNeck',
      clothingColor: 'blue',
      eyes: 'happy',
      mouth: 'smile',
      skinColor: 'light'
    };

    const config = { ...defaultConfig, ...options };
    return this.generateCounselorAvatar('new-counselor', counselorName);
  }
}

module.exports = AvatarService; 