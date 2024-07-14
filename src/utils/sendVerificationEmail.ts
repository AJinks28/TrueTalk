import { resend } from "@/lib/resend";
import VerificationEmail from "../../emailTemplates/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";


//SYNTAX: async function functionName(params:type): returnValue<type>
//here we are expecting Promis in return with type ApiResponse
export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'True Talk |Verification code',
            react: VerificationEmail({ username: username, otp: verifyCode }),
        });

        return { success: true, message: "sent verification email successfully" }
    } catch (emailError) {
        console.error("Error in sending Verification email", emailError)
        return { success: false, message: "Failed to send verification email" }
    }

}