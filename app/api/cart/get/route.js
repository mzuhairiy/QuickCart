import { getAuth } from "@clerk/nextjs/server";
import User from "@/models/User";
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        await dbConnect()
        const user = await User.findById(userId)

        const { cartItems } = user;

        return NextResponse.json({ success: true, cartItems }, { status: 200 });
        
    } catch (error) {
        console.error("Error in cart GET API:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}