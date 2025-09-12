// Instantiate calculator globally
const calculator = new Calculator();

// Global functions for HTML button actions
function addNumber(num) { calculator.addNumber(num); }
function addOperator(op) { calculator.addOperator(op); }
function addDecimal() { calculator.addDecimal(); }
function addBracket() { calculator.addBracket(); }
function calculate() { calculator.calculate(); }
function deleteLast() { calculator.deleteLast(); }
function clearAll() { calculator.clearAll(); }
function addFunction(func) { calculator.addFunction(func); }
function toggleScientific() { calculator.toggleScientific(); }
function toggleHistory() { calculator.toggleHistory(); }
function openGithub() { window.open('https://github.com/subh-a-dip/3d-calculator', '_blank'); }
function clearHistory() { calculator.clearHistory(); }
class Calculator {
    constructor() {
        this.expression = '';
        this.result = '0';
        this.history = [];
        this.isHistoryVisible = false;
        this.isScientificMode = false;
        this.HISTORY_EXPIRY_DAYS = 2;
        
        this.expressionElement = document.getElementById('expression');
        this.resultElement = document.getElementById('result');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.calculatorElement = document.querySelector('.calculator');
        this.scBtn = document.getElementById('scBtn');
        
        this.updateDisplay();
        this.loadHistory();
        this.cleanExpiredHistory();
        this.initMouseFollow();
    }
    
    toggleScientific() {
        this.isScientificMode = !this.isScientificMode;
        const basicKeypad = document.getElementById('basicKeypad');
        const scientificKeypad = document.getElementById('scientificKeypad');
        
        if (this.isScientificMode) {
            basicKeypad.style.display = 'none';
            scientificKeypad.style.display = 'grid';
            this.calculatorElement.classList.add('scientific-mode');
            this.scBtn.classList.add('active');
        } else {
            basicKeypad.style.display = 'grid';
            scientificKeypad.style.display = 'none';
            this.calculatorElement.classList.remove('scientific-mode');
            this.scBtn.classList.remove('active');
        }
    }
    
