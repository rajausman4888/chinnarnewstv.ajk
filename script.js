// Global Variables
let leaves = [];
let animationId;
let isDarkMode = true;
let leavesCtx;

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavbar();
    initLeaves();
    initScrollAnimations();
    initOwnerModal();
    initHistoryTranslations();
    initSmoothScroll();
    resizeCanvas();
    preloadImages();
});

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle('light-mode', !isDarkMode);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = toggleTheme;
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Navbar Functionality
function initNavbar() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });

    // Active nav link on scroll
    window.addEventListener('scroll', throttle(() => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            if (scrollPos > section.offsetTop) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// Falling Leaves Animation
function initLeaves() {
    const canvas = document.getElementById('leafCanvas');
    if (!canvas) return;
    
    leavesCtx = canvas.getContext('2d');
    window.addEventListener('resize', throttle(resizeCanvas, 100));
    generateLeaves();
    animateLeaves();
}

function resizeCanvas() {
    const canvas = document.getElementById('leafCanvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function generateLeaves() {
    leaves = [];
    for (let i = 0; i < 50; i++) {
        leaves.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight - window.innerHeight,
            size: Math.random() * 15 + 5,
            speed: Math.random() * 2 + 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 2 - 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function animateLeaves() {
    const canvas = document.getElementById('leafCanvas');
    if (!canvas || !leavesCtx) return;
    
    leavesCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    leaves.forEach((leaf) => {
        leaf.y += leaf.speed;
        leaf.rotation += leaf.rotationSpeed;
        
        if (leaf.y > canvas.height) {
            leaf.y = -leaf.size;
            leaf.x = Math.random() * canvas.width;
        }
        
        leavesCtx.save();
        leavesCtx.translate(leaf.x, leaf.y);
        leavesCtx.rotate(leaf.rotation * Math.PI / 180);
        leavesCtx.globalAlpha = leaf.opacity;
        
        leavesCtx.fillStyle = isDarkMode ? '#8B4513' : '#228B22';
        leavesCtx.beginPath();
        leavesCtx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
        leavesCtx.fill();
        
        leavesCtx.strokeStyle = isDarkMode ? '#A0522D' : '#006400';
        leavesCtx.lineWidth = 1;
        leavesCtx.beginPath();
        leavesCtx.moveTo(0, -leaf.size * 0.6);
        leavesCtx.lineTo(0, leaf.size * 0.6);
        leavesCtx.stroke();
        
        leavesCtx.restore();
    });
    
    animationId = requestAnimationFrame(animateLeaves);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Owner Modal
function initOwnerModal() {
    const ownerCard = document.getElementById('ownerCard');
    const modal = document.getElementById('ownerModal');
    const modalClose = document.getElementById('modalClose');
    
    if (ownerCard && modal) {
        ownerCard.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (modalClose && modal) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
    
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
}

// History Page Translations (Only on history.html)
function initHistoryTranslations() {
    const translateBtns = document.querySelectorAll('.translate-btn');
    
    translateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            const content = document.getElementById(`${sectionId}-content`);
            
            if (!content || !window.urduTranslations) return;
            
            const isTranslated = this.dataset.translated === 'true';
            
            if (isTranslated) {
                // Back to English
                if (content.dataset.original) {
                    content.innerHTML = content.dataset.original;
                }
                this.dataset.translated = 'false';
                this.textContent = 'ترجمہ اردو';
                content.classList.remove('urdu-text');
            } else {
                // Save original if not saved
                if (!content.dataset.original) {
                    content.dataset.original = content.innerHTML;
                }
                
                // Urdu translation
                const urduText = window.urduTranslations[sectionId] || 'ترجمہ دستیاب نہیں';
                const historyImage = content.querySelector('.history-image');
                let imageHTML = '';
                
                if (historyImage) {
                    imageHTML = historyImage.outerHTML;
                }
                
                content.innerHTML = `
                    ${imageHTML}
                    <div class="history-text">
                        <p>${urduText}</p>
                    </div>
                `;
                content.classList.add('urdu-text');
                this.dataset.translated = 'true';
                this.textContent = 'English';
            }
        });
    });
}

// Smooth Scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Preload Critical Images
function preloadImages() {
    const images = [
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Navbar Shrink Effect
function initNavbarEffect() {
    window.addEventListener('scroll', throttle(() => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(30px)';
            navbar.style.padding = '0.5rem 2rem';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.05)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.padding = '1rem 2rem';
        }
    }, 50));
}

// Initialize navbar effect
initNavbarEffect();

// Performance Cleanup
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    } else {
        animateLeaves();
    }
});

