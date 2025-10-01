// anti-bot-system.js - نظام متقدم للحماية من البوتات
class AdvancedAntiBotSystem {
    constructor() {
        this.config = {
            minTimeOnPage: 10,
            minHumanScore: 12,
            maxAttempts: 3,
            timeBetweenAttempts: 60000,
            allowedUserAgents: [
                'chrome', 'firefox', 'safari', 'edge', 'opera', 
                'mozilla', 'webkit', 'android', 'iphone'
            ],
            blockKeywords: [
                'bot', 'crawler', 'spider', 'scraper', 'automation',
                'headless', 'phantom', 'selenium', 'puppeteer',
                'python', 'curl', 'wget', 'requests'
            ]
        };

        this.state = {
            startTime: Date.now(),
            attempts: 0,
            lastAttempt: 0,
            humanScore: 0,
            interactions: {
                mouseMovements: 0,
                keystrokes: 0,
                clicks: 0,
                scrolls: 0,
                focusChanges: 0,
                inputInteractions: 0
            },
            behavior: {
                mousePath: [],
                keystrokeTiming: [],
                clickPatterns: []
            },
            flags: {
                isBot: false,
                suspiciousActivity: false,
                developerTools: false
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startMonitoring();
        this.detectAutomation();
        this.generateSecurityToken();
    }

    // 🔒 إعداد مستمعي الأحداث
    setupEventListeners() {
        // تتبع حركات الماوس
        document.addEventListener('mousemove', (e) => this.trackMouseMovement(e));
        
        // تتبع ضغطات المفاتيح
        document.addEventListener('keydown', (e) => this.trackKeystroke(e));
        
        // تتبع النقرات
        document.addEventListener('click', (e) => this.trackClick(e));
        
        // تتبع التمرير
        document.addEventListener('scroll', () => this.trackScroll());
        
        // تتبع التركيز على الحقول
        document.addEventListener('focusin', (e) => this.trackFocus(e));
        
        // تتبع إدخال البيانات
        document.addEventListener('input', (e) => this.trackInput(e));
    }

    // 🎯 تتبع حركة الماوس
    trackMouseMovement(e) {
        this.state.interactions.mouseMovements++;
        
        // تسجيل مسار الماوس للتحليل
        this.state.behavior.mousePath.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
            speed: this.calculateMouseSpeed(e)
        });

        // الاحتفاظ بآخر 100 حركة فقط
        if (this.state.behavior.mousePath.length > 100) {
            this.state.behavior.mousePath.shift();
        }

        // زيادة النقاط بناءً على تعقيد الحركة
        if (this.state.interactions.mouseMovements % 3 === 0) {
            this.increaseHumanScore(0.7, 'mouse_movement');
        }

        // تحليل أنماط الحركة
        this.analyzeMousePatterns();
    }

    // ⌨️ تتبع ضغطات المفاتيح
    trackKeystroke(e) {
        if (e.key.length === 1) { // أحرف فقط
            this.state.interactions.keystrokes++;
            
            this.state.behavior.keystrokeTiming.push({
                key: e.key,
                timestamp: Date.now(),
                code: e.code
            });

            // زيادة النقاط للكتابة الطبيعية
            this.increaseHumanScore(1.2, 'keystroke');

            // تحليل توقيت الضغطات
            this.analyzeKeystrokePatterns();
        }
    }

