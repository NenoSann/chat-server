import mongoose from "mongoose";

const connectToMongo = async function (url: string) {
    await mongoose.connect(url);
    console.log(`connect to mongodb ${url}`);
}

export { connectToMongo }
