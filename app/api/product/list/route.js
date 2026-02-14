import Product from "@/models/Product";
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";

export async function GET(request) {
  try 
    {
        await dbConnect()

        const products = await Product.find({})
        return NextResponse.json({ success: true, products }, { status: 200 });
        }
            catch(error){
            console.error("Error in product-list API:", error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}