    // 🖱️ تتبع النقرات
    trackClick(e) {
        this.state.interactions.clicks++;
        
        this.state.behavior.clickPatterns.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
            target: e.target.tagName
        });

        this.increaseHumanScore(1.5, 'click');
        this.analyzeClickPatterns();
    }

    // 📜 تتبع التمرير
    trackScroll() {
        this.state.interactions.scrolls++;
        if (this.state.interactions.scrolls % 2 === 0) {
            this.increaseHumanScore(0.8, 'scroll');
        }
    }

    // 🔍 تتبع التركيز
    trackFocus(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            this.state.interactions.focusChanges++;
            this.increaseHumanScore(0.4, 'focus');
        }
    }

    // 📝 تتبع الإدخال
    trackInput(e) {
        this.state.interactions.inputInteractions++;
        if (this.state.interactions.inputInteractions % 2 === 0) {
            this.increaseHumanScore(0.6, 'input');
        }
    }

    // 🧮 زيادة النقاط البشرية
    increaseHumanScore(points, reason) {
        const timeFactor = Math.min(2, (Date.now() - this.state.startTime) / 10000);
        const adjustedPoints = points * timeFactor;
        
        this.state.humanScore = Math.min(20, this.state.humanScore + adjustedPoints);
        
        console.log(`Human score +${adjustedPoints.toFixed(2)} (${reason}) - Total: ${this.state.humanScore.toFixed(2)}`);
    }

    // 🕵️ كشف التلقائية والبرمجة
    detectAutomation() {
        // كشف أدوات المطورين
        this.detectDevTools();
        
        // كشف المتصفحات الآلية
        this.detectHeadlessBrowser();
        
        // كشف إضافات وأدوات
        this.detectAutomationTools();
        
        // تحليل خصائص المتصفح
        this.analyzeBrowserProperties();
    }

    // 🔧 كشف أدوات المطورين
    detectDevTools() {
        const devTools = {
            windowSize: this.checkWindowSize(),
            console: this.checkConsole(),
            performance: this.checkPerformance(),
            plugins: this.checkPlugins()
        };

        if (devTools.windowSize || devTools.console || devTools.performance) {
            this.state.flags.developerTools = true;
            this.state.humanScore -= 5;
            console.warn('Developer tools detected');
        }
    }

    // 🌐 كشف المتصفحات الآلية
    detectHeadlessBrowser() {
        const tests = {
            webdriver: navigator.webdriver,
            languages: navigator.languages,
            plugins: navigator.plugins.length,
            userAgent: navigator.userAgent.toLowerCase()
        };

        let botScore = 0;

        // تحليل User Agent
        this.config.blockKeywords.forEach(keyword => {
            if (tests.userAgent.includes(keyword)) {
                botScore += 3;
            }
        });

        // فحص WebDriver
        if (tests.webdriver) botScore += 5;
        
        // فحص الإضافات
        if (tests.plugins === 0) botScore += 2;
        
        // فحص اللغات
        if (!tests.languages || tests.languages.length === 0) botScore += 2;

        if (botScore >= 3) {
            this.state.flags.isBot = true;
            this.state.humanScore = 0;
        }
    }

    // 🛠️ كشف أدوات الأتمتة
    detectAutomationTools() {
        // كشف Selenium
        if (window.document.$cdc_asdjflasutopfhvcZLmcfl_) {
            this.state.flags.isBot = true;
        }
        
        // كشف PhantomJS
        if (window.callPhantom || window._phantom) {
            this.state.flags.isBot = true;
        }
        
        // كشف Puppeteer
        if (window.__webdriver_evaluate || window.__selenium_evaluate) {
            this.state.flags.isBot = true;
        }
    }

    // 🔍 تحليل خصائص المتصفح
    analyzeBrowserProperties() {
        const props = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false
        };

        // التحقق من المتصفحات المسموحة
        const isValidBrowser = this.config.allowedUserAgents.some(agent => 
            props.userAgent.toLowerCase().includes(agent)
        );

        if (!isValidBrowser) {
            this.state.flags.suspiciousActivity = true;
            this.state.humanScore -= 3;
        }
    }

    // 📊 تحليل أنماط الماوس
    analyzeMousePatterns() {
        if (this.state.behavior.mousePath.length < 10) return;

        const recentMoves = this.state.behavior.mousePath.slice(-10);
        let straightLines = 0;
        let uniformSpeed = 0;

        for (let i = 1; i < recentMoves.length; i++) {
            const current = recentMoves[i];
            const previous = recentMoves[i-1];
            
            // كشف الخطوط المستقيمة (غير طبيعية)
            const angle = this.calculateAngle(previous, current);
            if (Math.abs(angle) < 0.1) straightLines++;
            
            // كشف السرعة المنتظمة
            if (Math.abs(current.speed - previous.speed) < 0.1) uniformSpeed++;
        }

        if (straightLines > 7 || uniformSpeed > 8) {
            this.state.flags.suspiciousActivity = true;
            this.state.humanScore -= 2;
        }
    }

    // ⏱️ تحليل أنماط الضغطات
    analyzeKeystrokePatterns() {
        if (this.state.behavior.keystrokeTiming.length < 5) return;

        const recentKeys = this.state.behavior.keystrokeTiming.slice(-5);
        const timeDiffs = [];

        for (let i = 1; i < recentKeys.length; i++) {
            timeDiffs.push(recentKeys[i].timestamp - recentKeys[i-1].timestamp);
        }

        // حساب التباين في التوقيت
        const avg = timeDiffs.reduce((a, b) => a + b) / timeDiffs.length;
        const variance = timeDiffs.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / timeDiffs.length;

        // التوقيت المنتظم يشير إلى البوت
        if (variance < 20) {
            this.state.flags.suspiciousActivity = true;
            this.state.humanScore -= 1.5;
        }
    }

    // 🎯 تحليل أنماط النقرات
    analyzeClickPatterns() {
        if (this.state.behavior.clickPatterns.length < 3) return;

        const recentClicks = this.state.behavior.clickPatterns.slice(-3);
        const precision = recentClicks.every(click => 
            Math.abs(click.x - recentClicks[0].x) < 5 && 
            Math.abs(click.y - recentClicks[0].y) < 5
        );

        // الدقة العالية تشير إلى البوت
        if (precision) {
            this.state.flags.suspiciousActivity = true;
            this.state.humanScore -= 2;
        }
    }

    // 🧮 حسابات مساعدة
    calculateMouseSpeed(e) {
        if (this.state.behavior.mousePath.length === 0) return 0;
        
        const lastMove = this.state.behavior.mousePath[this.state.behavior.mousePath.length - 1];
        const timeDiff = e.timeStamp - lastMove.timestamp;
        const distance = Math.sqrt(
            Math.pow(e.clientX - lastMove.x, 2) + 
            Math.pow(e.clientY - lastMove.y, 2)
        );
        
        return timeDiff > 0 ? distance / timeDiff : 0;
    }

    calculateAngle(prev, current) {
        const dx = current.x - prev.x;
        const dy = current.y - prev.y;
        return Math.atan2(dy, dx);
    }

    // 🔍 فحوصات الأمان
    checkWindowSize() {
        return window.outerWidth - window.innerWidth > 200 || 
               window.outerHeight - window.innerHeight > 200;
    }

    checkConsole() {
        return console.profiles || console.memory;
    }

    checkPerformance() {
        const perf = performance.getEntriesByType('navigation')[0];
        return perf && perf.type === 'reload';
    }

    checkPlugins() {
        return navigator.plugins.length === 0;
    }

    // 🎫 توليد توكن الأمان
    generateSecurityToken() {
        const token = {
            timestamp: Date.now(),
            session: Math.random().toString(36).substring(2, 15),
            fingerprint: this.generateFingerprint()
        };
        
        this.securityToken = btoa(JSON.stringify(token));
        return this.securityToken;
    }

    // 👆 توليد بصمة المتصفح
    generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ];
        
        return btoa(components.join('|'));
    }

    // 📈 المراقبة المستمرة
    startMonitoring() {
        setInterval(() => {
            this.monitorBehavior();
        }, 5000);

        // مراقبة تغييرات DOM (محاولات التلاعب)
        this.monitorDOMChanges();
    }

    monitorBehavior() {
        const currentTime = (Date.now() - this.state.startTime) / 1000;
        
        // زيادة النقاط مع الوقت
        if (currentTime > 5 && this.state.humanScore < 20) {
            this.state.humanScore = Math.min(20, this.state.humanScore + 0.1);
        }

        // كشف النشاط غير الطبيعي
        this.detectAbnormalActivity();
    }

    monitorDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    this.state.flags.suspiciousActivity = true;
                    this.state.humanScore -= 3;
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    detectAbnormalActivity() {
        // كشف الإرسال السريع
        if (this.state.attempts > 0) {
            const timeSinceLastAttempt = Date.now() - this.state.lastAttempt;
            if (timeSinceLastAttempt < 2000) { // أقل من ثانيتين
                this.state.flags.suspiciousActivity = true;
                this.state.humanScore -= 4;
            }
        }

        // كشف التفاعل المحدود
        if ((Date.now() - this.state.startTime) > 10000 && this.state.humanScore < 5) {
            this.state.flags.isBot = true;
        }
    }

    // ✅ التحقق النهائي
    validateSubmission() {
        const validation = {
            isValid: true,
            reasons: [],
            score: Math.floor(this.state.humanScore),
            flags: this.state.flags
        };

        // التحقق من الوقت
        const timeSpent = (Date.now() - this.state.startTime) / 1000;
        if (timeSpent < this.config.minTimeOnPage) {
            validation.isValid = false;
            validation.reasons.push(`Minimum time (${this.config.minTimeOnPage}s) not met`);
        }

        // التحقق من النقاط
        if (this.state.humanScore < this.config.minHumanScore) {
            validation.isValid = false;
            validation.reasons.push(`Human score too low (${Math.floor(this.state.humanScore)}/${this.config.minHumanScore})`);
        }

        // التحقق من البوت
        if (this.state.flags.isBot) {
            validation.isValid = false;
            validation.reasons.push('Automated activity detected');
        }

        // التحقق من محاولات الإرسال
        if (this.state.attempts >= this.config.maxAttempts) {
            validation.isValid = false;
            validation.reasons.push('Maximum attempts exceeded');
        }

        // التحقق من الوقت بين المحاولات
        const timeSinceLastAttempt = Date.now() - this.state.lastAttempt;
        if (timeSinceLastAttempt < this.config.timeBetweenAttempts) {
            validation.isValid = false;
            validation.reasons.push('Please wait before trying again');
        }

        return validation;
    }

    // 📤 تسجيل محاولة الإرسال
    recordAttempt() {
        this.state.attempts++;
        this.state.lastAttempt = Date.now();
    }

    // 📊 الحصول على تقرير الأمان
    getSecurityReport() {
        return {
            humanScore: Math.floor(this.state.humanScore),
            timeSpent: Math.floor((Date.now() - this.state.startTime) / 1000),
            interactions: this.state.interactions,
            flags: this.state.flags,
            securityToken: this.securityToken,
            validation: this.validateSubmission()
        };
    }

    // 🛡️ إعادة تعيين النظام
    reset() {
        this.state.attempts = 0;
        this.state.lastAttempt = 0;
        this.generateSecurityToken();
    }
}

// 🌐 التصدير للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.AdvancedAntiBotSystem = AdvancedAntiBotSystem;
}

// 📦 التصدير للاستخدام في Modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAntiBotSystem;
}