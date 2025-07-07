// CareConnect 3D Avatar System
class Avatar3DSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatar = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.audioContext = null;
        this.audioAnalyser = null;
        this.lipSyncData = null;
        this.isSpeaking = false;
        this.currentCounselor = null;
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupAudio();
        this.loadAvatar();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f8ff);
        this.scene.fog = new THREE.Fog(0xf0f8ff, 10, 100);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 3);
        this.camera.lookAt(0, 1.6, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light for face illumination
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 2, 2);
        this.scene.add(pointLight);
    }

    setupAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 256;
    }

    async loadAvatar(counselorId = 'dr-sarah-mitchell') {
        this.currentCounselor = counselorId;
        
        // Ready Player Me avatar URL (replace with actual RPM integration)
        const avatarUrl = this.getCounselorAvatarUrl(counselorId);
        
        try {
            const loader = new THREE.GLTFLoader();
            const gltf = await loader.loadAsync(avatarUrl);
            
            this.avatar = gltf.scene;
            this.avatar.scale.set(1, 1, 1);
            this.avatar.position.set(0, 0, 0);
            this.avatar.castShadow = true;
            this.avatar.receiveShadow = true;
            
            this.scene.add(this.avatar);
            
            // Setup animations
            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.avatar);
                this.setupAnimations(gltf.animations);
            }
            
            // Setup lip sync
            this.setupLipSync();
            
        } catch (error) {
            console.error('Error loading avatar:', error);
            this.loadFallbackAvatar();
        }
    }

    getCounselorAvatarUrl(counselorId) {
        const avatarUrls = {
            'dr-sarah-mitchell': 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8b8b.glb',
            'michael-rodriguez': 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8b9.glb',
            'dr-emily-chen': 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8ba.glb',
            'james-williams': 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8bb.glb',
            'dr-maria-garcia': 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8bc.glb',
            'lisa-thompson': 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8bd.glb'
        };
        
        return avatarUrls[counselorId] || avatarUrls['dr-sarah-mitchell'];
    }

    loadFallbackAvatar() {
        // Create a simple placeholder avatar
        const geometry = new THREE.BoxGeometry(1, 2, 0.5);
        const material = new THREE.MeshLambertMaterial({ color: 0x667eea });
        this.avatar = new THREE.Mesh(geometry, material);
        this.avatar.position.set(0, 1, 0);
        this.scene.add(this.avatar);
    }

    setupAnimations(animations) {
        this.animations = {};
        
        animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.animations[clip.name] = action;
        });
        
        // Play idle animation by default
        if (this.animations['idle']) {
            this.animations['idle'].play();
        }
    }

    setupLipSync() {
        // Find the head/mouth mesh for lip sync
        this.avatar.traverse((child) => {
            if (child.isMesh && child.name.toLowerCase().includes('head')) {
                this.headMesh = child;
            }
        });
    }

    async playVoiceAudio(audioUrl) {
        try {
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            const source = this.audioContext.createSource();
            source.buffer = audioBuffer;
            source.connect(this.audioAnalyser);
            source.connect(this.audioContext.destination);
            
            this.isSpeaking = true;
            source.start(0);
            
            source.onended = () => {
                this.isSpeaking = false;
            };
            
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    updateLipSync() {
        if (!this.isSpeaking || !this.headMesh) return;
        
        const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        this.audioAnalyser.getByteFrequencyData(dataArray);
        
        // Calculate average frequency for lip sync
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const lipSyncIntensity = average / 255;
        
        // Apply lip sync to head mesh
        if (this.headMesh.material) {
            this.headMesh.material.opacity = 0.8 + (lipSyncIntensity * 0.2);
        }
    }

    playAnimation(animationName) {
        if (this.animations[animationName]) {
            // Stop all current animations
            Object.values(this.animations).forEach(action => action.stop());
            
            // Play the requested animation
            this.animations[animationName].play();
        }
    }

    updateAvatarMood(mood) {
        // Update avatar expression based on mood
        const moodExpressions = {
            'happy': { mouth: 0.8, eyes: 0.6 },
            'concerned': { mouth: 0.3, eyes: 0.4 },
            'listening': { mouth: 0.5, eyes: 0.8 },
            'thoughtful': { mouth: 0.2, eyes: 0.3 }
        };
        
        const expression = moodExpressions[mood] || moodExpressions['listening'];
        
        // Apply expression to avatar (this would need morph targets in the actual model)
        if (this.avatar) {
            this.avatar.traverse((child) => {
                if (child.isMesh && child.morphTargetDictionary) {
                    // Apply morph targets for expressions
                    if (child.morphTargetDictionary.mouth) {
                        child.morphTargetInfluences[child.morphTargetDictionary.mouth] = expression.mouth;
                    }
                    if (child.morphTargetDictionary.eyes) {
                        child.morphTargetInfluences[child.morphTargetDictionary.eyes] = expression.eyes;
                    }
                }
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        this.updateLipSync();
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Voice Interaction System
class VoiceInteractionSystem {
    constructor(avatarSystem) {
        this.avatarSystem = avatarSystem;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.whisperApi = null;
        this.elevenLabsApi = null;
        
        this.init();
    }

    async init() {
        this.setupVoiceAPIs();
        this.setupRecording();
    }

    setupVoiceAPIs() {
        // Initialize Whisper for speech-to-text
        this.whisperApi = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Initialize ElevenLabs for text-to-speech
        this.elevenLabsApi = new ElevenLabs({
            apiKey: process.env.ELEVENLABS_API_KEY
        });
    }

    async setupRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                await this.processAudio();
            };
            
        } catch (error) {
            console.error('Error setting up recording:', error);
        }
    }

    startRecording() {
        if (this.mediaRecorder && !this.isRecording) {
            this.audioChunks = [];
            this.mediaRecorder.start();
            this.isRecording = true;
            this.avatarSystem.playAnimation('listening');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    async processAudio() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        try {
            // Convert speech to text using Whisper
            const transcription = await this.speechToText(audioBlob);
            
            if (transcription) {
                // Send to chat system
                this.sendToChat(transcription);
            }
            
        } catch (error) {
            console.error('Error processing audio:', error);
        }
    }

    async speechToText(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', 'whisper-1');
            
            const response = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result.text;
            
        } catch (error) {
            console.error('Error in speech-to-text:', error);
            return null;
        }
    }

    async textToSpeech(text, voiceId = 'default') {
        try {
            const response = await fetch('/api/voice/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    voice_id: voiceId
                })
            });
            
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Play audio and sync with avatar
            await this.avatarSystem.playVoiceAudio(audioUrl);
            
        } catch (error) {
            console.error('Error in text-to-speech:', error);
        }
    }

    sendToChat(message) {
        // Send message to chat system
        if (window.chatSystem) {
            window.chatSystem.sendMessage(message);
        }
    }
}

// Export for use in other modules
window.Avatar3DSystem = Avatar3DSystem;
window.VoiceInteractionSystem = VoiceInteractionSystem; 