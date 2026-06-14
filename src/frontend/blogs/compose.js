const { showToast } = require("../utils/misc.js")
const { default: notf_lang } = require("../locales.js");

// Initialize Quill Editor
const rawEditor = document.getElementById('editor')
if(!rawEditor) return;

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        syntax: true,
        toolbar: false
    },
    placeholder: notf_lang('compose', 'quill_placeholder'),
});

if(rawEditor.dataset.mode === 'edit') {
    const editingContent = rawEditor.dataset.editingContent;
    quill.setContents(editingContent ? JSON.parse(editingContent) : '');
}

// Update hidden input on editor change
quill.on('text-change', function() {
    document.getElementById('content').value = quill.root.innerHTML;
});

// quill.keyboard.addBinding({ key: 'Tab' }, function(range) {
//     console.log("?")
//   this.quill.format('indent', '+1'); // Indents on tab
// });

// Text Color Handler with Color Picker
const textColorBtn = document.getElementById('text-color-btn');
const textColorPicker = document.getElementById('text-color-picker');
const textColorInput = document.getElementById('text-color-input');
const recentTextColors = document.getElementById('recent-text-colors');

const STORAGE_KEY_TEXT_COLORS = 'recentTextColors';
const STORAGE_KEY_HIGHLIGHT_COLORS = 'recentHighlightColors';

// Load recent colors
function loadRecentColors() {
    const recentText = JSON.parse(localStorage.getItem(STORAGE_KEY_TEXT_COLORS) || '[]');
    const recentHighlight = JSON.parse(localStorage.getItem(STORAGE_KEY_HIGHLIGHT_COLORS) || '[]');
    displayRecentColors(recentText, recentTextColors, 'text');
    displayRecentColors(recentHighlight, document.getElementById('recent-highlight-colors'), 'highlight');
}

function displayRecentColors(colors, container, type) {
    container.innerHTML = '';
    colors.slice(-5).forEach(color => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'w-6 h-6 rounded hover:ring-2 ring-slate-400 transition border border-slate-300 cursor-pointer';
        button.style.backgroundColor = color;
        button.dataset.color = color;
        button.onclick = (e) => {
            e.preventDefault();
            if (type === 'text') {
                textColorInput.value = color;
                applyTextColor(color);
            } else {
                document.getElementById('text-highlight-input').value = color;
                applyHighlightColor(color);
            }
        };
        container.appendChild(button);
    });
}

function saveRecentColor(color, type) {
    const storageKey = type === 'text' ? STORAGE_KEY_TEXT_COLORS : STORAGE_KEY_HIGHLIGHT_COLORS;
    const recent = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!recent.includes(color)) {
        recent.push(color);
    }
    localStorage.setItem(storageKey, JSON.stringify(recent.slice(-10)));
    loadRecentColors();
}

function applyTextColor(color) {
    quill.format('color', color);
    saveRecentColor(color, 'text');
    quill.focus();
}

function applyHighlightColor(color) {
    quill.format('background', color);
    saveRecentColor(color, 'highlight');
    quill.focus();
}

textColorBtn.addEventListener('click', (e) => {
    e.preventDefault();
    textColorPicker.classList.toggle('hidden');
    document.getElementById('text-highlight-picker').classList.add('hidden');
});

document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        textColorInput.value = color;
        applyTextColor(color);
        textColorPicker.classList.add('hidden');
    });
});

textColorInput.addEventListener('change', (e) => {
    applyTextColor(e.target.value);
    textColorPicker.classList.add('hidden');
});

// Text Highlight Handler with Color Picker
const textHighlightBtn = document.getElementById('text-highlight-btn');
const textHighlightPicker = document.getElementById('text-highlight-picker');
const textHighlightInput = document.getElementById('text-highlight-input');

textHighlightBtn.addEventListener('click', (e) => {
    e.preventDefault();
    textHighlightPicker.classList.toggle('hidden');
    textColorPicker.classList.add('hidden');
});

document.querySelectorAll('.highlight-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        textHighlightInput.value = color;
        applyHighlightColor(color);
        textHighlightPicker.classList.add('hidden');
    });
});

textHighlightInput.addEventListener('change', (e) => {
    applyHighlightColor(e.target.value);
    textHighlightPicker.classList.add('hidden');
});

// Close pickers when clicking outside
document.addEventListener('click', (e) => {
    if (!textColorBtn.contains(e.target) && !textColorPicker.contains(e.target)) {
        textColorPicker.classList.add('hidden');
    }
    if (!textHighlightBtn.contains(e.target) && !textHighlightPicker.contains(e.target)) {
        textHighlightPicker.classList.add('hidden');
    }
});

// Load recent colors on page load
loadRecentColors();

// Clear Formatting Handler
const clearFormatBtn = document.getElementById('clear-format-btn');
clearFormatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const range = quill.getSelection();
    if (range && range.length > 0) {
        quill.removeFormat(range.index, range.length);
    }
    quill.focus();
});

// Text Alignment Handlers
document.querySelectorAll('.toolbar-btn[data-format="align"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const align = btn.dataset.value || false;
        quill.format('align', align);
        quill.focus();
    });
});

