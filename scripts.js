// Configuration
const API_BASE_URL = 'http://localhost:8000';

// Global variables
let currentProjectData = null;
let isLoading = false;
let parsedTaskTree = null; // Store parsed data for editing

// DOM elements
const projectInput = document.getElementById('projectInput');
const taskTree = document.getElementById('taskTree');
const loadingIndicator = document.getElementById('loadingIndicator');
const refinementSection = document.getElementById('refinementSection');
const refinementInput = document.getElementById('refinementInput');

// Main analyze function
async function analyzeProject() {
    const description = projectInput.value.trim();
    
    if (!description) {
        showError('Please enter a project description first! 📝');
        return;
    }

    if (isLoading) return;

    try {
        setLoadingState(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.task_tree) {
            displayTaskTree(result.task_tree);
            currentProjectData = result;
            showRefinementSection();
        } else {
            throw new Error('No task tree received from server');
        }

    } catch (error) {
        console.error('Error analyzing project:', error);
        showError('Oops! Something went wrong. Please try again. 🤖💔');
    } finally {
        setLoadingState(false);
    }
}

// Display the task tree
function displayTaskTree(taskTreeData) {
    try {
        let parsedData;
        
        // Try to parse if it's a string
        if (typeof taskTreeData === 'string') {
            // Clean up common JSON parsing issues
            let cleanedData = taskTreeData
                .replace(/\\'/g, "'")  // Fix escaped quotes
                .replace(/\\\\/g, "\\"); // Fix double backslashes
            
            parsedData = JSON.parse(cleanedData);
        } else {
            parsedData = taskTreeData;
        }

        if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
            throw new Error('Invalid task tree structure');
        }

        const html = generateTaskTreeHTML(parsedData.sections);
        taskTree.innerHTML = html;
        
        // Store parsed data for editing
        parsedTaskTree = parsedData;
        
        // Add click handlers for collapsible sections
        addCollapsibleHandlers();

    } catch (error) {
        console.error('Error displaying task tree:', error);
        console.error('Raw data:', taskTreeData);
        showError('Error displaying the project plan. Please try again. 📊❌');
    }
}

// Generate HTML for task tree
function generateTaskTreeHTML(sections) {
    const sectionEmojis = ['🎯', '🏗️', '🎨', '🔧', '🚀', '📱', '⚙️', '🎭', '🔍', '💡'];
    
    return sections.map((section, sectionIndex) => `
        <div class="section" data-section-index="${sectionIndex}">
            <div class="section-header" onclick="toggleSection(this)">
                <h3>
                    <span class="toggle-icon">▼</span>
                    ${sectionEmojis[sectionIndex % sectionEmojis.length]} 
                    <span class="editable-title" onclick="editSectionTitle(event, ${sectionIndex})">${escapeHtml(section.title)}</span>
                </h3>
                <p class="section-description">
                    <span class="editable-description" onclick="editSectionDescription(event, ${sectionIndex})">${escapeHtml(section.description)}</span>
                </p>
                <div class="section-actions">
                    <button class="action-btn edit-btn" onclick="editSection(event, ${sectionIndex})" title="Edit Section">✏️</button>
                    <button class="action-btn delete-btn" onclick="deleteSection(event, ${sectionIndex})" title="Delete Section">🗑️</button>
                </div>
            </div>
            <div class="section-content">
                ${section.subsections ? section.subsections.map((sub, subIndex) => `
                    <div class="subsection" data-subsection-index="${subIndex}">
                        <h4>
                            <span class="subsection-emoji">✨</span>
                            <span class="editable-title" onclick="editSubsectionTitle(event, ${sectionIndex}, ${subIndex})">${escapeHtml(sub.title)}</span>
                        </h4>
                        <p class="editable-description" onclick="editSubsectionDescription(event, ${sectionIndex}, ${subIndex})">${escapeHtml(sub.description)}</p>
                        <div class="subsection-actions">
                            <button class="action-btn edit-btn" onclick="editSubsection(event, ${sectionIndex}, ${subIndex})" title="Edit Task">✏️</button>
                            <button class="action-btn delete-btn" onclick="deleteSubsection(event, ${sectionIndex}, ${subIndex})" title="Delete Task">🗑️</button>
                        </div>
                    </div>
                `).join('') : ''}
                <div class="add-task-section">
                    <button class="add-task-btn" onclick="addNewSubsection(${sectionIndex})">
                        ➕ Add New Task
                    </button>
                </div>
            </div>
        </div>
    `).join('') + `
        <div class="add-section-wrapper">
            <button class="add-section-btn" onclick="addNewSection()">
                ➕ Add New Section
            </button>
        </div>
    `;
}

// Refinement functions
async function refineProject() {
    const refinementText = refinementInput.value.trim();
    
    if (!refinementText) {
        showError('Please describe what you\'d like to refine! ✏️');
        return;
    }

    if (!currentProjectData) {
        showError('No project data to refine. Please analyze a project first! 📋');
        return;
    }

    const originalDescription = projectInput.value.trim();
    const refinedDescription = `${originalDescription}\n\nRefinement request: ${refinementText}`;
    
    await makeRefinementRequest(refinedDescription);
}

