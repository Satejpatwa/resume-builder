// Initial Render & Auto-Load
document.addEventListener('DOMContentLoaded', () => {
    loadState(); // Auto-load data from localStorage
    setupThemeListeners();
    setupStorageListeners();
});

// Auto-Save on every input
document.getElementById('resumeForm').addEventListener('input', () => {
    updatePreview();
    saveState();
});

function setupStorageListeners() {
    // Export Button Logic
    document.getElementById('exportJsonBtn').addEventListener('click', () => {
        const data = collectFormData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "resume_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // Import Button Logic
    document.getElementById('importJsonInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                populateForm(importedData);
            } catch (err) {
                alert('Invalid JSON file');
                console.error(err);
            }
        };
        reader.readAsText(file);
    });
}

function saveState() {
    const data = collectFormData();
    localStorage.setItem('resumeDraft', JSON.stringify(data));
    const status = document.getElementById('save-status');
    if (status) {
        status.textContent = 'Saved locally';
        setTimeout(() => status.textContent = '', 2000);
    }
}

function loadState() {
    const saved = localStorage.getItem('resumeDraft');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            populateForm(data);
        } catch (e) {
            console.error("Could not load draft", e);
        }
    } else {
        updatePreview(); // Just render empty/placeholders
    }
}

// Helper to fill form from JSON object
function populateForm(data) {
    // Clear dynamic sections first (except the inputs that might be there by default if we reload? no, clean slate is better)
    document.getElementById('education-group').innerHTML = '<h2>Education</h2><button type="button" class="add-btn" onclick="addEducation()">+ Add Education</button>';
    document.getElementById('experience-group').innerHTML = '<h2>Experience</h2><button type="button" class="add-btn" onclick="addExperience()">+ Add Experience</button>';
    document.getElementById('projects-group').innerHTML = '<h2>Projects</h2><button type="button" class="add-btn" onclick="addProject()">+ Add Project</button>';
    document.getElementById('certifications-group').innerHTML = '<h2>Certifications</h2><button type="button" class="add-btn" onclick="addCertification()">+ Add Certification</button>';
    document.getElementById('languages-group').innerHTML = '<h2>Languages</h2><button type="button" class="add-btn" onclick="addLanguage()">+ Add Language</button>';

    // Set simple fields
    const form = document.getElementById('resumeForm');
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && form.elements[key]) {
            form.elements[key].value = value;
        }
    }

    // Rebuild lists
    if (data.education) data.education.forEach(item => {
        addEducation();
        const last = document.querySelector('.education-entry:last-of-type');
        last.querySelector('.edu-degree').value = item.degree;
        last.querySelector('.edu-school').value = item.institution;
        last.querySelector('.edu-year').value = item.year;
    });

    if (data.experience) data.experience.forEach(item => {
        addExperience();
        const last = document.querySelector('.experience-entry:last-of-type');
        last.querySelector('.exp-title').value = item.jobTitle;
        last.querySelector('.exp-company').value = item.company;
        last.querySelector('.exp-duration').value = item.duration;
        last.querySelector('.exp-desc').value = item.responsibilities;
    });

    if (data.projects) data.projects.forEach(item => {
        addProject();
        const last = document.querySelector('.project-entry:last-of-type');
        last.querySelector('.proj-name').value = item.name;
        last.querySelector('.proj-stack').value = item.techStack;
        last.querySelector('.proj-desc').value = item.description;
    });

    if (data.certifications) data.certifications.forEach(item => {
        addCertification();
        const last = document.querySelector('.cert-entry:last-of-type');
        last.querySelector('.cert-name').value = item.name;
        last.querySelector('.cert-issuer').value = item.issuer;
        last.querySelector('.cert-year').value = item.year;
    });

    if (data.languages) data.languages.forEach(item => {
        addLanguage();
        const last = document.querySelector('.lang-entry:last-of-type');
        last.querySelector('.lang-name').value = item.name;
        last.querySelector('.lang-level').value = item.level;
    });

    updatePreview();
}


// Theme Customization Listeners
function setupThemeListeners() {
    const colorInput = document.getElementById('accentColor');
    const sizeInput = document.getElementById('fontSize');

    colorInput.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--resume-accent', e.target.value);
    });

    sizeInput.addEventListener('input', (e) => {
        const size = e.target.value + 'pt';
        document.querySelector('.resume-paper').style.fontSize = size;
        // Adjust header scale slightly with base size
        document.documentElement.style.setProperty('--resume-base-scale', e.target.value / 10.5);
    });
}

