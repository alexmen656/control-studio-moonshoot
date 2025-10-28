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

const newsItems = [
    {
        category: 'Legislativa',
        categoryColor: '#64748b',
        date: '15. marec 2024',
        readTime: '5 min',
        title: 'Neue Anforderungen für die Transparenz im Jahr 2024',
        description: 'Aktuelle Änderungen in der Gesetzgebung und deren Auswirkungen auf die Verwaltung von Selbstverwaltungen',
        author: 'Ing. Ján Novák',
        image: '🏛️'
    },
    {
        category: 'Technologie',
        categoryColor: '#6366f1',
        date: '08. marec 2024',
        readTime: '8 min',
        title: 'Digitalisierung städtischer Ämter - kompletter Leitfaden',
        description: 'Schritte zu einer erfolgreichen digitalen Transformation der öffentlichen Verwaltung',
        author: 'Ing. Ján Novák',
        image: '💼'
    },
    {
        category: 'Best practices',
        categoryColor: '#8b5cf6',
        date: '01. marec 2024',
        readTime: '6 min',
        title: 'Häufigste Fehler bei der Implementierung von E-Government',
        description: 'Praktische Ratschläge zur Vermeidung von Problemen bei der Einführung digitaler Lösungen',
        author: 'Ing. Ján Novák',
        image: '📱'
    }
]

