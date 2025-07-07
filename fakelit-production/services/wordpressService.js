const fs = require('fs').promises;
const path = require('path');

class WordPressService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.themesDirectory = 'wordpress/themes';
        this.sitesDirectory = 'wordpress/sites';
        this.clientsDirectory = 'wordpress/clients';
        
        this.supportTiers = {
            free: {
                name: 'Free Support',
                price: 0,
                features: [
                    'Email support (48-hour response)',
                    'Basic documentation access',
                    'Community forum access',
                    'Knowledge base access'
                ],
                limitations: [
                    'No live chat',
                    'No AI assistance',
                    'No priority support',
                    'No custom integrations'
                ]
            },
            ai_support: {
                name: 'AI Support with Live Chat',
                price: 150,
                features: [
                    'All Free features',
                    'AI-powered support assistant',
                    'Live chat support (business hours)',
                    'Priority email support (24-hour response)',
                    'Custom knowledge base',
                    'Video tutorials access',
                    'Basic integration support'
                ],
                limitations: [
                    'No custom development',
                    'No advanced integrations',
                    'No dedicated support agent'
                ]
            },
            premium: {
                name: 'Premium Integration & AI Support',
                price: 550,
                features: [
                    'All AI Support features',
                    'Custom WordPress integrations',
                    'Dedicated support agent',
                    '24/7 live chat support',
                    'Custom theme development',
                    'Plugin customization',
                    'Performance optimization',
                    'Security hardening',
                    'SEO optimization',
                    'Backup and recovery',
                    'Migration assistance',
                    'Training sessions'
                ],
                limitations: [
                    'No unlimited custom development',
                    'No enterprise-level features'
                ]
            }
        };
        
        this.initializeService();
    }

    async initializeService() {
        try {
            // Create directories if they don't exist
            await fs.mkdir(this.themesDirectory, { recursive: true });
            await fs.mkdir(this.sitesDirectory, { recursive: true });
            await fs.mkdir(this.clientsDirectory, { recursive: true });
            
            console.log('✅ WordPress service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize WordPress service:', error);
        }
    }

    // WordPress Theme Management
    async createTheme(themeData) {
        try {
            const themeId = `theme_${Date.now()}`;
            const themePath = path.join(this.themesDirectory, themeId);
            
            await fs.mkdir(themePath, { recursive: true });
            
            const theme = {
                id: themeId,
                name: themeData.name,
                description: themeData.description,
                version: '1.0.0',
                author: 'Fakelit.com',
                category: themeData.category || 'general',
                tags: themeData.tags || [],
                features: themeData.features || [],
                price: themeData.price || 0,
                isCustom: themeData.isCustom || false,
                clientId: themeData.clientId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active',
                poweredBy: this.brandName
            };

            // Create theme files
            const themeFiles = this.generateThemeFiles(theme, themeData);
            
            for (const [filename, content] of Object.entries(themeFiles)) {
                await fs.writeFile(path.join(themePath, filename), content);
            }

            // Save theme metadata
            await fs.writeFile(
                path.join(themePath, 'theme.json'),
                JSON.stringify(theme, null, 2)
            );

            console.log(`✅ WordPress theme created: ${themeId}`);
            return theme;
        } catch (error) {
            console.error('❌ Failed to create WordPress theme:', error);
            throw error;
        }
    }

    generateThemeFiles(theme, themeData) {
        const files = {};

        // style.css
        files['style.css'] = `/*
Theme Name: ${theme.name}
Description: ${theme.description}
Version: ${theme.version}
Author: ${theme.author}
Author URI: https://fakelit.com
Text Domain: ${theme.name.toLowerCase().replace(/\s+/g, '-')}
*/

/* Custom CSS for ${theme.name} */
${themeData.customCSS || ''}
`;

        // functions.php
        files['functions.php'] = `<?php
/**
 * ${theme.name} Theme Functions
 * Powered by Fakelit.com
 */

// Theme setup
function ${theme.name.toLowerCase().replace(/\s+/g, '_')}_setup() {
    // Add theme support
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
        'footer' => __('Footer Menu', '${theme.name.toLowerCase().replace(/\s+/g, '-')}'),
    ));
}
add_action('after_setup_theme', '${theme.name.toLowerCase().replace(/\s+/g, '_')}_setup');

// Enqueue scripts and styles
function ${theme.name.toLowerCase().replace(/\s+/g, '_')}_scripts() {
    wp_enqueue_style('${theme.name.toLowerCase().replace(/\s+/g, '-')}-style', get_stylesheet_uri());
    wp_enqueue_script('${theme.name.toLowerCase().replace(/\s+/g, '-')}-script', get_template_directory_uri() . '/js/main.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', '${theme.name.toLowerCase().replace(/\s+/g, '_')}_scripts');

${themeData.customFunctions || ''}
`;

        // index.php
        files['index.php'] = `<?php get_header(); ?>

<main id="main" class="site-main">
    <div class="container">
        <?php if (have_posts()) : ?>
            <div class="posts-grid">
                <?php while (have_posts()) : the_post(); ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('post-card'); ?>>
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="post-thumbnail">
                                <?php the_post_thumbnail('medium'); ?>
                            </div>
                        <?php endif; ?>
                        
                        <div class="post-content">
                            <h2 class="post-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h2>
                            
                            <div class="post-meta">
                                <span class="post-date"><?php echo get_the_date(); ?></span>
                                <span class="post-author">by <?php the_author(); ?></span>
                            </div>
                            
                            <div class="post-excerpt">
                                <?php the_excerpt(); ?>
                            </div>
                            
                            <a href="<?php the_permalink(); ?>" class="read-more">Read More</a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
            
            <?php the_posts_pagination(); ?>
        <?php else : ?>
            <p>No posts found.</p>
        <?php endif; ?>
    </div>
</main>

<?php get_footer(); ?>
`;

        // header.php
        files['header.php'] = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header id="masthead" class="site-header">
    <div class="container">
        <div class="site-branding">
            <?php if (has_custom_logo()) : ?>
                <?php the_custom_logo(); ?>
            <?php else : ?>
                <h1 class="site-title">
                    <a href="<?php echo esc_url(home_url('/')); ?>">
                        <?php bloginfo('name'); ?>
                    </a>
                </h1>
            <?php endif; ?>
        </div>

        <nav id="site-navigation" class="main-navigation">
            <?php
            wp_nav_menu(array(
                'theme_location' => 'primary',
                'menu_id'        => 'primary-menu',
            ));
            ?>
        </nav>
    </div>
</header>

<div id="content" class="site-content">`;

        // footer.php
        files['footer.php'] = `</div><!-- #content -->

<footer id="colophon" class="site-footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-info">
                <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</p>
                <p>Powered by <a href="https://fakelit.com" target="_blank">Fakelit.com</a></p>
            </div>
            
            <nav class="footer-navigation">
                <?php
                wp_nav_menu(array(
                    'theme_location' => 'footer',
                    'menu_id'        => 'footer-menu',
                ));
                ?>
            </nav>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>

</body>
</html>`;

        // Custom CSS file
        files['css/custom.css'] = `/* Custom styles for ${theme.name} */

.site-header {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem 0;
}

.site-branding {
    display: flex;
    align-items: center;
}

.site-title a {
    color: #333;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: bold;
}

.main-navigation ul {
    list-style: none;
    display: flex;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.main-navigation a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
}

.main-navigation a:hover {
    color: #667eea;
}

.posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.post-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s ease;
}

