// Main app initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    document.getElementById('start-btn').addEventListener('click', startQuestionnaire);
    document.getElementById('prev-question-btn').addEventListener('click', showPrevQuestion);
    document.getElementById('next-question-btn').addEventListener('click', showNextQuestion);
    document.getElementById('roll-btn').addEventListener('click', rollDice);
    document.getElementById('roll-again-btn').addEventListener('click', resetToRollScreen);
    document.getElementById('like-btn').addEventListener('click', () => provideFeedback('like'));
    document.getElementById('dislike-btn').addEventListener('click', () => provideFeedback('dislike'));
    document.getElementById('view-prompt-btn').addEventListener('click', showPromptModal);
    
    // Set up modal close functionality
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePromptModal);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('prompt-modal');
        if (event.target === modal) {
            closePromptModal();
        }
    });

    // Load any saved user data
    loadUserData();
}

// Screen navigation
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the specified screen
    document.getElementById(screenId).classList.add('active');
}

// User data management
let userData = {
    answers: {},
    feedback: []
};

function loadUserData() {
    const savedData = localStorage.getItem('opGuyRainUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

function saveUserData() {
    localStorage.setItem('opGuyRainUserData', JSON.stringify(userData));
}

// Questionnaire functionality
const ikigaiQuestions = [
    {
        id: 'passion',
        text: 'What activities make you lose track of time because you enjoy them so much?'
    },
    {
        id: 'mission',
        text: 'What causes or issues in the world do you care deeply about?'
    },
    {
        id: 'vocation',
        text: 'What skills or talents do you have that you\'re proud of or that others value?'
    },
    {
        id: 'profession',
        text: 'What activities would you be willing to do even if you weren\'t paid for them?'
    },
    {
        id: 'values',
        text: 'What personal values are most important to you in how you spend your time?'
    }
];

let currentQuestionIndex = 0;

function startQuestionnaire() {
    currentQuestionIndex = 0;
    renderCurrentQuestion();
    showScreen('questionnaire-screen');
}

function renderCurrentQuestion() {
    const question = ikigaiQuestions[currentQuestionIndex];
    const container = document.getElementById('question-container');
    
    container.innerHTML = `
        <div class="question" data-id="${question.id}">
            <p class="question-text">${question.text}</p>
            <textarea 
                id="answer-${question.id}" 
                placeholder="Your answer..."
            >${userData.answers[question.id] || ''}</textarea>
        </div>
        <div class="question-progress">
            Question ${currentQuestionIndex + 1} of ${ikigaiQuestions.length}
        </div>
    `;

    // Update navigation buttons
    document.getElementById('prev-question-btn').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === ikigaiQuestions.length - 1) {
        document.getElementById('next-question-btn').textContent = 'Finish';
    } else {
        document.getElementById('next-question-btn').textContent = 'Next';
    }
}

function saveCurrentAnswer() {
    const question = ikigaiQuestions[currentQuestionIndex];
    const answerTextarea = document.getElementById(`answer-${question.id}`);
    
    if (answerTextarea) {
        userData.answers[question.id] = answerTextarea.value.trim();
        saveUserData();
    }
}

function showNextQuestion() {
    saveCurrentAnswer();
    
    if (currentQuestionIndex < ikigaiQuestions.length - 1) {
        currentQuestionIndex++;
        renderCurrentQuestion();
    } else {
        // Last question completed, move to dice screen
        showScreen('dice-screen');
    }
}

function showPrevQuestion() {
    saveCurrentAnswer();
    
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderCurrentQuestion();
    }
}

// Dice functionality
function rollDice() {
    const dice = document.getElementById('dice');
    const rollBtn = document.getElementById('roll-btn');
    
    // Disable the button during animation
    rollBtn.disabled = true;
    
    // Generate a random number between 1 and 6
    const randomNumber = Math.floor(Math.random() * 6) + 1;
    
    // Set random rotation for the dice
    const xRand = Math.floor(Math.random() * 5) + 1;
    const yRand = Math.floor(Math.random() * 5) + 1;
    
    // Update the dice face
    dice.querySelector('.dice-face').textContent = randomNumber;
    
    // Animate the dice rolling
    dice.style.transform = `rotateX(${xRand}turn) rotateY(${yRand}turn)`;
    
    // After animation completes, get AI suggestion
    setTimeout(() => {
        getAISuggestion(randomNumber);
        rollBtn.disabled = false;
    }, 1000);
}

