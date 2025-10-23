<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
    {
        icon: '🎬',
        title: 'Multi-Platform Publishing',
        description: 'Veröffentliche deine Videos gleichzeitig auf TikTok, Instagram, YouTube, Facebook und X.'
    },
    {
        icon: '📅',
        title: 'Smart Scheduling',
        description: 'Plane deine Content-Strategie im Voraus und lasse deine Posts automatisch zum perfekten Zeitpunkt veröffentlichen.'
    },
    {
        icon: '📊',
        title: 'Performance Tracking',
        description: 'Verfolge die Performance deiner Videos über alle Plattformen hinweg in einem übersichtlichen Dashboard.'
    },
    {
        icon: '⚡',
        title: 'Batch Uploads',
        description: 'Spare Zeit mit Batch-Uploads und verwalte mehrere Videos gleichzeitig.'
    },
    {
        icon: '🎯',
        title: 'Content Library',
        description: 'Organisiere und durchsuche deine gesamte Video-Bibliothek an einem zentralen Ort.'
    },
    {
        icon: '🔄',
        title: 'Workflow Automation',
        description: 'Automatisiere wiederkehrende Aufgaben und fokussiere dich auf kreative Inhalte.'
    }
]

const stats = [
    { value: '5+', label: 'Plattformen' },
    { value: '∞', label: 'Videos' },
    { value: '100%', label: 'Kontrolle' }
]

const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="landing-page">
        <!-- Hero Section -->
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <div class="badge">
                        <span class="badge-dot"></span>
                        Control Studio
                    </div>

                    <h1 class="hero-title">
                        Dein Content.<br />
                        Alle Plattformen.<br />
                        <span class="gradient-text">Eine Zentrale.</span>
                    </h1>

                    <p class="hero-description">
                        Verwalte, plane und veröffentliche deine Social Media Videos über alle wichtigen
                        Plattformen hinweg – alles aus einem einzigen Dashboard.
                    </p>

                    <div class="hero-actions">
                        <button @click="router.push('/signup')" class="btn btn-primary">
                            Kostenlos starten
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button @click="scrollToFeatures" class="btn btn-secondary">
                            Mehr erfahren
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
                    <div class="platform-cards">
                        <div class="platform-card card-tiktok">
                            <div class="platform-icon">📱</div>
                            <div class="platform-name">TikTok</div>
                            <div class="platform-status">● Verbunden</div>
                        </div>
                        <div class="platform-card card-instagram">
                            <div class="platform-icon">📷</div>
                            <div class="platform-name">Instagram</div>
                            <div class="platform-status">● Verbunden</div>
                        </div>
                        <div class="platform-card card-youtube">
                            <div class="platform-icon">▶️</div>
                            <div class="platform-name">YouTube</div>
                            <div class="platform-status">● Verbunden</div>
                        </div>
                        <div class="platform-card card-x">
                            <div class="platform-icon">𝕏</div>
                            <div class="platform-name">X</div>
                            <div class="platform-status">● Verbunden</div>
                        </div>
                        <div class="platform-card card-facebook">
                            <div class="platform-icon">👥</div>
                            <div class="platform-name">Facebook</div>
                            <div class="platform-status">● Verbunden</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="features">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Alles, was du brauchst</h2>
                    <p class="section-description">
                        Professionelles Social Media Management, das sich an deine Bedürfnisse anpasst
                    </p>
                </div>

                <div class="features-grid">
                    <div v-for="feature in features" :key="feature.title" class="feature-card">
                        <div class="feature-icon">{{ feature.icon }}</div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta">
            <div class="container">
                <div class="cta-content">
                    <h2 class="cta-title">Bereit, durchzustarten?</h2>
                    <p class="cta-description">
                        Starte noch heute und bring deine Social Media Präsenz auf das nächste Level.
                    </p>
                    <div class="cta-actions">
                        <button @click="router.push('/signup')" class="btn btn-primary btn-large">
                            Jetzt kostenlos testen
                        </button>
                        <p class="cta-note">Keine Kreditkarte erforderlich</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <h3 class="footer-title">Control Studio</h3>
                        <p class="footer-tagline">Your content, your control</p>
                    </div>
                    <div class="footer-links">
                        <button @click="router.push('/login')" class="footer-link">Login</button>
                        <span class="footer-separator">•</span>
                        <button @click="router.push('/signup')" class="footer-link">Sign Up</button>
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
    background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
    overflow-x: hidden;
}

.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
}

/* Hero Section */
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
}

.gradient-text {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
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
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
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
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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

.platform-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    padding: 2rem 0;
}

.platform-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
    border: 2px solid transparent;
    animation: float 6s ease-in-out infinite;
}

.platform-card:nth-child(1) {
    animation-delay: 0s;
}

.platform-card:nth-child(2) {
    animation-delay: 0.5s;
}

.platform-card:nth-child(3) {
    animation-delay: 1s;
}

.platform-card:nth-child(4) {
    animation-delay: 1.5s;
}

.platform-card:nth-child(5) {
    animation-delay: 2s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

.platform-card:hover {
    transform: translateY(-5px) !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-tiktok:hover {
    border-color: #000000;
}

.card-instagram:hover {
    border-color: #E4405F;
}

.card-youtube:hover {
    border-color: #FF0000;
}

.card-x:hover {
    border-color: #000000;
}

.card-facebook:hover {
    border-color: #1877F2;
}

.platform-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
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
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1.25rem;
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
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
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
    background: #0f172a;
    color: white;
    padding: 3rem 0 2rem;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
    gap: 2rem;
}

.footer-brand {
    flex: 1;
}

.footer-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.footer-tagline {
    color: #94a3b8;
    font-size: 0.875rem;
}

.footer-links {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.footer-link {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.875rem;
    transition: color 0.2s;
    text-decoration: none;
    padding: 0.5rem 0;
}

.footer-link:hover {
    color: white;
}

.footer-separator {
    color: #475569;
}

.footer-bottom {
    padding-top: 2rem;
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
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

    .features-grid {
        grid-template-columns: 1fr;
    }

    .footer-content {
        flex-direction: column;
        text-align: center;
    }

    .footer-links {
        justify-content: center;
    }
}

@media (prefers-color-scheme: dark) {
    .landing-page {
        background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
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
