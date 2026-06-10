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
        }
    }
}

// Page left: Compose, Blog, People, Account, Preferences


export default function notf_lang(req: Request, controller: string, fn: string, id: number) {
    return notfs[req.language.slice(0, 2)][controller][fn][id];
}
