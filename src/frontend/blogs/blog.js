import { showToast, isURL, getTimeAgo } from "../utils/misc.js";
import Prism from "prismjs";

require("prismjs/components/prism-java.js");
require("prismjs/components/prism-c.js");
require("prismjs/components/prism-cpp.js");
require("prismjs/components/prism-csharp.js");
require("prismjs/components/prism-clojure.js");
require("prismjs/components/prism-go.js");
require("prismjs/components/prism-javascript.js");
require("prismjs/components/prism-python.js");
require("prismjs/components/prism-ruby.js");
require("prismjs/components/prism-rust.js");
require("prismjs/components/prism-sql.js");


async function commentHTML(d, sub=false) {
    let profilePic1 = !d.comment_author ?
    `
    <div class="${sub ? "w-8 h-8" : "w-10 h-10"} shrink-0 aspect-square rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-300 font-bold">
        <i class="mdi mdi-account"></i>
    </div>
    ` :
    isURL(d.comment_author.avatar) ? `<img class="${sub ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-white " referrerpolicy="no-referrer" src="${d.comment_author.avatar}" alt="User Avatar">` : 
    `
    <div class="${sub ? "w-8 h-8" : "w-10 h-10"} shrink-0 aspect-square rounded-full bg-gradient-to-br ${d.comment_author.avatar} flex items-center justify-center text-white font-bold">
        ${d.comment_author.username.charAt(0).toUpperCase() || "U"}
    </div>
    `

    let postMenu = "";
    let owner = false
    
    const [ uidRes, usernameRes, avatarRes ] = await Promise.all([
        fetch("/api/users/fetch/current/uid"),
        fetch("/api/users/fetch/current/username"),
        fetch("/api/users/fetch/current/avatar")
    ])

    const [ uid, username, avatar ] = await Promise.all([
        uidRes.json(),
        usernameRes.json(),
        avatarRes.json()
    ])

    // console.log(uidRes, usernameRes, avatarRes, uid, username, avatar)

    if (!uidRes.ok && uidRes.status !== 401) throw new Error(`${uidRes.status} (${uidRes.statusText}): ${uid.error}`)
    if (!usernameRes.ok && uidRes.status !== 401) throw new Error(`${usernameRes.status} (${usernameRes.statusText}): ${username.error}`)
    if (!avatarRes.ok && uidRes.status !== 401) throw new Error(`${avatarRes.status} (${avatarRes.statusText}): ${avatar.error}`)
    
    let profilePic2 = "";
    const signedIn = uidRes.ok && usernameRes.ok && avatarRes.ok
    
    if (signedIn) {
        const currentUserUid = uid.user.uid
        const currentUserUsername = username.user.username
        const currentUserAvatar = avatar.user.avatar
    
        profilePic2 = isURL(currentUserAvatar) ? `<img class="w-8 h-8 rounded-full bg-white" referrerpolicy="no-referrer" src="${currentUserAvatar}" alt="User Avatar">` : 
        `
        <div class="w-8 h-8 shrink-0 aspect-square rounded-full bg-gradient-to-br ${currentUserAvatar} flex items-center justify-center text-white font-bold">
            ${currentUserUsername.charAt(0).toUpperCase() || "U"}
        </div>
        `
        if (currentUserUid !== d.comment_author.uid && (d.comment_author.user_preferences && !d.comment_author.user_preferences.visible_profile)) {
            profilePic1 = `
                <div class="${sub ? "w-8 h-8" : "w-10 h-10"} shrink-0 aspect-square rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-300 font-bold">
                    <i class="mdi mdi-account"></i>
                </div>
            `
        }
    } else if (d.comment_author.user_preferences && !d.comment_author.user_preferences.visible_profile) {
        profilePic1 = `
            <div class="${sub ? "w-8 h-8" : "w-10 h-10"} shrink-0 aspect-square rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-300 font-bold">
                <i class="mdi mdi-account"></i>
            </div>
        `
    }

    return { html: `
        <div class="comment-item flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-lg ${sub ? "" : "dark:border-slate-700 border border-slate-200 p-4 sm:p-5 hover:shadow-sm dark:hover:shadow-slate-900 transition-all duration-300"} " data-comment-id="${d.comment.cid}">
            <div class="flex gap-4">
                ${profilePic1}
                <div class="flex-1">
                    <div class="flex items-center justify-between gap-2 mb-1 relative">
                        <div class="flex items-center gap-2 min-w-0">
                            ${(() => {
                                if(uid.user?.uid === d.comment_author.uid) {
                                    return `<h4 class="font-semibold text-slate-900 dark:text-white truncate">
                                        ${d.comment_author.display_name}
                                    </h4>`
                                } else {
                                    return `<h4 class="font-semibold text-slate-900 dark:text-white truncate">
                                        ${d.comment_author && d.comment_author.user_preferences && d.comment_author.user_preferences.visible_profile ? d.comment_author.display_name : 
                                          d.comment_author && d.comment_author.user_preferences && !d.comment_author.user_preferences.visible_profile ? "Annonymous User" :
                                          !d.comment_author ? "[Deleted Account]" : "Unknown"
                                        }
                                    </h4>`
                                }
                            })()}
                            ${(() => {
                                if(uid.user?.uid === d.comment_author.uid || (d.comment_author && d.comment_author.user_preferences && d.comment_author.user_preferences.visible_profile)) {
                                    return `<span class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">@${d.comment_author.username}</span>`
                                } else return ""
                            })()}
                            <span class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">${getTimeAgo(d.comment.createdat)}</span>
                        </div>
                        ${(signedIn && d.comment_author ) && d.comment_author.uid === uid.user.uid ? `
                        <button class="comment-menu-btn text-slate-400 hover:text-slate-600 relative group flex-shrink-0">
                            <i class="mdi mdi-dots-vertical text-lg"></i>
                        </button>
                        <!-- Dropdown Menu -->
                        <div class="comment-menu hidden absolute right-6 top-0 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 w-48 z-[10] flex-col">
                            <button class="edit-comment-btn w-full text-left p-4 rounded-t-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center gap-2">
                                <i class="mdi mdi-pencil" style="margin-top: 0.125rem;"></i>
                                Edit Comment
                            </button>
                            <hr class="border-slate-200 dark:border-slate-600" />
                            <button class="delete-comment-btn w-full text-left p-4 rounded-b-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2">
                                <i class="mdi mdi-delete" style="margin-top: 0.125rem;"></i>
                                Delete Comment
                            </button>
                        </div>
                        ` : ""}
                    </div>
                    <p class="comment-text text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                        ${d.comment.comment}
                    </p>
                    ${(signedIn && d.comment_author) && d.comment_author.uid === uid.user.uid ? `
                    <!-- Edit Form (Hidden by default) -->
                    <div class="edit-form hidden flex flex-col gap-2 mb-3">
                        <textarea class="edit-textarea w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all duration-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm">${d.comment.comment}</textarea>
                        <div class="flex gap-2 justify-end">
                            <button class="cancel-edit px-4 py-2 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 text-sm">
                                Cancel
                            </button>
                            <button class="submit-edit px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg dark:hover:shadow-blue-900/50 transition-all duration-300 text-sm">
                                Save
                            </button>
                        </div>
                    </div>
                    ` : ""}
                    <div class="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <button class="min-h-auto flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 like-comment-btn" data-id="${d.comment.cid}">
                            <i class="mdi mdi-heart"></i>
                            <span>${d.comment.likedBy?.length || 0}</span>
                        </button>
                        <button class="min-h-auto flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 reply-btn" data-comment-id="${d.comment.commentid}">
                            <i class="mdi mdi-reply"></i>
                            Reply
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-4 sub-comments-list ${sub ? "ml-12" : "ml-14"} hidden">
                    
            </div>
            ${ signedIn ? `
                <!-- Reply Form (Hidden) -->
                <div class="reply-form hidden pt-4 border-t border-slate-100 dark:border-slate-700 ${sub ? "ml-12" : "ml-14"}">
                    <div class="flex gap-3">
                        ${profilePic2}
                        <div class="flex-1">
                            <textarea placeholder="Write a reply..." class="reply-textarea w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all duration-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none text-sm" rows="2"></textarea>
                            <div class="flex gap-2 mt-2 justify-end">
                                <button class="cancel-reply px-4 py-2 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 text-sm">
                                    Cancel
                                </button>
                                <button class="submit-reply px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-sm">
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : "" }
            ${ d.comment.hasReplies ? `
                <!-- Load More Replies -->
                <div class="load-replies ml-14 text-center">
                    <button class="min-h-auto load-replies-btn text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300 flex items-center justify-center gap-2">
                        <i class="mdi mdi-chevron-down"></i>Load More Replies
                    </button>
                </div>
            `: "" } 
        </div>
    `, signedIn, owner: (signedIn && d.comment_author) && d.comment_author.uid === uid.user.uid }
}

