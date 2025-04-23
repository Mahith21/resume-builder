// Form navigation
let currentStep = 1;
const totalSteps = 5;

// DOM Elements
const form = document.getElementById('resumeForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Template data
const templates = [
    {
        id: 'modern',
        name: 'Modern Template',
        preview: 'modern-preview.png',
        class: 'template-modern'
    },
    {
        id: 'classic',
        name: 'Classic Template',
        preview: 'classic-preview.png',
        class: 'template-classic'
    },
    {
        id: 'minimal',
        name: 'Minimal Template',
        preview: 'minimal-preview.png',
        class: 'template-minimal'
    }
];

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    updateFormNavigation();
    initializeFormListeners();
    initializeTemplates();
});

// Form navigation functions
function updateFormNavigation() {
    // Show/hide form sections
    document.querySelectorAll('.form-section').forEach((section, index) => {
        section.classList.toggle('d-none', index + 1 !== currentStep);
    });

    // Update button states
    prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
    submitBtn.classList.toggle('d-none', currentStep !== totalSteps);
}

function initializeFormListeners() {
    // Previous button click
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateFormNavigation();
        }
    });

    // Next button click
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateFormNavigation();
            }
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
            showTemplateSelection();
        }
    });

    // Add more education entry
    document.getElementById('addEducation').addEventListener('click', () => {
        const container = document.getElementById('educationContainer');
        const template = container.querySelector('.education-entry').cloneNode(true);
        
        // Clear the inputs
        template.querySelectorAll('input').forEach(input => input.value = '');
        container.appendChild(template);
    });

    // Add more experience entry
    document.getElementById('addExperience').addEventListener('click', () => {
        const container = document.getElementById('experienceContainer');
        const template = container.querySelector('.experience-entry').cloneNode(true);
        
        // Clear the inputs
        template.querySelectorAll('input, textarea').forEach(input => input.value = '');
        container.appendChild(template);
    });
}

function validateCurrentStep() {
    const currentSection = document.querySelector(`#step${currentStep}`);
    const requiredFields = currentSection.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Template selection and preview
function initializeTemplates() {
    const container = document.getElementById('templateContainer');
    
    templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'col-md-4 mb-3';
        templateCard.innerHTML = `
            <div class="card template-card" data-template="${template.id}">
                <img src="images/${template.preview}" class="card-img-top" alt="${template.name}">
                <div class="card-body">
                    <h5 class="card-title">${template.name}</h5>
                </div>
            </div>
        `;
        
        templateCard.querySelector('.template-card').addEventListener('click', () => {
            selectTemplate(template);
        });
        
        container.appendChild(templateCard);
    });
}

function showTemplateSelection() {
    const templateModal = new bootstrap.Modal(document.getElementById('templateModal'));
    templateModal.show();
}

function selectTemplate(template) {
    // Remove selection from all templates
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked template
    document.querySelector(`[data-template="${template.id}"]`).classList.add('selected');
    
    // Generate resume preview
    generateResume(template);
}

// Resume generation
function generateResume(template) {
    const formData = collectFormData();
    const resumeHTML = generateResumeHTML(formData, template);
    
    document.getElementById('resumePreview').innerHTML = resumeHTML;
    
    // Hide template modal and show preview modal
    bootstrap.Modal.getInstance(document.getElementById('templateModal')).hide();
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    previewModal.show();
    
    // Initialize download button
    document.getElementById('downloadBtn').onclick = () => downloadResume(formData.fullName);
}

function collectFormData() {
    return {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        objective: document.getElementById('objective').value,
        education: Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
            degree: entry.querySelector('.degree').value,
            institution: entry.querySelector('.institution').value,
            yearStart: entry.querySelector('.year-start').value,
            yearEnd: entry.querySelector('.year-end').value
        })),
        experience: Array.from(document.querySelectorAll('.experience-entry')).map(entry => ({
            company: entry.querySelector('.company').value,
            position: entry.querySelector('.position').value,
            responsibilities: entry.querySelector('.responsibilities').value,
            startDate: entry.querySelector('.exp-start').value,
            endDate: entry.querySelector('.exp-end').value
        })),
        skills: document.getElementById('skills').value.split(',').map(skill => skill.trim())
    };
}

function generateResumeHTML(data, template) {
    return `
        <div class="resume-template ${template.class}">
            <div class="header">
                <h1>${data.fullName}</h1>
                <p>${data.email} | ${data.phone}</p>
                ${data.address ? `<p>${data.address}</p>` : ''}
                <p>
                    ${data.linkedin ? `<a href="${data.linkedin}" target="_blank">LinkedIn</a>` : ''}
                    ${data.github ? ` | <a href="${data.github}" target="_blank">GitHub</a>` : ''}
                </p>
            </div>

            <div class="section">
                <h2>Career Objective</h2>
                <p>${data.objective}</p>
            </div>

            <div class="section">
                <h2>Education</h2>
                ${data.education.map(edu => `
                    <div class="education-item">
                        <h3>${edu.degree}</h3>
                        <p>${edu.institution}</p>
                        <p>${edu.yearStart} - ${edu.yearEnd}</p>
                    </div>
                `).join('')}
            </div>

            ${data.experience.length > 0 ? `
                <div class="section">
                    <h2>Work Experience</h2>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <h3>${exp.position}</h3>
                            <p>${exp.company}</p>
                            <p>${exp.startDate} - ${exp.endDate}</p>
                            <p>${exp.responsibilities}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="section">
                <h2>Skills</h2>
                <p>${data.skills.join(', ')}</p>
            </div>
        </div>
    `;
}

// PDF Generation and Download
function downloadResume(name) {
    const element = document.getElementById('resumePreview');
    const options = {
        margin: 1,
        filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Show loading state
    const downloadBtn = document.getElementById('downloadBtn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating PDF...';
    downloadBtn.disabled = true;

    html2pdf().set(options).from(element).save()
        .then(() => {
            // Restore button state
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        });
} 
