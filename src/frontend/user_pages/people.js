import { loadMoreBlogs, registerAutoLoad } from "../utils/load_blog.js";


document.addEventListener("DOMContentLoaded", () => {
    if(!window.location.pathname.startsWith("/people")) return;

    let username = window.location.pathname.split("/")[2];
    username.startsWith("@") && (username = username.slice(1));
    window.history.replaceState(null, "", `/people/@${username}`);

    const loadBlogButton = document.getElementById('load-blog');
    const holdUIDData = document.querySelector('[data-uid]');
    const uid = holdUIDData ? holdUIDData.dataset.uid : null;
    loadBlogButton?.addEventListener('click', (e) => loadMoreBlogs(loadBlogButton, `/api/blogs/fetch/from/${uid}`));
    if(loadBlogButton) registerAutoLoad(loadBlogButton)
});