.post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.post-thumbnail img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.post-content {
    padding: 1.5rem;
}

.post-title a {
    color: #333;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: bold;
}

.post-meta {
    color: #666;
    font-size: 0.875rem;
    margin: 0.5rem 0;
}

.read-more {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    margin-top: 1rem;
}

.site-footer {
    background: #333;
    color: white;
    padding: 2rem 0;
    margin-top: 3rem;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-navigation ul {
    list-style: none;
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
}

.footer-navigation a {
    color: white;
    text-decoration: none;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

${themeData.customCSS || ''}
`;

        return files;
    }

    async getThemes(filters = {}) {
        try {
            const themes = [];
            const themeDirs = await fs.readdir(this.themesDirectory);
            
            for (const dir of themeDirs) {
                const themePath = path.join(this.themesDirectory, dir);
                const themeFile = path.join(themePath, 'theme.json');
                
                try {
                    const themeData = await fs.readFile(themeFile, 'utf8');
                    const theme = JSON.parse(themeData);
                    
                    // Apply filters
                    if (filters.category && theme.category !== filters.category) continue;
                    if (filters.isCustom !== undefined && theme.isCustom !== filters.isCustom) continue;
                    if (filters.clientId && theme.clientId !== filters.clientId) continue;
                    
                    themes.push(theme);
                } catch (error) {
                    console.warn(`Warning: Could not read theme ${dir}`);
                }
            }
            
            return themes;
        } catch (error) {
            console.error('❌ Failed to get themes:', error);
            return [];
        }
    }

    // WordPress Site Management
    async createWordPressSite(siteData) {
        try {
            const siteId = `site_${Date.now()}`;
            const sitePath = path.join(this.sitesDirectory, siteId);
            
            await fs.mkdir(sitePath, { recursive: true });
            
            const site = {
                id: siteId,
                name: siteData.name,
                domain: siteData.domain,
                themeId: siteData.themeId,
                clientId: siteData.clientId,
                hostingPlan: siteData.hostingPlan || 'basic',
                supportTier: siteData.supportTier || 'free',
                plugins: siteData.plugins || [],
                customizations: siteData.customizations || [],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save site configuration
            await fs.writeFile(
                path.join(sitePath, 'site.json'),
                JSON.stringify(site, null, 2)
            );

            console.log(`✅ WordPress site created: ${siteId}`);
            return site;
        } catch (error) {
            console.error('❌ Failed to create WordPress site:', error);
            throw error;
        }
    }

    async getWordPressSites(filters = {}) {
        try {
            const sites = [];
            const siteDirs = await fs.readdir(this.sitesDirectory);
            
            for (const dir of siteDirs) {
                const sitePath = path.join(this.sitesDirectory, dir);
                const siteFile = path.join(sitePath, 'site.json');
                
                try {
                    const siteData = await fs.readFile(siteFile, 'utf8');
                    const site = JSON.parse(siteData);
                    
                    // Apply filters
                    if (filters.clientId && site.clientId !== filters.clientId) continue;
                    if (filters.status && site.status !== filters.status) continue;
                    if (filters.supportTier && site.supportTier !== filters.supportTier) continue;
                    
                    sites.push(site);
                } catch (error) {
                    console.warn(`Warning: Could not read site ${dir}`);
                }
            }
            
            return sites;
        } catch (error) {
            console.error('❌ Failed to get WordPress sites:', error);
            return [];
        }
    }

    // Client Server Sales
    async createClientServer(clientData) {
        try {
            const clientId = `client_${Date.now()}`;
            const clientPath = path.join(this.clientsDirectory, clientId);
            
            await fs.mkdir(clientPath, { recursive: true });
            
            const client = {
                id: clientId,
                name: clientData.name,
                email: clientData.email,
                company: clientData.company,
                phone: clientData.phone,
                serverType: clientData.serverType || 'shared',
                serverSpecs: clientData.serverSpecs || {},
                supportTier: clientData.supportTier || 'free',
                services: clientData.services || [],
                budget: clientData.budget,
                requirements: clientData.requirements,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save client configuration
            await fs.writeFile(
                path.join(clientPath, 'client.json'),
                JSON.stringify(client, null, 2)
            );

            console.log(`✅ Client server created: ${clientId}`);
            return client;
        } catch (error) {
            console.error('❌ Failed to create client server:', error);
            throw error;
        }
    }

    async getClientServers(filters = {}) {
        try {
            const clients = [];
            const clientDirs = await fs.readdir(this.clientsDirectory);
            
            for (const dir of clientDirs) {
                const clientPath = path.join(this.clientsDirectory, dir);
                const clientFile = path.join(clientPath, 'client.json');
                
                try {
                    const clientData = await fs.readFile(clientFile, 'utf8');
                    const client = JSON.parse(clientData);
                    
                    // Apply filters
                    if (filters.serverType && client.serverType !== filters.serverType) continue;
                    if (filters.supportTier && client.supportTier !== filters.supportTier) continue;
                    if (filters.status && client.status !== filters.status) continue;
                    
                    clients.push(client);
                } catch (error) {
                    console.warn(`Warning: Could not read client ${dir}`);
                }
            }
            
            return clients;
        } catch (error) {
            console.error('❌ Failed to get client servers:', error);
            return [];
        }
    }

    // Support Tier Management
    getSupportTiers() {
        return this.supportTiers;
    }

    getSupportTier(tierName) {
        return this.supportTiers[tierName] || null;
    }

    async upgradeSupport(clientId, newTier) {
        try {
            const clientPath = path.join(this.clientsDirectory, clientId);
            const clientFile = path.join(clientPath, 'client.json');
            
            const clientData = await fs.readFile(clientFile, 'utf8');
            const client = JSON.parse(clientData);
            
            const oldTier = client.supportTier;
            client.supportTier = newTier;
            client.updatedAt = new Date().toISOString();
            
            await fs.writeFile(clientFile, JSON.stringify(client, null, 2));
            
            console.log(`✅ Support upgraded for client ${clientId}: ${oldTier} → ${newTier}`);
            return client;
        } catch (error) {
            console.error('❌ Failed to upgrade support:', error);
            throw error;
        }
    }

    // Statistics and Reporting
    async getWordPressStats() {
        try {
            const themes = await this.getThemes();
            const sites = await this.getWordPressSites();
            const clients = await this.getClientServers();
            
            const stats = {
                totalThemes: themes.length,
                customThemes: themes.filter(t => t.isCustom).length,
                totalSites: sites.length,
                totalClients: clients.length,
                supportTierDistribution: {
                    free: clients.filter(c => c.supportTier === 'free').length,
                    ai_support: clients.filter(c => c.supportTier === 'ai_support').length,
                    premium: clients.filter(c => c.supportTier === 'premium').length
                },
                serverTypeDistribution: {
                    shared: clients.filter(c => c.serverType === 'shared').length,
                    vps: clients.filter(c => c.serverType === 'vps').length,
                    dedicated: clients.filter(c => c.serverType === 'dedicated').length
                },
                poweredBy: this.brandName
            };
            
            return stats;
        } catch (error) {
            console.error('❌ Failed to get WordPress stats:', error);
            return null;
        }
    }
}

module.exports = WordPressService; 