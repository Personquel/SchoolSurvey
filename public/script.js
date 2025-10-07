let questions = [];

// Load questions when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadQuestions();
});

// Theme functionality
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a subtle animation effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        questions = await response.json();
        renderQuestions();
    } catch (error) {
        showMessage('Error loading questions', 'error');
    }
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.style.animationDelay = `${index * 0.1}s`;
        questionDiv.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p>${question.question_text}</p>
            <textarea 
                id="answer-${question.id}" 
                placeholder="Share your thoughts..."
                required
            ></textarea>
        `;
        container.appendChild(questionDiv);
        
        // Add entrance animation
        setTimeout(() => {
            questionDiv.style.opacity = '1';
            questionDiv.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Enable submit button and add event listener
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = false;
    document.getElementById('surveyForm').addEventListener('submit', handleSubmit);
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const responses = [];
    let allAnswered = true;

    questions.forEach(question => {
        const answer = document.getElementById(`answer-${question.id}`).value.trim();
        if (!answer) {
            allAnswered = false;
            return;
        }
        responses.push({
            question_id: question.id,
            answer: answer
        });
    });

    if (!allAnswered) {
        showMessage('Please answer all questions', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ responses })
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage('🎉 Survey submitted successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'summary.html';
            }, 2000);
        } else {
            showMessage(result.error || 'Error submitting survey', 'error');
        }
    } catch (error) {
        showMessage('Error submitting survey. Please try again.', 'error');
    } finally {
        // Reset button state
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1000);
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    
    // Add success animation
    if (type === 'success') {
        confetti();
    }
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Simple confetti effect for success
function confetti() {
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confettiPiece = document.createElement('div');
            confettiPiece.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confettiFall 3s linear forwards;
            `;
            
            document.body.appendChild(confettiPiece);
            
            setTimeout(() => {
                confettiPiece.remove();
            }, 3000);
        }, i * 50);
    }
}

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    .question {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }
`;
document.head.appendChild(style);