// Toolbar Button Handlers (Bold, Italic, etc.)
document.querySelectorAll('.toolbar-btn[data-format]:not([data-format="align"])').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = btn.dataset.format;
        const value = btn.dataset.value;
        
        if (format === 'blockquote') {
            quill.format('blockquote', true);
        } else {
            const currentValue = quill.getFormat()[format];
            quill.format(format, !currentValue);
        }
        
        quill.focus();
    });
});

// Toolbar Select Handler (Heading)
document.querySelectorAll('.toolbar-select[data-format="header"]').forEach(select => {
    select.addEventListener('change', (e) => {
        const format = select.dataset.format;
        const value = e.target.value;
        
        if (value === '') {
            quill.format('header', false);
        } else {
            quill.format(format, parseInt(value));
        }
        
        quill.focus();
    });
});

// List Buttons Handler
document.querySelectorAll('.toolbar-btn[data-format="list"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const value = btn.dataset.value;
        const currentValue = quill.getFormat().list;
        quill.format('list', currentValue === value ? false : value);
        quill.focus();
    });
});

// Code Language Selection Handler
document.querySelector('.toolbar-btn[data-format="code-block"]').addEventListener('change', (e) => {
    quill.format('code-block', true);
    quill.focus();
});

let currentSelection = null;

// Image Modal Tab Switching
const imageTabUrl = document.getElementById('image-tab-url');
const imageTabUpload = document.getElementById('image-tab-upload');
const imageUrlTab = document.getElementById('image-url-tab');
const imageUploadTab = document.getElementById('image-upload-tab');

imageTabUrl.addEventListener('click', (e) => {
    e.preventDefault();
    imageUrlTab.classList.remove('hidden');
    imageUploadTab.classList.add('hidden');
    imageTabUrl.classList.add('border-blue-500', 'text-blue-600');
    imageTabUrl.classList.remove('border-transparent', 'text-slate-600');
    imageTabUpload.classList.remove('border-blue-500', 'text-blue-600');
    imageTabUpload.classList.add('border-transparent', 'text-slate-600');
});

imageTabUpload.addEventListener('click', (e) => {
    e.preventDefault();
    imageUrlTab.classList.add('hidden');
    imageUploadTab.classList.remove('hidden');
    imageTabUpload.classList.add('border-blue-500', 'text-blue-600');
    imageTabUpload.classList.remove('border-transparent', 'text-slate-600');
    imageTabUrl.classList.remove('border-blue-500', 'text-blue-600');
    imageTabUrl.classList.add('border-transparent', 'text-slate-600');
});

// Image Modal
const imageModal = document.getElementById('image-modal');
const insertImageBtn = document.getElementById('insert-image-btn');
const imageUrlInput = document.getElementById('image-url');
const imageAltInput = document.getElementById('image-alt');
const imageFileInput = document.getElementById('image-file-input');
const imageAltUpload = document.getElementById('image-alt-upload');
const imageDropZone = document.getElementById('image-drop-zone');
const imageInsertBtn = document.getElementById('image-insert');
const imageCancelBtn = document.getElementById('image-cancel');

insertImageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentSelection = quill.getSelection();
    imageModal.classList.remove('hidden');
    imageUrlInput.focus();
});

// File upload handling
imageDropZone.addEventListener('click', () => {
    imageFileInput.click();
});

imageFileInput.addEventListener('change', (e) => {
    handleImageFile(e.target.files[0]);
});

imageDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageDropZone.classList.add('border-blue-500', 'bg-blue-50');
});

imageDropZone.addEventListener('dragleave', () => {
    imageDropZone.classList.remove('border-blue-500', 'bg-blue-50');
});

imageDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDropZone.classList.remove('border-blue-500', 'bg-blue-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
});

function handleImageFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const readerValue = e.target.result;

            const previewCard = document.createElement('div');
            previewCard.className = 'relative w-fit'

            // Create preview image
            const previewImage = document.createElement('img');
            previewImage.src = readerValue;
            previewImage.className = 'max-w-full h-24  rounded-lg cursor-pointer border border-gray-300 hover:opacity-90 transition-opacity';

            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'cursor-pointer bg-white/90 hover:bg-red-600 hover:text-white text-slate-500 rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-sm';
            deleteBtn.style = "position: absolute; top: 0.5rem; right: 0.5rem; z-index: 1;"
            deleteBtn.innerHTML = '<span class="mdi mdi-close"></span>'; // ×
            deleteBtn.addEventListener('click', (evt) => {
                evt.stopPropagation();
                // Remove image and button
                previewCard.remove();
                // Reset drop zone styles
                imageDropZone.classList.remove('border-blue-500', 'bg-blue-50');
            });

            // Append to drop zone (image first, then delete button above it)
            previewCard.appendChild(deleteBtn);
            previewCard.appendChild(previewImage);

            document.getElementById("previews").appendChild(previewCard);
        };
        reader.readAsDataURL(file);
    }
}

