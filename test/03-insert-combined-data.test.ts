import _ from "lodash";
import { Database } from "../src/database";
import { CsvLoader } from "../src/data/csv-loader";
import { selectCount, selectRatingsByUserID, selectMovieId } from "../src/queries/select";
import { MOVIE_RATINGS } from "../src/table-names";
import { Rating } from "../src/data/types";
import { minutes } from "./utils";

const insertRatings = (movieId: number, ratings: Rating[]) => {
  return (
    `insert into movie_ratings(user_id, movie_id, rating, time_created) values` +
    ratings.map(rating => `(
      '${escape(rating.userId.toString())}',
      '${escape(movieId.toString())}',
      '${escape(rating.rating.toString())}',
      '${rating.time_created}'
    )`).join(",")
  );
};

describe("Insert Combined Data", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("02", "03");
    await CsvLoader.load();
  }, minutes(3));

  it(
    "should insert movie ratings",
    async done => {
      const ratingsByImdbId = _.groupBy(await CsvLoader.ratings(), "imdbId");

      for (const imdbId of Object.keys(ratingsByImdbId)) {
        const movieId = (await db.selectSingleRow(selectMovieId(imdbId))).id;
        const chunks = _.chunk(ratingsByImdbId[imdbId], 500);
        for (const ch of chunks) {
          await db.insert(insertRatings(movieId, ch));
        }
      }

      const count = await db.selectSingleRow(selectCount(MOVIE_RATINGS));
      expect(count.c).toBe(1581014);

      const row = await db.selectSingleRow(selectRatingsByUserID(107897));

      expect(row.id).not.toBeNaN();
      expect(row.user_id).toBe(107897);
      expect(row.rating).toBe(2.1);
      expect(row.time_created).toBe("2002-07-19 09:17:07");

      done();
    },
    minutes(10)
  );
});
