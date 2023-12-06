import mongoose, { mongo } from "mongoose";

const connectToMongo = async function (url: string) {
    mongoose.connect(url).then(() => {
        console.log(`Successfully connected to ${url}`);
    }).catch((error) => {
        console.error('Cannot connect to mongodb');
        console.log(error);
    })
}

const disconnectMongodb = async function () {
    mongoose.disconnect().then(() => {
        console.log('disconnect mongodb gracefully')
    }).catch(() => {
        console.error('error when disconnect mongodb');
    })
}

export { connectToMongo, disconnectMongodb }
