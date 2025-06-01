import { toast } from "react-hot-toast";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/authContext";
import { v4 as uuidv4 } from "uuid";

export const validateName = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName.length) {
        toast.error("Please enter your name — it can't be empty or just spaces.");
        return null;
    }
    return trimmedName;
};

export const validateOtp = (otp) => {
    if (!otp || otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP!");
        return false;
    }
    return true;
};

export const sendOtp = async (fullPhone) => {
    console.log("Sending OTP to:", fullPhone);

    const { data, error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
    });

    console.log("OTP send response data:", data);
    console.log("OTP send response error:", otpError);

    if (otpError) {
        console.error("Error sending OTP:", otpError.message || otpError);
        toast.error("Failed to send OTP. Please try again.");
        throw new Error("Couldn't send OTP. Retry in a moment.");
    }

    return data;
};

export const verifyOtp = async (phone, otpValue) => {
    try {
        const { data, error: otpError } = await supabase.auth.verifyOtp({
            phone:phone,
            token: otpValue,
            type: "sms",
        });
        if (otpError) {
            throw new Error("Invalid OTP, please enter the correct OTP");
        }
        return data;
    } catch (error) {
        throw new Error("Invalid OTP, please enter the correct OTP");
    }
};

export const handleLogin = async (phone, navigate) => {

    await supabase.auth.updateUser({
        data: { isRegistered: true },
    });

    // console.log("User updated:", data);
    // console.log("isRegistered:", data?.user?.user_metadata?.isRegistered);
    navigate("/orders");
};

export const handleSignupFlow = async (
    data,
    buttonClicked,
    phone,
    navigate,
    setSession
) => {
    if (buttonClicked === "getReward") {
        navigate("/userdetails", {
            state: {
                phone,
                name: data.name,
            },
        });
    } else {
        const res = await handleSignup({
            ...data,
            mobile_number: phone,
        }, false, navigate,setSession);

        if (res) {
            await supabase.auth.updateUser({
              data: { isRegistered: true },
            });

            console.log("User updated:", data);
            console.log("isRegistered:", data?.user?.user_metadata?.isRegistered);
            navigate("/user-registration");
        }
    }
};

export const handleSignup = async (data, flag = false, navigate, setSession) => {
    try {
        console.log("data", data);

        const {
            data: { session },
        } = await supabase.auth.getSession();

        console.log("session", session);

        // 👉 Set the session globally
        if (session) {
            setSession(session);
        }

        const user_id = session?.user?.id;

        const { error: insertError } = await supabase.from("vendor_request").insert([
            {
                v_id:uuidv4(),

                mobile_number: data.mobile_number,
                u_id: user_id,
            },
        ]);

        if (insertError) {
            console.log("Error in inserting into table", insertError);
            return false;
        }

        // Update user metadata
        await supabase.auth.updateUser({
            data: { isRegistered: true },
        });

        // ✅ Navigate to registration page
        navigate("/user-registration");

        return true;
    } catch (error) {
        console.log("Error in handleSignup", error);
        return false;
    }
};


export const logout = async (setSession) => {
    try {
        await supabase.auth.updateUser({
            data: { isRegistered: false },
        });
        await supabase.auth.signOut();
        setSession(null);
        // toast.success("logged out");
    } catch (error) {
        toast.error("Error in logging out");
        console.log(error);
    }
};

export const handleAuthError = (error) => {
    console.error("Authentication Error:", error);
    toast.error(error.message);
};