async function addMoreTasks() {
    if (!currentProjectData) return;
    
    const originalDescription = projectInput.value.trim();
    const refinedDescription = `${originalDescription}\n\nRefinement request: Add more detailed tasks and break down existing tasks into smaller, more manageable subtasks.`;
    
    await makeRefinementRequest(refinedDescription);
}

async function simplifyPlan() {
    if (!currentProjectData) return;
    
    const originalDescription = projectInput.value.trim();
    const refinedDescription = `${originalDescription}\n\nRefinement request: Simplify the project plan by reducing complexity and focusing on the most essential tasks only.`;
    
    await makeRefinementRequest(refinedDescription);
}

async function addTimeline() {
    if (!currentProjectData) return;
    
    const originalDescription = projectInput.value.trim();
    const refinedDescription = `${originalDescription}\n\nRefinement request: Add estimated timelines and durations for each task and phase of the project.`;
    
    await makeRefinementRequest(refinedDescription);
}

// Generic refinement request function
async function makeRefinementRequest(description) {
    if (isLoading) return;

    try {
        setLoadingState(true);
        hideError();
        
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.task_tree) {
            displayTaskTree(result.task_tree);
            currentProjectData = result;
            refinementInput.value = ''; // Clear refinement input
        } else {
            throw new Error('No task tree received from server');
        }

    } catch (error) {
        console.error('Error refining project:', error);
        showError('Failed to refine the project plan. Please try again. 🔄❌');
    } finally {
        setLoadingState(false);
    }
}

// UI helper functions
function setLoadingState(loading) {
    isLoading = loading;
    loadingIndicator.style.display = loading ? 'flex' : 'none';
    
    const analyzeBtn = document.querySelector('.analyze-btn');
    const refineBtn = document.querySelector('.refine-btn');
    
    if (analyzeBtn) {
        analyzeBtn.disabled = loading;
        analyzeBtn.textContent = loading ? '🤖 Analyzing...' : '🔍 Analyze & Plan Project';
    }
    
    if (refineBtn) {
        refineBtn.disabled = loading;
        refineBtn.textContent = loading ? '🤖 Refining...' : '✨ Refine Plan';
    }
}

function showRefinementSection() {
    refinementSection.style.display = 'block';
    refinementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    const errorEmojis = ['😅', '🤖', '💭', '🔄', '✨'];
    const randomEmoji = errorEmojis[Math.floor(Math.random() * errorEmojis.length)];
    
    taskTree.innerHTML = `
        <div class="error-state">
            <div class="error-icon">${randomEmoji}</div>
            <div class="error-message">${message}</div>
        </div>
    `;
}

function hideError() {
    const errorState = taskTree.querySelector('.error-state');
    if (errorState) {
        taskTree.innerHTML = `
            <div class="empty-state">
                🎯 Enter your project description above and click "Analyze & Plan Project" to get started!
            </div>
        `;
    }
}

// Collapsible sections
function toggleSection(header) {
    const section = header.parentElement;
    const content = section.querySelector('.section-content');
    const icon = header.querySelector('.toggle-icon');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.textContent = '▼';
        section.classList.add('expanded');
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
        section.classList.remove('expanded');
    }
}

function addCollapsibleHandlers() {
    // All sections start expanded by default
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const content = section.querySelector('.section-content');
        const icon = section.querySelector('.toggle-icon');
        
        content.style.display = 'block';
        icon.textContent = '▼';
        section.classList.add('expanded');
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to analyze
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (document.activeElement === projectInput) {
            analyzeProject();
        } else if (document.activeElement === refinementInput) {
            refineProject();
        }
    }
});

// Auto-resize textareas
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Edit functionality
function editSectionTitle(event, sectionIndex) {
    event.stopPropagation();
    const titleElement = event.target;
    const currentTitle = titleElement.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'inline-edit-input';
    
    titleElement.parentNode.replaceChild(input, titleElement);
    input.focus();
    input.select();
    
    const saveEdit = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            parsedTaskTree.sections[sectionIndex].title = newTitle;
            updateTaskTreeDisplay();
        } else {
            // Restore original
            const span = document.createElement('span');
            span.className = 'editable-title';
            span.textContent = currentTitle;
            span.onclick = (e) => editSectionTitle(e, sectionIndex);
            input.parentNode.replaceChild(span, input);
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

function editSectionDescription(event, sectionIndex) {
    event.stopPropagation();
    const descElement = event.target;
    const currentDesc = descElement.textContent;
    
    const textarea = document.createElement('textarea');
    textarea.value = currentDesc;
    textarea.className = 'inline-edit-textarea';
    textarea.rows = 2;
    
    descElement.parentNode.replaceChild(textarea, descElement);
    textarea.focus();
    textarea.select();
    
    const saveEdit = () => {
        const newDesc = textarea.value.trim();
        if (newDesc && newDesc !== currentDesc) {
            parsedTaskTree.sections[sectionIndex].description = newDesc;
            updateTaskTreeDisplay();
        } else {
            // Restore original
            const span = document.createElement('span');
            span.className = 'editable-description';
            span.textContent = currentDesc;
            span.onclick = (e) => editSectionDescription(e, sectionIndex);
            textarea.parentNode.replaceChild(span, textarea);
        }
    };
    
    textarea.addEventListener('blur', saveEdit);
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            // Allow line breaks with Shift+Enter
            return;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        }
    });
}