// Dynamic Fields
function addEducation() {
    const container = document.getElementById('education-group');
    const div = document.createElement('div');
    div.className = 'entry education-entry';
    div.innerHTML = `
        <input type="text" placeholder="Degree" class="edu-degree">
        <input type="text" placeholder="Institution" class="edu-school">
        <input type="text" placeholder="Year" class="edu-year">
    `;
    // Insert before the button
    container.insertBefore(div, container.lastElementChild);
}

function addExperience() {
    const container = document.getElementById('experience-group');
    const div = document.createElement('div');
    div.className = 'entry experience-entry';
    div.innerHTML = `
        <input type="text" placeholder="Job Title" class="exp-title">
        <input type="text" placeholder="Company" class="exp-company">
        <input type="text" placeholder="Duration" class="exp-duration">
        <textarea placeholder="Responsibilities (Unordered list/New lines)" class="exp-desc" rows="3"></textarea>
    `;
    container.insertBefore(div, container.lastElementChild);
}

function addProject() {
    const container = document.getElementById('projects-group');
    const div = document.createElement('div');
    div.className = 'entry project-entry';
    div.innerHTML = `
        <input type="text" placeholder="Project Name" class="proj-name">
        <input type="text" placeholder="Tech Stack" class="proj-stack">
        <textarea placeholder="Description" class="proj-desc" rows="2"></textarea>
    `;
    container.insertBefore(div, container.lastElementChild);
}

function addCertification() {
    const container = document.getElementById('certifications-group');
    const div = document.createElement('div');
    div.className = 'entry cert-entry';
    div.innerHTML = `
        <input type="text" placeholder="Certification Name" class="cert-name">
        <input type="text" placeholder="Issuer" class="cert-issuer">
        <input type="text" placeholder="Year" class="cert-year">
    `;
    container.insertBefore(div, container.lastElementChild);
}

function addLanguage() {
    const container = document.getElementById('languages-group');
    const div = document.createElement('div');
    div.className = 'entry lang-entry';
    div.innerHTML = `
        <input type="text" placeholder="Language" class="lang-name">
        <select class="lang-level">
            <option value="Native">Native</option>
            <option value="Fluent">Fluent</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
        </select>
    `;
    container.insertBefore(div, container.lastElementChild);
}

// Reusable data collector
function collectFormData() {
    const formData = new FormData(document.getElementById('resumeForm'));

    // Helpers to get array data
    const getValues = (selector, mappers) => {
        return Array.from(document.querySelectorAll(selector))
            .map(div => {
                const obj = {};
                for (let key in mappers) {
                    const el = div.querySelector(mappers[key]);
                    obj[key] = el ? el.value : '';
                }
                return obj;
            })
            .filter(item => Object.values(item).some(v => v)); // Filter empty keys
    };

    const education = getValues('.education-entry', { degree: '.edu-degree', institution: '.edu-school', year: '.edu-year' });
    const experience = getValues('.experience-entry', { jobTitle: '.exp-title', company: '.exp-company', duration: '.exp-duration', responsibilities: '.exp-desc' });
    const projects = getValues('.project-entry', { name: '.proj-name', techStack: '.proj-stack', description: '.proj-desc' });
    const certifications = getValues('.cert-entry', { name: '.cert-name', issuer: '.cert-issuer', year: '.cert-year' });
    const languages = getValues('.lang-entry', { name: '.lang-name', level: '.lang-level' });

    return {
        fullName: formData.get('fullName') || 'Your Name',
        email: formData.get('email') || 'email@example.com',
        phone: formData.get('phone') || '(555) 555-5555',
        location: formData.get('location') || 'City, Country',
        linkedin: formData.get('linkedin'),
        github: formData.get('github'),
        summary: formData.get('summary'),
        skills: formData.get('skills'),
        education,
        experience,
        projects,
        certifications,
        languages
    };
}

// Data Gathering & Rendering
function updatePreview() {
    // Note: We don't want to wipe out manual edits on the Preview if possible.
    // However, syncing form -> preview allows users to use the easy inputs.
    // A simple heuristic: If the user is typing in the form, we render.
    // If they type in the preview, that state isn't saved back to form, so typing in form again will overwrite.
    // We'll trust the user to manage this workflow (first build with form, then polish in preview).

    const data = collectFormData();

    renderResume(data);
}