// AI integration
let currentPrompt = '';  // Variable to store the current prompt

async function getAISuggestion(diceValue) {
    try {
        // Show loading state
        showScreen('result-screen');
        document.getElementById('suggestion-container').innerHTML = `
            <p>Generating your personalized suggestion...</p>
            <div class="loading-spinner"></div>
        `;
        
        // Prepare the prompt based on user's answers
        currentPrompt = prepareAIPrompt(diceValue);
        
        // In a real implementation, you would make an API call to OpenAI or similar
        // For this MVP, we'll simulate a response
        const suggestion = await simulateAIResponse(currentPrompt);
        
        // Generate a call to action header from the suggestion
        const callToAction = generateCallToAction(suggestion);
        
        // Update the result screen heading
        document.querySelector('#result-screen h2').textContent = callToAction;
        
        // Display the result
        document.getElementById('suggestion-container').innerHTML = `
            <p class="suggestion-text">${suggestion}</p>
        `;
    } catch (error) {
        console.error('Error getting AI suggestion:', error);
        document.getElementById('suggestion-container').innerHTML = `
            <p>Sorry, we couldn't generate a suggestion right now. Please try again.</p>
        `;
    }
}

function prepareAIPrompt(diceValue) {
    // Create a prompt for the AI based on the user's Ikigai answers and dice value
    
    let prompt = `Based on the following values, suggest a meaningful activity:
    
    Values: ${userData.answers.values || ''}
    Passion: ${userData.answers.passion || ''}
    Mission: ${userData.answers.mission || ''}
    Vocation: ${userData.answers.vocation || ''}
    Profession: ${userData.answers.profession || ''}
    
    REQUIREMENTS:
    1. Suggest a SPECIFIC, IMMEDIATELY ACTIONABLE activity that can be started RIGHT NOW
    2. The activity should have ZERO OBSTACLES - require no special resources, preparation, or equipment
    3. Focus on activities with HIGH FOLLOW-THROUGH POTENTIAL - simple, clear first steps that create momentum
    4. Include a specific timeframe (e.g., "spend 20 minutes on..." rather than vague durations)
    5. Explain briefly why this activity aligns with the person's values and how it will benefit them
    
    Format your response as a clear instruction followed by 1-2 sentences explaining the value alignment.`;
    
    return prompt;
}

// This function simulates an AI API call for the MVP
// In production, you would replace this with an actual API call to OpenAI, etc.
function simulateAIResponse(prompt) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // These are pre-written responses that would normally come from the AI
            const simulatedResponses = [
                "Take 15 minutes right now to write down three specific ways you could apply your technical skills to help a cause you care about. This simple brainstorming exercise connects your professional talents with your mission values, creating a bridge between what you're good at and what matters to you.",
                
                "Set a timer for 30 minutes right now and work on that creative project you've been thinking about. Silence notifications, focus completely, and just start. This dedicated time honors your passion for creative expression while providing the structure to overcome initial resistance.",
                
                "Open your browser now and spend 20 minutes researching one local organization aligned with your values and identify a specific way you could contribute. This leverages your desire to make an impact in your community while providing a concrete first step toward meaningful involvement.",
                
                "Grab the nearest book related to your field and read just one chapter (about 15 minutes). This small commitment makes learning manageable while honoring your value of continuous growth in your professional domain.",
                
                "Pick up your phone now and message one person in your network to share something you've learned recently. This quick connection exercise aligns with your value of knowledge-sharing and community building, creating a simple moment of meaningful engagement.",
                
                "Clear your desk for 10 minutes right now and write down your three most important tasks for tomorrow in order of priority. This brief organization session respects your value of intentionality and creates momentum for productive work aligned with your priorities."
            ];
            
            // Choose a response based on the dice value
            const responseIndex = Math.min(simulatedResponses.length - 1, Math.floor(Math.random() * simulatedResponses.length));
            resolve(simulatedResponses[responseIndex]);
        }, 1500);
    });
}

