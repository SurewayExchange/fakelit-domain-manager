// Fakelit Deployment Configuration
// Development/Sandbox Domain: selectiveadvertisinggroup.com
// Production Domains: Individual app domains

const deploymentConfig = {
  // Development Environment
  development: {
    domain: 'selectiveadvertisinggroup.com',
    subdomain: 'www.selectiveadvertisinggroup.com',
    environment: 'development',
    database: 'fakelit_dev',
    cloudways: {
      server: 'fakelit-dev-server',
      application: 'fakelit-sandbox'
    }
  },

  // Production Environment Template
  production: {
    environment: 'production',
    database: 'fakelit_prod',
    cloudways: {
      server: 'fakelit-prod-server'
    }
  },

  // Deployment Process
  deploymentProcess: {
    development: {
      description: 'All new applications start development on selectiveadvertisinggroup.com',
      steps: [
        'Create subdomain or subdirectory on selectiveadvertisinggroup.com',
        'Deploy application code to development environment',
        'Configure development database and services',
        'Test all functionality in sandbox environment',
        'SEO/AEO optimization testing',
        'Client review and feedback collection'
      ]
    },
    production: {
      description: 'Completed applications move to their own domain',
      steps: [
        'Register new domain for the application',
        'Configure DNS settings for new domain',
        'Deploy application to production environment',
        'Set up SSL certificate for new domain',
        'Configure production database and services',
        'Final SEO/AEO optimization',
        'Launch application on new domain',
        'Monitor performance and analytics'
      ]
    }
  },

  // Services Offered
  services: {
    hosting: {
      platform: 'Cloudways',
      features: ['99.9% uptime', 'SSL certificates', 'CDN', 'Backups']
    },
    domains: {
      providers: ['Enom', 'Tucow'],
      features: ['Domain registration', 'DNS management', 'Domain privacy']
    },
    development: {
      technologies: ['Node.js', 'React', 'Magento', 'WordPress'],
      features: ['Custom development', 'E-commerce solutions', 'API integration']
    },
    seo: {
      services: ['Technical SEO', 'On-page optimization', 'Off-page strategies'],
      features: ['Keyword research', 'Content optimization', 'Link building']
    },
    aeo: {
      services: ['E-commerce SEO', 'Product optimization', 'Conversion optimization'],
      features: ['Shopping cart optimization', 'Product schema markup', 'A/B testing']
    },
    payments: {
      gateway: 'NMI (Network Merchants Inc.)',
      integration: 'Magento',
      features: ['Credit card processing', 'ACH payments', 'Recurring billing']
    }
  },

  // SEO Configuration
  seo: {
    defaultMeta: {
      title: 'Fakelit - Professional Web Solutions',
      description: 'Hosting, domains, web development, SEO/AEO, and payment processing',
      keywords: 'web hosting, domain management, web development, SEO, AEO, payment processing'
    },
    structuredData: {
      organization: {
        name: 'Fakelit',
        url: 'https://selectiveadvertisinggroup.com',
        logo: 'https://selectiveadvertisinggroup.com/images/fakelit-logo.png'
      }
    }
  },

  // Monitoring and Analytics
  monitoring: {
    uptime: 'UptimeRobot',
    analytics: 'Google Analytics',
    seo: 'Google Search Console',
    performance: 'Google PageSpeed Insights'
  }
};

module.exports = deploymentConfig; 