async function subCommentHTML(d) {
    return (await commentHTML(d, true))
}

async function like({ likeBtn, is }) {
    const countSpan = likeBtn.querySelector("span:last-child");
    const originalCount = countSpan.textContent;
    // statusText.textContent = "";
    likeBtn.setAttribute("disabled", "true");
    
    // Add animation
    likeBtn.style.transform = "scale(1.1)";
    
    try {
        const res = await fetch(`/api/${is}/${likeBtn.dataset.id}/like`, { 
            method: "POST",
            credentials: "include"
        });
        if(res.ok) {
            const json = await res.json();
            countSpan.textContent = json.likes;
            
            // Success animation
            likeBtn.style.animation = "heartBeat 0.6s ease-in-out";
            setTimeout(() => {
                likeBtn.style.animation = "";
            }, 600);
            
            // Animate count change
            const countElement = document.getElementById(`likes-count-${likeBtn.dataset.id}`);
            if (countElement) {
                countElement.textContent = json.likes;
                countElement.style.animation = "countPulse 0.3s ease-out";
                setTimeout(() => {
                    countElement.style.animation = "";
                }, 300);
            }
        } else {
            throw new Error(`Error (${res.status}): ${res.statusText}`);
        }
    } catch (err) {
        // statusText.textContent = err.message;
        showToast(err.message, "error")
        countSpan.textContent = originalCount;
    }
    
    likeBtn.removeAttribute("disabled");
    likeBtn.style.transform = "";
}

