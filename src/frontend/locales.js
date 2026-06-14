const notfs = {
    en: {
        auth: {
            resetPasswordFormSubmission: {
                1: "Password must have 8+ characters, uppercase, lowercase, number, and symbol.",
                2: "Failed to reset password: ",
                3: "Successfully reset your password.",
                4: "Passwords do not match.",
                5: "An error occurred while resetting password. Please try again.",
            },
        },
        reg_form_validation: {
            rules: {
                1: "Username must be 3-30 alphanumeric characters. Spaces and underscores are allowed.",
                2: "Please enter a valid email address.",
                3: "Passwords do not match.",
                4: "You must agree to the Terms of Service.",
                5: "Bio must be not exceeds 1000 characters.",
            }
        },
        login: {
            emailLoginFormSubmission: {
                1: "Email and password are required",
                2: "Invalid email or password",
                3: "An error occurred while logging in. Please try again."
            },
            signInWGoogle: {
                1: "An error occurred while logging in. Please try again."
            }
        },
        register: {
            validateForm: {
                1: "Password must have 8+ characters, uppercase, lowercase, number, and symbol.",
            },
            signUpWGoogle: {
                1: "An error occurred while signing up. Please try again."
            }
        },
        password_reset_form: {
            passwordResetFormSubmission: {
                1: 'Please enter your email address.',
                2: 'Failed to send password reset link.',
                3: 'An error occurred while sending password reset link. Please try again.'
            }
        },
        "load_blog": {
            "menu": {
                "edit_post": "Edit Post",
                "delete_post": "Delete Post"
            },
            "placeholders": {
                "no_description": "This blog has no description. Click the title to see it."
            },
            "actions": {
                "save": "Save",
                "saved": "Saved"
            },
            "loading": {
                "blogs": "Loading blogs..."
            },
            "confirmations": {
                "delete_prompt": "Are you sure you want to delete this post? This action cannot be undone."
            },
            "toasts": {
                "save_error": "An error occurred while saving the post. Please try again.",
                "delete_success": "Post deleted successfully.",
                "delete_error": "Error deleting post: ",
                "load_error": "Failed to load blogs"
            }
        },
        misc: {
            getTimeAgo: {
                1: "second",
                2: "minute",
                3: "hour",
                4: "day",
                5: "month",
                6: "year",
                englishPlural: "s",
                punctuation: " ",
                ago: "ago"
            }
        },
        "home_feed": {
            "placeholders": {
                "untitled": "Untitled Blog",
                "no_desc_available": "No description available",
                "typing_search_posts": "Start typing to search posts on your feed...",
                "typing_search_people": "Start typing to search author of the post on your feed..."
            },
            "search_results": {
                "searching": "Searching...",
                "no_posts_found": "No posts found",
                "no_people_found": "No people found",
                "search_query_empty_html": "No posts found for your search <b>\"{{query}}\"</b>.",
                "search_error": "An error occurred while searching. Please try again."
            },
            "errors": {
                "logout_failed": "An error occurred while logging out. Please try again."
            }
        },
        "blog": {
            "placeholders": {
                "u": "U",
                "anonymous_user": "Anonymous User",
                "deleted_account": "[Deleted Account]",
                "unknown_user": "Unknown",
                "write_reply": "Write a reply..."
            },
            "buttons": {
                "edit_comment": "Edit Comment",
                "delete_comment": "Delete Comment",
                "cancel": "Cancel",
                "save": "Save",
                "reply": "Reply",
                "load_more_replies": "Load More Replies",
                "saved": "Saved"
            },
            "toasts": {
                "empty_comment_error": "Comment cannot be empty.",
                "edit_failed_error": "Failed to update comment.",
                "edit_error": "Error updating comment: ",
                "confirm_delete": "Are you sure you want to delete this comment? This action cannot be undone.",
                "delete_success": "Comment deleted successfully.",
                "delete_failed_error": "Failed to delete comment.",
                "delete_error": "Error deleting comment: ",
                "save_post_error": "An error occurred while saving the post. Please try again."
            }
        },
        "compose": {
            "quill_placeholder": "Write your blog here. Share your thoughts, ideas, and experiences...",
            "default_error": "An error occurred while publishing the blog. Please try again."
        },
        "preferences": {
            "success": 'Successfully saved your preference settings!',  
            "error": "Failed to save your preference settings."
        },
        "account": {
            "bio_max_chars": "Max 1000 characters. Characters Left:",
            "profileForm": {
                "saveSuccess": "Profile updated successfully!",
            },
            "passwordForm": {
                "passwordRequirements": "Password must have 8+ characters, uppercase, lowercase, number, and symbol",
                "saveSuccess": "Password updated successfully!"
            },
            "deleteModal": {
                "emptyPassword": "Please enter your password to confirm account deletion.",
                "fallbackError": "Failed to delete account.",
                "networkError": "An error occurred. Please try again."
            }
        },
        wip: {
            follow: "Follow is not implemented yet. Please keep up with the new updates in the future. Sorry for the inconvenience."
        }
    },
    th: {
        auth: {
            resetPasswordFormSubmission: {
                1: "รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์",
                2: "การรีเซ็ตรหัสผ่านล้มเหลว: ",
                3: "รีเซ็ตรหัสผ่านสําเร็จ",
                4: "รหัสผ่านไม่ตรงกัน",
                5: "เกิดข้อผิดพลาดบางอย่างขึ้นขณะรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง",
            },
        },
        reg_form_validation: {
            rules: {
                1: "ชื่อผู้ใช้ต้องมี 3-30 ตัวอักษรภาษาอังกฤษ อนุญาตให้มีขีดเส้นใต้กับเว้นวรรคในชื่อ",
                2: "กรุณากรอกที่อยู่อีเมลที่ถูกต้อง",
                3: "รหัสผ่านไม่ตรงกัน",
                4: "คุณต้องยอมรับข้อกําหนดในการใช้บริการ",
                5: "ข้อมูลประวัติส่วนตัวต้องไม่เกิน 1000 ตัวอักษร",
            }
        },
        login: {
            emailLoginFormSubmission: {
                1: "โปรดกรอกอีเมลและรหัสผ่าน",
                2: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                3: "เกิดข้อผิดพลาดบางอย่างขึ้นขณะลงชื่อเข้าใช้ กรุณาลองใหม่อีกครั้ง"
            },
            signInWGoogle: {
                1: "เกิดข้อผิดพลาดบางอย่างขึ้นขณะลงชื่อเข้าใช้ กรุณาลองใหม่อีกครั้ง"
            }
        },
        register: {
            validateForm: {
                1: "รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์"
            },
            signUpWGoogle: {
                1: "เกิดข้อผิดพลาดบางอย่างขึ้นขณะลงทะเบียน กรุณาลองใหม่อีกครั้ง"
            }
        },
        password_reset_form: {
            passwordResetFormSubmission: {
                1: 'กรุณากรอกอีเมลที่ถูกต้อง',
                2: 'ไม่สามารถส่งลิงค์รีเซ็ตรหัสผ่านได้',
                3: 'เกิดข้อผิดพลาดบางอย่างขึ้นขณะส่งลิงค์รีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง'
            }
        },
        "load_blog": {
            "menu": {
                "edit_post": "แก้ไขโพสต์",
                "delete_post": "ลบโพสต์"
            },
            "placeholders": {
                "no_description": "บล็อกนี้ไม่มีคำอธิบาย คลิกที่ชื่อเรื่องเพื่ออ่านรายละเอียดเพิ่มเติม"
            },
            "actions": {
                "save": "บันทึก",
                "saved": "บันทึกแล้ว"
            },
            "loading": {
                "blogs": "กำลังโหลดบล็อก..."
            },
            "confirmations": {
                "delete_prompt": "คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้? การดำเนินการนี้ไม่สามารถย้อนกลับคืนได้"
            },
            "toasts": {
                "save_error": "เกิดข้อผิดพลาดขณะบันทึกโพสต์ กรุณาลองใหม่อีกครั้ง",
                "delete_success": "ลบโพสต์เรียบร้อยแล้ว",
                "delete_error": "เกิดข้อผิดพลาดในการลบโพสต์: ",
                "load_error": "ไม่สามารถโหลดโพสต์บล็อกได้"
            }
        },
        misc: {
            getTimeAgo: {
                1: "วินาที",
                2: "นาที",
                3: "ชั่วโมง",
                4: "วัน",
                5: "เดือน",
                6: "ปี",
                englishPlural: "",
                punctuation: "",
                ago: "ที่แล้ว"
            }
        },
        "home": {
            "placeholders": {
                "untitled": "บล็อกไม่มีชื่อ",
                "no_desc_available": "ไม่มีคำอธิบาย",
                "typing_search_posts": "เริ่มพิมพ์เพื่อค้นหาโพสต์ในฟีดของคุณ...",
                "typing_search_people": "เริ่มพิมพ์เพื่อค้นหาผู้เขียนโพสต์ในฟีดของคุณ..."
            },
            "search_results": {
                "searching": "กำลังค้นหา...",
                "no_posts_found": "ไม่พบโพสต์ที่ค้นหา",
                "no_people_found": "ไม่พบบุคคลที่ค้นหา",
                "search_query_empty_html": "ไม่พบโพสต์สำหรับผลการค้นหาของคุณ <b>\"{{query}}\"</b>",
                "search_error": "เกิดข้อผิดพลาดขณะทำการค้นหา กรุณาลองใหม่อีกครั้ง"
            },
            "errors": {
                "logout_failed": "เกิดข้อผิดพลาดขณะลงชื่อออกากรระบบ กรุณาลองใหม่อีกครั้ง"
            }
        },
        "blog": {
            "placeholders": {
                "u": "U",
                "anonymous_user": "ผู้ใช้ที่ไม่ระบุตัวตน",
                "deleted_account": "[บัญชีที่ถูกลบ]",
                "unknown_user": "ไม่รู้จัก",
                "write_reply": "เขียนการตอบกลับ..."
            },
            "buttons": {
                "edit_comment": "แก้ไขความคิดเห็น",
                "delete_comment": "ลบความคิดเห็น",
                "cancel": "ยกเลิก",
                "save": "บันทึก",
                "reply": "ตอบกลับ",
                "load_more_replies": "โหลดการตอบกลับเพิ่มเติม",
                "saved": "บันทึกแล้ว"
            },
            "toasts": {
                "empty_comment_error": "ความคิดเห็นต้องไม่ว่างเปล่า",
                "edit_failed_error": "ไม่สามารถอัปเดตความคิดเห็นได้",
                "edit_error": "เกิดข้อผิดพลาดในการอัปเดตความคิดเห็น: ",
                "confirm_delete": "คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
                "delete_success": "ลบความคิดเห็นเรียบร้อยแล้ว",
                "delete_failed_error": "ไม่สามารถลบความคิดเห็นได้",
                "delete_error": "เกิดข้อผิดพลาดในการลบความคิดเห็น: ",
                "save_post_error": "เกิดข้อผิดพลาดขณะบันทึกโพสต์ กรุณาลองใหม่อีกครั้ง"
            }
        },
        "compose": {
            "quill_placeholder": "เขียนบล็อกของคุณที่นี่ แบ่งปันความคิด ไอเดีย ประสบการณ์ต่างๆของคุณ...",
            "default_error": "เกิดข้อผิดพลาดขณะเผยแพร่บล็อก กรุณาลองใหม่อีกครั้ง"
        },
        "preferences": {
            "success": "บันทึกการตั้งค่าใช้งานของคุณสำเร็จ",  
            "error": "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าใช้งานของคุณ"
        },
        "account": {
            "bio_max_chars": "สูงสุด 1000 ตัวอักษร เหลือ:",
            "profileForm": {
                "saveSuccess": "อัปเดตข้อมูลโปรไฟล์สำเร็จแล้ว!",
            },
            "passwordForm": {
                "saveSuccess": "เปลี่ยนรหัสผ่านสำเร็จแล้ว!",
                "passwordRequirements": "รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์"
            },
            "deleteModal": {
                "emptyPassword": "กรุณากรอกรหัสผ่านของคุณเพื่อยืนยันการลบบัญชีผู้ใช้",
                "fallbackError": "ไม่สามารถลบบัญชีผู้ใช้ได้",
                "networkError": "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
            }
        },
        wip: {
            follow: "ขณะนี้ยังไม่มีระบบการติดตาม โปรดติดตามการอัปเดตเพิ่มเติมในอนาคต ขออภัยในความไม่สะดวก"
        }
    }
}


export default function notf_lang(file, fn, id=undefined) {
    if(id) return notfs[document.documentElement.lang.slice(0, 2)][file][fn][id];
    else return notfs[document.documentElement.lang.slice(0, 2)][file][fn];
}