function renderResume(data) {
    const container = document.getElementById('resume-preview');

    // Helper to format text with "bold" and preserve newlines
    const formatText = (str) => {
        if (!str) return '';
        // 1. Basic sanitization for HTML tags only (so user can't inject scripts)
        let safe = str.replace(/[<>]/g, function (m) {
            return { '<': '&lt;', '>': '&gt;' }[m];
        });

        // 2. Replace "text" with <b>text</b>
        // We match a double quote, capture content until next double quote.
        return safe.replace(/"([^"]+)"/g, '<b>$1</b>');
    };

    // Formatting helpers
    const ensureUrl = (u) => u.match(/^https?:\/\//) ? u : 'https://' + u;

    const headerParts = [];
    if (data.email) headerParts.push(`<a href="mailto:${data.email}" class="resume-link">${data.email}</a>`);
    if (data.phone) headerParts.push(data.phone);
    if (data.location) headerParts.push(data.location);
    if (data.linkedin) headerParts.push(`<a href="${ensureUrl(data.linkedin)}" target="_blank" class="resume-link">LinkedIn</a>`);
    if (data.github) headerParts.push(`<a href="${ensureUrl(data.github)}" target="_blank" class="resume-link">GitHub</a>`);

    const combinedLine = headerParts.join(' | ');

    // Skills Processing: Support Newlines and Bold (**text**)
    let skillsHtml = '';
    if (data.skills) {
        // Split by newlines first to preserve user's layout
        const lines = data.skills.split('\n');
        skillsHtml = lines.map(line => {
            if (!line.trim()) return '';
            return `<div style="margin-bottom: 4px;">${formatText(line)}</div>`;
        }).join('');
    }

    let html = `
        <div id="resume-output">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: var(--resume-accent);">${data.fullName}</h1>
                <div class="contact-info">${combinedLine}</div>
            </div>
    `;

    if (data.summary) {
        // Allow formatting in summary too
        html += `
            <div class="section">
                <div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Professional Summary</div>
                <p>${formatText(data.summary).replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }

    if (skillsHtml) {
        html += `
            <div class="section">
                <div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Skills</div>
                <div class="skills-content">${skillsHtml}</div>
            </div>
        `;
    }

    if (data.experience.length > 0) {
        html += `<div class="section"><div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Experience</div>`;
        data.experience.forEach(exp => {
            // Split responsibilities by newline for bullet points
            const bullets = exp.responsibilities.split('\n').filter(line => line.trim().length > 0);

            html += `
                <div class="job-entry">
                    <div class="entry-header">
                        <span>${exp.company}</span>
                        <span>${exp.duration}</span>
                    </div>
                    <div class="sub-header">
                        <span>${exp.jobTitle}</span>
                    </div>
                    ${bullets.length ? `<ul>${bullets.map(b => `<li>${formatText(b)}</li>`).join('')}</ul>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }

    if (data.projects.length > 0) {
        html += `<div class="section"><div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Projects</div>`;
        data.projects.forEach(proj => {
            html += `
                <div class="project-entry-preview">
                    <div class="entry-header">
                        <span>${proj.name}</span>
                        <span style="font-weight:400; font-size:0.9em; font-style:italic;">${proj.techStack}</span>
                    </div>
                    <p>${formatText(proj.description)}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (data.education.length > 0) {
        html += `<div class="section"><div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Education</div>`;
        data.education.forEach(edu => {
            html += `
                <div class="job-entry">
                    <div class="entry-header">
                        <span>${edu.institution}</span>
                        <span>${edu.year}</span>
                    </div>
                    <div>${edu.degree}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (data.certifications.length > 0) {
        html += `<div class="section"><div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Certifications</div>`;
        data.certifications.forEach(cert => {
            html += `
                <div class="job-entry" style="margin-bottom: 6px;">
                    <div class="entry-header">
                        <span>${cert.name}</span>
                        <span>${cert.year}</span>
                    </div>
                    <div style="font-size: 0.9em; font-style: italic;">${cert.issuer}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (data.languages.length > 0) {
        html += `<div class="section"><div class="section-head" style="border-bottom-color: var(--resume-accent); color: var(--resume-accent);">Languages</div>`;
        const langs = data.languages.map(l => `${l.name} (${l.level})`).join(' • ');
        html += `<p>${langs}</p></div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function downloadPDF() {
    window.print();
}
