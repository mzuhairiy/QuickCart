import { getAuth } from "@clerk/nextjs/server";
import User from "@/models/User";
import dbConnect from "@/config/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { itemId, quantity } = await request.json();

        await dbConnect()
        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Update cartItems
        if (quantity === 0) {
            delete user.cartItems[itemId];
        } else {
            user.cartItems[itemId] = quantity;
        }

        await user.save()

        return NextResponse.json({ success: true, message: "Cart updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}