import { 
    showToast, 
    getTimeAgo, 
    isURL,
    applyPreferences
} from "../utils/misc.js";
import {
    registerAutoLoad,
    loadMoreBlogs, 
    addEditEventListeners,
    postHTMLTemplate
} from "../utils/load_blog.js"

import notf_lang from "../locales.js"

// Scope-narrowing translation helper function to lock context onto this file's namespace
const notfmsg = (fn, notfId) => notf_lang("home", fn, notfId);

// Extract blog data from the page
const blogsData = [];
const authorsData = [];
export const addSearchData = (card) => {
    const titleEl = card.querySelector('h4.post-title');
    const descEl = card.querySelector('p.post-desc');
    const titleText = titleEl?.textContent?.trim() || notfmsg("placeholders", "untitled");
    const descText = descEl?.textContent?.trim() || '';

    const authorName = card.querySelector('h3.author-name').textContent;
    const authorUsername = card.querySelector('span.author-username').textContent;
    const authorAvatar = card.querySelector('.author-avatar');

    blogsData.push({
        blogId: card.dataset.blogId,
        title: titleText,
        description: descText,
        element: card,
    });

    authorsData.push({
        name: authorName,
        username: authorUsername,
        avatar: authorAvatar
    })
}

document.addEventListener("DOMContentLoaded", () => {
    if(window.location.pathname !== "/" || !document.getElementById("feed")) return;

    (async () => {
        if(!JSON.parse(localStorage.getItem('preferences_applied'))) {
            const prefResponse = await fetch("/api/users/fetch/current/preferences")
            if(prefResponse.ok) {
                const preferences = (await prefResponse.json()).preferences[0];
                localStorage.setItem('theme', preferences.theme ?? 'light')
                localStorage.setItem('font-family', preferences.font_family ?? 'sans');
                localStorage.setItem('font-size', preferences.font_size ?? '16');
                localStorage.setItem('lang', preferences.lang ?? 'th');
                localStorage.setItem('preferences_applied', 'true')
            }
            applyPreferences();
        }
    })()

    setTimeout(() => {
        const processedParams = new URLSearchParams(window.location.hash.replace("#", "?"))
        const accessToken = processedParams.get("access_token");
        if(accessToken) window.history.replaceState(null, "", "/")
    }, 100)

    const loadBlogButton = document.getElementById('load-blog');
    loadBlogButton?.addEventListener('click', (e) => loadMoreBlogs(loadBlogButton, "/api/blogs/fetch"));
    if(loadBlogButton) registerAutoLoad(loadBlogButton);

    // document.querySelectorAll('article.post').forEach(post => {
    //     post.addEventListener('click', () => {
    //         window.location.href = `/blogs/${post.dataset.blogId}/${post.dataset.blogSlug}`;
    //     });
    // });
    
    document.getElementById('signout')?.addEventListener('click', async () => {
        try {
            const response  = await fetch('/api/logout', { method: "POST", credentials: "include" })
            if (!response.ok) {
                const error = await response.json();
                showToast(error.error || notfmsg("errors", "logout_failed"));
                return;
            }
            localStorage.removeItem('theme');
            localStorage.removeItem('font-family');
            localStorage.removeItem('font-size');
            localStorage.removeItem('preferences_applied')
            window.location.href = '/login';
        } catch (error) {
            showToast(notfmsg("errors", "logout_failed"));
        }
    });
    
    // Post Card Menu Functionality
    document.querySelectorAll('.post').forEach(post => addEditEventListeners(post, true));
    
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

    document.querySelectorAll('#blogs-container > article.post').forEach(addSearchData);

    // Search functionality
    // TODO: 
    // - Dynamic search [DONE]
    // - Fetch API search [DONE]
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchBarContainer = document.getElementById('search-bar-container');
    const searchResults = document.getElementById('search-results');
    const searchPostsContainer = document.getElementById('search-posts');
    const searchPeopleContainer = document.getElementById('search-people');

    function renderSearchResults(query) {
        query = query.toLowerCase().trim();

        if (query.length === 0) {
            searchPostsContainer.innerHTML = `<p class="text-xs text-slate-500 py-2">${notfmsg("placeholders", "typing_search_posts")}</p>`;
            searchPeopleContainer.innerHTML = `<p class="text-xs text-slate-500 py-2">${notfmsg("placeholders", "typing_search_people")}</p>`;
            return;
        }

        // Filter blogs
        const matchingPosts = blogsData.filter(blog =>
            blog.title.toLowerCase().includes(query) ||
            blog.description.toLowerCase().includes(query)
        );

        // Filter people
        let matchingPeople = authorsData.filter(author =>
            author.name.toLowerCase().includes(query) ||
            author.username.toLowerCase().includes(query)
        );

        // Remove duplicates
        matchingPeople = matchingPeople.filter((person, index) => matchingPeople.findIndex(p => p.username === person.username) === index);

        // Render posts
        if (matchingPosts.length === 0) {
            searchPostsContainer.innerHTML = `<p class="text-xs text-slate-500 py-2">${notfmsg("search_results", "no_posts_found")}</p>`;
        } else {
            searchPostsContainer.innerHTML = matchingPosts.map(post => `
                <a href="/blogs/${post.blogId}" class="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                    <h4 class="font-semibold text-slate-900 dark:text-white text-sm">${post.title}</h4>
                    <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">${post.description || notfmsg("placeholders", "no_desc_available")}</p>
                </a>
            `).join('');
        }

        // Render people
        if (matchingPeople.length === 0) {
            searchPeopleContainer.innerHTML = `<p class="text-xs text-slate-500 py-2">${notfmsg("search_results", "no_people_found")}</p>`;
        } else {
            searchPeopleContainer.innerHTML = matchingPeople.map(person => {
                if(!person.avatar.src){
                    person.initial = person.name.charAt(0).toUpperCase();
                    const cl = person.avatar.classList.toString().split(" ")
                    person.color = [cl.find(c => c.startsWith("from-")), cl.find(c => c.startsWith("to-"))].join(" ");
                    return `
                        <a href="/people/${person.username}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0">${person.initial}</div>
                            <div>
                                <h4 class="font-semibold text-slate-900 dark:text-white text-sm">${person.name}</h4>
                                <p class="text-xs text-slate-600 dark:text-slate-400">${person.username}</p>
                            </div>
                        </a>
                    `
                } else {
                    return `
                        <a href="/people/${person.username}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                            <img class="w-8 h-8 text-xl sm:text-base rounded-full bg-white " referrerpolicy="no-referrer" src="${person.avatar.src}" alt="User Avatar">
                            <div>
                                <h4 class="font-semibold text-slate-900 dark:text-white text-sm">${person.name}</h4>
                                <p class="text-xs text-slate-600 dark:text-slate-400">${person.username}</p>
                            </div>
                        </a>
                    `
                }
            }).join('');
        }
    }

    const urlsq = new URLSearchParams(window.location.search).get('search') || '';
    
    if(urlsq) {
        searchInput.value = urlsq;
        if (document.getElementById('blogs-container').querySelector('.nopost')) {
            document.getElementById('blogs-container').querySelector('.nopost').innerHTML = notfmsg("search_results", "search_query_empty_html").replace("{{query}}", urlsq);
        }
    }

    searchForm?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchForm.requestSubmit();
        }
    })

    // Handle form submission (full-page search via API)
    searchForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchQuery = searchInput.value.trim();
        
        try {
            // Close dropdown and show loading state
            searchResults.classList.add('hidden');
            document.getElementById('blogs-container').innerHTML = `<div class="text-center py-8"><p class="dark:text-slate-400 text-slate-600">${notfmsg("search_results", "searching")}</p></div>`;
            
            // Make API request to fetch filtered blogs
            const response = await fetch(`/api/blogs/fetch?q=${encodeURIComponent(searchQuery)}`, { 
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page: 0 })
            });
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const data = await response.json();
            
            // Clear blogsData and authorsData for fresh data
            blogsData.length = 0;
            authorsData.length = 0;
            
            // Update the feed with search results
            if (data.baps && data.baps.length > 0) {
                document.getElementById('blogs-container').innerHTML = '';
                await Promise.all(data.baps.map(async (blog, index) => {
                    // Process each blog post
                    const post = document.createElement('article');
                    post.className = "post relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-blue-900/50 transition-all duration-300 group";
                    post.dataset.blogId = blog.blogid;
                    post.dataset.blogSlug = blog.title.toLowerCase().replace(/\s+/g, "-");
                    const csred = await postHTMLTemplate({ blog, profile: blog.profiles, cc: data.commentCounts[index] })
                    post.innerHTML = csred.html
                    document.getElementById('blogs-container').insertAdjacentElement('beforeend', post)
                    addEditEventListeners(post, csred.owner);
                    addSearchData(post)
                }))
            } else {
                document.getElementById('blogs-container').innerHTML = `<div class="text-center py-8"><p class="dark:text-slate-400 text-slate-600">${notfmsg("search_results", "search_query_empty_html").replace("{{query}}", searchQuery)}</p></div>`;
            }
            
            // Update URL with search parameter
            window.history.pushState({ search: searchQuery }, '', `?search=${encodeURIComponent(searchQuery)}`);
            
        } catch (error) {
            console.error('Search error:', error);
            document.getElementById('blogs-container').innerHTML = `<div class="text-center py-8"><p class="text-red-600">${notfmsg("search_results", "search_error")}</p></div>`;
        }
    });

    searchInput.addEventListener('focus', () => {
        searchBarContainer.style = "";
        searchResults.classList.remove('hidden');
    });
    
    searchInput.addEventListener('input', (e) => {
        searchBarContainer.style = "";
        searchResults.classList.remove('hidden');
        renderSearchResults(e.target.value);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchBarContainer.style = "mask-image: linear-gradient(to bottom, black 80%, transparent);";
            searchResults.classList.add('hidden');
        }, 200);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchForm.contains(e.target)) {
            searchBarContainer.style = "mask-image: linear-gradient(to bottom, black 80%, transparent);";
            searchResults.classList.add('hidden');
        }
    });

})