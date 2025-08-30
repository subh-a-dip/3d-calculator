class Calculator {
    constructor() {
        this.expression = '';
        this.result = '0';
        this.history = [];
        this.isHistoryVisible = false;
        
        this.expressionElement = document.getElementById('expression');
        this.resultElement = document.getElementById('result');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        
        this.updateDisplay();
        this.loadHistory();
    }
    
    updateDisplay() {
        this.expressionElement.textContent = this.expression || '';
        this.resultElement.textContent = this.result;
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
            .replace(/[^0-9+\-*/.() ]/g, '');
        
        // Validate brackets
        const openCount = (cleanExpr.match(/\(/g) || []).length;
        const closeCount = (cleanExpr.match(/\)/g) || []).length;
        
        // Auto-close brackets if needed
        if (openCount > closeCount) {
            cleanExpr += ')'.repeat(openCount - closeCount);
        }
        
        // Use Function constructor for safe evaluation
        return Function('"use strict"; return (' + cleanExpr + ')')();
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
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(entry);
        
        // Keep only last 20 entries
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
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

// Initialize calculator
const calculator = new Calculator();

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