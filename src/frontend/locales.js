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
        }
    }
}


export default function notf_lang(file, fn, id) {
    return notfs[document.documentElement.lang.slice(0, 2)][file][fn][id];
}
