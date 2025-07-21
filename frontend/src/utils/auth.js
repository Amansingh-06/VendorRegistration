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

    const { data, error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
    });

  

    if (otpError) {
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
        return data?.session;
    } catch (error) {
        throw new Error("Invalid OTP, please enter the correct OTP");
    }
};

export const handleLogin = async (phone, navigate) => {

    await supabase.auth.updateUser({
        data: { isRegistered: true },
    });

    
    navigate("/home");
};

export const handleSignupFlow = async (
    data,
    buttonClicked,
    phone,
    navigate,
    setSession
    , setVendorData
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
        }, false, navigate,setSession,setVendorData);

        if (res) {
            // await supabase.auth.updateUser({
            //   data: { isRegistered: true },
            // });

            
            navigate("/vendor-registration");
        }
    }
};

export const handleSignup = async (data, flag = false, navigate, setSession, setVendorData) => {
    const v_id = uuidv4(); // Generate a unique vendor ID

    try {

        const {
            data: { session },
        } = await supabase.auth.getSession();


        // 👉 Set the session globally
        if (session) {
            setSession(session);
        }
        await supabase.auth.updateUser({
            data: {
                isRegistered: false
            }
        });
          

        const user_id = session?.user?.id;

        setVendorData({
            v_id,
            mobile_number: data.mobile_number,
            u_id: user_id,
        });

        // ⛔️ insertError ka code missing tha — yeh fix karo ya hatao
        // Agar insert nahi karna to yeh error check hata do
        // if (insertError) {
        //     return false;
        // }

        navigate("/vendor-registration");

        return true;
    } catch (error) {
        return false;
    }
};



export const logout = async (setSession, setLoggingOut) => {
    try {
        setLoggingOut(true);
        await supabase.auth.signOut();
        setSession(null);

        // ✅ Safe cleanup for admin login
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_vendor_id");

        // ✅ Optional: Clear other temporary analytics keys
        localStorage.removeItem("jam_ephemeral_events_host-network-events");
        localStorage.removeItem("jam_ephemeral_events_content-interactivity-events");

        // toast.success("Logged out");
    } catch (error) {
        toast.error("Error in logging out");
    } finally {
        setLoggingOut(false);
    }
};




export const handleAuthError = (error) => {
    toast.error(error.message);
};