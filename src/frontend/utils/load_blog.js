import { isURL, getTimeAgo, showToast } from "./misc.js";
import { addSearchData } from "../index/home.js";
import notf_lang from "../locales.js"

// Scope-narrowing translation helper function to lock context onto this file's namespace
const notfmsg = (fn, notfId) => notf_lang("load_blog", fn, notfId);

export async function postHTMLTemplate(data) {

    const profilePic = isURL(data.profile.avatar) ? `<img class="author-avatar w-16 h-16 text-xl sm:text-base sm:w-12 sm:h-12 rounded-full bg-white " referrerpolicy="no-referrer" src="${data.profile.avatar}" alt="User Avatar">` : 
    `
    <div class="author-avatar w-16 h-16 text-xl sm:text-base sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${data.profile.avatar} flex items-center justify-center text-white font-bold flex-shrink-0">
        ${data.profile.username.charAt(0).toUpperCase() || "U"}
    </div>
    `

    let postMenu = "";
    let owner = false

    let currentUserUidResponse;
    let currentUserSavedBlogs;
    let currentUserUid;
    try {
        currentUserUidResponse = await fetch("/api/users/fetch/current/uid")
        currentUserSavedBlogs = await fetch("/api/users/fetch/current/saved_blogs")
        if (!currentUserUidResponse.ok) throw new Error(`${currentUserUidResponse.status} (${currentUserUidResponse.statusText}): ${(await currentUserUidResponse.json()).error}`)
        if (!currentUserSavedBlogs.ok) throw new Error(`${currentUserSavedBlogs.status} (${currentUserSavedBlogs.statusText}): ${(await currentUserSavedBlogs.json()).error}`)
        currentUserUid = await currentUserUidResponse?.json()
        currentUserSavedBlogs = await currentUserSavedBlogs?.json()
        if(currentUserSavedBlogs.savedBlogIds?.includes(data.blog.blogid)) data.blog.isSaved = true;
    } catch (error) {
        // pass
    }
    if(currentUserUid && currentUserUid.user.uid === data.blog.authorid) {
        postMenu = `
            <button class="post-menu-btn text-slate-400 hover:text-slate-600 relative group">
                <i class="mdi mdi-dots-vertical text-xl"></i>
            </button>
            <div class="post-menu hidden absolute right-6 sm:right-8 top-20 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 w-48 z-[1] flex-col">
                <button class="edit-post-btn w-full text-left p-4 rounded-t-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center gap-2">
                    <i class="mdi mdi-pencil" style="margin-top: 0.125rem;"></i>
                    ${notfmsg("menu", "edit_post")}
                </button>
                <hr class="border-slate-200 dark:border-slate-600" />
                <button class="delete-post-btn w-full text-left p-4 rounded-b-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2">
                    <i class="mdi mdi-delete" style="margin-top: 0.125rem;"></i>
                    ${notfmsg("menu", "delete_post")}
                </button>
            </div>
        `;
        owner = true;
    }

    return { html: `
        <div class="p-6 sm:p-8">
            <div class="flex items-center gap-4 mb-4">
                ${profilePic}
                <div class="flex-1 flex flex-col gap-1 sm:gap-0 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:gap-2 sm:items-center">
                        <h3 class="author-name font-semibold text-slate-900 dark:text-white truncate">${data.profile.display_name}</h3>
                        <span class="author-username text-xs text-slate-500 dark:text-slate-400 truncate">@${data.profile.username}</span>
                    </div>
                    <p class="text-xs text-slate-400 dark:text-slate-500">${getTimeAgo(data.blog.postedon)}</p>
                </div>
                ${postMenu}
            </div>

            <h4 class="post-title text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                <a href="/blogs/${data.blog.blogid}/${data.blog.title.toLowerCase().replace(/s+/g, "-")}">${data.blog.title}</a>
            </h4>
            <p class="post-desc text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                ${data.blog.description ? data.blog.description.slice(0, 297) + (data.blog.content.length > 300 ? "..." : "") : notfmsg("placeholders", "no_description")}
            </p>

            <div class="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm">
                <button class="flex items-center gap-1 hover:text-blue-600 transition-colors duration-300">
                    <i class="mdi mdi-heart text-lg"></i>
                    <span>${data.blog.likes || 0}</span>
                </button>
                <button class="flex items-center gap-1 hover:text-blue-600 transition-colors duration-300">
                    <i class="mdi mdi-comment text-lg"></i>
                    <span>${data.cc}</span>
                </button>
                <button class="save-post flex items-center gap-1 ${data.blog.isSaved ? 'text-blue-600 dark:text-blue-400' : ''} hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                    <i class="mdi mdi-bookmark text-lg"></i>
                    <span>${data.blog.isSaved ? notfmsg("actions", "saved") : notfmsg("actions", "save")}</span>
                </button>
            </div>
        </div>
    `, owner }
}

