import { loadMoreBlogs, registerAutoLoad, addEditEventListeners } from "../utils/load_blog.js";
import { showToast } from "../utils/misc.js";
import notf_lang from "../locales.js"


document.addEventListener("DOMContentLoaded", () => {
    if(!window.location.pathname.startsWith("/people")) return;

    let username = window.location.pathname.split("/")[2];
    username.startsWith("@") && (username = username.slice(1));
    window.history.replaceState(null, "", `/people/@${username}`);

    document.querySelectorAll('.post').forEach(post => addEditEventListeners(post, true));

    const loadBlogButton = document.getElementById('load-blog');
    const holdUIDData = document.querySelector('[data-uid]');
    const uid = holdUIDData ? holdUIDData.dataset.uid : null;
    loadBlogButton?.addEventListener('click', (e) => loadMoreBlogs(loadBlogButton, `/api/blogs/fetch/from/${uid}`));
    if(loadBlogButton) registerAutoLoad(loadBlogButton)

    // Follow button functionality (to be implemented after MVP)
    document.querySelectorAll('.follow-btn')?.forEach(btn => {
        btn.addEventListener('click', function() {
            // TODO: Implement follow functionality
            showToast(notf_lang("wip", "follow"), "info");
        });
    });
});