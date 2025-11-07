<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
    {
        icon: 'share-nodes',
        title: 'Multi-Platform Publishing',
        description: 'Publish your videos simultaneously on TikTok, Instagram, YouTube, Facebook, and X.'
    },
    {
        icon: 'calendar-clock',
        title: 'Smart Scheduling',
        description: 'Plan your content strategy in advance and let your posts publish automatically at the perfect time.'
    },
    {
        icon: 'chart-line',
        title: 'Performance Tracking',
        description: 'Track your video performance across all platforms in one clear dashboard.'
    },
    {
        icon: 'layer-group',
        title: 'Batch Uploads',
        description: 'Save time with batch uploads and manage multiple videos at once.'
    },
    {
        icon: 'folder-open',
        title: 'Content Library',
        description: 'Organize and search your entire video library in one central location.'
    },
    {
        icon: 'wand-magic-sparkles',
        title: 'Workflow Automation',
        description: 'Automate recurring tasks and focus on creative content.'
    }
]

const platforms = [
    { name: 'TikTok', icon: 'tiktok', color: '#000000' },
    { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
    { name: 'YouTube', icon: 'youtube', color: '#FF0000' },
    { name: 'X', icon: 'x-twitter', color: '#000000' },
    { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { name: 'Reddit', icon: 'reddit', color: '#FF4500' }
]


const otherProducts = [
    {
        name: 'Control Center',
        description: 'Central administration platform for all your digital solutions',
        url: 'https://control-center.eu'
    },
    {
        name: 'Control Cloud',
        description: 'Cloud-based infrastructure for maximum scalability',
        url: 'https://cloud.control-center.eu'
    },
    {
        name: 'Control Analytics',
        description: 'Comprehensive analytics and reporting tools',
        url: 'https://analytics.control-center.eu'
    },
    {
        name: 'Control Security',
        description: 'Enterprise-grade security solutions',
        url: 'https://security.control-center.eu'
    }
]

const stats = [
    { value: '6+', label: 'Platforms' },
    { value: '∞', label: 'Videos' },
    { value: '100%', label: 'Control' }
]

const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="landing-page">
        <header class="header">
            <div class="container">
                <nav class="nav">
                 <div class="nav-brand">
                     <div class="logo-icon">CS</div>
                    <span class="brand-name">Control Studio</span>
                    </div>
                    <div class="nav-menu">
                    <button @click="scrollToSection('product')" class="nav-link">Product</button>
                         <button @click="scrollToSection('features')" class="nav-link">Features</button>
                         <button @click="router.push('/login')" class="nav-link">Login</button>
                         <button @click="router.push('/signup')" class="btn btn-demo">Start for free</button>
                     </div>
                </nav>
            </div>
        </header>
        <section id="product" class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">
                        Your Content.<br />
                        All Platforms.<br />
                        <span class="gradient-text">One Dashboard.</span>
                    </h1>
                    <p class="hero-description">
                        Manage, schedule, and publish your social media videos across all major
                        platforms – all from a single dashboard.
                    </p>
                    <div class="hero-actions">
                        <button @click="router.push('/signup')" class="btn btn-primary">
                            Start for free
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button @click="scrollToFeatures" class="btn btn-secondary">
                            Learn More
                        </button>
                    </div>
                    <div class="stats">
                        <div v-for="stat in stats" :key="stat.label" class="stat-item">
                            <div class="stat-value">{{ stat.value }}</div>
                            <div class="stat-label">{{ stat.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="platforms-intro">
                        <h3 class="platforms-title">Supported Platforms</h3>
                        <p class="platforms-description">Publish to all major social media platforms</p>
                    </div>
                    <div class="platform-scrolling-wrapper">
                    <div class="logo-list">
                        <div v-for="platform in platforms" :key="platform.name" class="platform-logo">
                            <i :class="`fab fa-${platform.icon}`" class="platform-icon"></i>
                        </div>
                        <div v-for="platform in platforms" :key="platform.name" class="platform-logo">
                            <i :class="`fab fa-${platform.icon}`" class="platform-icon"></i>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="features" class="features">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Everything You Need</h2>
                    <p class="section-description">
                        Professional social media management that adapts to your needs
                    </p>
                </div>
                <div class="features-grid">
                    <div v-for="feature in features" :key="feature.title" class="feature-card">
                        <div class="feature-icon">
                            <i :class="`fas fa-${feature.icon}`"></i>
                        </div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>
       
        <section id="cta" class="cta">
            <div class="container">
                <div class="cta-content">
                    <h2 class="cta-title">Ready to Get Started?</h2>
                    <p class="cta-description">
                        Start today and take your social media presence to the next level.
                    </p>
                    <div class="cta-actions">
                        <button @click="router.push('/signup')" class="btn btn-primary btn-large">
                            Try Free Now
                        </button>
                        <p class="cta-note">No credit card required</p>
                    </div>
                </div>
            </div>
        </section>
        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-main">
                        <h3 class="footer-brand">Control Studio</h3>
                        <p class="footer-tagline">Professionelles Social Media Management</p>
                        <div class="trust-badges">
                            <div class="trust-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>SSL Secured</span>
                            </div>
                            <div class="trust-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>GDPR Compliant</span>
                            </div>
                            <div class="trust-badge highlight">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>Made & Hosted in Austria</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Product</h4>
                        <ul class="footer-links">
                            <li><button @click="scrollToSection('features')" class="footer-link">Features</button></li>
                            <li><button @click="router.push('/login')" class="footer-link">Login</button></li>
                            <li><button @click="router.push('/signup')" class="footer-link">Sign Up</button></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Other Products</h4>
                        <ul class="footer-links">
                            <li v-for="product in otherProducts" :key="product.name">
                                <a :href="product.url" target="_blank" class="footer-link">{{ product.name }}</a>
                            </li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Contact</h4>
                        <ul class="footer-contact">
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path
                                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <a href="mailto:info@control-studio.eu" class="footer-link">info@control-studio.eu</a>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path
                                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <a href="tel:+4312345678" class="footer-link">+43 1 234 56 78</a>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path
                                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <a href="https://wa.me/436641234567" class="footer-link">+43 664 123 45 67
                                    (WhatsApp)</a>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span class="footer-text">123 Main Street<br />10010 Vienna, Austria</span>
                            </li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4 class="footer-heading">Legal</h4>
                        <ul class="footer-links">
                            <li><a href="#" class="footer-link">Imprint</a></li>
                            <li><a href="#" class="footer-link">Privacy Policy</a></li>
                            <li><a href="#" class="footer-link">Terms of Service</a></li>
                            <li><a href="#" class="footer-link">Cookie Settings</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; {{ new Date().getFullYear() }} Control Studio. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.landing-page {
    width: 100%;
    min-height: 100vh;
    background: #f5f5f5;
    overflow-x: hidden;
}

.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
}

.header {
    position: sticky;
    top: 0;
    background: rgba(248, 250, 252, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 0.75rem 0;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.brand-name {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-link {
    background: none;
    border: none;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0.5rem 0;
}

.nav-link:hover {
    color: #0f172a;
}

.theme-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: absolute;
    top: 0.75rem;
    left: 2rem;
    z-index: 1001;
}

.theme-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
}

.btn-demo {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-demo:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.hero {
    padding: 6rem 0 4rem;
    position: relative;
}

.hero-content {
    text-align: center;
    margin-bottom: 4rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6366f1;
    margin-bottom: 2rem;
}

.badge-dot {
    width: 8px;
    height: 8px;
    background: #6366f1;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.hero-title {
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 800;
    line-height: 1.1;
    color: #0f172a;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
    text-align: center;
}

.gradient-text {
  background-image: linear-gradient(45deg, #ede9fe, #8b5cf6); /* Set your colors and gradient angle */
  background-clip: text;
  -webkit-background-clip: text; /* Chrome/Safari support */
  color: transparent;
  -webkit-text-fill-color: transparent; /* Chrome/Safari support */
}

.red-text {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-description {
    font-size: 1.25rem;
    line-height: 1.75;
    color: #475569;
    max-width: 640px;
    margin: 0 auto 2.5rem;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 4rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
}

.btn-primary {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.btn-secondary {
    background: white;
    color: #475569;
    border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
}

.btn-large {
    padding: 1.125rem 2.5rem;
    font-size: 1.125rem;
}

.btn-orange {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    padding: 1rem 2rem;
    font-size: 1rem;
}

.btn-orange:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.btn-arrow {
    margin-left: 0.5rem;
    font-size: 1.25rem;
}

.stats {
    display: flex;
    gap: 4rem;
    justify-content: center;
    flex-wrap: wrap;
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
}

/* Platform Cards */
.hero-visual {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
}

.platforms-intro {
    text-align: center;
    margin-bottom: 2rem;
}

.platforms-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.5rem;
}

.platforms-description {
    font-size: 1rem;
    color: #64748b;
}

.platform-scrolling-wrapper {
    display: flex;
    overflow: hidden;
    width: 100%;
    position: relative;
}

.platform-logo {
    width: 120px;
    color: #7c3aed;
    height: 80px;
    object-fit: contain;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 1rem;
    transition: all 0.3s;


}

.platform-icon {
    font-size: 2.5rem;
}

.logo-list {
  display: flex;
  gap: 24px;
  animation: scroll 20s linear infinite;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.platform-icon:hover {
    transform: scale(1.1) ease-in-out 0.3s;
}

.platform-name {
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.platform-status {
    font-size: 0.75rem;
    color: #10b981;
    font-weight: 500;
}

/* Features Section */
.features {
    padding: 6rem 0;
    background: white;
}

.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 1rem;
}

.section-description {
    font-size: 1.125rem;
    color: #64748b;
    max-width: 640px;
    margin: 0 auto;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
}

.feature-card {
    padding: 2rem;
    border-radius: 1rem;
    background: #f8fafc;
    transition: all 0.3s;
}

.feature-card:hover {
    background: white;
    box-shadow: 0 4px 16px rgba(220, 38, 38, 0.1);
    transform: translateY(-2px);
}

.feature-icon {
    font-size: 2rem;
    color: white;
    margin-bottom: 1.25rem;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feature-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.75rem;
}

.feature-description {
    font-size: 1rem;
    line-height: 1.6;
    color: #64748b;
}




/* CTA Section */
.cta {
    padding: 6rem 0;
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%);
    position: relative;
    overflow: hidden;
}

.cta::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
}

.cta-content {
    text-align: center;
    position: relative;
    z-index: 1;
}

.cta-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
}

.cta-description {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2.5rem;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
}

.cta-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.cta-note {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
}

/* Footer */
.footer {
    background: #f8fafc;
    color: #0f172a;
    padding: 4rem 0 2rem;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.footer-main {
    grid-column: span 2;
}

.footer-brand {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #0f172a;
}

.footer-tagline {
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
}

.trust-badges {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.trust-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
    padding: 0.5rem;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.05);
}

.trust-badge svg {
    flex-shrink: 0;
}

.trust-badge.highlight {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
    color: #c4b5fd;
    font-weight: 600;
    border: 1px solid rgba(124, 58, 237, 0.3);
}

.trust-badge.highlight svg {
    color: #c4b5fd;
}

.footer-social {
    display: flex;
    gap: 0.75rem;
}

.social-link {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    text-decoration: none;
    transition: all 0.2s;
}

.social-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.footer-section {
    min-width: 0;
}

.footer-heading {
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.footer-links {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.footer-link {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 0.875rem;
    transition: color 0.2s;
    text-decoration: none;
    text-align: left;
    padding: 0;
}

.footer-link:hover {
    color: #0f172a;
}

.footer-contact {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.footer-contact li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.footer-contact svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: #6366f1;
}


.footer-text {
    color: #64748b;
    font-size: 0.875rem;
}

.footer-bottom {
    padding-top: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #64748b;
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
    .nav-menu {
        gap: 1rem;
    }

    .nav-link {
        font-size: 0.8rem;
    }
}

@media (max-width: 768px) {
    .header {
        padding: 0.5rem 0;
    }

    .nav {
        flex-direction: column;
        gap: 1rem;
    }

    .nav-menu {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.75rem;
    }

    .hero {
        padding: 4rem 0 2rem;
    }

    .hero-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .stats {
        gap: 2rem;
    }

    .platform-cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .features-grid,

    .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .footer-main {
        grid-column: span 1;
    }

    .footer-bottom {
        text-align: center;
    }

    .trust-badges {
        margin-top: 1rem;
    }
}

:global(.dark) {
    .landing-page {
        background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
    }

    .theme-toggle {
        background: rgba(0, 0, 0, 0.1);
    }

    .theme-toggle:hover {
        background: rgba(0, 0, 0, 0.15);
    }

    .hero-title {
        color: white;
    }

    .hero-description {
        color: #cbd5e1;
    }

    .btn-secondary {
        background: #1e293b;
        color: #e2e8f0;
        border-color: #334155;
    }

    .btn-secondary:hover {
        background: #334155;
        border-color: #475569;
    }

    .stat-label {
        color: #94a3b8;
    }

    .platform-card {
        background: #1e293b;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .platform-card:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    }

    .platform-name {
        color: #e2e8f0;
    }

    .features {
        background: #0f172a;
    }

    .section-title {
        color: white;
    }

    .section-description {
        color: #94a3b8;
    }

    .feature-card {
        background: #1e293b;
    }

    .feature-card:hover {
        background: #334155;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .feature-title {
        color: #e2e8f0;
    }

    .feature-description {
        color: #94a3b8;
    }
}
</style>
