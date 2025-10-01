// anti-bot-integration.js - تكامل نظام الحماية
class AntiBotIntegration {
    constructor(formSelector, options = {}) {
        this.form = document.querySelector(formSelector);
        this.options = {
            onBotDetected: options.onBotDetected || this.defaultBotHandler,
            onValidationSuccess: options.onValidationSuccess || null,
            onValidationFail: options.onValidationFail || this.defaultValidationHandler,
            debug: options.debug || false
        };

        this.antiBotSystem = new AdvancedAntiBotSystem();
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form not found:', this.formSelector);
            return;
        }

        this.setupFormProtection();
        this.createSecurityFields();
        this.setupFormSubmission();
    }

    setupFormProtection() {
        // منع الإكمال التلقائي
        this.form.setAttribute('autocomplete', 'off');
        this.form.setAttribute('novalidate', 'true');

        // منع النسخ واللصق
        this.form.addEventListener('copy', (e) => e.preventDefault());
        this.form.addEventListener('paste', (e) => e.preventDefault());
        this.form.addEventListener('cut', (e) => e.preventDefault());

        // إضافة حقول Honeypot
        this.addHoneypotFields();
    }

    addHoneypotFields() {
        const honeypotFields = [
            { name: 'website', type: 'text', label: 'Website' },
            { name: 'full_name', type: 'text', label: 'Full Name' },
            { name: 'contact_email', type: 'email', label: 'Contact Email' }
        ];

        honeypotFields.forEach(field => {
            const div = document.createElement('div');
            div.style.cssText = 'display: none !important; opacity: 0; position: absolute; left: -10000px;';
            
            const label = document.createElement('label');
            label.textContent = field.label;
            label.setAttribute('for', field.name);
            
            const input = document.createElement('input');
            input.type = field.type;
            input.name = field.name;
            input.id = field.name;
            input.autocomplete = 'off';
            
            div.appendChild(label);
            div.appendChild(input);
            this.form.appendChild(div);
        });
    }

    createSecurityFields() {
        // إضافة حقل التوكن الأمني
        const tokenField = document.createElement('input');
        tokenField.type = 'hidden';
        tokenField.name = 'security_token';
        tokenField.value = this.antiBotSystem.securityToken;
        this.form.appendChild(tokenField);

        // إضافة حقل البصمة
        const fingerprintField = document.createElement('input');
        fingerprintField.type = 'hidden';
        fingerprintField.name = 'browser_fingerprint';
        fingerprintField.value = this.antiBotSystem.generateFingerprint();
        this.form.appendChild(fingerprintField);
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // التحقق من الأمان
            const validation = this.antiBotSystem.validateSubmission();

            if (this.options.debug) {
                console.log('Security Validation:', validation);
            }

            if (!validation.isValid) {
                this.antiBotSystem.recordAttempt();
                
                if (this.options.onValidationFail) {
                    this.options.onValidationFail(validation);
                } else {
                    this.defaultValidationHandler(validation);
                }
                return;
            }

            // تسجيل المحاولة الناجحة
            this.antiBotSystem.recordAttempt();

            // استدعاء callback النجاح
            if (this.options.onValidationSuccess) {
                this.options.onValidationSuccess(this.antiBotSystem.getSecurityReport());
            }

            // متابعة الإرسال
            this.submitForm();
        });
    }

    defaultBotHandler(report) {
        alert('🚫 Automated activity detected. Please contact support if this is an error.');
        console.warn('Bot detected:', report);
    }

    defaultValidationHandler(validation) {
        const message = validation.reasons.join('\n• ');
        alert(`❌ Security check failed:\n• ${message}\n\nPlease try again.`);
    }

    async submitForm() {
        try {
            // إضافة بيانات الأمان للنموذج
            const securityData = this.antiBotSystem.getSecurityReport();
            this.addSecurityDataToForm(securityData);

            // متابعة الإرسال العادي
            this.form.submit();
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An error occurred. Please try again.');
        }
    }

    addSecurityDataToForm(securityData) {
        // إضافة بيانات الأمان كحقول مخفية
        const dataFields = [
            { name: 'human_score', value: securityData.humanScore },
            { name: 'time_spent', value: securityData.timeSpent },
            { name: 'interactions', value: JSON.stringify(securityData.interactions) },
            { name: 'security_flags', value: JSON.stringify(securityData.flags) }
        ];

        dataFields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            this.form.appendChild(input);
        });
    }

    // تحديث النقاط في الواجهة
    updateScoreDisplay(containerId = 'human-score-display') {
        const container = document.getElementById(containerId);
        if (!container) return;

        setInterval(() => {
            const report = this.antiBotSystem.getSecurityReport();
            container.innerHTML = `
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center;">
                    <strong>Human Verification:</strong> 
                    <span style="color: ${report.humanScore >= 12 ? '#28a745' : '#dc3545'}">
                        ${report.humanScore}/20
                    </span>
                    <br>
                    <small>Time: ${report.timeSpent}s</small>
                </div>
            `;
        }, 1000);
    }

    // إعادة تعيين النظام
    reset() {
        this.antiBotSystem.reset();
    }

    // الحصول على تقرير الأمان
    getReport() {
        return this.antiBotSystem.getSecurityReport();
    }
}

// 🌐 التصدير للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.AntiBotIntegration = AntiBotIntegration;
}