export function addEditEventListeners(post, owner) {
    const menuBtn = post.querySelector('.post-menu-btn');
    const menu = post.querySelector('.post-menu');
    const savePostBtn = post.querySelector('.save-post');
    
    savePostBtn.addEventListener('click', async () => {
        savePostBtn.setAttribute('disabled', 'true');
        const blogId = post.getAttribute('data-blog-id');
        try {
            const response = await fetch(`/api/blogs/${blogId}/save`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) {
                const error = await response.json();
                showToast(error.error || notfmsg("toasts", "save_error"));
                return;
            }

            if(document.documentElement.classList.contains("dark")) {
                savePostBtn.classList.toggle('dark:text-blue-400');
                savePostBtn.classList.remove('text-blue-600');
            }
            else {
                savePostBtn.classList.toggle('text-blue-600');
                savePostBtn.classList.remove('dark:text-blue-400');
            }
            savePostBtn.querySelector('span').textContent = savePostBtn.querySelector('span').textContent === notfmsg("actions", "save") ? notfmsg("actions", "saved") : notfmsg("actions", "save");
        
        } catch (error) {
            showToast(notfmsg("toasts", "save_error"), 'error');
        }

        savePostBtn.removeAttribute('disabled');
        savePostBtn.style.transform = "";
    })

    if(!owner) return

    if(!menuBtn || !menu) return;
    const article = post;
    const blogId = article.getAttribute('data-blog-id');

    // Toggle menu visibility on click
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        for (const m of document.querySelectorAll('.post .post-menu')) {
            if (m === menu) {
                menu.classList.toggle('hidden');
                menu.classList.toggle('flex');
            } else {
                m.classList.add('hidden');
                m.classList.remove('flex');
            }
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuBtn.contains(e.target) && !menu.contains(e.target)) {
            for (const m of document.querySelectorAll('.post .post-menu')) {
                m.classList.add('hidden');
                m.classList.remove('flex');
            }
        }
    });

    // Edit Post Handler
    menu.querySelector('.edit-post-btn').addEventListener('click', function(e) {
        e.preventDefault();
        // Navigate to edit page or open edit modal
        window.location.href = `/blogs/${blogId}/edit`;
    });


    // TODO
    // - Edit post ✓
    // - (sidequest) handle error cases, error/not found landing page. ✓
    // - Delete post ✓
    // - Toggle visibility ✓

    // Delete Post Handler
    menu.querySelector('.delete-post-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm(notfmsg("confirmations", "delete_prompt"))) {
            fetch(`/api/blogs/${blogId}/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => {
                if (res.ok) {
                    // Fade out and remove the post card
                    article.style.opacity = '0';
                    article.style.transform = 'scale(0.95)';
                    article.style.transition = 'all 0.3s ease-out';
                    setTimeout(() => {
                        article.remove();
                        showToast(notfmsg("toasts", "delete_success"), 'success');
                    }, 300);
                }
            })
            .catch(err => showToast(`${notfmsg("toasts", "delete_error")}${err.message}`, 'error'));
        }
    });
}

let cooled_down = true

export async function loadMoreBlogs(btn, apiEndpoint) {
    cooled_down = false;
    const feedBlogsContainer = document.querySelector('#blogs-container');
    const currentBlogNumber = feedBlogsContainer?.querySelectorAll('article')?.length || 0;
    if (currentBlogNumber === 0 || Math.floor(currentBlogNumber / 2) === 0) return;
    const blogSearchQuery = new URLSearchParams(window.location.search)
    if (blogSearchQuery.get('search')) apiEndpoint = `/api/blogs/fetch?q=${blogSearchQuery.get('search')}`
    
    // Create and show loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'blogs-loading-spinner';
    loadingSpinner.className = 'flex justify-center items-center py-8';
    loadingSpinner.innerHTML = `
        <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="text-sm text-slate-600 dark:text-slate-400">${notfmsg("loading", "blogs")}</p>
        </div>
    `;
    feedBlogsContainer.insertAdjacentElement('beforeend', loadingSpinner);
    
    try {
        const blogsQueryResponse = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                page: Math.floor(currentBlogNumber / 2),
            })
        });
        const blogsQueryData = await blogsQueryResponse.json();
        
        // Remove loading spinner
        loadingSpinner.remove();
        
        if(blogsQueryData.error) {
            return showToast(blogsQueryData.error);
        }
        
        // If no blogs were returned, hide the button
        if(blogsQueryData.baps.length === 0) {
            btn.classList.add('hidden');
            return;
        }

        await Promise.all(blogsQueryData.baps.map(async (blog, i) => {
            // console.log(blog)
            try {
                // Process each blog post
                if(blog.blogs_with_likes_count) blog = blog.blogs_with_likes_count
                const post = document.createElement('article');
                post.className = "post relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-blue-900/50 transition-all duration-300 group";
                post.dataset.blogId = blog.blogid;
                post.dataset.blogSlug = blog.title.toLowerCase().replace(/\s+/g, "-");
                const csred = await postHTMLTemplate({ blog, profile: blog.profiles, cc: blogsQueryData.commentCounts[i] })
                post.innerHTML = csred.html
                feedBlogsContainer.insertAdjacentElement('beforeend', post)
                addEditEventListeners(post, csred.owner);
                addSearchData(post)
            } catch (err) {
                console.error(err);
                showToast(err);
                return;
            }
        }))

        setTimeout(() => cooled_down = true, 500);
    } catch (err) {
        // Remove loading spinner on error
        loadingSpinner.remove();
        showToast(err.message || notfmsg("toasts", "load_error"));
        console.error(err);
    }
}

// Intersection Observer to auto-load blogs when button scrolls into view
export function registerAutoLoad(btn){
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting && cooled_down) {
                btn.click();
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(btn);
}

document.addEventListener('DOMContentLoaded', () => {
    if(
        window.location.pathname === '/blogs/saves' ||
        window.location.pathname.startsWith('/people')
    ) {
        document.querySelectorAll('article.post').forEach(post => addEditEventListeners(post));

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024 && JSON.parse(document.querySelector('#sidebar-nav')?.dataset.show)) {
                document.querySelector('#sidebar-nav').classList.remove('hidden');
                document.querySelector('#sidebar-nav > nav').classList.add('flex');
            } else if (window.innerWidth > 1024) {
                document.querySelector('#sidebar-nav').classList.add('hidden');
                document.querySelector('#sidebar-nav > nav').classList.remove('flex');
            }
        })
        
        // Mobile menu toggle
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
            // This would trigger a mobile sidebar in a real implementation
            document.querySelector('#sidebar-nav').dataset.show = !JSON.parse(document.querySelector('#sidebar-nav').dataset.show);
            document.querySelector('#sidebar-nav').classList.toggle('hidden');
            document.querySelector('#sidebar-nav > nav').classList.toggle('flex');
        });
    }
})