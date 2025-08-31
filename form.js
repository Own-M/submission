// --- Form Submission Logic ---
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        const formType = form.querySelector('input[name="form_type"]').value;

        // --- IMPORTANT: UPDATE THIS SINGLE URL ---
        // Instructions.md file dekhe apnar toiri kora shudhu matro ek-ti URL ekhane boshan
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6a-GX405kIcgQrRpvmj22p9_qWuBeRAqChaB4v-clsB-3TWHmOF34sjtDUIg9z4Rx7A/exec";

        // Map form types to the exact sheet (tab) names you will create
        const SHEET_NAMES = {
            "Common Information": "Common Info Submissions",
            "Research Team Task": "Research Task Submissions",
            "Email Team Task": "Email Task Submissions",
            "Documentation Task": "Docs Task Submissions"
        };
        
        if (GOOGLE_SCRIPT_URL.includes("YOUR_")) {
            alert(`Please update the single GOOGLE_SCRIPT_URL in forms.js first.`);
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...`;

        const formData = new FormData(form);
        const data = {};
        
        if (formData.has('preference')) {
            data.preference = formData.getAll('preference').join(', ');
            formData.delete('preference');
        }

        for (let [key, value] of formData.entries()) { data[key] = value; }
        
        // Add the target sheet name to the data payload
        data.sheetName = SHEET_NAMES[formType];

        if (data.form_type === 'Common Information') {
            let schoolData = [], uniData = [];
            for (let i = 0; i < document.getElementById('school-container').children.length; i++) { schoolData.push(`Q: ${form.querySelector(`[name=school_qualification_${i}]`).value}, Inst: ${form.querySelector(`[name=school_institution_${i}]`).value}`); }
            for (let i = 0; i < document.getElementById('university-container').children.length; i++) { uniData.push(`Degree: ${form.querySelector(`[name=uni_degree_${i}]`).value}, Major: ${form.querySelector(`[name=uni_major_${i}]`).value}`); }
            data.school_education = schoolData.join(' | ');
            data.university_education = uniData.join(' | ');
        }

        fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(data)})
        .then(res => { if(!res.ok) throw new Error('Network response error.'); return res.json();})
        .then(response => {
            if (response.result === "success") {
                console.log('Success:', response);
                form.style.display = 'none';
                document.getElementById('submission-success').style.display = 'block';
            } else {
                throw new Error(response.message || "Unknown error from Apps Script");
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });
});

// --- DYNAMIC ROW FUNCTIONS for Common Info Form ---
function createSchoolRow(index) {
     return `<div class="dynamic-row grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-2 mb-2 border-b"><div class="md:col-span-1"><label class="block text-xs">Qualification</label><select name="school_qualification_${index}" class="mt-1 w-full p-2 border rounded-md"><option>SSC</option><option>HSC</option><option>O-Levels</option><option>A-Levels</option></select></div><div class="md:col-span-2"><label class="block text-xs">Institution</label><input type="text" name="school_institution_${index}" class="mt-1 w-full p-2 border rounded-md"></div><button type="button" class="remove-row-btn text-red-500 text-xs">Remove</button></div>`;
}
function createUniversityRow(index) {
    return `<div class="dynamic-row grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-2 mb-2 border-b"><div class="md:col-span-1"><label class="block text-xs">Degree</label><input type="text" name="uni_degree_${index}" class="mt-1 w-full p-2 border rounded-md"></div><div class="md:col-span-1"><label class="block text-xs">Major</label><input type="text" name="uni_major_${index}" class="mt-1 w-full p-2 border rounded-md"></div><div class="md:col-span-1"><label class="block text-xs">University</label><input type="text" name="uni_name_${index}" class="mt-1 w-full p-2 border rounded-md"></div><button type="button" class="remove-row-btn text-red-500 text-xs">Remove</button></div>`;
}

document.querySelectorAll('.add-row-btn').forEach(button => {
    button.addEventListener('click', function() {
        const containerId = this.dataset.container;
        const creatorFunction = window[this.dataset.creator];
        if (typeof creatorFunction === 'function') {
            const container = document.getElementById(containerId);
            const index = container.children.length;
            container.insertAdjacentHTML('beforeend', creatorFunction(index));
        }
    });
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('remove-row-btn')) {
        const row = e.target.closest('.dynamic-row');
        row.classList.add('removing');
        row.addEventListener('animationend', () => row.remove(), { once: true });
    }
});