function editSubsectionTitle(event, sectionIndex, subIndex) {
    event.stopPropagation();
    const titleElement = event.target;
    const currentTitle = titleElement.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'inline-edit-input';
    
    titleElement.parentNode.replaceChild(input, titleElement);
    input.focus();
    input.select();
    
    const saveEdit = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            parsedTaskTree.sections[sectionIndex].subsections[subIndex].title = newTitle;
            updateTaskTreeDisplay();
        } else {
            // Restore original
            const span = document.createElement('span');
            span.className = 'editable-title';
            span.textContent = currentTitle;
            span.onclick = (e) => editSubsectionTitle(e, sectionIndex, subIndex);
            input.parentNode.replaceChild(span, input);
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

function editSubsectionDescription(event, sectionIndex, subIndex) {
    event.stopPropagation();
    const descElement = event.target;
    const currentDesc = descElement.textContent;
    
    const textarea = document.createElement('textarea');
    textarea.value = currentDesc;
    textarea.className = 'inline-edit-textarea';
    textarea.rows = 2;
    
    descElement.parentNode.replaceChild(textarea, descElement);
    textarea.focus();
    textarea.select();
    
    const saveEdit = () => {
        const newDesc = textarea.value.trim();
        if (newDesc && newDesc !== currentDesc) {
            parsedTaskTree.sections[sectionIndex].subsections[subIndex].description = newDesc;
            updateTaskTreeDisplay();
        } else {
            // Restore original
            const span = document.createElement('span');
            span.className = 'editable-description';
            span.textContent = currentDesc;
            span.onclick = (e) => editSubsectionDescription(e, sectionIndex, subIndex);
            textarea.parentNode.replaceChild(span, textarea);
        }
    };
    
    textarea.addEventListener('blur', saveEdit);
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            return;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        }
    });
}

// Delete functionality
function deleteSection(event, sectionIndex) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this entire section? 🗑️')) {
        parsedTaskTree.sections.splice(sectionIndex, 1);
        updateTaskTreeDisplay();
    }
}

function deleteSubsection(event, sectionIndex, subIndex) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this task? 🗑️')) {
        parsedTaskTree.sections[sectionIndex].subsections.splice(subIndex, 1);
        updateTaskTreeDisplay();
    }
}

// Add functionality
function addNewSection() {
    const title = prompt('Enter the section title: 📝');
    if (title && title.trim()) {
        const description = prompt('Enter the section description: 📄') || '';
        
        const newSection = {
            title: title.trim(),
            description: description.trim(),
            subsections: []
        };
        
        parsedTaskTree.sections.push(newSection);
        updateTaskTreeDisplay();
    }
}

function addNewSubsection(sectionIndex) {
    const title = prompt('Enter the task title: ✨');
    if (title && title.trim()) {
        const description = prompt('Enter the task description: 📝') || '';
        
        const newSubsection = {
            title: title.trim(),
            description: description.trim()
        };
        
        if (!parsedTaskTree.sections[sectionIndex].subsections) {
            parsedTaskTree.sections[sectionIndex].subsections = [];
        }
        
        parsedTaskTree.sections[sectionIndex].subsections.push(newSubsection);
        updateTaskTreeDisplay();
    }
}

// Update display after edits
function updateTaskTreeDisplay() {
    const html = generateTaskTreeHTML(parsedTaskTree.sections);
    taskTree.innerHTML = html;
    addCollapsibleHandlers();
}

// Initialize textarea auto-resize
document.addEventListener('DOMContentLoaded', function() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        
        // Set initial height
        autoResizeTextarea(textarea);
    });
});

// Add some helpful placeholder cycling
const placeholders = [
    "🏃‍♂️ Build a mobile app for tracking daily habits and workouts...",
    "✍️ Create a personal blog website with modern design and CMS...",
    "🛒 Develop a small e-commerce store for handmade crafts...",
    "📋 Build a task management system for small teams...",
    "🎨 Create a portfolio website to showcase my creative work...",
    "📦 Develop a simple inventory management system...",
    "🍕 Build a restaurant ordering system with online payments...",
    "📚 Create an online learning platform with video courses...",
    "🏠 Develop a real estate listing website with search filters...",
    "🎵 Build a music streaming app with playlist features..."
];

let placeholderIndex = 0;
setInterval(() => {
    if (projectInput && !projectInput.value && document.activeElement !== projectInput) {
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        projectInput.placeholder = placeholders[placeholderIndex];
    }
}, 4000);