// Export functions for debugging (remove in production)
window.debug = {
    toggleTheme,
    generateLeaves,
    closeModal: () => document.getElementById('ownerModal')?.classList.remove('active')
};
// History Footer Dual Language
const historyFooterData = {
    en: {
        quote: '"Kashmir is Paradise on Earth, its history is our shared heritage"',
        author: '— Raja Habib Kashmiri',
        title: 'Key Chapters of History',
        years: '5000+',
        credit: '&copy; 2024 Chinnar News TV | Kashmir\'s Voice',
        links: {
            ancient: 'Ancient Era',
            muslim: 'Islamic Era',
            dynasties: 'Dynasties',
            partition: 'Partition'
        }
    },
    ur: {
        quote: '"کشمیر زمین پر جنت ہے، اس کی تاریخ ہماری مشترکہ وراثت"',
        author: '— راجہ حبیب کشمیری',
        title: 'تاریخ کے اہم ابواب',
        years: '5000+',
        credit: '&copy; 2024 Chinnar News TV | کشمیر کی آواز',
        links: {
            ancient: 'قدیم دور',
            muslim: 'اسلامی دور',
            dynasties: 'سلطانی دور',
            partition: 'تقسیم ہند'
        }
    }
};

function toggleHistoryFooter(lang = 'en') {
    const data = historyFooterData[lang];
    
    // Quote
    document.getElementById('historyQuote').innerHTML = 
        `<i class="fas fa-quote-left"></i><p>${data.quote}</p><cite>${data.author}</cite>`;
    
    // Title
    document.getElementById('historyTitle').textContent = data.title;
    
    // Stats
    document.getElementById('years').textContent = data.years;
    document.getElementById('footerCredit').innerHTML = data.credit;
    
    // Quick Links
    document.querySelectorAll('.quick-link').forEach(link => {
        const key = link.getAttribute('href').substring(1);
        link.childNodes[2].textContent = data.links[key];
    });
}

