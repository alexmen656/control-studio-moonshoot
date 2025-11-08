<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
    {
        icon: 'share-nodes',
        title: 'Multi-Platform Publishing',
        description: 'Veröffentliche deine Videos gleichzeitig auf TikTok, Instagram, YouTube, Facebook und X.'
    },
    {
        icon: 'calendar-clock',
        title: 'Smart Scheduling',
        description: 'Plane deine Content-Strategie im Voraus und lasse deine Posts automatisch zum perfekten Zeitpunkt veröffentlichen.'
    },
    {
        icon: 'chart-line',
        title: 'Performance Tracking',
        description: 'Verfolge die Performance deiner Videos über alle Plattformen hinweg in einem übersichtlichen Dashboard.'
    },
    {
        icon: 'layer-group',
        title: 'Batch Uploads',
        description: 'Spare Zeit mit Batch-Uploads und verwalte mehrere Videos gleichzeitig.'
    },
    {
        icon: 'folder-open',
        title: 'Content Library',
        description: 'Organisiere und durchsuche deine gesamte Video-Bibliothek an einem zentralen Ort.'
    },
    {
        icon: 'wand-magic-sparkles',
        title: 'Workflow Automation',
        description: 'Automatisiere wiederkehrende Aufgaben und fokussiere dich auf kreative Inhalte.'
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

const newsItems = [
    {
        category: 'Legislativa',
        categoryColor: '#64748b',
        date: '15. marec 2024',
        readTime: '5 min',
        title: 'Neue Anforderungen für die Transparenz im Jahr 2024',
        description: 'Aktuelle Änderungen in der Gesetzgebung und deren Auswirkungen auf die Verwaltung von Selbstverwaltungen',
        author: 'Ing. Ján Novák',
        image: 'L'
    },
    {
        category: 'Technologie',
        categoryColor: '#6366f1',
        date: '08. marec 2024',
        readTime: '8 min',
        title: 'Digitalisierung städtischer Ämter - kompletter Leitfaden',
        description: 'Schritte zu einer erfolgreichen digitalen Transformation der öffentlichen Verwaltung',
        author: 'Ing. Ján Novák',
        image: 'T'
    },
    {
        category: 'Best practices',
        categoryColor: '#8b5cf6',
        date: '01. marec 2024',
        readTime: '6 min',
        title: 'Häufigste Fehler bei der Implementierung von E-Government',
        description: 'Praktische Ratschläge zur Vermeidung von Problemen bei der Einführung digitaler Lösungen',
        author: 'Ing. Ján Novák',
        image: 'BP'
    }
]

const otherProducts = [
    {
        name: 'Control Center',
        description: 'Zentrale Verwaltungsplattform für alle Ihre digitalen Lösungen',
        url: 'https://control-center.eu'
    },
    {
        name: 'Control Cloud',
        description: 'Cloud-basierte Infrastruktur für maximale Skalierbarkeit',
        url: 'https://cloud.control-center.eu'
    },
    {
        name: 'Control Analytics',
        description: 'Umfassende Analyse- und Reporting-Tools',
        url: 'https://analytics.control-center.eu'
    },
    {
        name: 'Control Security',
        description: 'Enterprise-Grade Sicherheitslösungen',
        url: 'https://security.control-center.eu'
    }
]

const stats = [
    { value: '6+', label: 'Plattformen' },
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
        <header class="header">
            <div class="container">
                <nav class="nav">
                    <div class="nav-brand">
                        <div class="logo-icon">CS</div>
                        <span class="brand-name">Control Studio</span>
                    </div>
                    <div class="nav-menu">
                        <button @click="scrollToSection('product')" class="nav-link">Produkt</button>
                        <button @click="scrollToSection('features')" class="nav-link">Features</button>
                        <button @click="scrollToSection('news')" class="nav-link">News</button>
                        <button @click="router.push('/login')" class="nav-link">Login</button>
                        <button @click="router.push('/signup')" class="btn btn-demo">Kostenlos starten</button>
                    </div>
                </nav>
            </div>
        </header>
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
                    <div class="platforms-intro">
                        <h3 class="platforms-title">Unterstützte Plattformen</h3>
                        <p class="platforms-description">Veröffentliche auf allen wichtigen Social Media Plattformen</p>
                    </div>
                    <div class="platform-cards">
                        <div v-for="platform in platforms" :key="platform.name" class="platform-card">
                            <i :class="`fab fa-${platform.icon}`" class="platform-icon"></i>
                            <div class="platform-name">{{ platform.name }}</div>
                            <div class="platform-status">● Verbunden</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
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
                        <div class="feature-icon">
                            <i :class="`fas fa-${feature.icon}`"></i>
                        </div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>
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
                                <span class="news-date">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {{ item.date }}
                                </span>
                                <span class="news-separator">•</span>
                                <span class="news-time">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {{ item.readTime }}
                                </span>
                            </div>
                            <h3 class="news-title">{{ item.title }}</h3>
                            <p class="news-description">{{ item.description }}</p>
                            <div class="news-footer">
                                <div class="news-author">
                                    <div class="author-avatar">{{ item.author.charAt(0) }}</div>
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
                    <button @click="scrollToSection('cta')" class="btn btn-orange">
                        Mehr erfahren
                        <span class="btn-arrow">→</span>
                    </button>
                </div>
            </div>
        </section>
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
                                <span>SSL gesichert</span>
                            </div>
                            <div class="trust-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>DSGVO konform</span>
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
                        <h4 class="footer-heading">Produkt</h4>
                        <ul class="footer-links">
                            <li><button @click="scrollToSection('features')" class="footer-link">Features</button></li>
                            <li><button @click="scrollToSection('news')" class="footer-link">News</button></li>
                            <li><button @click="router.push('/login')" class="footer-link">Login</button></li>
                            <li><button @click="router.push('/signup')" class="footer-link">Registrieren</button></li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Andere Produkte</h4>
                        <ul class="footer-links">
                            <li v-for="product in otherProducts" :key="product.name">
                                <a :href="product.url" target="_blank" class="footer-link">{{ product.name }}</a>
                            </li>
                        </ul>
                    </div>

                    <div class="footer-section">
                        <h4 class="footer-heading">Kontakt</h4>
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
                                <span class="footer-text">Musterstraße 123<br />1010 Wien, Österreich</span>
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
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
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
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
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
}

.gradient-text {
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
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
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

.platform-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    padding: 1rem 0;
}

.platform-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.platform-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.2);
}

.platform-icon {
    font-size: 2.5rem;
    color: #dc2626;
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
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
    font-size: 3rem;
    font-weight: 800;
    color: white;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    background: rgba(220, 38, 38, 0.2);
    border: none;
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.25rem;
}

.news-link:hover {
    background: #dc2626;
    color: white;
}

.news-cta {
    text-align: center;
}

/* CTA Section */
.cta {
    padding: 6rem 0;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
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
    color: #94a3b8;
    padding: 0.5rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
}

.trust-badge svg {
    flex-shrink: 0;
}

.trust-badge.highlight {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
    color: #fca5a5;
    font-weight: 600;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.trust-badge.highlight svg {
    color: #fca5a5;
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

.footer-contact svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: #6366f1;
}

.news-meta svg {
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.25rem;
}

.news-date,
.news-time {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.footer-text {
    color: #94a3b8;
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
    .news-grid {
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
        text-align: center;
    }

    .trust-badges {
        margin-top: 1rem;
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
