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
    return new Promise<void>(async (resolve, reject) => {
        mongoose.disconnect().then(() => {
            resolve();
        }).catch(() => {
            reject();
        })
    })
}

export { connectToMongo, disconnectMongodb }
