// CareConnect Avatar Builder
class AvatarBuilder {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            apiUrl: '/api/avatar',
            rpmApiUrl: '/api/rpm',
            defaultCounselor: 'dr-sarah-mitchell',
            ...options
        };
        
        this.currentAvatar = null;
        this.currentCounselor = null;
        this.isLoading = false;
        this.widget = null;
        
        this.init();
    }

    async init() {
        this.setupUI();
        await this.loadReadyPlayerMeWidget();
        this.setupEventListeners();
        this.loadDefaultAvatar();
    }

    setupUI() {
        this.container.innerHTML = `
            <div class="avatar-builder">
                <div class="avatar-builder-header">
                    <h3>Avatar Builder</h3>
                    <div class="avatar-controls">
                        <button class="btn btn-primary" id="save-avatar">Save Avatar</button>
                        <button class="btn btn-secondary" id="reset-avatar">Reset</button>
                        <button class="btn btn-outline" id="close-builder">Close</button>
                    </div>
                </div>
                
                <div class="avatar-builder-content">
                    <div class="avatar-preview-section">
                        <div class="avatar-preview-container">
                            <div id="rpm-widget-container"></div>
                            <div class="avatar-loading" id="avatar-loading" style="display: none;">
                                <div class="spinner"></div>
                                <p>Loading avatar...</p>
                            </div>
                        </div>
                        
                        <div class="avatar-info">
                            <h4 id="avatar-name">Avatar Name</h4>
                            <p id="avatar-description">Avatar description will appear here</p>
                        </div>
                    </div>
                    
                    <div class="avatar-customization-section">
                        <div class="counselor-selector">
                            <label for="counselor-select">Select Counselor:</label>
                            <select id="counselor-select" class="form-select">
                                <option value="dr-sarah-mitchell">Dr. Sarah Mitchell - Clinical Psychologist</option>
                                <option value="michael-rodriguez">Michael Rodriguez - Substance Abuse Counselor</option>
                                <option value="dr-emily-chen">Dr. Emily Chen - Marriage & Family Therapist</option>
                                <option value="james-williams">James Williams - Career & Life Coach</option>
                                <option value="dr-maria-garcia">Dr. Maria Garcia - Crisis Intervention Specialist</option>
                                <option value="lisa-thompson">Lisa Thompson - Onboarding Specialist</option>
                            </select>
                        </div>
                        
                        <div class="customization-tabs">
                            <div class="tab-buttons">
                                <button class="tab-btn active" data-tab="style">Style</button>
                                <button class="tab-btn" data-tab="outfit">Outfit</button>
                                <button class="tab-btn" data-tab="accessories">Accessories</button>
                                <button class="tab-btn" data-tab="expressions">Expressions</button>
                            </div>
                            
                            <div class="tab-content">
                                <div class="tab-pane active" id="style-tab">
                                    <div class="customization-options">
                                        <div class="option-group">
                                            <label>Hair Style:</label>
                                            <div class="option-buttons" id="hair-options">
                                                <button class="option-btn" data-hair="long">Long</button>
                                                <button class="option-btn" data-hair="medium">Medium</button>
                                                <button class="option-btn" data-hair="short">Short</button>
                                            </div>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Hair Color:</label>
                                            <div class="color-picker" id="hair-color-picker">
                                                <div class="color-option" data-color="#8B4513" style="background-color: #8B4513;"></div>
                                                <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                                                <div class="color-option" data-color="#DAA520" style="background-color: #DAA520;"></div>
                                                <div class="color-option" data-color="#CD853F" style="background-color: #CD853F;"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Skin Tone:</label>
                                            <div class="color-picker" id="skin-tone-picker">
                                                <div class="color-option" data-color="#FFDBB4" style="background-color: #FFDBB4;"></div>
                                                <div class="color-option" data-color="#EDB98A" style="background-color: #EDB98A;"></div>
                                                <div class="color-option" data-color="#D08B5B" style="background-color: #D08B5B;"></div>
                                                <div class="color-option" data-color="#AE5D29" style="background-color: #AE5D29;"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane" id="outfit-tab">
                                    <div class="customization-options">
                                        <div class="option-group">
                                            <label>Outfit Style:</label>
                                            <div class="option-buttons" id="outfit-options">
                                                <button class="option-btn" data-outfit="business">Business</button>
                                                <button class="option-btn" data-outfit="casual">Casual</button>
                                                <button class="option-btn" data-outfit="professional">Professional</button>
                                                <button class="option-btn" data-outfit="medical">Medical</button>
                                            </div>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Outfit Color:</label>
                                            <div class="color-picker" id="outfit-color-picker">
                                                <div class="color-option" data-color="#4169E1" style="background-color: #4169E1;"></div>
                                                <div class="color-option" data-color="#228B22" style="background-color: #228B22;"></div>
                                                <div class="color-option" data-color="#DC143C" style="background-color: #DC143C;"></div>
                                                <div class="color-option" data-color="#FFD700" style="background-color: #FFD700;"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane" id="accessories-tab">
                                    <div class="customization-options">
                                        <div class="option-group">
                                            <label>Glasses:</label>
                                            <div class="option-buttons" id="glasses-options">
                                                <button class="option-btn" data-glasses="none">None</button>
                                                <button class="option-btn" data-glasses="round">Round</button>
                                                <button class="option-btn" data-glasses="rectangular">Rectangular</button>
                                                <button class="option-btn" data-glasses="cat-eye">Cat Eye</button>
                                            </div>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Jewelry:</label>
                                            <div class="option-buttons" id="jewelry-options">
                                                <button class="option-btn" data-jewelry="none">None</button>
                                                <button class="option-btn" data-jewelry="necklace">Necklace</button>
                                                <button class="option-btn" data-jewelry="earrings">Earrings</button>
                                                <button class="option-btn" data-jewelry="watch">Watch</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tab-pane" id="expressions-tab">
                                    <div class="customization-options">
                                        <div class="option-group">
                                            <label>Default Expression:</label>
                                            <div class="option-buttons" id="expression-options">
                                                <button class="option-btn" data-expression="neutral">Neutral</button>
                                                <button class="option-btn" data-expression="friendly">Friendly</button>
                                                <button class="option-btn" data-expression="professional">Professional</button>
                                                <button class="option-btn" data-expression="caring">Caring</button>
                                            </div>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Eye Color:</label>
                                            <div class="color-picker" id="eye-color-picker">
                                                <div class="color-option" data-color="#8B4513" style="background-color: #8B4513;"></div>
                                                <div class="color-option" data-color="#000080" style="background-color: #000080;"></div>
                                                <div class="color-option" data-color="#228B22" style="background-color: #228B22;"></div>
                                                <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="avatar-builder-footer">
                    <div class="avatar-preview-thumbnails" id="avatar-thumbnails">
                        <!-- Thumbnails will be generated here -->
                    </div>
                </div>
            </div>
        `;
    }

    async loadReadyPlayerMeWidget() {
        try {
            // Load RPM widget script
            if (!window.RPMWidget) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@readyplayerme/rpm-widget-sdk@latest/dist/index.js';
                script.onload = () => this.initializeWidget();
                document.head.appendChild(script);
            } else {
                this.initializeWidget();
            }
        } catch (error) {
            console.error('Error loading RPM widget:', error);
            this.showError('Failed to load avatar builder');
        }
    }

    initializeWidget() {
        try {
            const container = document.getElementById('rpm-widget-container');
            
            this.widget = new window.RPMWidget({
                container: container,
                subdomain: 'careconnect',
                frameApi: 'https://iframe.readyplayer.me',
                events: {
                    onAvatarExported: (data) => this.handleAvatarExported(data),
                    onUserAuthorized: (data) => this.handleUserAuthorized(data),
                    onFrameLoad: () => this.handleFrameLoad(),
                    onUserSet: (data) => this.handleUserSet(data)
                }
            });

            this.widget.init();
        } catch (error) {
            console.error('Error initializing widget:', error);
            this.showError('Failed to initialize avatar builder');
        }
    }

    setupEventListeners() {
        // Counselor selector
        document.getElementById('counselor-select').addEventListener('change', (e) => {
            this.loadCounselorAvatar(e.target.value);
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Option buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyOption(e.target);
            });
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.applyColor(e.target.dataset.color, e.target.closest('.color-picker').id);
            });
        });

        // Action buttons
        document.getElementById('save-avatar').addEventListener('click', () => {
            this.saveAvatar();
        });

        document.getElementById('reset-avatar').addEventListener('click', () => {
            this.resetAvatar();
        });

        document.getElementById('close-builder').addEventListener('click', () => {
            this.closeBuilder();
        });
    }

    async loadDefaultAvatar() {
        await this.loadCounselorAvatar(this.options.defaultCounselor);
    }

    async loadCounselorAvatar(counselorId) {
        try {
            this.showLoading(true);
            this.currentCounselor = counselorId;

            // Get counselor avatar from backend
            const response = await fetch(`${this.options.apiUrl}/counselor/${counselorId}`);
            const avatarData = await response.json();

            if (avatarData.success) {
                this.currentAvatar = avatarData.avatar;
                this.updateAvatarInfo();
                this.updateCustomizationOptions();
                this.generateThumbnails();
            } else {
                throw new Error(avatarData.error || 'Failed to load avatar');
            }

        } catch (error) {
            console.error('Error loading counselor avatar:', error);
            this.showError('Failed to load avatar');
        } finally {
            this.showLoading(false);
        }
    }

    updateAvatarInfo() {
        if (!this.currentAvatar) return;

        document.getElementById('avatar-name').textContent = this.currentAvatar.name || 'Avatar';
        document.getElementById('avatar-description').textContent = 
            this.currentAvatar.description || 'Professional counselor avatar';
    }

    updateCustomizationOptions() {
        if (!this.currentAvatar || !this.currentAvatar.config) return;

        const config = this.currentAvatar.config;

        // Update hair options
        if (config.hair) {
            document.querySelectorAll('#hair-options .option-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.hair === config.hair);
            });
        }

        // Update outfit options
        if (config.outfit) {
            document.querySelectorAll('#outfit-options .option-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.outfit === config.outfit);
            });
        }

        // Update color pickers
        if (config.hairColor) {
            this.updateColorPicker('hair-color-picker', config.hairColor);
        }

        if (config.skinTone) {
            this.updateColorPicker('skin-tone-picker', config.skinTone);
        }
    }

    updateColorPicker(pickerId, selectedColor) {
        const picker = document.getElementById(pickerId);
        picker.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.color === selectedColor);
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });
    }

    applyOption(button) {
        const optionType = button.dataset.hair || button.dataset.outfit || 
                          button.dataset.glasses || button.dataset.jewelry || 
                          button.dataset.expression;

        const optionCategory = Object.keys(button.dataset).find(key => 
            ['hair', 'outfit', 'glasses', 'jewelry', 'expression'].includes(key)
        );

        // Update button states
        button.closest('.option-buttons').querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Apply to avatar
        this.applyAvatarCustomization(optionCategory, optionType);
    }

    applyColor(color, pickerId) {
        // Update color picker
        document.getElementById(pickerId).querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.color === color);
        });

        // Apply to avatar
        const colorType = pickerId.replace('-picker', '');
        this.applyAvatarCustomization(colorType, color);
    }

    async applyAvatarCustomization(type, value) {
        if (!this.currentAvatar || !this.widget) return;

        try {
            // Update local avatar config
            if (!this.currentAvatar.config) this.currentAvatar.config = {};
            this.currentAvatar.config[type] = value;

            // Apply to RPM widget
            await this.widget.setAvatarConfig({
                [type]: value
            });

            // Update avatar info
            this.updateAvatarInfo();

        } catch (error) {
            console.error('Error applying customization:', error);
            this.showError('Failed to apply customization');
        }
    }

    async generateThumbnails() {
        if (!this.currentAvatar) return;

        const thumbnailsContainer = document.getElementById('avatar-thumbnails');
        thumbnailsContainer.innerHTML = '';

        const expressions = ['neutral', 'friendly', 'professional', 'caring'];
        
        for (const expression of expressions) {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'avatar-thumbnail';
            thumbnail.innerHTML = `
                <img src="${this.currentAvatar.thumbnail}" alt="${expression} expression" />
                <span>${expression}</span>
            `;
            
            thumbnail.addEventListener('click', () => {
                this.previewExpression(expression);
            });
            
            thumbnailsContainer.appendChild(thumbnail);
        }
    }

    async previewExpression(expression) {
        try {
            const response = await fetch(`${this.options.apiUrl}/expression/${this.currentCounselor}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expression })
            });

            const data = await response.json();
            if (data.success) {
                // Update avatar preview with new expression
                this.updateAvatarPreview(data.avatar.image);
            }
        } catch (error) {
            console.error('Error previewing expression:', error);
        }
    }

    updateAvatarPreview(imageUrl) {
        // Update the avatar preview image
        const previewContainer = document.getElementById('rpm-widget-container');
        // This would update the RPM widget with the new expression
    }

    async saveAvatar() {
        if (!this.currentAvatar) return;

        try {
            this.showLoading(true);

            const response = await fetch(`${this.options.apiUrl}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    counselor_id: this.currentCounselor,
                    avatar_data: this.currentAvatar
                })
            });

            const data = await response.json();
            if (data.success) {
                this.showSuccess('Avatar saved successfully');
                this.currentAvatar = data.avatar;
            } else {
                throw new Error(data.error || 'Failed to save avatar');
            }

        } catch (error) {
            console.error('Error saving avatar:', error);
            this.showError('Failed to save avatar');
        } finally {
            this.showLoading(false);
        }
    }

    async resetAvatar() {
        if (!this.currentCounselor) return;

        try {
            this.showLoading(true);
            await this.loadCounselorAvatar(this.currentCounselor);
            this.showSuccess('Avatar reset to default');
        } catch (error) {
            console.error('Error resetting avatar:', error);
            this.showError('Failed to reset avatar');
        } finally {
            this.showLoading(false);
        }
    }

    closeBuilder() {
        // Emit close event
        const event = new CustomEvent('avatarBuilderClose', {
            detail: { avatar: this.currentAvatar }
        });
        this.container.dispatchEvent(event);
    }

    // RPM Widget Event Handlers
    handleAvatarExported(data) {
        console.log('Avatar exported:', data);
        this.currentAvatar = {
            ...this.currentAvatar,
            rpm_avatar_id: data.avatarId,
            avatar_url: data.avatarUrl
        };
        this.showSuccess('Avatar created successfully');
    }

    handleUserAuthorized(data) {
        console.log('User authorized:', data);
    }

    handleFrameLoad() {
        console.log('RPM frame loaded');
        this.showLoading(false);
    }

    handleUserSet(data) {
        console.log('User set:', data);
    }

    // Utility methods
    showLoading(show) {
        const loading = document.getElementById('avatar-loading');
        loading.style.display = show ? 'flex' : 'none';
        this.isLoading = show;
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Public methods
    getCurrentAvatar() {
        return this.currentAvatar;
    }

    setAvatar(avatarData) {
        this.currentAvatar = avatarData;
        this.updateAvatarInfo();
        this.updateCustomizationOptions();
    }

    destroy() {
        if (this.widget) {
            this.widget.destroy();
        }
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.AvatarBuilder = AvatarBuilder; 