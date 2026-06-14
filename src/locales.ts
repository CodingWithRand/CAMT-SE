import { Request } from "express";

const notfs: any = {
    en: {
        auth: {
            registerWithEmail: {
                1: "Username already taken",
                2: "Email already taken"
            },
            logout: {
                1: "Logged out successfully"
            },
            updatePassword: {
                1: "Your current password is incorrect.",
                2: "You must provide your current password to update your password.",
                3: "Password must have 8+ characters, uppercase, lowercase, number, and symbol."
            },
            sendResetPasswordEmail: {
                1: "User with this email is not found."
            },
            resetPassword: {
                1: "No access token provided.",
                2: "Invalid token to reset password of a user. Or the token has been expired.",
                3: "Password must have 8+ characters, uppercase, lowercase, number, and symbol.",
                4: "You must agree to the Terms of Service.",
                5: "Bio must be not exceeds 1000 characters."
            },
            verify: {
                1: "Missing token or type."
            },
            deleteAccount: {
                1: "Your password is incorrect."
            }
        },
        errorHandler: {
            errorMessage: {
                500: "Internal server error",
                409: "Resource already exists",
                400: "Invalid reference to related resource",
            },
            errorTip: {
                500: "If the problem persists, please contact support.",
                409: "This resource already exists. Try using a different value or updating the existing resource.",
                400: "Make sure the referenced resource exists before proceeding."
            }
        },
        "blog": {
            "viewBlog": {
                1: "This blog is private",
                4: "This blog is private by the author. You may contact them to request access."
            },
            "composeBlog": {
                1: "Blog ID is required for update",
                2: "Invalid request type"
            },
            "renderEditPage": {
                3: "You are not authorized to edit this blog.",
                4: "This blog belongs to someone else. If you believe this is a mistake, please contact support.", 
            },
            "deleteBlog": {
                "unauthorized_delete": "You are not authorized to delete this blog.",
                "delete_success": "Blog and all associated media have been deleted successfully."
            },
            "not_found": "The blog you're looking for doesn't exist or has been deleted.",
            "check_url": "Check the URL for typos or try navigating back to the homepage.",
            "validateBlogOwnership": {
                1: "You are not allowed to edit other user\'s blog"
            }
        },
        "storage": {
            "unauthorized_upload": "Unauthorized user trying to upload an image",
            "no_file": "No file provided or key mismatch",
            "missing_blog_id": "Blog ID is required",
            "no_session": "No active session"
        },
        user: {
            fetchCurrentUserProperty: {
                1: "Property name is required",
            },
            fetchUserProfile: {
                1: "User ID is required",
            },
            updateUserProfile: {
                1: "Number of characters for bio must not exceed 1000."
            },
            viewPublicProfile: {
                1: 'Username is required',
                2: 'The user you are looking for does not exist.',
                3: 'Please check for the typo of the username in the URL. The user may have their account private.'
            }
        },
        comment: {
            createComment: {
                1: "Blog ID and comment text are required"
            },
            fetchComments: {
                1: 'Blog ID is required'
            },
            editComment: {
                1: "Comment not found.",
                2: "You can't edit another person's comment."
            },
            deleteComment: {
                1: "Comment not found.",
                2: "You can't delete another person's comment."
            },
            "validateCommentOwnership": {
                1: "This comment doesn't belong to you."
            }
        }
    },
    th: {
        auth: {
            registerWithEmail: {
                1: "ชื่อผู้ใช้ถูกใช้แล้ว",
                2: "อีเมลถูกใช้แล้ว"
            },
            logout: {
                1: "ออกจากระบบเรียบร้อยแล้ว"
            },
            updatePassword: {
                1: "รหัสผ่านปัจจุบันของคุณไม่ถูกต้อง",
                2: "คุณต้องใส่รหัสผ่านปัจจุบันของคุณเพื่อแก้ไขรหัสผ่านของคุณ",
                3: "รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์"
            },
            sendResetPasswordEmail: {
                1: "ไม่พบผู้ใช้ที่มีอีเมลนี้"
            },
            resetPassword: {
                1: "ไม่พบรหัสการเข้าถึง",
                2: "รหัสการเข้าถึงไม่ถูกต้อง หรือหมดอายุแล้ว",
                3: "รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์",
                4: "คุณต้องยอมรับข้อกําหนดในการใช้บริการ",
                5: "ข้อมูลประวัติส่วนตัวต้องไม่เกิน 1000 ตัวอักษร"
            },
            verify: {
                1: "ไม่พบรหัสการเข้าถึงหรือประเภทของคำขอ"
            },
            deleteAccount: {
                1: "รหัสผ่านของคุณไม่ถูกต้อง"
            }
        },
        errorHandler: {
            errorMessage: {
                500: "เซิร์ฟเวอร์ทำงานผิดพลาด (Internal Server Error)",
                409: "ข้อมูลนี้มีในฐานข้อมูลแล้ว",
                400: "การอ้างอิงข้อมูลที่เกี่ยวข้องไม่ถูกต้อง",
            },
            errorTip: {
                500: "ถ้าปัญหายังไม่ได้รับการแก้ไข โปรดติดต่อฝ่ายสนับสนุน",
                409: "ข้อมูลนี้มีในฐานข้อมูลแล้ว กรุณาใช้ค่าที่อื่นหรืออัปเดตข้อมูลที่มีอยู่แล้ว",
                400: "โปรดแน่ใจว่าข้อมูลที่อ้างอิงมีอยู่แล้วก่อนที่จะดําเนินการต่อ"
            }
        },
        "blog": {
            "viewBlog": {
                1: "บล็อกนี้เป็นบล็อกส่วนตัว",
                4: "บล็อกนี้ถูกปรับให้เป็นส่วนตัวโดยผู้แต่ง คุณสามารถติดต่อผู้แต่งเพื่อขอการอนุญาตในการเข้าถึงบล็อกนี้"
            },
            "renderEditPage": {
                3: "คุณไม่มีสิทธิ์ในการแก้ไขบล็อกนี้",
                4: "บล็อกนี้เป็นของบุคคลอื่น หากคุณคิดว่านี่เป็นความผิดพลาด โปรดติดต่อฝ่ายสนับสนุน", 
            },
            "composeBlog": {
                1: "รหัสบล็อก (Blog ID) จําเป็นสําหรับการอัปเดต",
                2: "ประเภทของคำขอไม่ถูกต้อง"
            },
            "deleteBlog": {
                "unauthorized_delete": "คุณไม่มีสิทธิ์ในการลบบล็อกนี้",
                "delete_success": "ลบบล็อกและสื่อที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว"
            },
            "not_found": "บล็อกที่คุณกำลังมองหาไม่มีอยู่หรือถูกลบไปแล้ว",
            "check_url": "โปรดตรวจสอบการสะกดของที่อยู่ URL ว่าถูกต้องหรือไม่ หรือลองกดกลับไปยังหน้าหลัก",
            "validateBlogOwnership": {
                1: "คุณไม่มีสิทธิ์ในการแก้ไขบล็อกของผู้ใช้คนอื่นๆ"
            }
        },
        "storage": {
            "unauthorized_upload": "ผู้ใช้ที่ไม่ได้รับอนุญาตพยายามอัปโหลดรูปภาพ",
            "no_file": "ไม่มีไฟล์ที่ระบุหรือคีย์ไม่ตรงกัน",
            "missing_blog_id": "จำเป็นต้องระบุรหัสบล็อก (Blog ID)",
            "no_session": "ไม่มีเซสชันที่ใช้งานอยู่"
        },
        user: {
            fetchCurrentUserProperty: {
                1: "จำเป็นต้องระบุชื่อคุณสมบัติ (Property name)",
            },
            fetchUserProfile: {
                1: "จำเป็นต้องระบุรหัสผู้ใช้ (User ID)",
            },
            updateUserProfile: {
                1: "จำนวนตัวอักษรสำหรับประวัติส่วนตัว (Bio) ต้องไม่เกิน 1000 ตัวอักษร"
            },
            viewPublicProfile: {
                1: "จำเป็นต้องระบุชื่อผู้ใช้ (Username)",
                2: "ไม่พบผู้ใช้ที่คุณกำลังค้นหา",
                3: "กรุณาตรวจสอบตัวสะกดชื่อผู้ใช้ใน URL ผู้ใช้อาจจะตั้งค่าบัญชีเป็นส่วนตัว"
            }
        },
        comment: {
            createComment: {
                1: "จำเป็นต้องระบุรหัสบล็อก (Blog ID) และข้อความแสดงความคิดเห็น"
            },
            fetchComments: {
                1: "จำเป็นต้องระบุรหัสบล็อก (Blog ID)"
            },
            editComment: {
                1: "ไม่พบความคิดเห็นดังกล่าว",
                2: "คุณไม่สามารถแก้ไขความคิดเห็นของบุคคลอื่นได้"
            },
            deleteComment: {
                1: "ไม่พบความคิดเห็นดังกล่าว",
                2: "คุณไม่สามารถลบความคิดเห็นของบุคคลอื่นได้"
            },
            validateCommentOwnership: {
                1: "ความคิดเห็นนี้ไม่ใช่ของคุณ"
            }
        }
    }
}

// Page left: Compose, Account, Preferences


export default function notf_lang(req: Request, controller: string, fn: string, id?: number | string) {
    if (id) return notfs[req.language.slice(0, 2)][controller][fn][id];
    else return notfs[req.language.slice(0, 2)][controller][fn];
}
