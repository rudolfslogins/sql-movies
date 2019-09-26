import { resolve } from "path";
import { ShopifyCsvLoader } from "../../src/data/shopify-csv-loader";

describe("Shopify csv loader", () => {
    it("should load apps", async done => {
        const filePath = resolve(__dirname, "./apps.csv");
        const apps = await ShopifyCsvLoader.loadApps(filePath);
        expect(apps).toEqual([
            
        ]);


    })





})