    initMouseFollow() {
        if (window.innerWidth > 768) {
            document.addEventListener('mousemove', (e) => {
                const rect = this.calculatorElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) / 50;
                const deltaY = (e.clientY - centerY) / 50;
                
                this.calculatorElement.classList.add('mouse-follow');
                this.calculatorElement.style.transform = `
                    perspective(1200px) 
                    rotateX(${8 - deltaY}deg) 
                    rotateY(${-2 + deltaX}deg) 
                    translateZ(${Math.abs(deltaX) + Math.abs(deltaY)}px)
                `;
            });
            
            document.addEventListener('mouseleave', () => {
                this.calculatorElement.classList.remove('mouse-follow');
                this.calculatorElement.style.transform = '';
            });
        }
    }
    
    updateDisplay() {
        this.expressionElement.textContent = this.expression || '';
        this.resultElement.textContent = this.result;
        animateResult();
    }
    
    addNumber(num) {
        if (this.result === 'Error') {
            this.clearAll();
        }
        
        this.expression += num;
        this.updateDisplay();
        this.calculatePreview();
    }
    
    addOperator(op) {
        if (this.result === 'Error') {
            this.clearAll();
        }
        
        const lastChar = this.expression[this.expression.length - 1];
        
        // Replace operator if last character is also an operator
        if (['+', '-', '×', '÷'].includes(lastChar)) {
            this.expression = this.expression.slice(0, -1) + op;
        } else if (this.expression !== '') {
            this.expression += op;
        }
        
        this.updateDisplay();
    }
    
    addDecimal() {
        if (this.result === 'Error') {
            this.clearAll();
        }
        
        // Check if current number already has a decimal
        const parts = this.expression.split(/[+\-×÷]/);
        const lastPart = parts[parts.length - 1];
        
        if (!lastPart.includes('.')) {
            if (lastPart === '' || ['+', '-', '×', '÷'].includes(this.expression[this.expression.length - 1])) {
                this.expression += '0.';
            } else {
                this.expression += '.';
            }
            this.updateDisplay();
        }
    }
    
    addBracket() {
        if (this.result === 'Error') {
            this.clearAll();
        }
        
        const openCount = (this.expression.match(/\(/g) || []).length;
        const closeCount = (this.expression.match(/\)/g) || []).length;
        const lastChar = this.expression[this.expression.length - 1];
        
        if (this.expression === '' || ['+', '-', '×', '÷', '('].includes(lastChar)) {
            this.expression += '(';
        } else if (openCount > closeCount && !['+', '-', '×', '÷'].includes(lastChar)) {
            this.expression += ')';
        } else {
            this.expression += '×(';
        }
        
        this.updateDisplay();
        this.calculatePreview();
    }
    
    addFunction(func) {
        if (this.result === 'Error') {
            this.clearAll();
        }
        
        const lastChar = this.expression[this.expression.length - 1];
        const needsMultiply = this.expression !== '' && !['+', '-', '×', '÷', '(', '^'].includes(lastChar);
        
        switch(func) {
            case '√':
                this.expression += (needsMultiply ? '×√(' : '√(');
                break;
            case 'x²':
                if (needsMultiply) this.expression += '²';
                break;
            case 'xʸ':
                if (needsMultiply) this.expression += '^';
                break;
            case '%':
                if (needsMultiply) this.expression += '%';
                break;
            case 'sin':
                this.expression += (needsMultiply ? '×sin(' : 'sin(');
                break;
            case 'cos':
                this.expression += (needsMultiply ? '×cos(' : 'cos(');
                break;
            case 'tan':
                this.expression += (needsMultiply ? '×tan(' : 'tan(');
                break;
            case 'ln':
                this.expression += (needsMultiply ? '×ln(' : 'ln(');
                break;
            case 'log':
                this.expression += (needsMultiply ? '×log(' : 'log(');
                break;
            case 'e':
                this.expression += (needsMultiply ? '×e' : 'e');
                break;
            case 'π':
                this.expression += (needsMultiply ? '×π' : 'π');
                break;
            case '!':
                if (this.expression !== '' && !isNaN(this.expression[this.expression.length - 1])) {
                    this.expression += '!';
                }
                break;
            case '1/x':
                if (this.expression !== '') {
                    this.expression = '1/(' + this.expression + ')';
                }
                break;
        }
        
        this.updateDisplay();
        this.calculatePreview();
    }
    
    deleteLast() {
        if (this.expression.length > 0) {
            this.expression = this.expression.slice(0, -1);
            this.updateDisplay();
            this.calculatePreview();
        }
    }
    
    clearAll() {
        this.expression = '';
        this.result = '0';
        this.updateDisplay();
    }
    
    calculatePreview() {
        if (this.expression === '') {
            this.result = '0';
            this.updateDisplay();
            return;
        }
        
        try {
            const result = this.evaluateExpression(this.expression);
            if (isFinite(result) && !isNaN(result)) {
                this.result = this.formatNumber(result);
            }
        } catch (error) {
            // Don't show error in preview, just keep current result
        }
        
        this.updateDisplay();
    }
    
    calculate() {
        if (this.expression === '') return;
        
        try {
            const result = this.evaluateExpression(this.expression);
            
            if (isFinite(result) && !isNaN(result)) {
                const calculation = `${this.expression} = ${this.formatNumber(result)}`;
                this.addToHistory(calculation);
                
                this.result = this.formatNumber(result);
                this.expression = '';
            } else {
                this.result = 'Error';
                this.expression = '';
            }
        } catch (error) {
            this.result = 'Error';
            this.expression = '';
        }
        
        this.updateDisplay();
    }
    
    evaluateExpression(expr) {
        // Replace display symbols with JavaScript operators
        let cleanExpr = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/²/g, '**2')
            .replace(/\^/g, '**')
            .replace(/%/g, '/100')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/\be\b/g, 'Math.E')
            .replace(/π/g, 'Math.PI');

        // Handle factorial for numbers and nested expressions (e.g., ((2+3)*2)!)
        cleanExpr = cleanExpr.replace(/((?:\([^()]*\)|\d+(?:\.\d+)?)+)!/g, (match, exprOrNum) => {
            let value;
            try {
                // Evaluate the expression inside parentheses or parse number
                value = exprOrNum.startsWith('(') ? Function('"use strict"; return ' + exprOrNum.slice(1, -1))() : parseFloat(exprOrNum);
            } catch {
                return 'NaN';
            }
            return this.factorial(value);
        });

        // Now handle ln and log after factorials are replaced
        cleanExpr = cleanExpr
            .replace(/ln\(/g, 'Math.log(')
            .replace(/log\(/g, 'Math.log10(');

        // Validate brackets
        const openCount = (cleanExpr.match(/\(/g) || []).length;
        const closeCount = (cleanExpr.match(/\)/g) || []).length;

        // Auto-close brackets if needed
        if (openCount > closeCount) {
            cleanExpr += ')'.repeat(openCount - closeCount);
        }

        // Use Function constructor for safe evaluation
        let result = Function('"use strict"; return (' + cleanExpr + ')')();
        // Handle invalid ln and factorial results
        if (isNaN(result) || result === Infinity || result === -Infinity) {
            return 'Error';
        }
        return result;
    }
    
    factorial(n) {
        // Convert to integer for factorial calculation
        // Only allow non-negative integers
        if (typeof n !== 'number' || !isFinite(n) || n < 0 || Math.floor(n) !== n) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity; // Prevent overflow
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    formatNumber(num) {
        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            return parseFloat(num.toFixed(10)).toString();
        }
    }
    
    addToHistory(calculation) {
        const entry = {
            id: Date.now(),
            calculation: calculation,
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toISOString(),
            expires: Date.now() + (this.HISTORY_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        };
        
        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    cleanExpiredHistory() {
        const now = Date.now();
        this.history = this.history.filter(entry => {
            return entry.expires && entry.expires > now;
        });
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="no-history">No calculations yet</div>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map(entry => `
            <div class="history-item" onclick="calculator.useHistoryResult('${entry.calculation}')">
                <div class="calculation">${entry.calculation}</div>
                <div class="timestamp">${entry.timestamp}</div>
            </div>
        `).join('');
    }
    
    useHistoryResult(calculation) {
        const result = calculation.split(' = ')[1];
        this.expression = result;
        this.result = result;
        this.updateDisplay();
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    toggleHistory() {
        this.isHistoryVisible = !this.isHistoryVisible;
        
        if (this.isHistoryVisible) {
            this.historyPanel.classList.add('show');
        } else {
            this.historyPanel.classList.remove('show');
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (error) {
            console.log('Could not save history to localStorage');
        }
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('calculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.updateHistoryDisplay();
            }
        } catch (error) {
            console.log('Could not load history from localStorage');
        }
    }
}


// Create floating particles
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particleContainer.appendChild(particle);
    }
}

// Enhanced button click effect
function addClickEffect(button) {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// Add ripple effect to all buttons
document.querySelectorAll('.btn').forEach(addClickEffect);

// Enhanced result display animation
function animateResult() {
    const resultElement = document.getElementById('result');
    resultElement.classList.add('updating');
    setTimeout(() => resultElement.classList.remove('updating'), 300);
}

// Create particles on load
createParticles();

// Global functions for HTML onclick events
function addNumber(num) {
    calculator.addNumber(num);
}

function addOperator(op) {
    calculator.addOperator(op);
}

function addDecimal() {
    calculator.addDecimal();
}

function addBracket() {
    calculator.addBracket();
}

function deleteLast() {
    calculator.deleteLast();
}

function clearAll() {
    calculator.clearAll();
}

function calculate() {
    calculator.calculate();
}

function toggleHistory() {
    calculator.toggleHistory();
}

function clearHistory() {
    calculator.clearHistory();
}

function addFunction(func) {
    calculator.addFunction(func);
}

function toggleScientific() {
    calculator.toggleScientific();
}

function openGithub() {
    window.open('https://github.com/subh-a-dip/modern-calculator', '_blank');
}

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Prevent default for calculator keys
    if ('0123456789+-*/=.()'.includes(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
    }
    
    if ('0123456789'.includes(key)) {
        addNumber(key);
    } else if (key === '+') {
        addOperator('+');
    } else if (key === '-') {
        addOperator('-');
    } else if (key === '*') {
        addOperator('×');
    } else if (key === '/') {
        addOperator('÷');
    } else if (key === '.') {
        addDecimal();
    } else if (key === '(' || key === ')') {
        addBracket();
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 's') {
        addFunction('sin');
    } else if (key === 'c') {
        addFunction('cos');
    } else if (key === 't') {
        addFunction('tan');
    } else if (key === 'l') {
        addFunction('ln');
    } else if (key === 'p') {
        addFunction('π');
    } else if (key === 'e') {
        addFunction('e');
    } else if (key === 'r') {
        addFunction('√');
    } else if (key === '^') {
        addFunction('xʸ');
    } else if (key === '%') {
        addFunction('%');
    } else if (key === '!') {
        addFunction('!');
    }
});

// Add some visual feedback for button presses
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'translateY(-2px) scale(0.95)';
    });
    
    button.addEventListener('mouseup', () => {
        button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Prevent zoom on iOS
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

// Improve touch responsiveness
document.addEventListener('touchstart', function() {}, {passive: true});

console.log('Modern 3D Calculator loaded successfully!');