function setupCommentMenuListeners(commentItem) {
    const menuBtn = commentItem.querySelector('.comment-menu-btn');
    const menu = commentItem.querySelector('.comment-menu');
    if (!menuBtn || !menu) return;

    const commentId = commentItem.getAttribute('data-comment-id');
    const commentText = commentItem.querySelector('.comment-text');
    const editForm = commentItem.querySelector('.edit-form');
    const editTextarea = editForm?.querySelector('.edit-textarea');
    const submitBtn = editForm?.querySelector('.submit-edit');
    const cancelBtn = editForm?.querySelector('.cancel-edit');

    // Toggle menu visibility on click
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        for (const m of document.querySelectorAll('.comment-menu')) {
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
            for (const m of document.querySelectorAll('.comment-menu')) {
                m.classList.add('hidden');
                m.classList.remove('flex');
            }
        }
    });

    // Edit Comment Handler
    const editBtn = menu.querySelector('.edit-comment-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Show edit form, hide comment text
            commentText.classList.add('hidden');
            editForm.classList.remove('hidden');
            editTextarea.focus();
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        });
    }

    // Cancel Edit Handler
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Hide edit form, show comment text
            editForm.classList.add('hidden');
            commentText.classList.remove('hidden');
            // Reset textarea to original value
            editTextarea.value = commentText.textContent.trim();
        });
    }

    // Submit Edit Handler
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const newContent = editTextarea.value.trim();
            
            if (!newContent) {
                showToast('Comment cannot be empty.', 'error');
                return;
            }

            // Send update request to server
            fetch(`/api/comments/${commentId}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentContent: newContent })
            })
            .then(res => {
                if (res.ok) {
                    // Update comment text
                    commentText.textContent = newContent;
                    // Hide edit form, show comment text
                    editForm.classList.add('hidden');
                    commentText.classList.remove('hidden');
                    // showToast('Comment updated successfully.', 'success');
                } else {
                    return res.json().then(err => {
                        throw new Error(err.error || 'Failed to update comment.');
                    });
                }
            })
            .catch(err => showToast(`Error updating comment: ${err.message}`, 'error'));
        });
    }

    // Delete Comment Handler
    const deleteBtn = menu.querySelector('.delete-comment-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
                fetch(`/api/comments/${commentId}/delete`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(res => {
                    if (res.ok) {
                        // Fade out and remove the comment
                        commentItem.style.opacity = '0';
                        commentItem.style.transform = 'scale(0.95)';
                        commentItem.style.transition = 'all 0.3s ease-out';
                        setTimeout(() => {
                            commentItem.remove();
                            showToast('Comment deleted successfully.', 'success');
                        }, 300);
                    } else {
                        return res.json().then(err => {
                            throw new Error(err.error || 'Failed to delete comment.');
                        });
                    }
                })
                .catch(err => showToast(`Error deleting comment: ${err.message}`, 'error'));
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if(!window.location.pathname.startsWith("/blogs") || window.location.pathname === "/blogs/saves") return;

    const prismLink = document.getElementById("prism-code-block");
    if(document.documentElement.classList.contains("dark")) {
        prismLink?.setAttribute("href", "/dist/node_modules/prismjs/themes/prism-tomorrow.css");
    } else {
        prismLink?.setAttribute("href", "/dist/node_modules/prismjs/themes/prism.css");
    }
    
    const openbioBtn = document.getElementById("open-bio")
    const bioModal = document.getElementById("bio-modal");
    const closeBioBtn = document.getElementById("close-bio-modal");

    openbioBtn.addEventListener("mouseover", () => {
        openbioBtn.querySelector('i').classList.toggle("mdi-information");
        openbioBtn.querySelector('i').classList.toggle("mdi-information-outline");
    }) 
    openbioBtn.addEventListener("mouseout", () => {
        openbioBtn.querySelector('i').classList.toggle("mdi-information");
        openbioBtn.querySelector('i').classList.toggle("mdi-information-outline");
    }) 

    // Open bio modal
    openbioBtn.addEventListener("click", () => {
        bioModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });

    // Close bio modal
    const closeBioModal = () => {
        bioModal.classList.add("hidden");
        document.body.style.overflow = "auto";
    };

    closeBioBtn.addEventListener("click", closeBioModal);

    // Close modal when clicking outside (on the backdrop)
    bioModal.addEventListener("click", (e) => {
        if (e.target === bioModal) {
            closeBioModal();
        }
    });

    // Handle like buttons on grid items
    const gridLikeButtons = document.querySelectorAll(".like-btn")
    gridLikeButtons.forEach((likeBtn) => {
        // const statusText = likeBtn.nextElementSibling || likeBtn.parentElement.querySelector(".status");
        likeBtn.addEventListener("click", () => like({ likeBtn, is: "blogs" }));
    });

    const savePostBtn = document.querySelector(".save-post");
    savePostBtn?.addEventListener("click", async () => {
        savePostBtn.setAttribute('disabled', 'true');
        const blogId = savePostBtn.getAttribute('data-id');
        try {
            const response = await fetch(`/api/blogs/${blogId}/save`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) {
                const error = await response.json();
                showToast(error.error || 'An error occurred while saving the post. Please try again.');
                return;
            }

            savePostBtn.classList.toggle('text-blue-600');
            if(document.documentElement.classList.contains("dark")) savePostBtn.classList.toggle('dark:text-slate-400');
            else savePostBtn.classList.toggle('text-slate-600');
            savePostBtn.querySelector('span').textContent = savePostBtn.querySelector('span').textContent === "Save" ? "Saved" : "Save";
        
        } catch (error) {
            showToast('An error occurred while saving the post. Please try again.', 'error');
        }

        savePostBtn.removeAttribute('disabled');
        savePostBtn.style.transform = "";
    })

    document.querySelectorAll(".like-comment-btn").forEach((lcbtn) => lcbtn.addEventListener("click", () => like({ likeBtn: lcbtn, is: "comments" })));
    document.querySelectorAll('.comment-item').forEach(commentItem => setupCommentMenuListeners(commentItem));

    // Handle like buttons on list items
    // const listLikeButtons = document.querySelectorAll(".like-btn-list");
    // listLikeButtons.forEach((likeBtn) => {
    //     // const statusText = likeBtn.closest(".post-list-item").querySelector(".status");
    //     likeBtn.addEventListener("click", () => like({ likeBtn, isList: true }));
    // });

    const blogHeader = document.getElementById("blog-header");

    const currentPath = window.location.pathname;
    const decodedUrlBlogTitle = decodeURIComponent(currentPath.split("/")[2]);
    const urlFormattedTitle = blogHeader?.dataset.blogSlug;
    if (blogHeader && decodedUrlBlogTitle !== urlFormattedTitle) window.history.replaceState(null, "", `/blogs/${blogHeader?.dataset.blogId}/${urlFormattedTitle}`);

    const codeblocks = document.querySelectorAll('.ql-editor pre[data-language]');
    
    for (const codeblock of codeblocks) {
        const codeWrapper = document.createElement('code');
        const lang = codeblock.getAttribute('data-language');
        codeWrapper.classList.add(`language-${lang}`);
        codeWrapper.textContent = codeblock.textContent;
        codeblock.textContent = ''
        codeblock.appendChild(codeWrapper);
    }
    
    Prism?.highlightAll();
    

    if(document.querySelector(".ql-editor")) document.querySelector(".ql-editor").innerHTML = document.querySelector(".ql-editor").innerHTML.replace(`<!-- 
            
                <p class="text-slate-700 leading-relaxed text-base sm:text-lg mb-4">
                    
                </p>
            
         -->`, "").trim();

    function cancelComment() {
        document.getElementById("comment-content").value = "";
    }

    function registerEvents(commentItem, { signedIn, owner }) {
        if(signedIn) {
            if(!document.querySelector(".no-comment.not-allowed")) {
                commentItem.querySelector(".reply-btn")?.addEventListener("click", (e) => rbtnFunc(e.currentTarget));
                commentItem.querySelector(".cancel-reply")?.addEventListener("click", (e) => crFunc(e.currentTarget));
                commentItem.querySelector(".submit-reply")?.addEventListener("click", (e) => srFunc(e.currentTarget));
            }
            commentItem.querySelector(".like-comment-btn")?.addEventListener("click", (e) => like({ likeBtn: e.currentTarget, is: "comments" }))
            if(owner) setupCommentMenuListeners(commentItem)
        }
        commentItem.querySelector(".load-replies-btn")?.addEventListener("click", (e) => loadReplies(e.currentTarget.closest(".comment-item")));
    }

    function rbtnFunc(rbtn) {
        const replyBtn = rbtn
        const commentItem = replyBtn.closest(".comment-item");
        const replyForm = commentItem.querySelector(":scope > .reply-form");
        
        // Close other reply forms
        document.querySelectorAll(".reply-form:not(.hidden)").forEach(form => {
            if (form !== replyForm) form.classList.add("hidden");
        });
        
        // Toggle current reply form
        replyForm.classList.toggle("hidden");
        
        if (!replyForm.classList.contains("hidden")) {
            replyForm.querySelector(".reply-textarea").focus();
        }
    }

    function crFunc(cr) {
        const replyForm = cr.closest(".reply-form");
        replyForm.classList.add("hidden");
        replyForm.querySelector(".reply-textarea").value = "";
    }

    async function srFunc(sr) {
        const replyForm = sr.closest(".reply-form");
        const commentItem = replyForm.closest(".comment-item");
        const commentId = commentItem.dataset.commentId;
        const replyTextarea = replyForm.querySelector(".reply-textarea");
        const replyText = replyTextarea.value.trim();
        
        if (!replyText) return;
        // return console.log(commentItem.closest(".sub-comments-list"), commentItem, commentItem.querySelector(":scope > .sub-comments-list"))
        
        const blogId = window.location.pathname.split("/")[2];
        
        const postReplyResponse = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blogid: blogId, comment: replyText, replyTo: commentId })
        })
        
        if (postReplyResponse.ok) {
            const { comment, comment_author } = await postReplyResponse.json();
            const current_scl = commentItem.querySelector(":scope > .sub-comments-list")
            const oneReply = await subCommentHTML({ comment, comment_author }) 
            current_scl.insertAdjacentHTML("afterbegin", oneReply.html);
            registerEvents(current_scl.firstElementChild, oneReply)
            current_scl.classList.remove("hidden");

            replyTextarea.value = "";
            replyForm.classList.add("hidden");
        } else {
            return showToast((await postReplyResponse.json()).error);
        }
    }

    async function loadComments() {
        const commentsList = document.getElementById("comments-list");
        const currentCommentsNumber = commentsList.querySelectorAll(":scope > .comment-item").length;
        const commentsQueryResponse = await fetch("/api/comments/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: Math.floor(currentCommentsNumber / 2), blogid: window.location.pathname.split("/")[2] })
        });
        const commentsQueryData = await commentsQueryResponse.json();
        if(commentsQueryData.error) return showToast(commentsQueryData.error);
        else {
            if(commentsQueryData.caps.length < 3) commentsList.parentElement.removeChild(commentsList.parentElement.querySelector("#load-comments-btn").parentElement);
            await Promise.all(commentsQueryData.caps.map(async (cap) => {
                try {
                    const csred = await commentHTML({ comment: cap, comment_author: cap.profiles })
                    const domparse = new DOMParser()
                    const commentItem = domparse.parseFromString(csred.html, "text/html").querySelector(".comment-item")
                    registerEvents(commentItem, csred)
                    commentsList.insertAdjacentElement('beforeend', commentItem)
                } catch (err) {
                    showToast(err);
                    return;
                }
            }))
        }
    }

    async function loadReplies(oc) {
        const subCommentsList = oc.querySelector(":scope > .sub-comments-list");
        const currentRepliesNumber = subCommentsList.querySelectorAll(":scope > .comment-item").length;
        const repliesQueryResponse = await fetch("/api/comments/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                page: Math.floor(currentRepliesNumber / 2),
                blogid: window.location.pathname.split("/")[2],
                isReply: true,
                ownerComment: oc.dataset.commentId
            })
        });
        const repliesQueryData = await repliesQueryResponse.json();
        if(repliesQueryData.error) return showToast(repliesQueryData.error);
        else {
            if(repliesQueryData.caps.length < 3) oc.removeChild(oc.querySelector(":scope > .load-replies"));
            await Promise.all(repliesQueryData.caps.map(async (sub_cap) => {
                try {
                    const csred = await subCommentHTML({ comment: sub_cap, comment_author: sub_cap.profiles })
                    const domparse = new DOMParser()
                    const commentItem = domparse.parseFromString(csred.html, "text/html").querySelector(".comment-item")
                    registerEvents(commentItem, csred)
                    subCommentsList.insertAdjacentElement('beforeend', commentItem)
                } catch (err) {
                    showToast(err);
                    return;
                }
            }))
            subCommentsList.classList.remove("hidden");
        }
    }

    document.getElementById("cancel-comment")?.addEventListener("click", cancelComment)

    if(!document.querySelector(".no-comment.not-allowed")) {
        // Reply functionality
        document.querySelectorAll(".reply-btn").forEach((rbtn) => {
            rbtn.addEventListener("click", () => rbtnFunc(rbtn))
        })

        document.querySelectorAll(".cancel-reply").forEach((cr) => {
            cr.addEventListener("click", () => crFunc(cr))
        })

        document.querySelectorAll(".submit-reply").forEach((sr) => {
            sr.addEventListener("click", () => srFunc(sr))
        })
    }

    document.getElementById("post-comment")?.addEventListener("click", async () => {
        const comment_textarea = document.getElementById("comment-content");
        const comment = comment_textarea.value;
        if(!comment || !comment.trim()) return
        const blogId = window.location.pathname.split("/")[2];

        const postCommentResponse = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blogid: blogId, comment, replyTo: null })
        })

        if (postCommentResponse.ok) {
            const { comment, comment_author } = await postCommentResponse.json();
            const commentsList = document.getElementById("comments-list");
            const oneComment = await commentHTML({ comment, comment_author })
            if(commentsList.querySelector(".no-comment")) commentsList.innerHTML = '';
            commentsList.insertAdjacentHTML("afterbegin", oneComment.html);
            registerEvents(commentsList.firstElementChild, oneComment);

            comment_textarea.value = "";
        } else {
            showToast((await postCommentResponse.json()).error);
        }
    })

    document.getElementById("load-comments-btn")?.addEventListener("click", loadComments)
    document.querySelectorAll(".load-replies-btn").forEach((lrbtn) => lrbtn.addEventListener("click", (e) => loadReplies(e.target.closest(".comment-item"))));
})