// Language Toggle Button (navbar ya footer mein add karo)
function toggleFooterLanguage() {
    const currentLang = document.body.classList.contains('urdu-mode') ? 'en' : 'ur';
    toggleHistoryFooter(currentLang);
    document.body.classList.toggle('urdu-mode');
}
// 🔥 HISTORY FOOTER TOGGLE BUTTON - 100% WORKING
document.addEventListener('DOMContentLoaded', function() {
    
    // Footer Data
    const footerData = {
        english: {
            quote: "Kashmir is Paradise on Earth, its history is our shared heritage",
            author: "— Raja Habib Kashmiri",
            title: "Key Chapters of History",
            stats1: "5000+ Years of History",
            stats2: "Millions of Stories", 
            stats3: "Love for Kashmir",
            credit: "© 2024 Chinnar News TV | Kashmir's Voice",
            links: ["Ancient Era", "Islamic Era", "Dynasties", "Partition"]
        },
        urdu: {
            quote: "کشمیر زمین پر جنت ہے، اس کی تاریخ ہماری مشترکہ وراثت",
            author: "— راجہ حبیب کشمیری",
            title: "تاریخ کے اہم ابواب",
            stats1: "5000+ سال کی تاریخ",
            stats2: "لاکھوں کہانیاں",
            stats3: "کشمیر کی محبت",
            credit: "© 2024 Chinnar News TV | کشمیر کی آواز",
            links: ["قدیم دور", "اسلامی دور", "سلطانی دور", "تقسیم ہند"]
        }
    };
    
    let isUrdu = false;
    
    // Toggle Function
    window.toggleFooterLanguage = function() {
        isUrdu = !isUrdu;
        const data = isUrdu ? footerData.urdu : footerData.english;
        const btn = document.querySelector('.history-lang-toggle');
        
        // Update Quote
        document.querySelector('.history-quote p').textContent = data.quote;
        document.querySelector('.history-quote cite').textContent = data.author;
        
        // Update Title
        document.querySelector('.history-quick-links h4').textContent = data.title;
        
        // Update Stats
        document.querySelectorAll('.footer-stats span')[0].childNodes[2].textContent = data.stats1;
        document.querySelectorAll('.footer-stats span')[1].childNodes[2].textContent = data.stats2;
        document.querySelectorAll('.footer-stats span')[2].childNodes[2].textContent = data.stats3;
        
        // Update Links
        document.querySelectorAll('.quick-link').forEach((link, i) => {
            link.lastChild.textContent = data.links[i];
        });
        
        // Update Credit
        document.querySelector('.history-footer-bottom p').textContent = data.credit;
        
        // Button Text
        btn.innerHTML = `<i class="fas fa-language"></i> ${isUrdu ? 'EN' : 'UR'}`;
        
        // Body Class
        document.body.classList.toggle('urdu-history', isUrdu);
    };
    
    // Initialize Button
    const toggleBtn = document.querySelector('.history-lang-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-language"></i> UR';
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('mobileHamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.onclick = function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
    
    // Close menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});
// 🎨 BEAUTIFUL 3-IN-1 POPUPS
function showPopup(type) {
    const isDark = document.body.classList.contains('dark') || 
                   getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')?.trim() === '#1a1a1a';
    
    const data = {
        privacy: {
            icon: '🔒', title: 'Privacy Policy', 
            desc: 'Muzaffarabad, AJK | Dec 2024',
            content: `
                <div style="font-weight:600;margin-bottom:15px;color:${isDark?'#e5e5e5':'#333'}">
                    Your Privacy is Protected:
                </div>
                <ul style="margin:20px 0;padding-left:25px;color:${isDark?'#d0d0d0':'#555'};line-height:1.6">
                    <li>✅ No personal data collected</li>
                    <li>🍪 Theme cookies only</li>
                    <li>🚫 No ad trackers</li>
                    <li>🇵🇰 Pakistan/AJK compliant</li>
                </ul>
                <div style="background:${isDark?'#2d2d2d':'#f8fafc'};padding:18px;border-radius:12px;margin:20px 0;border-left:5px solid ${isDark?'#4dabf7':'#2563eb'}">
                    <p style="margin:0;font-size:15px;color:${isDark?'#ccc':'#475569'}">
                        📧 info@chinnarnewstv.com<br>📍 Muzaffarabad, AJK
                    </p>
                </div>
            `
        },
        terms: {
            icon: '📜', title: 'Terms of Service',
            desc: 'Effective December 2024',
            content: `
                <div style="font-weight:600;margin-bottom:15px;color:${isDark?'#e5e5e5':'#333'}">
                    Using Our Service:
                </div>
                <ul style="margin:20px 0;padding-left:25px;color:${isDark?'#d0d0d0':'#555'};line-height:1.6">
                    <li>✅ Content for information only</li>
                    <li>⚠️ No illegal use allowed</li>
                    <li>📱 Mobile friendly</li>
                    <li>🔄 Updates without notice</li>
                </ul>
                <p style="font-size:14px;color:${isDark?'#aaa':'#666'};margin-top:20px">
                    By using site, you agree to these terms.
                </p>
            `
        },
        advertise: {
            icon: '📢', title: 'Advertise With Us',
            desc: 'Grow your business in AJK',
            content: `
                <div style="font-weight:600;margin-bottom:15px;color:${isDark?'#e5e5e5':'#333'}">
                    Advertising Opportunities:
                </div>
                <div style="background:${isDark?'#2d2d2d':'#f0f9ff'};padding:20px;border-radius:12px;margin:20px 0;border-left:5px solid ${isDark?'#10b981':'#059669'}">
                    <h4 style="color:${isDark?'#10b981':'#059669'};margin:0 0 10px 0">🎯 Reach Kashmir Audience</h4>
                    <ul style="color:${isDark?'#ccc':'#475569'};padding-left:20px;margin:10px 0">
                        <li>500K+ monthly views</li>
                        <li>Targeted AJK audience</li>
                        <li>Affordable packages</li>
                    </ul>
                </div>
                <p style="font-size:14px;color:${isDark?'#aaa':'#666'}">
                    📧 ads@chinnarnewstv.com
                </p>
            `
        }
    };
    
    const modal = document.createElement('div');
    modal.id = `${type}Modal`;
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100vh;
        background:${isDark?'rgba(0,0,0,0.97)':'rgba(0,0,0,0.85)'};
        z-index:10001;display:flex;align-items:center;justify-content:center;
        padding:20px;backdrop-filter:blur(8px);animation:fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background:${isDark?'#1e1e1e':'#ffffff'};
            color:${isDark?'#f0f0f0':'#1f2937'};
            max-width:580px;width:95%;border-radius:20px;padding:35px;
            max-height:85vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,0.6);
            border:${isDark?'1px solid #333':'none'};
            font-family:system-ui,-apple-system,sans-serif;
        ">
            <div style="
                display:flex;justify-content:space-between;align-items:center;
                margin-bottom:25px;padding-bottom:18px;
                border-bottom:3px solid ${isDark?'#4dabf7':'#2563eb'};
            ">
                <h2 style="
                    margin:0;font-size:28px;font-weight:700;
                    background:linear-gradient(135deg,${isDark?'#4dabf7':'#2563eb'},#60a5fa);
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                    background-clip:text;
                ">${data[type].icon} ${data[type].title}</h2>
                <button onclick="document.getElementById('${modal.id}').remove()" style="
                    background:${isDark?'#2a2a2a':'rgba(0,0,0,0.05)'};
                    border:none;font-size:26px;cursor:pointer;color:${isDark?'#ddd':'#666'};
                    width:45px;height:45px;border-radius:50%;display:flex;align-items:center;
                    justify-content:center;transition:all .25s ease;
                " onmouseover="this.style.transform='scale(1.1)';this.style.background='${isDark?'#333':'rgba(0,0,0,0.1)'}'" 
                   onmouseout="this.style.transform='scale(1)';this.style.background='${isDark?'#2a2a2a':'rgba(0,0,0,0.05)'}'"
                >×</button>
            </div>
            
            <p style="font-size:15px;color:${isDark?'#b3b3b3':'#6b7280'};margin-bottom:25px;font-style:italic">
                ${data[type].desc}
            </p>
            
            <div style="line-height:1.7">${data[type].content}</div>
            
            <button onclick="document.getElementById('${modal.id}').remove()" style="
                background:linear-gradient(135deg,${isDark?'#4dabf7':'#2563eb'},#60a5fa);
                color:white;border:none;padding:16px 32px;border-radius:12px;cursor:pointer;
                width:100%;font-size:16px;font-weight:600;margin-top:25px;transition:all .3s;
                box-shadow:0 4px 15px ${isDark?'rgba(77,171,247,0.4)':'rgba(37,99,235,0.4)'};
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 25px ${isDark?'rgba(77,171,247,0.6)':'rgba(37,99,235,0.6)'}'" 
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px ${isDark?'rgba(77,171,247,0.4)':'rgba(37,99,235,0.4)'}'"
            >Got it, Thanks! 😊</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // CLOSE EVENTS
    modal.onclick = e => e.target === modal && modal.remove();
    document.onkeydown = e => e.key === 'Escape' && modal.remove();
}