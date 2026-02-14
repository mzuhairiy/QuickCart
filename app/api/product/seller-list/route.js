import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";

export async function GET(request) {
  try 
    {
        const { userId } = getAuth(request)
        const isSeller = await authSeller(userId)
        
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Unauthorized. Only sellers can view this page." }, { status: 403 });
        }

        await dbConnect()

        const products = await Product.find({ userId })
        return NextResponse.json({ success: true, products }, { status: 200 });
        }
            catch(error){
            console.error("Error in seller-list API:", error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}