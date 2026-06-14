import { loadMoreBlogs, registerAutoLoad, addEditEventListeners } from "../utils/load_blog.js";

document.addEventListener('DOMContentLoaded', async () => {
    if(!window.location.pathname.startsWith("/blogs/saves")) return;

    document.querySelectorAll('.post').forEach(post => addEditEventListeners(post, true));

    const loadBlogButton = document.getElementById('load-blog');
    loadBlogButton?.addEventListener('click', (e) => loadMoreBlogs(loadBlogButton, "/api/blogs/fetch/from/my-saves"));
    if(loadBlogButton) registerAutoLoad(loadBlogButton)
})