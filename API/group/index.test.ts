import { createGroup } from ".";
import { connectToMongo, disconnectMongodb } from "../../mongodb";

beforeAll(async () => {
    await connectToMongo('mongodb://NenoSan:2440060505Jkl.@43.163.234.220:27017/');
})

test('testCreateGroup', async () => {
    await expect(createGroup('testGroup', '65669ef3011b490118e1db55')).resolves.toBe(true);
});

test('loopTest', async () => {

})

afterAll(async () => {
    await disconnectMongodb();
})