import { App } from "./shopify-types";
import csv from "csvtojson";
import { resolve } from "path";

const DATA_DIR = resolve(__dirname, "../../_data");

const toApp = (line: any) => {
    return {
        url: line.url,
        title: line.title,
        tagline: line.tagline,
        developer: line.developer,
        developerLink: line.developer_link,
        icon: line.icon,
        rating: parseInt(line.rating),
        reviewsCount: parseInt(line.reviews_count),
        description: line.description,
        descriptionRaw: line.description_raw,
        pricingHint: line.pricing_hint
    } as App;
}

let apps: App[] = [];

export class ShopifyCsvLoader {
    static async load(): Promise<void> {
        await this.apps();
    }

    static async loadApps(filePath: string): Promise<App[]> {
        return csv().fromFile(filePath).then(items => items.map(toApp));
    }

    static async apps(): Promise<App[]> {
        if (apps.length > 0 ) {
            return apps;
        }
        return this.loadApps(DATA_DIR + "/apps.csv")
    }

};