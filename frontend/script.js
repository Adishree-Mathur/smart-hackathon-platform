document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentHackathonId = null;
    let currentParticipantId = null;
    
    // DOM Elements
    const hackathonForm = document.getElementById('hackathonForm');
    const participantForm = document.getElementById('participantForm');
    const getTeamSuggestionsBtn = document.getElementById('getTeamSuggestions');
    const teamSuggestionsContainer = document.getElementById('teamSuggestions');
    const getProjectIdeasBtn = document.getElementById('getProjectIdeas');
    const projectIdeasContainer = document.getElementById('projectIdeas');
    const mentorQuestionInput = document.getElementById('mentorQuestion');
    const askMentorBtn = document.getElementById('askMentor');
    const chatMessagesContainer = document.getElementById('chatMessages');
    const codeInput = document.getElementById('codeInput');
    const reviewCodeBtn = document.getElementById('reviewCode');
    const codeErrorsList = document.getElementById('codeErrors');
    const codeSuggestionsList = document.getElementById('codeSuggestions');
    const qualityScoreMeter = document.getElementById('qualityScore');
    const qualityScoreText = document.getElementById('qualityScoreText');
    
    // Event Listeners
    hackathonForm.addEventListener('submit', createHackathon);
    participantForm.addEventListener('submit', registerParticipant);
    getTeamSuggestionsBtn.addEventListener('click', getTeamSuggestions);
    getProjectIdeasBtn.addEventListener('click', getProjectIdeas);
    askMentorBtn.addEventListener('click', askMentor);
    mentorQuestionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') askMentor();
    });
    reviewCodeBtn.addEventListener('click', reviewCode);
    
    // Quick tips click handlers
    document.querySelectorAll('.mentorship-tips li').forEach(item => {
        item.addEventListener('click', function() {
            mentorQuestionInput.value = this.textContent;
            askMentor();
        });
    });

    // Initialize with welcome message
    addMessageToChat("Welcome to the AI Hackathon Mentor! How can I help you with your project today?", 'bot');
    
    // API Functions
    async function createHackathon(e) {
        e.preventDefault();
        
        const name = document.getElementById('hackathonName').value.trim();
        const theme = document.getElementById('hackathonTheme').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!name || !theme || !startDate || !endDate) {
            showNotification('Please fill all fields', 'warning');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            showNotification('End date must be after start date', 'warning');
            return;
        }
        
        const hackathonData = {
            name,
            theme,
            start_date: startDate,
            end_date: endDate
        };
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/hackathon/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(hackathonData)
            });
            
            if (!response.ok) throw new Error('Server error');
            
            const data = await response.json();
            currentHackathonId = data.id;
            
            showNotification('Hackathon created successfully!', 'success');
            hackathonForm.reset();
        } catch (error) {
            showNotification('Failed to create hackathon: ' + error.message, 'error');
            console.error('Create hackathon error:', error);
        }
    }
    
    async function registerParticipant(e) {
        e.preventDefault();
        
        const name = document.getElementById('participantName').value.trim();
        const email = document.getElementById('participantEmail').value.trim();
        const skills = document.getElementById('participantSkills').value.split(',').map(s => s.trim()).filter(s => s);
        const interests = document.getElementById('participantInterests').value.trim();
        const experience = document.getElementById('participantExperience').value;

        if (!name || !email || !skills.length || !interests) {
            showNotification('Please fill all required fields', 'warning');
            return;
        }

        if (!validateEmail(email)) {
            showNotification('Please enter a valid email', 'warning');
            return;
        }
        
        const participantData = {
            name,
            email,
            skills,
            interests,
            experience
        };
        
        if (!currentHackathonId) {
            showNotification('Please create or select a hackathon first', 'warning');
            return;
        }
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/hackathon/${currentHackathonId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(participantData)
            });
            
            if (!response.ok) throw new Error('Server error');
            
            const data = await response.json();
            currentParticipantId = data.id;
            
            showNotification('Registered as participant successfully!', 'success');
            participantForm.reset();
        } catch (error) {
            showNotification('Failed to register participant: ' + error.message, 'error');
            console.error('Register participant error:', error);
        }
    }
    
    async function getTeamSuggestions() {
        if (!currentHackathonId) {
            showNotification('Please create or select a hackathon first', 'warning');
            return;
        }
        
        if (!currentParticipantId) {
            showNotification('Please register as a participant first', 'warning');
            return;
        }
        
        try {
            showNotification('Generating team suggestions...', 'info');
            getTeamSuggestionsBtn.disabled = true;
            
            const response = await fetch(`http://127.0.0.1:5000/api/hackathon/${currentHackathonId}/suggest-teams`);
            
            if (!response.ok) throw new Error('Server error');
            
            const teams = await response.json();
            
            teamSuggestionsContainer.innerHTML = '';
            
            if (teams.length === 0) {
                teamSuggestionsContainer.innerHTML = '<p class="no-results">No team suggestions available</p>';
                return;
            }
            
            teams.forEach((team, index) => {
                const teamEl = document.createElement('div');
                teamEl.className = 'team-suggestion';
                
                const compatibility = Math.round(team.compatibility_score * 100);
                teamEl.innerHTML = `
                    <h4>Team ${index + 1} (${compatibility}% compatible)</h4>
                    <div class="team-members">
                        ${team.members.map(member => `
                            <span class="team-member">
                                <strong>${member.name}</strong><br>
                                Skills: ${member.skills.slice(0, 3).join(', ')}${member.skills.length > 3 ? '...' : ''}
                            </span>
                        `).join('')}
                    </div>
                    <button class="btn btn-small join-team" data-team-id="${index}">Join Team</button>
                `;
                
                teamSuggestionsContainer.appendChild(teamEl);
            });
            
            // Add event listeners to join team buttons
            document.querySelectorAll('.join-team').forEach(btn => {
                btn.addEventListener('click', function() {
                    const teamId = this.getAttribute('data-team-id');
                    joinTeam(teamId);
                });
            });
            
            showNotification('Team suggestions generated!', 'success');
        } catch (error) {
            showNotification('Failed to get team suggestions: ' + error.message, 'error');
            console.error('Get team suggestions error:', error);
        } finally {
            getTeamSuggestionsBtn.disabled = false;
        }
    }
    
    async function joinTeam(teamId) {
        try {
            // In a real app, this would send a request to the backend
            showNotification(`Request to join team ${parseInt(teamId)+1} sent!`, 'success');
        } catch (error) {
            showNotification('Failed to join team: ' + error.message, 'error');
            console.error('Join team error:', error);
        }
    }
    
    async function getProjectIdeas() {
        if (!currentHackathonId) {
            showNotification('Please create or select a hackathon first', 'warning');
            return;
        }
        
        try {
            showNotification('Generating project ideas...', 'info');
            getProjectIdeasBtn.disabled = true;
            
            const response = await fetch(`http://127.0.0.1:5000/api/hackathon/${currentHackathonId}/generate-ideas`);
            
            if (!response.ok) throw new Error('Server error');
            
            const ideas = await response.json();
            
            projectIdeasContainer.innerHTML = '';
            
            ideas.forEach((idea, index) => {
                const ideaEl = document.createElement('div');
                ideaEl.className = 'project-idea';
                ideaEl.innerHTML = `
                    <h4>Idea #${index + 1}</h4>
                    <p>${idea}</p>
                    <button class="btn btn-small select-idea" data-idea-id="${index}">Select Idea</button>
                `;
                projectIdeasContainer.appendChild(ideaEl);
            });
            
            // Add event listeners to select idea buttons
            document.querySelectorAll('.select-idea').forEach(btn => {
                btn.addEventListener('click', function() {
                    const ideaId = this.getAttribute('data-idea-id');
                    selectIdea(ideaId);
                });
            });
            
            showNotification('Project ideas generated!', 'success');
        } catch (error) {
            showNotification('Failed to get project ideas: ' + error.message, 'error');
            console.error('Get project ideas error:', error);
        } finally {
            getProjectIdeasBtn.disabled = false;
        }
    }
    
    async function selectIdea(ideaId) {
        try {
            // In a real app, this would send a request to the backend
            showNotification(`Project idea ${parseInt(ideaId)+1} selected!`, 'success');
        } catch (error) {
            showNotification('Failed to select idea: ' + error.message, 'error');
            console.error('Select idea error:', error);
        }
    }
    
    async function askMentor() {
        const question = mentorQuestionInput.value.trim();
        
        if (!question) {
            showNotification('Please enter a question', 'warning');
            return;
        }
        
        // Add user message to chat
        addMessageToChat(question, 'user');
        mentorQuestionInput.value = '';
        askMentorBtn.disabled = true;
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/mentor/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });
            
            if (!response.ok) throw new Error('Server error');
            
            const data = await response.json();
            
            // Simulate typing effect
            simulateTypingEffect(data.response, 'bot');
        } catch (error) {
            addMessageToChat("Sorry, I'm having trouble answering that right now. Please try again later.", 'bot');
            console.error('Ask mentor error:', error);
        } finally {
            askMentorBtn.disabled = false;
        }
    }
    
    function simulateTypingEffect(message, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;
        chatMessagesContainer.appendChild(messageEl);
        
        const p = document.createElement('p');
        messageEl.appendChild(p);
        
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < message.length) {
                p.textContent += message.charAt(i);
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 20);
    }
    
    async function reviewCode() {
        const code = codeInput.value.trim();
        
        if (!code) {
            showNotification('Please enter some code to review', 'warning');
            return;
        }
        
        try {
            showNotification('Reviewing your code...', 'info');
            reviewCodeBtn.disabled = true;
            
            const response = await fetch('http://127.0.0.1:5000/api/code/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            if (!response.ok) throw new Error('Server error');
            
            const review = await response.json();
            
            // Display errors
            codeErrorsList.innerHTML = '';
            if (review.errors && review.errors.length > 0) {
                review.errors.forEach(error => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>Line ${error.line}:</strong> ${error.message}`;
                    codeErrorsList.appendChild(li);
                });
            } else {
                codeErrorsList.innerHTML = '<li class="no-errors">No errors found! Great job!</li>';
            }
            
            // Display suggestions
            codeSuggestionsList.innerHTML = '';
            if (review.suggestions && review.suggestions.length > 0) {
                review.suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>Line ${suggestion.line}:</strong> ${suggestion.message}`;
                    codeSuggestionsList.appendChild(li);
                });
            } else {
                codeSuggestionsList.innerHTML = '<li class="no-suggestions">No suggestions for improvement. Perfect code!</li>';
            }
            
            // Display quality score
            const scorePercentage = (review.quality_score / 5) * 100;
            qualityScoreMeter.style.width = `${scorePercentage}%`;
            qualityScoreText.textContent = `${review.quality_score.toFixed(1)}/5`;
            
            // Set color based on score
            if (review.quality_score >= 4) {
                qualityScoreMeter.style.backgroundColor = '#28a745';
            } else if (review.quality_score >= 2.5) {
                qualityScoreMeter.style.backgroundColor = '#ffc107';
            } else {
                qualityScoreMeter.style.backgroundColor = '#dc3545';
            }
            
            showNotification('Code review completed!', 'success');
        } catch (error) {
            showNotification('Failed to review code: ' + error.message, 'error');
            console.error('Code review error:', error);
        } finally {
            reviewCodeBtn.disabled = false;
        }
    }
    
    // Helper Functions
    function addMessageToChat(message, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;
        
        const p = document.createElement('p');
        p.textContent = message;
        messageEl.appendChild(p);
        
        chatMessagesContainer.appendChild(messageEl);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Initialize date inputs with today's date
    document.getElementById('startDate').valueAsDate = new Date();
    document.getElementById('endDate').valueAsDate = new Date(new Date().setDate(new Date().getDate() + 7));
});

// Add this to your CSS:
/*
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transition: all 0.3s ease;
    max-width: 300px;
}

.notification.success {
    background-color: #28a745;
}

.notification.error {
    background-color: #dc3545;
}

.notification.warning {
    background-color: #ffc107;
    color: #212529;
}

.notification.info {
    background-color: #17a2b8;
}

.notification.fade-out {
    opacity: 0;
    transform: translateY(20px);
}

.no-results, .no-errors, .no-suggestions {
    color: #6c757d;
    font-style: italic;
}

.btn-small {
    padding: 6px 12px;
    font-size: 0.8rem;
    margin-top: 8px;
}

.team-member {
    display: inline-block;
    background-color: #f8f9fa;
    padding: 8px 12px;
    border-radius: 20px;
    margin: 4px;
    font-size: 0.9rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
*/