// Generate a call to action header from the suggestion
function generateCallToAction(suggestion) {
    // Extract the first sentence for analysis
    const firstSentence = suggestion.split('.')[0];
    let callToAction = "";
    
    // Pattern matching to identify the core activity
    if (firstSentence.match(/write down three|list three|identify three|brainstorm/i)) {
        callToAction = "Brainstorm 3 Problems to Solve";
    } 
    else if (firstSentence.match(/set a timer for (\d+) minutes.*creative project/i)) {
        const minutes = firstSentence.match(/set a timer for (\d+) minutes/i)[1];
        callToAction = `${minutes}-Minute Creative Focus`;
    }
    else if (firstSentence.match(/research.*organization/i)) {
        callToAction = "Research 1 Organization to Help";
    }
    else if (firstSentence.match(/read.*chapter|read.*book/i)) {
        callToAction = "Read One Chapter";
    }
    else if (firstSentence.match(/message|text|contact|connect with/i)) {
        callToAction = "Share Knowledge with 1 Person";
    }
    else if (firstSentence.match(/clear your desk|organize|write down.*tasks/i)) {
        callToAction = "Prioritize Tomorrow's Tasks";
    }
    else {
        // Fallback: Create a simple imperative statement
        // Extract the main verb and object
        const words = firstSentence.split(' ');
        const verb = words[0].replace(/e$/, '') + 'e'; // Normalize verb form
        
        // Find key objects in the sentence (typically after "to" or after timing info)
        let object = "";
        const toIndex = firstSentence.indexOf(' to ');
        if (toIndex !== -1) {
            object = firstSentence.substring(toIndex + 4, toIndex + 30)
                .split(' ')
                .slice(0, 4)
                .join(' ');
        } else {
            // Look for object after time references
            const timeMatch = firstSentence.match(/(\d+) minutes/);
            if (timeMatch) {
                const timeIndex = firstSentence.indexOf(timeMatch[0]) + timeMatch[0].length;
                object = firstSentence.substring(timeIndex, timeIndex + 30)
                    .split(' ')
                    .slice(1, 5) // Skip leading words
                    .join(' ');
            }
        }
        
        // Create concise call to action
        if (object) {
            const capitalizedVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
            callToAction = `${capitalizedVerb} ${object.replace(/\s+(and|the|a|an|to)\s+/gi, ' ')}`.trim();
        } else {
            // If we couldn't extract a good object, use a simplistic approach
            callToAction = firstSentence
                .replace(/^(take|spend|set|open|grab|pick up|clear|right now|now)/i, '')
                .replace(/\s+(right now|now|just|simply)\s+/gi, ' ')
                .trim()
                .split(' ')
                .slice(0, 4)
                .join(' ');
        }
    }
    
    // Ensure it ends with an exclamation mark for emphasis
    if (!callToAction.endsWith('!')) {
        callToAction += '!';
    }
    
    // Keep it concise
    if (callToAction.length > 35) {
        const breakPoint = callToAction.lastIndexOf(' ', 32);
        callToAction = callToAction.substring(0, breakPoint > 0 ? breakPoint : 32) + '...';
    }
    
    return callToAction;
}

// Feedback functionality
function provideFeedback(type) {
    // Save the feedback
    userData.feedback.push({
        type: type,
        timestamp: new Date().toISOString(),
        suggestion: document.querySelector('.suggestion-text')?.textContent || ''
    });
    
    saveUserData();
    
    // Show feedback received message
    const feedbackButtons = document.querySelector('.feedback-buttons');
    feedbackButtons.innerHTML = '<p>Thanks for your feedback!</p>';
}

// Reset flow
function resetToRollScreen() {
    // Reset the result screen heading back to default for next time
    document.querySelector('#result-screen h2').textContent = "Your Suggestion";
    
    // Show the dice screen
    showScreen('dice-screen');
}

// Modal functionality for showing the prompt
function showPromptModal() {
    const modal = document.getElementById('prompt-modal');
    const promptText = document.getElementById('prompt-text');
    
    // Format the prompt with nice indentation
    promptText.textContent = currentPrompt;
    
    // Show the modal
    modal.style.display = 'block';
}

function closePromptModal() {
    const modal = document.getElementById('prompt-modal');
    modal.style.display = 'none';
} 