imageInsertBtn.addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    const alt = (document.getElementById('image-url-tab').classList.contains('hidden') ? 
                imageAltUpload.value : imageAltInput.value).trim();
    
    if (url) {
        let range = quill.getSelection();
        if(!range) range = currentSelection;
        quill.insertEmbed(range.index, 'image', url, { alt: alt || 'Image' });
        quill.setSelection(range.index + 1);
        
        const previews = document.getElementById("previews");
        previews.innerHTML = '';
        imageUrlInput.value = '';
        imageAltInput.value = '';
        imageAltUpload.value = '';
        imageFileInput.value = '';
        imageModal.classList.add('hidden');
        quill.focus();
    } else {
        const previews = document.getElementById("previews");
        const previewImages = previews.querySelectorAll('img');
        const alts = alt.split(',');
        let range = quill.getSelection();
        if(!range) range = currentSelection;
        previewImages.forEach((pimg, i) => {
            quill.insertEmbed(range.index, 'image', pimg.src, { alt: alts[i] || "image" });
            quill.setSelection(range.index + 1);
        })

        previews.innerHTML = '';
        imageUrlInput.value = '';
        imageAltInput.value = '';
        imageAltUpload.value = '';
        imageFileInput.value = '';
        imageModal.classList.add('hidden');
        quill.focus();
    }
});

imageCancelBtn.addEventListener('click', () => {
    imageModal.classList.add('hidden');
    imageUrlInput.value = '';
    imageAltInput.value = '';
    imageAltUpload.value = '';
    imageFileInput.value = '';
});

imageUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') imageInsertBtn.click();
});

// Link Modal
const linkModal = document.getElementById('link-modal');
const insertLinkBtn = document.getElementById('insert-link-btn');
const linkTextInput = document.getElementById('link-text');
const linkUrlInput = document.getElementById('link-url');
const linkInsertBtn = document.getElementById('link-insert');
const linkCancelBtn = document.getElementById('link-cancel');

insertLinkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const range = quill.getSelection();
    currentSelection = range;
    if (range && range.length > 0) {
        linkTextInput.value = quill.getText(range.index, range.length);
    }
    linkModal.classList.remove('hidden');
    linkTextInput.focus();
});

linkInsertBtn.addEventListener('click', () => {
    const text = linkTextInput.value.trim();
    const url = linkUrlInput.value.trim();
    
    if (text && url) {
        let range = quill.getSelection();
        if(!range) range = currentSelection;
        quill.deleteText(range.index, range.length);
        quill.insertText(range.index, text, { link: url });
        
        linkTextInput.value = '';
        linkUrlInput.value = '';
        linkModal.classList.add('hidden');
        quill.focus();
    }
});

linkCancelBtn.addEventListener('click', () => {
    linkModal.classList.add('hidden');
    linkTextInput.value = '';
    linkUrlInput.value = '';
});

linkUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') linkInsertBtn.click();
});

async function uploadImage(img, blogid) {
    try {
        const blobResponse = await fetch(img);
        const blob = await blobResponse.blob();
        // console.log(blob.type);
        const fd = new FormData();
        fd.append("blogid", blogid);
        fd.append("image", blob, "image.png");
        const urlResponse = await fetch("/api/blogs/upload/image", {
            method: "POST",
            body: fd
        })

        if(!urlResponse.ok) throw urlResponse;
        const url = await urlResponse.json();
        return url.url;
    } catch (error) {
        console.error(await error.json());
        throw new Error(error);
    }
}

// Form submission
document.getElementById('blog-composing-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    let delta = quill.getContents()
    let targetBlogId = rawEditor.dataset.mode === 'edit' ? window.location.pathname.split('/')[2] : null;

    if(rawEditor.dataset.mode !== 'edit') {
        const draftedResponse = await fetch("/api/compose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                blogTitle: document.getElementById('title').value, 
                blogDescription: document.getElementById('description').value, 
                visibility: parseInt(document.getElementById('visibility').value),
                allowComments: document.querySelector('input[name="allow-comments"]').checked,
                content: "Processing..."
            })
        });
        const fromDraftedResponse = await draftedResponse.json();
        if(!draftedResponse.ok) {
            showToast(error.error || notf_lang('compose', 'default_error'));
            return console.error(draftedResponse.error);
        }
        targetBlogId = fromDraftedResponse.blogid;
    }

    const updatedOps = await Promise.all(delta.ops.map(async (op) => {
        if(op.insert && op.insert.image && op.insert.image.startsWith('data:image')) {
            // console.log(op.insert.image);
            const publicUrl = await uploadImage(op.insert.image, targetBlogId);
            return {
                ...op,
                insert: {
                    ...op.insert,
                    image: publicUrl
                }
            }
        }
        return op
    }))

    delta = { ops: updatedOps };


    const updatedResponse = await fetch("/api/compose", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            blogid: targetBlogId,
            blogTitle: document.getElementById('title').value, 
            blogDescription: document.getElementById('description').value,
            visibility: parseInt(document.getElementById('visibility').value),
            allowComments: document.querySelector('input[name="allow-comments"]')?.checked,
            content: delta
        })
    });
    if (updatedResponse.ok) window.location.href = `/`
    else {
        const error = await updatedResponse.json();
        showToast(error.error || notf_lang('compose', 'default_error'));
        console.error(error);
    }
});