const otherProducts = [
    {
        name: 'Control Center',
        description: 'Zentrale Verwaltungsplattform für alle Ihre digitalen Lösungen',
        url: 'https://control-center.eu',
        icon: '🎯'
    },
    {
        name: 'Control Cloud',
        description: 'Cloud-basierte Infrastruktur für maximale Skalierbarkeit',
        url: 'https://cloud.control-center.eu',
        icon: '☁️'
    },
    {
        name: 'Control Analytics',
        description: 'Umfassende Analyse- und Reporting-Tools',
        url: 'https://analytics.control-center.eu',
        icon: '📊'
    },
    {
        name: 'Control Security',
        description: 'Enterprise-Grade Sicherheitslösungen',
        url: 'https://security.control-center.eu',
        icon: '🔒'
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

const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="landing-page">
        <!-- Navigation Header -->
        <header class="header">
            <div class="container">
                <nav class="nav">
                    <div class="nav-brand">
                        <div class="logo-icon">📱</div>
                        <span class="brand-name">Reelmia</span>
                    </div>
                    <div class="nav-menu">
                        <button @click="scrollToSection('product')" class="nav-link">Produkt</button>
                        <button @click="scrollToSection('features')" class="nav-link">Ako funguje</button>
                        <button @click="scrollToSection('news')" class="nav-link">Cenník</button>
                        <button @click="scrollToSection('other-products')" class="nav-link">Partneri</button>
                        <button @click="scrollToSection('cta')" class="nav-link">Články</button>
                        <button @click="router.push('/login')" class="nav-link">Kontakt</button>
                        <button class="theme-toggle">☀️</button>
                        <button @click="router.push('/signup')" class="btn btn-demo">Objednat demo</button>
                    </div>
                </nav>
            </div>
        </header>

        <!-- Hero Section -->
        <section id="product" class="hero">
            <div class="container">
                <div class="hero-content">

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

        <!-- News Section -->
        <section id="news" class="news-section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">
                        Novinky a <span class="gradient-text">praktické rady</span>
                    </h2>
                    <p class="section-description">
                        Držte krok s najnovšími trendmi v digitalizácii verejnej správy a získajte praktické rady od
                        expertov
                    </p>
                </div>

                <div class="news-grid">
                    <div v-for="(item, index) in newsItems" :key="index" class="news-card">
                        <div class="news-image">
                            <div class="news-icon">{{ item.image }}</div>
                            <div class="news-category" :style="{ background: item.categoryColor }">
                                {{ item.category }}
                            </div>
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-date">📅 {{ item.date }}</span>
                                <span class="news-separator">•</span>
                                <span class="news-time">⏱️ {{ item.readTime }}</span>
                            </div>
                            <h3 class="news-title">{{ item.title }}</h3>
                            <p class="news-description">{{ item.description }}</p>
                            <div class="news-footer">
                                <div class="news-author">
                                    <div class="author-avatar">👤</div>
                                    <span class="author-name">{{ item.author }}</span>
                                </div>
                                <button class="news-link">
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="news-cta">
                    <button class="btn btn-orange">
                        Zistiť viac o produkte
                        <span class="btn-arrow">→</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- Other Products Section -->
        <section id="other-products" class="other-products">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Andere Produkte</h2>
                    <p class="section-description">
                        Entdecken Sie unser vollständiges Portfolio an digitalen Lösungen
                    </p>
                </div>

                <div class="products-grid">
                    <a v-for="product in otherProducts" :key="product.name" :href="product.url" target="_blank"
                        class="product-card">
                        <div class="product-icon">{{ product.icon }}</div>
                        <h3 class="product-name">{{ product.name }}</h3>
                        <p class="product-description">{{ product.description }}</p>
                        <div class="product-link">
                            <span class="product-url">{{ product.url.replace('https://', '') }}</span>
                            <span class="link-arrow">→</span>
                        </div>
                    </a>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section id="cta" class="cta">
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
                <div class="footer-grid">
                    <div class="footer-main">
                        <h3 class="footer-brand">Control Studio</h3>
                        <p class="footer-tagline">Ihr Partner für professionelles Social Media Management</p>
                        <div class="footer-social">
                            <a href="#" class="social-link">📘</a>
                            <a href="#" class="social-link">🐦</a>
                            <a href="#" class="social-link">💼</a>
                            <a href="#" class="social-link">📷</a>
                        </div>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Produkt</h4>
                        <ul class="footer-links">
                            <li><button @click="scrollToSection('features')" class="footer-link">Features</button></li>
                            <li><button @click="scrollToSection('news')" class="footer-link">Preise</button></li>
                            <li><button @click="router.push('/login')" class="footer-link">Login</button></li>
                            <li><button @click="router.push('/signup')" class="footer-link">Registrieren</button></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Unternehmen</h4>
                        <ul class="footer-links">
                            <li><a href="#" class="footer-link">Über uns</a></li>
                            <li><a href="#" class="footer-link">Karriere</a></li>
                            <li><a href="#" class="footer-link">Presse</a></li>
                            <li><a href="#" class="footer-link">Partner</a></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Kontakt</h4>
                        <ul class="footer-contact">
                            <li>
                                <span class="contact-icon">📧</span>
                                <a href="mailto:info@control-studio.eu" class="footer-link">info@control-studio.eu</a>
                            </li>
                            <li>
                                <span class="contact-icon">📞</span>
                                <a href="tel:+4312345678" class="footer-link">+43 1 234 56 78</a>
                            </li>
                            <li>
                                <span class="contact-icon">💬</span>
                                <a href="tel:+436641234567" class="footer-link">+43 664 123 45 67</a>
                            </li>
                            <li>
                                <span class="contact-icon">📍</span>
                                <span class="footer-text">Wien, Österreich</span>
                            </li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Rechtliches</h4>
                        <ul class="footer-links">
                            <li><a href="#" class="footer-link">Impressum</a></li>
                            <li><a href="#" class="footer-link">Datenschutz</a></li>
                            <li><a href="#" class="footer-link">AGB</a></li>
                            <li><a href="#" class="footer-link">Cookie-Einstellungen</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; {{ new Date().getFullYear() }} Control Studio. Alle Rechte vorbehalten.</p>
                    <div class="footer-badges">
                        <span class="badge-item">🔒 SSL Verschlüsselt</span>
                        <span class="badge-item">✓ DSGVO konform</span>
                        <span class="badge-item">🇦🇹 Made in Austria</span>
                    </div>
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

/* Header Navigation */
.header {
    position: sticky;
    top: 0;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.brand-name {
    font-size: 1rem;
    font-weight: 600;
    color: white;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-link {
    background: none;
    border: none;
    color: #cbd5e1;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0.5rem 0;
}

.nav-link:hover {
    color: white;
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
}

.theme-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
}

.btn-demo {
    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-demo:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
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

.btn-orange {
    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    padding: 1rem 2rem;
    font-size: 1rem;
}

.btn-orange:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
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

/* News Section */
.news-section {
    padding: 6rem 0;
    background: #1e293b;
}

.news-section .section-title,
.news-section .section-description {
    color: white;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.news-card {
    background: #334155;
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s;
    cursor: pointer;
}

.news-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.news-image {
    position: relative;
    height: 200px;
    background: linear-gradient(135deg, #475569 0%, #334155 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.news-icon {
    font-size: 4rem;
    filter: grayscale(1) brightness(0.8);
}

.news-category {
    position: absolute;
    top: 1rem;
    left: 1rem;
    padding: 0.375rem 0.875rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
}

.news-content {
    padding: 1.5rem;
}

.news-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #94a3b8;
    margin-bottom: 1rem;
}

.news-separator {
    color: #475569;
}

.news-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.75rem;
    line-height: 1.4;
}

.news-description {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #cbd5e1;
    margin-bottom: 1.5rem;
}

.news-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #475569;
}

.news-author {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.author-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.author-name {
    font-size: 0.875rem;
    color: #e2e8f0;
    font-weight: 500;
}

.news-link {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(249, 115, 22, 0.2);
    border: none;
    color: #fb923c;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.25rem;
}

.news-link:hover {
    background: #f97316;
    color: white;
}

.news-cta {
    text-align: center;
}

/* Other Products Section */
.other-products {
    padding: 6rem 0;
    background: white;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.product-card {
    background: #f8fafc;
    border-radius: 1rem;
    padding: 2rem;
    text-decoration: none;
    transition: all 0.3s;
    border: 2px solid transparent;
    display: block;
}

.product-card:hover {
    background: white;
    border-color: #6366f1;
    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15);
    transform: translateY(-4px);
}

.product-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.product-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.75rem;
}

.product-description {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #64748b;
    margin-bottom: 1.5rem;
}

.product-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.product-url {
    font-size: 0.875rem;
    color: #6366f1;
    font-weight: 500;
}

.link-arrow {
    font-size: 1.25rem;
    color: #6366f1;
    transition: transform 0.2s;
}

.product-card:hover .link-arrow {
    transform: translateX(4px);
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
    padding: 4rem 0 2rem;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-main {
    grid-column: span 2;
}

.footer-brand {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: white;
}

.footer-tagline {
    color: #94a3b8;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
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
    color: white;
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
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.875rem;
    transition: color 0.2s;
    text-decoration: none;
    text-align: left;
    padding: 0;
}

.footer-link:hover {
    color: white;
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

.contact-icon {
    font-size: 1.125rem;
    min-width: 20px;
}

.footer-text {
    color: #94a3b8;
    font-size: 0.875rem;
}

.footer-bottom {
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #64748b;
    font-size: 0.875rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.footer-badges {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.badge-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #94a3b8;
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
    .news-grid,
    .products-grid {
        grid-template-columns: 1fr;
    }

    .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .footer-main {
        grid-column: span 1;
    }

    .footer-bottom {
        flex-direction: column;
        text-align: center;
    }

    .footer-badges {
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

    .other-products {
        background: #0f172a;
    }

    .product-card {
        background: #1e293b;
    }

    .product-card:hover {
        background: #334155;
    }

    .product-name {
        color: #e2e8f0;
    }
}
</style>
